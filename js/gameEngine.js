import { isCursorTouchingBattery, isPointInReceiver } from "./collision.js";
import { Robot } from "./robot.js";

const EASY_QUESTIONS = [
  {
    title: "ROBOT QUÁ NÓNG",
    situation: "Nhiệt độ robot vượt quá mức cho phép. Robot cần bật quạt để làm mát.",
    icon: "🌡️",
    prompt: "Khối lệnh nào giúp robot kiểm tra nhiệt độ và bật quạt khi quá nóng?",
    correctBlock: "if-then",
    action: "QUẠT ĐÃ BẬT",
  },
  {
    title: "ROBOT GẶP VẬT CẢN",
    situation: "Robot phát hiện có vật cản ngay phía trước và cần dừng động cơ.",
    icon: "🚧",
    prompt: "Khối lệnh nào giúp robot kiểm tra vật cản và dừng lại khi phát hiện?",
    correctBlock: "if-then",
    action: "ĐỘNG CƠ ĐÃ DỪNG",
  },
  {
    title: "PIN ROBOT YẾU",
    situation: "Khi năng lượng pin xuống thấp, robot cần kích hoạt chế độ sạc pin.",
    icon: "🪫",
    prompt: "Khối lệnh nào giúp robot kiểm tra pin và bắt đầu sạc khi pin yếu?",
    correctBlock: "if-then",
    action: "ĐANG SẠC PIN",
  },
  {
    title: "KIỂM SOÁT NHIỆT ĐỘ",
    situation: "Nếu nhiệt độ cao, robot bật quạt. Nếu nhiệt độ bình thường, robot tắt quạt.",
    icon: "🌡️",
    prompt: "Khối lệnh nào giúp robot xử lý cả hai trường hợp: nhiệt độ cao và nhiệt độ bình thường?",
    correctBlock: "if-then-else",
    action: "QUẠT ĐÃ TỰ ĐIỀU CHỈNH",
  },
  {
    title: "KIỂM SOÁT PIN",
    situation: "Nếu pin chưa đầy, robot tiếp tục sạc. Nếu pin đã đầy, robot dừng sạc.",
    icon: "🔋",
    prompt: "Khối lệnh nào giúp robot xử lý cả hai trường hợp: pin đầy và pin chưa đầy?",
    correctBlock: "if-then-else",
    action: "PIN ĐẦY · ĐÃ DỪNG SẠC",
  },
];

const HARD_QUESTIONS = [
  {
    prompt: "Nếu trời mưa, THÌ điều gì thường xảy ra?",
    answers: ["Đường bị ướt", "Mặt trời sáng hơn", "Tuyết rơi"],
    correctIndex: 0,
  },
  {
    prompt: "Nếu nhấn công tắc đèn, THÌ điều gì xảy ra?",
    answers: ["Cửa mở", "Đèn bật", "Chuông reo"],
    correctIndex: 1,
  },
  {
    prompt: "Nếu pin hết năng lượng, THÌ robot nên làm gì?",
    answers: ["Nạp pin", "Đi ngủ mãi", "Tắt màn hình"],
    correctIndex: 0,
  },
  {
    prompt: "Trong câu lệnh IF–THEN, phần IF có nghĩa là gì?",
    answers: ["Kết quả", "Điều kiện", "Lặp lại"],
    correctIndex: 1,
  },
  {
    prompt: "Trong IF–THEN, phần THEN mô tả điều gì?",
    answers: ["Điều kiện cần kiểm tra", "Kết quả khi điều kiện đúng", "Tên của biến"],
    correctIndex: 1,
  },
];

