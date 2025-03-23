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
  private soundPaused: boolean = false;
  private lastPlayPosition: number = 0;

  constructor(p5Instance: any, editorManager: any) {
    super(p5Instance, editorManager);

    for (let i = 0; i < this.wavePointCount; i++) {
      this.soundWaveSimulation.push(Math.random() * 0.5);
    }

    editorManager.setEvents({
      ...editorManager.events,
      onPlaybackChange: (isPlaying: boolean) => {
        if (isPlaying) {
          this.resumeSound();
        } else {
          this.pauseSound();
        }
      },
      onFrameChange: (frame: number) => {
        if (!editorManager.isPlaybackActive()) {
          if (frame === 0 || frame >= editorManager.getFrameCount() - 1) {
            this.stopSound();
          }
        }
      },
    });
  }

  protected implementDrawing(
    context: DrawingContext,
    frameIndex: number
  ): void {
    const t = this.getNormalizedTime(frameIndex);

    if (
      frameIndex === this.soundTriggerFrame &&
      !this.soundPlayed &&
      this.editorManager.isPlaybackActive()
    ) {
      this.playSound();
    }

    if (frameIndex === 0) {
      this.soundPlayed = false;
    }

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

  private playSound(): void {
    const sound = this.getSound(this.soundId);
    if (!sound) return;

    if (this.soundPaused && this.activeSoundInstance) {
      this.resumeSound();
      return;
    }

    this.stopSound();

    if (typeof sound.play === "function") {
      try {
        this.activeSoundInstance = sound;
        sound.play();
        this.soundPlayed = true;
        this.soundPaused = false;
        console.log("Playing sound:", this.soundId);
      } catch (e) {
        console.error("Error playing sound:", e);
      }
    }
  }

  private pauseSound(): void {
    if (this.activeSoundInstance) {
      try {
        if (typeof this.activeSoundInstance.currentTime === "function") {
          this.lastPlayPosition = this.activeSoundInstance.currentTime();
        } else if (this.activeSoundInstance.currentTime !== undefined) {
          this.lastPlayPosition = this.activeSoundInstance.currentTime;
        }

        if (typeof this.activeSoundInstance.pause === "function") {
          this.activeSoundInstance.pause();
          this.soundPaused = true;
          console.log("Paused sound at position:", this.lastPlayPosition);
        } else if (typeof this.activeSoundInstance.stop === "function") {
          this.activeSoundInstance.stop();
          this.soundPaused = true;
          console.log("Stopped sound (pause not available)");
        }
      } catch (e) {
        console.error("Error pausing sound:", e);
      }
    }
  }

  private resumeSound(): void {
    if (this.activeSoundInstance && this.soundPaused) {
      try {
        if (typeof this.activeSoundInstance.play === "function") {
          if (typeof this.activeSoundInstance.jump === "function") {
            this.activeSoundInstance.jump(this.lastPlayPosition);
            console.log("Resumed sound using jump to:", this.lastPlayPosition);
          } else if (typeof this.activeSoundInstance.cue === "function") {
            this.activeSoundInstance.cue(this.lastPlayPosition);
            this.activeSoundInstance.play();
            console.log("Resumed sound using cue to:", this.lastPlayPosition);
          } else {
            this.activeSoundInstance.play();
            console.log(
              "Resumed sound from beginning (no position control available)"
            );
          }
          this.soundPaused = false;
        }
      } catch (e) {
        console.error("Error resuming sound:", e);
      }
    } else if (!this.activeSoundInstance && this.soundPlayed) {
      this.playSound();
    }
  }

  private stopSound(): void {
    if (this.activeSoundInstance) {
      try {
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
      this.soundPaused = false;
      this.lastPlayPosition = 0;
    }
  }
}
