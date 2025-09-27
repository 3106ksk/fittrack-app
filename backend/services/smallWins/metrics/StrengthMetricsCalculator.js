/**
 * StrengthMetricsCalculator
 * 単一責任：筋力トレーニングメトリクスの計算
 */

const { WHO_STANDARDS } = require('../scoring/WHOStandards');

class StrengthMetricsCalculator {
  /**
   * 筋力トレーニングのメトリクスを計算
   * @param {Array} workouts - フィルタリング済みのワークアウトデータ
   * @returns {Object} strengthメトリクス
   */
  calculate(workouts) {
    // null/undefinedを除外して筋力トレーニングのみをフィルタリング
    const strengthWorkouts = workouts.filter((workout) =>
      workout && workout.exerciseType === 'strength'
    );

    // トレーニング実施日を取得（重複排除のためSetを使用）
    const trainingDays = new Set();

    // 総セット数とレップ数の集計
    let totalSets = 0;
    let totalReps = 0;

    // 日別のトレーニング詳細
    const byDay = {};

    // 引数での分割代入を使用（filterでnull除外済みなので安全）
    strengthWorkouts.forEach(({ date, sets = 0, reps = 0 }) => {
      // 日付を追加（Setが重複を自動排除）
      trainingDays.add(date);

      // 総セット数とレップ数を累積
      totalSets += Number(sets) || 0;
      totalReps += Number(reps) || 0;

      // 日別データの初期化と累積
      if (!byDay[date]) {
        byDay[date] = { sets: 0, reps: 0 };
      }
      byDay[date].sets += Number(sets) || 0;
      byDay[date].reps += Number(reps) || 0;
    });

    const weeklyDays = trainingDays.size;
    const targetDays = WHO_STANDARDS.strength.weeklyDays;
    const score = Math.min(100, Math.round((weeklyDays / targetDays) * 100));
    const whoAchieved = weeklyDays >= targetDays;

    return {
      score: score,
      whoAchieved: whoAchieved,
      details: {
        weeklyDays: weeklyDays,
        targetDays: targetDays,
        achievementRate: Math.round((weeklyDays / targetDays) * 100),
        totalSets: totalSets,
        totalReps: totalReps,
        byDay: byDay,
        workoutCount: strengthWorkouts.length,
      },
    };
  }

  /**
   * 筋力トレーニングの統計情報を取得
   * @param {Object} metrics - 計算済みメトリクス
   * @returns {Object} 統計情報
   */
  getStatistics(metrics) {
    const avgSetsPerDay = metrics.details.weeklyDays > 0
      ? Math.round(metrics.details.totalSets / metrics.details.weeklyDays)
      : 0;

    const avgRepsPerDay = metrics.details.weeklyDays > 0
      ? Math.round(metrics.details.totalReps / metrics.details.weeklyDays)
      : 0;

    return {
      avgSetsPerDay,
      avgRepsPerDay,
      avgRepsPerSet: metrics.details.totalSets > 0
        ? Math.round(metrics.details.totalReps / metrics.details.totalSets)
        : 0,
      trainingFrequency: `${metrics.details.weeklyDays}/7 days`,
    };
  }
}

module.exports = StrengthMetricsCalculator;