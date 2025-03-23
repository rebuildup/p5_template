import "./style.css";
import { EditorManager } from "./001_Editors/001_EditorManager";
import { setupAnimationRenderer } from "./001_Editors/002_AnimationRenderer";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="canvas-container"></div>
`;

const editorManager = new EditorManager();
setupAnimationRenderer(editorManager);

// Expose to window for debugging
(window as any).editorManager = editorManager;
