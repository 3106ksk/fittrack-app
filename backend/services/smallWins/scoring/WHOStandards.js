/**
 * WHO（世界保健機関）の運動推奨基準
 * 単一責任：WHO基準値の管理
 */

const WHO_STANDARDS = {
  cardio: {
    weeklyMinutes: 150,
    description: 'WHO推奨: 週150分の中強度有酸素運動で心疾患リスク30%減少',
    alternativeMinutes: 75, // 高強度の場合
    alternativeDescription: 'または週75分の高強度有酸素運動',
  },
  strength: {
    weeklyDays: 2,
    description: 'WHO推奨: 週2日以上の筋力トレーニングで総死亡リスク40%減少',
    majorMuscleGroups: '主要な筋肉群すべてを対象に',
  },
  combined: {
    mortalityReduction: '40%',
    description: '有酸素運動と筋力トレーニングの組み合わせで最大の健康効果',
  },
};

// スコア計算の重み付け（合計100%になるように設定）
const SCORE_WEIGHTS = {
  cardio: 0.6,    // 60% - 心血管系への影響が大きいため
  strength: 0.4,  // 40% - 週2回で十分な効果
};

// 達成ボーナス
const ACHIEVEMENT_BONUS = {
  both: 5,  // 両方達成時のボーナスポイント
};

module.exports = {
  WHO_STANDARDS,
  SCORE_WEIGHTS,
  ACHIEVEMENT_BONUS,
};