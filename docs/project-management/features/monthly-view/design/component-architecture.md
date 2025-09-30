# 月別ワークアウトUI - コンポーネント設計書

**文書番号**: CAD-MV-001
**バージョン**: 1.0.0
**作成日**: 2025-09-13
**ステータス**: Draft

## 1. アーキテクチャ概要

### 1.1 設計方針
- Atomic Design の原則に基づくコンポーネント分割
- Container/Presentational パターンの採用
- Material-UI を基盤としたデザインシステム
- TypeScript による型安全性の確保

### 1.2 技術スタック
- React 18.2.0
- TypeScript 5.x
- Material-UI 5.x
- React Hook Form（フォーム管理）
- Recharts（グラフ表示）
- date-fns（日付処理）

## 2. コンポーネント階層

```
src/
├── pages/
│   └── MonthlyView.tsx              # ページコンポーネント
├── components/
│   ├── monthly-view/
│   │   ├── MonthSelector.tsx        # 月選択コンポーネント
│   │   ├── GoalProgressCard.tsx     # 目標進捗カード
│   │   ├── DailyActivityChart.tsx   # 日別活動グラフ
│   │   ├── WorkoutList.tsx          # ワークアウト一覧
│   │   └── WorkoutCard.tsx          # 個別ワークアウトカード
│   └── common/
│       ├── ProgressRing.tsx         # 円形進捗表示
│       ├── LoadingState.tsx         # ローディング表示
│       └── ErrorState.tsx           # エラー表示
├── hooks/
│   ├── useMonthlyGoals.ts          # 月次目標カスタムフック
│   └── useMonthlyWorkouts.ts       # 月別ワークアウトフック
└── types/
    └── monthlyView.ts              # 型定義
```

## 3. コンポーネント詳細設計

### 3.1 MonthlyView（ページコンポーネント）

#### 責務
- 全体のレイアウト管理
- データフェッチの統括
- 子コンポーネントへのデータ配布

#### Props
なし（ページコンポーネントのため）

#### State
```typescript
interface MonthlyViewState {
  selectedMonth: string; // YYYY-MM
  workouts: Workout[];
  monthlyGoal: MonthlyGoal | null;
  loading: boolean;
  error: string | null;
}
```

#### 実装例
```typescript
const MonthlyView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), 'yyyy-MM')
  );

  const { goal, loading: goalLoading, error: goalError } = useMonthlyGoals(selectedMonth);
  const { workouts, loading: workoutsLoading, error: workoutsError } = useMonthlyWorkouts(selectedMonth);

  const loading = goalLoading || workoutsLoading;
  const error = goalError || workoutsError;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MonthSelector
            value={selectedMonth}
            onChange={setSelectedMonth}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <GoalProgressCard
            goal={goal}
            workouts={workouts}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DailyActivityChart
            workouts={workouts}
            month={selectedMonth}
          />
        </Grid>
        <Grid item xs={12}>
          <WorkoutList workouts={workouts} />
        </Grid>
      </Grid>
    </Container>
  );
};
```

### 3.2 MonthSelector

#### 責務
- 月の選択UI提供
- 前月/次月への移動

#### Props
```typescript
interface MonthSelectorProps {
  value: string; // YYYY-MM
  onChange: (month: string) => void;
  minDate?: string;
  maxDate?: string;
}
```

#### UI仕様
```typescript
const MonthSelector: React.FC<MonthSelectorProps> = ({ value, onChange }) => {
  const handlePrevious = () => {
    const prev = subMonths(parse(value, 'yyyy-MM', new Date()), 1);
    onChange(format(prev, 'yyyy-MM'));
  };

  const handleNext = () => {
    const next = addMonths(parse(value, 'yyyy-MM', new Date()), 1);
    onChange(format(next, 'yyyy-MM'));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <IconButton onClick={handlePrevious}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5">
          {format(parse(value, 'yyyy-MM', new Date()), 'yyyy年MM月')}
        </Typography>
        <IconButton onClick={handleNext}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};
```

### 3.3 GoalProgressCard

#### 責務
- 目標と実績の表示
- 達成率の視覚化

#### Props
```typescript
interface GoalProgressCardProps {
  goal: MonthlyGoal | null;
  workouts: Workout[];
}
```

