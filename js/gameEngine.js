import { Battery } from "./battery.js";
import { isCursorTouchingBattery, isPointInReceiver } from "./collision.js";
import { Robot } from "./robot.js";

const QUESTIONS = [
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
];

export class GameEngine {
  constructor(ui, random = Math.random, feedback = {}) {
    this.ui = ui;
    this.random = random;
    this.feedback = feedback;
    this.battery = new Battery(random);
    this.robot = new Robot();
    this.score = 0;
    this.batteriesDelivered = 0;
    this.phase = "battery";
    this.questionIndex = -1;
    this.selectedAnswer = -1;
    this.requiresGestureRelease = false;
    this.nextRoundTimer = 0;
    this.lastFlightUpdate = performance.now();
    this.renderBattery();
    this.ui.setRobotState(this.robot);
    this.ui.setGameStats(this.score, this.batteriesDelivered, this.robot.energy);
    this.ui.setBatteryState("searching");
  }

  update({ cursor, gesture, isStable, hasHand }) {
    const now = performance.now();
    const deltaSeconds = Math.min((now - this.lastFlightUpdate) / 1000, 0.1);
    this.lastFlightUpdate = now;
    if (this.phase === "battery" && !this.battery.isHeld) {
      this.battery.fly(deltaSeconds);
      this.renderBattery();
    }

    if (!hasHand || !cursor) {
      if (this.phase === "quiz") this.#setSelectedAnswer(-1);
      return;
    }

    if (this.phase === "quiz") {
      this.#setSelectedAnswer(this.ui.getAnswerAt(cursor));
      if (this.requiresGestureRelease) {
        if (gesture !== "Closed_Fist") this.requiresGestureRelease = false;
        else return;
      }
      if (isStable && gesture === "Closed_Fist") this.#answerQuestion();
      return;
    }
    if (this.phase !== "battery") return;

    if (this.requiresGestureRelease) {
      if (gesture !== "Closed_Fist") this.requiresGestureRelease = false;
      else return;
    }

    if (this.battery.isHeld) {
      this.battery.follow(cursor);
      this.renderBattery();
    }

    if (!isStable) return;

    if (gesture === "Closed_Fist" && !this.battery.isHeld) {
      this.#tryPickup(cursor);
      return;
    }

    if (gesture === "Open_Palm" && this.battery.isHeld) {
      if (this.#isInsideReceiver(cursor)) {
        this.#deliverBattery();
      } else if (this.battery.drop(cursor)) {
        this.renderBattery();
        this.ui.setBatteryState("dropped");
        this.feedback.audio?.play("drop");
        this.feedback.effects?.burst(cursor, 12);
      }
    }
  }

  reset() {
    window.clearTimeout(this.nextRoundTimer);
    this.phase = "battery";
    this.questionIndex = -1;
    this.selectedAnswer = -1;
    this.requiresGestureRelease = false;
    this.lastFlightUpdate = performance.now();
    this.ui.hideQuiz();
    this.battery.reset();
    this.robot.reset();
    this.score = 0;
    this.batteriesDelivered = 0;
    this.renderBattery();
    this.ui.setRobotState(this.robot);
    this.ui.setGameStats(this.score, this.batteriesDelivered, this.robot.energy);
    this.ui.setBatteryState("searching");
  }

  #isInsideReceiver(cursor) {
    return isPointInReceiver(
      cursor,
      this.ui.receiver.getBoundingClientRect(),
      this.ui.stage.getBoundingClientRect(),
    );
  }

  #deliverBattery() {
    if (!this.battery.deliver() || !this.robot.receiveBattery()) return;
    this.renderBattery();
    this.score += 100;
    this.batteriesDelivered += 1;
    this.ui.setGameStats(this.score, this.batteriesDelivered, this.robot.energy);
    this.feedback.audio?.play("pickup");
    this.feedback.effects?.burst(this.#receiverPoint(), 24);
    if (this.robot.energy >= 100) {
      this.robot.activate();
      this.ui.setRobotState(this.robot);
      this.phase = "quiz";
      this.ui.setBatteryState("charged");
      this.questionIndex = (this.questionIndex + 1) % QUESTIONS.length;
      this.selectedAnswer = -1;
      this.ui.showQuiz(QUESTIONS[this.questionIndex]);
      return;
    }

    this.ui.setRobotState(this.robot);
    this.battery.reset();
    this.renderBattery();
    this.phase = "battery";
    this.ui.setBatteryState("delivered");
    window.setTimeout(() => {
      if (this.phase === "battery" && !this.battery.isHeld && this.ui.batteryState === "delivered") {
        this.ui.setBatteryState("searching");
      }
    }, 900);
  }

  #setSelectedAnswer(index) {
    if (this.selectedAnswer === index) return;
    this.selectedAnswer = index;
    this.ui.setQuizSelection(index);
  }

  #answerQuestion() {
    if (this.phase !== "quiz") return;
    if (this.selectedAnswer < 0) {
      this.ui.setQuizFeedback("Hãy trỏ vào một đáp án rồi nắm tay để chọn.", false, false);
      this.requiresGestureRelease = true;
      return;
    }

    const question = QUESTIONS[this.questionIndex];
    const correct = this.selectedAnswer === question.correctIndex;
    if (correct) {
      this.score += 50;
      this.robot.activate();
      this.ui.setRobotState(this.robot);
    } else {
      this.score = 0;
      this.batteriesDelivered = 0;
      this.robot.reset();
      this.ui.setRobotState(this.robot);
      this.ui.setGameStats(this.score, this.batteriesDelivered, this.robot.energy);
    }
    this.ui.setGameStats(this.score, this.batteriesDelivered, this.robot.energy);
    this.ui.setQuizFeedback(
      correct
        ? "✓ CHÍNH XÁC! +50 điểm · Robot đã đầy năng lượng – nhiệm vụ hoàn thành!"
        : "✕ CHƯA CHÍNH XÁC! HÃY THỬ LẠI · Bạn mất toàn bộ điểm.",
      correct,
      true,
      this.selectedAnswer,
    );
    this.feedback.audio?.play(correct ? "success" : "drop");
    this.phase = "result";
    this.requiresGestureRelease = true;
    this.nextRoundTimer = window.setTimeout(() => {
      if (this.phase !== "result") return;
      if (!correct) {
        this.reset();
        return;
      }
      this.battery.reset();
      this.phase = "battery";
      this.lastFlightUpdate = performance.now();
      this.renderBattery();
      this.ui.hideQuiz();
      this.ui.setBatteryState("searching");
    }, 2400);
  }

  #tryPickup(cursor) {
    const stage = {
      width: this.ui.stage.clientWidth,
      height: this.ui.stage.clientHeight,
    };
    const touching = isCursorTouchingBattery(cursor, this.battery.position, stage);

    if (!touching) {
      this.ui.setBatteryState("too-far");
      return;
    }

    if (this.battery.pickUp()) {
      this.battery.follow(cursor);
      this.renderBattery();
      this.ui.setBatteryState("held");
      this.feedback.audio?.play("pickup");
      this.feedback.effects?.burst(cursor, 16);
    }
  }

  #receiverPoint() {
    const stage = this.ui.stage.getBoundingClientRect();
    const receiver = this.ui.receiver.getBoundingClientRect();
    return {
      x: (receiver.left + receiver.width / 2 - stage.left) / stage.width,
      y: (receiver.top + receiver.height / 2 - stage.top) / stage.height,
    };
  }

  renderBattery() {
    this.ui.setBatteryPosition(
      this.battery.position,
      this.battery.isHeld,
      this.battery.isDelivered,
    );
  }
}
