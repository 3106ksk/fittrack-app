/**
 * DateHelper
 * 単一責任：日付関連のユーティリティ機能
 */

const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

// プラグインを拡張
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

class DateHelper {
  /**
   * ISO週の開始日と終了日を取得
   * @param {Date} targetDate - 対象日
   * @returns {Object} 週の開始日と終了日
   */
  static getWeekBounds(targetDate = new Date()) {
    const target = dayjs(targetDate);
    return {
      start: target.startOf('isoWeek'),
      end: target.endOf('isoWeek'),
      startString: target.startOf('isoWeek').format('YYYY-MM-DD'),
      endString: target.endOf('isoWeek').format('YYYY-MM-DD'),
    };
  }

  /**
   * ワークアウトが指定週に含まれるかチェック
   * @param {Object} workout - ワークアウトデータ
   * @param {Object} weekBounds - 週の境界
   * @returns {Boolean} 含まれる場合true
   */
  static isInWeek(workout, weekBounds) {
    if (!workout || !workout.date) return false;

    const workoutDate = dayjs(workout.date);
    return workoutDate.isSameOrAfter(weekBounds.start) &&
           workoutDate.isSameOrBefore(weekBounds.end);
  }

  /**
   * 対象週のワークアウトのみをフィルタリング
   * @param {Array} workouts - ワークアウトデータ配列
   * @param {Date} targetDate - 対象日
   * @returns {Array} フィルタリング済みワークアウト
   */
  static filterWeeklyWorkouts(workouts, targetDate = new Date()) {
    const weekBounds = this.getWeekBounds(targetDate);

    return workouts.filter(workout => this.isInWeek(workout, weekBounds));
  }

  /**
   * 週情報を取得
   * @param {Date} targetDate - 対象日
   * @returns {Object} 週情報
   */
  static getWeekInfo(targetDate = new Date()) {
    const target = dayjs(targetDate);
    return {
      isoWeek: target.isoWeek(),
      year: target.year(),
      month: target.month() + 1, // 0-indexedなので+1
      weekday: target.day(),
      formattedDate: target.format('YYYY-MM-DD'),
    };
  }

  /**
   * 日付のフォーマット
   * @param {Date|String} date - 日付
   * @param {String} format - フォーマット文字列
   * @returns {String} フォーマット済み日付
   */
  static format(date, format = 'YYYY-MM-DD') {
    return dayjs(date).format(format);
  }

  /**
   * 日付の差分を計算（日数）
   * @param {Date|String} date1 - 日付1
   * @param {Date|String} date2 - 日付2
   * @returns {Number} 日数差
   */
  static daysDifference(date1, date2) {
    return Math.abs(dayjs(date1).diff(dayjs(date2), 'day'));
  }

  /**
   * 今週の残り日数を取得
   * @returns {Number} 残り日数
   */
  static getRemainingDaysInWeek() {
    const today = dayjs();
    const weekEnd = today.endOf('isoWeek');
    return weekEnd.diff(today, 'day') + 1; // 今日を含む
  }
}

module.exports = DateHelper;