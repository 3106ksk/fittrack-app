# Dashboard週間統計修正 - MVP要件定義書

**文書番号**: REQ-WS-MVP-001
**バージョン**: 2.0.0
**作成日**: 2025-09-20
**ステータス**: MVP Requirements

## 1. 概要

### 1.1 目的
Dashboard.jsxに表示されている週間統計（ワークアウト回数、レップス回数、距離）を、実際のワークアウトデータから正確に計算し表示する。単一責任原則に基づいてロジックを分離し、保守性を向上させる。

### 1.2 現状の問題点
```javascript
// 現在の問題のある実装
{
  label: '今週のレップス回数',
  value: Math.floor(continuityData.totalMinutes / 60), // 分を60で割っている（意味不明）
},
{
  label: '今週の距離',
  value: continuityData.currentStreak, // streakを距離として表示（完全に間違い）
}
```

### 1.3 MVP スコープ
- ✅ Dashboard.jsxの週間統計を実データで計算
- ✅ 週間統計計算ロジックをStatisticsServiceに分離
- ✅ 今週のワークアウト回数を正確に計算
- ✅ 今週のレップス回数を正確に計算
- ✅ 今週の距離を正確に計算
- ✅ 前週との比較表示（変化率％）
- ❌ 新しいUIコンポーネント作成（不要）
- ❌ 週ナビゲーション機能（不要）
- ❌ 詳細な統計画面（将来実装）

## 2. 機能要件

### 2.1 週間統計の計算要件

#### 2.1.1 今週のワークアウト回数
- **定義**: 今週（月曜開始）に実施したワークアウトの総数
- **計算**: 週内のワークアウトエントリー数をカウント

#### 2.1.2 今週のレップス回数
- **定義**: 今週のstrengthタイプワークアウトの総レップス数
- **計算**:
  ```javascript
  // strengthタイプのワークアウトから
  totalReps = workout.totalReps ||
              workout.reps * workout.sets ||
              workout.repsDetail.reduce((sum, set) => sum + set.reps, 0)
  ```

#### 2.1.3 今週の距離
- **定義**: 今週のcardioタイプワークアウトの総距離
- **計算**:
  ```javascript
  // cardioタイプのワークアウトから
  totalDistance = workout.distance || 0  // km単位
  ```

#### 2.1.4 前週との比較
- **定義**: 各統計値の前週からの変化率
- **計算**:
  ```javascript
  // 変化率の計算
  changeRate = ((currentWeek - previousWeek) / previousWeek) * 100
  // previousWeekが0の場合
  changeRate = currentWeek > 0 ? 100 : 0
  ```
- **表示**: パーセンテージで表示（例: +15%, -5%）

### 2.2 データ要件

#### 入力データ（既存のworkoutsデータ）
```javascript
{
  workouts: [
    {
      id: number,
      date: string,  // ISO 8601形式
      dateForSort: string,  // 代替日付フィールド
      exercise: string,
      exerciseType: 'strength' | 'cardio',

      // strengthタイプの場合
      sets?: number,
      reps?: number,
      totalReps?: number,  // 計算済みの場合
      repsDetail?: Array<{reps: number}>,

      // cardioタイプの場合
      duration?: number,  // 分
      distance?: number   // km
    }
  ]
}
```

#### 出力データ（Dashboard表示用）
```javascript
{
  weeklyWorkouts: number,  // 今週のワークアウト回数
  weeklyReps: number,      // 今週の総レップス数
  weeklyDistance: number,  // 今週の総距離(km)

  // 前週比較データ
  previousWeek: {
    weeklyWorkouts: number,
    weeklyReps: number,
    weeklyDistance: number
  },

  // 変化率（％）
  changeRates: {
    workouts: number,  // ワークアウト回数の変化率
    reps: number,      // レップス数の変化率
    distance: number   // 距離の変化率
  }
}
```

## 3. 技術要件

### 3.1 単一責任原則の適用

#### 現在の問題
- Dashboard.jsxに計算ロジックが混在
- テスト困難
- 再利用不可能

#### 改善案
```
Dashboard.jsx
  └── 表示責任のみ
      └── useWeeklyStats() カスタムフック
          └── StatisticsService.js
              └── 計算責任のみ
```

### 3.2 週の定義
- **週の開始**: 月曜日 00:00:00
- **週の終了**: 日曜日 23:59:59
- **タイムゾーン**: ユーザーのローカルタイムゾーン

### 3.3 計算ロジックの分離

#### StatisticsServiceに追加する関数
```javascript
// services/StatisticsService.js

/**
 * Dashboard用の週間統計を計算
 * @param {Array} workouts - 全ワークアウトデータ
 * @returns {Object} 週間統計データ
 */
export const calculateDashboardWeeklyStats = (workouts) => {
  if (!workouts || workouts.length === 0) {
    return {
      weeklyWorkouts: 0,
      weeklyReps: 0,
      weeklyDistance: 0
    };
  }

  // 今週のワークアウトをフィルタリング
  const thisWeekWorkouts = filterThisWeekWorkouts(workouts);

  return {
    weeklyWorkouts: thisWeekWorkouts.length,
    weeklyReps: calculateWeeklyReps(thisWeekWorkouts),
    weeklyDistance: calculateWeeklyDistance(thisWeekWorkouts)
  };
};
```

## 4. 実装要件

### 4.1 修正対象ファイル

| ファイル | 変更内容 | 優先度 |
|---------|---------|--------|
| StatisticsService.js | 週間統計計算関数を追加 | 高 |
| Dashboard.jsx | 計算ロジックを削除、Service呼び出しに変更 | 高 |
| useWeeklyStats.js | カスタムフック作成（オプション） | 中 |