const HARD_BATTERY_COUNT = 5;
const HARD_FALLING_BATTERY_COUNT = 4;
const EASY_BLOCK_TYPES = ["if-then", "if-then-else", "wait", "repeat"];
const EASY_BLOCK_ASSETS = {
  "if-then": { src: "./assets/images/if-then.png", label: "IF THEN" },
  "if-then-else": { src: "./assets/images/if-then-else.png", label: "IF THEN ELSE" },
  wait: { src: "./assets/images/wait.png", label: "WAIT" },
  repeat: { src: "./assets/images/repeat.png", label: "REPEAT" },
};
const EASY_SCORE_PER_QUESTION = 100;
const EASY_FEEDBACK_DURATION = 2000;
const BEGIN_INTRO_DURATION = 3000;
const BEGIN_TASKS = [
  {
    title: "ROBOT NÓNG QUÁ",
    situation: "Robot vừa làm việc lâu nên đang nóng lên.",
    icon: "🌡️",
    prompt: "Mang chiếc quạt đến robot để giúp robot mát hơn.",
    hint: "Tìm món đồ có thể tạo gió mát cho robot.",
    learningNote: "Khi robot nóng, bật quạt sẽ giúp làm mát.",
    correctAction: "fan",
    choices: [
      { id: "fan", icon: "🌀", label: "Bật quạt" },
      { id: "battery", icon: "🔋", label: "Sạc pin" },
      { id: "horn", icon: "📣", label: "Bật còi" },
    ],
  },
  {
    title: "CÓ VẬT CẢN PHÍA TRƯỚC",
    situation: "Một chiếc hộp đang chắn ngay lối đi của robot.",
    icon: "🚧",
    prompt: "Chọn hành động giúp robot đi an toàn.",
    hint: "Hãy chọn cách giúp robot không va vào chiếc hộp.",
    learningNote: "Đây là ý tưởng NẾU… THÌ…: nếu có vật cản, thì dừng lại.",
    correctAction: "stop",
    choices: [
      { id: "stop", icon: "🛑", label: "Dừng lại" },
      { id: "go", icon: "➡️", label: "Đi tiếp" },
      { id: "fan", icon: "🌀", label: "Bật quạt" },
    ],
  },
  {
    title: "PIN SẮP HẾT",
    situation: "Đèn báo cho biết robot chỉ còn một ít năng lượng.",
    icon: "🪫",
    prompt: "Mang viên pin đến robot để robot tiếp tục hoạt động.",
    hint: "Tìm món đồ giúp robot có thêm năng lượng.",
    learningNote: "Khi pin yếu, robot cần được sạc.",
    correctAction: "battery",
    choices: [
      { id: "battery", icon: "🔋", label: "Sạc pin" },
      { id: "stop", icon: "🛑", label: "Dừng lại" },
      { id: "umbrella", icon: "☂️", label: "Lấy ô" },
    ],
  },
  {
    title: "TRỜI ĐANG MƯA",
    situation: "Robot cần ra ngoài nhưng trời đang mưa.",
    icon: "🌧️",
    prompt: "Mang chiếc ô đến để che mưa cho robot.",
    hint: "Tìm vật có thể che mưa cho robot.",
    learningNote: "Bạn đã dùng cùng cách suy nghĩ để giúp robot trong một tình huống mới.",
    correctAction: "umbrella",
    choices: [
      { id: "umbrella", icon: "☂️", label: "Che ô" },
      { id: "battery", icon: "🔋", label: "Sạc pin" },
      { id: "horn", icon: "📣", label: "Bật còi" },
    ],
  },
  {
    title: "PIN ĐÃ ĐẦY",
    situation: "Pin đã đầy nhưng robot vẫn đang tiếp tục sạc.",
    icon: "🔋",
    prompt: "Chọn hành động phù hợp để robot không sạc thêm.",
    hint: "Robot đã đủ pin rồi; hãy chọn cách kết thúc việc sạc.",
    learningNote: "NẾU pin yếu THÌ sạc; NẾU pin đầy THÌ dừng sạc.",
    correctAction: "stop-charge",
    choices: [
      { id: "stop-charge", icon: "⏹️", label: "Dừng sạc" },
      { id: "charge", icon: "⚡", label: "Sạc tiếp" },
      { id: "umbrella", icon: "☂️", label: "Lấy ô" },
    ],
  },
];
const BEGIN_FEEDBACK_DURATION = 1600;

export class GameEngine {
  constructor(ui, random = Math.random, feedback = {}) {
    this.ui = ui;
    this.random = random;
    this.feedback = feedback;
    this.mode = "easy";
    this.robot = new Robot();
    this.score = 0;
    this.batteriesDelivered = 0;
    this.phase = "battery";
    this.questionIndex = -1;
    this.selectedAnswer = -1;
    this.requiresGestureRelease = false;
    this.nextRoundTimer = 0;
    this.lastFlightUpdate = performance.now();
    this.hardHits = 0;
    this.hardBatteries = [];
    this.hardSword = null;
    this.easyBlocks = [];
    this.heldEasyBlockId = null;
    this.beginObjects = [];
    this.heldBeginObjectId = null;
    this.pointedBeginObjectId = null;
    this.beginPointedAt = 0;
    this.beginHintShown = false;
    this.ui.hideEasyChallenge();
    this.ui.hideBeginChallenge();
    this.ui.setGameMode("easy");
    this.ui.setRobotState(this.robot);
    this.ui.setGameStats(this.score, this.batteriesDelivered, this.robot.energy);
  }

