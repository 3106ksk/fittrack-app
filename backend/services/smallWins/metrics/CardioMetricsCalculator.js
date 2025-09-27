/**
 * CardioMetricsCalculator
 * 単一責任：有酸素運動メトリクスの計算
 */

const { WHO_STANDARDS } = require('../scoring/WHOStandards');

class CardioMetricsCalculator {
  /**
   * 有酸素運動のメトリクスを計算
   * @param {Array} workouts - フィルタリング済みのワークアウトデータ
   * @returns {Object} cardioメトリクス
   */
  calculate(workouts) {
    const cardioWorkouts = workouts.filter((workout) =>
      workout && workout.exerciseType === 'cardio'
    );

    let totalSeconds = 0;
    cardioWorkouts.forEach(({ duration = 0 }) => {
      totalSeconds += Number(duration) || 0;
    });
    const totalMinutes = Math.floor(totalSeconds / 60);

    const targetMinutes = WHO_STANDARDS.cardio.weeklyMinutes;

    const score = Math.min(100, Math.round((totalMinutes / targetMinutes) * 100));
    const whoAchieved = totalMinutes >= targetMinutes;
    const byDay = {};
    cardioWorkouts.forEach(({ date, duration = 0 }) => {
      const minutes = Math.floor(duration / 60);
      byDay[date] = (byDay[date] || 0) + minutes;
    });

    return {
      score: score,
      whoAchieved: whoAchieved,
      details: {
        weeklyMinutes: totalMinutes,
        targetMinutes: targetMinutes,
        achievementRate: Math.round((totalMinutes / targetMinutes) * 100),
        byDay: byDay,
        workoutCount: cardioWorkouts.length,
      },
    };
  }

  /**
   * 有酸素運動の統計情報を取得
   * @param {Object} metrics - 計算済みメトリクス
   * @returns {Object} 統計情報
   */
  getStatistics(metrics) {
    const dailyAverage = Object.keys(metrics.details.byDay).length > 0
      ? Math.round(metrics.details.weeklyMinutes / Object.keys(metrics.details.byDay).length)
      : 0;

    return {
      dailyAverage,
      daysActive: Object.keys(metrics.details.byDay).length,
      maxDayMinutes: Math.max(...Object.values(metrics.details.byDay), 0),
      minDayMinutes: Math.min(...Object.values(metrics.details.byDay), 0),
    };
  }
}

module.exports = CardioMetricsCalculator;