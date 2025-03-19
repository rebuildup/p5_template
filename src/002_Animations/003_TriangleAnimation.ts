import { BaseAnimation } from "./001_BaseAnimation";

export class TriangleAnimation extends BaseAnimation {
  draw(frameIndex: number): void {
    const t = frameIndex / this.editorManager.getFrameCount();
    const centerX = this.p5.width / 2;
    const centerY = this.p5.height / 2;
    const shapes = 12;

    for (let i = 0; i < shapes; i++) {
      const angle = t * Math.PI * 2 + (i * Math.PI * 2) / shapes;
      const radius =
        this.p5.width * 0.2 +
        this.p5.width * 0.05 * Math.sin(t * Math.PI * 4 + i);

      const x1 = centerX + radius * Math.cos(angle);
      const y1 = centerY + radius * Math.sin(angle);

      const x2 = centerX + radius * Math.cos(angle + (Math.PI * 2) / 3);
      const y2 = centerY + radius * Math.sin(angle + (Math.PI * 2) / 3);

      const x3 = centerX + radius * Math.cos(angle + (Math.PI * 4) / 3);
      const y3 = centerY + radius * Math.sin(angle + (Math.PI * 4) / 3);

      this.p5.push();
      this.p5.noStroke();

      const r = Math.floor(127 + 127 * Math.sin(angle));
      const g = Math.floor(127 + 127 * Math.sin(angle + (Math.PI * 2) / 3));
      const b = Math.floor(127 + 127 * Math.sin(angle + (Math.PI * 4) / 3));

      this.p5.fill(r, g, b, 204);
      this.p5.triangle(x1, y1, x2, y2, x3, y3);
      this.p5.pop();
    }

    this.p5.push();
    this.p5.noStroke();
    this.p5.fill(255, 255, 255, 180);
    this.p5.ellipse(
      centerX,
      centerY,
      50 + 20 * Math.sin(t * Math.PI * 4),
      50 + 20 * Math.sin(t * Math.PI * 4)
    );
    this.p5.pop();
  }

  drawToBuffer(buffer: any, frameIndex: number): void {
    const t = frameIndex / this.editorManager.getFrameCount();
    const centerX = buffer.width / 2;
    const centerY = buffer.height / 2;
    const shapes = 12;

    for (let i = 0; i < shapes; i++) {
      const angle = t * Math.PI * 2 + (i * Math.PI * 2) / shapes;
      const radius =
        buffer.width * 0.2 +
        buffer.width * 0.05 * Math.sin(t * Math.PI * 4 + i);

      const x1 = centerX + radius * Math.cos(angle);
      const y1 = centerY + radius * Math.sin(angle);

      const x2 = centerX + radius * Math.cos(angle + (Math.PI * 2) / 3);
      const y2 = centerY + radius * Math.sin(angle + (Math.PI * 2) / 3);

      const x3 = centerX + radius * Math.cos(angle + (Math.PI * 4) / 3);
      const y3 = centerY + radius * Math.sin(angle + (Math.PI * 4) / 3);

      buffer.push();
      buffer.noStroke();

      const r = Math.floor(127 + 127 * Math.sin(angle));
      const g = Math.floor(127 + 127 * Math.sin(angle + (Math.PI * 2) / 3));
      const b = Math.floor(127 + 127 * Math.sin(angle + (Math.PI * 4) / 3));

      buffer.fill(r, g, b, 204);
      buffer.triangle(x1, y1, x2, y2, x3, y3);
      buffer.pop();
    }

    buffer.push();
    buffer.noStroke();
    buffer.fill(255, 255, 255, 180);
    buffer.ellipse(
      centerX,
      centerY,
      50 + 20 * Math.sin(t * Math.PI * 4),
      50 + 20 * Math.sin(t * Math.PI * 4)
    );
    buffer.pop();
  }
}
