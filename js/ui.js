import { MIN_CONFIDENCE } from "./gestureRecognition.js";

const GESTURE_PRESENTATION = {
  Open_Palm: { label: "Xòe tay", icon: "✋" },
  Closed_Fist: { label: "Nắm tay", icon: "✊" },
  Pointing_Up: { label: "Chỉ ngón trỏ", icon: "☝️" },
  "No Hand": { label: "Không có tay", icon: "—" },
  Uncertain: { label: "Đang xác nhận...", icon: "⌖" },
  Other: { label: "Cử chỉ khác", icon: "✋" },
  Unknown: { label: "Chưa nhận diện", icon: "—" },
};

function blendColor(from, to, amount) {
  const start = Number.parseInt(from.slice(1), 16);
  const end = Number.parseInt(to.slice(1), 16);
  const channel = (shift) => Math.round(
    ((start >> shift) & 0xff) + (((end >> shift) & 0xff) - ((start >> shift) & 0xff)) * amount,
  );
  return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, "0")).join("")}`;
}

export class GameUI {
  constructor() {
    this.video = document.querySelector("#video");
    this.canvas = document.querySelector("#landmark-canvas");
    this.virtualCursor = document.querySelector("#virtual-cursor");
    this.batteryToken = document.querySelector("#battery-token");
    this.batteryLabel = document.querySelector("#battery-label");
    this.robotCharacter = document.querySelector("#robot-character");
    this.receiver = document.querySelector("#robot-receiver");
    this.robotStageStatus = document.querySelector("#robot-stage-status");
    this.robotStateChip = document.querySelector("#robot-state-chip");
    this.robotStateText = document.querySelector("#robot-state-text");
    this.robotEnergyValue = document.querySelector("#robot-energy-value");
    this.robotEnergyLabel = document.querySelector("#robot-energy-label");
    this.robotEnergyTrack = document.querySelector("#robot-energy-track");
    this.robotEnergyBar = document.querySelector("#robot-energy-bar");
    this.robotHint = document.querySelector("#robot-hint");
    this.scoreValue = document.querySelector("#score-value");
    this.batteryCountValue = document.querySelector("#battery-count-value");
    this.batteryCountLabel = document.querySelector("#battery-count-label");
    this.missionProgressLabel = document.querySelector("#mission-progress-label");
    this.missionProgressTrack = document.querySelector("#mission-progress-track");
    this.missionProgressBar = document.querySelector("#mission-progress-bar");
    this.soundButton = document.querySelector("#sound-button");
    this.gameMessage = document.querySelector("#game-message");
    this.gameMessageIcon = document.querySelector("#game-message-icon");
    this.gameMessageText = document.querySelector("#game-message-text");
    this.context = this.canvas.getContext("2d");
    this.stage = document.querySelector("#camera-stage");
    this.cameraPanel = document.querySelector(".camera-panel");
    this.cameraBadge = document.querySelector("#camera-badge");
    this.cameraBadgeText = document.querySelector("#camera-badge-text");
    this.fullscreenButton = document.querySelector("#fullscreen-button");
    this.overlayTitle = document.querySelector("#overlay-title");
    this.overlayDescription = document.querySelector("#overlay-description");
    this.trackingLabel = document.querySelector("#tracking-label");
    this.statusMessage = document.querySelector("#status-message");
    this.aiStatusText = document.querySelector("#ai-status-text");
    this.aiStatusRow = document.querySelector(".ai-status-row");
    this.aiOrb = document.querySelector("#ai-orb");
    this.gestureName = document.querySelector("#gesture-name");
    this.gestureIcon = document.querySelector("#gesture-icon");
    this.confidenceValue = document.querySelector("#confidence-value");
    this.confidenceBar = document.querySelector("#confidence-bar");
    this.confidenceTrack = document.querySelector("#confidence-track");
    this.confirmHint = document.querySelector("#confirm-hint");
    this.fpsValue = document.querySelector("#fps-value");
    this.performanceMode = document.querySelector("#performance-mode");
    this.handsValue = document.querySelector("#hands-value");
    this.positionValue = document.querySelector("#position-value");
    this.positionLabel = document.querySelector("#position-label");
    this.startButton = document.querySelector("#start-button");
    this.cameraButton = document.querySelector("#camera-button");
    this.pauseButton = document.querySelector("#pause-button");
    this.restartButton = document.querySelector("#restart-button");
    this.activationOverlay = document.querySelector("#activation-overlay");
    this.activationOrb = document.querySelector("#activation-orb");
    this.activationTitle = document.querySelector("#activation-title");
    this.activationHint = document.querySelector("#activation-hint");
    this.activationProgress = document.querySelector(".activation-progress");
    this.activationProgressBar = document.querySelector("#activation-progress-bar");
    this.modeSelectOverlay = document.querySelector("#mode-select-overlay");
    this.modeButtons = [...document.querySelectorAll(".mode-option")];
    this.modeSelectHint = this.modeSelectOverlay.querySelector(".mode-select-card > p");
    this.modeSettingsToggle = document.querySelector("#mode-settings-toggle");
    this.modeSettingsPanel = document.querySelector("#mode-settings-panel");
    this.modeSettingInputs = [...document.querySelectorAll(".mode-setting-toggle")];
    this.gameModeLabel = document.querySelector("#game-mode-label");
    this.hardBatteryTokens = [...document.querySelectorAll(".hard-battery-token")];
    this.energySword = document.querySelector("#energy-sword");
    this.easyMission = document.querySelector("#easy-mission");
    this.easyQuestionProgress = document.querySelector("#easy-question-progress");
    this.easySituationIllustration = document.querySelector("#easy-situation-illustration");
    this.easySituationTitle = document.querySelector("#easy-situation-title");
    this.easySituationDescription = document.querySelector("#easy-situation-description");
    this.easyQuestionPrompt = document.querySelector("#easy-question-prompt");
    this.easyBlocksLayer = document.querySelector("#easy-blocks-layer");
    this.easyCompleteOverlay = document.querySelector("#easy-complete-overlay");
    this.easyFinalScore = document.querySelector("#easy-final-score");
    this.easyPlayAgainButton = document.querySelector("#easy-play-again");
    this.beginMission = document.querySelector("#begin-mission");
    this.beginQuestionProgress = document.querySelector("#begin-question-progress");
    this.beginSituationIllustration = document.querySelector("#begin-situation-illustration");
    this.beginSituationTitle = document.querySelector("#begin-situation-title");
    this.beginSituationDescription = document.querySelector("#begin-situation-description");
    this.beginQuestionPrompt = document.querySelector("#begin-question-prompt");
    this.beginHowToPlay = document.querySelector("#begin-how-to-play");
    this.beginObjectsLayer = document.querySelector("#begin-objects-layer");
    this.beginCompleteOverlay = document.querySelector("#begin-complete-overlay");
    this.beginFinalScore = document.querySelector("#begin-final-score");
    this.beginPlayAgainButton = document.querySelector("#begin-play-again");
    this.beginReplayInstruction = document.querySelector("#begin-replay-instruction");
    this.greenPanel = document.querySelector("#green-game-panel");
    this.greenInstructionOverlay = document.querySelector("#green-instruction-overlay");
    this.greenInstructionImage = document.querySelector("#green-instruction-image");
    this.greenInstructionCountdown = document.querySelector("#green-instruction-countdown");
    this.greenRoundLabel = document.querySelector("#green-round-label");
    this.greenTimer = document.querySelector("#green-timer");
    this.greenLegend = document.querySelector("#green-legend");
    this.greenInstruction = document.querySelector("#green-instruction");
    this.greenTargetsLayer = document.querySelector("#green-targets-layer");
    this.greenScorePopup = document.querySelector("#green-score-popup");
    this.greenBins = [...document.querySelectorAll(".green-bin")];
    this.greenBinPicker = document.querySelector("#green-bin-picker");
    this.greenReviewIntro = document.querySelector("#green-review-intro");
    this.greenCompleteOverlay = document.querySelector("#green-complete-overlay");
    this.greenPlayAgainButton = document.querySelector("#green-play-again");
    this.greenFinalScore = document.querySelector("#green-final-score");
    this.greenFinalCorrect = document.querySelector("#green-final-correct");
    this.guideEyebrow = document.querySelector(".guide-panel .eyebrow");
    this.guideHeading = document.querySelector(".guide-panel h2");
    this.guideItems = [...document.querySelectorAll(".guide-panel .guide-item")];
    this.guideFootnote = document.querySelector(".guide-footnote");
    this.defaultGuide = {
      eyebrow: this.guideEyebrow.textContent,
      heading: this.guideHeading.textContent,
      items: this.guideItems.map((item) => ({
        icon: item.querySelector(".guide-emoji").textContent,
        title: item.querySelector("strong").textContent,
        description: item.querySelector("small").textContent,
      })),
      footnote: this.guideFootnote.textContent,
    };
    this.batteryState = "";
    this.robotChargeTimer = 0;
    this.easyFeedbackTimer = 0;
    this.greenCursorFeedbackTimer = 0;
    this.greenScorePopupTimer = 0;
    this.quizOverlay = document.querySelector("#quiz-overlay");
    this.quizQuestion = document.querySelector("#quiz-question");
    this.quizAnswers = document.querySelector("#quiz-answers");
    this.quizInstruction = document.querySelector("#quiz-instruction");
    this.quizEyebrow = this.quizOverlay.querySelector(".eyebrow");
  }

  setAIStatus(message, state = "idle") {
    this.aiStatusText.textContent = message;
    this.aiStatusRow.dataset.state = state;
    this.aiOrb.dataset.state = state;
  }

  setCameraActive(active) {
    this.stage.dataset.active = String(active);
    this.cameraBadge.dataset.state = active ? "on" : "off";
    this.cameraBadgeText.textContent = active ? "CAMERA ĐANG BẬT" : "CAMERA TẮT";
    this.cameraButton.innerHTML = active
      ? '<span aria-hidden="true">◉</span> TẮT WEBCAM'
      : '<span aria-hidden="true">◉</span> BẬT WEBCAM';
    this.overlayTitle.textContent = active ? "Đang khởi tạo khung hình" : "Sẵn sàng quét bàn tay";
    this.overlayDescription.textContent = active
      ? "AI đang chuẩn bị nhận diện..."
      : "Bật webcam để bắt đầu phiên nhận diện";
  }

  setFullscreen(active) {
    this.stage.dataset.fullscreen = String(active);
    this.fullscreenButton.setAttribute("aria-label", active ? "Thoát toàn màn hình" : "Toàn màn hình");
    this.fullscreenButton.title = active ? "Thoát toàn màn hình (Esc)" : "Toàn màn hình";
  }

  setProcessing(active, paused = false) {
    this.pauseButton.innerHTML = paused
      ? '<span aria-hidden="true">▶</span> TIẾP TỤC AI'
      : '<span aria-hidden="true">Ⅱ</span> TẠM DỪNG AI';
    this.trackingLabel.hidden = !active || paused;
  }

  setGameplayActive(active) {
    this.pauseButton.disabled = !active;
    this.restartButton.disabled = !active;
  }

  showActivation() {
    this.activationOverlay.hidden = false;
    this.stage.dataset.activation = "true";
    this.setActivationProgress(0, false, false);
  }

  hideActivation() {
    this.activationOverlay.hidden = true;
    delete this.stage.dataset.activation;
  }

  showModeSelection() {
    this.modeSelectOverlay.hidden = false;
    this.stage.dataset.modeSelection = "true";
    this.setModeSelection(-1, false);
  }

  hideModeSelection() {
    this.modeSelectOverlay.hidden = true;
    delete this.stage.dataset.modeSelection;
    this.setModeSelection(-1, false);
  }

  getModeAt(point) {
    if (!point) return -1;
    const stage = this.stage.getBoundingClientRect();
    const x = stage.left + point.x * stage.width;
    const y = stage.top + point.y * stage.height;
    return this.modeButtons.findIndex((button) => {
      if (button.hidden) return false;
      const bounds = button.getBoundingClientRect();
      return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
    });
  }

  setEnabledModes(enabledModes) {
    this.modeButtons.forEach((button) => {
      button.hidden = !enabledModes.has(button.dataset.mode);
      if (button.hidden) button.classList.remove("is-pointed");
    });
    this.modeSettingInputs.forEach((input) => {
      input.checked = enabledModes.has(input.dataset.mode);
      input.disabled = enabledModes.size === 1 && input.checked;
    });
  }

  setModeSettingsOpen(open) {
    this.modeSettingsPanel.hidden = !open;
    this.modeSettingsToggle.setAttribute("aria-expanded", String(open));
  }

  setModeSelection(index, canConfirm) {
    this.modeButtons.forEach((button, buttonIndex) => {
      button.classList.toggle("is-pointed", buttonIndex === index);
    });
    if (index < 0) {
      this.modeSelectHint.textContent = "Đưa tay vào chế độ muốn chơi, rồi nắm tay để xác nhận.";
      return;
    }
    this.modeSelectHint.textContent = canConfirm
      ? "Đang chọn chế độ này — nắm tay để bắt đầu."
      : "Thả nắm tay để sẵn sàng chọn chế độ.";
  }

  setGameMode(mode) {
    const isHard = mode === "hard";
    const isBegin = mode === "begin";
    const isGreen = mode === "green";
    if (isBegin) this.#setBeginGuide(true);
    else if (isGreen) this.#setGreenGuide();
    else this.#setBeginGuide(false);
    this.hideBeginChallenge();
    if (isBegin) this.hideEasyChallenge();
    this.stage.dataset.mode = mode;
    this.cameraPanel.dataset.mode = mode;
    this.gameModeLabel.textContent = isHard ? "SIÊU KHÓ" : isBegin ? "KHÁM PHÁ" : isGreen ? "GREEN GUARDIAN" : "THỬ THÁCH";
    this.robotEnergyLabel.textContent = isHard ? "NẠP KIẾM" : "TIẾN TRÌNH";
    this.batteryCountLabel.textContent = isHard ? "PIN CHẠM KIẾM" : "CÂU ĐÃ XONG";
    this.batteryToken.hidden = true;
    this.hardBatteryTokens.forEach((token) => {
      token.hidden = true;
    });
    this.energySword.hidden = true;
    this.batteryCountValue.innerHTML = isHard
      ? '0 <small>CHẠM KIẾM</small>'
      : '0 <small>HOÀN THÀNH</small>';
    this.robotEnergyValue.textContent = "0%";
    this.robotEnergyBar.style.width = "0%";
    this.robotEnergyTrack.setAttribute("aria-valuenow", "0");
    this.robotEnergyTrack.setAttribute(
      "aria-label",
      isHard ? "Tiến trình nạp kiếm" : "Năng lượng robot",
    );
    this.robotEnergyTrack.hidden = isGreen;
    if (isBegin) {
      this.batteryCountValue.innerHTML = '0 <small>/ 5 NHIỆM VỤ</small>';
      this.robotEnergyLabel.textContent = "NHIỆM VỤ";
      this.robotEnergyValue.textContent = "0/5";
      this.robotEnergyTrack.setAttribute("aria-label", "Tiến trình nhiệm vụ BEGIN");
      this.robotHint.textContent = "Giúp robot xử lý các tình huống quen thuộc.";
    } else if (!isHard) {
      this.robotHint.textContent = isGreen
        ? "Đưa tâm bàn tay đến mục tiêu, nắm tay để chọn và phân loại."
        : "Chọn đúng khối lệnh để khắc phục tình huống.";
    }
    if (isGreen) {
      this.batteryCountLabel.textContent = "MỤC TIÊU ĐÚNG";
      this.batteryCountValue.innerHTML = '0 <small>ĐÚNG</small>';
      this.robotEnergyLabel.textContent = "THỜI GIAN";
      this.robotEnergyValue.textContent = "60s";
      this.robotHint.textContent = "Đưa tâm bàn tay lên chấm rác, nắm tay để chọn.";
    }
    this.hideGreenChallenge();
  }

  #setGreenGuide() {
    this.guideEyebrow.textContent = "GREEN GUARDIAN";
    this.guideHeading.textContent = "Cách chơi phân loại rác";
    const instructions = [
      ["✋", "Di chuyển bàn tay", "Đưa tâm lòng bàn tay đến chấm rác"],
      ["✊", "Nắm tay để chọn", "Màn 2 giữ nắm tay để kéo rác đến thùng"],
      ["✋", "Kéo và thả rác", "Ở màn 2, giữ nắm tay kéo rác vào thùng rồi xòe tay"],
      ["🧠", "Học qua câu hỏi", "Câu hỏi chỉ xuất hiện sau mỗi lượt 60 giây"],
    ];
    this.guideItems.forEach((item, index) => {
      item.querySelector(".guide-emoji").textContent = instructions[index][0];
      item.querySelector("strong").textContent = instructions[index][1];
      item.querySelector("small").textContent = instructions[index][2];
    });
    this.guideFootnote.textContent = "Mỗi câu trả lời đúng cộng 1 điểm; chọn sai không bị trừ điểm.";
  }

  showGreenRound(stageIndex, seconds) {
    const isSorting = stageIndex === 1;
    this.greenTargetsLayer.dataset.stage = String(stageIndex);
    this.greenPanel.hidden = false;
    this.greenCompleteOverlay.hidden = true;
    this.greenRoundLabel.textContent = isSorting
      ? "NHIỆM VỤ 2 · PHÂN LOẠI RÁC TÁI CHẾ VÀ KHÔNG TÁI CHẾ"
      : "NHIỆM VỤ 1 · CHỌN TẤT CẢ RÁC HỮU CƠ";
    this.greenTimer.textContent = String(Math.ceil(seconds));
    this.greenTimer.dataset.urgent = String(seconds <= 10);
    this.greenLegend.replaceChildren();
    const entries = isSorting
      ? [["♻", "Tái chế", "recycle"], ["🗑", "Không tái chế", "other"]]
      : [["●", "Hữu cơ", "organic"], ["●", "Mục tiêu gây nhiễu", "distractor"]];
    entries.forEach(([icon, label, kind]) => {
      const entry = document.createElement("span");
      entry.className = `green-legend-item green-legend-item--${kind}`;
      entry.innerHTML = `<i aria-hidden="true">${icon}</i>${label}`;
      this.greenLegend.append(entry);
    });
  }

  showGreenInstruction(stageIndex, countdownSeconds = 20) {
    this.greenPanel.hidden = true;
    this.greenTargetsLayer.hidden = true;
    this.greenInstructionImage.src = stageIndex === 0
      ? "./assets/images/HD-man1.png"
      : "./assets/images/HD-man2.png";
    this.greenInstructionImage.alt = `Hướng dẫn chơi Green Guardian màn ${stageIndex + 1}`;
    this.greenInstructionCountdown.textContent = String(countdownSeconds);
    this.greenInstructionOverlay.hidden = false;
    return (seconds) => {
      if (!this.greenInstructionOverlay.hidden) this.greenInstructionCountdown.textContent = String(seconds);
    };
  }

  hideGreenInstruction() {
    this.greenInstructionOverlay.hidden = true;
  }

  updateGreenTimer(seconds) {
    this.greenTimer.textContent = String(Math.ceil(seconds));
    this.greenTimer.dataset.urgent = String(seconds <= 10);
    this.robotEnergyValue.textContent = `${Math.ceil(seconds)}s`;
  }

  getGreenTargetSpawnPosition(size, existingTargets, random = Math.random) {
    const stage = this.stage.getBoundingClientRect();
    if (!stage.width || !stage.height) return { x: 0.5, y: 0.5 };

    const marginX = Math.min(size / 2 + 12, stage.width / 2);
    const marginY = Math.min(size / 2 + 12, stage.height / 2);
    const obstacles = [
      this.greenPanel,
      ...(this.greenBinPicker.hidden ? [] : this.greenBins),
    ]
      .filter((element) => element && !element.hidden && getComputedStyle(element).display !== "none")
      .map((element) => element.getBoundingClientRect());
    let bestPosition = null;
    let bestClearance = -Infinity;
    const evaluatePosition = (x, y) => {
      const radius = size / 2 + 10;
      let clearance = Infinity;

      for (const target of existingTargets) {
        const distance = Math.hypot(
          x - target.position.x * stage.width,
          y - target.position.y * stage.height,
        );
        clearance = Math.min(clearance, distance - (size + target.size) / 2 - 12);
      }

      const bounds = {
        left: stage.left + x - radius,
        right: stage.left + x + radius,
        top: stage.top + y - radius,
        bottom: stage.top + y + radius,
      };
      const overlapsObstacle = obstacles.some((obstacle) =>
        bounds.left < obstacle.right &&
        bounds.right > obstacle.left &&
        bounds.top < obstacle.bottom &&
        bounds.bottom > obstacle.top,
      );
      return { clearance: overlapsObstacle ? -Infinity : clearance, overlapsObstacle };
    };

    for (let attempt = 0; attempt < 48; attempt += 1) {
      const x = marginX + random() * Math.max(0, stage.width - marginX * 2);
      const y = marginY + random() * Math.max(0, stage.height - marginY * 2);
      const { clearance } = evaluatePosition(x, y);
      if (clearance > bestClearance) {
        bestClearance = clearance;
        bestPosition = { x, y };
      }
      if (clearance >= 0) return { x: x / stage.width, y: y / stage.height };
    }

    const step = Math.max(size / 2 + 12, 32);
    for (let y = marginY; y <= stage.height - marginY; y += step) {
      for (let x = marginX; x <= stage.width - marginX; x += step) {
        const { clearance, overlapsObstacle } = evaluatePosition(x, y);
        if (!overlapsObstacle && clearance > bestClearance) {
          bestClearance = clearance;
          bestPosition = { x, y };
        }
      }
    }

    return {
      x: (bestPosition?.x ?? stage.width / 2) / stage.width,
      y: (bestPosition?.y ?? stage.height / 2) / stage.height,
    };
  }

  setGreenTargets(targets, selectedIndex = -1) {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const isInitialSpawn = targets.length > 0 && ![...this.greenTargetsLayer.children]
      .some((target) => target.dataset.exiting !== "true");
    const targetIds = new Set(targets.map((target) => String(target.id)));

    for (const dot of [...this.greenTargetsLayer.children]) {
      if (reduceMotion && dot.dataset.exiting === "true") {
        dot.remove();
        continue;
      }
      if (reduceMotion && dot.dataset.entering === "true") {
        delete dot.dataset.entering;
        dot.style.animationDelay = "";
      }
      if (targetIds.has(dot.dataset.targetId)) continue;
      if (reduceMotion) {
        dot.remove();
      } else if (dot.dataset.exiting !== "true") {
        if (dot.dataset.resolving === "true") {
          dot.getAnimations().forEach((animation) => animation.cancel());
        }
        dot.dataset.exiting = "true";
      }
    }

    targets.forEach((target, index) => {
      let dot = [...this.greenTargetsLayer.children]
        .find((item) => item.dataset.targetId === String(target.id) && item.dataset.exiting !== "true");
      const isNew = !dot;
      if (!dot) {
        dot = document.createElement("div");
        dot.className = "green-target";
        dot.dataset.targetId = String(target.id);
        dot.addEventListener("animationend", (event) => {
          if (event.target !== dot) return;
          if (event.animationName === "green-target-enter" && dot.dataset.entering === "true") {
            delete dot.dataset.entering;
            dot.style.animationDelay = "";
          } else if (event.animationName === "green-target-exit" && dot.dataset.exiting === "true") {
            dot.remove();
            if (this.greenTargetsLayer.childElementCount === 0) this.greenTargetsLayer.hidden = true;
          }
        });
      }
      dot.dataset.group = target.group;
      dot.dataset.selected = String(index === selectedIndex);
      dot.dataset.resolving = String(target.isResolving === true);
      dot.dataset.targetIndex = String(index);
      dot.dataset.hidden = String(target.hiddenFor > 0);
      dot.setAttribute("role", "img");
      dot.setAttribute("aria-label", target.name);
      dot.title = target.name;
      dot.style.left = `${target.position.x * 100}%`;
      dot.style.top = `${target.position.y * 100}%`;
      dot.style.width = `${target.size}px`;
      dot.style.height = `${target.size}px`;
      dot.textContent = target.icon;
      this.greenTargetsLayer.append(dot);

      if (isNew && !reduceMotion) {
        dot.dataset.entering = "true";
        dot.style.animationDelay = `${isInitialSpawn ? index * 390 : 0}ms, 0ms`;
      }
    });
    this.greenTargetsLayer.hidden = targets.length === 0 && this.greenTargetsLayer.childElementCount === 0;
    this.virtualCursor.dataset.targeting = "false";
  }

  updateGreenTargetPositions(targets) {
    for (const dot of this.greenTargetsLayer.children) {
      if (dot.dataset.exiting === "true") continue;
      const target = targets[Number(dot.dataset.targetIndex)];
      if (!target) continue;
      dot.style.left = `${target.position.x * 100}%`;
      dot.style.top = `${target.position.y * 100}%`;
      dot.dataset.hidden = String(target.hiddenFor > 0);
    }
  }

  setGreenTargetSelection(index) {
    for (const target of this.greenTargetsLayer.children) {
      target.dataset.pointed = String(
        target.dataset.exiting !== "true" &&
        target.dataset.resolving !== "true" &&
        Number(target.dataset.targetIndex) === index,
      );
    }
    this.virtualCursor.dataset.targeting = String(index >= 0);
  }

  getGreenTargetAt(point) {
    if (!point) return -1;
    const stage = this.stage.getBoundingClientRect();
    const x = stage.left + point.x * stage.width;
    const y = stage.top + point.y * stage.height;
    for (const target of this.greenTargetsLayer.children) {
      if (
        target.dataset.hidden === "true" ||
        target.dataset.exiting === "true" ||
        target.dataset.resolving === "true" ||
        target.dataset.entering === "true"
      ) continue;
      const bounds = target.getBoundingClientRect();
      if (x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom) {
        return Number(target.dataset.targetIndex);
      }
    }
    return -1;
  }

  showGreenBins(visible, target = null) {
    this.greenBinPicker.hidden = !visible;
    this.stage.dataset.greenDragging = String(visible);
    this.setGreenBinSelection(null);
    if (!visible) return null;

    const otherBin = this.greenBins.find((bin) => bin.dataset.bin === "other");
    const recycleBin = this.greenBins.find((bin) => bin.dataset.bin === "recycle");
    const stageWidth = this.stage.clientWidth;
    const stageHeight = this.stage.clientHeight;
    const binWidth = otherBin?.offsetWidth ?? 0;
    const binHeight = otherBin?.offsetHeight ?? 0;
    const gap = Number.parseFloat(getComputedStyle(this.greenBinPicker).getPropertyValue("--green-bin-gap"));
    const targetElement = target && [...this.greenTargetsLayer.children]
      .find((element) => element.dataset.targetId === String(target.id));
    const targetBounds = targetElement?.getBoundingClientRect();
    const visualRadius = targetBounds ? Math.max(targetBounds.width, targetBounds.height) / 2 : 0;
    const targetScale = targetElement ? Number.parseFloat(getComputedStyle(targetElement).scale) : 0;
    if (!target || !targetElement || !otherBin || !recycleBin || !stageWidth || !stageHeight ||
      !binWidth || !binHeight || !Number.isFinite(gap) ||
      !Number.isFinite(visualRadius) || !Number.isFinite(targetScale)) {
      this.greenBinPicker.hidden = true;
      throw new Error("Không thể bố trí thùng rác trong khu vực chơi.");
    }

    const horizontalInset = visualRadius + gap + binWidth;
    const minX = Math.min(horizontalInset, stageWidth / 2);
    const maxX = Math.max(stageWidth - horizontalInset, stageWidth / 2);
    const verticalInset = Math.min(Math.max(visualRadius, binHeight / 2), stageHeight / 2);
    const stageBounds = this.stage.getBoundingClientRect();
    const centerX = Math.max(
      minX,
      Math.min(maxX, targetBounds.left + targetBounds.width / 2 - stageBounds.left - this.stage.clientLeft),
    );
    const centerY = Math.max(
      verticalInset,
      Math.min(
        stageHeight - verticalInset,
        targetBounds.top + targetBounds.height / 2 - stageBounds.top - this.stage.clientTop,
      ),
    );
    const anchorOffsetX = (targetScale - 1) * targetElement.offsetWidth / 2;
    const anchorOffsetY = (targetScale - 1) * targetElement.offsetHeight / 2;
    target.position = {
      x: (centerX + anchorOffsetX) / stageWidth,
      y: (centerY + anchorOffsetY) / stageHeight,
    };
    const binOffset = visualRadius + gap + binWidth / 2;
    otherBin.style.left = `${centerX - binOffset}px`;
    otherBin.style.top = `${centerY}px`;
    recycleBin.style.left = `${centerX + binOffset}px`;
    recycleBin.style.top = `${centerY}px`;
    return target.position;
  }

  moveGreenTarget(target, point, targets) {
    const stageWidth = this.stage.clientWidth;
    const stageHeight = this.stage.clientHeight;
    const targetElement = [...this.greenTargetsLayer.children]
      .find((element) => element.dataset.targetId === String(target.id));
    const scale = targetElement ? Number.parseFloat(getComputedStyle(targetElement).scale) : 1;
    const offsetX = targetElement ? (scale - 1) * targetElement.offsetWidth / 2 : 0;
    const offsetY = targetElement ? (scale - 1) * targetElement.offsetHeight / 2 : 0;
    const visualWidth = targetElement?.getBoundingClientRect().width ?? target.size;
    const visualHeight = targetElement?.getBoundingClientRect().height ?? target.size;
    const marginX = Math.min(visualWidth / 2, stageWidth / 2);
    const marginY = Math.min(visualHeight / 2, stageHeight / 2);
    const centerX = Math.max(marginX, Math.min(stageWidth - marginX, point.x * stageWidth));
    const centerY = Math.max(marginY, Math.min(stageHeight - marginY, point.y * stageHeight));
    target.position = {
      x: (centerX + offsetX) / stageWidth,
      y: (centerY + offsetY) / stageHeight,
    };
    this.updateGreenTargetPositions(targets);
    return target.position;
  }

  animateGreenTargetToBin(target, binId) {
    const dot = [...this.greenTargetsLayer.children]
      .find((element) => element.dataset.targetId === String(target.id));
    const bin = this.greenBins.find((element) => element.dataset.bin === binId);
    if (!dot || !bin) throw new Error("Không tìm thấy mục tiêu hoặc thùng rác để hoàn tất phân loại.");

    const targetBounds = dot.getBoundingClientRect();
    const binBounds = bin.getBoundingClientRect();
    const layerBounds = this.greenTargetsLayer.getBoundingClientRect();
    const destinationCenterX = binBounds.left + binBounds.width / 2 - layerBounds.left;
    const destinationCenterY = binBounds.top + binBounds.height / 2 - layerBounds.top;
    const finalScale = .12;
    const destinationLeft = destinationCenterX + (finalScale - 1) * dot.offsetWidth / 2;
    const destinationTop = destinationCenterY + (finalScale - 1) * dot.offsetHeight / 2;
    const currentScale = getComputedStyle(dot).scale;
    dot.dataset.resolving = "true";
    this.setGreenBinSelection(binId);

    return new Promise((resolve) => {
      const animation = dot.animate(
        [
          {
            left: getComputedStyle(dot).left,
            top: getComputedStyle(dot).top,
            scale: currentScale,
            opacity: 1,
          },
          {
            left: `${destinationLeft}px`,
            top: `${destinationTop}px`,
            scale: ".12",
            opacity: .25,
          },
        ],
        { duration: 420, easing: "ease-in", fill: "forwards" },
      );
      animation.onfinish = () => {
        target.position = {
          x: (destinationCenterX + (finalScale - 1) * dot.offsetWidth / 2) / this.stage.clientWidth,
          y: (destinationCenterY + (finalScale - 1) * dot.offsetHeight / 2) / this.stage.clientHeight,
        };
        dot.remove();
        resolve();
      };
      animation.oncancel = resolve;
    });
  }

  getGreenBinAt(target) {
    if (!target?.position) return null;
    const targetElement = [...this.greenTargetsLayer.children]
      .find((element) => element.dataset.targetId === String(target.id));
    if (!targetElement) return null;
    const targetBounds = targetElement.getBoundingClientRect();
    let bestBin = null;
    let bestOverlap = 0;
    for (const bin of this.greenBins) {
      const bounds = bin.getBoundingClientRect();
      const overlapWidth = Math.max(0, Math.min(targetBounds.right, bounds.right) - Math.max(targetBounds.left, bounds.left));
      const overlapHeight = Math.max(0, Math.min(targetBounds.bottom, bounds.bottom) - Math.max(targetBounds.top, bounds.top));
      const overlap = overlapWidth * overlapHeight;
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestBin = bin;
      }
    }

    return bestBin && bestOverlap >= bestBin.offsetWidth * bestBin.offsetHeight * 0.3
      ? bestBin.dataset.bin
      : null;
  }

  setGreenBinSelection(binId) {
    this.greenBins.forEach((bin) => {
      bin.dataset.pointed = String(bin.dataset.bin === binId);
    });
    this.virtualCursor.dataset.targeting = String(binId !== null);
  }

  setGreenFeedback(message, correct = null) {
    this.greenInstruction.textContent = message;
    this.greenInstruction.dataset.result = correct === null ? "" : String(correct);
    this.gameMessageIcon.textContent = correct === true ? "🌱" : correct === false ? "↻" : "♻️";
    this.gameMessageText.textContent = message;
    this.gameMessage.dataset.state = correct === true ? "green-correct" : correct === false ? "green-incorrect" : "green-ready";
    this.stage.dataset.feedback = correct === true ? "correct" : correct === false ? "incorrect" : "";
  }

  showGreenScorePopup(points) {
    window.clearTimeout(this.greenScorePopupTimer);
    this.greenScorePopup.textContent = points > 0 ? "+1" : "−1";
    this.greenScorePopup.dataset.result = points > 0 ? "correct" : "incorrect";
    this.greenScorePopup.hidden = false;
    this.greenScorePopup.classList.remove("is-visible");
    void this.greenScorePopup.offsetWidth;
    this.greenScorePopup.classList.add("is-visible");
    this.greenScorePopupTimer = window.setTimeout(() => {
      this.greenScorePopup.hidden = true;
      this.greenScorePopup.classList.remove("is-visible");
      this.greenScorePopupTimer = 0;
    }, 1000);
  }

  hideGreenScorePopup() {
    window.clearTimeout(this.greenScorePopupTimer);
    this.greenScorePopupTimer = 0;
    this.greenScorePopup.hidden = true;
    this.greenScorePopup.classList.remove("is-visible");
  }

  showGreenCompletion(score, correct) {
    this.hideGreenScorePopup();
    this.greenPanel.hidden = true;
    this.greenTargetsLayer.hidden = true;
    this.greenTargetsLayer.replaceChildren();
    this.greenBinPicker.hidden = true;
    this.greenFinalScore.textContent = String(score);
    this.greenFinalCorrect.textContent = String(correct);
    this.greenCompleteOverlay.hidden = false;
    this.gameMessageText.textContent = "PHÂN LOẠI RÁC ĐÚNG – CHUNG TAY BẢO VỆ TRÁI ĐẤT!";
  }

  showGreenReviewIntro() {
    this.hideQuiz();
    this.greenPanel.hidden = true;
    this.greenTargetsLayer.hidden = true;
    this.greenBinPicker.hidden = true;
    this.greenReviewIntro.hidden = false;
  }

  hideGreenReviewIntro() {
    if (this.greenReviewIntro) this.greenReviewIntro.hidden = true;
  }

  hideGreenChallenge() {
    this.hideGreenInstruction();
    this.hideGreenReviewIntro();
    window.clearTimeout(this.greenCursorFeedbackTimer);
    this.greenCursorFeedbackTimer = 0;
    this.hideGreenScorePopup();
    if (this.greenPanel) this.greenPanel.hidden = true;
    if (this.greenTargetsLayer) {
      this.greenTargetsLayer.hidden = true;
      this.greenTargetsLayer.replaceChildren();
    }
    if (this.greenBinPicker) this.greenBinPicker.hidden = true;
    if (this.greenCompleteOverlay) this.greenCompleteOverlay.hidden = true;
    if (this.virtualCursor) {
      this.virtualCursor.classList.remove("green-cursor-feedback");
      delete this.virtualCursor.dataset.result;
      delete this.virtualCursor.dataset.targeting;
    }
    delete this.stage.dataset.greenDragging;
    this.stage.removeAttribute("data-feedback");
  }

  #setBeginGuide(isBegin) {
    if (!isBegin) {
      this.guideEyebrow.textContent = this.defaultGuide.eyebrow;
      this.guideHeading.textContent = this.defaultGuide.heading;
      this.guideFootnote.textContent = this.defaultGuide.footnote;
      this.guideItems.forEach((item, index) => {
        item.querySelector(".guide-emoji").textContent = this.defaultGuide.items[index].icon;
        item.querySelector("strong").textContent = this.defaultGuide.items[index].title;
        item.querySelector("small").textContent = this.defaultGuide.items[index].description;
      });
      return;
    }

    this.guideEyebrow.textContent = "04 / BEGIN GUIDE";
    this.guideHeading.textContent = "Cách chơi BEGIN";
    const instructions = [
      ["☝️", "Chỉ để xem gợi ý", "Duỗi một ngón trỏ và rê lên đồ vật"],
      ["✊", "Nắm tay để nhặt", "Giữ nắm tay khi mang đồ vật"],
      ["✋", "Xòe tay ở robot", "Robot nhận món đồ và phản ứng"],
      ["✨", "Xem lời giải thích", "Thử lại thoải mái, không bị trừ điểm"],
    ];
    this.guideItems.forEach((item, index) => {
      item.querySelector(".guide-emoji").textContent = instructions[index][0];
      item.querySelector("strong").textContent = instructions[index][1];
      item.querySelector("small").textContent = instructions[index][2];
    });
    this.beginHowToPlay.textContent =
      "Chỉ một ngón để xem gợi ý · nắm tay để nhặt · xòe tay ở robot.";
    this.guideFootnote.textContent =
      "Chỉ bằng đầu ngón trỏ để xem gợi ý; nắm để nhặt, xòe tay ở robot để thả.";
  }

  setBeginProgress(score, completed, total) {
    const progress = Math.round((completed / total) * 100);
    this.scoreValue.textContent = String(score);
    this.batteryCountLabel.textContent = "NHIỆM VỤ XONG";
    this.batteryCountValue.innerHTML = `${completed} <small>/ ${total}</small>`;
    this.robotEnergyLabel.textContent = "NHIỆM VỤ";
    this.robotEnergyValue.textContent = `${completed}/${total}`;
    this.robotEnergyBar.style.width = `${progress}%`;
    this.robotEnergyTrack.setAttribute("aria-valuenow", String(progress));
    this.robotEnergyTrack.setAttribute("aria-label", "Tiến trình nhiệm vụ BEGIN");
    this.robotHint.textContent = completed === total
      ? "Bạn đã giúp robot vượt qua mọi tình huống!"
      : `Đã hoàn thành ${completed} trên ${total} nhiệm vụ.`;
  }

  showBeginTask(task, index, total) {
    this.beginQuestionProgress.textContent = `NHIỆM VỤ ${index + 1}/${total}`;
    this.beginSituationIllustration.textContent = task.icon;
    this.beginSituationTitle.textContent = task.title;
    this.beginSituationDescription.textContent = task.situation;
    this.beginQuestionPrompt.textContent = task.prompt;
    this.beginHowToPlay.textContent = index === 0
      ? "Chỉ một ngón để xem gợi ý · nắm tay để nhặt · xòe tay ở robot."
      : "Chỉ để xem gợi ý · nắm để nhặt · xòe tay ở robot.";
    this.beginMission.dataset.intro = "true";
    this.beginMission.hidden = false;
  }

  finishBeginIntro() {
    delete this.beginMission.dataset.intro;
  }

  setBeginObjects(objects, visible = true) {
    this.beginObjectsLayer.replaceChildren();
    objects.forEach((object) => {
      const token = document.createElement("div");
      const icon = document.createElement("span");
      const label = document.createElement("strong");
      token.className = "begin-object";
      token.dataset.objectId = object.id;
      token.setAttribute("role", "img");
      token.setAttribute("aria-label", object.label);
      icon.className = "begin-object-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = object.icon;
      label.textContent = object.label;
      token.append(icon, label);
      this.beginObjectsLayer.append(token);
    });
    this.beginObjectsLayer.hidden = objects.length === 0;
    this.beginObjectsLayer.style.visibility = visible ? "visible" : "hidden";
    this.updateBeginObjects(objects);
  }

  setBeginObjectsVisible(visible) {
    this.beginObjectsLayer.style.visibility = visible ? "visible" : "hidden";
  }

  updateBeginObjects(objects) {
    for (const object of objects) {
      const token = [...this.beginObjectsLayer.children]
        .find((element) => element.dataset.objectId === object.id);
      if (!token) continue;
      token.style.left = `${object.position.x * 100}%`;
      token.style.top = `${object.position.y * 100}%`;
      token.dataset.held = String(object.isHeld);
    }
  }

  getCenteredAnswerPositions(layer, count) {
    const stage = this.stage.getBoundingClientRect();
    const objectRects = [...layer.children]
      .map((element) => element.getBoundingClientRect());
    const objectWidth = Math.max(...objectRects.map((rect) => rect.width));
    const objectHeight = Math.max(
      ...objectRects.map((rect) => rect.height),
      layer === this.easyBlocksLayer ? 100 : 0,
    );
    const mission = (layer === this.beginObjectsLayer ? this.beginMission : this.easyMission)
      .getBoundingClientRect();
    const robot = this.robotCharacter.getBoundingClientRect();
    const patterns = count === 4
      ? [[-1, -1], [1, -1], [-1, 1], [1, 1]]
      : count === 3
        ? [[-1, -1], [1, -1], [0, 1]]
        : count === 2
          ? [[-1, 0], [1, 0]]
          : [[0, 0]];
    const cursorClearance = 21 + 8;
    const offsetX = objectWidth / 2 + cursorClearance;
    const offsetY = objectHeight / 2 + cursorClearance;
    const obstacles = [mission, robot];
    const safeMargin = 8;
    const targetCenter = count === 3
      ? { x: 0.5, y: 0.5 }
      : { x: 0.38, y: 0.68 };
    let bestLayout = null;
    let bestScore = Infinity;

    for (let centerX = objectWidth + safeMargin; centerX <= stage.width - objectWidth - safeMargin; centerX += 8) {
      for (let centerY = objectHeight + safeMargin; centerY <= stage.height - objectHeight - safeMargin; centerY += 8) {
        const layout = patterns.map(([x, y]) => ({
          x: centerX + x * offsetX,
          y: centerY + y * offsetY,
        }));
        const fitsStage = layout.every((point) =>
          point.x >= objectWidth / 2 + safeMargin &&
          point.x <= stage.width - objectWidth / 2 - safeMargin &&
          point.y >= objectHeight / 2 + safeMargin &&
          point.y <= stage.height - objectHeight / 2 - safeMargin,
        );
        if (!fitsStage) continue;

        const overlapsObstacle = layout.some((point) => {
          const bounds = {
            left: stage.left + point.x - objectWidth / 2 - 8,
            right: stage.left + point.x + objectWidth / 2 + 8,
            top: stage.top + point.y - objectHeight / 2 - 8,
            bottom: stage.top + point.y + objectHeight / 2 + 8,
          };
          return obstacles.some((obstacle) =>
            bounds.left < obstacle.right &&
            bounds.right > obstacle.left &&
            bounds.top < obstacle.bottom &&
            bounds.bottom > obstacle.top,
          );
        });
        if (overlapsObstacle) continue;

        const coversHand = layout.some((point) =>
          Math.abs(point.x - stage.width / 2) < objectWidth / 2 + cursorClearance &&
          Math.abs(point.y - stage.height / 2) < objectHeight / 2 + cursorClearance,
        );
        if (coversHand) continue;

        const score =
          ((centerX / stage.width - targetCenter.x) / 0.2) ** 2 +
          (((centerY - (count === 3 ? offsetY / 3 : 0)) / stage.height - targetCenter.y) / 0.25) ** 2;
        if (score < bestScore) {
          bestScore = score;
          bestLayout = layout;
        }
      }
    }

    if (!bestLayout) {
      const fallbackOffsetX = Math.min(
        offsetX,
        Math.max(0, (stage.width - objectWidth - 2 * safeMargin) / 2),
      );
      const fallbackOffsetY = Math.min(
        offsetY,
        count === 3
          ? Math.max(0, (stage.height / 2 - objectHeight / 2 - safeMargin) * 3 / 4)
          : Math.max(0, (stage.height - objectHeight - 2 * safeMargin) / 2),
      );
      const centerX = stage.width * targetCenter.x;
      const centerY = stage.height * targetCenter.y +
        (count === 3 ? fallbackOffsetY / 3 : 0);
      bestLayout = patterns.map(([x, y]) => ({
        x: centerX + x * fallbackOffsetX,
        y: centerY + y * fallbackOffsetY,
      }));

      const minX = Math.min(...bestLayout.map((point) => point.x));
      const maxX = Math.max(...bestLayout.map((point) => point.x));
      const minY = Math.min(...bestLayout.map((point) => point.y));
      const maxY = Math.max(...bestLayout.map((point) => point.y));
      const shiftX = Math.max(
        objectWidth / 2 + safeMargin - minX,
        Math.min(0, stage.width - objectWidth / 2 - safeMargin - maxX),
      );
      const shiftY = Math.max(
        objectHeight / 2 + safeMargin - minY,
        Math.min(0, stage.height - objectHeight / 2 - safeMargin - maxY),
      );
      bestLayout = bestLayout.map((point) => ({
        x: point.x + shiftX,
        y: point.y + shiftY,
      }));
    }

    return bestLayout.map((point) => ({
      x: point.x / stage.width,
      y: point.y / stage.height,
    }));
  }

  setBeginMessage(message) {
    this.gameMessageIcon.textContent = "🧩";
    this.gameMessageText.textContent = message;
    this.gameMessage.dataset.state = "begin-ready";
  }

  setBeginHint(message) {
    this.gameMessageIcon.textContent = "💡";
    this.gameMessageText.textContent = message;
    this.gameMessage.dataset.state = "begin-hint";
  }

  setBeginPointedObject(objectId) {
    for (const token of this.beginObjectsLayer.children) {
      token.dataset.pointed = String(token.dataset.objectId === objectId);
    }
  }

  setBeginResponse(correct, message, explanation) {
    if (this.easyFeedbackTimer) window.clearTimeout(this.easyFeedbackTimer);
    this.robotCharacter.dataset.response = correct ? "correct" : "incorrect";
    this.robotStageStatus.textContent = correct ? "TỐT LẮM!" : "THỬ LẠI";
    this.gameMessageIcon.textContent = correct ? "✅" : "💡";
    this.gameMessageText.textContent = `${message} ${explanation}`;
    this.gameMessage.dataset.state = correct ? "easy-correct" : "easy-incorrect";
    this.easyFeedbackTimer = window.setTimeout(() => {
      delete this.robotCharacter.dataset.response;
      const energy = Number(this.robotCharacter.dataset.energy ?? 0);
      this.robotStageStatus.textContent = this.robotCharacter.dataset.state === "on"
        ? "ACTIVE"
        : energy > 0 ? `CHARGING ${energy}%` : "OFFLINE";
      this.easyFeedbackTimer = 0;
    }, 2000);
  }

  showBeginCompletion(score) {
    this.beginMission.hidden = true;
    this.beginObjectsLayer.hidden = true;
    this.beginObjectsLayer.replaceChildren();
    this.beginFinalScore.textContent = String(score);
    this.beginCompleteOverlay.removeAttribute("data-restarting");
    this.beginPlayAgainButton.disabled = false;
    this.setBeginReplaySelection(false, false);
    this.beginCompleteOverlay.hidden = false;
  }

  isBeginReplayButtonAt(point) {
    if (!point || this.beginCompleteOverlay.hidden) return false;
    const stage = this.stage.getBoundingClientRect();
    const x = stage.left + point.x * stage.width;
    const y = stage.top + point.y * stage.height;
    const button = this.beginPlayAgainButton.getBoundingClientRect();
    const hitMargin = 24;
    return x >= button.left - hitMargin && x <= button.right + hitMargin &&
      y >= button.top - hitMargin && y <= button.bottom + hitMargin;
  }

  setBeginReplaySelection(isSelected, canActivate) {
    this.beginPlayAgainButton.dataset.pointed = String(isSelected);
    this.beginPlayAgainButton.dataset.ready = String(isSelected && canActivate);
    if (this.beginCompleteOverlay.dataset.restarting === "true") return;
    this.beginReplayInstruction.textContent = !isSelected
      ? "Đưa tay vào nút rồi nắm tay để mở cổng năng lượng và chơi lại."
      : canActivate
        ? "Đang nhắm nút — nắm tay để mở cổng năng lượng!"
        : "Thả nắm tay trước, rồi nắm lại để chơi tiếp.";
  }

  getBeginReplayCenter() {
    const stage = this.stage.getBoundingClientRect();
    const button = this.beginPlayAgainButton.getBoundingClientRect();
    return {
      x: (button.left + button.width / 2 - stage.left) / stage.width,
      y: (button.top + button.height / 2 - stage.top) / stage.height,
    };
  }

  startBeginReplayEffect() {
    this.stage.dataset.beginReplay = "true";
    this.beginCompleteOverlay.dataset.restarting = "true";
    this.beginPlayAgainButton.disabled = true;
    this.beginReplayInstruction.textContent = "Cổng năng lượng đang mở — chuẩn bị nhiệm vụ mới!";
  }

  hideBeginChallenge() {
    delete this.beginMission.dataset.intro;
    this.beginMission.hidden = true;
    this.beginObjectsLayer.hidden = true;
    this.beginObjectsLayer.style.visibility = "visible";
    this.beginObjectsLayer.replaceChildren();
    this.beginCompleteOverlay.hidden = true;
    this.beginCompleteOverlay.removeAttribute("data-restarting");
    delete this.stage.dataset.beginReplay;
    this.beginPlayAgainButton.disabled = false;
    this.setBeginReplaySelection(false, false);
  }

  setEasyProgress(score, completed, total) {
    const progress = Math.round((completed / total) * 100);
    this.scoreValue.textContent = String(score);
    this.batteryCountLabel.textContent = "CÂU ĐÃ XONG";
    this.batteryCountValue.innerHTML = `${completed} <small>/ ${total}</small>`;
    this.robotEnergyLabel.textContent = "TIẾN TRÌNH";
    this.robotEnergyValue.textContent = `${completed}/${total}`;
    this.robotEnergyBar.style.width = `${progress}%`;
    this.robotEnergyTrack.setAttribute("aria-valuenow", String(progress));
    this.robotEnergyTrack.setAttribute("aria-label", "Tiến trình câu hỏi");
  }

  showEasyQuestion(question, index, total) {
    this.easyQuestionProgress.textContent = `CÂU ${index + 1}/${total}`;
    this.easySituationIllustration.textContent = question.icon;
    this.easySituationTitle.textContent = question.title;
    this.easySituationDescription.textContent = question.situation;
    this.easyQuestionPrompt.textContent = question.prompt;
    this.easyMission.hidden = false;
  }

  setEasyBlocks(blocks) {
    this.easyBlocksLayer.replaceChildren();
    blocks.forEach((block) => {
      const token = document.createElement("div");
      const image = document.createElement("img");
      const label = document.createElement("span");
      token.className = "logic-block";
      token.dataset.blockId = block.id;
      token.dataset.blockType = block.type;
      token.setAttribute("role", "img");
      token.setAttribute("aria-label", `Khối lệnh ${block.label}`);
      image.src = block.src;
      image.alt = "";
      image.draggable = false;
      label.textContent = block.label;
      token.append(image, label);
      this.easyBlocksLayer.append(token);
    });
    this.easyBlocksLayer.hidden = blocks.length === 0;
    this.updateEasyBlocks(blocks);
  }

  updateEasyBlocks(blocks) {
    for (const block of blocks) {
      const token = [...this.easyBlocksLayer.children]
        .find((element) => element.dataset.blockId === block.id);
      if (!token) continue;
      token.style.left = `${block.position.x * 100}%`;
      token.style.top = `${block.position.y * 100}%`;
      token.dataset.held = String(block.isHeld);
    }
  }

  setEasyMessage(message, type = "info") {
    this.gameMessageIcon.textContent = type === "error" ? "⚠️" : "🧩";
    this.gameMessageText.textContent = message;
    this.gameMessage.dataset.state = type === "error" ? "easy-incorrect" : "easy-ready";
  }

  setEasyResponse(correct, message, action = "") {
    if (this.easyFeedbackTimer) window.clearTimeout(this.easyFeedbackTimer);
    this.robotCharacter.dataset.response = correct ? "correct" : "incorrect";
    this.robotStageStatus.textContent = correct
      ? action
      : "THỬ LẠI";
    this.gameMessageIcon.textContent = correct ? "✅" : "❌";
    this.gameMessageText.textContent = message;
    this.gameMessage.dataset.state = correct ? "easy-correct" : "easy-incorrect";
    this.easyFeedbackTimer = window.setTimeout(() => {
      delete this.robotCharacter.dataset.response;
      const energy = Number(this.robotCharacter.dataset.energy ?? 0);
      this.robotStageStatus.textContent = this.robotCharacter.dataset.state === "on"
        ? "ACTIVE"
        : energy > 0 ? `CHARGING ${energy}%` : "OFFLINE";
      this.easyFeedbackTimer = 0;
    }, 2000);
  }

  showEasyCompletion(score) {
    this.easyMission.hidden = true;
    this.easyBlocksLayer.hidden = true;
    this.easyBlocksLayer.replaceChildren();
    this.easyFinalScore.textContent = String(score);
    this.easyCompleteOverlay.hidden = false;
  }

  hideEasyChallenge() {
    if (this.easyFeedbackTimer) window.clearTimeout(this.easyFeedbackTimer);
    this.easyFeedbackTimer = 0;
    this.easyMission.hidden = true;
    this.easyBlocksLayer.hidden = true;
    this.easyBlocksLayer.replaceChildren();
    this.easyCompleteOverlay.hidden = true;
    delete this.robotCharacter.dataset.response;
  }

  setHardProgress(hits, maxHits, score) {
    const boundedHits = Math.max(0, Math.min(maxHits, hits));
    const progress = Math.round((boundedHits / maxHits) * 100);
    this.scoreValue.textContent = String(score);
    this.batteryCountValue.innerHTML =
      `${boundedHits} <small>CHẠM KIẾM</small>`;
    this.robotEnergyValue.textContent = `${progress}%`;
    this.robotEnergyBar.style.width = `${progress}%`;
    this.robotEnergyTrack.setAttribute("aria-valuenow", String(progress));
  }

  setHardBatteries(batteries) {
    this.hardBatteryTokens.forEach((token, index) => {
      const point = batteries[index]?.position;
      token.hidden = !point;
      if (!point) return;
      token.style.left = `${point.x * 100}%`;
      token.style.top = `${point.y * 100}%`;
    });
  }

  setEnergySword(point, held, charge, visible = true) {
    this.energySword.hidden = !visible || !point;
    if (!point) return;
    this.energySword.style.left = `${point.x * 100}%`;
    this.energySword.style.top = `${point.y * 100}%`;
    this.energySword.dataset.held = String(held);
    this.energySword.dataset.charged = String(charge >= 5);
    this.energySword.style.setProperty("--sword-charge", String(Math.max(0, Math.min(1, charge / 5))));
    this.energySword.setAttribute(
      "aria-label",
      held
        ? `Kiếm đang được giữ, đã nạp ${charge} trên 5 pin`
        : `Kiếm năng lượng, đã nạp ${charge} trên 5 pin`,
    );
  }

  setHardMessage(icon, message) {
    this.gameMessageIcon.textContent = icon;
    this.gameMessageText.textContent = message;
    delete this.gameMessage.dataset.state;
  }

  setActivationProgress(progress, cursorInside, fistClosed) {
    const boundedProgress = Math.max(0, Math.min(1, progress));
    this.activationProgressBar.style.width = `${boundedProgress * 100}%`;
    this.activationProgress.setAttribute("aria-valuenow", String(Math.round(boundedProgress * 100)));
    this.activationOverlay.dataset.charging = String(boundedProgress > 0);

    if (boundedProgress >= 1) {
      this.activationTitle.textContent = "NĂNG LƯỢNG ĐÃ SẴN SÀNG";
      this.activationHint.textContent = "Đang mở màn chơi...";
      this.activationOverlay.dataset.complete = "true";
    } else if (!cursorInside) {
      this.activationTitle.textContent = "ĐƯA TAY VÀO LÕI NĂNG LƯỢNG";
      this.activationHint.textContent = "Trỏ con trỏ vào lõi ở giữa màn hình";
      delete this.activationOverlay.dataset.complete;
    } else if (!fistClosed) {
      this.activationTitle.textContent = "ĐÃ BẮT ĐƯỢC TAY";
      this.activationHint.textContent = "Nắm tay để truyền năng lượng";
      delete this.activationOverlay.dataset.complete;
    } else {
      this.activationTitle.textContent = "ĐANG NẠP NĂNG LƯỢNG";
      this.activationHint.textContent = "Giữ nắm tay đủ 3 giây để giải phóng năng lượng";
      delete this.activationOverlay.dataset.complete;
    }
  }

  isActivationTarget(point) {
    if (!point) return false;
    const bounds = this.activationOrb.getBoundingClientRect();
    const stage = this.stage.getBoundingClientRect();
    const cursorX = stage.left + point.x * stage.width;
    const cursorY = stage.top + point.y * stage.height;
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const radius = Math.max(bounds.width, bounds.height) * 0.62;
    return Math.hypot(cursorX - centerX, cursorY - centerY) <= radius;
  }

  setLoading(loading) {
    this.startButton.disabled = loading;
    this.cameraButton.disabled = loading;
    this.startButton.innerHTML = loading
      ? '<span aria-hidden="true">◌</span> ĐANG TẢI AI...'
      : '<span aria-hidden="true">▶</span> START GAME';
  }

  setMessage(message, type = "info") {
    this.statusMessage.textContent = message;
    this.statusMessage.dataset.type = type;
  }

  setGesture(result) {
    const presentation = GESTURE_PRESENTATION[result.gesture] ?? {
      label: result.gesture,
      icon: "⌖",
    };
    const percent = Math.round(result.confidence * 100);
    this.gestureName.textContent = presentation.label;
    this.gestureIcon.textContent = presentation.icon;
    this.confidenceValue.textContent = `${percent}%`;
    this.confidenceBar.style.width = `${percent}%`;
    this.confidenceTrack.setAttribute("aria-valuenow", String(percent));
    this.confirmHint.textContent = this.#hintFor(result);
    this.handsValue.innerHTML = result.hasHand ? "1 <small>/ 1</small>" : "0 <small>/ 1</small>";
  }

  setFPS(fps) {
    this.fpsValue.textContent = String(fps);
  }

  setPerformanceMode(ecoMode) {
    this.performanceMode.dataset.mode = ecoMode ? "eco" : "fast";
    this.performanceMode.textContent = ecoMode ? "CHẾ ĐỘ TIẾT KIỆM · 20 FPS" : "MỤC TIÊU 30 FPS";
  }

  setPosition(x, y, isFingerPointing = false) {
    this.positionLabel.textContent = isFingerPointing
      ? "Đầu ngón trỏ · X / Y"
      : "Tâm lòng bàn tay · X / Y";
    this.positionValue.textContent = `${x}% / ${y}%`;
  }

  setCursor(point, isFingerPointing = false) {
    if (!point) {
      this.virtualCursor.hidden = true;
      delete this.virtualCursor.dataset.cursor;
      return null;
    }

    this.virtualCursor.hidden = false;
    this.virtualCursor.dataset.cursor = isFingerPointing ? "finger" : "palm";
    this.virtualCursor.setAttribute(
      "aria-label",
      isFingerPointing ? "Con trỏ ở đầu ngón trỏ" : "Con trỏ ở tâm lòng bàn tay",
    );
    const horizontalMargin = this.virtualCursor.offsetWidth / 2 / this.stage.clientWidth;
    const verticalMargin = this.virtualCursor.offsetHeight / 2 / this.stage.clientHeight;
    const boundedPoint = {
      x: Math.max(horizontalMargin, Math.min(1 - horizontalMargin, point.x)),
      y: Math.max(verticalMargin, Math.min(1 - verticalMargin, point.y)),
    };
    this.virtualCursor.style.left = `${boundedPoint.x * 100}%`;
    this.virtualCursor.style.top = `${boundedPoint.y * 100}%`;
    return boundedPoint;
  }

  setBatteryPosition(point, isHeld, isDelivered = false) {
    if (isDelivered) {
      this.batteryToken.hidden = true;
      return null;
    }

    this.batteryToken.hidden = false;
    const horizontalMargin = this.batteryToken.offsetWidth / 2 / this.stage.clientWidth;
    const verticalMargin = this.batteryToken.offsetHeight / 2 / this.stage.clientHeight;
    const boundedPoint = {
      x: Math.max(horizontalMargin, Math.min(1 - horizontalMargin, point.x)),
      y: Math.max(verticalMargin, Math.min(1 - verticalMargin, point.y)),
    };
    this.batteryToken.style.left = `${boundedPoint.x * 100}%`;
    this.batteryToken.style.top = `${boundedPoint.y * 100}%`;
    this.batteryToken.dataset.held = String(isHeld);
    this.batteryToken.setAttribute(
      "aria-label",
      isHeld ? "Pin năng lượng đang được giữ" : "Pin năng lượng trên sân chơi",
    );
    this.batteryLabel.textContent = isHeld ? "CARRYING" : "ENERGY";
    return boundedPoint;
  }

  setRobotState(robot) {
    const powered = robot.isPowered;
    const energy = robot.energy;
    const previousState = this.robotCharacter.dataset.state;

    this.robotCharacter.dataset.state = powered && energy === 100 ? "on" : "off";
    this.robotCharacter.setAttribute(
      "aria-label",
      powered && energy === 100
        ? "Robot đã đầy năng lượng, đang hoạt động"
        : energy > 0 ? `Robot đang nạp ${energy}%` : "Robot đang hết năng lượng",
    );
    this.robotStageStatus.textContent = powered && energy === 100 ? "ACTIVE" : energy > 0 ? `CHARGING ${energy}%` : "OFFLINE";
    this.robotStateChip.dataset.state = powered && energy === 100 ? "on" : "off";
    this.robotStateText.textContent = powered && energy === 100 ? "ACTIVE" : energy > 0 ? `ĐANG NẠP ${energy}%` : "ĐANG TẮT";
    this.robotEnergyTrack.dataset.state = powered && energy === 100 ? "on" : "off";
    this.#setEnergy(energy);
    this.robotHint.textContent = powered && energy === 100
      ? "ROBOT ĐÃ ĐẦY NĂNG LƯỢNG – NHIỆM VỤ HOÀN THÀNH!"
      : energy >= 100
        ? "Đã đủ 100%! Trả lời đúng để robot sáng lên."
        : energy > 0
          ? `Đã nạp ${energy}%. Cần đủ 100% để mở câu hỏi.`
          : "Đưa pin đến vùng phát sáng trên robot.";
    this.robotHint.dataset.state = powered ? "on" : "off";

    if (this.robotChargeTimer) window.clearTimeout(this.robotChargeTimer);
    this.robotCharacter.classList.remove("is-charging");
    if (powered && energy === 100 && previousState !== "on") {
      this.robotCharacter.classList.add("is-charging");
      this.robotChargeTimer = window.setTimeout(() => {
        this.robotCharacter.classList.remove("is-charging");
        this.robotChargeTimer = 0;
      }, 900);
    }
  }

  setGameStats(score, batteriesDelivered, energy = 0) {
    this.scoreValue.textContent = String(score);
    this.batteryCountValue.innerHTML =
      `${batteriesDelivered} <small>ĐÃ NẠP</small>`;
    if (this.stage.dataset.mode === "green") {
      this.batteryCountLabel.textContent = "MỤC TIÊU ĐÚNG";
    } else {
      this.#setEnergy(energy);
    }
  }

  #setEnergy(energy) {
    const boundedEnergy = Math.max(0, Math.min(100, energy));
    const level = boundedEnergy / 100;
    this.robotCharacter.dataset.energy = String(boundedEnergy);
    this.robotCharacter.style.setProperty("--robot-energy", String(level));
    this.robotCharacter.style.setProperty("--robot-brightness", String(0.72 + level * 0.48));
    this.robotCharacter.style.setProperty("--robot-head-fill", blendColor("#52677e", "#168d8b", level));
    this.robotCharacter.style.setProperty("--robot-head-stroke", blendColor("#8297aa", "#62f1d8", level));
    this.robotCharacter.style.setProperty("--robot-outline", blendColor("#667d96", "#61efd9", level));
    this.robotCharacter.style.setProperty("--robot-face-stroke", blendColor("#718aa0", "#7af9e5", level));
    this.robotCharacter.style.setProperty("--robot-eye-fill", blendColor("#8293a5", "#c4fff4", level));
    this.robotCharacter.style.setProperty("--robot-core-fill", blendColor("#182b3c", "#087c72", level));
    this.robotCharacter.style.setProperty("--robot-core-stroke", blendColor("#8294a8", "#abfff0", level));
    this.robotCharacter.style.setProperty("--robot-bolt-fill", blendColor("#78899a", "#f2fff9", level));
    this.robotCharacter.style.setProperty("--robot-body-glow", `${(level * 16).toFixed(1)}px`);
    this.robotCharacter.style.setProperty("--robot-eye-glow", `${(level * 12).toFixed(1)}px`);
    this.robotCharacter.style.setProperty("--robot-core-glow", `${(level * 24).toFixed(1)}px`);
    this.robotCharacter.style.setProperty("--robot-glow-alpha", String(level * 0.9));
    this.robotEnergyValue.textContent = `${boundedEnergy}%`;
    this.robotEnergyBar.style.width = `${boundedEnergy}%`;
    this.robotEnergyTrack.setAttribute("aria-valuenow", String(boundedEnergy));
    this.missionProgressLabel.textContent = `${boundedEnergy}% NĂNG LƯỢNG`;
    this.missionProgressBar.style.width = `${boundedEnergy}%`;
    this.missionProgressTrack.setAttribute("aria-valuenow", String(boundedEnergy));
    this.missionProgressTrack.setAttribute("aria-valuetext", `${boundedEnergy}% năng lượng`);
  }

  setSoundEnabled(enabled, errorMessage = "") {
    this.soundButton.setAttribute("aria-pressed", String(enabled));
    this.soundButton.innerHTML = enabled
      ? '<span aria-hidden="true">♫</span> ÂM THANH: BẬT'
      : '<span aria-hidden="true">♫</span> ÂM THANH: TẮT';
    this.soundButton.title = errorMessage || (enabled ? "Tắt âm thanh" : "Bật âm thanh");
  }

  setBatteryState(state) {
    if (this.batteryState === state) return;
    this.batteryState = state;
    this.gameMessage.dataset.state = state;

    const messages = {
      searching: ["🔋", "Pin mới đã xuất hiện. Đến gần rồi nắm tay để nhặt."],
      "too-far": ["↗", "Pin ở xa — di chuyển con trỏ đến sát pin rồi nắm tay."],
      held: ["✊", "Đã nhặt pin! Giữ nắm tay để mang pin theo con trỏ."],
      dropped: ["✋", "Đã thả pin. Hãy đưa pin đến vùng phát sáng trên robot để nạp."],
      delivered: ["✨", "NẠP THÀNH CÔNG! +100 điểm · Robot tăng thêm 20%."],
      charged: ["⚡", "ĐÃ ĐẠT 100%! Trả lời đúng để robot sáng lên."],
    };
    const [icon, message] = messages[state] ?? messages.searching;
    this.gameMessageIcon.textContent = icon;
    this.gameMessageText.textContent = message;
  }

  clearLandmarks() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  showQuiz(question, progress = "") {
    this.setGreenCursorFeedback(null);
    this.quizQuestion.textContent = question.prompt;
    this.quizEyebrow.textContent = progress || "THỬ THÁCH IF–THEN";
    this.quizAnswers.replaceChildren();
    question.answers.forEach((answer, index) => {
      const option = document.createElement("div");
      option.className = "quiz-answer";
      option.dataset.index = String(index);
      option.innerHTML = `<span class="quiz-answer-key">${String.fromCharCode(65 + index)}</span><span>${answer}</span>`;
      this.quizAnswers.append(option);
    });
    this.quizInstruction.textContent = this.stage.dataset.mode === "green"
      ? "Đưa tâm bàn tay vào đáp án rồi nắm tay để xác nhận. Trả lời sai sẽ được thử lại."
      : "Trỏ lòng bàn tay vào đáp án, rồi nắm tay để xác nhận.";
    delete this.quizInstruction.dataset.result;
    delete this.quizAnswers.dataset.locked;
    this.stage.dataset.quiz = "true";
    this.quizOverlay.hidden = false;
  }

  hideQuiz() {
    this.quizOverlay.hidden = true;
    delete this.stage.dataset.quiz;
  }

  getAnswerAt(point) {
    const stage = this.stage.getBoundingClientRect();
    const x = stage.left + point.x * stage.width;
    const y = stage.top + point.y * stage.height;
    for (const option of this.quizAnswers.children) {
      const rect = option.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return Number(option.dataset.index);
      }
    }
    return -1;
  }

  setQuizSelection(index) {
    for (const option of this.quizAnswers.children) {
      option.classList.toggle("is-selected", Number(option.dataset.index) === index);
    }
  }

  setQuizFeedback(message, correct, locked = true, selectedIndex = -1) {
    this.quizInstruction.textContent = message;
    if (locked) {
      this.quizInstruction.dataset.result = correct ? "correct" : "incorrect";
      this.quizAnswers.dataset.locked = "true";
      delete this.quizAnswers.dataset.result;
      for (const option of this.quizAnswers.children) {
        option.classList.remove("is-correct-result", "is-incorrect-result");
      }
      const selected = this.quizAnswers.children[selectedIndex];
      selected?.classList.add(correct ? "is-correct-result" : "is-incorrect-result");
      this.quizAnswers.dataset.result = correct ? "correct" : "incorrect";
    } else {
      delete this.quizInstruction.dataset.result;
      delete this.quizAnswers.dataset.locked;
    }
  }

  setGreenQuizAnswerFeedback(index, correct) {
    for (const option of this.quizAnswers.children) {
      option.classList.remove("is-correct-result", "is-incorrect-result");
    }
    this.quizAnswers.children[index]?.classList.add(
      correct ? "is-correct-result" : "is-incorrect-result",
    );
  }

  setGreenCursorFeedback(correct) {
    window.clearTimeout(this.greenCursorFeedbackTimer);
    this.greenCursorFeedbackTimer = 0;
    this.virtualCursor.classList.remove("green-cursor-feedback");
    delete this.virtualCursor.dataset.result;
    if (correct === null) return;

    const result = correct ? "correct" : "incorrect";
    this.virtualCursor.dataset.result = result;
    void this.virtualCursor.offsetWidth;
    this.virtualCursor.classList.add("green-cursor-feedback");
    this.greenCursorFeedbackTimer = window.setTimeout(() => {
      this.virtualCursor.classList.remove("green-cursor-feedback");
      if (this.virtualCursor.dataset.result === result) {
        delete this.virtualCursor.dataset.result;
      }
      this.greenCursorFeedbackTimer = 0;
    }, 900);
  }

  #hintFor(result) {
    if (!result.hasHand) return "Đưa một bàn tay vào khung hình";
    const source = result.geometricOpenPalm ? "Nhận diện xòe bằng landmarks" :
      `MediaPipe: ${result.categoryName ?? "Unknown"} · ngưỡng ${Math.round(MIN_CONFIDENCE * 100)}%`;
    if (!result.isStable) return `Đang xác nhận (${result.stableFrames ?? 1}/4) · ${source}`;
    return `Cử chỉ ổn định · ${source}`;
  }
}
