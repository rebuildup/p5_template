export class EditorManager {
  private isPlaying: boolean = false;
  private currentFrame: number = 0;
  private keyframes: number[] = [0, 30, 60, 90];
  private currentKeyframeIndex: number = 0;
  private fps: number = 30;
  private frameCount: number = 120;
  private isEncoding: boolean = false;

  constructor() {
    this.setupKeyboardListeners();
  }

  private setupKeyboardListeners(): void {
    document.addEventListener("keydown", (e) => {
      if (this.isEncoding) return;

      switch (e.key) {
        case " ":
          this.togglePlayback();
          break;
        case "ArrowLeft":
          if (!this.isPlaying) {
            if (e.shiftKey) {
              this.previousKeyframe();
            } else {
              this.previousFrame();
            }
          }
          break;
        case "ArrowRight":
          if (!this.isPlaying) {
            if (e.shiftKey) {
              this.nextKeyframe();
            } else {
              this.nextFrame();
            }
          }
          break;
        case "Enter":
          if (!this.isPlaying) {
            this.startEncoding();
          }
          break;
      }
    });
  }

  public togglePlayback(): void {
    this.isPlaying = !this.isPlaying;
    this.updatePageTitle();
  }

  public isPlaybackActive(): boolean {
    return this.isPlaying;
  }

  public incrementFrame(): void {
    this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    this.updatePageTitle();
  }

  public previousFrame(): void {
    this.currentFrame =
      (this.currentFrame - 1 + this.frameCount) % this.frameCount;
    this.updatePageTitle();
  }

  public nextFrame(): void {
    this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    this.updatePageTitle();
  }

  public getCurrentFrame(): number {
    return this.currentFrame;
  }

  public setCurrentFrame(frame: number): void {
    this.currentFrame = Math.max(0, Math.min(frame, this.frameCount - 1));
    this.updatePageTitle();
  }

  public previousKeyframe(): void {
    if (this.currentKeyframeIndex > 0) {
      this.currentKeyframeIndex--;
      this.setCurrentFrame(this.keyframes[this.currentKeyframeIndex]);
    }
  }

  public nextKeyframe(): void {
    if (this.currentKeyframeIndex < this.keyframes.length - 1) {
      this.currentKeyframeIndex++;
      this.setCurrentFrame(this.keyframes[this.currentKeyframeIndex]);
    }
  }

  public getCurrentKeyframe(): number {
    return this.keyframes[this.currentKeyframeIndex];
  }

  public startEncoding(): void {
    this.isEncoding = true;
    console.log("Starting encoding...");
  }

  public isEncodingActive(): boolean {
    return this.isEncoding;
  }

  public setEncodingComplete(): void {
    this.isEncoding = false;
    console.log("Encoding complete!");
  }

  public setEncodingProgress(frame: number): void {
    const percentage = Math.floor((frame / this.frameCount) * 100);
    console.log(
      `Encoding: ${percentage}% (Frame: ${frame}/${this.frameCount})`
    );
    this.updatePageTitle(frame);
  }

  private updatePageTitle(frame: number = this.currentFrame): void {
    document.title = this.isEncoding
      ? `Encoding Frame: ${frame}`
      : `Frame: ${frame}`;
  }

  public getFrameCount(): number {
    return this.frameCount;
  }

  public getFPS(): number {
    return this.fps;
  }
}
