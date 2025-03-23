import "./style.css";
import { EditorManager } from "./001_Editors/001_EditorManager";
import { setupAnimationRenderer } from "./001_Editors/002_AnimationRenderer";
import { PreviewManager } from "./003_Preview/001_PreviewManager";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="canvas-container"></div>
  <div id="instructions">
    <p>Space: Play/Pause | Arrow Left/Right: Navigate Frames | Tab: Switch Animation</p>
    <p>Enter: Export Frames | Arrow Up/Down: Show/Hide Preview</p>
    <p>Drop a ZIP file with PNG frames to preview it</p>
  </div>
`;

const editorManager = new EditorManager();
setupAnimationRenderer(editorManager);

// Initialize the preview manager
const previewManager = new PreviewManager(editorManager);

// Expose to window for debugging
(window as any).editorManager = editorManager;
(window as any).previewManager = previewManager;
