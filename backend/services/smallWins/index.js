/**
 * SmallWinsEngine
 * 統合エントリーポイント
 *
 * 各モジュールを組み合わせて、週間の運動データから
 * WHO基準に基づく健康スコアとインサイトを生成
 */

const CardioMetricsCalculator = require('./metrics/CardioMetricsCalculator');
const StrengthMetricsCalculator = require('./metrics/StrengthMetricsCalculator');
const ScoreCalculator = require('./scoring/ScoreCalculator');
const HealthMessageGenerator = require('./insights/HealthMessageGenerator');
const RecommendationEngine = require('./insights/RecommendationEngine');
const DateHelper = require('./utils/DateHelper');

class SmallWinsEngine {
  constructor() {
    this.version = '2.0.0';
    this.cardioCalculator = new CardioMetricsCalculator();
    this.strengthCalculator = new StrengthMetricsCalculator();
    this.scoreCalculator = new ScoreCalculator();
    this.messageGenerator = new HealthMessageGenerator();
    this.recommendationEngine = new RecommendationEngine();
  }

  /**
   * メインメソッド：週間のワークアウトデータからInsightを計算
   * @param {Array} workouts - ワークアウトデータの配列
   * @param {Date} targetDate - 計算対象日（デフォルト: 今日）
   * @returns {Object} 計算されたInsightデータ
   */
  calculateWeeklyInsight(workouts, targetDate = new Date()) {
    const weeklyWorkouts = DateHelper.filterWeeklyWorkouts(workouts, targetDate);
    const weekInfo = DateHelper.getWeekInfo(targetDate);
    const weekBounds = DateHelper.getWeekBounds(targetDate);

    const cardioMetrics = this.cardioCalculator.calculate(weeklyWorkouts);
    const strengthMetrics = this.strengthCalculator.calculate(weeklyWorkouts);

    const totalScore = this.scoreCalculator.calculateTotal(cardioMetrics, strengthMetrics);
    const scoreBreakdown = this.scoreCalculator.getScoreBreakdown(cardioMetrics, strengthMetrics);
    const weekSummary = {
      weekStartDate: weekBounds.startString,
      weekEndDate: weekBounds.endString,
      totalWorkouts: weeklyWorkouts.length,
      trainingDays: new Set(weeklyWorkouts.map(w => w.date)).size,
      remainingDays: DateHelper.getRemainingDaysInWeek(),
    };

    const achievements = {
      cardio: cardioMetrics.whoAchieved,
      strength: strengthMetrics.whoAchieved,
      both: cardioMetrics.whoAchieved && strengthMetrics.whoAchieved,
    };
    const healthMessage = this.messageGenerator.generate(totalScore, achievements);
    const detailedMessage = this.messageGenerator.generateDetailed({
      score: { total: totalScore },
      achievements,
      metrics: { cardio: cardioMetrics.details, strength: strengthMetrics.details },
      summary: weekSummary,
    });
    const recommendations = this.recommendationEngine.generate(cardioMetrics, strengthMetrics);

    const statistics = {
      cardio: this.cardioCalculator.getStatistics(cardioMetrics),
      strength: this.strengthCalculator.getStatistics(strengthMetrics),
    };
    return {
      version: this.version,
      calculatedAt: new Date().toISOString(),
      targetWeek: {
        start: weekBounds.startString,
        end: weekBounds.endString,
        isoWeek: weekInfo.isoWeek,
        year: weekInfo.year,
      },
      score: {
        total: totalScore,
        cardio: cardioMetrics.score,
        strength: strengthMetrics.score,
        breakdown: scoreBreakdown,
        level: this.scoreCalculator.getScoreLevel(totalScore),
      },
      metrics: {
        cardio: cardioMetrics.details,
        strength: strengthMetrics.details,
      },
      statistics,
      achievements,
      summary: weekSummary,
      healthMessage,
      detailedMessage,
      recommendations,
    };
  }

  /**
   * 簡易版：スコアのみを計算
   * @param {Array} workouts - ワークアウトデータの配列
   * @param {Date} targetDate - 計算対象日
   * @returns {Number} 総合スコア
   */
  calculateScoreOnly(workouts, targetDate = new Date()) {
    const weeklyWorkouts = DateHelper.filterWeeklyWorkouts(workouts, targetDate);
    const cardioMetrics = this.cardioCalculator.calculate(weeklyWorkouts);
    const strengthMetrics = this.strengthCalculator.calculate(weeklyWorkouts);
    return this.scoreCalculator.calculateTotal(cardioMetrics, strengthMetrics);
  }

  /**
   * メトリクスのみを計算（UIでの即時フィードバック用）
   * @param {Array} workouts - ワークアウトデータの配列
   * @param {String} type - 'cardio' or 'strength'
   * @returns {Object} メトリクス
   */
  calculateMetricsOnly(workouts, type) {
    if (type === 'cardio') {
      return this.cardioCalculator.calculate(workouts);
    } else if (type === 'strength') {
      return this.strengthCalculator.calculate(workouts);
    }
    throw new Error(`Invalid type: ${type}. Must be 'cardio' or 'strength'`);
  }
}

module.exports = SmallWinsEngine;