# nanishitakke (何したっけ)

日々の活動や作業を記録し、振り返りを支援するアプリケーションです。
やったことを忘れないように、簡単に記録・管理できます。

## 特徴

- **活動記録**: いつ何をしたかを簡単に記録
- **タグ管理**: 活動内容をタグで分類・色分け
- **作業メモ**: その日の作業内容、詰まった点、改善案などをメモ
- **レポート機能**: 活動時間の集計や可視化 (開発中)
- **AI連携**: Google Generative AI (Gemini) を活用した機能

## 技術スタック

- **Frontend**: React, TypeScript, Vite
- **UI**: Chakra UI, Emotion, React Icons, Framer Motion
- **Backend**: Supabase
- **State Management**: React Query
- **Others**: Chart.js, React Datepicker

## セットアップ

### 前提条件

- Node.js (v18以上推奨)
- Supabase アカウント
- Google Cloud Project (Gemini API利用の場合)

### インストール

1. リポジトリをクローンします

   ```bash
   git clone <repository-url>
   cd nanishitakke
   ```

2. 依存関係をインストールします

   ```bash
   npm install
   # or
   bun install
   ```

3. 環境変数を設定します
   ルートディレクトリに `.env` ファイルを作成し、以下の値を設定してください。

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_GEN_AI_API_KEY=your_google_gen_ai_api_key
   ```

4. 開発サーバーを起動します
   ```bash
   npm run dev
   ```

## スクリプト

- `dev`: 開発サーバーを起動
- `build`: 本番用にビルド
- `lint`: ESLintによるコードチェック
- `preview`: ビルド後のプレビュー

## ディレクトリ構造

```
src/
  ├── app/          # アプリケーションのエントリーポイント、ルーティング
  ├── assets/       # 画像などの静的アセット
  ├── components/   # 共通コンポーネント (UIパーツなど)
  ├── config/       # 設定ファイル (定数など)
  ├── features/     # 機能ごとのモジュール
  │   ├── activities/   # 活動記録機能
  │   ├── reports/      # レポート・統計機能
  │   └── work-memos/   # 作業メモ機能
  ├── lib/          # ライブラリの設定 (Supabase, Apolloなど)
  └── styles/       # グローバルスタイル
```
