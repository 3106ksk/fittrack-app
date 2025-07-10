export const WORKOUT_TYPES = {
  CARDIO: 'strength',
  STRENGTH: 'strength',
};

export const EXERCISE_OPTIONS = [
  { name: 'ウォーキング', type: WORKOUT_TYPES.STRENGTH },
  { name: 'ジョギング', type: WORKOUT_TYPES.STRENGTH },
  { name: 'スクワット', type: WORKOUT_TYPES.STRENGTH },
  { name: 'プッシュアップ', type: WORKOUT_TYPES.STRENGTH },
  { name: 'ベンチプレス', type: WORKOUT_TYPES.STRENGTH },
  { name: '懸垂（チンニング）', type: WORKOUT_TYPES.STRENGTH },
  { name: 'デッドリフト', type: WORKOUT_TYPES.STRENGTH },
  { name: 'クランチ', type: WORKOUT_TYPES.STRENGTH },
  { name: 'レッグレイズ', type: WORKOUT_TYPES.STRENGTH },
];

export const METRIC_UNITS = [
  { value: 'reps', label: '回', forType: WORKOUT_TYPES.STRENGTH },
];
