import "./style.css";
import { EditorManager } from "./001_Editors/001_EditorManager";
import { setupVideoComponents } from "./002_Parts/001_VideoSetup";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="canvas-container"></div>
`;

const editorManager = new EditorManager();

setupVideoComponents(editorManager);

(window as any).editorManager = editorManager;
