import { EditorManager } from "./001_EditorManager";
import { VideoEncoder } from "./003_VideoEncoder";
import { BaseAnimation } from "../002_Animations/001_BaseAnimation";
import { CircleAnimation } from "../002_Animations/002_CircleAnimation";
import { TriangleAnimation } from "../002_Animations/003_TriangleAnimation";

declare global {
  interface Window {
    p5: any;
    animationFunctions: any;
  }
}

export function setupAnimationRenderer(editorManager: EditorManager): void {
  new window.p5((p: any) => {
    const videoEncoder = new VideoEncoder(p, editorManager);

    //Edit Here!
    const CANVAS_WIDTH = 2560;
    const CANVAS_HEIGHT = 1440;

    const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

    //Edit Here!
    const animations: BaseAnimation[] = [
      new CircleAnimation(p, editorManager),
      new TriangleAnimation(p, editorManager),
    ];

    // No longer needed to switch between animations
    // let currentAnimationIndex = 0;

    function resizeCanvas() {
      const margin = 16;
      const availableWidth = window.innerWidth - margin * 2;
      const availableHeight = window.innerHeight - margin * 2;

      let targetWidth = availableWidth;
      let targetHeight = targetWidth / ASPECT_RATIO;

      if (targetHeight > availableHeight) {
        targetHeight = availableHeight;
        targetWidth = targetHeight * ASPECT_RATIO;
      }

      const canvasElement = document.querySelector("canvas");
      if (canvasElement) {
        canvasElement.style.width = `${targetWidth}px`;
        canvasElement.style.height = `${targetHeight}px`;
      }
    }

    p.setup = () => {
      const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
      canvas.parent("canvas-container");

      p.frameRate(editorManager.getFPS());
      p.colorMode(p.RGB);
      p.pixelDensity(1);

      resizeCanvas();
    };

    p.windowResized = () => {
      resizeCanvas();
    };

    // TAB key is no longer needed to switch animations
    // (Keeping the function in case you want to add other keyboard shortcuts)
    p.keyPressed = () => {
      if (editorManager.isEncodingActive()) {
        p.preventDefault();
      }
    };

    p.draw = () => {
      if (editorManager.isEncodingActive()) {
        handleEncoding();
        return;
      }

      if (editorManager.isPlaybackActive()) {
        editorManager.incrementFrame();
      }

      drawFrame(editorManager.getCurrentFrame());
    };

    function drawFrame(frameIndex: number): void {
      p.clear();
      p.background(0, 0, 0, 0);

      // Draw all animations instead of just one
      animations.forEach((animation) => animation.draw(frameIndex));
    }

    async function handleEncoding(): Promise<void> {
      try {
        await videoEncoder.encodeFrames();
      } catch (error) {
        console.error("Encoding error:", error);
        editorManager.setEncodingComplete();
      }
    }

    window.animationFunctions = {
      drawCurrentAnimation: (buffer: any, frameIndex: number) => {
        // Draw all animations to buffer
        animations.forEach((animation) =>
          animation.drawToBuffer(buffer, frameIndex)
        );
      },
    };
  });
}
