export function isCursorTouchingBattery(
  cursor,
  battery,
  stage,
  reachPixels = 54,
) {
  if (!cursor || !battery || !stage?.width || !stage?.height) return false;

  const deltaX = (cursor.x - battery.x) * stage.width;
  const deltaY = (cursor.y - battery.y) * stage.height;
  return Math.hypot(deltaX, deltaY) <= reachPixels;
}

export function isPointInReceiver(cursor, receiverRect, stageRect, tolerance = 8) {
  if (!cursor || !receiverRect || !stageRect?.width || !stageRect?.height) {
    return false;
  }

  const x = cursor.x * stageRect.width + stageRect.left;
  const y = cursor.y * stageRect.height + stageRect.top;
  return (
    x >= receiverRect.left - tolerance &&
    x <= receiverRect.right + tolerance &&
    y >= receiverRect.top - tolerance &&
    y <= receiverRect.bottom + tolerance
  );
}
