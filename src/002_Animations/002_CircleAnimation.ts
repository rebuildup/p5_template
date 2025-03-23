import { BaseAnimation, DrawingContext } from "./001_BaseAnimation";

export class CircleAnimation extends BaseAnimation {
  private circleSize: number = 360;
  private circleSpeed: number = 1;

  protected implementDrawing(
    context: DrawingContext,
    frameIndex: number
  ): void {
    const t = this.getNormalizedTime(frameIndex);
    const { x, y } = this.orbit(
      t * this.circleSpeed,
      context.width * 0.5,
      context.height * 0.5,
      context.width * 0.2
    );
    const r = this.colorCycle(t);
    const g = this.colorCycle(t, (Math.PI * 2) / 3);
    const b = this.colorCycle(t, (Math.PI * 4) / 3);
    const sizeMultiplier = 1 + 0.2 * this.oscillate(t * 4);
    const currentSize = this.circleSize * sizeMultiplier;
    context.noStroke();
    context.fill(r, g, b);
    context.ellipse(x, y, currentSize, currentSize);
    const centerSize = 30 + 15 * this.oscillate(t * 6);
    context.fill(255, 255, 255, 150);
    context.ellipse(
      context.width / 2,
      context.height / 2,
      centerSize,
      centerSize
    );
  }
}
