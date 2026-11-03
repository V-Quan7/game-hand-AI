import { Camera } from "./camera.js";
import {
  createGestureRecognizer,
  GestureStabilizer,
  palmCenter,
} from "./gestureRecognition.js";
import { AudioFeedback } from "./audio.js";
import { Effects } from "./effects.js";
import { GameEngine } from "./gameEngine.js";
import { HandController } from "./handController.js";
import { drawHandLandmarks, prepareCanvas } from "./handTracking.js";
import { GameUI } from "./ui.js";

const ui = new GameUI();
const stabilizer = new GestureStabilizer();
const handController = new HandController();
const audio = new AudioFeedback();
const effects = new Effects(document.querySelector("#effects-canvas"), ui.stage);
const gameEngine = new GameEngine(ui, Math.random, { audio, effects });
let recognizer = null;
let camera;
let animationFrameId = 0;
let isProcessing = false;
let isPaused = false;
let lastVideoTime = -1;
let lastFPSUpdate = performance.now();
let processedFrames = 0;
let lastInferenceAt = 0;
let inferenceInterval = 1000 / 30;
let slowInferenceFrames = 0;
let fastInferenceFrames = 0;
const MAX_INFERENCE_FPS = 30;
const ECO_INFERENCE_FPS = 20;
const ACTIVATION_HOLD_DURATION = 3000;
const ACTIVATION_FINISH_DELAY = 1250;
let activationHoldTime = 0;
let activationLastUpdate = 0;
let activationTimer = 0;
let isGameplayActive = false;
let isModeSelection = false;
let requiresActivationRelease = false;

camera = new Camera(ui.video, () => {
  stopProcessing();
  ui.setCameraActive(false);
  ui.setProcessing(false);
  ui.setGameplayActive(false);
  ui.hideModeSelection();
  ui.setAIStatus("Webcam đã ngắt kết nối", "error");
  ui.setMessage("Webcam đã bị ngắt. Hãy kiểm tra thiết bị và bật lại camera.", "error");
  resetRecognition();
});

async function ensureRecognizer() {
  if (recognizer) return;
  ui.setAIStatus("Đang tải mô hình AI...", "loading");
  const initialized = await createGestureRecognizer((message) => {
    ui.setAIStatus(message, "loading");
  });
  recognizer = initialized.recognizer;
  ui.setAIStatus(`Mô hình AI sẵn sàng · ${initialized.delegate}`, "ready");
}

async function startSession() {
  if (isProcessing) return;
  ui.setLoading(true);
  ui.setMessage("Đang khởi động AI và webcam...");
  if (audio.enabled) await tryUnlockAudio();

  try {
    await ensureRecognizer();
    if (!camera.isActive) await camera.start();
    ui.setCameraActive(true);
    ui.setProcessing(true);
    ui.setGameplayActive(false);
    ui.hideModeSelection();
    ui.setAIStatus("AI đang nhận diện", "running");
    ui.showActivation();
    ui.setMessage("Đưa con trỏ tay vào lõi năng lượng ở giữa màn hình.");
    isPaused = false;
    isProcessing = true;
    isGameplayActive = false;
    requiresActivationRelease = false;
    activationHoldTime = 0;
    activationLastUpdate = 0;
    lastVideoTime = -1;
    resetPerformanceBudget();
    stabilizer.reset();
    handController.reset();
    scheduleFrame();
  } catch (error) {
    cancelActivation();
    ui.setGameplayActive(false);
    ui.setAIStatus("Không thể khởi động", "error");
    ui.setMessage(error.message, "error");
    ui.setCameraActive(camera.isActive);
  } finally {
    ui.setLoading(false);
  }
}

function stopSession() {
  stopProcessing();
  camera.stop();
  ui.setCameraActive(false);
  ui.setProcessing(false);
  ui.setGameplayActive(false);
  ui.setAIStatus(
    recognizer ? "Mô hình AI đã sẵn sàng" : "Chưa khởi tạo",
    recognizer ? "ready" : "idle",
  );
  ui.setMessage("Webcam đã tắt. Nhấn START GAME để bắt đầu lại.");
  resetRecognition();
}

function togglePause() {
  if (!isProcessing || !isGameplayActive) return;
  isPaused = !isPaused;
  ui.setProcessing(true, isPaused);
  ui.setAIStatus(isPaused ? "AI đang tạm dừng" : "AI đang nhận diện", isPaused ? "ready" : "running");
  ui.setMessage(isPaused ? "AI đã tạm dừng; webcam vẫn đang bật." : "AI đã tiếp tục nhận diện.");
  if (isPaused) {
    ui.clearLandmarks();
    resetRecognition();
  } else {
    lastVideoTime = -1;
    lastInferenceAt = 0;
    scheduleFrame();
  }
}

function restartSession() {
  if (isProcessing && !isGameplayActive) return;
  gameEngine.reset();
  if (!isProcessing) {
    startSession();
    return;
  }
  isPaused = false;
  requiresActivationRelease = false;
  ui.setProcessing(true);
  ui.setAIStatus("AI đang nhận diện", "running");
  ui.setMessage("Đã đặt lại phiên nhận diện. Hãy đưa tay vào khung hình.");
  resetRecognition();
  lastVideoTime = -1;
  resetPerformanceBudget();
  scheduleFrame();
}

