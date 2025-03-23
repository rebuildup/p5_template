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

# Note

出力は透過 png 連番を zip ファイルにしたもの

- fps/total frames を変更したい時

  src\001_Editors\001_EditorManager.ts 8,9 行

- キャンバスの解像度を変更したい時

  src\001_Editors\002_AnimationRenderer.ts 19,20 行

- 描画するアニメーションを変更したい時

  src\001_Editors\002_AnimationRenderer.ts 25 行

- 出力する zip ファイルの名前を変更したい時

  src\001_Editors\003_VideoEncoder.ts 92 行

# Author

- samuido
- rebuild.up.up@gmail.com

# License

好きに使っていいすよ
