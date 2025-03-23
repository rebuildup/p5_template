import { EditorManager } from "../001_Editors/001_EditorManager";

interface FrameImage {
  index: number;
  image: HTMLImageElement;
}

export class PreviewRenderer {
  private frames: FrameImage[] = [];
  private currentFrameIndex: number = 0;
  private isPlaying: boolean = false;
  private lastFrameTime: number = 0;
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private editorManager: EditorManager;
  private controlsContainer: HTMLElement | null = null;
  private frameInfoElement: HTMLElement | null = null;

  // UI elements
  private playButton: HTMLButtonElement | null = null;
  private prevButton: HTMLButtonElement | null = null;
  private nextButton: HTMLButtonElement | null = null;

  constructor(editorManager: EditorManager) {
    this.editorManager = editorManager;
  }

  public initialize(container: HTMLElement): void {
    this.container = container;

    // Create canvas for rendering
    this.canvas = document.createElement("canvas");
    this.canvas.style.maxWidth = "90%";
    this.canvas.style.maxHeight = "80%";
    this.canvas.style.objectFit = "contain";
    this.ctx = this.canvas.getContext("2d");

    // Create controls container
    this.controlsContainer = document.createElement("div");
    this.controlsContainer.style.position = "absolute";
    this.controlsContainer.style.bottom = "20px";
    this.controlsContainer.style.left = "0";
    this.controlsContainer.style.width = "100%";
    this.controlsContainer.style.display = "flex";
    this.controlsContainer.style.justifyContent = "center";
    this.controlsContainer.style.alignItems = "center";
    this.controlsContainer.style.gap = "10px";

    // Create play/pause button
    this.playButton = this.createButton("▶️");
    this.prevButton = this.createButton("⏮️");
    this.nextButton = this.createButton("⏭️");

    // Create frame info element
    this.frameInfoElement = document.createElement("div");
    this.frameInfoElement.style.color = "white";
    this.frameInfoElement.style.fontSize = "16px";
    this.frameInfoElement.style.fontFamily = "monospace";
    this.frameInfoElement.style.margin = "0 15px";

    // Add buttons to controls
    this.controlsContainer.appendChild(this.prevButton);
    this.controlsContainer.appendChild(this.playButton);
    this.controlsContainer.appendChild(this.nextButton);
    this.controlsContainer.appendChild(this.frameInfoElement);

    // Add elements to container
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.position = "relative";

    container.appendChild(this.canvas);
    container.appendChild(this.controlsContainer);

    // Set up event listeners
    this.setupEventListeners();
  }

  private createButton(text: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.innerHTML = text;
    button.style.fontSize = "24px";
    button.style.padding = "10px 15px";
    button.style.background = "rgba(80, 80, 80, 0.7)";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";

    // Hover effect
    button.addEventListener("mouseover", () => {
      button.style.background = "rgba(120, 120, 120, 0.7)";
    });

    button.addEventListener("mouseout", () => {
      button.style.background = "rgba(80, 80, 80, 0.7)";
    });

    return button;
  }

  private setupEventListeners(): void {
    if (this.playButton) {
      this.playButton.addEventListener("click", () => {
        this.togglePlayback();
      });
    }

    if (this.prevButton) {
      this.prevButton.addEventListener("click", () => {
        this.previousFrame();
      });
    }

    if (this.nextButton) {
      this.nextButton.addEventListener("click", () => {
        this.nextFrame();
      });
    }
  }

  public setFrames(frames: FrameImage[]): void {
    this.frames = frames;
    this.currentFrameIndex = 0;

    // If we have frames, update canvas size based on the first frame
    if (frames.length > 0 && this.canvas) {
      const firstFrame = frames[0].image;
      this.canvas.width = firstFrame.width;
      this.canvas.height = firstFrame.height;

      // Render the first frame
      this.renderCurrentFrame();
    }
  }

  public hasFrames(): boolean {
    return this.frames.length > 0;
  }

  public startPlayback(): void {
    if (!this.isPlaying && this.frames.length > 0) {
      this.isPlaying = true;
      this.lastFrameTime = performance.now();

      if (this.playButton) {
        this.playButton.innerHTML = "⏸️";
      }

      this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  public stopPlayback(): void {
    this.isPlaying = false;

    if (this.playButton) {
      this.playButton.innerHTML = "▶️";
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private togglePlayback(): void {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  private previousFrame(): void {
    if (this.frames.length === 0) return;

    // Stop playback if it's active
    if (this.isPlaying) {
      this.stopPlayback();
    }

    this.currentFrameIndex =
      (this.currentFrameIndex - 1 + this.frames.length) % this.frames.length;
    this.renderCurrentFrame();
  }

  private nextFrame(): void {
    if (this.frames.length === 0) return;

    // Stop playback if it's active
    if (this.isPlaying) {
      this.stopPlayback();
    }

    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    this.renderCurrentFrame();
  }

  private animate(time: number): void {
    if (!this.isPlaying) return;

    const fps = this.editorManager.getFPS();
    const frameDuration = 1000 / fps;

    // Check if it's time to display the next frame
    if (time - this.lastFrameTime >= frameDuration) {
      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.frames.length;
      this.renderCurrentFrame();
      this.lastFrameTime = time;
    }

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  private renderCurrentFrame(): void {
    if (!this.ctx || !this.canvas || this.frames.length === 0) return;

    const frame = this.frames[this.currentFrameIndex];

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the current frame
    this.ctx.drawImage(frame.image, 0, 0);

    // Update frame info
    if (this.frameInfoElement) {
      this.frameInfoElement.textContent = `Frame: ${
        this.currentFrameIndex + 1
      } / ${this.frames.length}`;
    }
  }
}
