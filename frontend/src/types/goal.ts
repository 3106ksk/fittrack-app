export interface Goal {
 exercise: string;
  exerciseType: 'strength' | 'cardio';  
  targetAmount: number;
  progressAmount: 0;
  metricUnit: 'reps';
  status: 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}




export interface GoalProgress {
  percentage: number;                     // 進捗率（0-100）
  remaining: number;                      // 残り数量
  isCompleted: boolean;                   // 完了フラグ
  isOverAchieved: boolean;                // 目標超過フラグ
  completionRate: number;                 // 達成率（100%超過可能）
}

export interface GoalCardProps {
  goal: Goal;                 // 表示する目標データ
  onProgressUpdate: (goalId: number, amount: number) => Promise<void>;
  onStatusChange: (goalId: number, status: Goal['status']) => Promise<void>;
  onDelete?: (goalId: number) => Promise<void>; // オプショナル削除機能
  isUpdating?: boolean;                   // 更新中状態
  showDetailedProgress?: boolean;         // 詳細進捗表示フラグ
}


export interface ApiResponse<T> {
  data: T;                                // レスポンスデータ
  message: string;                        // 操作結果メッセージ
  status: 'success' | 'error';            // 操作ステータス
  timestamp: string;                      // レスポンス時刻
}

/**
 * 目標一覧取得レスポンス
 * ページネーション対応
 */
export interface GoalListResponse {
  goals: Goal[];                          // 目標配列
  totalCount: number;                     // 総数
  hasNextPage: boolean;                   // 次ページ存在フラグ
  currentPage: number;                    // 現在ページ
}

/**
 * エラーレスポンス型
 * 統一されたエラーハンドリング
 */
export interface GoalApiError {
  code: string;                           // エラーコード
  message: string;                        // エラーメッセージ
  details?: Record<string, string[]>;     // フィールド別エラー詳細
}

// ============================================================================
// Type Guards - 型ガード関数用型定義
// ============================================================================

/**
 * Goal型の型ガード関数
 * ランタイム型安全性確保
 */
export const isGoal = (obj: unknown): obj is Goal => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'exercise' in obj &&
    'targetAmount' in obj &&
    'progressAmount' in obj
  );
};

/**
 * 有効な進捗値の型ガード
 * 入力値検証に使用
 */
export const isValidProgressAmount = (
  amount: unknown,
  targetAmount: number
): amount is number => {
  return (
    typeof amount === 'number' &&
    amount >= 0 &&
    amount <= targetAmount * 1.5 // 150%まで許容（目標超過対応）
  );
};

// ============================================================================
// Utility Types - ユーティリティ型定義
// ============================================================================

/**
 * 目標の一意キー生成型
 * React Queryキー管理に使用
 */
export type GoalQueryKey = readonly ['goals', number] | readonly ['goals', 'list', number];

/**
 * 目標操作権限型
 * 将来の権限管理機能拡張用
 */
export type GoalPermission = 'read' | 'write' | 'delete' | 'admin';

/**
 * 目標統計情報型
 * ダッシュボード表示用
 */
export interface GoalStatistics {
  totalGoals: number;                     // 総目標数
  completedGoals: number;                 // 完了目標数
  averageCompletionRate: number;          // 平均達成率
  mostActiveExercise: string;             // 最も活発な運動
  totalProgressThisWeek: number;          // 今週の総進捗
}

// 型定義の export default は避け、named export のみ使用
// Tree shakingとバンドル最適化のため 