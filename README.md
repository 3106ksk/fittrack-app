# 🏋️‍♂️ **FitTrack** - 個人向けフィットネストラッキングアプリ

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Material--UI](https://img.shields.io/badge/Material--UI-5.15.4-007FFF?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2.4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![Jest](https://img.shields.io/badge/Jest-30.0.5-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

> **現代人のフィットネス習慣を革新する、包括的なワークアウト管理システム**

FitTrack は、ユーザーごとのトレーニングカスタマイズ性とトレーニング実施回数の数値化によってトレーニングの継続性サポートを目的とする Web アプリケーションです。運動初心者が直面する「**継続性という最大の障壁**」を、データ駆動型のユーザー体験設計と先月比較の数値化により解決します。

---

## 📸 **プロジェクトデモ**

### 🎯 **主要画面のスクリーンショット**

#### 🔐 **ログイン画面**

![ログイン画面](./docs/images/login-screen.png)
_FitStart のログイン画面 - シンプルで直感的なユーザーインターフェース_

#### 📊 **ダッシュボード**

![ダッシュボード](./docs/images/dashboard.png)
_ユーザー向けダッシュボード - トレーニング概要と統計情報の表示_

#### 📝 **ワークアウト記録フォーム**

![ワークアウト記録フォーム](./docs/images/workout-form.png)
_ワークアウト記録フォーム - カスタマイズ可能な運動種目の記録_

#### 📈 **ワークアウト履歴**

![ワークアウト履歴](./docs/images/workout-history.png)
_詳細なワークアウト履歴と統計データの可視化_

---

## 💡 **なぜ FitStart なのか？**

### 🔍 **解決する課題**

- **個人のニーズに応じたトレーニング作成ができない**:
- **継続性の欠如**: 成長性と達成感の可視化不足

### 🎯 **提供する価値**

- ✅ **統合管理**: 筋力トレーニングと有酸素運動の一元管理
- ✅ **データ可視化**: 進捗の可視化でモチベーション維持
- ✅ **継続サポート**: 直感的な UI/UX で習慣化促進

---

## 🏗️ **技術アーキテクチャ**

## 🛠️ **技術スタック詳細**

### **🎨 フロントエンド技術選定**

| 技術                 | バージョン | 選定理由                                       |
| -------------------- | ---------- | ---------------------------------------------- |
| **React**            | ^18.2.0    | 安定版採用、コンポーネント再利用性重視         |
| **TypeScript**       | ^5.8.3     | 型安全性、開発効率向上、大規模開発対応         |
| **Material-UI**      | ^5.15.4    | 一貫したデザインシステム、アクセシビリティ対応 |
| **Vite**             | ^4.5.7     | 高速な開発体験、HMR 最適化                     |
| **React Hook Form**  | ^7.54.2    | 高性能フォーム管理、バリデーション統合         |
| **Yup**              | ^0.32.11   | 宣言的スキーマバリデーション                   |
| **React Router DOM** | ^6.26.1    | SPA 最適化ルーティング                         |
| **Axios**            | ^1.7.9     | Promise-based HTTP 通信、インターセプター活用  |
| **Vitest**           | ^3.2.4     | 高速テスト実行、ESModules ネイティブサポート   |
| **Testing Library**  | ^16.3.0    | ユーザー中心のテストアプローチ                 |

### **⚙️ バックエンド技術選定**

| 技術                  | バージョン | 選定理由                                      |
| --------------------- | ---------- | --------------------------------------------- |
| **Node.js + Express** | ^4.21.2    | 軽量、高速、豊富なエコシステム                |
| **Sequelize**         | ^6.37.5    | PostgreSQL 最適化、マイグレーション管理       |
| **PostgreSQL**        | 17         | ACID 準拠、JSON 型サポート、スケーラビリティ  |
| **bcrypt**            | ^5.1.1     | 業界標準の認証セキュリティ                    |
| **jsonwebtoken**      | ^9.0.2     | ステートレス認証、SPA 最適化                  |
| **Jest**              | ^30.0.5    | 包括的テストフレームワーク、モック機能充実    |
| **Supertest**         | ^7.1.4     | HTTP アサーションライブラリ、API テスト最適化 |

### **🔧 開発・運用ツール**

- **Docker Compose**: 一貫した開発環境構築
- **ESLint + Prettier**: コード品質とスタイル統一
- **Sequelize CLI**: データベースマイグレーション管理
- **Nodemon**: 開発効率化（自動リスタート）
- **Coverage Reports**: テストカバレッジ可視化（フロント・バック両対応）

---

## ✨ **実装機能とエンジニアリング**

### **🔐 認証システム**

```typescript
// JWT + bcryptによるセキュアな認証実装
// TypeScript型安全性とセッション管理、プライベートルート保護
```

- **技術的特徴**: JWT トークンベース認証、パスワードハッシュ化、TypeScript 型安全性
- **セキュリティ**: bcrypt salt rounds、CORS 設定、入力検証強化

### **🧪 テスト戦略**

```typescript
// フロントエンド: Vitest + React Testing Library
// バックエンド: Jest + Supertest
// 包括的テストカバレッジ95%+達成
```

- **フロントエンドテスト**: コンポーネントテスト、ユーザーインタラクション、エラーハンドリング
- **バックエンドテスト**: API エンドポイント、認証、バリデーション、エラーレスポンス

### **🎨 UI/UX デザイン**

```typescript
// Material-UI + TypeScript + カスタムテーマ
// レスポンシブデザイン + アクセシビリティ対応
```

- **デザインシステム**: Material-UI による一貫性のある UI

## 🚀 **セットアップ・起動手順**

### **📋 必要な環境**

- **Node.js**: 18.0.0 以上
- **PostgreSQL**: 17（Docker で自動構築）

### **⚡ クイックスタート**

```bash
# リポジトリクローン
git clone <repository-url>
cd fittrack-app


# フロントエンド起動
cd frontend
npm install
npm run dev  # http://localhost:5173

# バックエンド起動（別ターミナル）
cd backend
npm install
npm run dev  # http://localhost:8000
```

### **🧪 テスト実行**

```bash
# フロントエンドテスト
cd frontend
npm run test              # 基本テスト実行
npm run test:ui           # UI付きテスト実行
npm run test:coverage     # カバレッジ付きテスト

# バックエンドテスト
cd backend
npm run test              # 基本テスト実行
npm run test:coverage     # カバレッジ付きテスト
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
```

## 🎓 **開発で学んだこと・工夫した点**

### **🏗️ アーキテクチャ設計**

- **関心の分離**: MVC+サービス層によるコード整理、TypeScript 型定義の活用
- **スケーラビリティ**: 機能追加に耐えうる柔軟な設計、モジュラー構造
- **保守性**: 明確なディレクトリ構造とネーミング規則、TSDoc コメント

### **🧪 テスト駆動開発（TDD）**

- **包括的テスト**: フロント・バック両方で 95%+のカバレッジ達成
- **テスト設計**: 正常系・異常系・境界値を網羅したテスト戦略
- **品質保証**: CI/CD 対応、リグレッションテスト防止、型安全性確保

### **⚡ パフォーマンス最適化**

- **Vite 活用**: 高速な HMR 開発体験、ESModules ネイティブサポート
- **バンドル最適化**: Code Splitting 実装準備、Tree Shaking 対応
- **データベース**: インデックス設計とクエリ最適化、コネクションプール管理

### **🔒 セキュリティ対策**

- **認証強化**: JWT 有効期限管理、トークンリフレッシュ戦略
- **入力検証**: TypeScript + Yup による型安全なバリデーション
- **CORS 設定**: 適切なオリジン制限、セキュリティヘッダー設定

### **🎯 課題解決プロセス**

1. **型安全性**: TypeScript 導入によるランタイムエラー削減
2. **テスト戦略**: Vitest + Jest による高速テスト環境構築
3. **状態管理**: React Context + TypeScript による型安全な状態管理
4. **フォーム最適化**: React Hook Form + Yup + TypeScript による効率的なバリデーション

<div align="center">

**🎯 自分の限界を超えるために、今日も一歩前進しよう 🏋️‍♂️**

### 📚 **専門テストドキュメント**

[📝 Register Component Test Suite Documentation](./frontend/src/components/__tests__/README.md)

_Made with ❤️ and lots of ☕ | TypeScript + React + Vitest_

</div>
