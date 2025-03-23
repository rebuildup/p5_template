import { BaseAnimation, DrawingContext } from "./001_BaseAnimation";

export class TriangleAnimation extends BaseAnimation {
  private shapes: number = 12;
  private baseRadius: number = 0.2;
  private pulseAmplitude: number = 0.05;
  private rotationSpeed: number = 1;
  private pulseFrequency: number = 4;

  protected implementDrawing(
    context: DrawingContext,
    frameIndex: number
  ): void {
    const t = this.getNormalizedTime(frameIndex);
    const centerX = context.width / 2;
    const centerY = context.height / 2;

    for (let i = 0; i < this.shapes; i++) {
      const angle =
        t * Math.PI * 2 * this.rotationSpeed + (i * Math.PI * 2) / this.shapes;
      const radius =
        context.width * this.baseRadius +
        context.width *
          this.pulseAmplitude *
          this.oscillate(t * this.pulseFrequency + i / this.shapes, 1);
      const x1 = centerX + radius * Math.cos(angle);
      const y1 = centerY + radius * Math.sin(angle);
      const x2 = centerX + radius * Math.cos(angle + (Math.PI * 2) / 3);
      const y2 = centerY + radius * Math.sin(angle + (Math.PI * 2) / 3);
      const x3 = centerX + radius * Math.cos(angle + (Math.PI * 4) / 3);
      const y3 = centerY + radius * Math.sin(angle + (Math.PI * 4) / 3);
      const r = Math.floor(this.colorCycle(angle / (Math.PI * 2)));
      const g = Math.floor(
        this.colorCycle(angle / (Math.PI * 2), (Math.PI * 2) / 3)
      );
      const b = Math.floor(
        this.colorCycle(angle / (Math.PI * 2), (Math.PI * 4) / 3)
      );

      context.push();
      context.noStroke();
      context.fill(r, g, b, 204);
      context.triangle(x1, y1, x2, y2, x3, y3);
      context.pop();
    }

    context.push();
    context.noStroke();
    context.fill(255, 255, 255, 180);

    const size = 50 + 20 * this.oscillate(t * 4);
    context.ellipse(centerX, centerY, size, size);
    context.pop();
  }
}
