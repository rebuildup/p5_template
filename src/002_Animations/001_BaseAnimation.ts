import { ResourceManager } from "../003_Resources/001_ResourceManager";

export interface DrawingContext {
  width: number;
  height: number;
  noStroke: () => void;
  stroke: (...args: any[]) => void;
  strokeWeight: (weight: number) => void;
  fill: (...args: any[]) => void;
  ellipse: (x: number, y: number, w: number, h?: number) => void;
  rect: (x: number, y: number, w: number, h: number) => void;
  triangle: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ) => void;
  push: () => void;
  pop: () => void;
  background: (...args: any[]) => void;
  clear: () => void;
  imageMode: (mode: any) => void;
  image: (
    img: any,
    x: number,
    y: number,
    width?: number,
    height?: number
  ) => void;
  tint: (...args: any[]) => void;
  text: (str: string, x: number, y: number) => void;
  textAlign: (alignX: any, alignY?: any) => void;
  textSize: (size: number) => void;
  get: () => any;
  beginShape: () => void;
  endShape: (mode?: any) => void;
  vertex: (x: number, y: number) => void;
  CENTER?: any;
  CLOSE?: any;
  // 以下のメソッドを追加
  translate: (x: number, y: number, z?: number) => void;
  rotate: (angle: number) => void;
  scale: (x: number, y?: number, z?: number) => void;
}

export abstract class BaseAnimation {
  protected p5: any;
  protected editorManager: any;
  protected resourceManager: ResourceManager;

  constructor(p5Instance: any, editorManager: any) {
    this.p5 = p5Instance;
    this.editorManager = editorManager;
    this.resourceManager = ResourceManager.getInstance();
  }

  /**
   * 現在のフレームをp5インスタンスに描画
   */
  draw(frameIndex: number): void {
    this.implementDrawing(this.p5, frameIndex);
  }

  /**
   * 現在のフレームを指定したバッファに描画
   */
  drawToBuffer(buffer: any, frameIndex: number): void {
    this.implementDrawing(buffer, frameIndex);
  }

  /**
   * 0から1の範囲で正規化された時間を取得
   */
  protected getNormalizedTime(frameIndex: number): number {
    return frameIndex / this.editorManager.getFrameCount();
  }

  /**
   * 指定されたIDの画像リソースを取得
   */
  protected getImage(id: string): any {
    return this.resourceManager.getImage(id);
  }

  /**
   * 指定されたIDの音声リソースを取得
   */
  protected getSound(id: string): any {
    return this.resourceManager.getSound(id);
  }

  /**
   * ============== アニメーションユーティリティ関数 ==============
   */

  /**
   * 色を循環させる（サイン波による色の変化）
   */
  protected colorCycle(
    t: number,
    phaseOffset: number = 0,
    amplitude: number = 127,
    center: number = 128
  ): number {
    return center + amplitude * Math.sin(t * Math.PI * 2 + phaseOffset);
  }

  /**
   * 円運動の座標を計算
   */
  protected orbit(
    t: number,
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number = radiusX,
    phaseOffset: number = 0
  ): { x: number; y: number } {
    return {
      x: centerX + radiusX * Math.cos(t * Math.PI * 2 + phaseOffset),
      y: centerY + radiusY * Math.sin(t * Math.PI * 2 + phaseOffset),
    };
  }

  /**
   * イーズイン・アウト (滑らかな加速と減速)
   */
  protected easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * イーズイン (徐々に加速)
   */
  protected easeIn(t: number): number {
    return t * t;
  }

  /**
   * イーズアウト (徐々に減速)
   */
  protected easeOut(t: number): number {
    return t * (2 - t);
  }

  /**
   * 振動関数（サイン波）
   */
  protected oscillate(
    t: number,
    frequency: number = 1,
    amplitude: number = 1
  ): number {
    return amplitude * Math.sin(t * Math.PI * 2 * frequency);
  }

  /**
   * 正多角形を描画
   */
  protected regularPolygon(
    context: DrawingContext,
    x: number,
    y: number,
    radius: number,
    sides: number,
    rotation: number = 0
  ): void {
    context.push();
    context.beginShape();
    for (let i = 0; i < sides; i++) {
      const angle = rotation + (i * Math.PI * 2) / sides;
      const vx = x + radius * Math.cos(angle);
      const vy = y + radius * Math.sin(angle);
      context.vertex(vx, vy);
    }
    context.endShape(context.CLOSE);
    context.pop();
  }

  /**
   * 線形補間（2つの値の間を滑らかに遷移）
   */
  protected lerp(start: number, end: number, amt: number): number {
    return start + (end - start) * amt;
  }

  /**
   * 派手なエフェクトのための関数（バウンス効果）
   */
  protected bounce(t: number): number {
    const b = 4; // バウンスの強さ
    return Math.abs(Math.sin(t * Math.PI * b) * (1 - t));
  }

  /**
   * 三次元のカーブを描画するための関数
   */
  protected curve3D(
    t: number,
    radius: number = 1,
    height: number = 0.5,
    twist: number = 3
  ): { x: number; y: number; z: number } {
    return {
      x: radius * Math.cos(t * Math.PI * 2),
      y: radius * Math.sin(t * Math.PI * 2),
      z: height * Math.sin(t * Math.PI * 2 * twist),
    };
  }

  /**
   * アニメーション固有の描画実装
   * 各アニメーションクラスでオーバーライドします
   */
  protected abstract implementDrawing(
    context: DrawingContext,
    frameIndex: number
  ): void;
}
