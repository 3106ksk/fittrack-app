// ============================================================================
// API Communication Types - API通信全般の型定義
// ============================================================================

import type { Goal } from './goal';

/**
 * HTTP メソッドの型安全な定義
 * RESTful API設計に準拠
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * HTTP ステータスコードの型定義
 * 主要なステータスコードを網羅
 */
export type HttpStatusCode = 
  | 200  // OK
  | 201  // Created
  | 204  // No Content
  | 400  // Bad Request
  | 401  // Unauthorized
  | 403  // Forbidden
  | 404  // Not Found
  | 422  // Unprocessable Entity
  | 429  // Too Many Requests
  | 500; // Internal Server Error

/**
 * 基本APIレスポンス型
 * 全APIエンドポイントの共通構造
 */
export interface BaseApiResponse<T = unknown> {
  data: T;                                // レスポンスデータ（ジェネリック）
  message: string;                        // 操作結果メッセージ
  status: 'success' | 'error';            // 操作ステータス
  timestamp: string;                      // レスポンス時刻（ISO 8601）
  requestId?: string;                     // リクエスト追跡ID（デバッグ用）
}

/**
 * ページネーション情報型
 * 一覧API共通のページネーション
 */
export interface PaginationInfo {
  currentPage: number;                    // 現在ページ（1始まり）
  totalPages: number;                     // 総ページ数
  totalItems: number;                     // 総アイテム数
  itemsPerPage: number;                   // 1ページ辺りのアイテム数
  hasNextPage: boolean;                   // 次ページ存在フラグ
  hasPreviousPage: boolean;               // 前ページ存在フラグ
}

/**
 * ページネーション対応レスポンス型
 * 一覧取得APIの標準レスポンス
 */
export interface PaginatedApiResponse<T> extends BaseApiResponse<T[]> {
  pagination: PaginationInfo;             // ページネーション情報
}

// ============================================================================
// Error Handling Types - エラーハンドリング型定義
// ============================================================================

/**
 * API エラーの詳細情報型
 * フィールド別バリデーションエラー対応
 */
export interface ApiErrorDetail {
  field: string;                          // エラー対象フィールド名
  message: string;                        // エラーメッセージ
  code: string;                           // エラーコード
  value?: unknown;                        // 無効な値（デバッグ用）
}

/**
 * 統一されたAPIエラー型
 * 全エラーレスポンスの標準構造
 */
export interface ApiError {
  status: 'error';                        // 固定値
  code: string;                           // エラーコード（例：VALIDATION_ERROR）
  message: string;                        // ユーザー向けエラーメッセージ
  details?: ApiErrorDetail[];             // 詳細エラー情報
  timestamp: string;                      // エラー発生時刻
  requestId?: string;                     // リクエスト追跡ID
  stack?: string;                         // スタックトレース（開発環境のみ）
}

/**
 * ネットワークエラー型
 * 通信障害、タイムアウト等の処理
 */
export interface NetworkError {
  type: 'network';                        // エラータイプ識別
  message: string;                        // エラーメッセージ
  code?: string;                          // エラーコード（例：TIMEOUT）
  isRetryable: boolean;                   // リトライ可能フラグ
}

/**
 * 認証エラー型
 * JWT有効期限切れ、権限不足等
 */
export interface AuthenticationError {
  type: 'authentication';                 // エラータイプ識別
  message: string;                        // エラーメッセージ
  code: 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'INSUFFICIENT_PERMISSIONS';
  redirectTo?: string;                    // リダイレクト先URL
}

/**
 * 統合エラー型
 * アプリケーション全体のエラーハンドリング
 */
export type AppError = ApiError | NetworkError | AuthenticationError;

// ============================================================================
// Request Types - リクエスト関連型定義
// ============================================================================

/**
 * APIリクエスト設定型
 * Axios設定の型安全ラッパー
 */
export interface ApiRequestConfig {
  method: HttpMethod;                     // HTTPメソッド
  url: string;                            // エンドポイントURL
  params?: Record<string, unknown>;       // URLパラメータ
  data?: unknown;                         // リクエストボディ
  headers?: Record<string, string>;       // カスタムヘッダー
  timeout?: number;                       // タイムアウト時間（ミリ秒）
  withCredentials?: boolean;              // クレデンシャル含有フラグ
}

/**
 * ページネーションリクエストパラメータ型
 * 一覧取得API共通パラメータ
 */
export interface PaginationParams {
  page?: number;                          // ページ番号（デフォルト：1）
  limit?: number;                         // 取得件数（デフォルト：20）
  offset?: number;                        // オフセット（ページ番号と排他）
}

/**
 * ソートリクエストパラメータ型
 * 一覧取得APIのソート機能
 */
export interface SortParams {
  sortBy?: string;                        // ソート対象フィールド
  sortOrder?: 'asc' | 'desc';            // ソート方向
}

/**
 * 検索リクエストパラメータ型
 * 一覧取得APIの検索機能
 */
export interface SearchParams {
  q?: string;                             // 検索クエリ
  filters?: Record<string, unknown>;      // フィルター条件
}

/**
 * 統合リクエストパラメータ型
 * 一覧取得APIの全機能を統合
 */
export interface ListRequestParams extends PaginationParams, SortParams, SearchParams {
  // 追加の共通パラメータがあればここに定義
}

// ============================================================================
// Authentication Types - 認証関連型定義
// ============================================================================

/**
 * JWT ペイロード型
 * JWTトークンに含まれる情報
 */
