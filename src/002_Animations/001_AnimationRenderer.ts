import { EditorManager } from "../001_Editors/001_EditorManager";
import { VideoEncoder } from "./002_VideoEncoder";
import { BaseAnimation } from "./003_BaseAnimation";
import { CircleAnimation } from "./004_CircleAnimation";
import { TriangleAnimation } from "./005_TriangleAnimation";

declare global {
  interface Window {
    p5: any;
    animationFunctions: any;
  }
}

export function setupAnimationRenderer(editorManager: EditorManager): void {
  new window.p5((p: any) => {
    const videoEncoder = new VideoEncoder(p, editorManager);

    // Fixed 2K resolution (2560x1440)
    const CANVAS_WIDTH = 2560;
    const CANVAS_HEIGHT = 1440;

    // Scale factor to fit the canvas in the window
    let scaleFactor = 1;

    // Available animations
    const animations: BaseAnimation[] = [
      new CircleAnimation(p, editorManager),
      new TriangleAnimation(p, editorManager),
    ];

    // Current animation index
    let currentAnimationIndex = 0;

    function calculateScaleFactor() {
      const margin = 20;
      const availableWidth = window.innerWidth - margin * 2;
      const availableHeight = window.innerHeight - margin * 2;

      const scaleX = availableWidth / CANVAS_WIDTH;
      const scaleY = availableHeight / CANVAS_HEIGHT;

      // Use the smaller scale to fit the canvas in the window
      scaleFactor = Math.min(scaleX, scaleY, 1); // Never scale up
    }

    p.setup = () => {
      calculateScaleFactor();
      const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
      canvas.parent("canvas-container");
      p.frameRate(editorManager.getFPS());
      p.colorMode(p.RGB);
      p.pixelDensity(1);

      // Apply CSS scale transform to the canvas element
      const canvasElement = document.querySelector("canvas");
      if (canvasElement) {
        canvasElement.style.transformOrigin = "top left";
        canvasElement.style.transform = `scale(${scaleFactor})`;
      }
    };

    p.windowResized = () => {
      calculateScaleFactor();
      // Update the scale transform
      const canvasElement = document.querySelector("canvas");
      if (canvasElement) {
        canvasElement.style.transform = `scale(${scaleFactor})`;
      }
    };

    p.keyPressed = () => {
      // Toggle between animations with Tab key
      if (p.keyCode === p.TAB && !editorManager.isEncodingActive()) {
        currentAnimationIndex = (currentAnimationIndex + 1) % animations.length;
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
      p.background(0, 0);
      p.fill(255);
      p.textSize(16);
      p.textAlign(p.LEFT, p.TOP);

      // Draw shadow for better visibility
      p.fill(0, 0, 0, 200);
      p.text(`Frame: ${frameIndex}`, 11, 11);

      // Draw text
      p.fill(255, 255, 255, 255);
      p.text(`Frame: ${frameIndex}`, 10, 10);

      // Draw current animation
      animations[currentAnimationIndex].draw(frameIndex);
    }

    async function handleEncoding(): Promise<void> {
      try {
        await videoEncoder.encodeFrames(animations[currentAnimationIndex]);
      } catch (error) {
        console.error("Encoding error:", error);
        editorManager.setEncodingComplete();
      }
    }

    // Expose animation functions globally for encoder to use
    window.animationFunctions = {
      drawCurrentAnimation: (buffer: any, frameIndex: number) => {
        animations[currentAnimationIndex].drawToBuffer(buffer, frameIndex);
      },
    };
  });
}
