# 🏋️‍♂️ **FitStart** - 個人向けフィットネストラッキングアプリ

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

> **現代人のフィットネス習慣を革新する、包括的なワークアウト管理システム**

FitStart は、ユーザーごとのトレーニングカスタマイズ性とトレーニング実施回数の数値化によってトレーニングの継続性サポートを目的とする Web アプリケーションです。運動初心者が直面する「**継続性という最大の障壁**」を、データ駆動型のユーザー体験設計と先月比較の数値化により解決します。

---

## 📸 **プロジェクトデモ**

<!-- スクリーンショットやGIFをここに配置 -->

```
🎯 主要画面のスクリーンショット
├── ダッシュボード（トレーニング概要）
├── ワークアウト記録フォーム
├── トレーニング履歴
```

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

## 🚀 **セットアップ・起動手順**

### **📋 必要な環境**

- **Node.js**: 18.0.0 以上
- **Docker & Docker Compose**: 最新版
- **PostgreSQL**: 17（Docker で自動構築）

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

<div align="center">

**🎯 自分の限界を超えるために、今日も一歩前進しよう 🏋️‍♂️**

_Made with ❤️ and lots of ☕_

</div>
