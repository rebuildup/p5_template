import { BaseAnimation, DrawingContext } from "./001_BaseAnimation";

export class ImageAnimation extends BaseAnimation {
  private imageId: string = "sample-image";
  private rotationSpeed: number = 1;
  private orbitRadius: number = 0.2;
  private imageSizeRatio: number = 0.3;
  private pulseAmplitude: number = 0.1;
  private pulseFrequency: number = 2;

  protected implementDrawing(
    context: DrawingContext,
    frameIndex: number
  ): void {
    const t = this.getNormalizedTime(frameIndex);
    const img = this.getImage(this.imageId);
    if (!img) {
      this.drawPlaceholder(context, t);
      return;
    }

    const centerX = context.width / 2;
    const centerY = context.height / 2;
    const { x, y } = this.orbit(
      t * this.rotationSpeed,
      centerX,
      centerY,
      context.width * this.orbitRadius
    );

    const sizeMultiplier =
      1 + this.pulseAmplitude * this.oscillate(t * this.pulseFrequency);
    const imageSize = context.width * this.imageSizeRatio * sizeMultiplier;
    const rotation = t * Math.PI * 2 * this.rotationSpeed;
    const alpha = 255 * (0.7 + 0.3 * this.oscillate(t * 3));

    context.push();
    context.imageMode(context.CENTER);
    context.translate(x, y);
    context.rotate(rotation);
    context.tint(255, 255, 255, alpha);
    context.image(img, 0, 0, imageSize, imageSize);
    context.pop();
  }

  private drawPlaceholder(context: DrawingContext, t: number): void {
    const centerX = context.width / 2;
    const centerY = context.height / 2;
    const size = context.width * this.imageSizeRatio;
    const pulseEffect = this.oscillate(t * 3, 1, 0.1);
    const currentSize = size * (1 + pulseEffect);

    context.push();
    context.stroke(200, 200, 200);
    context.strokeWeight(2);
    context.fill(100, 100, 100, 100);
    context.rect(
      centerX - currentSize / 2,
      centerY - currentSize / 2,
      currentSize,
      currentSize
    );

    context.fill(255);
    context.textAlign(context.CENTER);
    context.textSize(16);
    context.text("画像が読み込まれていません", centerX, centerY);
    context.textSize(12);
    context.text("画像ID: " + this.imageId, centerX, centerY + 25);
    context.pop();
  }
}
