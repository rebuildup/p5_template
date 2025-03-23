import { ZipLoader } from "./002_ZipLoader";
import { PreviewRenderer } from "./003_PreviewRenderer";
import { EditorManager } from "../001_Editors/001_EditorManager";

export class PreviewManager {
  private isPreviewVisible: boolean = false;
  private zipLoader: ZipLoader;
  private previewRenderer: PreviewRenderer;
  private editorManager: EditorManager;
  private previewContainer: HTMLDivElement | null = null;

  constructor(editorManager: EditorManager) {
    this.editorManager = editorManager;
    this.zipLoader = new ZipLoader();
    this.previewRenderer = new PreviewRenderer(this.editorManager);

    this.setupPreviewContainer();
    this.setupKeyboardListeners();
    this.setupDropZone();
  }

  private setupPreviewContainer(): void {
    this.previewContainer = document.createElement("div");
    this.previewContainer.id = "preview-container";
    this.previewContainer.style.display = "none";
    this.previewContainer.style.position = "fixed";
    this.previewContainer.style.top = "0";
    this.previewContainer.style.left = "0";
    this.previewContainer.style.width = "100vw";
    this.previewContainer.style.height = "100vh";
    this.previewContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    this.previewContainer.style.zIndex = "1000";
    this.previewContainer.style.display = "none";

    document.body.appendChild(this.previewContainer);

    // Add the renderer's element to the container
    this.previewRenderer.initialize(this.previewContainer);
  }

  private setupKeyboardListeners(): void {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        this.showPreview();
      } else if (e.key === "ArrowDown") {
        this.hidePreview();
      }
    });
  }

  private setupDropZone(): void {
    // Setup the entire document as a drop zone
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
            const frames = await this.zipLoader.loadZipFile(file);

            if (frames.length > 0) {
              // Set the frames to the preview renderer
              this.previewRenderer.setFrames(frames);

              // Show the preview
              this.showPreview();
            }
          } catch (error) {
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

  public showPreview(): void {
    if (this.previewContainer && this.previewRenderer.hasFrames()) {
      this.isPreviewVisible = true;
      this.previewContainer.style.display = "flex";
      this.previewRenderer.startPlayback();
    }
  }

  public hidePreview(): void {
    if (this.previewContainer) {
      this.isPreviewVisible = false;
      this.previewContainer.style.display = "none";
      this.previewRenderer.stopPlayback();
    }
  }

  public isPreviewActive(): boolean {
    return this.isPreviewVisible;
  }
}
