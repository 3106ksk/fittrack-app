import React, { useEffect, useState } from 'react';

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

interface CreateGoalRequest {
  exercise: string;
  exerciseType: 'strength' | 'cardio';
  targetAmount: number;
  metricUnit: 'reps' | 'minutes' | 'km';
  // 注意: id, userID, progressAmount等は自動生成されるため含めない
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
  }
}

const test: React.FC = () => {

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


  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🎯 Step 1-2: モックデータとAPI層</h1>
      
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>エラー:</strong> {error}
        </div>
      )}


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
    </div>
  )
}

export default test