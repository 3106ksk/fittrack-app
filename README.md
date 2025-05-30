# 🏋️‍♂️ **FitStart** - 個人向けフィットネストラッキングアプリ

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

> **現代人のフィットネス習慣を革新する、包括的なワークアウト管理システム**

FitStart は、フィットネス愛好家が自分のワークアウトを効率的に記録・追跡し、目標達成をサポートする個人開発の Web アプリケーションです。筋力トレーニングと有酸素運動の両方に対応した柔軟なデータモデリングと、直感的なユーザーインターフェースが特徴です。

---

## 📸 **プロジェクトデモ**

<!-- スクリーンショットやGIFをここに配置 -->

```
🎯 主要画面のスクリーンショット
├── ダッシュボード（トレーニング概要）
├── ワークアウト記録フォーム
├── トレーニング履歴とグラフ
└── 目標設定・進捗管理
```

---

## 💡 **なぜ FitStart なのか？**

### 🔍 **解決する課題**

- **断片化された情報管理**: 紙のノートや Excel での非効率な記録
- **継続性の欠如**: 目標設定と進捗の可視化不足
- **データの活用不足**: 過去のパフォーマンス分析の困難さ

### 🎯 **提供する価値**

- ✅ **統合管理**: 筋力トレーニングと有酸素運動の一元管理
- ✅ **データ可視化**: 進捗の可視化でモチベーション維持
- ✅ **目標達成支援**: SMART 目標設定とリアルタイム進捗追跡
- ✅ **継続サポート**: 直感的な UI/UX で習慣化促進

---

## 🏗️ **技術アーキテクチャ**

### **システム構成図**

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│   Frontend      │◄──────────────────►│   Backend       │
│                 │                     │                 │
│ React + Vite    │                     │ Express.js      │
│ React Router    │                     │ JWT Auth        │
│ Material-UI*    │                     │ bcrypt          │
│ React Hook Form │                     │ Sequelize ORM   │
└─────────────────┘                     └─────────────────┘
                                                    │
                                           Database │ Connection
                                                    ▼
                                        ┌─────────────────┐
                                        │   PostgreSQL    │
                                        │                 │
                                        │ Docker Container│
                                        │ Port: 5433      │
                                        └─────────────────┘
```

\*Material-UI は提案実装

### **データモデル設計**

```sql
-- 柔軟性を重視したスキーマ設計
Users ──┐
        ├── Workouts (exercise_type: 'strength' | 'cardio')
        └── Goals (target/progress tracking)
```

---

## 🛠️ **技術スタック詳細**

### **🎨 フロントエンド技術選定**

| 技術                 | バージョン | 選定理由                                      |
| -------------------- | ---------- | --------------------------------------------- |
| **React**            | ^19.0.0    | 最新の React 機能活用、コンポーネント再利用性 |
| **Vite**             | ^4.5.7     | 高速な開発体験、HMR 最適化                    |
| **React Hook Form**  | ^7.54.2    | 高性能フォーム管理、バリデーション統合        |
| **Yup**              | ^1.6.1     | 宣言的スキーマバリデーション                  |
| **React Router DOM** | ^7.1.3     | SPA 最適化ルーティング                        |
| **Axios**            | ^1.7.9     | Promise-based HTTP 通信、インターセプター活用 |

### **⚙️ バックエンド技術選定**

| 技術                  | バージョン | 選定理由                                     |
| --------------------- | ---------- | -------------------------------------------- |
| **Node.js + Express** | ^4.21.2    | 軽量、高速、豊富なエコシステム               |
| **Sequelize**         | ^6.37.5    | PostgreSQL 最適化、マイグレーション管理      |
| **PostgreSQL**        | 17         | ACID 準拠、JSON 型サポート、スケーラビリティ |
| **bcrypt**            | ^5.1.1     | 業界標準の認証セキュリティ                   |
| **jsonwebtoken**      | ^9.0.2     | ステートレス認証、SPA 最適化                 |

### **🔧 開発・運用ツール**

- **Docker Compose**: 一貫した開発環境構築
- **ESLint + Prettier**: コード品質とスタイル統一
- **Sequelize CLI**: データベースマイグレーション管理
- **Nodemon**: 開発効率化（自動リスタート）

---

## ✨ **実装機能とエンジニアリング**

### **🔐 認証システム**

```javascript
// JWT + bcryptによるセキュアな認証実装
// セッション管理とプライベートルート保護
```

- **技術的特徴**: JWT トークンベース認証、パスワードハッシュ化
- **セキュリティ**: bcrypt salt rounds、CORS 設定
- **UX 考慮**: 認証状態の永続化、自動ログアウト

### **📊 ワークアウト記録システム**

```javascript
// 柔軟なデータ構造設計
{
  exerciseType: 'strength' | 'cardio',
  repsDetail: JSON, // セット毎の詳細記録
  // 筋力トレーニング: sets, reps, weight
  // 有酸素運動: distance, duration, intensity
}
```

- **設計思想**: 多様な運動形式に対応する柔軟なスキーマ
- **データ型**: JSON 型活用による詳細記録対応
- **拡張性**: 新しい運動タイプの容易な追加

### **🎯 目標管理システム**

```javascript
// SMART目標をサポートするデータモデル
{
  targetAmount: Integer,
  progressAmount: Integer,
  status: 'in_progress' | 'completed' | 'paused'
}
```

- **進捗計算**: リアルタイム達成率計算
- **状態管理**: 目標ライフサイクル管理
- **モチベーション**: 視覚的な進捗表示

### **📈 履歴分析機能**

- **データ可視化**: 時系列でのパフォーマンス追跡
- **フィルタリング**: 期間・運動種目別絞り込み
- **統計表示**: 平均・最高記録・改善率

---

## 🚀 **セットアップ・起動手順**

### **📋 必要な環境**

- **Node.js**: 18.0.0 以上
- **Docker & Docker Compose**: 最新版
- **PostgreSQL**: 17（Docker で自動構築）

### **⚡ クイックスタート**

```bash
# 1. リポジトリのクローン
git clone https://github.com/yourusername/fittrack-app.git
cd fittrack-app

