import React, { useEffect, useState } from 'react';

// 🎯 Step 1-2: モックデータとAPI層の基礎
// ========================================================================

// Step 1-1 で定義した型を再利用
interface Goal {
  readonly id: number;
  userID: number;
  exercise: string;
  exerciseType: 'strength' | 'cardio';
  targetAmount: number;
  progressAmount: number;
  metricUnit: 'reps' | 'minutes' | 'km';
  status: 'in_progress' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

interface CreateGoalRequest {
  exercise: string;
  exerciseType: 'strength' | 'cardio';
  targetAmount: number;
  metricUnit: 'reps' | 'minutes' | 'km';
}

// 📚 学習ポイント: 型安全なモックデータ
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

// 📚 学習ポイント: 型安全なAPI関数（Promiseの型注解）
const mockAPI = {
  // Promise<Goal[]> : Goal配列を返すPromiseであることを明示
  async getGoals(): Promise<Goal[]> {
    console.log("📡 API Call: getGoals()");
    // 実際のAPI呼び出しをシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [...mockGoals];  // 元配列を変更しないように spread operator
  },

  // Promise<Goal> : 単一のGoalを返すPromiseであることを明示
  async createGoal(goalData: CreateGoalRequest): Promise<Goal> {
    console.log("📡 API Call: createGoal()", goalData);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newGoal: Goal = {
      id: Math.max(...mockGoals.map(g => g.id)) + 1,
      userID: 1,
      ...goalData,  // spread operator で CreateGoalRequest の中身を展開
      progressAmount: 0,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockGoals.push(newGoal);
    return newGoal;
  },

  async updateProgress(goalId: number, progressAmount: number): Promise<Goal> {
    console.log("📡 API Call: updateProgress()", goalId, progressAmount);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const goalIndex = mockGoals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) {
      throw new Error(`Goal with id ${goalId} not found`);
    }
    
    const originalGoal = mockGoals[goalIndex];
    if (!originalGoal) {
      throw new Error(`Goal at index ${goalIndex} is undefined`);
    }
    
    const updatedGoal: Goal = {
      id: originalGoal.id,
      userID: originalGoal.userID,
      exercise: originalGoal.exercise,
      exerciseType: originalGoal.exerciseType,
      targetAmount: originalGoal.targetAmount,
      progressAmount,
      metricUnit: originalGoal.metricUnit,
      status: progressAmount >= originalGoal.targetAmount ? 'completed' : 'in_progress',
      createdAt: originalGoal.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    mockGoals[goalIndex] = updatedGoal;
    return updatedGoal;
  }
};

// 🧪 Step 1-2: モックAPIのテスト表示コンポーネント
const Step1_2_MockAPI: React.FC = () => {
  // 📚 学習ポイント: useState の型注解
  const [goals, setGoals] = useState<Goal[]>([]);      // Goal型の配列のみ格納可能
  const [loading, setLoading] = useState<boolean>(true); // boolean値のみ格納可能
  const [error, setError] = useState<string | null>(null); // string または null のみ

  // 📚 学習ポイント: 非同期処理とエラーハンドリング
  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await mockAPI.getGoals(); // Goal[]型が返される
        setGoals(data); // 型安全: Goal[]のみ設定可能
      } catch (err) {
        // 📚 学習ポイント: エラーの型安全なハンドリング
        const errorMessage = err instanceof Error ? err.message : '不明なエラー';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  // 📚 学習ポイント: 関数の型注解
  const handleTestCreateGoal = async (): Promise<void> => {
    try {
      const newGoalData: CreateGoalRequest = {
        exercise: "テスト運動",
        exerciseType: "strength",
        targetAmount: 50,
        metricUnit: "reps"
      };
      
      const newGoal = await mockAPI.createGoal(newGoalData);
      setGoals(prevGoals => [...prevGoals, newGoal]); // 型安全な状態更新
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Goal作成エラー';
      setError(errorMessage);
    }
  };

  const handleTestUpdateProgress = async (goalId: number): Promise<void> => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;
      
      const newProgress = goal.progressAmount + 10;
      const updatedGoal = await mockAPI.updateProgress(goalId, newProgress);
      
      // 📚 学習ポイント: 型安全な配列操作
      setGoals(prevGoals => 
        prevGoals.map(g => g.id === goalId ? updatedGoal : g)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '進捗更新エラー';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🎯 Step 1-2: モックデータとAPI層</h1>
      
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>エラー:</strong> {error}
        </div>
      )}

      {/* API テストボタン */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🧪 API テスト</h2>
        <div className="flex gap-4">
          <button
            onClick={handleTestCreateGoal}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            📝 テスト目標作成
          </button>
          
          {goals.length > 0 && goals[0] && (
            <button
              onClick={() => handleTestUpdateProgress(goals[0]!.id)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              📈 最初の目標の進捗+10
            </button>
          )}
        </div>
      </div>

      {/* Goal一覧表示 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Goal一覧 ({goals.length}件)</h2>
        
        {goals.length === 0 ? (
          <p className="text-gray-500">目標がありません</p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal: Goal) => ( // Goal型の明示的な型注解
              <div key={goal.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{goal.exercise}</h3>
                    <p className="text-sm text-gray-600">
                      {goal.exerciseType === 'strength' ? '💪' : '🏃'} 
                      {goal.exerciseType}
                    </p>
                    <p className="text-sm">
                      進捗: {goal.progressAmount}/{goal.targetAmount} {goal.metricUnit}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    goal.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {goal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step完了チェック */}
      <div className="bg-green-50 p-4 rounded mt-6">
        <h3 className="font-medium text-green-800 mb-2">✅ Step 1-2 完了チェック</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Mock API関数が型安全に定義できた</li>
          <li>• Promise&lt;Goal&gt;、Promise&lt;Goal[]&gt; の型注解ができた</li>
          <li>• useState の型注解ができた</li>
          <li>• 非同期処理とエラーハンドリングができた</li>
          <li>• 型安全な配列操作 (map, filter) ができた</li>
        </ul>
        <p className="mt-2 text-green-800 font-medium">
          → Step 1-3: 基本表示UIの実装へ進む準備完了！
        </p>
      </div>
    </div>
  );
};

export default Step1_2_MockAPI; 