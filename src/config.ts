import { BaseAnimation } from "./002_Animations/001_BaseAnimation";
import { CircleAnimation } from "./002_Animations/002_CircleAnimation";
import { TriangleAnimation } from "./002_Animations/003_TriangleAnimation";
import { ImageAnimation } from "./002_Animations/004_ImageAnimation";
import { SoundAnimation } from "./002_Animations/005_SoundAnimation";
import { ResourceManager } from "./003_Resources/001_ResourceManager";

export const ANIMATION_CONFIG = {
  FPS: 60,
  FRAME_COUNT: 180,
  LOOP: true,
};

export const CANVAS_CONFIG = {
  WIDTH: 2560,
  HEIGHT: 1440,
  BACKGROUND_COLOR: [0, 0, 0, 0],
  get ASPECT_RATIO() {
    return this.WIDTH / this.HEIGHT;
  },
};

export const OUTPUT_CONFIG = {
  getOutputFilename: (timestamp: string) => `frames_${timestamp}.zip`,
  COMPRESSION_LEVEL: 5,
};

export const RESOURCE_CONFIG = {
  IMAGES: [
    {
      id: "sample-image",
      path: "./assets/images/NCG302.jpg",
    },
  ],
  SOUNDS: [
    {
      id: "sample-sound",
      path: "./assets/sounds/wip02-inst.mp3",
    },
  ],
};

export function initializeResources(): void {
  const resourceManager = ResourceManager.getInstance();
  RESOURCE_CONFIG.IMAGES.forEach((image) => {
    resourceManager.registerImage(image.id, image.path);
  });
  RESOURCE_CONFIG.SOUNDS.forEach((sound) => {
    resourceManager.registerSound(sound.id, sound.path);
  });
}

export const createAnimations = (
  p5: any,
  editorManager: any
): BaseAnimation[] => {
  const resourceManager = ResourceManager.getInstance();
  resourceManager.initialize(p5);
  initializeResources();
  return [
    new CircleAnimation(p5, editorManager),
    new TriangleAnimation(p5, editorManager),
    new ImageAnimation(p5, editorManager),
    new SoundAnimation(p5, editorManager),
  ];
};