export interface JwtPayload {
  sub: string;                            // ユーザーID（subject）
  iat: number;                            // 発行時刻（issued at）
  exp: number;                            // 有効期限（expiration time）
  iss?: string;                           // 発行者（issuer）
  aud?: string;                           // 対象者（audience）
  email?: string;                         // ユーザーメールアドレス
  role?: string;                          // ユーザー権限
}

/**
 * 認証トークン型
 * JWT認証システムのトークン管理
 */
export interface AuthTokens {
  accessToken: string;                    // アクセストークン
  refreshToken?: string;                  // リフレッシュトークン（将来対応）
  tokenType: 'Bearer';                    // トークンタイプ
  expiresIn: number;                      // 有効期限（秒）
}

/**
 * ログインリクエスト型
 * 認証API用
 */
export interface LoginRequest {
  email: string;                          // メールアドレス
  password: string;                       // パスワード
  rememberMe?: boolean;                   // ログイン保持フラグ
}

/**
 * ログインレスポンス型
 * 認証成功時のレスポンス
 */
export interface LoginResponse {
  user: {
    id: number;                           // ユーザーID
    email: string;                        // メールアドレス
    name: string;                         // ユーザー名
  };
  tokens: AuthTokens;                     // 認証トークン
}

// ============================================================================
// Goal API Specific Types - Goal API専用型定義
// ============================================================================

/**
 * Goal API エンドポイント型
 * 型安全なURL生成に使用
 */
export type GoalApiEndpoint = 
  | '/api/goals'                          // 目標一覧取得・作成
  | '/api/goals/:id'                      // 目標詳細・更新・削除
  | '/api/goals/:id/progress'             // 進捗更新
  | '/api/goals/stats'                    // 統計情報取得
  | '/api/goals/export';                  // データエクスポート

/**
 * Goal一覧取得リクエストパラメータ型
 * Goal特有のフィルタリング・ソート条件
 */
export interface GoalListParams extends ListRequestParams {
  status?: ('in_progress' | 'completed' | 'paused')[];  // ステータスフィルター
  exerciseType?: ('strength' | 'cardio')[];             // 運動タイプフィルター
  progressMin?: number;                                  // 最小進捗率
  progressMax?: number;                                  // 最大進捗率
  dateFrom?: string;                                     // 作成日From（ISO 8601）
  dateTo?: string;                                       // 作成日To（ISO 8601）
}

/**
 * Goal一覧レスポンス型
 * ページネーション対応のGoal一覧
 */
export type GoalListApiResponse = PaginatedApiResponse<Goal>;

// ============================================================================
// API Client Types - APIクライアント型定義
// ============================================================================

/**
 * APIクライアント設定型
 * APIクライアントクラスの設定
 */
export interface ApiClientConfig {
  baseURL: string;                        // ベースURL
  timeout: number;                        // タイムアウト時間
  retryAttempts: number;                  // リトライ回数
  retryDelay: number;                     // リトライ間隔（ミリ秒）
  enableLogging: boolean;                 // ログ出力フラグ
}

/**
 * APIクライアントレスポンス型
 * APIクライアント統一レスポンス
 */
export interface ApiClientResponse<T> {
  data: T;                                // レスポンスデータ
  status: HttpStatusCode;                 // HTTPステータスコード
  headers: Record<string, string>;        // レスポンスヘッダー
  config: ApiRequestConfig;               // リクエスト設定
}

/**
 * APIクライアントインターフェース
 * 型安全なAPIクライアント契約
 */
export interface ApiClient {
  get<T>(url: string, params?: unknown): Promise<ApiClientResponse<T>>;
  post<T>(url: string, data?: unknown): Promise<ApiClientResponse<T>>;
  put<T>(url: string, data?: unknown): Promise<ApiClientResponse<T>>;
  patch<T>(url: string, data?: unknown): Promise<ApiClientResponse<T>>;
  delete<T>(url: string): Promise<ApiClientResponse<T>>;
}

// ============================================================================
// Query Key Types - React Query用型定義
// ============================================================================

/**
 * 基本クエリキータイプ
 * React Queryキーの型安全な管理
 */
export type QueryKey = readonly (string | number | boolean | Record<string, unknown> | null | undefined)[];

/**
 * Goal用クエリキーファクトリー
 * Goal関連クエリの型安全管理
 */
export const goalQueryKeys = {
  all: ['goals'] as const,
  lists: () => [...goalQueryKeys.all, 'list'] as const,
  list: (filters?: GoalListParams) => [...goalQueryKeys.lists(), filters] as const,
  details: () => [...goalQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...goalQueryKeys.details(), id] as const,
  stats: () => [...goalQueryKeys.all, 'stats'] as const,
};

// ============================================================================
// Export Utility Types - エクスポート用ユーティリティ型
// ============================================================================

/**
 * 条件付き型：APIレスポンスからデータを抽出
 * ジェネリック型の活用例
 */
export type ExtractApiData<T> = T extends BaseApiResponse<infer U> ? U : never;

/**
 * 条件付き型：Promise包装された型を展開
 * 非同期関数の戻り値型抽出
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

/**
 * 必須プロパティのみ抽出する型
 * 部分更新APIの型生成に使用
 */
export type RequiredOnly<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};

/**
 * オプショナルプロパティのみ抽出する型
 * フィルター条件等の型生成に使用
 */
export type OptionalOnly<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? never : K]: T[K];
};

// Tree shakingとバンドル最適化のため、named exportのみ使用 