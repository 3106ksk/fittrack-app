/**
 * HealthMessageGenerator
 * 単一責任：健康メッセージの生成
 */

class HealthMessageGenerator {
  constructor() {
    this.messages = {
      excellent: '🎉 素晴らしい！WHO推奨基準を両方達成しました。この調子で継続しましょう！',
      veryGood: '💪 とても良い運動習慣です！もう少しでWHO推奨基準の完全達成です。',
      good: '👍 良い運動習慣が身についています。週2-3回の運動を目指しましょう。',
      fair: '🏃 運動を始めていますね！少しずつ頻度と時間を増やしていきましょう。',
      start: '🌱 小さな一歩から始めましょう。週1回の運動から始めてみませんか？',
    };

    this.encouragements = {
      cardioClose: '有酸素運動があと少しです！',
      strengthClose: '筋トレがあと1日で達成です！',
      firstWorkout: '最初の一歩を踏み出しました！',
      consistency: '継続は力なり。素晴らしいペースです！',
    };
  }

  /**
   * 健康メッセージを生成
   * @param {Number} score - 総合スコア
   * @param {Object} achievements - 達成状況
   * @returns {String} 健康メッセージ
   */
  generate(score, achievements) {
    if (achievements.both) {
      return this.messages.excellent;
    } else if (score >= 80) {
      return this.messages.veryGood;
    } else if (score >= 60) {
      return this.messages.good;
    } else if (score >= 40) {
      return this.messages.fair;
    } else {
      return this.messages.start;
    }
  }

  /**
   * 詳細なメッセージを生成（追加情報付き）
   * @param {Object} metrics - 全メトリクスデータ
   * @returns {Object} 詳細メッセージ
   */
  generateDetailed(metrics) {
    const mainMessage = this.generate(metrics.score.total, metrics.achievements);
    const additionalMessages = [];

    // カーディオが惜しい場合
    if (metrics.metrics.cardio.achievementRate >= 80 && !metrics.achievements.cardio) {
      additionalMessages.push(this.encouragements.cardioClose);
    }

    // 筋トレが惜しい場合
    if (metrics.metrics.strength.weeklyDays === 1) {
      additionalMessages.push(this.encouragements.strengthClose);
    }

    // 初回ワークアウト
    if (metrics.summary.totalWorkouts === 1) {
      additionalMessages.push(this.encouragements.firstWorkout);
    }

    // 継続性を称賛
    if (metrics.summary.trainingDays >= 5) {
      additionalMessages.push(this.encouragements.consistency);
    }

    return {
      main: mainMessage,
      additional: additionalMessages,
      level: this._getMessageLevel(metrics.score.total),
    };
  }

  /**
   * メッセージレベルを判定
   * @private
   */
  _getMessageLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'veryGood';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'start';
  }
}

module.exports = HealthMessageGenerator;