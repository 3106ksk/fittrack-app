# FitStart 機能ドキュメント

## ドキュメント構成

本ディレクトリは、FitStartアプリケーションの機能別ドキュメントを管理しています。
実際の開発現場のベストプラクティスに従い、以下の構成で整理されています。

## ディレクトリ構造

```
features/
├── monthly-goals/           # 月次目標機能
│   ├── requirements/       # 要件定義
│   │   └── functional-requirements.md
│   ├── design/            # 設計書
│   │   └── database-design.md
│   └── api-spec/          # API仕様
│       └── openapi.yaml
│
├── monthly-view/           # 月別ワークアウトUI機能
│   ├── requirements/      # 要件定義
│   ├── design/           # 設計書
│   │   └── component-architecture.md
│   └── ui-spec/          # UI仕様
│
└── README.md             # このファイル
```

## ドキュメント種別

### 1. Requirements（要件定義）
- **functional-requirements.md**: 機能要件書
- **non-functional-requirements.md**: 非機能要件書（パフォーマンス、セキュリティなど）
- ユーザーストーリー、受け入れ条件を含む

### 2. Design（設計書）
- **database-design.md**: データベース設計
- **component-architecture.md**: コンポーネント設計
- **system-architecture.md**: システムアーキテクチャ
- 実装の詳細設計を記載

### 3. API Spec（API仕様）
- **openapi.yaml**: OpenAPI 3.0形式のAPI仕様
- リクエスト/レスポンス定義
- エラー仕様

### 4. UI Spec（UI仕様）
- 画面設計、ワイヤーフレーム
- インタラクション仕様
- レスポンシブデザイン仕様

## ドキュメント命名規則

### ファイル名
- 小文字とハイフンを使用: `functional-requirements.md`
- 機能を明確に表す名前を使用
- バージョン番号は含めない（Gitで管理）

### 文書番号
各ドキュメントには以下の形式で文書番号を付与：
- `FRD-XX-NNN`: Functional Requirements Document
- `DDD-XX-NNN`: Database Design Document
- `CAD-XX-NNN`: Component Architecture Document
- `API-XX-NNN`: API Specification

XX: 機能略称（MG: Monthly Goals, MV: Monthly View）
NNN: 連番

## バージョン管理

### バージョン番号
セマンティックバージョニング（x.y.z）を採用：
- **x**: メジャーバージョン（大規模変更）
- **y**: マイナーバージョン（機能追加）
- **z**: パッチバージョン（修正）

### ステータス
- **Draft**: 草案
- **Review**: レビュー中
- **Approved**: 承認済み
- **Deprecated**: 非推奨

## 更新履歴の記載

各ドキュメントには改訂履歴セクションを設ける：

```markdown
## 改訂履歴

| バージョン | 日付 | 変更者 | 変更内容 |
|-----------|------|--------|----------|
| 1.0.0 | 2025-09-13 | Team | 初版作成 |
| 1.1.0 | 2025-09-20 | Team | API仕様追加 |
```

## テンプレート

新規ドキュメント作成時は、以下のヘッダーを使用：

```markdown
# [機能名] - [ドキュメント種別]

**文書番号**: XXX-YY-001
**バージョン**: 1.0.0
**作成日**: YYYY-MM-DD
**作成者**: [作成者名]
**ステータス**: Draft

## 改訂履歴
[履歴表]

## 1. 概要
[内容]
```

## 関連リンク

- [プロジェクトREADME](../../README.md)
- [開発ガイドライン](../../FITTRACK_LLM_DEVELOPMENT_GUIDELINES.md)
- [API仕様書](../specifications/)

## 問い合わせ

ドキュメントに関する質問や改善提案は、GitHubのIssueまたはPull Requestでお願いします。