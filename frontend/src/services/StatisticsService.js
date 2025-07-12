const calculateWorkoutStats = workouts => {
  // workoutsが未定義またはnullの場合、空の配列として処理
  const safeWorkouts = workouts || [];
  
  const currentStats = safeWorkouts.reduce(
    (acc, workout) => {
      return {
        totalDays: acc.totalDays + 1,
        totalReps: acc.totalReps + (workout.totalReps || 0),
        totalTime: acc.totalTime + (workout.totalTime || 0),
      };
    },
    { totalDays: 0, totalReps: 0, totalTime: 0 }
  );

  

  // 前月のモックデータ
  const lastMonthStats = {
    totalDays: 12,
    totalReps: 340,
    totalTime: 150,
  };

  const calculateChangeRate = (current, last) => {
    if (last === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - last) / last) * 100);
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

export default calculateWorkoutStats;