# 2. データベース起動（Docker）
docker-compose up -d

# 3. バックエンドセットアップ
cd backend
npm install
npm run dev

# 4. フロントエンドセットアップ（新しいターミナル）
cd frontend
npm install
npm run dev
```

### **🔧 環境変数設定**

```bash
# backend/.env (作成してください)
DB_HOST=localhost
DB_PORT=5433
DB_NAME=workout_db
DB_USER=postgres
DB_PASSWORD=3106
JWT_SECRET=your-secret-key-here
```

### **🗄️ データベース初期化**

```bash
# マイグレーション実行
cd backend
npx sequelize-cli db:migrate

# 初期データ投入（オプション）
npx sequelize-cli db:seed:all
```

---

## 🔗 **API 仕様**

### **認証エンドポイント**

```http
POST /authrouter/register  # ユーザー登録
POST /authrouter/login     # ログイン
```

### **ワークアウト管理**

```http
GET    /workouts           # ワークアウト一覧取得
POST   /workouts           # 新規ワークアウト記録
PUT    /workouts/:id       # ワークアウト更新
DELETE /workouts/:id       # ワークアウト削除
```

### **目標管理**

```http
GET    /goals              # 目標一覧
POST   /goals              # 新規目標設定
PUT    /goals/:id          # 目標更新
```

---

## 🎓 **開発で学んだこと・工夫した点**

### **🏗️ アーキテクチャ設計**

- **関心の分離**: MVC+サービス層によるコード整理
- **スケーラビリティ**: 機能追加に耐えうる柔軟な設計
- **保守性**: 明確なディレクトリ構造とネーミング規則

### **⚡ パフォーマンス最適化**

- **Vite 活用**: 高速な HMR 開発体験
- **バンドル最適化**: Code Splitting 実装準備
- **データベース**: インデックス設計とクエリ最適化

### **🔒 セキュリティ対策**

- **認証強化**: JWT 有効期限管理
- **入力検証**: フロント・バック双方でのバリデーション
- **CORS 設定**: 適切なオリジン制限

### **🎯 課題解決プロセス**

1. **データモデル設計**: 異なる運動タイプの統合的な管理方法
2. **状態管理**: React Context + useReducer による認証状態管理
3. **フォーム最適化**: React Hook Form + Yup による効率的なバリデーション

---

## 🚀 **今後の展望・実装予定**

### **📱 機能拡張**

- [ ] **データ可視化**: Chart.js/D3.js によるグラフ表示
- [ ] **ソーシャル機能**: 友達とのワークアウト共有
- [ ] **AI 提案機能**: パフォーマンス分析に基づく運動提案
- [ ] **モバイル対応**: Progressive Web App (PWA)

### **🏗️ 技術的改善**

- [ ] **TypeScript 移行**: 型安全性向上
- [ ] **テスト実装**: Jest + React Testing Library
- [ ] **CI/CD 構築**: GitHub Actions 自動デプロイ
- [ ] **監視・ログ**: 運用監視システム構築

### **⚡ パフォーマンス向上**

- [ ] **Redis 導入**: セッションキャッシュ最適化
- [ ] **CDN 活用**: 静的ファイル配信最適化
- [ ] **Database Optimization**: クエリ最適化とインデックス改善

---

## 🛠️ **トラブルシューティング**

### **よくある問題と解決方法**

**Docker 起動エラー**

```bash
# ポート競合の場合
docker-compose down
lsof -ti:5433 | xargs kill -9
docker-compose up -d
```

**データベース接続エラー**

```bash
# 接続確認
docker exec -it postgres_container psql -U postgres -d workout_db
```

**フロントエンド起動失敗**

```bash
# node_modules再インストール
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 **開発情報**

### **プロジェクト統計**

- **開発期間**: 進行中（継続開発）
- **コミット数**: 実装継続中
- **技術選定時間**: 2 週間の技術調査
- **主要機能実装**: 4 週間

### **コード品質管理**

```bash
# コード品質チェック
npm run lint          # ESLint実行
npm run format        # Prettier実行
npm run test          # テスト実行（実装予定）
```

---

## 🤝 **コントリビューション**

プロジェクトに興味を持っていただき、ありがとうございます！

### **開発への参加方法**

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

### **バグレポート・機能提案**

[Issues](https://github.com/yourusername/fittrack-app/issues)でお気軽にご報告ください。

---

## 📄 **ライセンス**

このプロジェクトは[MIT License](./LICENSE)の下で公開されています。

---

## 👨‍💻 **開発者について**

**技術力を証明する個人プロジェクト**として開発。

- フルスタック開発経験の実証
- モダンな Web 技術スタックの習得
- 実際のプロダクト開発プロセスの経験

### **連絡先**

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- **Email**: your.email@example.com

---

<div align="center">

**🎯 自分の限界を超えるために、今日も一歩前進しよう 🏋️‍♂️**

_Made with ❤️ and lots of ☕_

</div>
