import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

/**
 * Dashboard用の週間統計を計算するメイン関数
 * @param {Array} workouts - 全ワークアウトデータ
 * @returns {Object} 週間統計データ
 */
export const calculateDashboardWeeklyStats = workouts => {
  if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
    return {
      weeklyWorkouts: 0,
      weeklyReps: 0,
      weeklyDistance: 0,
      previousWeek: {
        weeklyWorkouts: 0,
        weeklyReps: 0,
        weeklyDistance: 0,
      },
      changeRates: {
        workouts: 0,
        reps: 0,
        distance: 0,
      },
    };
  }
  const filterThisWeekWorkouts = workouts => {
    const now = dayjs();
    const weekStart = now.startOf('isoWeek'); // 月曜日 00:00:00
    const weekEnd = now.endOf('isoWeek'); // 日曜日 23:59:59

    return filterWorkoutsByDateRange(workouts, weekStart, weekEnd);
  };

  const filterPreviousWeekWorkouts = workouts => {
    const now = dayjs();
    const previousWeek = now.subtract(1, 'week');
    const weekStart = previousWeek.startOf('isoWeek');
    const weekEnd = previousWeek.endOf('isoWeek');

    return filterWorkoutsByDateRange(workouts, weekStart, weekEnd);
  };

  const filterWorkoutsByDateRange = (workouts, startDate, endDate) => {
    if (!startDate || !endDate) {
      return [];
    }

    return workouts.filter(workout => {
      const dateString = workout.dateForSort || workout.date;
      const workoutDate = dayjs(dateString);

      if (!workoutDate.isValid()) {
        return false;
      }

      return (
        workoutDate.isSameOrAfter(startDate) &&
        workoutDate.isSameOrBefore(endDate)
      );
    });
  };

  const calculateWeeklyReps = weeklyWorkouts => {
    let totalReps = 0;

    weeklyWorkouts.forEach(workout => {
      if (workout.exerciseType === 'strength' && workout.reps) {
        totalReps += Number(workout.reps) || 0;
      }
    });

    return totalReps;
  };

  const calculateWeeklyDistance = weeklyWorkouts => {
    let totalDistance = 0;

    weeklyWorkouts.forEach(workout => {
      // cardioタイプの距離を集計
      if (workout.exerciseType === 'cardio' && workout.distance) {
        totalDistance += Number(workout.distance) || 0;
      }
    });

    return totalDistance;
  };

  const calculateChangeRate = (currentValue, previousValue) => {

    if (previousValue === 0) {
      return currentValue > 0 ? 100 : 0;
    }


    const rate = ((currentValue - previousValue) / previousValue) * 100;
    return Math.round(rate * 10) / 10;
  };


  const thisWeekWorkouts = filterThisWeekWorkouts(workouts);
  const previousWeekWorkouts = filterPreviousWeekWorkouts(workouts);


  console.log('今週のワークアウト:', thisWeekWorkouts);
  console.log('前週のワークアウト:', previousWeekWorkouts);


  const currentStats = {
    weeklyWorkouts: thisWeekWorkouts.length,
    weeklyReps: calculateWeeklyReps(thisWeekWorkouts),
    weeklyDistance: calculateWeeklyDistance(thisWeekWorkouts)
  };

  const previousStats = {
    weeklyWorkouts: previousWeekWorkouts.length,
    weeklyReps: calculateWeeklyReps(previousWeekWorkouts),
    weeklyDistance: calculateWeeklyDistance(previousWeekWorkouts)
  };


  const changeRates = {
    workouts: calculateChangeRate(currentStats.weeklyWorkouts, previousStats.weeklyWorkouts),
    reps: calculateChangeRate(currentStats.weeklyReps, previousStats.weeklyReps),
    distance: calculateChangeRate(currentStats.weeklyDistance, previousStats.weeklyDistance)
  };


  return {
    ...currentStats,
    previousWeek: previousStats,
    changeRates
  };
};