function scheduleFrame() {
  if (!isProcessing || isPaused || animationFrameId) return;
  animationFrameId = requestAnimationFrame(processFrame);
}

function processFrame() {
  animationFrameId = 0;
  if (!isProcessing || isPaused) return;

  const now = performance.now();
  if (
    ui.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    ui.video.currentTime !== lastVideoTime &&
    now - lastInferenceAt >= inferenceInterval
  ) {
    lastVideoTime = ui.video.currentTime;
    lastInferenceAt = now;
    prepareCanvas(ui.canvas, ui.video);

    try {
      const inferenceStartedAt = performance.now();
      const result = recognizer.recognizeForVideo(ui.video, performance.now());
      updatePerformanceMode(performance.now() - inferenceStartedAt);
      const landmarks = result.landmarks?.[0];
      if (landmarks) {
        updateHandResult(result, landmarks);
      } else {
        ui.clearLandmarks();
        handController.reset();
        ui.setCursor(null);
        const noHand = { ...stabilizer.noHand(), hasHand: false };
        ui.setGesture(noHand);
        ui.setPosition("—", "—");
        handleGameInput({
          cursor: null,
          gesture: "No Hand",
          isStable: true,
          hasHand: false,
        });
      }

      updateFPS();
    } catch (error) {
      stopProcessing();
      ui.setProcessing(false);
      ui.setGameplayActive(false);
      ui.clearLandmarks();
      resetRecognition();
      ui.setAIStatus("Lỗi xử lý AI", "error");
      ui.setMessage(`Không thể xử lý khung hình webcam: ${error.message}`, "error");
      console.error("MediaPipe frame processing failed:", error);
    }
  }
  scheduleFrame();
}

function updateHandResult(result, landmarks) {
  const category = result.gestures?.[0]?.[0];
  const score = category?.score ?? 0;
  const categoryName = category?.categoryName ?? "Unknown";
  const palm = palmCenter(landmarks);
  const stabilized = stabilizer.update(categoryName, score, landmarks);
  const point = handController.update(palm);
  if (!point) return;
  drawHandLandmarks(ui.context, ui.canvas, landmarks, point);
  const cursorPoint = ui.setCursor(point);

  const gesture = stabilized.isStable ? stabilized.gesture : "Uncertain";
  const isStableGesture = stabilized.isStable;
  ui.setGesture({
    gesture,
    confidence: score,
    isStable: stabilized.isStable,
    hasHand: true,
    categoryName,
    geometricOpenPalm: stabilized.geometricOpenPalm,
  });
  handleGameInput({
    cursor: cursorPoint,
    gesture,
    isStable: isStableGesture,
    hasHand: true,
  });

  const normalizedX = Math.round(cursorPoint.x * 100);
  const normalizedY = Math.round(cursorPoint.y * 100);
  ui.setPosition(normalizedX, normalizedY);
  ui.overlayDescription.textContent =
    `Tâm lòng bàn tay · X ${normalizedX}% / Y ${normalizedY}%`;
}

function handleGameInput(input) {
  if (!isGameplayActive) {
    if (isModeSelection) {
      updateModeSelection(input);
      return;
    }
    updateActivation(input);
    return;
  }

  if (requiresActivationRelease) {
    if (!input.hasHand || (input.isStable && input.gesture !== "Closed_Fist")) {
      requiresActivationRelease = false;
    } else {
      return;
    }
  }

  gameEngine.update(input);
}

function updateActivation({ cursor, gesture, isStable, hasHand }) {
  const cursorInside = ui.isActivationTarget(cursor);
  const isClosedFist = hasHand && isStable && gesture === "Closed_Fist";
  const activationInterrupted =
    !hasHand || !cursorInside || (isStable && gesture !== "Closed_Fist");

  if (activationInterrupted) {
    activationHoldTime = 0;
    if (activationTimer) {
      window.clearTimeout(activationTimer);
      activationTimer = 0;
    }
  } else if (isClosedFist && activationLastUpdate) {
    activationHoldTime += Math.min(performance.now() - activationLastUpdate, 100);
  }

  activationLastUpdate = performance.now();
  const progress = Math.min(activationHoldTime / ACTIVATION_HOLD_DURATION, 1);
  ui.setActivationProgress(progress, cursorInside, isClosedFist);

  if (progress === 1 && !activationTimer) {
    activationTimer = window.setTimeout(completeActivation, ACTIVATION_FINISH_DELAY);
  }
}

function completeActivation() {
  activationTimer = 0;
  if (!isProcessing || isPaused || isGameplayActive || activationHoldTime < ACTIVATION_HOLD_DURATION) return;
  isModeSelection = true;
  requiresActivationRelease = true;
  ui.hideActivation();
  ui.showModeSelection();
  ui.setMessage("Chọn chế độ chơi để bắt đầu nhiệm vụ.");
}

