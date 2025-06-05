import React, { useCallback, useEffect, useState } from 'react';

interface Goal {
  readonly id: number;          // readonly: 変更不可
  userID: number;
  exercise: string;
  exerciseType: 'strength' | 'cardio';  // Union型: どちらかのみ
  targetAmount: number;
  progressAmount: number;
  metricUnit: 'reps' | 'minutes' | 'km';
  status: 'in_progress' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

interface GoalProgress {
  percentage: number;
  remaining: number;
  isCompleted: boolean;
  isOverAchieved: boolean;
  completionRate: number;
}

interface GoalCardProps {
  goal: Goal;
  onProgressUpdate: (goalId: number, amount: number) => Promise<void>;
  onStatusChange: (goalId: number, status: Goal['status']) => Promise<void>;
  isUpdating: boolean;
}


let mockGoals: Goal[] = [
  {
    id: 1,
    userID: 1,
    exercise: "腕立て伏せ",
    exerciseType: "strength",
    targetAmount: 100,
    progressAmount: 45,
    metricUnit: "reps",
    status: "in_progress",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: 2,
    userID: 1,
    exercise: "ランニング",
    exerciseType: "cardio",
    targetAmount: 50,
    progressAmount: 50,
    metricUnit: "km",
    status: "completed",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-20T00:00:00.000Z"
  },
  {
    id: 3,
    userID: 1,
    exercise: "スクワット",
    exerciseType: "strength",
    targetAmount: 200,
    progressAmount: 75,
    metricUnit: "reps",
    status: "in_progress",
    createdAt: "2024-01-05T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z"
  }
];

const mockAPI = {
  async getGoals(): Promise<Goal[]> {
    console.log("📡 API Call: getGoals()");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [...mockGoals];
  },

  async updateProgress(goalId: number, progressAmount: number): Promise<Goal> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const goalIndex = mockGoals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) throw new Error('Goal not found');

    const existingGoal = mockGoals[goalIndex]!;
    const updatedGoal: Goal = {
      ...existingGoal,
      progressAmount,
      updatedAt: new Date().toISOString(),
      status: progressAmount >= existingGoal.targetAmount ? 'completed' : 'in_progress'
    };
    mockGoals[goalIndex] = updatedGoal;
    return updatedGoal;
  },

  async updateStatus(goalId: number, status: Goal['status']): Promise<Goal> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const goalIndex = mockGoals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) throw new Error('Goal not found');
    
    const existingGoal = mockGoals[goalIndex]!; // Non-null assertion since we checked above
    const updatedGoal: Goal = {
      ...existingGoal,
      status,
      updatedAt: new Date().toISOString()
    };
    mockGoals[goalIndex] = updatedGoal;
    return updatedGoal;
  },
};

const calculateProgress = (goal: Goal): GoalProgress => {
  const percentage = Math.min((goal.progressAmount / goal.targetAmount) * 100, 100);
  const remaining = Math.max(goal.targetAmount - goal.progressAmount, 0);
  const isCompleted = goal.progressAmount >= goal.targetAmount;
  const isOverAchieved = goal.progressAmount > goal.targetAmount;
  const completionRate = (goal.progressAmount / goal.targetAmount) * 100; 

  return {
    percentage,
    remaining,
    isCompleted,
    isOverAchieved,
    completionRate
  };
};

const calculateStatistics = (goals: Goal[]) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const inProgressGoals = goals.filter(goal => goal.status === 'in_progress').length;
  const averageCompletion = goals.length > 0 
    ? goals.reduce((sum, goal) => sum + calculateProgress(goal).percentage, 0) / goals.length 
    : 0;

  return {
    totalGoals,
    completedGoals,
    inProgressGoals,
    averageCompletion: Math.round(averageCompletion * 10) / 10
  };

};

