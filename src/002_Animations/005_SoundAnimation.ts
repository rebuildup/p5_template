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
  private playbackRate: number = 1.0;

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

    try {
      this.activeSoundInstance = sound;

      if (typeof sound.play === "function") {
        if (typeof sound.rate === "function") {
          this.playbackRate = sound.rate();
        }

        sound.play();
        this.soundPlayed = true;
        this.soundPaused = false;
      } else {
        console.error("Sound has no play method");
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }

  private pauseSound(): void {
    if (!this.activeSoundInstance) return;

    try {
      this.saveCurrentPosition();

      if (typeof this.activeSoundInstance.pause === "function") {
        this.activeSoundInstance.pause();
        this.soundPaused = true;
      } else if (typeof this.activeSoundInstance.stop === "function") {
        this.activeSoundInstance.stop();
        this.soundPaused = true;
      }
    } catch (e) {
      console.error("Error pausing sound:", e);
    }
  }

  private saveCurrentPosition(): void {
    if (!this.activeSoundInstance) return;

    try {
      if (typeof this.activeSoundInstance.currentTime === "function") {
        this.lastPlayPosition = this.activeSoundInstance.currentTime();
      } else if (this.activeSoundInstance.currentTime !== undefined) {
        this.lastPlayPosition = this.activeSoundInstance.currentTime;
      } else if (typeof this.activeSoundInstance.position === "function") {
        this.lastPlayPosition = this.activeSoundInstance.position();
      } else if (this.activeSoundInstance.position !== undefined) {
        this.lastPlayPosition = this.activeSoundInstance.position;
      } else {
        console.warn("Could not determine current position of sound");
      }
    } catch (e) {
      console.error("Error saving current position:", e);
    }
  }

  private resumeSound(): void {
    if (!this.activeSoundInstance) {
      if (this.soundPlayed) {
        this.playSound();
      }
      return;
    }

    if (!this.soundPaused) return;

    try {
      const sound = this.activeSoundInstance;

      if (
        typeof sound.stop === "function" &&
        typeof sound.play === "function" &&
        sound.play.length >= 1
      ) {
        sound.stop();

        setTimeout(() => {
          try {
            sound.play(0, this.playbackRate, 1.0, this.lastPlayPosition);
            this.soundPaused = false;
          } catch (e) {
            console.error("Error during play with params:", e);
            this.fallbackResume(sound);
          }
        }, 50);
      } else {
        this.fallbackResume(sound);
      }
    } catch (e) {
      console.error("Error resuming sound:", e);

      try {
        if (
          this.activeSoundInstance &&
          typeof this.activeSoundInstance.play === "function"
        ) {
          this.activeSoundInstance.play();
          this.soundPaused = false;
        }
      } catch (playError) {
        console.error("Error during fallback play:", playError);
      }
    }
  }

  private fallbackResume(sound: any): void {
    try {
      if (typeof sound.jump === "function") {
        sound.jump(this.lastPlayPosition);
        this.soundPaused = false;
      } else if (typeof sound.cue === "function") {
        sound.cue(this.lastPlayPosition);
        sound.play();
        this.soundPaused = false;
      } else if (typeof sound.play === "function") {
        sound.play();
        this.soundPaused = false;
      } else {
        console.warn("No suitable method found to resume sound");
      }
    } catch (e) {
      console.error("Error in fallback resume:", e);

      try {
        const newSound = this.getSound(this.soundId);
        if (newSound && typeof newSound.play === "function") {
          this.activeSoundInstance = newSound;
          newSound.play();
          this.soundPaused = false;
        }
      } catch (newError) {
        console.error("Failed all resume attempts:", newError);
      }
    }
  }

  private stopSound(): void {
    if (!this.activeSoundInstance) return;

    try {
      const sound = this.activeSoundInstance;

      if (typeof sound.stop === "function") {
        sound.stop();
      } else if (typeof sound.pause === "function") {
        sound.pause();
      }

      this.activeSoundInstance = null;
      this.soundPaused = false;
      this.lastPlayPosition = 0;
    } catch (e) {
      console.error("Error stopping sound:", e);
      this.activeSoundInstance = null;
      this.soundPaused = false;
    }
  }
}
