import "./style.css";
import { EditorManager } from "./001_Editors/001_EditorManager";
import { setupVideoComponents } from "./002_Parts/001_VideoSetup";

// Initialize the app
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="container">
    <div id="canvas-container"></div>
    <div class="controls">
      <div class="control-instructions">
        <span>Space: Start/Pause</span>
        <span>←/→: Keyframe Navigation</span>
        <span>Enter: Encode to ZIP</span>
      </div>
      <div id="status">Ready (Frame: 0)</div>
    </div>
  </div>
`;

// Create editor manager to handle user interactions
const editorManager = new EditorManager();

// Set up the video components (p5 sketch and related functionality)
setupVideoComponents(editorManager);

// Expose editor manager for potential use in other modules or console debugging
(window as any).editorManager = editorManager;
