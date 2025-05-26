export const WORKOUT_TYPES = {
  CARDIO: 'cardio',
  STRENGTH: 'strength'
};

export const EXERCISE_OPTIONS = [
  { name: 'ウォーキング', type: WORKOUT_TYPES.CARDIO },
  { name: 'ジョギング', type: WORKOUT_TYPES.CARDIO },
  { name: 'スクワット', type: WORKOUT_TYPES.STRENGTH },
  { name: 'プッシュアップ', type: WORKOUT_TYPES.STRENGTH },
  { name: 'ベンチプレス', type: WORKOUT_TYPES.STRENGTH },
  { name: '懸垂（チンニング）', type: WORKOUT_TYPES.STRENGTH },
  { name: 'デッドリフト', type: WORKOUT_TYPES.STRENGTH },
  { name: 'クランチ', type: WORKOUT_TYPES.STRENGTH },
  { name: 'レッグレイズ', type: WORKOUT_TYPES.STRENGTH }
];


export const METRIC_UNITS = [
  { value: 'reps', label: '回', forType: WORKOUT_TYPES.STRENGTH },
  { value: 'distance', label: 'km', forType: WORKOUT_TYPES.CARDIO },
  { value: 'duration', label: '分', forType: WORKOUT_TYPES.CARDIO }
];