/**
 * EditorManager - Handles the editor state and user interactions
 * Manages playback state, keyframes, and encoding functionality
 */
export class EditorManager {
  private isPlaying: boolean = false;
  private currentFrame: number = 0;
  private keyframes: number[] = [0, 30, 60, 90]; // Default keyframes
  private currentKeyframeIndex: number = 0;
  private fps: number = 30;
  private frameCount: number = 120; // Total frames in the animation
  private isEncoding: boolean = false;

  // Status updates
  private statusElement: HTMLElement | null = null;

  constructor() {
    // Initialize status element
    this.statusElement = document.getElementById("status");

    // Set up keyboard listeners
    this.setupKeyboardListeners();
  }

  private setupKeyboardListeners(): void {
    document.addEventListener("keydown", (e) => {
      // Don't process keyboard shortcuts during encoding
      if (this.isEncoding) return;

      switch (e.key) {
        case " ": // Space - toggle play/pause
          this.togglePlayback();
          break;
        case "ArrowLeft": // Previous keyframe
          if (!this.isPlaying) {
            this.previousKeyframe();
          }
          break;
        case "ArrowRight": // Next keyframe
          if (!this.isPlaying) {
            this.nextKeyframe();
          }
          break;
        case "Enter": // Start encoding
          if (!this.isPlaying) {
            this.startEncoding();
          }
          break;
      }
    });
  }

  // Playback control methods
  public togglePlayback(): void {
    this.isPlaying = !this.isPlaying;
    this.updateStatus();
  }

  public isPlaybackActive(): boolean {
    return this.isPlaying;
  }

  // Frame management methods
  public incrementFrame(): void {
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

  // Keyframe navigation methods
  public previousKeyframe(): void {
    if (this.currentKeyframeIndex > 0) {
      this.currentKeyframeIndex--;
      this.setCurrentFrame(this.keyframes[this.currentKeyframeIndex]);
    }
    this.updateStatus();
  }

  public nextKeyframe(): void {
    if (this.currentKeyframeIndex < this.keyframes.length - 1) {
      this.currentKeyframeIndex++;
      this.setCurrentFrame(this.keyframes[this.currentKeyframeIndex]);
    }
    this.updateStatus();
  }

  public getCurrentKeyframe(): number {
    return this.keyframes[this.currentKeyframeIndex];
  }

  // Encoding methods
  public startEncoding(): void {
    this.isEncoding = true;
    this.updateStatus("Starting encoding...");
  }

  public isEncodingActive(): boolean {
    return this.isEncoding;
  }

  public setEncodingComplete(): void {
    this.isEncoding = false;
    this.updateStatus("Encoding complete!");
  }

  public setEncodingProgress(frame: number): void {
    const percentage = Math.floor((frame / this.frameCount) * 100);
    this.updateStatus(
      `Encoding: ${percentage}% (Frame: ${frame}/${this.frameCount})`
    );
    this.updatePageTitle(frame);
  }

  // Utility methods
  private updatePageTitle(frame: number = this.currentFrame): void {
    // Update the page title to show the current frame
    document.title = this.isEncoding
      ? `Encoding Frame: ${frame}`
      : `Frame: ${frame}`;
  }

  private updateStatus(message?: string): void {
    if (this.statusElement) {
      if (message) {
        this.statusElement.textContent = message;
      } else {
        // Default status based on current state
        if (this.isEncoding) {
          this.statusElement.textContent = "Encoding...";
        } else if (this.isPlaying) {
          this.statusElement.textContent = `Playing (Frame: ${this.currentFrame})`;
        } else {
          this.statusElement.textContent = `Paused (Frame: ${this.currentFrame})`;
        }
      }
    }
  }

  // Public methods for the frame count and FPS
  public getFrameCount(): number {
    return this.frameCount;
  }

  public getFPS(): number {
    return this.fps;
  }
}
