export abstract class BaseAnimation {
  protected p5: any;
  protected editorManager: any;

  constructor(p5Instance: any, editorManager: any) {
    this.p5 = p5Instance;
    this.editorManager = editorManager;
  }

  abstract draw(frameIndex: number): void;
  abstract drawToBuffer(buffer: any, frameIndex: number): void;
}
