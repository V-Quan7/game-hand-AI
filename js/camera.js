export class Camera {
  constructor(videoElement, onEnded = () => {}) {
    this.video = videoElement;
    this.onEnded = onEnded;
    this.stream = null;
  }

  get isActive() {
    return Boolean(this.stream?.active);
  }

  async start() {
    if (this.isActive) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Trình duyệt không hỗ trợ webcam. Hãy dùng Chrome trên localhost hoặc HTTPS.");
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      this.stream = stream;
      this.video.srcObject = stream;
      await this.video.play();
      stream.getVideoTracks()[0]?.addEventListener(
        "ended",
        () => {
          if (this.stream !== stream) return;
          this.stop();
          this.onEnded();
        },
        { once: true },
      );
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.video.srcObject = null;
      throw this.#cameraError(error);
    }
  }

  stop() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.video.srcObject = null;
  }

  #cameraError(error) {
    if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
      return new Error("Bạn chưa cấp quyền webcam. Hãy cho phép camera trong trình duyệt rồi thử lại.");
    }
    if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
      return new Error("Không tìm thấy webcam trên thiết bị.");
    }
    if (error?.name === "NotReadableError" || error?.name === "TrackStartError") {
      return new Error("Webcam đang được ứng dụng khác sử dụng hoặc không thể khởi động.");
    }
    return new Error(`Không thể bật webcam: ${error?.message || "lỗi không xác định"}`);
  }
}
