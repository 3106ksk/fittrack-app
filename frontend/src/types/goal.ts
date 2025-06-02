
/**
 * バックエンドGoalモデルと完全互換の基本Goal型
 * データベーススキーマと1:1対応
 */
export interface Goal {
  readonly id: number;                    // 読み取り専用ID（不変性保証）
  userID: number;                         // ユーザーID（外部キー）
  exercise: string;                       // 運動種目名
  exerciseType: 'strength' | 'cardio';   // 運動タイプ（列挙型で型安全性確保）
  targetAmount: number;                   // 目標値（正の整数）
  progressAmount: number;                 // 現在の進捗値（0以上）
  metricUnit: 'reps' | 'minutes' | 'km'; // 測定単位（将来拡張対応）
  status: GoalStatus;                     // 目標ステータス
  createdAt: string;                      // 作成日時（ISO 8601形式）
  updatedAt: string;                      // 更新日時（ISO 8601形式）
}

/**
 * 目標ステータスの型安全な定義
 * データベースENUM値と完全同期
 */
export type GoalStatus = 'in_progress' | 'completed' | 'paused';

/**
 * 目標作成時のリクエスト型
 * 自動生成フィールド（id, createdAt等）を除外
 */
export interface CreateGoalRequest {
  exercise: string;
  exerciseType: 'strength' | 'cardio';
  targetAmount: number;
  metricUnit: 'reps' | 'minutes' | 'km';
  // userIDはJWTトークンから自動取得、他は自動生成
}

/**
 * 目標更新時のリクエスト型
 * 部分更新をサポート（全フィールドオプショナル）
 */
export interface UpdateGoalRequest {
  exercise?: string;
  targetAmount?: number;
  progressAmount?: number;
  status?: GoalStatus;
  // 重要フィールドのみ更新許可（セキュリティ考慮）
}

/**
 * 進捗更新専用の型
 * 最頻度の操作に最適化された軽量型
 */
export interface ProgressUpdateRequest {
  goalId: number;
  progressAmount: number;
  // 進捗更新のみに特化（シンプル・高速）
}

// ============================================================================
// Computed Types - 計算されるプロパティの型定義
// ============================================================================

/**
 * 進捗計算結果の型
 * UIコンポーネントでの表示最適化
 */
export interface GoalProgress {
  percentage: number;                     // 進捗率（0-100）
  remaining: number;                      // 残り数量
  isCompleted: boolean;                   // 完了フラグ
  isOverAchieved: boolean;                // 目標超過フラグ
  completionRate: number;                 // 達成率（100%超過可能）
}




/**
 * 目標カードコンポーネントのProps型
 * 再利用可能コンポーネント設計
 */
export interface GoalCardProps {
  goal: GoalWithProgress;                 // 表示する目標データ
  onProgressUpdate: (goalId: number, amount: number) => Promise<void>;
  onStatusChange: (goalId: number, status: GoalStatus) => Promise<void>;
  onDelete?: (goalId: number) => Promise<void>; // オプショナル削除機能
  isUpdating?: boolean;                   // 更新中状態
  showDetailedProgress?: boolean;         // 詳細進捗表示フラグ
}

// ============================================================================
// API Response Types - API通信用型定義
// ============================================================================

/**
 * API共通レスポンス型
 * 一貫したAPIレスポンス構造
 */
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