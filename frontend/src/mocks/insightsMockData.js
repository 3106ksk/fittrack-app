export const mockCurrentInsightResponse = {
  date: '2025-09-28',
  scores: {
    total: 85,
    cardio: 100,
    strength: 50,
  },
  whoCompliance: {
    cardio: true,
    strength: false,
    combined: false,
  },
  metrics: {
    cardio: {
      weeklyMinutes: 165,
      targetMinutes: 150,
      achievementRate: 100,
      workoutCount: 4,
    },
    strength: {
      weeklyDays: 1,
      targetDays: 2,
      achievementRate: 50,
      workoutCount: 2,
    },
  },
  healthMessage: 'WHO有酸素推奨達成：心疾患リスク30%減',
  recommendations: ['筋力トレーニングをあと1日追加でWHO推奨完全達成'],
};
