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
      const bounds = button.getBoundingClientRect();
      return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
    });
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
    this.#setBeginGuide(isBegin);
    this.hideBeginChallenge();
    if (isBegin) this.hideEasyChallenge();
    this.stage.dataset.mode = mode;
    this.gameModeLabel.textContent = isHard ? "SIÊU KHÓ" : isBegin ? "BEGIN" : "DỄ";
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
    if (isBegin) {
      this.batteryCountValue.innerHTML = '0 <small>/ 5 NHIỆM VỤ</small>';
      this.robotEnergyLabel.textContent = "NHIỆM VỤ";
      this.robotEnergyValue.textContent = "0/5";
      this.robotEnergyTrack.setAttribute("aria-label", "Tiến trình nhiệm vụ BEGIN");
      this.robotHint.textContent = "Giúp robot xử lý các tình huống quen thuộc.";
    } else if (!isHard) {
      this.robotHint.textContent = "Chọn đúng khối lệnh để khắc phục tình huống.";
    }
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
    this.#setEnergy(energy);
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
    this.quizInstruction.textContent = "Trỏ lòng bàn tay vào đáp án, rồi nắm tay để xác nhận.";
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

  #hintFor(result) {
    if (!result.hasHand) return "Đưa một bàn tay vào khung hình";
    const source = result.geometricOpenPalm ? "Nhận diện xòe bằng landmarks" :
      `MediaPipe: ${result.categoryName ?? "Unknown"} · ngưỡng ${Math.round(MIN_CONFIDENCE * 100)}%`;
    if (!result.isStable) return `Đang xác nhận (${result.stableFrames ?? 1}/4) · ${source}`;
    return `Cử chỉ ổn định · ${source}`;
  }
}