#### 実装例
```typescript
const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ goal, workouts }) => {
  const progress = useMemo(() => {
    if (!goal) return null;

    const currentSessions = workouts.length;
    const currentDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    return {
      sessions: {
        current: currentSessions,
        target: goal.targetSessions,
        percentage: Math.min(100, (currentSessions / goal.targetSessions) * 100),
      },
      duration: {
        current: currentDuration,
        target: goal.targetDurationMin,
        percentage: Math.min(100, (currentDuration / goal.targetDurationMin) * 100),
      },
    };
  }, [goal, workouts]);

  if (!goal) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">月次目標</Typography>
          <Typography color="textSecondary">
            目標が設定されていません
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }}>
            目標を設定
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          月次目標進捗
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="subtitle2" color="textSecondary">
                セッション数
              </Typography>
              <ProgressRing
                value={progress.sessions.percentage}
                size={120}
              />
              <Typography variant="body2">
                {progress.sessions.current} / {progress.sessions.target}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="subtitle2" color="textSecondary">
                運動時間（分）
              </Typography>
              <ProgressRing
                value={progress.duration.percentage}
                size={120}
              />
              <Typography variant="body2">
                {progress.duration.current} / {progress.duration.target}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
```

### 3.4 DailyActivityChart

#### 責務
- 日別の運動時間を棒グラフで表示

#### Props
```typescript
interface DailyActivityChartProps {
  workouts: Workout[];
  month: string; // YYYY-MM
}
```

#### グラフ仕様
```typescript
const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ workouts, month }) => {
  const chartData = useMemo(() => {
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = getDaysInMonth(new Date(year, monthNum - 1));

    // 日別データ集計
    const dailyMap = new Map<number, number>();
    workouts.forEach(workout => {
      const day = new Date(workout.date).getDate();
      const current = dailyMap.get(day) || 0;
      dailyMap.set(day, current + (workout.duration || 0));
    });

    // グラフ用データ生成
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      duration: dailyMap.get(i + 1) || 0,
    }));
  }, [workouts, month]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          日別活動時間
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis label={{ value: '分', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="duration" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

## 4. 共通コンポーネント

### 4.1 ProgressRing
```typescript
interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 120,
  thickness = 4,
  color = 'primary'
}) => {
  const getColor = () => {
    if (value >= 100) return 'success';
    if (value >= 70) return 'primary';
    if (value >= 40) return 'warning';
    return 'error';
  };

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        color={color || getColor()}
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        right={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h6" component="div" color="textSecondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};
```

## 5. カスタムフック

### 5.1 useMonthlyGoals
```typescript
const useMonthlyGoals = (month: string) => {
  const [goal, setGoal] = useState<MonthlyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoal = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/api/goals/monthly/${month}`);
        setGoal(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setGoal(null);
        } else {
          setError('目標の取得に失敗しました');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [month]);

  return { goal, loading, error };
};
```

## 6. レスポンシブデザイン

### 6.1 ブレークポイント対応
```typescript
const useStyles = makeStyles((theme) => ({
  container: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3),
    },
  },
  card: {
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2),
    },
  },
}));
```

## 7. パフォーマンス最適化

### 7.1 メモ化戦略
- `useMemo`: 計算コストの高い処理
- `useCallback`: イベントハンドラー
- `React.memo`: Presentationalコンポーネント

### 7.2 遅延ローディング
```typescript
const DailyActivityChart = lazy(() =>
  import('./components/monthly-view/DailyActivityChart')
);
```

## 8. テスト戦略

### 8.1 単体テスト
```typescript
describe('GoalProgressCard', () => {
  it('should display progress correctly', () => {
    const goal = { targetSessions: 10, targetDurationMin: 300 };
    const workouts = [/* test data */];

    const { getByText } = render(
      <GoalProgressCard goal={goal} workouts={workouts} />
    );

    expect(getByText('月次目標進捗')).toBeInTheDocument();
  });
});
```

## 9. アクセシビリティ

### 9.1 ARIA対応
- 適切な role 属性の付与
- aria-label の設定
- キーボード操作のサポート

### 9.2 カラーコントラスト
- WCAG 2.1 AA 準拠
- ダークモード対応（将来）