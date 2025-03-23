export interface DrawingContext {
  width: number;
  height: number;
  noStroke: () => void;
  stroke: (...args: any[]) => void;
  strokeWeight: (weight: number) => void;
  fill: (...args: any[]) => void;
  ellipse: (x: number, y: number, w: number, h?: number) => void;
  rect: (x: number, y: number, w: number, h: number) => void;
  triangle: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ) => void;
  push: () => void;
  pop: () => void;
  background: (...args: any[]) => void;
  clear: () => void;
  imageMode: (mode: any) => void;
  image: (
    img: any,
    x: number,
    y: number,
    width?: number,
    height?: number
  ) => void;
  tint: (...args: any[]) => void;
  text: (str: string, x: number, y: number) => void;
  textAlign: (alignX: any, alignY?: any) => void;
  textSize: (size: number) => void;
  get: () => any;
}

export abstract class BaseAnimation {
  protected p5: any;
  protected editorManager: any;

  constructor(p5Instance: any, editorManager: any) {
    this.p5 = p5Instance;
    this.editorManager = editorManager;
  }

  draw(frameIndex: number): void {
    this.implementDrawing(this.p5, frameIndex);
  }

  drawToBuffer(buffer: any, frameIndex: number): void {
    this.implementDrawing(buffer, frameIndex);
  }

  protected getNormalizedTime(frameIndex: number): number {
    return frameIndex / this.editorManager.getFrameCount();
  }

  protected abstract implementDrawing(
    context: DrawingContext,
    frameIndex: number
  ): void;
}
