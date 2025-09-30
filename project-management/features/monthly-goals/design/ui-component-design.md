# 月次目標UI - コンポーネント設計書

**文書番号**: UCD-MG-001
**バージョン**: 2.0.0
**作成日**: 2025-09-13
**ステータス**: Draft

## 1. 概要

月次目標機能のUIコンポーネント設計書。日次達成ベースのカウントとリワード機能を含む。

## 2. GoalProgressCard コンポーネント

### 2.1 機能概要
ダッシュボードに配置され、現在のアクティブな目標と進捗を表示するカードコンポーネント。

### 2.2 表示要素
- **見出し**: "目標: ワークアウト{target}回"
- **進捗バー**: Material-UIのLinearProgress
- **進捗テキスト**: "{count}/{target}"
- **リワード表示**: "【{rewardTitle}】" または "ご褒美未設定"
- **CTA ボタン**: 状態に応じて変化

### 2.3 実装例
```tsx
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Box,
  Chip,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import apiClient from '../../services/api';

interface Goal {
  id: number;
  title: string;
  targetCount: number;
  periodType: 'monthly' | 'custom';
  startDate: string;
  endDate: string;
  rewardTitle?: string;
  rewardNote?: string;
  rewardClaimed: boolean;
  rewardClaimedAt?: string;
  isActive: boolean;
}

interface Progress {
  count: number;
  target: number;
  percent: number;
}

interface GoalProgressCardProps {
  onRefresh?: () => void;
}

const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ onRefresh }) => {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // アクティブな目標を取得
  const fetchActiveGoal = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/v1/goals/active');
      setGoal(response.data.goal);
      setProgress(response.data.progress);
    } catch (error) {
      console.error('Failed to fetch active goal:', error);
      setGoal(null);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  // リワードをclaim
  const handleClaimReward = async () => {
    if (!goal) return;

    setClaiming(true);
    try {
      const response = await apiClient.post(
        `/api/v1/goals/${goal.id}/reward/claim`
      );
      setGoal(response.data.goal);
      // 成功アニメーション表示
      showSuccessAnimation();
    } catch (error: any) {
      if (error.response?.status === 422) {
        alert('まだ目標を達成していません！');
      }
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    fetchActiveGoal();
  }, []);

  // ローディング中
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" height={40} sx={{ my: 2 }} />
          <Skeleton variant="text" width="40%" />
        </CardContent>
      </Card>
    );
  }

  // 目標が設定されていない場合
  if (!goal) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            月次目標
          </Typography>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <TrophyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="textSecondary" gutterBottom>
              目標が設定されていません
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowModal(true)}
              sx={{ mt: 2 }}
            >
              目標を作成
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 進捗の計算
  const progressPercent = progress?.percent || 0;
  const isAchieved = progress && progress.count >= progress.target;
  const canClaim = isAchieved && !goal.rewardClaimed && goal.rewardTitle;

  // 表示ラベルの生成
  const progressLabel = `${goal.title || `ワークアウト${goal.targetCount}回`} ${
    progress?.count || 0
  }/${progress?.target || goal.targetCount}`;

  const rewardLabel = goal.rewardTitle
    ? `【${goal.rewardTitle}】`
    : 'ご褒美未設定';

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" gutterBottom>
              目標: {goal.title || `ワークアウト${goal.targetCount}回`}
            </Typography>
            <IconButton size="small" onClick={() => setShowModal(true)}>
              <EditIcon />
            </IconButton>
          </Box>

          {/* 進捗バー */}
          <Box sx={{ my: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="textSecondary">
                進捗
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {progress?.count || 0} / {progress?.target || goal.targetCount}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, progressPercent)}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: isAchieved ? 'success.main' : 'primary.main',
                },
              }}
            />
            <Box display="flex" justifyContent="center" mt={1}>
              <Typography variant="h5" color={isAchieved ? 'success.main' : 'primary'}>
                {progressPercent}%
              </Typography>
            </Box>
          </Box>

          {/* リワード表示 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              ご褒美
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {goal.rewardTitle ? (
                <>
                  <TrophyIcon color="warning" fontSize="small" />
                  <Typography variant="body1" fontWeight="medium">
                    {goal.rewardTitle}
                  </Typography>
                  {goal.rewardClaimed && (
                    <Chip
                      label="受け取り済み"
                      color="success"
                      size="small"
                      icon={<CelebrationIcon />}
                    />
                  )}
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  未設定
                </Typography>
              )}
            </Box>
            {goal.rewardNote && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                {goal.rewardNote}
              </Typography>
            )}
          </Box>

          {/* CTAボタン */}
          <Box display="flex" gap={1}>
            {canClaim && (
              <Button
                variant="contained"
                color="success"
                fullWidth
                startIcon={<CelebrationIcon />}
                onClick={handleClaimReward}
                disabled={claiming}
              >
                ご褒美を受け取る
              </Button>
            )}
            {isAchieved && !goal.rewardTitle && (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setShowModal(true)}
              >
                ご褒美を設定
              </Button>
            )}
            {!isAchieved && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ textAlign: 'center', width: '100%', mt: 1 }}
              >
                あと{(progress?.target || goal.targetCount) - (progress?.count || 0)}回で達成！
              </Typography>
            )}
          </Box>

          {/* ラベル表示 */}
          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary">
              {progressLabel} {rewardLabel}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 目標作成/編集モーダル */}
      {showModal && (
        <GoalFormModal
          goal={goal}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchActiveGoal();
            onRefresh?.();
          }}
        />
      )}
    </>
  );
};

export default GoalProgressCard;
```

