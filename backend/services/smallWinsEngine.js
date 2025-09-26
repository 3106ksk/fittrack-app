const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isBetween = require('dayjs/plugin/isBetween');

// プラグインを拡張
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

/**
 * SmallWinsEngine
 * WHO健康基準に基づいてユーザーの運動データから健康スコアを計算するエンジン
 *
 * 主な責務：
 * 1. ワークアウトデータの集計
 * 2. WHO基準に対する達成度の計算
 * 3. 健康スコアの算出
 */
class SmallWinsEngine {
  constructor() {
    // バージョン管理（将来のアルゴリズム変更追跡用）
    this.version = '1.0.0';

    // WHO（世界保健機関）の運動推奨基準
    this.WHO_STANDARDS = {
      cardio: {
        weeklyMinutes: 150,
        description: 'WHO推奨: 週150分の中強度有酸素運動で心疾患リスク30%減少',
      },
      strength: {
        weeklyDays: 2,
        description: 'WHO推奨: 週2日以上の筋力トレーニングで総死亡リスク40%減少',
      },
    };

    // スコア計算の重み付け（合計100%になるように設定）
    this.SCORE_WEIGHTS = {
      cardio: 0.6,
      strength: 0.4,
    };
  }

  /**
   * 有酸素運動のメトリクスを計算
   * @param {Array} workouts - ワークアウトデータ
   * @returns {Object} cardioメトリクス
   */
  calculateCardioMetrics(workouts) {

    const cardioWorkouts = workouts.filter((workout) => workout.exerciseType === 'cardio');
    
    // 総運動時間を計算（秒単位で集計）
    let totalSeconds = 0;

    cardioWorkouts.forEach((workout) => {
      if (workout.duration) {
        // durationは秒単位として保存されている
        totalSeconds += Number(workout.duration) || 0;
      }
    });

    // 秒から分に変換
    const totalMinutes = Math.floor(totalSeconds / 60);

    const targetMinutes = this.WHO_STANDARDS.cardio.weeklyMinutes;

    // スコア計算（150分で100点、それ以上も100点上限）
    const score = Math.min(100, Math.round((totalMinutes / targetMinutes) * 100));

    // WHO基準達成判定
    const whoAchieved = totalMinutes >= targetMinutes;

    // 日別の運動時間（習慣形成の追跡とUI表示用）
    const byDay = {};
    cardioWorkouts.forEach((workout) => {
      const date = workout.date;
      const minutes = Math.floor((workout.duration || 0) / 60);
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
   * 筋力トレーニングのメトリクスを計算
   * @param {Array} workouts - ワークアウトデータ
   * @returns {Object} strengthメトリクス
   */
  calculateStrengthMetrics(workouts) {}

  /**
   * 総合スコアを計算
   * @param {Object} cardioData - 有酸素運動データ
   * @param {Object} strengthData - 筋力トレーニングデータ
   * @returns {Number} 総合スコア（0-100）
   */
  calculateTotalScore(cardioData, strengthData) {
    // 重み付け平均で総合スコアを計算
    const weightedScore = Math.round(
      cardioData.score * this.SCORE_WEIGHTS.cardio +
        strengthData.score * this.SCORE_WEIGHTS.strength
    );

    // WHO基準を両方達成した場合はボーナスポイント
    const achievementBonus = cardioData.whoAchieved && strengthData.whoAchieved ? 5 : 0;

    // 最大100点でキャップ
    return Math.min(100, weightedScore + achievementBonus);
  }

  /**
   * メインメソッド：週間のワークアウトデータからInsightを計算
   * @param {Array} workouts - ワークアウトデータの配列
   * @param {Date} targetDate - 計算対象日（デフォルト: 今日）
   * @returns {Object} 計算されたInsightデータ
   */
  calculateWeeklyInsight(workouts, targetDate = new Date()) {}
}

module.exports = SmallWinsEngine;
