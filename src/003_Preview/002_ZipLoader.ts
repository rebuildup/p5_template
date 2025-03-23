interface FrameImage {
  index: number;
  image: HTMLImageElement;
}

export class ZipLoader {
  constructor() {}

  public async loadZipFile(file: File): Promise<FrameImage[]> {
    console.log("Loading ZIP file:", file.name);

    try {
      // Use JSZip to extract the contents of the ZIP file
      const JSZip = (window as any).JSZip;
      const zip = new JSZip();

      // Read the ZIP file
      const zipData = await zip.loadAsync(file);

      console.log("ZIP file loaded, extracting PNG files...");

      // Filter and sort the PNG files
      const pngFiles = Object.keys(zipData.files)
        .filter((filename) => {
          const file = zipData.files[filename];
          return !file.dir && filename.toLowerCase().endsWith(".png");
        })
        .sort((a, b) => {
          // Sort by filename - assuming they are in the format frame_00001.png
          // Extract numbers from filenames for more accurate sorting
          const numA = this.extractFrameNumber(a);
          const numB = this.extractFrameNumber(b);
          return numA - numB;
        });

      console.log(`Found ${pngFiles.length} PNG files in ZIP`);

      if (pngFiles.length === 0) {
        throw new Error("No PNG files found in the ZIP file");
      }

      // Load images from the ZIP file
      const frameImages: FrameImage[] = [];

      // Process files in batches to avoid overwhelming the browser
      for (let i = 0; i < pngFiles.length; i++) {
        const filename = pngFiles[i];

        // Extract the file content as base64
        const data = await zipData.files[filename].async("base64");

        // Create an image from the base64 data
        const image = await this.loadImage(`data:image/png;base64,${data}`);

        // Add to frames array
        frameImages.push({
          index: i,
          image,
        });

        // Log progress for larger ZIP files
        if (i % 20 === 0 || i === pngFiles.length - 1) {
          console.log(`Loaded ${i + 1} of ${pngFiles.length} frames...`);
        }
      }

      console.log("All frames loaded successfully");
      return frameImages;
    } catch (error) {
      console.error("Error loading ZIP file:", error);
      throw error;
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  private extractFrameNumber(filename: string): number {
    // Try to extract a number from the filename
    const match = filename.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
    return 0;
  }
}
