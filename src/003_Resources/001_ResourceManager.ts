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
}

export class ResourceManager {
  private resources: Map<string, ResourceMetadata> = new Map();
  private p5Instance: any;
  private static instance: ResourceManager | null = null;
  private loadingInProgress: boolean = false;
  private fallbackImageCache: any = null;

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

  public async loadAllResources(): Promise<void> {
    if (this.loadingInProgress) {
      console.log("リソースのロードが既に進行中です");
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
      console.log("すべてのリソースが読み込まれました");
    } catch (error) {
      console.error("リソースのロード中にエラーが発生しました:", error);
    } finally {
      this.loadingInProgress = false;
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
      console.warn("p5インスタンスが初期化されていません");
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
            () => {
              console.warn(`画像 ${resource.id} の読み込みに失敗しました`);
              resource.loaded = false;
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
                () => {
                  console.warn(`音声 ${resource.id} の読み込みに失敗しました`);
                  resource.loaded = false;
                  resolve();
                }
              );
            } else {
              console.warn("p5.sound ライブラリが読み込まれていません");
              resolve();
            }
          } catch (e) {
            console.warn("音声のロードがサポートされていない可能性があります");
            resolve();
          }
        } else {
          resolve();
        }
      } catch (error) {
        console.error(
          `リソース ${resource.id} の読み込み中にエラーが発生しました:`,
          error
        );
        resolve();
      }
    });
  }

  public getImage(id: string): any {
    const resource = this.resources.get(id);
    if (!resource) {
      console.warn(`画像 ${id} が登録されていません`);
      return this.fallbackImageCache;
    }

    if (resource.type !== ResourceType.IMAGE) {
      console.warn(`リソース ${id} は画像ではありません`);
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
    const resource = this.resources.get(id);
    if (!resource) {
      console.warn(`音声 ${id} が登録されていません`);
      return null;
    }

    if (resource.type !== ResourceType.SOUND) {
      console.warn(`リソース ${id} は音声ではありません`);
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

  public isResourceLoaded(id: string): boolean {
    const resource = this.resources.get(id);
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
}
