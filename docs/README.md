# 📚 FitTrack ドキュメント構造

このドキュメントは、プロジェクトのドキュメント管理方針と各ディレクトリの役割を説明します。

## 📂 ディレクトリ構造

```
docs/
├── README.md                 # このファイル（ドキュメント構造の説明）
│
├── features/                 # 機能別ドキュメント（新機能開発）
│   └── {feature-name}/       # 各機能のディレクトリ
│       ├── requirements/     # 要件定義
│       ├── design/          # 設計書
│       ├── implementation/  # 実装ガイド
│       └── research/        # 調査・分析
│
├── refactoring/             # リファクタリング関連 ✨NEW
│   ├── active/              # 進行中のリファクタリング
│   │   └── {YYYY-MM-component}/  # 日付とコンポーネント名
│   │       ├── plan.md      # 実施計画書
│   │       ├── checklist.md # チェックリスト
│   │       └── issue.md     # GitHub Issue テンプレート
│   └── archived/            # 完了したリファクタリング
│
├── architecture/            # アーキテクチャ文書 ✨NEW
│   ├── decisions/          # ADR (Architecture Decision Records)
│   │   └── ADR-{番号}-{タイトル}.md
│   ├── patterns/           # デザインパターン
│   └── guidelines/         # コーディングガイドライン
│
├── api/                     # API仕様書 ✨NEW
│   ├── endpoints/          # エンドポイント定義
│   ├── schemas/            # データスキーマ
│   └── examples/           # リクエスト/レスポンス例
│
├── specifications/          # 技術仕様書
│   ├── frontend/           # フロントエンド仕様
│   ├── backend/            # バックエンド仕様
│   └── infrastructure/     # インフラ仕様
│
├── security/               # セキュリティ関連
│   ├── policies/           # セキュリティポリシー
│   ├── audits/            # 監査レポート
│   └── guidelines/        # セキュリティガイドライン
│
├── operations/             # 運用ドキュメント ✨NEW
│   ├── deployment/         # デプロイ手順
│   ├── monitoring/         # 監視設定
│   ├── troubleshooting/    # トラブルシューティング
│   └── runbooks/          # 運用手順書
│
├── testing/                # テスト関連 ✨NEW
│   ├── strategies/        # テスト戦略
│   ├── plans/             # テスト計画
│   └── reports/           # テストレポート
│
└── images/                 # 画像・図表リソース
```

## 📝 各ディレクトリの詳細説明

### `/refactoring/` - リファクタリング管理
**目的**: リファクタリング作業の体系的な管理

#### `/refactoring/active/`
- **用途**: 現在進行中のリファクタリング
- **命名規則**: `{YYYY-MM-DD}-{component-name}/`
- **必須ファイル**:
  - `plan.md`: 実施計画と手順
  - `checklist.md`: 作業チェックリスト
  - `issue.md`: GitHub Issueテンプレート
- **例**: `2024-09-18-workout-form/`

#### `/refactoring/archived/`
- **用途**: 完了したリファクタリングのアーカイブ
- **移動タイミング**: PR マージ後
- **保持期間**: 6ヶ月（参照価値があるもの）

### `/architecture/` - アーキテクチャ文書
**目的**: 技術的な意思決定の記録と共有

#### `/architecture/decisions/`
- **ADR形式**: `ADR-{番号}-{タイトル}.md`
- **内容**:
  - 背景と問題
  - 検討した選択肢
  - 決定事項
  - 結果と影響
- **例**: `ADR-001-component-structure.md`

### `/api/` - API仕様
**目的**: フロントエンド/バックエンド間のインターフェース定義

### `/operations/` - 運用ドキュメント
**目的**: 本番環境の運用に必要な情報

## 🔄 ドキュメントのライフサイクル

### 1. 新機能開発の場合
```
/features/{feature-name}/ に作成
└─ requirements → design → implementation
```

### 2. リファクタリングの場合
```
/refactoring/active/{date-component}/ に作成
└─ 完了後 → /refactoring/archived/ へ移動
```

### 3. アーキテクチャ決定の場合
```
/architecture/decisions/ADR-{番号}-{タイトル}.md に作成
└─ 永続的に保持
```

## 📌 命名規則

### ファイル名
- **小文字とハイフン**: `workout-form-refactor.md`
- **日付形式**: `YYYY-MM-DD` (例: `2024-09-18`)
- **明確な名前**: 内容が推測できる名前を使用

### ディレクトリ名
- **小文字**: `refactoring`, `architecture`
- **複数形**: コレクションの場合 `decisions`, `patterns`
- **単数形**: 単一概念の場合 `security`, `testing`

## 🏷️ ドキュメントテンプレート

### リファクタリング計画書テンプレート
```markdown
# [コンポーネント名] リファクタリング計画

## 概要
## 目的
## 現状分析
## 目標設計
## 実装手順
## リスク評価
## チェックリスト
```

### ADRテンプレート
```markdown
# ADR-{番号}: {タイトル}

## ステータス
提案中 | 承認済み | 却下 | 廃止 | 置換

## コンテキスト
## 決定
## 結果
## 代替案
```

## 🔍 ドキュメント検索のヒント

```bash
# 特定の種類のドキュメントを検索
find docs/refactoring -name "*.md"

# 最近更新されたドキュメントを表示
find docs -name "*.md" -mtime -7

# キーワード検索
grep -r "WorkoutForm" docs/
```

## 📅 メンテナンス方針

- **四半期レビュー**: archived内の古いドキュメントを確認
- **年次更新**: architecture/guidelinesの見直し
- **継続的改善**: 新しいニーズに応じてディレクトリ追加

## 🤝 貢献ガイドライン

1. 新しいドキュメントは適切なディレクトリに配置
2. テンプレートに従って記述
3. 命名規則を遵守
4. 画像は`/images/`に配置し、相対パスで参照
5. 完了したリファクタリングは必ずarchivedへ移動

---
最終更新: 2024-09-18
メンテナー: Development Team