const GoalCard = React.memo<GoalCardProps>(({ 
  goal, 
  onProgressUpdate, 
  onStatusChange, 
  isUpdating 
}) => {
  const progress = calculateProgress(goal);
  const handleProgressIncrement = async () => {
    const newAmount = goal.progressAmount + 1;
    await onProgressUpdate(goal.id, newAmount);
  };

    const handleProgressDecrement = async () => {
    const newAmount = Math.max(goal.progressAmount - 1, 0);
    await onProgressUpdate(goal.id, newAmount);
  };

  const handleStatusToggle = async () => {
    const newStatus: Goal['status'] = goal.status === 'completed' ? 'in_progress' : 'completed';
    await onStatusChange(goal.id, newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">

      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{goal.exercise}</h3>
          <span className="text-sm text-gray-500">
            {goal.exerciseType === 'strength' ? '💪 筋力' : '🏃 有酸素'} トレーニング
          </span>
        </div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        goal.status === 'completed' 
          ? 'bg-green-100 text-green-800'
          :  'bg-blue-100 text-blue-800'
      }`}>
          {goal.status === 'completed' 
          ? '✅ 完了'
           : 
           '🔄 進行中'
           }
      </span>

      {/* 進捗表示 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            進捗: {goal.progressAmount} / {goal.targetAmount} {goal.metricUnit}
          </span>

          <span className="font-semibold">
            {progress.percentage.toFixed(1)}%
            {progress.isOverAchieved && ' 🎉'}
          </span>
        </div>
        {/* プログレスバー */}
        <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
          <div 
            className={`h-4 rounded-full transition-all duration-500 ${
              progress.isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
          />
          {progress.isOverAchieved && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-50 animate-pulse" />
          )}
        </div>
        {/* 残り表示 */}
        {!progress.isCompleted && (
          <p className="text-sm text-gray-500 mt-1">
            あと {progress.remaining} {goal.metricUnit}
          </p>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleProgressDecrement}
          disabled={isUpdating || goal.progressAmount === 0}
          className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          -1
        </button>

        <button
          onClick={handleProgressIncrement}
          disabled={isUpdating}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUpdating ? '更新中...' : `+1 ${goal.metricUnit}`}
        </button>

        <button
          onClick={handleStatusToggle}
          disabled={isUpdating}
          className={`px-4 py-2 rounded-md transition-colors ${
            goal.status === 'completed'
            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
            : 'bg-green-500 text-white hover:bg-green-600'
          } disabled:opacity-50`}
        >
          {goal.status === 'completed' ? '再開' : '完了'}
        </button>
    </div>
    </div>
  ) 

})

const test: React.FC = () => {

  const [goals, setGoals] = useState<Goal[]>([]);  
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await mockAPI.getGoals(); 
        setGoals(data); 
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '不明なエラー';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadGoals();
  }, []);

  const handleProgressUpdate = useCallback(async (goalId: number, progressAmount: number) => {
    setUpdatingIds(prev => new Set([...prev, goalId]));
    try {
      const updatedGoal = await mockAPI.updateProgress(goalId, progressAmount);
      setGoals(prevGoals =>
        prevGoals.map(goal => goal.id === goalId ? updatedGoal : goal)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '進捗更新に失敗しました');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(goalId);
        return newSet;
      });
    }
  }, []);

    const handleStatusChange = useCallback(async (goalId: number, status: Goal['status']) => {
    setUpdatingIds(prev => new Set([...prev, goalId]));
    try {
      const updatedGoal = await mockAPI.updateStatus(goalId, status);
      setGoals(prevGoals => 
        prevGoals.map(goal => goal.id === goalId ? updatedGoal : goal)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ステータス変更に失敗しました');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(goalId);
        return newSet;
      });
    }
  }, []);

    if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">目標データを読み込み中...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🎯 モックデータとAPI層</h1>
      
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>エラー:</strong> {error}
        </div>
      )}


      {/* Goal一覧表示 */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 text-xl mb-2">目標データがありません</p>
              <p className="text-gray-400">モックデータを確認してください</p>
            </div>
          ) : (
            goals.map((goal: Goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onProgressUpdate={handleProgressUpdate}
                onStatusChange={handleStatusChange}
                isUpdating={updatingIds.has(goal.id)}
              />
            ))
          )}
        </div>
    </div>
  )
}

export default test