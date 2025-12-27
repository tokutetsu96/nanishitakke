# 最新のBunイメージを使用
FROM oven/bun:latest

WORKDIR /app

# パッケージファイルをコピーしてインストール
COPY package.json bun.lock ./
RUN bun install

# ソースコードをコピー
COPY . .

# Viteのデフォルトポート 5173 を公開
EXPOSE 5173

# ホストを0.0.0.0に指定して起動
CMD ["bun", "run", "dev", "--host"]