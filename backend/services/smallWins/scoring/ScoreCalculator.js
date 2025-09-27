/**
 * ScoreCalculator
 * 単一責任：総合スコアの計算
 */

const { SCORE_WEIGHTS, ACHIEVEMENT_BONUS } = require('./WHOStandards');

class ScoreCalculator {
  /**
   * 総合スコアを計算
   * @param {Object} cardioData - 有酸素運動データ
   * @param {Object} strengthData - 筋力トレーニングデータ
   * @returns {Number} 総合スコア（0-100）
   */
  calculateTotal(cardioData, strengthData) {
    const weightedScore = Math.round(
      cardioData.score * SCORE_WEIGHTS.cardio +
      strengthData.score * SCORE_WEIGHTS.strength
    );

    const achievementBonus = cardioData.whoAchieved && strengthData.whoAchieved
      ? ACHIEVEMENT_BONUS.both
      : 0;

    return Math.min(100, weightedScore + achievementBonus);
  }

  /**
   * スコアレベルを判定
   * @param {Number} score - 総合スコア
   * @returns {String} レベル（excellent/good/fair/needsImprovement）
   */
  getScoreLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'needsImprovement';
  }

  /**
   * スコアの詳細な内訳を取得
   * @param {Object} cardioData - 有酸素運動データ
   * @param {Object} strengthData - 筋力トレーニングデータ
   * @returns {Object} スコアの内訳
   */
  getScoreBreakdown(cardioData, strengthData) {
    const cardioContribution = Math.round(cardioData.score * SCORE_WEIGHTS.cardio);
    const strengthContribution = Math.round(strengthData.score * SCORE_WEIGHTS.strength);
    const bonus = cardioData.whoAchieved && strengthData.whoAchieved
      ? ACHIEVEMENT_BONUS.both
      : 0;

    return {
      cardio: {
        score: cardioData.score,
        weight: SCORE_WEIGHTS.cardio,
        contribution: cardioContribution,
      },
      strength: {
        score: strengthData.score,
        weight: SCORE_WEIGHTS.strength,
        contribution: strengthContribution,
      },
      bonus,
      total: Math.min(100, cardioContribution + strengthContribution + bonus),
    };
  }
}

module.exports = ScoreCalculator;