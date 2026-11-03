const SOUND_NOTES = {
  pickup: [440, 660],
  drop: [440, 330],
  success: [523, 659, 784, 1047],
};

export class AudioFeedback {
  constructor() {
    this.context = null;
    this.enabled = true;
  }

  async unlock() {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("Trình duyệt này không hỗ trợ phát âm thanh.");
    }

    this.context ??= new AudioContextClass();
    if (this.context.state !== "running") {
      await this.context.resume();
    }
    if (this.context.state !== "running") {
      throw new Error("Trình duyệt đang chặn âm thanh. Hãy cho phép âm thanh rồi thử lại.");
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  play(name) {
    if (!this.enabled || this.context?.state !== "running") return;
    const notes = SOUND_NOTES[name];
    if (!notes) return;

    const start = this.context.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const noteStart = start + index * 0.095;
      const duration = name === "success" ? 0.2 : 0.13;

      oscillator.type = name === "success" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + duration);
    });
  }
}