  setMode(mode) {
    if (mode !== "easy" && mode !== "hard" && mode !== "begin") {
      throw new Error(`Chế độ chơi không hợp lệ: ${mode}`);
    }
    this.mode = mode;
    this.ui.setGameMode(mode);
    this.reset();
  }

  update({ cursor, gesture, isStable, hasHand }) {
    const now = performance.now();
    const deltaSeconds = Math.min((now - this.lastFlightUpdate) / 1000, 0.1);
    this.lastFlightUpdate = now;
    if (this.mode === "hard") {
      this.#updateHard(deltaSeconds, { cursor, gesture, isStable, hasHand });
      return;
    }
    if (this.mode === "begin") {
      this.#updateBegin(deltaSeconds, { cursor, gesture, isStable, hasHand });
      return;
    }
    this.#updateEasyBlocks(deltaSeconds, { cursor, gesture, isStable, hasHand });
  }

  reset() {
    window.clearTimeout(this.nextRoundTimer);
    this.nextRoundTimer = 0;
    if (this.mode === "hard") {
      this.#resetHardMode();
      return;
    }
    if (this.mode === "begin") {
      this.#resetBeginMode();
      return;
    }
    this.questionIndex = 0;
    this.requiresGestureRelease = false;
    this.lastFlightUpdate = performance.now();
    this.ui.hideQuiz();
    this.ui.hideEasyChallenge();
    this.robot.reset();
    this.score = 0;
    this.batteriesDelivered = 0;
    this.ui.setRobotState(this.robot);
    this.#startEasyQuestion();
  }