function updateModeSelection({ cursor, gesture, isStable, hasHand }) {
  const selectedIndex = hasHand && cursor ? ui.getModeAt(cursor) : -1;
  ui.setModeSelection(selectedIndex, !requiresActivationRelease);

  if (requiresActivationRelease) {
    if (!hasHand || (isStable && gesture !== "Closed_Fist")) {
      requiresActivationRelease = false;
      ui.setModeSelection(selectedIndex, true);
    }
    return;
  }

  if (selectedIndex >= 0 && isStable && gesture === "Closed_Fist") {
    selectGameMode(ui.modeButtons[selectedIndex].dataset.mode);
  }
}

function selectGameMode(mode) {
  if (!isProcessing || !isModeSelection) return;
  gameEngine.setMode(mode);
  isModeSelection = false;
  isGameplayActive = true;
  requiresActivationRelease = true;
  ui.hideModeSelection();
  ui.setGameplayActive(true);
  ui.setMessage(
    mode === "hard"
      ? "SIÊU KHÓ: Nắm tay trên kiếm cạnh robot để nhặt."
      : "Đưa tay đến gần pin, nắm để nhặt và xòe tay trong vùng robot để nạp.",
  );
}

function cancelActivation() {
  window.clearTimeout(activationTimer);
  activationTimer = 0;
  activationHoldTime = 0;
  activationLastUpdate = 0;
  ui.hideActivation();
}

function updateFPS() {
  processedFrames += 1;
  const now = performance.now();
  const elapsed = now - lastFPSUpdate;
  if (elapsed < 1000) return;

  ui.setFPS(Math.round((processedFrames * 1000) / elapsed));
  processedFrames = 0;
  lastFPSUpdate = now;
}

function updatePerformanceMode(inferenceDuration) {
  if (inferenceDuration > 45) {
    slowInferenceFrames += 1;
    fastInferenceFrames = 0;
  } else if (inferenceDuration < 28) {
    fastInferenceFrames += 1;
    slowInferenceFrames = 0;
  } else {
    slowInferenceFrames = 0;
    fastInferenceFrames = 0;
  }

  if (slowInferenceFrames >= 3 && inferenceInterval !== 1000 / ECO_INFERENCE_FPS) {
    inferenceInterval = 1000 / ECO_INFERENCE_FPS;
    slowInferenceFrames = 0;
    ui.setPerformanceMode(true);
  } else if (fastInferenceFrames >= 30 && inferenceInterval !== 1000 / MAX_INFERENCE_FPS) {
    inferenceInterval = 1000 / MAX_INFERENCE_FPS;
    fastInferenceFrames = 0;
    ui.setPerformanceMode(false);
  }
}

function resetPerformanceBudget() {
  lastInferenceAt = 0;
  inferenceInterval = 1000 / MAX_INFERENCE_FPS;
  slowInferenceFrames = 0;
  fastInferenceFrames = 0;
  ui.setPerformanceMode(false);
}

function resetRecognition() {
  stabilizer.reset();
  handController.reset();
  ui.setCursor(null);
  processedFrames = 0;
  ui.setFPS(0);
  ui.setGesture({ gesture: "No Hand", confidence: 0, isStable: true, hasHand: false });
  ui.setPosition("—", "—");
  ui.overlayDescription.textContent = "Bật webcam để bắt đầu phiên nhận diện";
  ui.clearLandmarks();
}

function stopProcessing() {
  isProcessing = false;
  isPaused = false;
  isGameplayActive = false;
  isModeSelection = false;
  requiresActivationRelease = false;
  cancelActivation();
  ui.hideModeSelection();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = 0;
}

ui.startButton.addEventListener("click", startSession);
ui.cameraButton.addEventListener("click", () => {
  if (camera.isActive) {
    stopSession();
  } else {
    startSession();
  }
});
ui.pauseButton.addEventListener("click", togglePause);
ui.restartButton.addEventListener("click", restartSession);
ui.easyPlayAgainButton.addEventListener("click", restartSession);
ui.modeButtons.forEach((button) => {
  button.addEventListener("click", () => selectGameMode(button.dataset.mode));
});
ui.soundButton.addEventListener("click", toggleSound);
ui.fullscreenButton.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", () => {
  ui.setFullscreen(document.fullscreenElement === ui.cameraPanel);
});

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement === ui.cameraPanel) {
      await document.exitFullscreen();
      return;
    }
    if (document.fullscreenElement) await document.exitFullscreen();
    await ui.cameraPanel.requestFullscreen();
  } catch (error) {
    ui.setMessage(`Không thể đổi chế độ toàn màn hình: ${error.message}`, "error");
  }
}

async function tryUnlockAudio() {
  try {
    await audio.unlock();
    ui.setSoundEnabled(audio.enabled);
    return true;
  } catch (error) {
    audio.setEnabled(false);
    ui.setSoundEnabled(false, error.message);
    console.warn("Game audio unavailable:", error);
    return false;
  }
}

async function toggleSound() {
  if (!audio.enabled) {
    if (await tryUnlockAudio()) {
      audio.setEnabled(true);
      ui.setSoundEnabled(true);
    }
    return;
  }

  audio.setEnabled(false);
  ui.setSoundEnabled(false);
}
