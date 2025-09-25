# Small Wins Engine MVP - UIコンポーネント設計書

**文書番号**: UI-SW-001
**バージョン**: 1.0.0
**作成日**: 2025-01-25
**ステータス**: MVP Design

## 1. UI設計方針

### 1.1 MVP原則
- **即座に理解できる**: 専門知識不要で健康状態を把握
- **行動を促す**: 次のアクションが明確
- **モバイルファースト**: スマホでの利用を優先
- **段階的拡張**: 将来機能の追加を妨げない

### 1.2 デザインシステム連携
- Material-UI v5 使用（既存）
- カラーパレットは既存定義を継承
- レスポンシブ対応必須

## 2. コンポーネント階層

```
Dashboard
├── HealthScoreCard (MUST)
│   ├── ScoreDisplay
│   ├── WHOBadges
│   └── HealthMessage
├── WeeklyTrendChart (BETTER)
│   └── MiniChart
└── RecommendationList (BETTER)
    └── RecommendationItem
```

## 3. MUST コンポーネント詳細

### 3.1 HealthScoreCard

**目的**: 現在の健康スコアとWHO達成状況を一目で把握

**ファイル**: `/frontend/src/components/insights/HealthScoreCard.jsx`

```jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  Skeleton
} from '@mui/material';
import {
  FavoriteBorder as HeartIcon,
  FitnessCenter as StrengthIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';

const HealthScoreCard = ({ loading, data }) => {
  if (loading) {
    return (
      <Card sx={{ minHeight: 280 }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
          <Skeleton variant="text" width="80%" sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card sx={{ minHeight: 280 }}>
        <CardContent>
          <Typography color="text.secondary">
            データを取得できませんでした
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { scores, whoCompliance, healthMessage } = data;

  // スコアによる色の決定
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Card
      sx={{
        minHeight: 280,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <CardContent>
        {/* タイトル */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2">
            今日の健康スコア
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {new Date().toLocaleDateString('ja-JP')}
          </Typography>
        </Box>

        {/* メインスコア */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h2" component="div" sx={{ fontWeight: 'bold' }}>
            {scores.total}
            <Typography component="span" variant="h4" sx={{ opacity: 0.7 }}>
              /100
            </Typography>
          </Typography>

          {/* プログレスバー */}
          <LinearProgress
            variant="determinate"
            value={scores.total}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              mt: 2,
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white'
              }
            }}
          />
        </Box>

        {/* WHO達成バッジ */}
        <Grid container spacing={1} sx={{ mt: 2 }}>
          <Grid item>
            <Chip
              icon={<HeartIcon />}
              label={`有酸素 ${scores.aerobic}%`}
              size="small"
              sx={{
                backgroundColor: whoCompliance.aerobic
                  ? 'rgba(76, 175, 80, 0.2)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: whoCompliance.aerobic
                  ? '1px solid rgba(76, 175, 80, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.3)'
              }}
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<StrengthIcon />}
              label={`筋力 ${scores.strength}%`}
              size="small"
              sx={{
                backgroundColor: whoCompliance.strength
                  ? 'rgba(76, 175, 80, 0.2)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: whoCompliance.strength
                  ? '1px solid rgba(76, 175, 80, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.3)'
              }}
            />
          </Grid>
          {whoCompliance.combined && (
            <Grid item>
              <Chip
                icon={<TrophyIcon />}
                label="WHO完全達成"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 215, 0, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 215, 0, 0.5)'
                }}
              />
            </Grid>
          )}
        </Grid>

        {/* 健康メッセージ */}
        {healthMessage && (
          <Box
            sx={{
              mt: 3,
              p: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              borderLeft: '3px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            <Typography variant="body2">
              {healthMessage}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthScoreCard;
```

### 3.2 WHOComplianceBadge

**目的**: WHO推奨の達成状況を視覚的に表示

**ファイル**: `/frontend/src/components/insights/WHOComplianceBadge.jsx`

```jsx
import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const WHOComplianceBadge = ({ type, achieved, value, target }) => {
  const percentage = Math.min(100, (value / target) * 100);

  const config = {
    aerobic: {
      label: '有酸素運動',
      unit: '分/週',
      color: '#4caf50',
      icon: '🏃'
    },
    strength: {
      label: '筋力トレーニング',
      unit: '日/週',
      color: '#ff9800',
      icon: '💪'
    }
  };

  const { label, unit, color, icon } = config[type];

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={80}
          thickness={6}
          sx={{
            color: achieved ? color : '#e0e0e0',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round'
            }
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h4">{icon}</Typography>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {value} / {target} {unit}
      </Typography>
      {achieved && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            px: 1,
            py: 0.25,
            backgroundColor: `${color}20`,
            color: color,
            borderRadius: 1,
            fontWeight: 'bold'
          }}
        >
          WHO推奨達成
        </Typography>
      )}
    </Box>
  );
};

export default WHOComplianceBadge;
```

## 4. BETTER コンポーネント

### 4.1 WeeklyTrendChart

**目的**: 週間のスコア推移を簡潔に表示

```jsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const WeeklyTrendChart = ({ data }) => {
  const chartData = data?.daily?.map(d => ({
    day: new Date(d.date).toLocaleDateString('ja-JP', { weekday: 'short' }),
    score: d.totalScore
  })) || [];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          週間トレンド
        </Typography>
        <Box sx={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#667eea"
                strokeWidth={2}
                dot={{ fill: '#667eea', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        {data?.trends && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            先週比: {data.trends.percentageChange > 0 ? '+' : ''}
            {data.trends.percentageChange}%
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyTrendChart;
```

### 4.2 RecommendationList

**目的**: 個別化された改善提案を表示

```jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  TipsAndUpdates as TipIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

const RecommendationList = ({ recommendations = [] }) => {
  if (!recommendations.length) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          今日のアドバイス
        </Typography>
        <List>
          {recommendations.map((rec, index) => (
            <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TipIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={rec}
                primaryTypographyProps={{
                  variant: 'body2'
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecommendationList;
```

## 5. 統合実装（Dashboard）

```jsx
// pages/Dashboard.jsx への統合
import React, { useEffect, useState } from 'react';
import { Container, Grid, Alert } from '@mui/material';
import HealthScoreCard from '../components/insights/HealthScoreCard';
import WeeklyTrendChart from '../components/insights/WeeklyTrendChart';
import RecommendationList from '../components/insights/RecommendationList';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentInsight, setCurrentInsight] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const [current, weekly] = await Promise.all([
        api.get('/insights/current'),
        api.get('/insights/weekly')
      ]);

      setCurrentInsight(current.data);
      setWeeklyData(weekly.data);
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* メインカード */}
        <Grid item xs={12} md={8}>
          <HealthScoreCard
            loading={loading}
            data={currentInsight}
          />
        </Grid>

        {/* 推奨事項 */}
        <Grid item xs={12} md={4}>
          <RecommendationList
            recommendations={currentInsight?.recommendations}
          />
        </Grid>

        {/* 週間トレンド */}
        <Grid item xs={12}>
          <WeeklyTrendChart data={weeklyData} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
```

## 6. レスポンシブ対応

### 6.1 ブレークポイント設定

```javascript
const breakpoints = {
  xs: 0,    // スマートフォン
  sm: 600,  // タブレット縦
  md: 900,  // タブレット横
  lg: 1200, // デスクトップ
  xl: 1536  // 大画面
};
```

### 6.2 モバイル最適化

```jsx
// モバイル用スタイル調整
const mobileStyles = {
  card: {
    minHeight: { xs: 240, md: 280 },
    p: { xs: 2, md: 3 }
  },
  score: {
    fontSize: { xs: '3rem', md: '4rem' }
  },
  chart: {
    height: { xs: 150, md: 200 }
  }
};
```

## 7. アクセシビリティ

```jsx
// ARIA属性とキーボードナビゲーション
<Card
  role="article"
  aria-label="健康スコアカード"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // 詳細表示などのアクション
    }
  }}
>
  <CardContent>
    <Typography
      id="health-score-label"
      aria-live="polite"
      aria-atomic="true"
    >
      健康スコア: {scores.total}点
    </Typography>
  </CardContent>
</Card>
```

## 8. 状態管理（React Query）

```javascript
// hooks/useInsights.js
import { useQuery, useMutation } from 'react-query';
import api from '../services/api';

export const useCurrentInsight = () => {
  return useQuery(
    'currentInsight',
    () => api.get('/insights/current'),
    {
      staleTime: 5 * 60 * 1000, // 5分
      cacheTime: 10 * 60 * 1000, // 10分
      refetchOnWindowFocus: false
    }
  );
};

export const useWeeklyInsights = () => {
  return useQuery(
    'weeklyInsights',
    () => api.get('/insights/weekly'),
    {
      staleTime: 60 * 60 * 1000, // 1時間
      cacheTime: 2 * 60 * 60 * 1000 // 2時間
    }
  );
};

export const useRecalculateInsight = () => {
  return useMutation(
    (date) => api.post('/insights/calculate', { date }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('currentInsight');
        queryClient.invalidateQueries('weeklyInsights');
      }
    }
  );
};
```

## 9. パフォーマンス最適化

### 9.1 コンポーネントの遅延読み込み

```javascript
import { lazy, Suspense } from 'react';

const WeeklyTrendChart = lazy(() =>
  import('../components/insights/WeeklyTrendChart')
);

// 使用時
<Suspense fallback={<Skeleton height={200} />}>
  <WeeklyTrendChart data={weeklyData} />
</Suspense>
```

### 9.2 メモ化

```javascript
import { memo, useMemo } from 'react';

const HealthScoreCard = memo(({ data }) => {
  const scoreColor = useMemo(() =>
    getScoreColor(data?.scores?.total),
    [data?.scores?.total]
  );

  // コンポーネントの実装
}, (prevProps, nextProps) => {
  return prevProps.data?.scores?.total === nextProps.data?.scores?.total;
});
```

## 10. テーマ統合

```javascript
// theme/insightsTheme.js
export const insightsTheme = {
  scoreColors: {
    excellent: '#4caf50',  // 80-100
    good: '#8bc34a',       // 60-79
    moderate: '#ff9800',   // 40-59
    needsWork: '#ff5722',  // 20-39
    poor: '#f44336'        // 0-19
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)'
  }
};
```

---

**次のステップ**:
1. コンポーネントファイル作成
2. Storybookストーリー作成
3. ユニットテスト実装
4. 統合テスト作成