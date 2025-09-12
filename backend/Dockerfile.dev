# ===========================================
# FitTrack Backend Dockerfile
# Node.js API サーバー用
# ===========================================

# Base image - Node.js 18 Alpine (軽量)
FROM node:18-alpine AS base

# 作業ディレクトリ設定
WORKDIR /app

# システム依存関係のインストール
RUN apk add --no-cache \
    postgresql-client \
    curl

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール（dotenvは本番でも必要）
RUN npm ci && \
    npm cache clean --force

# アプリケーションコードをコピー
COPY . .

# 非rootユーザーの作成（セキュリティ）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# ファイル権限の設定
RUN chown -R nextjs:nodejs /app
USER nextjs

# ポート露出
EXPOSE 8000

# ヘルスチェック設定
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# アプリケーション起動
CMD ["node", "server.js"]