## 3. GoalFormModal コンポーネント

### 3.1 機能概要
目標の作成・編集を行うモーダルダイアログ。

### 3.2 フォームフィールド
- **目標回数** (targetCount): 必須、1以上の整数
- **期間タイプ** (periodType): MVPでは'monthly'固定
- **リワードタイトル** (rewardTitle): 任意
- **リワードメモ** (rewardNote): 任意
- **タイトル** (title): 任意、デフォルトは自動生成

### 3.3 バリデーション
```typescript
const validationSchema = yup.object({
  targetCount: yup
    .number()
    .required('目標回数は必須です')
    .min(1, '1以上の数値を入力してください')
    .integer('整数を入力してください'),
  title: yup.string().max(255, '255文字以内で入力してください'),
  rewardTitle: yup.string().max(255, '255文字以内で入力してください'),
  rewardNote: yup.string().max(1000, '1000文字以内で入力してください'),
});
```

## 4. 状態管理

### 4.1 カスタムフック
```typescript
// hooks/useGoals.ts
export const useActiveGoal = () => {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveGoal = async () => {
    // 実装
  };

  const claimReward = async () => {
    // 実装
  };

  const refreshProgress = async () => {
    // 実装
  };

  useEffect(() => {
    fetchActiveGoal();
  }, []);

  return {
    goal,
    progress,
    loading,
    error,
    claimReward,
    refreshProgress,
  };
};
```

### 4.2 コンテキスト（オプション）
```typescript
// contexts/GoalContext.tsx
const GoalContext = React.createContext<{
  activeGoal: Goal | null;
  progress: Progress | null;
  refreshGoal: () => Promise<void>;
}>({
  activeGoal: null,
  progress: null,
  refreshGoal: async () => {},
});
```

## 5. ワークアウト作成後の連携

### 5.1 進捗の自動更新
```typescript
// WorkoutForm内で
const handleSubmit = async (data: WorkoutData) => {
  try {
    await apiClient.post('/workouts', data);

    // 目標進捗を更新
    await refreshGoalProgress();

    showSuccessMessage('ワークアウトを記録しました！');
  } catch (error) {
    // エラー処理
  }
};
```

### 5.2 Strava同期後の更新
```typescript
// StravaSyncコンポーネント内で
const handleSync = async () => {
  try {
    await apiClient.post('/api/strava/sync');

    // 目標進捗を更新
    await refreshGoalProgress();

    showSuccessMessage('Stravaデータを同期しました！');
  } catch (error) {
    // エラー処理
  }
};
```

## 6. レスポンシブデザイン

### 6.1 ブレークポイント対応
```tsx
<Card sx={{
  width: '100%',
  maxWidth: { xs: '100%', sm: 600, md: 700 },
  mx: 'auto',
}}>
  <CardContent sx={{
    p: { xs: 2, sm: 3 },
  }}>
    {/* コンテンツ */}
  </CardContent>
</Card>
```

### 6.2 モバイル最適化
- タッチ対応のボタンサイズ（最小44x44px）
- 横スクロールの防止
- フォントサイズの調整

## 7. アクセシビリティ

### 7.1 ARIA属性
```tsx
<LinearProgress
  variant="determinate"
  value={progressPercent}
  aria-label={`目標達成率 ${progressPercent}%`}
  aria-valuenow={progressPercent}
  aria-valuemin={0}
  aria-valuemax={100}
/>
```

### 7.2 キーボード操作
- Tab キーによるフォーカス移動
- Enter/Space キーでボタン操作
- Escape キーでモーダル閉じる

## 8. パフォーマンス最適化

### 8.1 メモ化
```typescript
const progressLabel = useMemo(() => {
  return `${goal?.title || `ワークアウト${goal?.targetCount}回`} ${
    progress?.count || 0
  }/${progress?.target || goal?.targetCount}`;
}, [goal, progress]);
```

### 8.2 遅延ローディング
```typescript
const GoalFormModal = lazy(() => import('./GoalFormModal'));
```

## 9. テスト

### 9.1 単体テスト例
```typescript
describe('GoalProgressCard', () => {
  it('should display progress correctly', () => {
    const mockGoal = {
      id: 1,
      title: 'ワークアウト15回',
      targetCount: 15,
      rewardTitle: 'コーヒーミル購入',
    };
    const mockProgress = {
      count: 5,
      target: 15,
      percent: 33,
    };

    const { getByText } = render(
      <GoalProgressCard goal={mockGoal} progress={mockProgress} />
    );

    expect(getByText('5 / 15')).toBeInTheDocument();
    expect(getByText('33%')).toBeInTheDocument();
    expect(getByText(/コーヒーミル購入/)).toBeInTheDocument();
  });

  it('should show claim button when goal is achieved', () => {
    const mockGoal = { /* ... */ };
    const mockProgress = {
      count: 15,
      target: 15,
      percent: 100,
    };

    const { getByText } = render(
      <GoalProgressCard goal={mockGoal} progress={mockProgress} />
    );

    expect(getByText('ご褒美を受け取る')).toBeInTheDocument();
  });
});
```