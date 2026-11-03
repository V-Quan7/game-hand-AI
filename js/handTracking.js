export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function drawHandLandmarks(context, canvas, landmarks, palmPoint = null) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks?.length) return;

  context.lineWidth = Math.max(2, canvas.width / 320);
  context.strokeStyle = "rgba(77, 241, 220, 0.92)";
  context.shadowColor = "rgba(69, 228, 232, 0.75)";
  context.shadowBlur = 7;

  for (const [start, end] of HAND_CONNECTIONS) {
    context.beginPath();
    context.moveTo(
      landmarks[start].x * canvas.width,
      landmarks[start].y * canvas.height,
    );
    context.lineTo(
      landmarks[end].x * canvas.width,
      landmarks[end].y * canvas.height,
    );
    context.stroke();
  }

  context.shadowBlur = 5;
  for (const [index, point] of landmarks.entries()) {
    context.beginPath();
    context.arc(
      point.x * canvas.width,
      point.y * canvas.height,
      Math.max(2, canvas.width / 240),
      0,
      Math.PI * 2,
    );
    context.fillStyle = "#6ce9ff";
    context.fill();
  }
  if (palmPoint) {
    const x = (1 - palmPoint.x) * canvas.width;
    const y = palmPoint.y * canvas.height;
    const radius = Math.max(9, canvas.width / 52);
    context.beginPath();
    context.arc(x, y, radius + 5, 0, Math.PI * 2);
    context.strokeStyle = "rgba(133, 255, 247, 0.95)";
    context.lineWidth = Math.max(2, canvas.width / 260);
    context.shadowColor = "#45e4e8";
    context.shadowBlur = 22;
    context.stroke();
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = "#f8ffff";
    context.fill();
    context.shadowBlur = 0;
  }
  context.shadowBlur = 0;
}

export function prepareCanvas(canvas, video) {
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
}
