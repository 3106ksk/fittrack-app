// Feedback 関連型定義
export type { FeedbackState, FeedbackType } from './feedback';

// API 通信型定義
export type {
  ApiClient,
  // API クライアント型
  ApiClientConfig,
  ApiClientResponse,
  // エラー型
  ApiError,
  ApiErrorDetail,
  // リクエスト型
  ApiRequestConfig,
  AppError,
  AuthenticationError,
  AuthTokens,
  // レスポンス型
  BaseApiResponse,
  // ユーティリティ型
  ExtractApiData,

  // HTTP 基本型
  HttpMethod,
  HttpStatusCode,
  // 認証型
  JwtPayload,
  ListRequestParams,
  LoginRequest,
  LoginResponse,
  NetworkError,
  OptionalOnly,
  PaginatedApiResponse,
  PaginationInfo,
  PaginationParams,
  // React Query 型
  QueryKey,
  RequiredOnly,
  SearchParams,
  SortParams,
  UnwrapPromise,
} from './api';

// ============================================================================
// 開発者向けユーティリティ型
// ============================================================================

/**
 * 開発時のみ使用するデバッグ型
 * プロダクションビルドでは除外
 */
export type DebugInfo<T> = T & {
  __debugType?: string;
  __createdAt?: string;
  __source?: string;
};

/**
 * コンポーネントのPropsの共通型
 * 全コンポーネントが持つべき基本プロパティ
 */
export interface BaseComponentProps {
  className?: string; // CSSクラス名
  children?: React.ReactNode; // 子要素
  testId?: string; // テスト用ID
  'data-*'?: string; // データ属性
}

/**
 * 非同期コンポーネントの共通型
 * ローディング・エラー状態を持つコンポーネント
 */
export interface AsyncComponentProps extends BaseComponentProps {
  isLoading?: boolean; // ローディング状態
  error?: string | null; // エラーメッセージ
  onRetry?: () => void; // リトライ関数
}

/**
 * フォームコンポーネントの共通型
 * フォーム関連コンポーネントの基本プロパティ
 */
export interface FormComponentProps extends BaseComponentProps {
  disabled?: boolean; // 無効化状態
  required?: boolean; // 必須フィールド
  error?: string; // フィールドエラー
  touched?: boolean; // タッチ状態
}

// ============================================================================
// MVP 開発特有の型定義
// ============================================================================

/**
 * MVP開発段階の識別型
 * 機能の開発段階を管理
 */
export type MvpFeatureStatus =
  | 'planned' // 計画段階
  | 'in_development' // 開発中
  | 'testing' // テスト中
  | 'completed' // 完了
  | 'deferred'; // 延期

/**
 * MVP機能フラグ型
 * 機能の有効/無効を制御
 */
export interface MvpFeatureFlags {
  realTimeUpdates: boolean; // リアルタイム更新
  advancedFiltering: boolean; // 高度なフィルタリング
  dataExport: boolean; // データエクスポート
  pushNotifications: boolean; // プッシュ通知
}

/**
 * 開発環境識別型
 * 環境固有の設定・動作を制御
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * ログレベル型
 * ログ出力レベルの制御
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// ============================================================================
// 条件付きエクスポート - 開発環境のみ
// ============================================================================

/**
 * 開発環境でのみ利用可能な型定義
 * プロダクションビルドでは除外される
 */
declare global {
  interface Window {
    __DEV_TOOLS__?: {
      logLevel: LogLevel;
      enableTypeChecking: boolean;
      showDebugInfo: boolean;
    };
  }
}

// 環境変数による条件付きエクスポート
if (process.env.NODE_ENV === 'development') {
  // 開発環境専用の型とユーティリティをエクスポート
  console.log('TypeScript type definitions loaded for development');
}

// ============================================================================
// 型定義のバージョン管理
// ============================================================================

/**
 * 型定義のバージョン情報
 * API バージョンとの整合性確認に使用
 */
export const TYPE_DEFINITIONS_VERSION = '1.0.0' as const;

/**
 * 互換性チェック用の型定義
 * バックエンドAPIとの型整合性確認
 */
export interface TypeCompatibility {
  apiVersion: string; // 対応するAPIバージョン
  typeVersion: typeof TYPE_DEFINITIONS_VERSION;
  lastUpdated: string; // 最終更新日時
  breakingChanges?: string[]; // 破壊的変更のリスト
}

// TypeScript設定による型チェック強化
export type {} from './api';
