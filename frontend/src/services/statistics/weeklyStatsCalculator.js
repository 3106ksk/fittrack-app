/**
 * 週間統計計算モジュール - 学習用骨格
 *
 * 🎯 学習目標:
 * 1. day.jsのISO週間処理を理解する
 * 2. データ集計パターンを習得する
 * 3. 単一責任原則に基づいたモジュール設計を理解する
 * - Day.js公式: https://day.js.org/docs/en/plugin/iso-week
 */

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

  // 📝 Step 2-4: TODO(human): 以下の処理を実装
  // - 週間データのフィルタリング
  // - 統計値の計算
  // - 変化率の計算
  // 一時的にデフォルト値を返す
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
};

const filterThisWeekWorkouts = workouts => {
  const now = dayjs();
  const weekStart = now.startOf('isoWeek'); // 月曜日 00:00:00
  const weekEnd = now.endOf('isoWeek');     // 日曜日 23:59:59

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
