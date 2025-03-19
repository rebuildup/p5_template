import { EditorManager } from "../001_Editors/001_EditorManager";

export class VideoEncoder {
  private p5: any;
  private editorManager: EditorManager;
  private buffer: any;
  private encodingFrame: number = 0;
  private zip: any;
  private encodingStartTime: number = 0;
  private useTransparency: boolean = false;

  constructor(p5Instance: any, editorManager: EditorManager) {
    this.p5 = p5Instance;
    this.editorManager = editorManager;
  }

  public async encodeFrames(): Promise<void> {
    if (this.encodingFrame === 0) {
      this.initializeEncoding();
      this.useTransparency = confirm(
        "Would you like to create transparent PNGs? Click OK for transparent, Cancel for normal."
      );
    }

    await this.processCurrentFrame();
    this.editorManager.setEncodingProgress(this.encodingFrame);

    if (this.encodingFrame >= this.editorManager.getFrameCount()) {
      await this.finalizeZip();
      return;
    }

    this.encodingFrame++;
  }

  private initializeEncoding(): void {
    this.buffer = this.p5.createGraphics(
      this.p5.width,
      this.p5.height,
      this.p5.P2D
    );
    this.buffer.pixelDensity(1);
    this.buffer.colorMode(this.p5.RGB, 255, 255, 255, 255);
    this.zip = new (window as any).JSZip();
    this.encodingStartTime = Date.now();
    this.encodingFrame = 0;
    console.log("Encoding started");
  }

  private async processCurrentFrame(): Promise<void> {
    if (this.useTransparency) {
      const animationFunctions = (window as any).animationFunctions;
      animationFunctions.drawTransparentAnimation(
        this.buffer,
        this.encodingFrame
      );
    } else {
      this.buffer.background(0);
      this.buffer.fill(255);
      this.buffer.textSize(16);
      this.buffer.textAlign(this.p5.LEFT, this.p5.TOP);
      this.buffer.text(`Frame: ${this.encodingFrame}`, 10, 10);
      this.drawOriginalToBuffer(this.encodingFrame);
    }

    const frameImage = this.buffer.get();
    const dataUrl = frameImage.canvas.toDataURL("image/png");
    const base64Data = dataUrl.split(",")[1];
    const filename = `frame_${this.encodingFrame
      .toString()
      .padStart(5, "0")}.png`;
    this.zip.file(filename, base64Data, { base64: true });
  }

  private drawOriginalToBuffer(frameIndex: number): void {
    const t = frameIndex / this.editorManager.getFrameCount();
    const x = this.buffer.width * (0.5 + 0.4 * Math.cos(t * Math.PI * 2));
    const y = this.buffer.height * (0.5 + 0.4 * Math.sin(t * Math.PI * 2));
    const r = 128 + 127 * Math.sin(t * Math.PI * 2);
    const g = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 2) / 3);
    const b = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 4) / 3);
    this.buffer.noStroke();
    this.buffer.fill(r, g, b);
    this.buffer.ellipse(x, y, 100, 100);
  }

  private async finalizeZip(): Promise<void> {
    try {
      const zipBlob = await this.zip.generateAsync({ type: "blob" });
      const date = new Date(this.encodingStartTime);
      const timestamp = `${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}_${date
        .getHours()
        .toString()
        .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
      const filename = `pvsf_frames_${
        this.useTransparency ? "transparent_" : ""
      }${timestamp}.zip`;
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      console.log("Encoding completed");
      this.editorManager.setEncodingComplete();
      this.encodingFrame = 0;
      this.zip = null;
      this.buffer = null;
    } catch (error) {
      console.error("Error finalizing zip:", error);
      throw error;
    }
  }
}
