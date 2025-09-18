# 月別統計機能 - UI仕様書

**文書番号**: UID-MS-001
**バージョン**: 2.0.0
**作成日**: 2025-01-18
**更新日**: 2025-01-18
**ステータス**: Active

## 改訂履歴
| バージョン | 日付 | 変更者 | 変更内容 |
|-----------|------|--------|----------|
| 1.0.0 | 2025-01-18 | Team | 初版作成（3カード構成） |
| 2.0.0 | 2025-01-18 | Team | サマリーカードUIへ変更 |

## 1. UI設計方針

### 1.1 変更概要
- **Before**: 3枚の個別統計カード（横並び）
- **After**: 1枚のサマリーカード（統合表示）

### 1.2 設計原則
- **情報密度の最適化**: 関連情報を1箇所に集約
- **視線移動の最小化**: 上下スクロールのみで全体把握
- **モバイルファースト**: リスト形式で縦積み表示
- **段階的移行**: 既存コンポーネント残存で互換性維持

## 2. コンポーネント構成

### 2.1 新規コンポーネント階層
```
components/statistics/
├── WorkoutStatistics.jsx     # 更新: MonthlySummaryCard使用
├── MonthlySummaryCard.jsx    # 新規: 統合サマリーカード
├── MonthSelector.jsx          # 新規: 月選択UI
├── StatCard.jsx              # 保持: 他画面で再利用可能
├── StatisticsLoading.jsx     # 更新: single variant追加
└── __tests__/
    └── MonthlySummaryCard.test.jsx  # 新規テスト
```

## 3. MonthlySummaryCard仕様

### 3.1 コンポーネント設計
```jsx
// Props定義
interface MonthlySummaryCardProps {
  stats: {
    currentTotalDays: number;      // 現在月の総日数
    currentTotalReps: number;      // 現在月の総回数
    currentTotalDistance: number;  // 現在月の総距離
    lastTotalDays: number;         // 前月の総日数
    lastTotalReps: number;         // 前月の総回数
    lastTotalDistance: number;     // 前月の総距離
    daysChangeRate: number;        // 日数変化率(%)
    repsChangeRate: number;        // 回数変化率(%)
    distanceChangeRate: number;    // 距離変化率(%)
  };
}
```

### 3.2 ビジュアルデザイン

#### カード構造
```
┌─────────────────────────────────────────┐
│ 📊 今月のレコード                         │
│ この月の合計値と先月比                     │
├─────────────────────────────────────────┤
│ 📅 総ワークアウト日数    15日  [先月+25%] │
├─────────────────────────────────────────┤
│ 💪 総回数              450回  [先月+10%] │
├─────────────────────────────────────────┤
│ 🏃 総距離              45km   [先月-5%]  │
└─────────────────────────────────────────┘
```

#### 行アイテム構成
- **左**: アイコン（Avatar内）
- **中央**: ラベル + 値・単位
- **右**: 変化率Chip

### 3.3 実装コード（調整版）

```jsx
// src/components/statistics/MonthlySummaryCard.jsx
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Avatar,
  Box
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  FitnessCenter as FitnessIcon,
  DirectionsRun as RunIcon  // Timer → DirectionsRun に変更
} from '@mui/icons-material';

const Row = ({
  icon: Icon,
  label,
  value,
  unit,
  lastValue,
  changeRate,
  highlight = 'primary'
}) => {
  const isPositive = typeof changeRate === 'number' ? changeRate >= 0 : null;

  return (
    <>
      <ListItem
        sx={{
          px: 2,
          py: 1.25,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        disableGutters
        secondaryAction={
          <Chip
            size="small"
            color={
              typeof changeRate === 'number'
                ? (isPositive ? 'success' : 'error')
                : 'default'
            }
            label={
              typeof changeRate === 'number'
                ? `先月より ${isPositive ? '+' : ''}${changeRate}%`
                : `先月 ${lastValue}${unit}`
            }
            sx={{ fontSize: '0.72rem', height: 24 }}
          />
        }
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: `${highlight}.light`,
              color: `${highlight}.main`,
              width: 40,
              height: 40,
            }}
          >
            <Icon fontSize="small" />
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
          }
          secondary={
            <Box display="flex" alignItems="baseline" gap={0.5}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: `${highlight}.main` }}
              >
                {value.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unit}
              </Typography>
            </Box>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};

const MonthlySummaryCard = ({ stats }) => {
  // データ形式の調整（StatisticsServiceとの整合性）
  const data = {
    days: {
      current: stats.currentTotalDays || 0,
      last: stats.lastTotalDays || 0,
      changeRate: stats.daysChangeRate
    },
    reps: {
      current: stats.currentTotalReps || 0,
      last: stats.lastTotalReps || 0,
      changeRate: stats.repsChangeRate
    },
    distance: {
      current: stats.currentTotalDistance || 0,
      last: stats.lastTotalDistance || 0,
      changeRate: stats.distanceChangeRate
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 6
        },
      }}
    >
      <CardHeader
        title="今月のレコード"
        subheader="この月の合計値と先月比"
        sx={{
          pb: 0.5,
          '& .MuiCardHeader-title': {
            fontWeight: 800,
            fontSize: '1.1rem'
          },
        }}
      />
      <CardContent sx={{ pt: 0, pb: 0 }}>
        <List sx={{ py: 0 }}>
          <Divider />
          <Row
            icon={CalendarIcon}
            label="総ワークアウト日数"
            value={data.days.current}
            unit="日"
            lastValue={data.days.last}
            changeRate={data.days.changeRate}
            highlight="primary"
          />
          <Row
            icon={FitnessIcon}
            label="総回数"
            value={data.reps.current}
            unit="回"
            lastValue={data.reps.last}
            changeRate={data.reps.changeRate}
            highlight="success"
          />
          <Row
            icon={RunIcon}
            label="総距離"
            value={data.distance.current}
            unit="km"
            lastValue={data.distance.last}
            changeRate={data.distance.changeRate}
            highlight="info"
          />
        </List>
      </CardContent>
    </Card>
  );
};

export default MonthlySummaryCard;
```

