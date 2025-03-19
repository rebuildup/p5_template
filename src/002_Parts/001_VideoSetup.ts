import { EditorManager } from "../001_Editors/001_EditorManager";
import { VideoEncoder } from "../002_Parts/002_VideoEncoder";

// Define the global p5 instance type
declare global {
  interface Window {
    p5: any;
  }
}

/**
 * Sets up the p5.js sketch and video components
 */
export function setupVideoComponents(editorManager: EditorManager): void {
  // Create a new p5 instance
  new window.p5((p: any) => {
    // Video encoder instance
    const videoEncoder = new VideoEncoder(p, editorManager);

    // Canvas dimensions
    const WIDTH = 640;
    const HEIGHT = 480;

    // Setup function - called once at the beginning
    p.setup = () => {
      const canvas = p.createCanvas(WIDTH, HEIGHT);
      canvas.parent("canvas-container");
      p.frameRate(editorManager.getFPS());
      p.colorMode(p.RGB);
    };

    // Draw function - called on every frame
    p.draw = () => {
      // If encoding is active, handle the encoding process
      if (editorManager.isEncodingActive()) {
        handleEncoding();
        return;
      }

      // If playing, increment the frame counter
      if (editorManager.isPlaybackActive()) {
        editorManager.incrementFrame();
      }

      // Draw the current frame
      drawFrame(editorManager.getCurrentFrame());
    };

    // Draw a specific frame of the animation
    function drawFrame(frameIndex: number): void {
      // Clear the background
      p.background(0);

      // Draw frame number for reference
      p.fill(255);
      p.textSize(16);
      p.textAlign(p.LEFT, p.TOP);
      p.text(`Frame: ${frameIndex}`, 10, 10);

      // Example animation - a moving circle with changing color
      const t = frameIndex / editorManager.getFrameCount();
      const x = p.width * (0.5 + 0.4 * Math.cos(t * Math.PI * 2));
      const y = p.height * (0.5 + 0.4 * Math.sin(t * Math.PI * 2));

      // Color changes over time
      const r = 128 + 127 * Math.sin(t * Math.PI * 2);
      const g = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 2) / 3);
      const b = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 4) / 3);

      // Draw the circle
      p.noStroke();
      p.fill(r, g, b);
      p.ellipse(x, y, 100, 100);

      // Draw progress bar at bottom
      p.noStroke();
      p.fill(100);
      p.rect(0, p.height - 20, p.width, 20);
      p.fill(255);
      p.rect(
        0,
        p.height - 20,
        p.width * (frameIndex / editorManager.getFrameCount()),
        20
      );
    }

    // Handle the encoding process
    async function handleEncoding(): Promise<void> {
      try {
        await videoEncoder.encodeFrames();
      } catch (error) {
        console.error("Encoding error:", error);
        editorManager.setEncodingComplete();
      }
    }
  });
}
