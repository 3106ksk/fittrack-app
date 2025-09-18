/**
 * 統計関連サービスの集約エクスポート
 *
 * このファイルが統計サービスモジュールの単一のエントリーポイントとなる
 */

// 主要な関数をエクスポート
export { calculateMonthlyStats } from './monthlyStatsCalculator';
export { calculateChangeRate } from './changeRateCalculator';
export { filterByMonth } from './workoutFilter';
export { aggregateStats } from './workoutAggregator';

// デフォルトエクスポートは月別統計計算
export { calculateMonthlyStats as default } from './monthlyStatsCalculator';