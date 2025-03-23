export const ANIMATION_CONFIG = {
  FPS: 60,
  FRAME_COUNT: 180,
};

export const CANVAS_CONFIG = {
  WIDTH: 2560,
  HEIGHT: 1440,
  get ASPECT_RATIO() {
    return this.WIDTH / this.HEIGHT;
  },
};

export const OUTPUT_CONFIG = {
  getOutputFilename: (timestamp: string) => `frames_${timestamp}.zip`,
};

import { BaseAnimation } from "./002_Animations/001_BaseAnimation";
import { CircleAnimation } from "./002_Animations/002_CircleAnimation";
import { TriangleAnimation } from "./002_Animations/003_TriangleAnimation";

export const createAnimations = (
  p5: any,
  editorManager: any
): BaseAnimation[] => {
  return [
    new CircleAnimation(p5, editorManager),
    new TriangleAnimation(p5, editorManager),
  ];
};
