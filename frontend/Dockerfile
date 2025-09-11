# ===========================================
# FitTrack Frontend Dockerfile (Development)
# React + TypeScript + Vite
# ===========================================

# Base image - Node.js 18 Alpine
FROM node:18-alpine

# 作業ディレクトリ設定
WORKDIR /app

# システム依存関係のインストール
RUN apk add --no-cache \
    curl \
    git

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール（開発用依存関係含む）
RUN npm ci && \
    npm cache clean --force

# アプリケーションコードをコピー
COPY . .

# 非rootユーザーの作成
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# ファイル権限の設定
RUN chown -R nextjs:nodejs /app
USER nextjs

# ポート露出
EXPOSE 3000

# ヘルスチェック設定
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# 開発サーバー起動（Hot Reload対応）
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]