# 月別統計機能 - ファイル構造設計

**文書番号**: FSD-MS-001
**バージョン**: 1.0.0
**作成日**: 2025-09-18
**ステータス**: Active

## 1. ディレクトリ構造

### 1.1 現在のファイル構造
```
frontend/src/
├── components/
│   └── statistics/              # 統計関連コンポーネント
│       ├── WorkoutStatistics.jsx   # メインコンポーネント（拡張対象）
│       ├── StatCard.jsx            # 統計カード（変更不要）
│       └── StatisticsLoading.jsx   # ローディング表示（変更不要）
├── services/
│   └── StatisticsService.js    # 統計計算ロジック（拡張対象）
└── pages/
    ├── Dashboard.jsx            # ダッシュボード（利用側）
    └── WorkoutHistory.jsx       # 履歴ページ（利用側）
```

### 1.2 MVP実装後のファイル構造
```
frontend/src/
├── components/
│   └── statistics/              # 統計関連コンポーネント（同一ディレクトリに集約）
│       ├── WorkoutStatistics.jsx   # ✏️ 拡張: 月選択機能追加
│       ├── MonthSelector.jsx       # 🆕 新規: 月選択UI
│       ├── StatCard.jsx            # ✅ 変更なし
│       └── StatisticsLoading.jsx   # ✅ 変更なし
├── services/
│   └── StatisticsService.js    # ✏️ 拡張: 月別フィルタリング追加
└── pages/
    ├── Dashboard.jsx            # ✅ 変更なし（自動的に新機能を利用）
    └── WorkoutHistory.jsx       # ✅ 変更なし（自動的に新機能を利用）
```

### 1.3 将来実装（Phase 2以降）
```
frontend/src/
├── components/
│   ├── statistics/              # 統計関連
│   │   ├── WorkoutStatistics.jsx
│   │   ├── MonthSelector.jsx
│   │   ├── StatCard.jsx
│   │   └── StatisticsLoading.jsx
│   └── MonthNavigation.jsx     # 🆕 Phase 2: 汎用月ナビゲーション
├── services/
│   ├── StatisticsService.js
│   └── MonthlyDataService.js   # 🆕 Phase 3: 月別データ共通処理
└── hooks/
    └── useMonthlyData.js        # 🆕 Phase 3: カスタムフック
```

## 2. コンポーネント配置の根拠

### 2.1 MonthSelectorの配置決定

**✅ 正しい配置: `components/statistics/MonthSelector.jsx`**

理由:
1. **凝集度の原則**: 統計表示に特化したコンポーネントは同じディレクトリに
2. **依存関係の明確化**: WorkoutStatisticsのサブコンポーネントとして
3. **再利用性**: 統計コンテキスト内での再利用を想定
4. **保守性**: 関連コンポーネントが同一場所にあることで管理が容易

**❌ 避けるべき配置:**
- `components/MonthSelector.jsx` - 汎用性が不明確
- `pages/MonthSelector.jsx` - ページではない
- `services/MonthSelector.jsx` - UIコンポーネントはservicesに置かない

### 2.2 StatisticsServiceの拡張戦略

**方針**: 既存ファイルを拡張（新規ファイル作成しない）

```javascript
// services/StatisticsService.js

// 既存の関数（互換性維持）
export const calculateWorkoutStats = (workouts, options = {}) => {
  // 後方互換性を保つ実装
};

// 新規追加関数（MVP）
export const calculateMonthlyStats = (workouts, selectedMonth) => {
  // 月別統計計算
};

export const filterWorkoutsByMonth = (workouts, targetDate) => {
  // 月別フィルタリング
};
```

## 3. インポートパス

### 3.1 コンポーネント間のインポート

```javascript
// WorkoutStatistics.jsx
import MonthSelector from './MonthSelector';  // 同一ディレクトリ
import StatCard from './StatCard';
import StatisticsLoading from './StatisticsLoading';
import { calculateMonthlyStats } from '../../services/StatisticsService';

// MonthSelector.jsx
// 外部依存のみ（内部依存なし）
import { useState } from 'react';
import { ToggleButton, ToggleButtonGroup, MenuItem, Select, Box } from '@mui/material';

// Dashboard.jsx / WorkoutHistory.jsx
import WorkoutStatistics from '../components/statistics/WorkoutStatistics';
// 変更不要（既存のインポートのまま）
```

## 4. ファイルサイズの見積もり

| ファイル | 現在 | MVP後 | 増加量 | 備考 |
|---------|------|-------|--------|------|
| WorkoutStatistics.jsx | ~60行 | ~100行 | +40行 | 月選択統合 |
| MonthSelector.jsx | 0行 | ~80行 | +80行 | 新規作成 |
| StatisticsService.js | ~60行 | ~150行 | +90行 | 関数追加 |
| **合計** | **120行** | **330行** | **+210行** | 適切な増加量 |

## 5. 命名規則

### 5.1 ファイル名
- コンポーネント: PascalCase + `.jsx`
- サービス: PascalCase + `.js`
- フック: camelCase (use prefix) + `.js`

### 5.2 エクスポート
```javascript
// デフォルトエクスポート（コンポーネント）
export default MonthSelector;

// 名前付きエクスポート（サービス関数）
export { calculateMonthlyStats, filterWorkoutsByMonth };
```

## 6. ベストプラクティスの適用

### 6.1 単一責任の原則
- **MonthSelector**: 月選択UIのみ担当
- **StatisticsService**: 統計計算ロジックのみ
- **WorkoutStatistics**: 統計表示の統合

### 6.2 関心の分離
```
UI層（components/） → ビジネスロジック層（services/） → データ層（API）
```

### 6.3 DRY原則
- 月別フィルタリングロジックはStatisticsServiceに一元化
- 日付処理の共通化

## 7. 移行計画

### Phase 1（MVP）
1. `services/StatisticsService.js` に関数追加
2. `components/statistics/MonthSelector.jsx` 作成
3. `components/statistics/WorkoutStatistics.jsx` 更新

### Phase 2
1. `components/MonthNavigation.jsx` 作成
2. MonthSelectorからMonthNavigationへの段階的移行

### Phase 3
1. `services/MonthlyDataService.js` で共通処理抽出
2. `hooks/useMonthlyData.js` でステート管理統一

## 8. テストファイル構造

```
frontend/src/
├── components/statistics/
│   ├── __tests__/
│   │   ├── WorkoutStatistics.test.jsx
│   │   ├── MonthSelector.test.jsx  # 新規
│   │   └── StatCard.test.jsx
└── services/
    └── __tests__/
        └── StatisticsService.test.js  # 拡張
```

## 9. 結論

**推奨アーキテクチャ**:
- MonthSelectorは `components/statistics/` に配置
- 関連コンポーネントは同一ディレクトリに集約
- StatisticsServiceは既存ファイルを拡張
- ページコンポーネントは変更不要

この構造により:
- ✅ 高い凝集度
- ✅ 低い結合度
- ✅ 明確な責任分担
- ✅ 容易な保守性
- ✅ 段階的な拡張性

を実現します。