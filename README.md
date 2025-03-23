# P5.js template

p5.js で映像を作るときのテンプレートです

vite を使っている

# Installation

```bash
npm install
```

# Usage

```bash
npm run dev
```

- Space で再生
- 矢印でフレーム移動
- Enter でエンコード書き出し
- 画面内に zip ファイル(出力の形式と同じもの)をドラックアンドドロップでプレビュー可能
- 上下矢印キーで zip プレビューを切り替え可能

# Note

出力は透過 png 連番を zip ファイルにしたもの

以下の設定は src\config.ts で変更可能

- fps/total frames を変更したい時(ANIMATION_CONFIG)

- キャンバスの解像度を変更したい時(CANVAS_CONFIG)

- 描画するアニメーションを変更したい時(createAnimations)

- 出力する zip ファイルの名前を変更したい時(OUTPUT_CONFIG)

# Author

- samuido
- rebuild.up.up@gmail.com

# License

好きに使っていいすよ
