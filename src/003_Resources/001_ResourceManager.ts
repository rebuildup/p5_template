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
  private debugMode: boolean = true;

  // Add resource aliases to map alternate IDs to the main resource
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
    if (this.debugMode) {
      console.log(`Registered image: ${id} with path: ${path}`);
    }
  }

  public registerSound(id: string, path: string): void {
    this.resources.set(id, {
      id,
      type: ResourceType.SOUND,
      path,
      loaded: false,
      loadAttempted: false,
    });
    if (this.debugMode) {
      console.log(`Registered sound: ${id} with path: ${path}`);
    }
  }

  /**
   * Register a custom resource that's already loaded
   */
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
    if (this.debugMode) {
      console.log(`Registered custom ${type}: ${id}`);
    }
  }

  /**
   * Register an alias ID that points to another resource
   */
  public registerAlias(aliasId: string, targetId: string): void {
    this.resourceAliases.set(aliasId, targetId);
    if (this.debugMode) {
      console.log(`Registered alias: ${aliasId} -> ${targetId}`);
    }
  }

  public async loadAllResources(): Promise<void> {
    if (this.loadingInProgress) {
      console.log("Resource loading already in progress");
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
      console.log("All resources loaded successfully");

      // Update aliases after loading
      this.updateAliases();

      // Log status of all resources
      if (this.debugMode) {
        this.resources.forEach((resource) => {
          console.log(
            `Resource: ${resource.id} (${resource.type}) - ${
              resource.loaded ? "LOADED" : "FAILED"
            } ${resource.error ? "- Error: " + resource.error : ""}`
          );
        });
      }
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      this.loadingInProgress = false;
    }
  }

  /**
   * Updates resource aliases to point to successfully loaded resources
   */
  private updateAliases(): void {
    // For paths like "sample-image-/path/to/img.jpg", create alias to "sample-image"
    const idPrefixes = new Map<string, string[]>();

    // Group resources by prefix
    this.resources.forEach((resource, id) => {
      const parts = id.split("-");
      if (parts.length > 1) {
        const prefix = parts[0];
        if (!idPrefixes.has(prefix)) {
          idPrefixes.set(prefix, []);
        }
        idPrefixes.get(prefix)?.push(id);
      }
    });

    // For each prefix, find a loaded resource and create alias
    idPrefixes.forEach((ids, prefix) => {
      // First try to find a successfully loaded resource
      const loadedId = ids.find((id) => this.resources.get(id)?.loaded);

      if (loadedId) {
        this.registerAlias(prefix, loadedId);
        console.log(
          `Created alias from ${prefix} to ${loadedId} (loaded resource)`
        );
      } else if (ids.length > 0) {
        // If none are loaded, just use the first one
        this.registerAlias(prefix, ids[0]);
        console.log(
          `Created alias from ${prefix} to ${ids[0]} (no loaded resources available)`
        );
      }
    });
  }

  /**
   * Creates built-in placeholder assets for testing
   */
  public createPlaceholderAssets(): void {
    if (!this.p5Instance) {
      console.warn("Cannot create placeholder assets without p5 instance");
      return;
    }

    // Create a placeholder image
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

    // Add color bands to make it visually interesting
    placeholderImg.fill(255, 0, 0, 100);
    placeholderImg.rect(0, 0, imgSize, 20);
    placeholderImg.fill(0, 255, 0, 100);
    placeholderImg.rect(0, 20, imgSize, 20);
    placeholderImg.fill(0, 0, 255, 100);
    placeholderImg.rect(0, 40, imgSize, 20);

    // Add to resources
    this.resources.set("placeholder-image", {
      id: "placeholder-image",
      type: ResourceType.IMAGE,
      path: "generated:placeholder-image",
      loaded: true,
      data: placeholderImg,
    });

    console.log("Created placeholder image");

    // For sound, we'll create a simple oscillator if p5.sound is available
    try {
      if (this.p5Instance.SoundFile && this.p5Instance.Oscillator) {
        // Create a placeholder oscillator
        const placeholderSound = new this.p5Instance.Oscillator();
        placeholderSound.amp(0.5);
        placeholderSound.freq(440);

        // Override play method to stop after 1 second
        placeholderSound.play = function () {
          this.start();
          setTimeout(() => this.stop(), 1000);
        };

        // Add to resources
        this.resources.set("placeholder-sound", {
          id: "placeholder-sound",
          type: ResourceType.SOUND,
          path: "generated:placeholder-sound",
          loaded: true,
          data: placeholderSound,
        });

        console.log("Created placeholder sound");
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

    if (this.debugMode) {
      console.log(
        `Attempting to load ${resource.type}: ${resource.id} from ${resource.path}`
      );
    }

    return new Promise<void>((resolve) => {
      try {
        if (resource.type === ResourceType.IMAGE) {
          this.p5Instance.loadImage(
            resource.path,
            (img: any) => {
              resource.data = img;
              resource.loaded = true;
              if (this.debugMode)
                console.log(`Image ${resource.id} loaded successfully`);
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
                  if (this.debugMode)
                    console.log(`Sound ${resource.id} loaded successfully`);
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
                },
                (progress: any) => {
                  if (this.debugMode)
                    console.log(
                      `Loading progress for ${resource.id}:`,
                      progress
                    );
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
    // Try to resolve alias
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
    // Try to resolve alias
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

  /**
   * Gets a resource directly by ID
   */
  public getResource(id: string): ResourceMetadata | undefined {
    return this.resources.get(id);
  }

  /**
   * Resolves an alias to the target resource ID
   */
  private resolveAlias(id: string): string {
    let currentId = id;
    const visited = new Set<string>();

    // Follow aliases, but avoid circular references
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

    console.log("Stopped all sounds");
  }
}
