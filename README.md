# 筋トレレビュー

AdvagymのCSVを読み込んで、筋トレ履歴を部位・種目・週次で振り返る静的PWAです。

## 使い方

1. GitHub Pagesなどで公開されたURLをSafariで開く
2. `CSVを選択` からAdvagymのCSVを読み込む
3. iPhoneの共有メニューから `ホーム画面に追加`

読み込んだCSV本文はブラウザ内の保存領域に保存されます。公開リポジトリには個人CSVを含めない構成です。

## ローカル確認

```sh
npm run dev
```

ブラウザで `http://127.0.0.1:4173/` を開きます。

## GitHub Pages

GitHub Pagesでは、`main` ブランチの `/root` を公開対象にします。

公開対象に含める主なファイル:

- `index.html`
- `src/app.js`
- `src/styles.css`
- `manifest.webmanifest`
- `sw.js`
- `assets/icon.svg`
- `data/sample.csv`

`data/current.csv` は `.gitignore` で除外しています。
