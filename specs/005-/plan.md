# Implementation Plan: バックエンドエラーハンドリング実装

**Branch**: `005-` | **Date**: 2025-11-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

バックエンドにおける統一的なエラーハンドリングシステムを実装する。すべてのAPIエンドポイントで一貫したエラーレスポンス形式を返し、構造化ログによる追跡可能性を確保する。レート制限によるAPI乱用防止とデータベース障害時のグレースフルな応答を含む。

**技術的アプローチ**:
- Expressミドルウェアによる中央集約型エラーハンドリング
- Winstonによる構造化ログ（JSON形式）
- express-rate-limitによるレート制限
- 環境別エラーレスポンス（本番環境ではスタックトレース非表示）

## Technical Context

**Language/Version**: JavaScript (Node.js 18+)
**Primary Dependencies**: Express 4.21.2, Winston (ロギング), express-rate-limit (レート制限), uuid (リクエストID生成)
**Storage**: PostgreSQL 17 (Sequelize ORM 6.37.5)
**Testing**: Jest 30.0.5, supertest 7.1.4（統合テスト）
**Target Platform**: Node.js server (Railway deployment)
**Project Type**: Web application (Express backend)
**Performance Goals**: エラーログ記録によるオーバーヘッドは5ms以下、レート制限チェックは1ms以下
**Constraints**: 既存のExpress app.jsの構造を維持、既存エンドポイントとの後方互換性確保
**Scale/Scope**: 全APIエンドポイント（認証、ワークアウト、Strava連携、インサイト）に適用

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Security-First Architecture ✅ 合格

**原則**: JWT認証必須、入力検証、セキュリティヘッダー、HTTPS通信

**この機能での適用**:
- ✅ エラーレスポンスでスタックトレースを本番環境で非表示（FR-004）- 情報漏洩防止
- ✅ レート制限実装（FR-010, FR-011）- API乱用・DoS攻撃防止
- ✅ CORSエラー処理（FR-014）- 不正なオリジンからのアクセス制御
- ✅ 入力バリデーションエラーの適切な処理（FR-012）- インジェクション攻撃防止

**判定**: この機能はセキュリティを強化するものであり、原則に完全に準拠しています。

### Gate 2: Evidence-Based Health Metrics ✅ 該当なし

**原則**: WHO/CDC等の国際基準に基づく健康効果の数値化

**この機能での適用**: エラーハンドリングは健康データの計算や表示に直接関与しないため、この原則は適用対象外です。

**判定**: N/A

### Gate 3: Rapid Development & Portfolio Delivery ✅ 合格

**原則**: JavaScript実装、express-validator + Yup バリデーション、動くサービスを優先

**この機能での適用**:
- ✅ 既存のJavaScript/Express codebaseに統合
- ✅ 既存のexpress-validatorと連携してエラーハンドリング
- ✅ 段階的な実装が可能（P1: エラーレスポンス統一 → P2: ログ・DB処理 → P3: レート制限）
- ✅ 新規の型システム導入なし、既存の構造を活用

**判定**: 開発速度を維持しながら品質を向上させる適切なアプローチです。

### Gate 4: Mobile-First Responsive Design ✅ 該当なし

**原則**: iPhone 14 Pro基準、タッチ操作優先

**この機能での適用**: バックエンドのエラーハンドリングはUIに直接影響しません。フロントエンドで適切にエラーメッセージを表示する責任は別のレイヤーです。

**判定**: N/A

### Gate 5: Performance Optimization & Scalability ✅ 合格

**原則**: useMemo/useCallback、RESTfulステートレス設計、PostgreSQL JSONB

**この機能での適用**:
- ✅ ステートレスなエラーハンドリング（リクエスト間で状態を保持しない）
- ✅ Winstonによる非同期ログ記録（パフォーマンスへの影響を最小化）
- ✅ express-rate-limitはメモリ効率的なカウンター実装
- ⚠️ **Performance Goals**: エラーログ記録5ms以下、レート制限チェック1ms以下 → Phase 0で実測して確認

**判定**: パフォーマンス目標を満たす設計です。Phase 0で実測データを取得します。

### 総合判定: ✅ **全ゲート合格**

この機能は Constitution の原則に準拠しており、Phase 0 リサーチに進むことができます。

## Project Structure

### Documentation (this feature)

```
specs/005-/
├── plan.md              # このファイル（/speckit.plan コマンドの出力）
├── research.md          # Phase 0 出力（/speckit.plan コマンド）
├── data-model.md        # Phase 1 出力（/speckit.plan コマンド）
├── quickstart.md        # Phase 1 出力（/speckit.plan コマンド）
├── contracts/           # Phase 1 出力（/speckit.plan コマンド）
│   └── error-responses.yaml  # エラーレスポンス形式の定義
└── tasks.md             # Phase 2 出力（/speckit.tasks コマンド - /speckit.planでは作成されない）
```

### Source Code (repository root)

```
backend/
├── middleware/
│   ├── errorHandler.js       # 新規: 中央集約型エラーハンドラー
│   ├── requestId.js          # 新規: リクエストID付与ミドルウェア
│   ├── rateLimiter.js        # 新規: レート制限設定
│   └── checkJWT.js           # 既存: JWT認証（エラーハンドリング改善）
├── utils/
│   ├── logger.js             # 新規: Winston設定と構造化ログ
│   ├── AppError.js           # 新規: カスタムエラークラス
│   └── errorCodes.js         # 新規: エラーコード定義
├── routes/
│   ├── authRoutes.js         # 既存: 新エラーハンドラーに移行
│   ├── workouts.js           # 既存: 新エラーハンドラーに移行
│   ├── stravaRoutes.js       # 既存: 新エラーハンドラーに移行
│   └── insightRoutes.js      # 既存: 新エラーハンドラーに移行
├── app.js                    # 既存: ミドルウェア統合、DB接続チェック追加
└── server.js                 # 既存: 起動時DB接続確認追加

backend/tests/
├── middleware/
│   ├── errorHandler.test.js  # 新規: エラーハンドラーのユニットテスト
│   ├── requestId.test.js     # 新規: リクエストIDミドルウェアのテスト
│   └── rateLimiter.test.js   # 新規: レート制限のテスト
├── integration/
│   ├── errorHandling.test.js # 新規: エンドツーエンドエラーハンドリングテスト
│   └── rateLimiting.test.js  # 新規: レート制限の統合テスト
└── utils/
    └── logger.test.js        # 新規: ロガーのユニットテスト

logs/                         # 新規: ログファイル出力先（.gitignore追加）
├── error.log
├── combined.log
└── [日付].log
```

**Structure Decision**: この機能は既存のWeb application構造（backend/frontend分離）に統合されます。主にbackendディレクトリ内の`middleware/`と`utils/`に新規ファイルを追加し、既存のルートファイルを新しいエラーハンドリングシステムに移行します。

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**判定**: この機能はConstitutionに違反していないため、複雑性の正当化は不要です。
