export enum ResourceType {
  IMAGE = "image",
  SOUND = "sound",
}

export interface ResourceMetadata {
  id: string;
  type: ResourceType;
  path: string;
  loaded: boolean;
  data?: any;
  loadAttempted?: boolean;
  error?: string;
}

export class ResourceManager {
  private resources: Map<string, ResourceMetadata> = new Map();
  private p5Instance: any;
  private static instance: ResourceManager | null = null;
  private loadingInProgress: boolean = false;
  private fallbackImageCache: any = null;
  private debugMode: boolean = false;
  private resourceAliases: Map<string, string> = new Map();

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  public initialize(p5Instance: any): void {
    this.p5Instance = p5Instance;
  }

  public registerImage(id: string, path: string): void {
    this.resources.set(id, {
      id,
      type: ResourceType.IMAGE,
      path,
      loaded: false,
      loadAttempted: false,
    });
  }

  public registerSound(id: string, path: string): void {
    this.resources.set(id, {
      id,
      type: ResourceType.SOUND,
      path,
      loaded: false,
      loadAttempted: false,
    });
  }

  public registerCustomResource(
    id: string,
    type: ResourceType,
    data: any
  ): void {
    this.resources.set(id, {
      id,
      type,
      path: "custom:resource",
      loaded: true,
      loadAttempted: true,
      data,
    });
  }

  public registerAlias(aliasId: string, targetId: string): void {
    this.resourceAliases.set(aliasId, targetId);
  }

  public async loadAllResources(): Promise<void> {
    if (this.loadingInProgress) {
      return;
    }

    this.loadingInProgress = true;
    const loadPromises: Promise<void>[] = [];

    await this.createFallbackImage();

    this.resources.forEach((resource) => {
      if (!resource.loaded && !resource.loadAttempted) {
        loadPromises.push(this.loadResource(resource));
      }
    });

    try {
      await Promise.all(loadPromises);
      this.updateAliases();
      if (this.debugMode) {
      }
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      this.loadingInProgress = false;
    }
  }

  private updateAliases(): void {
    const idPrefixes = new Map<string, string[]>();

    this.resources.forEach((resource, id) => {
      const parts = id.split("-");
      if (parts.length > 1) {
        const prefix = parts[0];
        if (!idPrefixes.has(prefix)) {
          idPrefixes.set(prefix, []);
        }
        idPrefixes.get(prefix)?.push(id);
      }
      if (1 != 1) console.error(resource);
    });

    idPrefixes.forEach((ids, prefix) => {
      const loadedId = ids.find((id) => this.resources.get(id)?.loaded);

      if (loadedId) {
        this.registerAlias(prefix, loadedId);
      } else if (ids.length > 0) {
        this.registerAlias(prefix, ids[0]);
      }
    });
  }

  public createPlaceholderAssets(): void {
    if (!this.p5Instance) {
      console.warn("Cannot create placeholder assets without p5 instance");
      return;
    }

    const imgSize = 200;
    const placeholderImg = this.p5Instance.createGraphics(imgSize, imgSize);
    placeholderImg.background(120, 80, 200);
    placeholderImg.noStroke();
    placeholderImg.fill(255);
    placeholderImg.textAlign(placeholderImg.CENTER, placeholderImg.CENTER);
    placeholderImg.textSize(24);
    placeholderImg.text("Placeholder Image", imgSize / 2, imgSize / 2 - 20);
    placeholderImg.textSize(14);
    placeholderImg.text("Generated by p5.js", imgSize / 2, imgSize / 2 + 20);
    placeholderImg.fill(255, 0, 0, 100);
    placeholderImg.rect(0, 0, imgSize, 20);
    placeholderImg.fill(0, 255, 0, 100);
    placeholderImg.rect(0, 20, imgSize, 20);
    placeholderImg.fill(0, 0, 255, 100);
    placeholderImg.rect(0, 40, imgSize, 20);

    this.resources.set("placeholder-image", {
      id: "placeholder-image",
      type: ResourceType.IMAGE,
      path: "generated:placeholder-image",
      loaded: true,
      data: placeholderImg,
    });

    try {
      if (this.p5Instance.SoundFile && this.p5Instance.Oscillator) {
        const placeholderSound = new this.p5Instance.Oscillator();
        placeholderSound.amp(0.5);
        placeholderSound.freq(440);
        placeholderSound.play = function () {
          this.start();
          setTimeout(() => this.stop(), 1000);
        };

        this.resources.set("placeholder-sound", {
          id: "placeholder-sound",
          type: ResourceType.SOUND,
          path: "generated:placeholder-sound",
          loaded: true,
          data: placeholderSound,
        });
      } else {
        console.warn(
          "p5.sound not fully available, skipping placeholder sound creation"
        );
      }
    } catch (e) {
      console.warn("Could not create placeholder sound:", e);
    }
  }

