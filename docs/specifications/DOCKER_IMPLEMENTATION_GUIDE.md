# FitTrack Docker実装ガイド - Phase 1-3 詳細手順書

> **作成日**: 2025-09-08  
> **目的**: 面接での実演成功  
> **目標**: `docker-compose up` で完全動作するフルスタック環境構築

## 📋 目次

1. [事前準備](#事前準備)
2. [Phase 1: バックエンドAPIのコンテナ化](#phase-1-バックエンドapiのコンテナ化)
3. [Phase 2: フロントエンドのコンテナ化](#phase-2-フロントエンドのコンテナ化)
4. [Phase 3: 統合環境の構築](#phase-3-統合環境の構築)
5. [動作確認・デバッグ](#動作確認デバッグ)
6. [面接用説明準備](#面接用説明準備)

---

## 🚀 事前準備

### Docker Desktop導入確認
```bash
# Docker動作確認
docker --version
docker-compose --version

# 既存PostgreSQLコンテナ確認
docker-compose ps
```

### プロジェクト構造確認
```bash
fittrack-app/
├── frontend/          # React + TypeScript + Vite
├── backend/          # Node.js + Express + Sequelize
├── docker-compose.yml # 既存PostgreSQL設定
└── docs/            # ドキュメント
```

---

## 📊 Phase 1: バックエンドAPIのコンテナ化

**目標**: Node.js APIサーバーをDockerで動作させる  
**所要時間**: 2時間  
**達成指標**: `http://localhost:8000/api/health` でレスポンス確認

### Step 1.1: .dockerignoreファイル作成（5分）

```bash
# backend/.dockerignore を作成
cd /Users/310tea/Documents/fittrack-app/backend
```

**backend/.dockerignore**:
```bash
# Node.js関連
node_modules/
npm-debug.log*

# 環境変数
.env
.env.local
.env.development
.env.test
.env.production

# テスト・カバレッジ
coverage/
*.lcov

# ログファイル
logs/
*.log

# OS関連
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Git
.git/
.gitignore

# その他
*.md
```

### Step 1.2: Docker用環境変数作成（15分）

**backend/.env.docker**:
```bash
# ===========================================
# FitTrack App - Docker環境用設定
# ===========================================

# 基本設定
NODE_ENV=development
PORT=8000

# データベース設定（Docker内部通信）
DB_HOST=postgres
DB_USER=fittrack_user
DB_PASSWORD=secure_password_2024
DB_NAME=fittrack_db
DB_PORT=5432

# JWT認証設定（開発用）
JWT_SECRET_KEY=your_jwt_secret_minimum_64_characters_generated_with_crypto_randomBytes_for_development
JWT_EXPIRES_IN=24h

# CORS設定（Docker環境用）
CORS_ORIGIN_PROD=https://fitstart-frontend.vercel.app
CORS_ORIGIN_DEV=http://frontend:3000

# セキュリティ設定
BCRYPT_ROUNDS=12

# Strava API設定（既存設定をコピー）
STRAVA_CLIENT_ID=あなたのクライアントID
STRAVA_CLIENT_SECRET=あなたのクライアントシークレット  
STRAVA_REDIRECT_URI=http://localhost:8000/api/strava/callback
ENCRYPTION_KEY=32文字のランダムな文字列を生成
```

`★ Insight ─────────────────────────────────────`
DB_HOSTを`postgres`に変更することで、Docker内部のサービス名で通信できます。既存の.env.exampleの詳細設定を活用し、Docker特有の調整のみを行います。
`─────────────────────────────────────────────────`

### Step 1.3: Dockerfileの作成（45分）

**backend/Dockerfile**:
```dockerfile
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

# 依存関係のインストール
RUN npm ci --only=production && \
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
```

**重要ポイント**:
- Alpine Linuxで軽量化
- 非rootユーザーでセキュリティ向上
- ヘルスチェック機能
- 本番環境では`nodemon`ではなく`node`直接実行

### Step 1.4: 既存コードの調整（30分）

#### app.jsのCORS設定確認
```javascript
// backend/app.js の CORS設定を確認・調整
const getCorsConfig = () => {
  const currentEnv = process.env.NODE_ENV || 'development';
  const isProduction = currentEnv === 'production';
  if (isProduction) {
    return {
      origin: process.env.CORS_ORIGIN_PROD || 'https://fitstart-frontend.vercel.app',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    };
  } else {
    return {
      origin: [
        process.env.CORS_ORIGIN_DEV || 'http://localhost:5173',
        'http://localhost:3000',  // Docker frontend用
        'http://frontend:3000',   // Docker内部通信用  ← 追加
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    };
  }
};
```

#### ヘルスチェックエンドポイント確認
```javascript
// backend/routes/ にヘルスチェックルートが存在するか確認
// 存在しない場合は追加

// routes/healthRoutes.js (新規作成の場合)
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'FitTrack API',
    version: '1.0.0'
  });
});

module.exports = router;
```

### Step 1.5: テスト実行（25分）

```bash
# バックエンド単体でのDocker起動テスト
cd /Users/310tea/Documents/fittrack-app

# backend Dockerイメージビルド
docker build -t fittrack-backend ./backend

# 既存PostgreSQLコンテナが起動していることを確認
docker-compose up postgres -d

# backendコンテナを一時的に起動してテスト
docker run --rm -p 8000:8000 \
  --env-file backend/.env.docker \
  --network fittrack-app_default \
  fittrack-backend

# 別ターミナルでヘルスチェック確認
curl http://localhost:8000/api/health
```

**期待される結果**:
```json
{
  "status": "OK",
  "timestamp": "2025-09-08T10:00:00.000Z",
  "service": "FitTrack API",
  "version": "1.0.0"
}
```

---

## 🎨 Phase 2: フロントエンドのコンテナ化

**目標**: React開発環境をDockerで動作させる  
**所要時間**: 2.5時間  
**達成指標**: `http://localhost:3000` でアプリ表示

### Step 2.1: .dockerignoreファイル作成（5分）

**frontend/.dockerignore**:
```bash
# Node.js関連
node_modules/
npm-debug.log*

# ビルド成果物
dist/
build/

# 環境変数
.env
.env.local
.env.development  
.env.test
.env.production

# テスト・カバレッジ
coverage/
*.lcov

# Vercel関連
.vercel/
.next/

# ログファイル
logs/
*.log

# OS関連
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Git
.git/
.gitignore

# その他
*.md
README.md
```

### Step 2.2: Docker用環境変数作成（10分）

**frontend/.env.docker**:
```bash
# ===========================================
# FitTrack Frontend - Docker環境用設定
# ===========================================

# API接続設定（Docker内部通信）
VITE_API_BASE_URL=http://backend:8000

# 開発環境設定
VITE_NODE_ENV=development

# その他必要な環境変数があれば追加
```

### Step 2.3: 開発用Dockerfileの作成（60分）

**frontend/Dockerfile**:
```dockerfile
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
```

### Step 2.4: Vite設定の調整（30分）

**frontend/vite.config.ts の Docker対応確認**:
```typescript
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/pages': path.resolve(__dirname, './src/pages'),
    },
  },
  
  // 開発サーバー設定（Docker対応済み）
  server: {
    port: 3000,                        // Docker用ポート変更
    host: '0.0.0.0',                   // Docker対応（既存）
    strictPort: true,                  // ポート競合時のエラー
    open: false,                       // Docker環境ではブラウザ自動起動無効
    cors: true,                        // CORS有効化
    
    // バックエンドAPIプロキシ設定（Docker用調整）
    proxy: {
      '/api': {
        target: 'http://backend:8000',  // localhost:8000 → backend:8000
        changeOrigin: true,             // Originヘッダー変更
        secure: false,                  // HTTPS検証無効
        ws: true,                       // WebSocket対応
        timeout: 30000,                 // 30秒タイムアウト
      },
    },
  },
  
  // その他の設定は既存のまま
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          http: ['axios'],
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    chunkSizeWarningLimit: 1000,
  },
  
  esbuild: {
    target: 'es2020',
    logOverride: {
      'this-is-undefined-in-esm': 'silent',
    },
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      '@hookform/resolvers/yup',
      'axios',
      'yup',
    ],
  },
  
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
```

**重要な変更点**:
- `server.port`: 5173 → 3000 (Docker統一)
- `proxy.target`: `localhost:8000` → `backend:8000` (Docker内部通信)

### Step 2.5: フロントエンドテスト（45分）

```bash
# フロントエンド単体でのDocker起動テスト
cd /Users/310tea/Documents/fittrack-app

# frontend Dockerイメージビルド
docker build -t fittrack-frontend ./frontend

# 一時的な動作確認（バックエンド無しで起動確認）
docker run --rm -p 3000:3000 \
  --env-file frontend/.env.docker \
  fittrack-frontend

# ブラウザで http://localhost:3000 にアクセスして表示確認
# API通信エラーは正常（バックエンドが起動していないため）
```

---

## 🔧 Phase 3: 統合環境の構築

**目標**: 3サービス連携動作  
**所要時間**: 1.5時間  
**達成指標**: `docker-compose up` で全サービス起動

### Step 3.1: docker-compose.yml の更新（30分）

**docker-compose.yml** (既存ファイルを更新):
```yaml
version: '3.9'

# Docker内部通信用ネットワーク
networks:
  fittrack-network:
    driver: bridge

services:
  # PostgreSQL データベース（既存設定を維持）
  postgres:
    image: postgres:17
    container_name: fittrack_postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-fittrack_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-secure_password_2024}
      POSTGRES_DB: ${POSTGRES_DB:-fittrack_db}
    ports:
      - '5433:5432'  # 外部アクセス用（既存のまま）
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - fittrack-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-fittrack_user} -d ${POSTGRES_DB:-fittrack_db}"]
      interval: 30s
      timeout: 10s
      retries: 5

  # バックエンド API サーバー
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fittrack_backend
    restart: always
    environment:
      - NODE_ENV=development
    env_file:
      - ./backend/.env.docker
    ports:
      - '8000:8000'  # 外部アクセス用
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - fittrack-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 10s

  # フロントエンド React アプリ
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: fittrack_frontend
    restart: always
    env_file:
      - ./frontend/.env.docker
    ports:
      - '3000:3000'  # 外部アクセス用
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - fittrack-network
    volumes:
      # Hot Reload用（開発環境のみ）
      - ./frontend/src:/app/src:ro
      - ./frontend/public:/app/public:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 15s

volumes:
  postgres_data:
```

`★ Insight ─────────────────────────────────────`
depends_onとhealthcheckを設定することで、PostgreSQL→Backend→Frontendの順序で安全に起動します。Hot Reload用のvolume設定により、開発時のコード変更が即座に反映されます。
`─────────────────────────────────────────────────`

### Step 3.2: 環境変数ファイル作成（15分）

**プロジェクトルートに .env ファイル作成**:
```bash
# ===========================================
# FitTrack Docker-Compose 環境変数
# ===========================================

# PostgreSQL設定
POSTGRES_USER=fittrack_user
POSTGRES_PASSWORD=secure_password_2024
POSTGRES_DB=fittrack_db

# 開発環境フラグ
NODE_ENV=development
```

### Step 3.3: 初期データベーススキーマ準備（15分）

**backend/init.sql** (オプション - データベース初期化用):
```sql
-- FitTrack Database Initialization Script
-- Docker環境での自動初期化用

\c fittrack_db;

-- 既存のSequelizeマイグレーションがある場合はここでは不要
-- 必要に応じてテーブル作成やサンプルデータ挿入

-- 初期化完了ログ
SELECT 'FitTrack Database Initialized Successfully' AS status;
```

### Step 3.4: 統合テスト実行（30分）

```bash
# 全サービス停止（クリーンスタート）
docker-compose down

# イメージの再ビルド
docker-compose build --no-cache

# 全サービス起動
docker-compose up -d

# 起動状況確認
docker-compose ps

# ログ確認（問題がある場合）
docker-compose logs postgres
docker-compose logs backend  
docker-compose logs frontend

# ヘルスチェック確認
curl http://localhost:8000/api/health
curl http://localhost:3000

# データベース接続確認
docker-compose exec postgres psql -U fittrack_user -d fittrack_db -c "SELECT version();"
```

**期待される結果**:
```bash
# docker-compose ps の出力例
      Name                    Command                  State                    Ports
----------------------------------------------------------------------------------------
fittrack_backend     node server.js                 Up (healthy)   0.0.0.0:8000->8000/tcp
fittrack_frontend    npm run dev -- --host 0.0. ... Up (healthy)   0.0.0.0:3000->3000/tcp  
fittrack_postgres    docker-entrypoint.sh postgres  Up (healthy)   0.0.0.0:5433->5432/tcp
```

---

## 🔍 動作確認・デバッグ

### 完全動作テストシナリオ（30分）

#### 1. ブラウザでのフロントエンド確認
```bash
# ブラウザで http://localhost:3000 にアクセス
# ✅ React画面が表示される
# ✅ ローディング状態や初期画面が正常
```

#### 2. API通信確認  
```bash
# バックエンドAPIの直接確認
curl http://localhost:8000/api/health

# フロントエンドからのAPI通信確認（ブラウザ開発者ツール）
# ✅ Network タブで /api/* のリクエストが成功
# ✅ CORS エラーが発生していない
```

#### 3. データベース操作確認
```bash
# アプリでユーザー登録テスト（可能であれば）
# または直接データベース確認
docker-compose exec postgres psql -U fittrack_user -d fittrack_db

# テーブル確認
\dt

# サンプル操作
SELECT * FROM users LIMIT 5;
```

### よくある問題と解決方法

#### 問題1: フロントエンドがバックエンドに接続できない
```bash
# 症状: API通信エラー、CORS エラー
# 原因: ネットワーク設定やプロキシ設定の問題

# 解決手順:
# 1. ネットワーク確認
docker network ls
docker network inspect fittrack-app_fittrack-network

# 2. backend 側のCORS設定確認
docker-compose logs backend | grep -i cors

# 3. frontend 側のプロキシ設定確認
# vite.config.ts の proxy.target が 'http://backend:8000' になっているか
```

#### 問題2: データベース接続エラー
```bash
# 症状: Backend起動時にDB接続失敗
# 原因: 環境変数や接続文字列の問題

# 解決手順:
# 1. PostgreSQL起動確認
docker-compose ps postgres

# 2. 接続テスト
docker-compose exec backend sh
# コンテナ内で
ping postgres
nslookup postgres

# 3. 環境変数確認
printenv | grep DB_
```

#### 問題3: 起動順序の問題
```bash
# 症状: Backend起動時にPostgreSQLがまだ準備できていない
# 解決: healthcheck と depends_on の設定確認

# 手動での順次起動テスト
docker-compose up postgres -d
# PostgreSQL完全起動待機
docker-compose up backend -d  
# Backend完全起動待機
docker-compose up frontend -d
```

---

## 🎤 面接用説明準備

### 面接での説明ポイント（15分で準備）

#### 1. Docker採用理由の説明
```javascript
const dockerAdoption = {
  "課題": "ローカル開発環境とサーバー環境の差異",
  "解決": "コンテナによる環境統一",
  "効果": [
    "チーム開発での環境差異解消", 
    "本番環境への確実なデプロイ",
    "新規開発者のオンボーディング時間短縮"
  ],
  "技術判断": "段階的導入でリスク最小化"
}
```

#### 2. アーキテクチャ説明（1分版）
```bash
"3層アーキテクチャでの分離設計。
React フロントエンド（ポート3000）、
Node.js API サーバー（ポート8000）、
PostgreSQL17 データベース（ポート5432）を
Docker Compose で統合管理し、
内部ネットワークでのサービス間通信を実現。"
```

#### 3. デモンストレーション手順
```bash
# 面接官の前での実演手順
cd fittrack-app
docker-compose up -d

# 起動確認（30秒程度）
docker-compose ps

# ブラウザデモ
open http://localhost:3000

# API動作確認
curl http://localhost:8000/api/health

# 技術的詳細説明
code docker-compose.yml  # 設定説明
code backend/Dockerfile  # 技術選択の説明
```

#### 4. 今後の改善計画
```javascript
const futureEnhancements = {
  "短期": "CI/CD パイプラインとの統合",
  "中期": "マイクロサービス分割の検討", 
  "長期": "Kubernetes移行の検討",
  "運用": "監視・ログ集約システムの導入"
}
```

---

## ✅ 完了チェックリスト

### Phase 1 完了確認
- [ ] backend/.dockerignore 作成済み
- [ ] backend/.env.docker 作成・設定済み  
- [ ] backend/Dockerfile 作成済み
- [ ] CORS設定にDocker環境追加済み
- [ ] ヘルスチェックエンドポイント動作確認済み
- [ ] Backend単体での Docker起動成功
- [ ] `curl http://localhost:8000/api/health` レスポンス確認

### Phase 2 完了確認  
- [ ] frontend/.dockerignore 作成済み
- [ ] frontend/.env.docker 作成・設定済み
- [ ] frontend/Dockerfile 作成済み
- [ ] vite.config.ts のDocker用調整済み
- [ ] Frontend単体での Docker起動成功
- [ ] `http://localhost:3000` でReact画面表示確認

### Phase 3 完了確認
- [ ] docker-compose.yml 3サービス統合済み
- [ ] .env ファイル作成済み
- [ ] `docker-compose up -d` 成功
- [ ] 3サービス全て healthy 状態確認
- [ ] Frontend→Backend→Database の通信確認
- [ ] ブラウザでの完全動作確認

### 面接準備完了確認
- [ ] Docker採用理由説明準備済み
- [ ] 1分でのアーキテクチャ説明練習済み  
- [ ] デモンストレーション手順確認済み
- [ ] 想定質問への回答準備済み

---

**このガイド通りに実行することで、面接で `docker-compose up` による完全な動作デモが可能になります。**

`★ Insight ─────────────────────────────────────`
この手順書は面接での成功を第一目標とし、理論より実践を重視しています。各Phaseで動作確認を行い、問題があれば即座に修正できる構成になっています。
`─────────────────────────────────────────────────`