import dayjs from 'dayjs';
import { calculateChangeRate } from './changeRateCalculator';
import { filterByMonth } from './workoutFilter';
import { aggregateStats } from './workoutAggregator';

/**
 * 月別統計の計算に関する責任を持つモジュール
 */

/**
 * 月別でワークアウトデータを集計する
 * @param {Array} workouts - 全ワークアウトデータ
 * @param {Date} selectedMonth - 選択された月
 * @returns {Object} 月別統計データ
 */
export const calculateMonthlyStats = (workouts, selectedMonth = new Date()) => {
  // 早期リターン：データがない場合
  if (!workouts || workouts.length === 0) {
    return getEmptyStats();
  }

  // 月の設定
  const currentMonth = dayjs(selectedMonth);
  const previousMonth = currentMonth.subtract(1, 'month');

  // 月別フィルタリング
  const currentMonthWorkouts = filterByMonth(workouts, currentMonth);
  const previousMonthWorkouts = filterByMonth(workouts, previousMonth);

  // 集計
  const currentStats = aggregateStats(currentMonthWorkouts);
  const previousStats = aggregateStats(previousMonthWorkouts);

  // 結果の組み立て
  return {
    // 現在月
    currentTotalDays: currentStats.totalDays,
    currentTotalReps: currentStats.totalReps,
    currentTotalDistance: currentStats.totalDistance,
    // 前月
    lastTotalDays: previousStats.totalDays,
    lastTotalReps: previousStats.totalReps,
    lastTotalDistance: previousStats.totalDistance,
    // 変化率
    daysChangeRate: calculateChangeRate(currentStats.totalDays, previousStats.totalDays),
    repsChangeRate: calculateChangeRate(currentStats.totalReps, previousStats.totalReps),
    distanceChangeRate: calculateChangeRate(currentStats.totalDistance, previousStats.totalDistance),
  };
};

/**
 * 空の統計データを返す
 * @returns {Object} 空の統計データ
 */
const getEmptyStats = () => ({
  currentTotalDays: 0,
  currentTotalReps: 0,
  currentTotalDistance: 0,
  lastTotalDays: 0,
  lastTotalReps: 0,
  lastTotalDistance: 0,
  daysChangeRate: 0,
  repsChangeRate: 0,
  distanceChangeRate: 0,
});