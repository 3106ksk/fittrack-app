/**
 * RecommendationEngine
 * 単一責任：改善提案の生成
 */

class RecommendationEngine {
  /**
   * 改善提案を生成
   * @param {Object} cardioMetrics - 有酸素運動メトリクス
   * @param {Object} strengthMetrics - 筋力トレーニングメトリクス
   * @returns {Array} 提案リスト
   */
  generate(cardioMetrics, strengthMetrics) {
    const recommendations = [];

    if (!cardioMetrics.whoAchieved) {
      recommendations.push(this._generateCardioRecommendation(cardioMetrics));
    }

    if (!strengthMetrics.whoAchieved) {
      recommendations.push(this._generateStrengthRecommendation(strengthMetrics));
    }

    if (cardioMetrics.whoAchieved && strengthMetrics.whoAchieved) {
      recommendations.push(this._generateMaintenanceRecommendation());
    }
    const balanceRec = this._generateBalanceRecommendation(cardioMetrics, strengthMetrics);
    if (balanceRec) {
      recommendations.push(balanceRec);
    }

    return recommendations;
  }

  /**
   * 有酸素運動の提案を生成
   * @private
   */
  _generateCardioRecommendation(metrics) {
    const gap = metrics.details.targetMinutes - metrics.details.weeklyMinutes;
    const dailyGap = Math.ceil(gap / 7);

    const recommendation = {
      type: 'cardio',
      priority: gap > 100 ? 'high' : 'medium',
      message: `あと週${gap}分の有酸素運動でWHO基準達成です`,
      suggestion: `1日${dailyGap}分のウォーキングから始めてみましょう`,
      tips: [],
    };

    // 具体的なアドバイスを追加
    if (gap <= 30) {
      recommendation.tips.push('通勤時に1駅分歩くだけで達成できます');
    } else if (gap <= 60) {
      recommendation.tips.push('昼休みの散歩を習慣にしてみましょう');
    } else {
      recommendation.tips.push('週末に30分のジョギングを2回追加してみましょう');
    }

    // 現在の運動パターンに基づくアドバイス
    const activeDays = Object.keys(metrics.details.byDay).length;
    if (activeDays === 0) {
      recommendation.tips.push('まずは週3回、10分の運動から始めましょう');
    } else if (activeDays < 3) {
      recommendation.tips.push('運動日を週1日増やしてみましょう');
    }

    return recommendation;
  }

  /**
   * 筋力トレーニングの提案を生成
   * @private
   */
  _generateStrengthRecommendation(metrics) {
    const gap = metrics.details.targetDays - metrics.details.weeklyDays;

    const recommendation = {
      type: 'strength',
      priority: metrics.details.weeklyDays === 0 ? 'high' : 'medium',
      message: `あと週${gap}日の筋トレでWHO基準達成です`,
      suggestion: '腕立て伏せやスクワットなど、器具不要の運動から始められます',
      tips: [],
    };

    // 具体的なアドバイスを追加
    if (metrics.details.weeklyDays === 0) {
      recommendation.tips.push('週2回、各10分から始めてみましょう');
      recommendation.tips.push('プッシュアップ、スクワット、プランクの3種目がおすすめ');
    } else if (metrics.details.weeklyDays === 1) {
      recommendation.tips.push('もう1日追加するだけで目標達成です');
      recommendation.tips.push('前回と異なる筋肉群を鍛えると効果的');
    }

    return recommendation;
  }

  /**
   * 維持のための提案を生成
   * @private
   */
  _generateMaintenanceRecommendation() {
    return {
      type: 'maintenance',
      priority: 'low',
      message: '素晴らしい運動習慣を維持しています！',
      suggestion: '新しいチャレンジや運動のバリエーションを増やしてみましょう',
      tips: [
        'HIITトレーニングで強度を上げる',
        'ヨガやピラティスで柔軟性を向上',
        '新しいスポーツに挑戦',
      ],
    };
  }

  /**
   * バランスの提案を生成
   * @private
   */
  _generateBalanceRecommendation(cardioMetrics, strengthMetrics) {
    const cardioRate = cardioMetrics.details.achievementRate;
    const strengthRate = strengthMetrics.details.achievementRate;
    const difference = Math.abs(cardioRate - strengthRate);

    // バランスが大きく崩れている場合
    if (difference > 50) {
      const weakerType = cardioRate < strengthRate ? 'cardio' : 'strength';
      const weakerLabel = weakerType === 'cardio' ? '有酸素運動' : '筋力トレーニング';

      return {
        type: 'balance',
        priority: 'medium',
        message: `${weakerLabel}を強化してバランスを改善しましょう`,
        suggestion: `現在の${weakerLabel}の達成率は${weakerType === 'cardio' ? cardioRate : strengthRate}%です`,
        tips: [`週間スケジュールに${weakerLabel}の時間を追加してみましょう`],
      };
    }

    return null;
  }
}

module.exports = RecommendationEngine;