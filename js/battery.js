const SPAWN_X_RANGE = [0.12, 0.34];
const SPAWN_Y_RANGE = [0.2, 0.78];
const FLIGHT_BOUNDS = [0.12, 0.42];
const FLIGHT_SPEED = 0.07;

export class Battery {
  constructor(random = Math.random) {
    this.random = random;
    this.position = this.#randomPosition();
    this.isHeld = false;
    this.isDelivered = false;
    this.direction = 1;
  }

  pickUp() {
    if (this.isHeld) return false;
    this.isHeld = true;
    return true;
  }

  follow(position) {
    if (!this.isHeld || !position) return;
    this.position = { x: position.x, y: position.y };
  }

  fly(deltaSeconds) {
    if (this.isHeld || this.isDelivered || deltaSeconds <= 0) return;
    this.position.x += this.direction * FLIGHT_SPEED * deltaSeconds;
    if (this.position.x >= FLIGHT_BOUNDS[1]) {
      this.position.x = FLIGHT_BOUNDS[1];
      this.direction = -1;
    } else if (this.position.x <= FLIGHT_BOUNDS[0]) {
      this.position.x = FLIGHT_BOUNDS[0];
      this.direction = 1;
    }
  }

  drop(position) {
    if (!this.isHeld || !position) return false;
    this.position = { x: position.x, y: position.y };
    this.isHeld = false;
    return true;
  }

  deliver() {
    if (!this.isHeld || this.isDelivered) return false;
    this.isHeld = false;
    this.isDelivered = true;
    return true;
  }

  reset() {
    this.position = this.#randomPosition();
    this.isHeld = false;
    this.isDelivered = false;
    this.direction = this.random() < 0.5 ? -1 : 1;
  }

  #randomPosition() {
    return {
      x: this.#randomInRange(SPAWN_X_RANGE),
      y: this.#randomInRange(SPAWN_Y_RANGE),
    };
  }

  #randomInRange([min, max]) {
    return min + this.random() * (max - min);
  }
}
