export class Robot {
  constructor() {
    this.isPowered = false;
    this.charge = 0;
  }

  receiveBattery() {
    if (this.charge >= 100) {
      if (!this.isPowered) return false;
      this.charge = 0;
      this.isPowered = false;
    }
    this.charge = Math.min(100, this.charge + 20);
    return true;
  }

  activate() {
    if (this.charge < 100) return false;
    this.isPowered = true;
    return true;
  }

  reset() {
    this.isPowered = false;
    this.charge = 0;
  }

  get energy() {
    return this.charge;
  }
}