### 4.2 Dashboard.jsxの修正箇所

```javascript
// 修正前（108-154行目）
const getWeeklyWorkouts = () => { ... }  // 削除
const continuityData = { ... }           // 修正

// 修正後
import { calculateDashboardWeeklyStats } from '../services/StatisticsService';

// コンポーネント内
const weeklyStats = useMemo(() => {
  return calculateDashboardWeeklyStats(workouts);
}, [workouts]);

const quickStats = [
  {
    label: '今週のワークアウト',
    value: weeklyStats.weeklyWorkouts,
    unit: '回',
    icon: <CalendarIcon sx={{ fontSize: 17 }} />,
    color: '#4CAF50',
    change: weeklyStats.changeRates?.workouts,  // 前週比
    showChange: true  // 変化率を表示
  },
  {
    label: '今週のレップス回数',
    value: weeklyStats.weeklyReps,
    unit: '回',
    icon: <FitnessCenterIcon sx={{ fontSize: 17 }} />,
    color: '#2196F3',
    change: weeklyStats.changeRates?.reps,  // 前週比
    showChange: true
  },
  {
    label: '今週の距離',
    value: weeklyStats.weeklyDistance.toFixed(1),
    unit: 'km',
    icon: <DirectionsRunIcon sx={{ fontSize: 17 }} />,
    color: '#FF5722',
    change: weeklyStats.changeRates?.distance,  // 前週比
    showChange: true
  },
];

// UI表示部分（既存のquickStatsマップ内に追加）
{stat.showChange && stat.change !== undefined && (
  <Typography
    variant="caption"
    sx={{
      color: stat.change > 0 ? 'success.main' :
             stat.change < 0 ? 'error.main' : 'text.secondary',
      fontSize: '0.65rem',
      display: 'block',
      mt: 0.5
    }}
  >
    {stat.change > 0 ? '+' : ''}{stat.change}% 前週比
  </Typography>
)}
```

## 5. 非機能要件

### 5.1 パフォーマンス
- 計算は50ms以内に完了
- useMemoによる再計算の最小化

### 5.2 保守性
- 単一責任原則の遵守
- テスト可能な純粋関数
- 明確な関数名と責任範囲

### 5.3 互換性
- 既存のUIに影響なし
- 既存のAPIとデータ構造を使用

## 6. テスト要件

### 6.1 単体テスト
```javascript
describe('calculateDashboardWeeklyStats', () => {
  test('今週のワークアウト回数が正しく計算される', () => {
    const workouts = [
      { date: '2025-01-20', exerciseType: 'strength' },  // 月曜
      { date: '2025-01-21', exerciseType: 'cardio' },    // 火曜
    ];
    const result = calculateDashboardWeeklyStats(workouts);
    expect(result.weeklyWorkouts).toBe(2);
  });

  test('レップス数が正しく集計される', () => {
    const workouts = [
      { date: '2025-01-20', exerciseType: 'strength', totalReps: 30 },
      { date: '2025-01-21', exerciseType: 'strength', reps: 10, sets: 3 },
    ];
    const result = calculateDashboardWeeklyStats(workouts);
    expect(result.weeklyReps).toBe(60);  // 30 + (10*3)
  });

  test('距離が正しく集計される', () => {
    const workouts = [
      { date: '2025-01-20', exerciseType: 'cardio', distance: 5 },
      { date: '2025-01-21', exerciseType: 'cardio', distance: 3.5 },
    ];
    const result = calculateDashboardWeeklyStats(workouts);
    expect(result.weeklyDistance).toBe(8.5);
  });
});
```

## 7. 実装チェックリスト

### Phase 1: 基本実装（必須）
- [ ] StatisticsServiceに`calculateDashboardWeeklyStats`関数を追加
- [ ] 週のフィルタリング関数を実装
- [ ] レップス数計算関数を実装
- [ ] 距離計算関数を実装
- [ ] Dashboard.jsxの計算ロジックを削除
- [ ] Dashboard.jsxでStatisticsServiceを使用
- [ ] 動作確認

### Phase 2: 品質向上（推奨）
- [ ] 単体テストの作成
- [ ] useWeeklyStatsカスタムフックの作成
- [ ] エラーハンドリングの追加
- [ ] JSDocコメントの追加

## 8. 成功基準

### 8.1 機能面
- [x] 今週のワークアウト回数が正しく表示される
- [x] 今週のレップス数が実際の合計値と一致する
- [x] 今週の距離が実際の合計値と一致する
- [x] 前週との比較がパーセンテージで表示される
- [x] 前週データがない場合もエラーにならない

### 8.2 品質面
- [x] Dashboard.jsxから計算ロジックが分離されている
- [x] StatisticsServiceの関数が独立してテスト可能
- [x] 既存のUIデザインに変更がない

## 9. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| データ構造の不整合 | 中 | 防御的プログラミング、デフォルト値の設定 |
| 週の境界計算ミス | 高 | Day.jsライブラリの使用、十分なテスト |
| パフォーマンス低下 | 低 | useMemoによるメモ化 |

## 10. 将来の拡張

### 10.1 次期フェーズ候補
- 前週比較機能
- 週間グラフ表示
- カスタマイズ可能な週の開始日
- 詳細な週間統計画面

### 10.2 拡張時の考慮事項
- 現在の実装を基盤として活用
- StatisticsServiceの関数を再利用
- UIコンポーネントの段階的な追加