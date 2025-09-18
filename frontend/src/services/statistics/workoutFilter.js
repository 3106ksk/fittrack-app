import dayjs from 'dayjs';

/**
 * ワークアウトのフィルタリングに関する責任を持つモジュール
 */

/**
 * 指定された月のワークアウトをフィルタリングする
 * @param {Array} workoutList - ワークアウトのリスト
 * @param {dayjs.Dayjs} targetMonth - 対象月
 * @returns {Array} フィルタリングされたワークアウト
 */
export const filterByMonth = (workoutList, targetMonth) => {
  if (!workoutList || !Array.isArray(workoutList)) {
    return [];
  }

  return workoutList.filter(workout => {
    // dateForSortフィールドを優先的に使用、なければdateを使用
    const dateString = workout.dateForSort || workout.date;
    const workoutDate = dayjs(dateString);

    return (
      workoutDate.isValid() &&
      workoutDate.year() === targetMonth.year() &&
      workoutDate.month() === targetMonth.month()
    );
  });
};