## 4. WorkoutStatistics更新仕様

### 4.1 変更内容
```jsx
// src/components/statistics/WorkoutStatistics.jsx
import { Grid, Box } from '@mui/material';
import { calculateMonthlyStats } from '../../services/StatisticsService';
import StatisticsLoading from './StatisticsLoading';
import MonthlySummaryCard from './MonthlySummaryCard';
import MonthSelector from './MonthSelector';
import { useState } from 'react';

const WorkoutStatistics = ({ workouts, loading }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // 月別統計計算（MVP実装）
  const stats = calculateMonthlyStats(workouts, selectedMonth);

  if (loading) {
    return <StatisticsLoading variant="single" />;
  }

  return (
    <Box>
      {/* 月選択UI */}
      <MonthSelector
        currentMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* サマリーカード */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={6}>
          <MonthlySummaryCard stats={stats} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkoutStatistics;
```

## 5. StatisticsLoading更新仕様

### 5.1 シングルカードSkeleton追加
```jsx
// src/components/statistics/StatisticsLoading.jsx
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Divider
} from '@mui/material';

const ListRowSkeleton = () => (
  <>
    <Box display="flex" alignItems="center" py={1.25} px={2}>
      <Skeleton
        variant="circular"
        width={40}
        height={40}
        sx={{ mr: 2 }}
      />
      <Box flex={1}>
        <Skeleton variant="text" width="40%" height={24} />
        <Skeleton variant="text" width="25%" height={32} />
      </Box>
      <Skeleton variant="rounded" width={90} height={24} />
    </Box>
    <Divider />
  </>
);

const StatisticsLoading = ({ variant = 'single' }) => {
  // 新: シングルカード表示
  if (variant === 'single') {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Skeleton
                variant="text"
                width="30%"
                height={30}
                sx={{ mb: 0.5 }}
              />
              <Skeleton
                variant="text"
                width="45%"
                height={20}
                sx={{ mb: 1.5 }}
              />
              <Divider />
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // 既存: 3枚カード表示（後方互換性）
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3].map(i => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card elevation={2}>
            <CardContent>
              {/* 既存のスケルトン実装 */}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatisticsLoading;
```

## 6. レスポンシブ対応

### 6.1 ブレークポイント別表示

| デバイス | 幅 | カード幅 | 表示 |
|---------|-----|---------|------|
| Mobile (xs) | < 600px | 100% | 縦積み |
| Tablet (sm/md) | 600-1200px | 66% | 中央寄せ |
| Desktop (lg+) | > 1200px | 50% | 左寄せ |

### 6.2 タッチデバイス対応
- リストアイテムのタップ領域を十分確保（py: 1.25）
- Chipは最小44px × 44pxのタッチターゲット確保
- ホバー効果はポインターデバイスのみ適用

## 7. アクセシビリティ

### 7.1 ARIA属性
```jsx
<ListItem
  role="listitem"
  aria-label={`${label}: ${value}${unit}, 先月比${changeRate}%`}
>
```

### 7.2 キーボードナビゲーション
- Tab順序: ヘッダー → 各行アイテム → Chip
- Enter/Spaceでアクション実行可能

## 8. パフォーマンス最適化

### 8.1 メモ化戦略
```jsx
const MonthlySummaryCard = React.memo(({ stats }) => {
  // コンポーネント実装
}, (prevProps, nextProps) => {
  // 浅い比較でOK
  return JSON.stringify(prevProps.stats) === JSON.stringify(nextProps.stats);
});
```

### 8.2 バンドルサイズ
- MonthlySummaryCard: ~3KB (gzip)
- 既存3カードより約20%削減

## 9. テーマ対応

### 9.1 ダークモード
```jsx
// 自動対応される要素
- Card背景: theme.palette.background.paper
- テキスト: theme.palette.text.primary/secondary
- Divider: theme.palette.divider
- Chip: theme.palette[color].main
```

### 9.2 カラーパレット
- Primary (青): 総日数
- Success (緑): 総回数
- Info (水色): 総距離
- Error (赤): 減少率のChip
- Success (緑): 増加率のChip

## 10. 移行計画

### Phase 1 (即実装)
1. MonthlySummaryCard.jsx作成
2. StatisticsLoading.jsx拡張
3. WorkoutStatistics.jsx更新

### Phase 2 (互換性確認)
1. 他画面でのStatCard使用状況確認
2. 必要に応じてprop名統一（change → changeRate）

### Phase 3 (最適化)
1. パフォーマンス計測
2. アニメーション調整
3. A/Bテスト実施

## 11. 実装チェックリスト

- [ ] MonthlySummaryCard.jsx作成
- [ ] 総距離（distance）集計ロジック実装
- [ ] StatisticsLoading single variant追加
- [ ] WorkoutStatistics.jsx更新
- [ ] レスポンシブ動作確認
- [ ] ダークモード確認
- [ ] アクセシビリティテスト
- [ ] パフォーマンス計測