import "./style.css";
import { EditorManager } from "./001_Editors/001_EditorManager";
import { setupAnimationRenderer } from "./001_Editors/002_AnimationRenderer";
import "./config";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="canvas-container"></div>
`;

const editorManager = new EditorManager();
setupAnimationRenderer(editorManager);

(window as any).editorManager = editorManager;
