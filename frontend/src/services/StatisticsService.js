import dayjs from 'dayjs';

/**
 * 変化率を計算する共通関数
 * @param {number} current - 現在の値
 * @param {number} last - 前回の値
 * @returns {number} 変化率（％）
 */
const calculateChangeRate = (current, last) => {
  if (last === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - last) / last) * 100);
};

// 旧実装（後方互換性のため残す）
const calculateWorkoutStats = workouts => {
  const currentStats = workouts.reduce(
    (acc, workout) => {
      return {
        totalDays: acc.totalDays + 1,
        totalReps: acc.totalReps + (workout.totalReps || 0),
        totalTime: acc.totalTime + (workout.totalTime || 0),
      };
    },
    { totalDays: 0, totalReps: 0, totalTime: 0, averageIntensity: 0 }
  );

  // 前月のモックデータ
  const lastMonthStats = {
    totalDays: 12,
    totalReps: 340,
    totalTime: 150,
  };

  return {
    // 現在月
    currentTotalDays: currentStats.totalDays,
    currentTotalReps: currentStats.totalReps,
    currentTotalTime: currentStats.totalTime,

    // 前月
    lastTotalDays: lastMonthStats.totalDays,
    lastTotalReps: lastMonthStats.totalReps,
    lastTotalTime: lastMonthStats.totalTime,

    // 変化率
    daysChangeRate: calculateChangeRate(
      currentStats.totalDays,
      lastMonthStats.totalDays
    ),
    repsChangeRate: calculateChangeRate(
      currentStats.totalReps,
      lastMonthStats.totalReps
    ),
    timeChangeRate: calculateChangeRate(
      currentStats.totalTime,
      lastMonthStats.totalTime
    ),
  };
};

/**
 * 月別でワークアウトデータを集計する
 * @param {Array} workouts - 全ワークアウトデータ
 * @param {Date} selectedMonth - 選択された月
 * @returns {Object} 月別統計データ
 */
export const calculateMonthlyStats = (workouts, selectedMonth = new Date()) => {
  if (!workouts || workouts.length === 0) {
    return {
      currentTotalDays: 0,
      currentTotalReps: 0,
      currentTotalDistance: 0,
      lastTotalDays: 0,
      lastTotalReps: 0,
      lastTotalDistance: 0,
      daysChangeRate: 0,
      repsChangeRate: 0,
      distanceChangeRate: 0,
    };
  }

  const currentMonth = dayjs(selectedMonth);
  const previousMonth = currentMonth.subtract(1, 'month');

  // 月別フィルタリング関数
  const filterByMonth = (workoutList, targetMonth) => {
    return workoutList.filter(workout => {
      const workoutDate = dayjs(workout.date);
      return (
        workoutDate.year() === targetMonth.year() &&
        workoutDate.month() === targetMonth.month()
      );
    });
  };

  const aggregateStats = monthWorkouts => {
    if (
      !monthWorkouts ||
      !Array.isArray(monthWorkouts) ||
      monthWorkouts.length === 0
    ) {
      return { totalDays: 0, totalReps: 0, totalDistance: 0 };
    }

    const uniqueDays = new Set();
    let totalReps = 0;
    let totalDistance = 0;

    monthWorkouts.forEach(workout => {
      if (workout && workout.date) {
        const dateOnly = workout.date.split('T')[0];
        uniqueDays.add(dateOnly);
      }

      if (workout && workout.exerciseType === 'strength') {
        if (workout.reps && typeof workout.reps === 'number') {
          totalReps += workout.reps;
        }
      } else if (workout && workout.exerciseType === 'cardio') {
        if (workout.distance && typeof workout.distance === 'number') {
          totalDistance += workout.distance;
        }
      }
    });

    return {
      totalDays: uniqueDays.size,
      totalReps,
      totalDistance,
    };
  };

  // 現在月と前月のデータを集計
  const currentMonthWorkouts = filterByMonth(workouts, currentMonth);
  const previousMonthWorkouts = filterByMonth(workouts, previousMonth);

  const currentStats = aggregateStats(currentMonthWorkouts);
  const previousStats = aggregateStats(previousMonthWorkouts);

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
    daysChangeRate: calculateChangeRate(
      currentStats.totalDays,
      previousStats.totalDays
    ),
    repsChangeRate: calculateChangeRate(
      currentStats.totalReps,
      previousStats.totalReps
    ),
    distanceChangeRate: calculateChangeRate(
      currentStats.totalDistance,
      previousStats.totalDistance
    ),
  };
};

export default calculateWorkoutStats;
