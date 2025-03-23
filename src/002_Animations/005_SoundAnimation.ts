import { BaseAnimation, DrawingContext } from "./001_BaseAnimation";

export class SoundAnimation extends BaseAnimation {
  private soundId: string = "sample-sound";
  private circleCount: number = 20;
  private maxRadius: number = 0.4;
  private minRadius: number = 0.05;
  private soundPlayed: boolean = false;
  private soundTriggerFrame: number = 30;
  private soundWaveSimulation: number[] = [];
  private wavePointCount: number = 100;
  private activeSoundInstance: any = null;

  constructor(p5Instance: any, editorManager: any) {
    super(p5Instance, editorManager);

    for (let i = 0; i < this.wavePointCount; i++) {
      this.soundWaveSimulation.push(Math.random() * 0.5);
    }

    // Subscribe to playback change events to stop sound when playback stops
    editorManager.setEvents({
      ...editorManager.events,
      onPlaybackChange: (isPlaying: boolean) => {
        if (!isPlaying) {
          this.stopSound();
        }
      },
      onFrameChange: (frame: number) => {
        // Reset sound when frames are manually changed
        if (frame === 0 || frame >= editorManager.getFrameCount() - 1) {
          this.stopSound();
        }
      },
    });
  }

  protected implementDrawing(
    context: DrawingContext,
    frameIndex: number
  ): void {
    const t = this.getNormalizedTime(frameIndex);

    // Play sound at the trigger frame
    if (frameIndex === this.soundTriggerFrame && !this.soundPlayed) {
      this.playSound();
    }

    // Reset the played flag when returning to the start
    if (frameIndex === 0) {
      this.soundPlayed = false;
    }

    // Stop sound on last frame
    if (frameIndex === this.editorManager.getFrameCount() - 1) {
      this.stopSound();
    }

    const centerX = context.width / 2;
    const centerY = context.height / 2;

    context.noStroke();
    context.fill(0, 0, 0, 10);
    context.rect(0, 0, context.width, context.height);

    for (let i = 0; i < this.circleCount; i++) {
      const normalizedIndex = i / this.circleCount;
      const angle = normalizedIndex * Math.PI * 2;

      const baseRadius = this.lerp(
        context.width * this.minRadius,
        context.width * this.maxRadius,
        normalizedIndex
      );

      const waveEffect = this.getWaveEffect(t, normalizedIndex);
      const radius = baseRadius * (1 + waveEffect * 0.3);

      const r = this.colorCycle(normalizedIndex + t, 0, 127, 128);
      const g = this.colorCycle(
        normalizedIndex + t,
        (Math.PI * 2) / 3,
        127,
        128
      );
      const b = this.colorCycle(
        normalizedIndex + t,
        (Math.PI * 4) / 3,
        127,
        128
      );

      const x = centerX + Math.cos(angle + t * Math.PI) * radius * 0.8;
      const y = centerY + Math.sin(angle + t * Math.PI) * radius * 0.8;

      context.noStroke();
      context.fill(r, g, b, 150);
      context.ellipse(x, y, radius * 0.2, radius * 0.2);
    }

    this.drawWaveform(context, t);
  }

  private getWaveEffect(t: number, offset: number): number {
    return (
      Math.sin(t * Math.PI * 10 + offset * Math.PI * 4) *
      Math.sin(t * Math.PI * 5 + offset * Math.PI * 2)
    );
  }

  private drawWaveform(context: DrawingContext, t: number): void {
    const centerY = context.height / 2;
    const waveHeight = context.height * 0.2;

    context.push();
    context.stroke(200, 200, 255, 180);
    context.strokeWeight(2);

    context.beginShape();
    for (let i = 0; i < this.wavePointCount; i++) {
      const x = (i / this.wavePointCount) * context.width * 0.45;
      const baseY = centerY;

      this.soundWaveSimulation[i] = this.lerp(
        this.soundWaveSimulation[i],
        0.1 + 0.4 * this.oscillate(t * 5 + i * 0.1, 1 + i * 0.05),
        0.1
      );

      const y =
        baseY +
        this.soundWaveSimulation[i] * waveHeight * this.oscillate(t * 3, 1);
      context.vertex(x, y);
    }
    context.endShape();

    context.beginShape();
    for (let i = 0; i < this.wavePointCount; i++) {
      const x =
        context.width - (i / this.wavePointCount) * context.width * 0.45;
      const baseY = centerY;
      const y =
        baseY +
        this.soundWaveSimulation[i] *
          waveHeight *
          this.oscillate(t * 3 + Math.PI, 1);
      context.vertex(x, y);
    }
    context.endShape();

    context.pop();
  }

  /**
   * Play the sound and store the instance for later control
   */
  private playSound(): void {
    // Stop any currently playing sound first
    this.stopSound();

    const sound = this.getSound(this.soundId);
    if (sound && typeof sound.play === "function") {
      try {
        // Some sound implementations might behave differently
        if (typeof sound.stop === "function") {
          sound.stop(); // Stop any previous playback
        }

        this.activeSoundInstance = sound;
        sound.play();
        this.soundPlayed = true;
        console.log("Playing sound:", this.soundId);
      } catch (e) {
        console.error("Error playing sound:", e);
      }
    }
  }

  /**
   * Stop the currently playing sound
   */
  private stopSound(): void {
    if (this.activeSoundInstance) {
      try {
        // Different p5.sound versions might have different APIs
        if (typeof this.activeSoundInstance.stop === "function") {
          this.activeSoundInstance.stop();
        } else if (typeof this.activeSoundInstance.pause === "function") {
          this.activeSoundInstance.pause();
        }
        console.log("Stopped sound:", this.soundId);
      } catch (e) {
        console.error("Error stopping sound:", e);
      }
      this.activeSoundInstance = null;
    }
  }
}
