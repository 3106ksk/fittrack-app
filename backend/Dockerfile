# ===========================================
# FitTrack Backend - Production Dockerfile
# 本番環境用（Railway/Heroku等）
# ===========================================

FROM node:18-alpine AS base

WORKDIR /app

# システム依存関係（PostgreSQL接続用）
RUN apk add --no-cache postgresql-client curl

# package.jsonだけ先にコピー（キャッシュ効率化）
COPY package.json ./

# 本番用依存関係のインストール
# package-lock.jsonがない場合でも動作
RUN npm install --production && \
    npm cache clean --force

# アプリケーションコードをコピー
COPY . .

# セキュリティ: 非rootユーザー
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fittrack -u 1001 && \
    chown -R fittrack:nodejs /app

USER fittrack

# ポート露出
EXPOSE 8000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# 起動コマンド
CMD ["node", "server.js"]