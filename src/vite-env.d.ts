/// <reference types="vite/client" />

// Declare the global JSZip and p5 types
declare global {
  interface Window {
    JSZip: any;
    p5: any;
  }
}
