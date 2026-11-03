const SMOOTHING_FACTOR = 0.35;
const EDGE_MARGIN = 0.02;

export class HandController {
  constructor() {
    this.smoothedPoint = null;
  }

  update(palmCenter) {
    if (!palmCenter || !Number.isFinite(palmCenter.x) || !Number.isFinite(palmCenter.y)) {
      return null;
    }

    const target = {
      x: this.#clamp(1 - palmCenter.x),
      y: this.#clamp(palmCenter.y),
    };

    if (!this.smoothedPoint) {
      this.smoothedPoint = target;
    } else {
      this.smoothedPoint.x += (target.x - this.smoothedPoint.x) * SMOOTHING_FACTOR;
      this.smoothedPoint.y += (target.y - this.smoothedPoint.y) * SMOOTHING_FACTOR;
    }

    return { ...this.smoothedPoint };
  }

  reset() {
    this.smoothedPoint = null;
  }

  #clamp(value) {
    return Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, value));
  }
}
