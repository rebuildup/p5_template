import { EditorManager } from "../001_Editors/001_EditorManager";
import { VideoEncoder } from "../002_Parts/002_VideoEncoder";

declare global {
  interface Window {
    p5: any;
  }
}

export function setupVideoComponents(editorManager: EditorManager): void {
  new window.p5((p: any) => {
    const videoEncoder = new VideoEncoder(p, editorManager);

    const BASE_WIDTH = 1280;
    const BASE_HEIGHT = 720;
    const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

    let canvasWidth: number;
    let canvasHeight: number;

    function calculateCanvasDimensions() {
      const margin = 20;
      const availableWidth = window.innerWidth - margin * 2;
      const availableHeight = window.innerHeight - margin * 2;

      canvasWidth = Math.min(availableWidth, 1920);
      canvasHeight = Math.round(canvasWidth / ASPECT_RATIO);

      if (canvasHeight > availableHeight) {
        canvasHeight = availableHeight;
        canvasWidth = Math.round(canvasHeight * ASPECT_RATIO);
      }
    }

    p.setup = () => {
      calculateCanvasDimensions();
      const canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent("canvas-container");
      p.frameRate(editorManager.getFPS());
      p.colorMode(p.RGB);
      p.pixelDensity(1);
    };

    p.windowResized = () => {
      calculateCanvasDimensions();
      p.resizeCanvas(canvasWidth, canvasHeight);
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
      p.background(0);
      p.fill(255);
      p.textSize(16);
      p.textAlign(p.LEFT, p.TOP);
      p.text(`Frame: ${frameIndex}`, 10, 10);
      drawOriginalAnimation(frameIndex);
    }

    function drawOriginalAnimation(frameIndex: number): void {
      const t = frameIndex / editorManager.getFrameCount();
      const x = p.width * (0.5 + 0.4 * Math.cos(t * Math.PI * 2));
      const y = p.height * (0.5 + 0.4 * Math.sin(t * Math.PI * 2));

      const r = 128 + 127 * Math.sin(t * Math.PI * 2);
      const g = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 2) / 3);
      const b = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 4) / 3);

      p.noStroke();
      p.fill(r, g, b);
      p.ellipse(x, y, 100, 100);
    }

    function drawTransparentAnimation(buffer: any, frameIndex: number): void {
      buffer.clear();

      buffer.push();
      buffer.fill(0, 0, 0, 200);
      buffer.textSize(16);
      buffer.textAlign(buffer.LEFT, buffer.TOP);
      buffer.text(`Frame: ${frameIndex}`, 11, 11);
      buffer.fill(255, 255, 255, 255);
      buffer.text(`Frame: ${frameIndex}`, 10, 10);
      buffer.pop();

      const t = frameIndex / editorManager.getFrameCount();
      const centerX = buffer.width / 2;
      const centerY = buffer.height / 2;
      const shapes = 12;

      for (let i = 0; i < shapes; i++) {
        const angle = t * Math.PI * 2 + (i * Math.PI * 2) / shapes;
        const radius =
          buffer.width * 0.2 +
          buffer.width * 0.05 * Math.sin(t * Math.PI * 4 + i);

        const x1 = centerX + radius * Math.cos(angle);
        const y1 = centerY + radius * Math.sin(angle);

        const x2 = centerX + radius * Math.cos(angle + (Math.PI * 2) / 3);
        const y2 = centerY + radius * Math.sin(angle + (Math.PI * 2) / 3);

        const x3 = centerX + radius * Math.cos(angle + (Math.PI * 4) / 3);
        const y3 = centerY + radius * Math.sin(angle + (Math.PI * 4) / 3);

        const hue = ((i / shapes) * 360 + t * 360) % 360;

        buffer.push();
        buffer.noStroke();

        const r = Math.floor(127 + 127 * Math.sin(angle));
        const g = Math.floor(127 + 127 * Math.sin(angle + (Math.PI * 2) / 3));
        const b = Math.floor(127 + 127 * Math.sin(angle + (Math.PI * 4) / 3));

        buffer.fill(r, g, b, 204);

        buffer.triangle(x1, y1, x2, y2, x3, y3);
        buffer.pop();
      }

      buffer.push();
      buffer.noStroke();
      buffer.fill(255, 255, 255, 180);
      buffer.ellipse(
        centerX,
        centerY,
        50 + 20 * Math.sin(t * Math.PI * 4),
        50 + 20 * Math.sin(t * Math.PI * 4)
      );
      buffer.pop();
    }

    async function handleEncoding(): Promise<void> {
      try {
        await videoEncoder.encodeFrames();
      } catch (error) {
        console.error("Encoding error:", error);
        editorManager.setEncodingComplete();
      }
    }

    (window as any).animationFunctions = {
      drawOriginalAnimation,
      drawTransparentAnimation,
    };
  });
}
