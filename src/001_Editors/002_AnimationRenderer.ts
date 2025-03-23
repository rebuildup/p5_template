import { EditorManager } from "./001_EditorManager";
import { VideoEncoder } from "./003_VideoEncoder";
import { BaseAnimation } from "../002_Animations/001_BaseAnimation";
import { CANVAS_CONFIG, createAnimations } from "../config";
import { ResourceManager } from "../003_Resources/001_ResourceManager";

interface FrameImage {
  index: number;
  image: any;
}

declare global {
  interface Window {
    p5: any;
    animationFunctions: any;
  }
}

export function setupAnimationRenderer(editorManager: EditorManager): void {
  new window.p5((p: any) => {
    const videoEncoder = new VideoEncoder(p, editorManager);
    const resourceManager = ResourceManager.getInstance();
    const CANVAS_WIDTH = CANVAS_CONFIG.WIDTH;
    const CANVAS_HEIGHT = CANVAS_CONFIG.HEIGHT;
    const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;
    let animations: BaseAnimation[] = [];
    let isPreviewMode = false;
    let previewFrames: FrameImage[] = [];
    let currentPreviewFrameIndex = 0;
    let isResourceLoading = true;
    let resourceLoadProgress = 0;

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

      resourceManager.initialize(p);
      animations = createAnimations(p, editorManager);

      loadResources();

      setupDropZone();
      document.addEventListener("keydown", handleKeyDown);
    };

    async function loadResources() {
      isResourceLoading = true;
      resourceLoadProgress = 0;

      try {
        // Start loading resources asynchronously
        const loadPromise = resourceManager.loadAllResources();

        // Update progress while loading
        const updateInterval = setInterval(() => {
          const status = resourceManager.getResourceLoadingStatus();
          if (status.total > 0) {
            // Calculate progress based on actual loaded + failed resources
            resourceLoadProgress =
              (status.loaded + status.failed) / status.total;
          }
        }, 100);

        // Wait for loading to complete
        await loadPromise;

        // Clean up interval
        clearInterval(updateInterval);

        // Make sure the progress is updated one final time
        const finalStatus = resourceManager.getResourceLoadingStatus();
        resourceLoadProgress =
          finalStatus.total > 0
            ? (finalStatus.loaded + finalStatus.failed) / finalStatus.total
            : 1;

        console.log("All resources loaded successfully");

        // Delay briefly to ensure the final loading state is visible
        await new Promise((resolve) => setTimeout(resolve, 500));

        isResourceLoading = false;
      } catch (error) {
        console.error("Error loading resources:", error);
        resourceLoadProgress = 1; // Force progress to complete
        isResourceLoading = false;
      }
    }

    p.windowResized = () => {
      resizeCanvas();
    };

    // Add these functions to your AnimationRenderer.ts file

    // Event handler for key down with sound management
    function handleKeyDown(e: KeyboardEvent) {
      if (editorManager.isEncodingActive() || isResourceLoading) {
        e.preventDefault();
        return;
      }

      const keyCode = e.keyCode;

      if (keyCode >= 48 && keyCode <= 57) {
        const digit = keyCode - 48;

        if (isPreviewMode && previewFrames.length > 0) {
          let targetIndex;

          if (digit === 0) {
            targetIndex = 0;
          } else {
            targetIndex = Math.floor(previewFrames.length * (digit / 10));
            targetIndex = Math.min(targetIndex, previewFrames.length - 1);
          }

          currentPreviewFrameIndex = targetIndex;
        } else if (!isPreviewMode) {
          const frameCount = editorManager.getFrameCount();

          let targetFrame;
          if (digit === 0) {
            targetFrame = 0;
          } else {
            targetFrame = Math.floor(frameCount * (digit / 10));
          }

          editorManager.setCurrentFrame(targetFrame);
        }

        e.preventDefault();
        return;
      }

      switch (keyCode) {
        case 32: // Space
          editorManager.togglePlayback();
          e.preventDefault();
          break;
        case 37: // Left arrow
          if (!editorManager.isPlaybackActive()) {
            if (isPreviewMode && previewFrames.length > 0) {
              currentPreviewFrameIndex =
                (currentPreviewFrameIndex - 1 + previewFrames.length) %
                previewFrames.length;
            } else if (!isPreviewMode) {
              if (e.shiftKey) {
                editorManager.previousKeyframe();
              } else {
                editorManager.previousFrame();
              }
            }
          }
          e.preventDefault();
          break;
        case 39: // Right arrow
          if (!editorManager.isPlaybackActive()) {
            if (isPreviewMode && previewFrames.length > 0) {
              currentPreviewFrameIndex =
                (currentPreviewFrameIndex + 1) % previewFrames.length;
            } else if (!isPreviewMode) {
              if (e.shiftKey) {
                editorManager.nextKeyframe();
              } else {
                editorManager.nextFrame();
              }
            }
          }
          e.preventDefault();
          break;
        case 38: // Up arrow - Enter preview mode
          if (!isPreviewMode) {
            isPreviewMode = true;
            editorManager.stopPlayback(); // This will trigger sound stopping via the event
          }
          e.preventDefault();
          break;
        case 40: // Down arrow - Exit preview mode
          if (isPreviewMode) {
            isPreviewMode = false;
            editorManager.stopPlayback();
          }
          e.preventDefault();
          break;
        case 13: // Enter
          if (!isPreviewMode && !editorManager.isPlaybackActive()) {
            editorManager.startEncoding();
          }
          e.preventDefault();
          break;
      }
    }

    p.draw = () => {
      if (isResourceLoading) {
        drawLoadingScreen();
        return;
      }

      if (editorManager.isEncodingActive()) {
        handleEncoding();
        return;
      }

      if (editorManager.isPlaybackActive()) {
        if (isPreviewMode && previewFrames.length > 0) {
          currentPreviewFrameIndex =
            (currentPreviewFrameIndex + 1) % previewFrames.length;
        } else if (!isPreviewMode) {
          editorManager.incrementFrame();
        }
      }

      if (
        isPreviewMode &&
        previewFrames.length > 0 &&
        (currentPreviewFrameIndex < 0 ||
          currentPreviewFrameIndex >= previewFrames.length)
      ) {
        currentPreviewFrameIndex = 0;
      }

      if (isPreviewMode) {
        drawPreviewFrame();
        document.title =
          previewFrames.length > 0
            ? `Preview: ${currentPreviewFrameIndex + 1}/${previewFrames.length}`
            : "No preview file";
      } else {
        drawFrame(editorManager.getCurrentFrame());
        document.title = `Frame: ${
          editorManager.getCurrentFrame() + 1
        }/${editorManager.getFrameCount()}`;
      }
    };

    function drawLoadingScreen(): void {
      p.background(20);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(32);
      p.text("Loading Resources...", p.width / 2, p.height / 2 - 60);

      // Get resource loading stats
      const status = resourceManager.getResourceLoadingStatus();

      // Show loading statistics
      p.textSize(16);
      p.text(
        `${status.loaded}/${status.total} resources loaded${
          status.failed > 0 ? ` (${status.failed} failed)` : ""
        }`,
        p.width / 2,
        p.height / 2 - 20
      );

      // Draw loading bar using the progress variable
      const barWidth = p.width * 0.6;
      const barHeight = 20;
      p.noStroke();
      p.fill(80);
      p.rect(
        p.width / 2 - barWidth / 2,
        p.height / 2 + 20,
        barWidth,
        barHeight
      );

      // Use resourceLoadProgress for animation while waiting for actual progress
      p.fill(100, 180, 255);
      p.rect(
        p.width / 2 - barWidth / 2,
        p.height / 2 + 20,
        barWidth * resourceLoadProgress, // Use the variable here
        barHeight
      );

      // Increment the progress for a loading animation effect
      resourceLoadProgress = Math.min(
        resourceLoadProgress + 0.005,
        status.total > 0 ? (status.loaded + status.failed) / status.total : 0.95
      );

      // If a resource fails to load, show additional info
      if (status.failed > 0) {
        p.fill(255, 100, 100);
        p.textSize(14);
        p.text(
          "Some resources failed to load. The application will continue with fallback assets.",
          p.width / 2,
          p.height / 2 + 60
        );
        p.text(
          "Check the browser console for details (Press F12 -> Console).",
          p.width / 2,
          p.height / 2 + 80
        );
      }
    }

    function drawFrame(frameIndex: number): void {
      try {
        p.clear();
        p.background(CANVAS_CONFIG.BACKGROUND_COLOR);
        animations.forEach((animation) => animation.draw(frameIndex));
      } catch (error) {
        console.error("Error in drawFrame:", error);
        p.clear();
        p.background(0, 0, 0, 0);
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text(
          "アニメーション描画中にエラーが発生しました。",
          p.width / 2,
          p.height / 2
        );
      }
    }

    function drawPreviewFrame(): void {
      p.clear();
      p.background(0, 0, 0, 0);
      if (previewFrames.length === 0) {
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(36);
        p.text("ファイルが選択されていません", p.width / 2, p.height / 2);
        p.textSize(26);
        p.fill(200);
        p.text(
          "出力ファイルと同じ形式のzipファイルをドラックランドドロップしてください",
          p.width / 2,
          p.height / 2 + 36
        );
        return;
      }
      try {
        if (
          currentPreviewFrameIndex < 0 ||
          currentPreviewFrameIndex >= previewFrames.length
        ) {
          currentPreviewFrameIndex = 0;
        }
        const frame = previewFrames[currentPreviewFrameIndex];
        if (frame && frame.image) {
          try {
            if (typeof frame.image.get === "function") {
              p.push();
              p.imageMode(p.CENTER);
              const aspectRatio = frame.image.width / frame.image.height;
              const canvasAspectRatio = p.width / p.height;
              let renderWidth, renderHeight;
              if (aspectRatio > canvasAspectRatio) {
                renderWidth = p.width * 0.9;
                renderHeight = renderWidth / aspectRatio;
              } else {
                renderHeight = p.height * 0.9;
                renderWidth = renderHeight * aspectRatio;
              }
              p.image(
                frame.image,
                p.width / 2,
                p.height / 2,
                renderWidth,
                renderHeight
              );
              p.pop();
            } else {
              throw new Error(
                "Invalid image object - not a p5.Graphics instance"
              );
            }
          } catch (renderError) {
            console.error("Error rendering specific image:", renderError);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(24);
            p.text(
              "画像の表示中にエラーが発生しました。",
              p.width / 2,
              p.height / 2
            );
          }
        } else {
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(24);
          p.text("画像を読み込み中...", p.width / 2, p.height / 2);
        }
      } catch (error) {
        console.error("Error in drawPreviewFrame:", error);
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text(
          "画像の表示中にエラーが発生しました。",
          p.width / 2,
          p.height / 2
        );
      }
    }

    async function handleEncoding(): Promise<void> {
      try {
        await videoEncoder.encodeFrames();
      } catch (error) {
        console.error("Encoding error:", error);
        editorManager.setEncodingComplete();
      }
    }

    function setupDropZone(): void {
      document.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.style.backgroundColor = "#343434";
      });

      document.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.style.backgroundColor = "#242424";
      });

      document.addEventListener("drop", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.style.backgroundColor = "#242424";
        if (
          e.dataTransfer &&
          e.dataTransfer.files &&
          e.dataTransfer.files.length > 0
        ) {
          const file = e.dataTransfer.files[0];
          if (file.name.endsWith(".zip")) {
            try {
              const frames = await loadZipFile(file);
              if (frames.length > 0) {
                previewFrames = frames;
                currentPreviewFrameIndex = 0;
                isPreviewMode = true;
                editorManager.stopPlayback();
              }
            } catch (error: any) {
              console.error("Error loading ZIP file:", error);
              alert(
                "Error loading ZIP file. Please make sure it contains PNG images."
              );
            }
          } else {
            alert("Please drop a ZIP file.");
          }
        }
      });
    }

    function loadImage(src: string): Promise<any> {
      return new Promise((resolve, reject) => {
        try {
          const img = new Image();
          img.onload = () => {
            try {
              const p5Img = p.createImg(src, "", "anonymous");
              p5Img.hide();
              const graphics = p.createGraphics(img.width, img.height);
              graphics.image(p5Img, 0, 0, img.width, img.height);
              resolve(graphics);
            } catch (e) {
              console.error("Error creating p5 image:", e);
              reject(e);
            }
          };
          img.onerror = (err) => {
            console.error("Failed to load image:", err);
            reject(new Error(`Failed to load image: ${err}`));
          };
          img.src = src;
        } catch (e) {
          console.error("Error in loadImage:", e);
          reject(e);
        }
      });
    }

    async function loadZipFile(file: File): Promise<FrameImage[]> {
      try {
        if (!(window as any).JSZip) {
          throw new Error(
            "JSZip is not loaded. Please check if jszip.min.js is included in your page."
          );
        }
        const JSZip = (window as any).JSZip;
        const zip = new JSZip();
        const zipData = await zip.loadAsync(file);
        const pngFiles = Object.keys(zipData.files)
          .filter((filename) => {
            const file = zipData.files[filename];
            return !file.dir && filename.toLowerCase().endsWith(".png");
          })
          .sort((a, b) => {
            const numA = extractFrameNumber(a);
            const numB = extractFrameNumber(b);
            return numA - numB;
          });
        if (pngFiles.length === 0) {
          throw new Error("No PNG files found in the ZIP file");
        }
        const frameImages: FrameImage[] = [];
        p.background(0);
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text("ZIP ファイルを読み込み中...", p.width / 2, p.height / 2);
        let firstImage = null;
        if (pngFiles.length > 0) {
          const firstFrame = pngFiles[0];
          try {
            const firstData = await zipData.files[firstFrame].async("base64");
            firstImage = await loadImage(`data:image/png;base64,${firstData}`);
            if (firstImage) {
              frameImages.push({
                index: 0,
                image: firstImage,
              });
              p.clear();
              p.background(0);
              p.fill(255);
              p.textAlign(p.CENTER, p.CENTER);
              p.textSize(24);
              p.text(
                `読み込み中... 1/${pngFiles.length}`,
                p.width / 2,
                p.height / 2 + 50
              );
              if (typeof firstImage.get === "function") {
                p.push();
                p.tint(255, 128);
                p.imageMode(p.CENTER);
                p.image(
                  firstImage,
                  p.width / 2,
                  p.height / 2,
                  p.width * 0.8,
                  p.height * 0.8
                );
                p.pop();
              }
            }
          } catch (error) {
            console.warn("Failed to load first frame:", error);
          }
        }
        for (let i = 1; i < pngFiles.length; i++) {
          const filename = pngFiles[i];
          try {
            const data = await zipData.files[filename].async("base64");
            const image = await loadImage(`data:image/png;base64,${data}`);
            frameImages.push({
              index: i,
              image,
            });
            if (i % 5 === 0 || i === pngFiles.length - 1) {
              const progressPercent = Math.floor((i / pngFiles.length) * 100);
              console.log(
                `Loaded ${i + 1} of ${
                  pngFiles.length
                } frames (${progressPercent}%)...`
              );
              p.clear();
              p.background(0);
              p.fill(255);
              p.textAlign(p.CENTER, p.CENTER);
              p.textSize(24);
              p.text(
                `読み込み中... ${i + 1}/${
                  pngFiles.length
                } (${progressPercent}%)`,
                p.width / 2,
                p.height / 2 + 50
              );
              p.noStroke();
              p.fill(100);
              p.rect(p.width * 0.2, p.height * 0.6, p.width * 0.6, 20);
              p.fill(255);
              p.rect(
                p.width * 0.2,
                p.height * 0.6,
                p.width * 0.6 * (progressPercent / 100),
                20
              );
              if (frameImages.length > 0) {
                const firstFrame = frameImages[0];
                if (
                  firstFrame &&
                  firstFrame.image &&
                  typeof firstFrame.image.get === "function"
                ) {
                  p.push();
                  p.tint(255, 100);
                  p.imageMode(p.CENTER);
                  p.image(
                    firstFrame.image,
                    p.width / 2,
                    p.height / 2,
                    p.width * 0.8,
                    p.height * 0.8
                  );
                  p.pop();
                }
              }
            }
          } catch (error) {
            console.warn(`Failed to load frame ${filename}:`, error);
          }
        }
        frameImages.sort((a, b) => a.index - b.index);
        console.log("All frames loaded successfully");
        return frameImages;
      } catch (error: any) {
        console.error("Error loading ZIP file:", error);
        p.clear();
        p.background(0);
        p.fill(255, 0, 0);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text(
          "ZIP ファイルの読み込みに失敗しました。",
          p.width / 2,
          p.height / 2
        );
        p.fill(255);
        p.textSize(16);
        p.text(error.toString(), p.width / 2, p.height / 2 + 40);
        throw error;
      }
    }

    function extractFrameNumber(filename: string): number {
      const match = filename.match(/\d+/);
      if (match) {
        return parseInt(match[0], 10);
      }
      return 0;
    }

    window.animationFunctions = {
      drawCurrentAnimation: (buffer: any, frameIndex: number) => {
        animations.forEach((animation) =>
          animation.drawToBuffer(buffer, frameIndex)
        );
      },
    };
  });
}