  #resetHardMode() {
    this.phase = "hard-sword";
    this.questionIndex = 0;
    this.selectedAnswer = -1;
    this.requiresGestureRelease = false;
    this.lastFlightUpdate = performance.now();
    this.hardHits = 0;
    this.score = 0;
    this.batteriesDelivered = 0;
    this.robot.reset();
    this.ui.hideQuiz();
    this.ui.hideEasyChallenge();
    this.ui.setGameMode("hard");
    this.ui.setRobotState(this.robot);
    this.ui.setGameStats(this.score, 0, this.robot.energy);
    this.easyBlocks = [];
    this.heldEasyBlockId = null;
    this.hardBatteries = Array.from(
      { length: HARD_FALLING_BATTERY_COUNT },
      (_, lane) => this.#spawnHardBattery(lane),
    );
    this.hardSword = {
      position: { x: 0.68, y: 0.72 },
      isHeld: false,
    };
    this.ui.setHardProgress(0, HARD_BATTERY_COUNT, this.score);
    this.ui.setHardBatteries(this.hardBatteries);
    this.ui.setEnergySword(this.hardSword.position, false, 0);
    this.ui.setHardMessage("⚔", "Nắm tay trên thanh kiếm cạnh robot để nhặt.");
  }

  #resetBeginMode() {
    this.phase = "begin-intro";
    this.questionIndex = 0;
    this.requiresGestureRelease = false;
    this.lastFlightUpdate = performance.now();
    this.score = 0;
    this.batteriesDelivered = 0;
    this.pointedBeginObjectId = null;
    this.beginPointedAt = 0;
    this.beginHintShown = false;
    this.robot.reset();
    this.ui.hideQuiz();
    this.ui.hideEasyChallenge();
    this.ui.hideBeginChallenge();
    this.ui.setRobotState(this.robot);
    this.ui.setGameStats(this.score, 0, this.robot.energy);
    this.#startBeginTask();
  }

  #startBeginTask() {
    const task = BEGIN_TASKS[this.questionIndex];
    this.phase = "begin-intro";
    this.heldBeginObjectId = null;
    this.pointedBeginObjectId = null;
    this.beginPointedAt = 0;
    this.beginHintShown = false;
    this.ui.setBeginPointedObject(null);
    this.beginObjects = this.#spawnBeginObjects(task);
    this.ui.setBeginProgress(this.score, this.batteriesDelivered, BEGIN_TASKS.length);
    this.ui.showBeginTask(task, this.questionIndex, BEGIN_TASKS.length);
    this.ui.setBeginObjects([]);
    this.ui.setBeginMessage("Đọc tình huống nhé — trò chơi sẽ bắt đầu sau 3 giây.");
    this.nextRoundTimer = window.setTimeout(() => {
      if (this.phase !== "begin-intro") return;
      this.phase = "begin-play";
      this.ui.finishBeginIntro();
      this.ui.setBeginObjects(this.beginObjects);
      this.#placeAnswerObjects(this.beginObjects, this.ui.beginObjectsLayer);
      this.ui.updateBeginObjects(this.beginObjects);
      this.ui.setBeginMessage("Chỉ một ngón tay để xem gợi ý; nắm tay để nhặt, xòe tay ở robot để thả.");
    }, BEGIN_INTRO_DURATION);
  }

  #placeAnswerObjects(objects, layer) {
    const positions = this.ui.getCenteredAnswerPositions(layer, objects.length);
    objects.forEach((object, index) => {
      object.position = positions[index];
      object.homePosition = { ...positions[index] };
    });
  }

  #spawnBeginObjects(task) {
    return task.choices.map((choice, index) => ({
      ...choice,
      id: `${this.questionIndex}-${choice.id}-${index}`,
      actionId: choice.id,
      position: {
        x: 0.16 + index * 0.22,
        y: 0.56 + (index % 2) * 0.11,
      },
      isHeld: false,
    }));
  }

  #updateBegin(deltaSeconds, { cursor, gesture, isStable, hasHand }) {
    if (this.phase !== "begin-play") return;

    if (hasHand && cursor && this.heldBeginObjectId) {
      const heldObject = this.beginObjects.find((object) => object.id === this.heldBeginObjectId);
      if (heldObject) heldObject.position = { ...cursor };
    }
    this.ui.updateBeginObjects(this.beginObjects);

    if (!hasHand || !cursor) {
      this.#clearBeginPointing();
      return;
    }
    if (gesture === "Pointing_Up") {
      this.#updateBeginPointing(cursor);
      return;
    }
    this.#clearBeginPointing();

    if (this.requiresGestureRelease) {
      if (gesture !== "Closed_Fist") this.requiresGestureRelease = false;
      else return;
    }
    if (!isStable) return;

    if (gesture === "Closed_Fist" && !this.heldBeginObjectId) {
      this.#tryPickBeginObject(cursor);
      return;
    }

    if (gesture !== "Open_Palm" || !this.heldBeginObjectId) return;
    const object = this.beginObjects.find((item) => item.id === this.heldBeginObjectId);
    if (!object) return;

    object.isHeld = false;
    object.position = { ...cursor };
    this.heldBeginObjectId = null;
    this.requiresGestureRelease = true;
    if (this.#isInsideReceiver(cursor)) {
      this.#submitBeginObject(object, cursor);
    } else {
      object.position = { ...object.homePosition };
      this.ui.updateBeginObjects(this.beginObjects);
      this.ui.setBeginMessage("Đã thả đồ vật. Nắm tay để nhặt lại và đưa đến robot.");
      this.feedback.audio?.play("drop");
      this.feedback.effects?.burst(cursor, 12);
    }
  }

  #tryPickBeginObject(cursor) {
    const stage = this.#stageSize();
    const object = this.beginObjects.find((item) =>
      isCursorTouchingBattery(cursor, item.position, stage, 64),
    );
    if (!object) return;

    object.isHeld = true;
    object.position = { ...cursor };
    this.heldBeginObjectId = object.id;
    this.ui.updateBeginObjects(this.beginObjects);
    this.ui.setBeginMessage(`Đã nhặt ${object.label}. Mang đến robot rồi xòe tay.`);
    this.feedback.audio?.play("pickup");
    this.feedback.effects?.burst(cursor, 16);
  }

  #updateBeginPointing(cursor) {
    if (this.heldBeginObjectId) {
      this.#clearBeginPointing();
      return;
    }
    const object = this.beginObjects.find((item) =>
      isCursorTouchingBattery(cursor, item.position, this.#stageSize(), 64),
    );
    if (!object) {
      this.#clearBeginPointing();
      return;
    }

    if (this.pointedBeginObjectId !== object.id) {
      this.pointedBeginObjectId = object.id;
      this.beginPointedAt = performance.now();
      this.beginHintShown = false;
      this.ui.setBeginPointedObject(object.id);
      this.ui.setBeginMessage("Giữ đầu ngón trỏ trên đồ vật để xem gợi ý.");
      return;
    }

    if (!this.beginHintShown && performance.now() - this.beginPointedAt >= 500) {
      this.beginHintShown = true;
      this.ui.setBeginHint(`Gợi ý: ${BEGIN_TASKS[this.questionIndex].hint}`);
    }
  }

  #clearBeginPointing() {
    if (!this.pointedBeginObjectId) return;
    this.pointedBeginObjectId = null;
    this.beginPointedAt = 0;
    this.ui.setBeginPointedObject(null);
    if (this.beginHintShown && this.phase === "begin-play") {
      this.ui.setBeginMessage("Chỉ một ngón tay để xem gợi ý; nắm tay để nhặt, xòe tay ở robot để thả.");
    }
    this.beginHintShown = false;
  }

  #submitBeginObject(object, cursor) {
    const task = BEGIN_TASKS[this.questionIndex];
    const correct = object.actionId === task.correctAction;
    if (!correct) {
      object.position = { ...object.homePosition };
      this.ui.updateBeginObjects(this.beginObjects);
      this.ui.setBeginResponse(
        false,
        "Chưa đúng hành động — thử một đồ vật khác nhé.",
        "Gợi ý: " + task.prompt,
      );
      this.feedback.audio?.play("drop");
      this.feedback.effects?.burst(cursor, 18);
      return;
    }

    this.phase = "begin-result";
    this.beginObjects = [];
    this.score += EASY_SCORE_PER_QUESTION;
    this.batteriesDelivered += 1;
    this.robot.receiveBattery();
    if (this.batteriesDelivered === BEGIN_TASKS.length) this.robot.activate();
    this.ui.setBeginProgress(this.score, this.batteriesDelivered, BEGIN_TASKS.length);
    this.ui.setRobotState(this.robot);
    this.ui.setBeginObjects(this.beginObjects);
    this.ui.setBeginResponse(true, "Làm tốt lắm! Robot đã được giúp đỡ.", task.learningNote);
    this.feedback.audio?.play("success");
    this.feedback.effects?.burst(this.#receiverPoint(), 30);

    this.nextRoundTimer = window.setTimeout(() => {
      if (this.phase !== "begin-result") return;
      if (this.questionIndex === BEGIN_TASKS.length - 1) {
        this.phase = "begin-complete";
        this.ui.showBeginCompletion(this.score);
        return;
      }

      this.questionIndex += 1;
      this.#startBeginTask();
    }, BEGIN_FEEDBACK_DURATION);
  }

  #startEasyQuestion() {
    const question = EASY_QUESTIONS[this.questionIndex];
    this.phase = "easy-blocks";
    this.heldEasyBlockId = null;
    this.selectedAnswer = -1;
    this.easyBlocks = this.#spawnEasyBlocks(question);
    this.ui.setEasyProgress(this.score, this.batteriesDelivered, EASY_QUESTIONS.length);
    this.ui.showEasyQuestion(question, this.questionIndex, EASY_QUESTIONS.length);
    this.ui.setEasyBlocks(this.easyBlocks);
    this.ui.setEasyMessage("Nắm tay trên khối lệnh để nhặt, rồi xòe tay trong vùng robot để thả.");
  }

  #spawnEasyBlocks(question) {
    const types = [...EASY_BLOCK_TYPES];
    for (let index = types.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(this.random() * (index + 1));
      [types[index], types[swapIndex]] = [types[swapIndex], types[index]];
    }

    return types.map((type, lane) => ({
      id: `${this.questionIndex}-${lane}-${type}`,
      type,
      ...EASY_BLOCK_ASSETS[type],
      position: {
        x: 0.13 + lane * 0.17 + (this.random() - 0.5) * 0.025,
        y: -0.12 - lane * 0.34,
      },
      speed: 0.045 + this.random() * 0.035,
      isHeld: false,
    })).map((block) => ({
      ...block,
      isCorrect: block.type === question.correctBlock,
    }));
  }

  #updateEasyBlocks(deltaSeconds, { cursor, gesture, isStable, hasHand }) {
    if (this.phase !== "easy-blocks") return;

    for (const block of this.easyBlocks) {
      if (block.isHeld) continue;
      block.position.y += block.speed * deltaSeconds;
      if (block.position.y > 1.12) block.position.y = -0.12;
    }

    if (hasHand && cursor && this.heldEasyBlockId) {
      const heldBlock = this.easyBlocks.find((block) => block.id === this.heldEasyBlockId);
      if (heldBlock) heldBlock.position = { ...cursor };
    }
    this.ui.updateEasyBlocks(this.easyBlocks);

    if (!hasHand || !cursor) return;
    if (this.requiresGestureRelease) {
      if (gesture !== "Closed_Fist") this.requiresGestureRelease = false;
      else return;
    }
    if (!isStable) return;

    if (gesture === "Closed_Fist" && !this.heldEasyBlockId) {
      this.#tryPickEasyBlock(cursor);
      return;
    }

    if (gesture !== "Open_Palm" || !this.heldEasyBlockId) return;
    const block = this.easyBlocks.find((item) => item.id === this.heldEasyBlockId);
    if (!block) return;

    block.isHeld = false;
    block.position = { ...cursor };
    this.heldEasyBlockId = null;
    if (this.#isInsideReceiver(cursor)) {
      this.#submitEasyBlock(block, cursor);
    } else {
      this.ui.updateEasyBlocks(this.easyBlocks);
      this.ui.setEasyMessage("Đã thả khối lệnh. Hãy nắm tay để nhặt lại.");
      this.feedback.audio?.play("drop");
      this.feedback.effects?.burst(cursor, 12);
    }
  }

  #tryPickEasyBlock(cursor) {
    const stage = this.#stageSize();
    const block = this.easyBlocks.find((item) =>
      isCursorTouchingBattery(cursor, item.position, stage, 58),
    );
    if (!block) return;

    block.isHeld = true;
    block.position = { ...cursor };
    this.heldEasyBlockId = block.id;
    this.ui.updateEasyBlocks(this.easyBlocks);
    this.ui.setEasyMessage(`Đã nhặt khối ${block.label}. Đưa vào robot để kiểm tra.`);
    this.feedback.audio?.play("pickup");
    this.feedback.effects?.burst(cursor, 16);
  }

  #submitEasyBlock(block, cursor) {
    const question = EASY_QUESTIONS[this.questionIndex];
    const correct = block.type === question.correctBlock;
    this.phase = "easy-result";
    this.requiresGestureRelease = true;
    this.easyBlocks = [];
    this.ui.setEasyBlocks(this.easyBlocks);

    if (correct) {
      this.score += EASY_SCORE_PER_QUESTION;
      this.batteriesDelivered += 1;
      this.robot.receiveBattery();
      if (this.batteriesDelivered === EASY_QUESTIONS.length) this.robot.activate();
      this.ui.setEasyProgress(this.score, this.batteriesDelivered, EASY_QUESTIONS.length);
      this.ui.setRobotState(this.robot);
    }

    this.ui.setEasyResponse(
      correct,
      correct
        ? "CHÍNH XÁC! ROBOT ĐÃ ĐƯỢC KHẮC PHỤC"
        : "CHƯA CHÍNH XÁC! HÃY THỬ LẠI",
      correct ? question.action : "",
    );
    this.feedback.audio?.play(correct ? "success" : "drop");
    this.feedback.effects?.burst(correct ? this.#receiverPoint() : cursor, correct ? 30 : 18);

    this.nextRoundTimer = window.setTimeout(() => {
      if (this.phase !== "easy-result") return;
      if (!correct) {
        this.phase = "easy-blocks";
        this.easyBlocks = this.#spawnEasyBlocks(question);
        this.ui.setEasyBlocks(this.easyBlocks);
        this.ui.setEasyMessage("Thử lại nhé! Nắm tay một khối lệnh rồi đưa vào robot.");
        return;
      }

      if (this.questionIndex === EASY_QUESTIONS.length - 1) {
        this.phase = "easy-complete";
        this.ui.showEasyCompletion(this.score);
        return;
      }

      this.questionIndex += 1;
      this.#startEasyQuestion();
    }, EASY_FEEDBACK_DURATION);
  }

  #updateHard(deltaSeconds, { cursor, gesture, isStable, hasHand }) {
    if (this.phase === "hard-sword") {
      this.#updateFallingBattery(deltaSeconds);
      this.#updateSword({ cursor, gesture, isStable, hasHand });
      return;
    }

    if (this.phase === "hard-quiz") {
      if (!hasHand || !cursor) {
        this.#setSelectedAnswer(-1);
        return;
      }
      this.#setSelectedAnswer(this.ui.getAnswerAt(cursor));
      if (this.requiresGestureRelease) {
        if (gesture !== "Closed_Fist") this.requiresGestureRelease = false;
        else return;
      }
      if (isStable && gesture === "Closed_Fist") this.#answerHardQuestion();
    }
  }

  #updateFallingBattery(deltaSeconds) {
    if (this.hardHits >= HARD_BATTERY_COUNT) return;
    this.hardBatteries.forEach((battery, lane) => {
      battery.position.y += battery.speed * deltaSeconds;
      if (battery.position.y > 1.08) {
        this.hardBatteries[lane] = this.#spawnHardBattery(lane);
      }
    });
    this.ui.setHardBatteries(this.hardBatteries);
  }

  #updateSword({ cursor, gesture, isStable, hasHand }) {
    if (!this.hardSword) return;

    const swordWasHeld = this.hardSword.isHeld;
    if (this.hardSword.isHeld && cursor) {
      this.hardSword.position = { x: cursor.x, y: cursor.y };
    } else if (this.hardSword.isHeld && !hasHand) {
      this.hardSword.isHeld = false;
    }

    if (
      !this.hardSword.isHeld &&
      hasHand &&
      cursor &&
      isStable &&
      gesture === "Closed_Fist" &&
      isCursorTouchingBattery(
        cursor,
        this.hardSword.position,
        this.#stageSize(),
        66,
      )
    ) {
      this.hardSword.isHeld = true;
      this.hardSword.position = { x: cursor.x, y: cursor.y };
      this.feedback.audio?.play("pickup");
      this.feedback.effects?.burst(cursor, 18);
      this.ui.setHardMessage("⚔", "Đã nhặt kiếm. Đưa mũi kiếm chạm vào 5 pin đang rơi.");
    }

    if (
      swordWasHeld &&
      this.hardSword.isHeld &&
      hasHand &&
      cursor &&
      isStable &&
      gesture === "Closed_Fist"
    ) {
      this.#tryHitFallingBattery(cursor);
    }

    if (this.hardSword.isHeld && isStable && gesture === "Open_Palm") {
      if (this.hardHits >= HARD_BATTERY_COUNT && this.#isInsideReceiver(cursor)) {
        this.#deliverSword();
        return;
      }

      this.hardSword.isHeld = false;
      if (cursor) this.hardSword.position = { x: cursor.x, y: cursor.y };
      this.ui.setHardMessage(
        "✋",
        this.hardHits >= HARD_BATTERY_COUNT
          ? "Đưa kiếm đã nạp đủ vào vùng robot rồi xòe tay để giao."
          : "Kiếm chưa nạp đầy. Nắm tay nhặt lại và chạm đủ 5 pin.",
      );
      this.feedback.audio?.play("drop");
    }

    this.ui.setEnergySword(this.hardSword.position, this.hardSword.isHeld, this.hardHits);
  }

  #tryHitFallingBattery(cursor) {
    const tip = this.#swordTip(cursor);
    const stage = this.#stageSize();
    const hitIndex = this.hardBatteries.findIndex((battery) => {
      const distance = Math.hypot(
        (tip.x - battery.position.x) * stage.width,
        (tip.y - battery.position.y) * stage.height,
      );
      return distance <= 42;
    });
    if (hitIndex < 0) return;

    const hitPoint = { ...this.hardBatteries[hitIndex].position };
    this.hardHits = Math.min(HARD_BATTERY_COUNT, this.hardHits + 1);
    this.score += 50;
    this.hardBatteries[hitIndex] = this.hardHits >= HARD_BATTERY_COUNT
      ? null
      : this.#spawnHardBattery(hitIndex);
    if (this.hardHits >= HARD_BATTERY_COUNT) this.hardBatteries = [];
    this.ui.setHardBatteries(this.hardBatteries);
    this.ui.setHardProgress(this.hardHits, HARD_BATTERY_COUNT, this.score);
    this.ui.setEnergySword(this.hardSword.position, true, this.hardHits);
    this.feedback.audio?.play("pickup");
    this.feedback.effects?.burst(hitPoint, 24);
    this.ui.setHardMessage(
      "⚡",
      this.hardHits >= HARD_BATTERY_COUNT
        ? "Kiếm đã nạp đầy! Đưa kiếm đến robot và xòe tay để giao."
        : `Trúng pin ${this.hardHits}/${HARD_BATTERY_COUNT}. Tiếp tục đón pin rơi!`,
    );
  }

  #deliverSword() {
    this.hardSword.isHeld = false;
    this.phase = "hard-quiz";
    this.questionIndex = 0;
    this.selectedAnswer = -1;
    this.requiresGestureRelease = true;
    this.ui.setEnergySword(this.hardSword.position, false, this.hardHits, false);
    this.hardBatteries = [];
    this.ui.setHardBatteries(this.hardBatteries);
    for (let index = 0; index < 5; index += 1) this.robot.receiveBattery();
    this.robot.activate();
    this.ui.setRobotState(this.robot);
    this.ui.setHardProgress(this.hardHits, HARD_BATTERY_COUNT, this.score);
    this.ui.setHardMessage("✨", "Kiếm đã nạp cho robot. Trả lời đúng 5 câu hỏi liên tiếp!");
    this.#showHardQuestion();
    this.feedback.audio?.play("success");
    this.feedback.effects?.burst(this.#receiverPoint(), 32);
  }

  #showHardQuestion() {
    this.phase = "hard-quiz";
    this.selectedAnswer = -1;
    this.ui.showQuiz(
      HARD_QUESTIONS[this.questionIndex],
      `SIÊU KHÓ · CÂU ${this.questionIndex + 1}/5`,
    );
  }

  #answerHardQuestion() {
    if (this.phase !== "hard-quiz") return;
    if (this.selectedAnswer < 0) {
      this.ui.setQuizFeedback("Hãy trỏ vào một đáp án rồi nắm tay để chọn.", false, false);
      this.requiresGestureRelease = true;
      return;
    }

    const correct = this.selectedAnswer === HARD_QUESTIONS[this.questionIndex].correctIndex;
    this.requiresGestureRelease = true;
    if (!correct) {
      this.phase = "hard-result";
      this.ui.setQuizFeedback(
        "✕ Chưa chính xác. Chế độ Siêu khó sẽ bắt đầu lại.",
        false,
        true,
        this.selectedAnswer,
      );
      this.ui.setHardMessage("↻", "Trả lời sai — đang khởi động lại thử thách Siêu khó.");
      this.feedback.audio?.play("drop");
      this.nextRoundTimer = window.setTimeout(() => {
        if (this.phase === "hard-result") this.#resetHardMode();
      }, 1800);
      return;
    }

    this.score += 100;
    this.questionIndex += 1;
    this.ui.setHardProgress(this.hardHits, HARD_BATTERY_COUNT, this.score);
    this.feedback.audio?.play("success");
    if (this.questionIndex >= HARD_QUESTIONS.length) {
      this.phase = "hard-complete";
      this.ui.setQuizFeedback(
        "✓ HOÀN THÀNH! Bạn đã trả lời đúng cả 5 câu và giải cứu robot.",
        true,
        true,
        this.selectedAnswer,
      );
      this.ui.setHardMessage("🏆", "SIÊU KHÓ HOÀN THÀNH! Robot đã được giải cứu.");
      return;
    }

    this.phase = "hard-result";
    this.ui.setQuizFeedback(
      `✓ Chính xác! Tiến trình ${this.questionIndex}/5. Chuẩn bị câu tiếp theo.`,
      true,
      true,
      this.selectedAnswer,
    );
    this.nextRoundTimer = window.setTimeout(() => {
      if (this.phase === "hard-result") this.#showHardQuestion();
    }, 1200);
  }

  #spawnHardBattery(lane) {
    return {
      position: {
        x: 0.17 + (lane / (HARD_FALLING_BATTERY_COUNT - 1)) * 0.66 +
          (this.random() - 0.5) * 0.05,
        y: -0.1,
      },
      speed: 0.23 + lane * 0.11 + this.random() * 0.025,
    };
  }

  #stageSize() {
    return {
      width: this.ui.stage.clientWidth,
      height: this.ui.stage.clientHeight,
    };
  }

  #swordTip(position) {
    const stage = this.#stageSize();
    return {
      x: position.x,
      y: position.y - this.ui.energySword.offsetWidth * (48 / 120) / Math.max(stage.height, 1),
    };
  }

  #isInsideReceiver(cursor) {
    return isPointInReceiver(
      cursor,
      this.ui.receiver.getBoundingClientRect(),
      this.ui.stage.getBoundingClientRect(),
    );
  }

  #setSelectedAnswer(index) {
    if (this.selectedAnswer === index) return;
    this.selectedAnswer = index;
    this.ui.setQuizSelection(index);
  }

  #receiverPoint() {
    const stage = this.ui.stage.getBoundingClientRect();
    const receiver = this.ui.receiver.getBoundingClientRect();
    return {
      x: (receiver.left + receiver.width / 2 - stage.left) / stage.width,
      y: (receiver.top + receiver.height / 2 - stage.top) / stage.height,
    };
  }

}
