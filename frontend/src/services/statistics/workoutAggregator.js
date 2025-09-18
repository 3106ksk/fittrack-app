/**
 * ワークアウトデータの集計に関する責任を持つモジュール
 */

/**
 * 月別ワークアウトデータを集計する
 * @param {Array} monthWorkouts - 月別のワークアウトデータ
 * @returns {Object} 集計結果 { totalDays, totalReps, totalDistance }
 */
export const aggregateStats = monthWorkouts => {
  if (!monthWorkouts?.length) {
    return { totalDays: 0, totalReps: 0, totalDistance: 0 };
  }

  const uniqueDays = new Set();
  let totalReps = 0;
  let totalDistance = 0;

  monthWorkouts.forEach(workout => {
    if (!workout) {
      return;
    }

    // ユニークな日付を収集
    const dateString = workout.dateForSort || workout.date;
    if (dateString) {
      const dateOnly = dateString.includes('T')
        ? dateString.split('T')[0]
        : dateString;
      uniqueDays.add(dateOnly);
    }

    // exerciseTypeに応じて集計
    if (workout.exerciseType === 'strength' && workout.reps) {
      totalReps += Number(workout.reps) || 0;
    } else if (workout.exerciseType === 'cardio' && workout.distance) {
      totalDistance += Number(workout.distance) || 0;
    }
  });

  return {
    totalDays: uniqueDays.size,
    totalReps,
    totalDistance,
  };
};