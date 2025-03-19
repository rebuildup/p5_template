import { BaseAnimation } from "./001_BaseAnimation";

export class CircleAnimation extends BaseAnimation {
  draw(frameIndex: number): void {
    const t = frameIndex / this.editorManager.getFrameCount();
    const x = this.p5.width * (0.5 + 0.4 * Math.cos(t * Math.PI * 2));
    const y = this.p5.height * (0.5 + 0.4 * Math.sin(t * Math.PI * 2));

    const r = 128 + 127 * Math.sin(t * Math.PI * 2);
    const g = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 2) / 3);
    const b = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 4) / 3);

    this.p5.noStroke();
    this.p5.fill(r, g, b);
    this.p5.ellipse(x, y, 100, 100);
  }

  drawToBuffer(buffer: any, frameIndex: number): void {
    const t = frameIndex / this.editorManager.getFrameCount();
    const x = buffer.width * (0.5 + 0.4 * Math.cos(t * Math.PI * 2));
    const y = buffer.height * (0.5 + 0.4 * Math.sin(t * Math.PI * 2));

    const r = 128 + 127 * Math.sin(t * Math.PI * 2);
    const g = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 2) / 3);
    const b = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 4) / 3);

    buffer.noStroke();
    buffer.fill(r, g, b);
    buffer.ellipse(x, y, 100, 100);
  }
}
