import { EditorManager } from "../001_Editors/001_EditorManager";

/**
 * VideoEncoder - Handles encoding frames to PNG and creating a zip file
 */
export class VideoEncoder {
  private p5: any;
  private editorManager: EditorManager;
  private buffer: any; // p5.Graphics buffer for frame rendering
  private encodingFrame: number = 0;
  private zip: any; // JSZip instance
  private encodingStartTime: number = 0;

  constructor(p5Instance: any, editorManager: EditorManager) {
    this.p5 = p5Instance;
    this.editorManager = editorManager;
  }

  /**
   * Encode all frames to a zip file
   */
  public async encodeFrames(): Promise<void> {
    // If we're already in the middle of encoding, continue from where we left off
    if (this.encodingFrame === 0) {
      // First time starting the encoding process
      this.initializeEncoding();
    }

    // Process the current frame
    await this.processCurrentFrame();

    // Update the encoding progress
    this.editorManager.setEncodingProgress(this.encodingFrame);

    // Check if we've finished encoding all frames
    if (this.encodingFrame >= this.editorManager.getFrameCount()) {
      await this.finalizeZip();
      return;
    }

    // Increment the frame counter for the next frame
    this.encodingFrame++;
  }

  /**
   * Initialize the encoding process
   */
  private initializeEncoding(): void {
    // Create an off-screen buffer with the same dimensions as the canvas
    this.buffer = this.p5.createGraphics(this.p5.width, this.p5.height);

    // Create a new JSZip instance
    this.zip = new window.JSZip();

    // Record the start time for naming the zip file
    this.encodingStartTime = Date.now();

    // Reset the encoding frame counter
    this.encodingFrame = 0;

    console.log("Encoding started");
  }

  /**
   * Process the current frame - render it and add it to the zip
   */
  private async processCurrentFrame(): Promise<void> {
    // Clear the buffer
    this.buffer.clear();

    // Draw the current frame to the buffer
    this.drawFrameToBuffer(this.encodingFrame);

    // Get the frame as a PNG
    const frameImage = this.buffer.get();

    // Convert the p5.Image to a data URL
    const dataUrl = frameImage.canvas.toDataURL("image/png");

    // Add the frame to the zip
    // Convert data URL to base64 string (remove the prefix)
    const base64Data = dataUrl.split(",")[1];

    // Add it to the zip with a sequential filename
    const filename = `frame_${this.encodingFrame
      .toString()
      .padStart(5, "0")}.png`;
    this.zip.file(filename, base64Data, { base64: true });
  }

  /**
   * Draw a specific frame to the off-screen buffer
   */
  private drawFrameToBuffer(frameIndex: number): void {
    // This is a simplified version of the drawing code from VideoSetup.ts
    // You would typically call the same drawing function from both places

    // Clear the background
    this.buffer.background(0);

    // Draw frame number for reference
    this.buffer.fill(255);
    this.buffer.textSize(16);
    this.buffer.textAlign(this.p5.LEFT, this.p5.TOP);
    this.buffer.text(`Frame: ${frameIndex}`, 10, 10);

    // Example animation - a moving circle with changing color
    const t = frameIndex / this.editorManager.getFrameCount();
    const x = this.buffer.width * (0.5 + 0.4 * Math.cos(t * Math.PI * 2));
    const y = this.buffer.height * (0.5 + 0.4 * Math.sin(t * Math.PI * 2));

    // Color changes over time
    const r = 128 + 127 * Math.sin(t * Math.PI * 2);
    const g = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 2) / 3);
    const b = 128 + 127 * Math.sin(t * Math.PI * 2 + (Math.PI * 4) / 3);

    // Draw the circle
    this.buffer.noStroke();
    this.buffer.fill(r, g, b);
    this.buffer.ellipse(x, y, 100, 100);
  }

  /**
   * Finalize the zip file and create a download link
   */
  private async finalizeZip(): Promise<void> {
    try {
      // Generate the zip file
      const zipBlob = await this.zip.generateAsync({ type: "blob" });

      // Create a timestamp string for the filename
      const date = new Date(this.encodingStartTime);
      const timestamp = `${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}_${date
        .getHours()
        .toString()
        .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
      const filename = `pvsf_frames_${timestamp}.zip`;

      // Create a download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      // Add the link to the page
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      console.log("Encoding completed");

      // Update the editor state
      this.editorManager.setEncodingComplete();

      // Reset the encoding state
      this.encodingFrame = 0;
      this.zip = null;
      this.buffer = null;
    } catch (error) {
      console.error("Error finalizing zip:", error);
      throw error;
    }
  }
}
