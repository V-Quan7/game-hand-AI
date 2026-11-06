import {
  FilesetResolver,
  GestureRecognizer,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

const VISION_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task";
export const MIN_CONFIDENCE = 0.55;
const MIN_HAND_DETECTION_CONFIDENCE = 0.55;
const STABLE_FRAME_COUNT = 4;
const PALM_BASES = [0, 5, 9, 13, 17];

export function palmCenter(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;
  return PALM_BASES.reduce((center, index) => ({
    x: center.x + landmarks[index].x / PALM_BASES.length,
    y: center.y + landmarks[index].y / PALM_BASES.length,
  }), { x: 0, y: 0 });
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isFingerExtended(landmarks, mcp, pip, tip) {
  const palm = palmCenter(landmarks);
  const palmWidth = Math.max(distance(landmarks[5], landmarks[17]), 0.001);
  const straight = distance(landmarks[pip], landmarks[tip]) /
    Math.max(distance(landmarks[mcp], landmarks[pip]), 0.001);
  return distance(landmarks[tip], palm) > distance(landmarks[mcp], palm) + palmWidth * 0.08 && straight > 0.48;
}

export function detectOpenPalm(landmarks) {
  if (!landmarks || landmarks.length < 21) return false;
  const fourFingersExtended = [
    [5, 6, 8], [9, 10, 12], [13, 14, 16], [17, 18, 20],
  ].every(([mcp, pip, tip]) => isFingerExtended(landmarks, mcp, pip, tip));
  const palm = palmCenter(landmarks);
  const palmWidth = distance(landmarks[5], landmarks[17]);
  const thumbOpen = distance(landmarks[4], palm) > palmWidth * 0.42 &&
    distance(landmarks[4], landmarks[5]) > palmWidth * 0.35;
  return fourFingersExtended && thumbOpen;
}

export function detectIndexPointing(landmarks) {
  if (!landmarks || landmarks.length < 21) return false;
  const indexExtended = isFingerExtended(landmarks, 5, 6, 8);
  const otherFingersFolded = [
    [9, 10, 12], [13, 14, 16], [17, 18, 20],
  ].every(([mcp, pip, tip]) => !isFingerExtended(landmarks, mcp, pip, tip));
  return indexExtended && otherFingersFolded;
}

export async function createGestureRecognizer(onStatus = () => {}) {
  onStatus("Đang tải thư viện MediaPipe...");
  const vision = await FilesetResolver.forVisionTasks(VISION_WASM_URL);
  const options = {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
    minHandPresenceConfidence: MIN_HAND_DETECTION_CONFIDENCE,
    minTrackingConfidence: MIN_HAND_DETECTION_CONFIDENCE,
  };

  onStatus("Đang tải mô hình nhận diện...");
  try {
    const recognizer = await GestureRecognizer.createFromOptions(vision, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "GPU" },
    });
    onStatus("Mô hình đã sẵn sàng (GPU)");
    return { recognizer, delegate: "GPU" };
  } catch (gpuError) {
    onStatus("GPU không khả dụng, đang chuyển sang CPU...");
    try {
      const recognizer = await GestureRecognizer.createFromOptions(vision, {
        ...options,
        baseOptions: { ...options.baseOptions, delegate: "CPU" },
      });
      onStatus("Mô hình đã sẵn sàng (CPU)");
      return { recognizer, delegate: "CPU" };
    } catch (cpuError) {
      throw new Error(
        `Không thể khởi tạo mô hình AI bằng GPU hoặc CPU. GPU: ${gpuError.message}; CPU: ${cpuError.message}`,
      );
    }
  }
}

export class GestureStabilizer {
  constructor() {
    this.reset();
  }

  reset() {
    this.stableGesture = "Unknown";
    this.candidateGesture = "";
    this.candidateCount = 0;
  }

  update(categoryName, score, landmarks) {
    const geometricOpenPalm = detectOpenPalm(landmarks);
    const indexPointing = detectIndexPointing(landmarks);
    const supportedGesture = categoryName === "Open_Palm" || categoryName === "Closed_Fist";
    const candidate = geometricOpenPalm
      ? "Open_Palm"
      : indexPointing
        ? "Pointing_Up"
        : supportedGesture && score >= MIN_CONFIDENCE
          ? categoryName
          : "Other";

    if (candidate === this.candidateGesture) {
      this.candidateCount += 1;
    } else {
      this.candidateGesture = candidate;
      this.candidateCount = 1;
    }

    if (this.candidateCount >= STABLE_FRAME_COUNT) {
      this.stableGesture = candidate;
    }

    return {
      gesture: this.candidateCount >= STABLE_FRAME_COUNT ? this.stableGesture : "Uncertain",
      isStable: this.candidateCount >= STABLE_FRAME_COUNT,
      confidence: score,
      categoryName,
      geometricOpenPalm,
      indexPointing,
      stableFrames: this.candidateCount,
    };
  }

  noHand() {
    this.reset();
    return { gesture: "No Hand", isStable: true, confidence: 0 };
  }
}
