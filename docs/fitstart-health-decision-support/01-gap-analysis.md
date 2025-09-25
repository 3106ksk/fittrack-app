# 差分分析：現状と目標のギャップ

## 📋 概要

FitStartの現状実装と、「健康意思決定支援プラットフォーム」として必要な機能のギャップを分析します。

## ✅ 既に実装済みの強み（再利用ポイント）

### 認証・セキュリティ基盤
- **JWT認証システム** (`/backend/routes/authRoutes.js`)
  - bcryptによる安全なパスワード管理
  - トークンベースのステートレス認証
  - 既存の認証ミドルウェアを活用可能

### データ記録・管理
- **ワークアウトCRUD機能** (`/backend/models/Workout.js`)
  - 筋トレ・有酸素運動の記録
  - JSONフィールドによる柔軟なデータ構造
  - 既存のデータモデルを拡張可能

### 外部連携
- **Strava OAuth連携** (`/backend/routes/stravaRoutes.js`)
  - 認証フロー実装済み
  - トークン暗号化保存
  - データ同期の基盤あり

### フロントエンド
- **統計ダッシュボード** (`/frontend/src/pages/Dashboard.jsx`)
  - 週次・月次集計ロジック
  - Material-UI統合
  - レスポンシブデザイン

### インフラ
- **Docker環境** (`docker-compose.yml`)
- **TypeScript設定** (フロントエンド)
- **テスト環境** (Jest, Vitest)

## ❌ 不足点と必要な新規開発

### 1. Small Wins Engine（健康翻訳層）
**現状**: 運動の量的記録のみ
**必要**: WHO基準に基づく健康指標への翻訳

- 週150分達成 → 心疾患リスク評価
- Zone2継続時間 → 脂質代謝改善指標
- 連続日数 → 習慣化スコア
- 前週比較 → 成長トレンド

### 2. Consent Center（同意管理）
**現状**: データ利用同意機能なし
**必要**: GDPR/個人情報保護法準拠の同意管理

- データ利用目的の明示
- 個別同意のトグル管理
- 削除権の保証
- 監査ログ

### 3. データエクスポート
**現状**: エクスポート機能なし
**必要**: 医療連携用フォーマット

- PDF健康レポート
- CSV生データ
- 医療機関向けフォーマット
- 日付範囲フィルタリング

### 4. リアルタイム同期
**現状**: 手動同期のみ（ポーリング）
**必要**: Webhook による即時更新

- イベント駆動アーキテクチャ
- 冪等性保証
- レート制限対応
- キューイング

### 5. 睡眠データ統合
**現状**: 運動データのみ
**必要**: 包括的な健康指標

- HealthKit/Health Connect連携
- 睡眠の質評価
- 運動と睡眠の相関分析

### 6. 医療免責表示
**現状**: 免責事項なし
**必要**: SaMD回避のための明確な表示

- Non-medical声明
- 利用規約への組み込み
- 初回ログイン時の同意

## 🎯 就活アピールポイント

### 即アピール可能な要素
1. **Strava連携実装** - OAuth2.0の理解
2. **統計可視化** - データ分析能力
3. **型安全な実装** - TypeScript活用
4. **セキュアな設計** - JWT認証、暗号化

### 今週中に追加すべき要素
1. **Small Wins Engine** - アルゴリズム設計能力
2. **Consent Center** - プライバシー意識
3. **PDF/CSV Export** - 実用的な機能実装
4. **パフォーマンス最適化** - 技術的深さ

## 📍 主要ファイルマッピング

```
backend/
├── routes/
│   ├── authRoutes.js       # ✅ 認証API（再利用）
│   ├── workouts.js          # ✅ CRUD API（拡張）
│   ├── stravaRoutes.js      # ✅ 連携API（拡張）
│   ├── insights.js          # ❌ 新規作成必要
│   ├── consents.js          # ❌ 新規作成必要
│   └── export.js            # ❌ 新規作成必要
├── models/
│   ├── User.js              # ✅ 既存（拡張）
│   ├── Workout.js           # ✅ 既存（維持）
│   ├── Insight.js           # ❌ 新規作成必要
│   └── Consent.js           # ❌ 新規作成必要
└── services/
    ├── stravaService.js     # ✅ 既存（拡張）
    ├── SmallWinsService.js  # ❌ 新規作成必要
    └── ExportService.js     # ❌ 新規作成必要

frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx    # ✅ 既存（拡張）
│   │   ├── ConsentCenter.tsx # ❌ 新規作成必要
│   │   └── WeeklyHealth.tsx  # ❌ 新規作成必要
│   └── components/
│       ├── SmallWinCard.tsx  # ❌ 新規作成必要
│       └── ExportButton.tsx  # ❌ 新規作成必要
```

## 🔄 移行戦略

1. **既存機能への影響を最小化**
   - 新機能は独立したモジュールとして追加
   - 既存APIは維持、新エンドポイントを追加

2. **段階的なリリース**
   - Week1: Small Wins（読み取り専用）
   - Week2: Consent & Export
   - Week3: Webhook統合
   - Week4: 睡眠データ（オプション）

3. **後方互換性の維持**
   - 既存のワークアウトデータ構造を保持
   - 新フィールドはオプショナルとして追加

## 📊 工数見積もり

| 機能 | 優先度 | 工数 | 依存関係 |
|-----|--------|------|----------|
| Small Wins Engine | P0 | 8h | なし |
| Consent Center | P1 | 6h | なし |
| PDF/CSV Export | P1 | 6h | Small Wins |
| Webhook | P2 | 6h | なし |
| 睡眠統合 | P3 | 8h | Small Wins |
| E2Eテスト | P2 | 4h | 全機能 |

**合計見積もり**: 38時間（約1週間のフルタイム開発）

---

**作成日**: 2025年9月26日
**作成者**: FitStart Tech Lead