import dayjs from 'dayjs';

/**
 * ワークアウトを日付ごとにグループ化
 * @param {Array} workouts - ワークアウトの配列
 * @returns {Object} - { 'YYYY-MM-DD': [workout1, workout2, ...] }
 */
export const groupByDate = (workouts) => {

  const grouped = {};

  workouts.slice(0, 10).forEach(workout => {
    const dateKey = dayjs(workout.date).format('YYYY-MM-DD');

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(workout);
  });

  return grouped;
};

/**
 * @param {Array} dateWorkouts - 同じ日のワークアウト配列
 * @returns {boolean} - 複数回トレーニングした場合 true
 */
export const hasMultipleWorkoutsOnSameDay = (dateWorkouts) => {
  return dateWorkouts.length > 1;
};

/**
 * @param {Object} workout - ワークアウトオブジェクト
 * @returns {string} - 例: "5km 30分" or "20×3セット"
 */
export const formatWorkoutDetails = (workout) => {
  if (workout.exerciseType === 'cardio') {
    return `${workout.distance}km ${workout.duration}分`;
  } else if (workout.exerciseType === 'strength') {
    const reps = workout.repsDetail.map(d => d.reps).join(',');
    return `${reps} (${workout.sets}セット)`;
  }
  return '';
};

