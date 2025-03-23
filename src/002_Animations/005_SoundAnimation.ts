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
  private debugMode: boolean = true;
  // 再生速度を保持（p5.soundの再生位置変更時に必要）
  private playbackRate: number = 1.0;

  constructor(p5Instance: any, editorManager: any) {
    super(p5Instance, editorManager);

    for (let i = 0; i < this.wavePointCount; i++) {
      this.soundWaveSimulation.push(Math.random() * 0.5);
    }

    // 再生状態変更イベントの監視
    editorManager.setEvents({
      ...editorManager.events,
      onPlaybackChange: (isPlaying: boolean) => {
        if (isPlaying) {
          // 再生開始時
          this.resumeSound();
        } else {
          // 一時停止時
          this.pauseSound();
        }
      },
      onFrameChange: (frame: number) => {
        // 再生中でないときのフレーム変更
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

    // サウンドトリガーフレームで音声を再生開始
    if (
      frameIndex === this.soundTriggerFrame &&
      !this.soundPlayed &&
      this.editorManager.isPlaybackActive()
    ) {
      this.playSound();
    }

    // 最初のフレームで再生フラグをリセット
    if (frameIndex === 0) {
      this.soundPlayed = false;
    }

    // 最後のフレームで音声を停止
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
   * 音声を初めから再生
   */
  private playSound(): void {
    const sound = this.getSound(this.soundId);
    if (!sound) return;

    // すでに一時停止中の場合は、再開処理を行う
    if (this.soundPaused && this.activeSoundInstance) {
      this.resumeSound();
      return;
    }

    // 既存の音声を停止
    this.stopSound();

    try {
      // 音声の再生
      this.activeSoundInstance = sound;

      // 音声オブジェクトの診断（デバッグ用）
      if (this.debugMode) {
        console.log("Sound object methods:", {
          play: typeof sound.play === "function",
          pause: typeof sound.pause === "function",
          stop: typeof sound.stop === "function",
          jump: typeof sound.jump === "function",
          loop: typeof sound.loop === "function",
          rate: typeof sound.rate === "function",
          duration: sound.duration ? sound.duration() : "N/A",
        });
      }

      // 再生開始
      if (typeof sound.play === "function") {
        // 再生速度を保存 (再開時のために)
        if (typeof sound.rate === "function") {
          this.playbackRate = sound.rate();
        }

        sound.play();
        this.soundPlayed = true;
        this.soundPaused = false;
        console.log("Playing sound:", this.soundId);
      } else {
        console.error("Sound has no play method");
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }

  /**
   * 音声を一時停止
   */
  private pauseSound(): void {
    if (!this.activeSoundInstance) return;

    try {
      // 再生位置を取得
      this.saveCurrentPosition();

      // 一時停止
      if (typeof this.activeSoundInstance.pause === "function") {
        this.activeSoundInstance.pause();
        this.soundPaused = true;
        console.log(
          `Paused sound at position: ${this.lastPlayPosition.toFixed(2)}s`
        );
      } else if (typeof this.activeSoundInstance.stop === "function") {
        // pause()が使えない場合は代替としてstop()を使用
        this.activeSoundInstance.stop();
        this.soundPaused = true;
        console.log(
          `Stopped sound at position: ${this.lastPlayPosition.toFixed(
            2
          )}s (pause not available)`
        );
      }
    } catch (e) {
      console.error("Error pausing sound:", e);
    }
  }

  /**
   * 現在の再生位置を保存
   */
  private saveCurrentPosition(): void {
    if (!this.activeSoundInstance) return;

    try {
      // 再生位置の取得方法をいくつか試す
      if (typeof this.activeSoundInstance.currentTime === "function") {
        this.lastPlayPosition = this.activeSoundInstance.currentTime();
      } else if (this.activeSoundInstance.currentTime !== undefined) {
        this.lastPlayPosition = this.activeSoundInstance.currentTime;
      } else if (typeof this.activeSoundInstance.position === "function") {
        this.lastPlayPosition = this.activeSoundInstance.position();
      } else if (this.activeSoundInstance.position !== undefined) {
        this.lastPlayPosition = this.activeSoundInstance.position;
      } else {
        // 位置取得ができない場合はログ出力
        console.warn("Could not determine current position of sound");
      }

      if (this.debugMode) {
        console.log("Saved position:", this.lastPlayPosition);
      }
    } catch (e) {
      console.error("Error saving current position:", e);
    }
  }

  /**
   * 一時停止した音声を再開
   */
  private resumeSound(): void {
    if (!this.activeSoundInstance) {
      if (this.soundPlayed) {
        // インスタンスがないけど再生済みなら最初から再生
        this.playSound();
      }
      return;
    }

    if (!this.soundPaused) return;

    try {
      // デバッグ情報
      if (this.debugMode) {
        console.log(
          `Attempting to resume from position: ${this.lastPlayPosition.toFixed(
            2
          )}s`
        );
      }

      // p5.soundライブラリの様々な実装に対応するため、複数の方法を試す
      const sound = this.activeSoundInstance;

      // 方法1: stop()してからplay()の引数で開始位置を指定
      if (
        typeof sound.stop === "function" &&
        typeof sound.play === "function" &&
        sound.play.length >= 1
      ) {
        // play()が引数を受け付ける場合

        sound.stop();

        // 少し遅延させてから再生を開始（一部のブラウザでの問題を回避）
        setTimeout(() => {
          try {
            sound.play(0, this.playbackRate, 1.0, this.lastPlayPosition);
            this.soundPaused = false;
            console.log("Resumed using play() with start time parameter");
          } catch (e) {
            console.error("Error during play with params:", e);
            this.fallbackResume(sound);
          }
        }, 50); // 50ms遅延
      } else {
        // 他の方法を試す
        this.fallbackResume(sound);
      }
    } catch (e) {
      console.error("Error resuming sound:", e);

      // エラー発生時は最初から再生し直す
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

  /**
   * 代替の再開方法を試す
   */
  private fallbackResume(sound: any): void {
    try {
      // 方法2: jumpまたはcueを使用
      if (typeof sound.jump === "function") {
        sound.jump(this.lastPlayPosition);
        this.soundPaused = false;
        console.log("Resumed using jump() method");
      } else if (typeof sound.cue === "function") {
        sound.cue(this.lastPlayPosition);
        sound.play();
        this.soundPaused = false;
        console.log("Resumed using cue() method");
      }
      // 方法3: 一時停止中の音声を直接再生
      else if (typeof sound.play === "function") {
        sound.play();
        this.soundPaused = false;
        console.log("Resumed using simple play() method");
      } else {
        console.warn("No suitable method found to resume sound");
      }
    } catch (e) {
      console.error("Error in fallback resume:", e);

      // 最終手段: 新しいインスタンスで再生
      try {
        const newSound = this.getSound(this.soundId);
        if (newSound && typeof newSound.play === "function") {
          this.activeSoundInstance = newSound;
          newSound.play();
          this.soundPaused = false;
          console.log("Resumed with new sound instance");
        }
      } catch (newError) {
        console.error("Failed all resume attempts:", newError);
      }
    }
  }

  /**
   * 音声の再生を完全に停止
   */
  private stopSound(): void {
    if (!this.activeSoundInstance) return;

    try {
      const sound = this.activeSoundInstance;

      // stop()とpause()を両方試す
      if (typeof sound.stop === "function") {
        sound.stop();
        console.log("Stopped sound using stop()");
      } else if (typeof sound.pause === "function") {
        sound.pause();
        console.log("Stopped sound using pause()");
      }

      // 状態をリセット
      this.activeSoundInstance = null;
      this.soundPaused = false;
      this.lastPlayPosition = 0;
    } catch (e) {
      console.error("Error stopping sound:", e);
      // エラーが発生しても状態はリセット
      this.activeSoundInstance = null;
      this.soundPaused = false;
    }
  }
}
