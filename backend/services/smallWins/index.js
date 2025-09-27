/**
 * SmallWinsEngine
 * WHO基準に基づく健康スコア計算エンジン
 */

const CardioMetricsCalculator = require('./metrics/CardioMetricsCalculator');
const StrengthMetricsCalculator = require('./metrics/StrengthMetricsCalculator');

class SmallWinsEngine {
  constructor() {
    this.cardioCalculator = new CardioMetricsCalculator();
    this.strengthCalculator = new StrengthMetricsCalculator();
  }

  /**
   * 週間のワークアウトデータからInsightを計算
   * @param {Array} workouts - ワークアウトデータの配列
   * @returns {Object} 計算結果
   */
  calculateWeeklyInsight(workouts) {
    const cardioMetrics = this.cardioCalculator.calculate(workouts);
    const strengthMetrics = this.strengthCalculator.calculate(workouts);

    const cardioScore = cardioMetrics.score;
    const strengthScore = strengthMetrics.score;
    const totalScore = Math.round((cardioScore + strengthScore) / 2);

    const achievements = {
      cardio: cardioMetrics.whoAchieved,
      strength: strengthMetrics.whoAchieved,
      both: cardioMetrics.whoAchieved && strengthMetrics.whoAchieved
    };

    const healthMessage = this.generateHealthMessage(achievements);
    const recommendations = this.generateRecommendations(
      cardioMetrics,
      strengthMetrics
    );

    return {
      score: {
        total: totalScore,
        cardio: cardioScore,
        strength: strengthScore
      },
      metrics: {
        cardio: cardioMetrics.details,
        strength: strengthMetrics.details
      },
      achievements,
      healthMessage,
      recommendations,
      version: '1.0.0-mvp'
    };
  }

  /**
   * シンプルな健康メッセージ生成
   */
  generateHealthMessage(achievements) {
    if (achievements.both) {
      return 'WHO推奨完全達成：総死亡リスク40%減';
    }
    if (achievements.cardio) {
      return 'WHO有酸素推奨達成：心疾患リスク30%減';
    }
    if (achievements.strength) {
      return 'WHO筋力推奨達成：サルコペニア予防効果';
    }
    return '運動習慣を増やしましょう：週150分の運動で健康改善';
  }

  /**
   * 推奨事項生成
   */
  generateRecommendations(cardioMetrics, strengthMetrics) {
    const recommendations = [];

    if (!cardioMetrics.whoAchieved) {
      const shortage = 150 - cardioMetrics.details.weeklyMinutes;
      if (shortage > 0) {
        recommendations.push(
          `有酸素運動をあと週${shortage}分追加でWHO推奨達成`
        );
      }
    }

    if (!strengthMetrics.whoAchieved) {
      const daysNeeded = 2 - strengthMetrics.details.weeklyDays;
      if (daysNeeded > 0) {
        recommendations.push(
          `筋力トレーニングをあと週${daysNeeded}日追加でWHO推奨達成`
        );
      }
    }

    if (cardioMetrics.whoAchieved && strengthMetrics.whoAchieved) {
      recommendations.push('素晴らしい！この習慣を維持しましょう');
    }

    return recommendations.slice(0, 3);
  }
}

module.exports = SmallWinsEngine;