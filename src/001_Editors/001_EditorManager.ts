import { ANIMATION_CONFIG } from "../config";

export class EditorManager {
  private isPlaying: boolean = false;
  private currentFrame: number = 0;
  private keyframes: number[] = [0, 30, 60, 90];
  private currentKeyframeIndex: number = 0;

  private fps: number = ANIMATION_CONFIG.FPS;
  private frameCount: number = ANIMATION_CONFIG.FRAME_COUNT;

  private isEncoding: boolean = false;

  public togglePlayback(): void {
    this.isPlaying = !this.isPlaying;
    this.updatePageTitle();
  }

  public stopPlayback(): void {
    this.isPlaying = false;
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
