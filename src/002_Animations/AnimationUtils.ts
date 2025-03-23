export class AnimationUtils {
  static colorCycle(
    t: number,
    phaseOffset: number = 0,
    amplitude: number = 127,
    center: number = 128
  ): number {
    return center + amplitude * Math.sin(t * Math.PI * 2 + phaseOffset);
  }

  static orbit(
    t: number,
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number = radiusX,
    phaseOffset: number = 0
  ): { x: number; y: number } {
    return {
      x: centerX + radiusX * Math.cos(t * Math.PI * 2 + phaseOffset),
      y: centerY + radiusY * Math.sin(t * Math.PI * 2 + phaseOffset),
    };
  }

  static easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeIn(t: number): number {
    return t * t;
  }

  static easeOut(t: number): number {
    return t * (2 - t);
  }

  static oscillate(
    t: number,
    frequency: number = 1,
    amplitude: number = 1
  ): number {
    return amplitude * Math.sin(t * Math.PI * 2 * frequency);
  }

  static regularPolygon(
    context: any,
    x: number,
    y: number,
    radius: number,
    sides: number,
    rotation: number = 0
  ): void {
    context.push();
    context.beginShape();
    for (let i = 0; i < sides; i++) {
      const angle = rotation + (i * Math.PI * 2) / sides;
      const vx = x + radius * Math.cos(angle);
      const vy = y + radius * Math.sin(angle);
      context.vertex(vx, vy);
    }
    context.endShape(context.CLOSE);
    context.pop();
  }

  static lerp(start: number, end: number, amt: number): number {
    return start + (end - start) * amt;
  }
}
