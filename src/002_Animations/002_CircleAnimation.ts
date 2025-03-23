import { BaseAnimation, DrawingContext } from "./001_BaseAnimation";
import { AnimationUtils } from "./AnimationUtils";

export class CircleAnimation extends BaseAnimation {
  protected implementDrawing(
    context: DrawingContext,
    frameIndex: number
  ): void {
    const t = this.getNormalizedTime(frameIndex);

    const { x, y } = AnimationUtils.orbit(
      t,
      context.width * 0.5,
      context.height * 0.5,
      context.width * 0.4
    );

    const r = AnimationUtils.colorCycle(t);
    const g = AnimationUtils.colorCycle(t, (Math.PI * 2) / 3);
    const b = AnimationUtils.colorCycle(t, (Math.PI * 4) / 3);

    context.noStroke();
    context.fill(r, g, b);
    context.ellipse(x, y, 100, 100);
  }
}