  private async createFallbackImage(): Promise<void> {
    if (!this.p5Instance) return;

    if (!this.fallbackImageCache) {
      const size = 100;
      const graphics = this.p5Instance.createGraphics(size, size);
      graphics.background(100, 100, 100, 100);
      graphics.stroke(200, 200, 200);
      graphics.strokeWeight(2);
      graphics.noFill();
      graphics.rect(0, 0, size, size);
      graphics.line(0, 0, size, size);
      graphics.line(size, 0, 0, size);
      graphics.fill(255);
      graphics.textAlign(graphics.CENTER, graphics.CENTER);
      graphics.textSize(10);
      graphics.text("NO IMAGE", size / 2, size / 2);

      this.fallbackImageCache = graphics;
    }
  }

  private async loadResource(resource: ResourceMetadata): Promise<void> {
    if (!this.p5Instance) {
      console.warn("p5 instance is not initialized");
      return Promise.resolve();
    }

    resource.loadAttempted = true;

    return new Promise<void>((resolve) => {
      try {
        if (resource.type === ResourceType.IMAGE) {
          this.p5Instance.loadImage(
            resource.path,
            (img: any) => {
              resource.data = img;
              resource.loaded = true;
              resolve();
            },
            (err: any) => {
              console.warn(
                `Failed to load image ${resource.id} from ${resource.path}`,
                err
              );
              resource.loaded = false;
              resource.error = err?.message || "Unknown error";
              resolve();
            }
          );
        } else if (resource.type === ResourceType.SOUND) {
          try {
            if (this.p5Instance.loadSound) {
              this.p5Instance.loadSound(
                resource.path,
                (sound: any) => {
                  resource.data = sound;
                  resource.loaded = true;
                  resolve();
                },
                (err: any) => {
                  console.warn(
                    `Failed to load sound ${resource.id} from ${resource.path}`,
                    err
                  );
                  resource.loaded = false;
                  resource.error = err?.message || "Unknown error";
                  resolve();
                }
              );
            } else {
              console.warn("p5.sound library is not loaded");
              resource.error = "p5.sound library not available";
              resolve();
            }
          } catch (e: any) {
            console.warn("Sound loading may not be supported:", e);
            resource.error = e?.message || "Sound loading not supported";
            resolve();
          }
        } else {
          resolve();
        }
      } catch (error: any) {
        console.error(`Error loading resource ${resource.id}:`, error);
        resource.error = error?.message || "Unknown error";
        resolve();
      }
    });
  }

  public getImage(id: string): any {
    const resolvedId = this.resolveAlias(id);

    const resource = this.resources.get(resolvedId);
    if (!resource) {
      console.warn(`Image ${id} is not registered`);
      return this.fallbackImageCache;
    }

    if (resource.type !== ResourceType.IMAGE) {
      console.warn(`Resource ${id} is not an image`);
      return this.fallbackImageCache;
    }

    if (!resource.loaded) {
      if (!resource.loadAttempted && this.p5Instance) {
        this.loadResource(resource);
      }
      return this.fallbackImageCache;
    }

    return resource.data;
  }

  public getSound(id: string): any {
    const resolvedId = this.resolveAlias(id);

    const resource = this.resources.get(resolvedId);
    if (!resource) {
      console.warn(`Sound ${id} is not registered`);
      return null;
    }

    if (resource.type !== ResourceType.SOUND) {
      console.warn(`Resource ${id} is not a sound`);
      return null;
    }

    if (!resource.loaded) {
      if (
        !resource.loadAttempted &&
        this.p5Instance &&
        this.p5Instance.loadSound
      ) {
        this.loadResource(resource);
      }
      return null;
    }

    return resource.data;
  }

  public getResource(id: string): ResourceMetadata | undefined {
    return this.resources.get(id);
  }

  private resolveAlias(id: string): string {
    let currentId = id;
    const visited = new Set<string>();

    while (this.resourceAliases.has(currentId) && !visited.has(currentId)) {
      visited.add(currentId);
      currentId = this.resourceAliases.get(currentId) || currentId;
    }

    return currentId;
  }

  public isResourceLoaded(id: string): boolean {
    const resolvedId = this.resolveAlias(id);
    const resource = this.resources.get(resolvedId);
    return resource ? resource.loaded : false;
  }

  public areAllResourcesLoaded(): boolean {
    let allLoaded = true;
    this.resources.forEach((resource) => {
      if (!resource.loaded) {
        allLoaded = false;
      }
    });
    return allLoaded;
  }

  public getResourceLoadingStatus(): {
    total: number;
    loaded: number;
    failed: number;
  } {
    let total = 0;
    let loaded = 0;
    let failed = 0;

    this.resources.forEach((resource) => {
      total++;
      if (resource.loaded) {
        loaded++;
      } else if (resource.loadAttempted) {
        failed++;
      }
    });

    return { total, loaded, failed };
  }
  public stopAllSounds(): void {
    this.resources.forEach((resource) => {
      if (
        resource.type === ResourceType.SOUND &&
        resource.loaded &&
        resource.data
      ) {
        try {
          const sound = resource.data;
          if (typeof sound.stop === "function") {
            sound.stop();
          } else if (typeof sound.pause === "function") {
            sound.pause();
          }
        } catch (e) {
          console.warn(`Failed to stop sound ${resource.id}:`, e);
        }
      }
    });
  }
}
