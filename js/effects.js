const COLORS = ["#54f4d0", "#78eaff", "#ffd166", "#a9f4b4", "#ffffff"];
const MAX_PARTICLES = 180;

export class Effects {
  constructor(canvas, stage) {
    this.canvas = canvas;
    this.stage = stage;
    this.context = canvas.getContext("2d");
    this.particles = [];
    this.frameId = 0;
    this.lastFrameAt = 0;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(stage);
    this.resize();
  }

  resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, this.stage.clientWidth);
    const height = Math.max(1, this.stage.clientHeight);
    if (this.canvas.width === Math.round(width * ratio) &&
        this.canvas.height === Math.round(height * ratio)) return;

    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  burst(point, count = 24) {
    if (this.reducedMotion || !point) return;
    this.resize();

    const width = this.stage.clientWidth;
    const height = this.stage.clientHeight;
    const originX = point.x * width;
    const originY = point.y * height;
    const available = Math.max(0, MAX_PARTICLES - this.particles.length);

    for (let index = 0; index < Math.min(count, available); index += 1) {
      const angle = (Math.PI * 2 * index) / count + Math.random() * 0.3;
      const speed = 55 + Math.random() * 150;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 35,
        age: 0,
        lifetime: 0.55 + Math.random() * 0.55,
        size: 2 + Math.random() * 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    this.lastFrameAt = performance.now();
    if (!this.frameId) this.frameId = requestAnimationFrame((time) => this.render(time));
  }

  render(time) {
    this.frameId = 0;
    const delta = Math.min((time - this.lastFrameAt) / 1000, 0.032);
    this.lastFrameAt = time;
    this.context.clearRect(0, 0, this.stage.clientWidth, this.stage.clientHeight);

    for (const particle of this.particles) {
      particle.age += delta;
      particle.vy += 190 * delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      const opacity = Math.max(0, 1 - particle.age / particle.lifetime);
      this.context.globalAlpha = opacity;
      this.context.fillStyle = particle.color;
      this.context.beginPath();
      this.context.arc(particle.x, particle.y, particle.size * opacity, 0, Math.PI * 2);
      this.context.fill();
    }

    this.context.globalAlpha = 1;
    this.particles = this.particles.filter((particle) => particle.age < particle.lifetime);
    if (this.particles.length) {
      this.frameId = requestAnimationFrame((nextTime) => this.render(nextTime));
    }
  }
}
