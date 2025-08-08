export const mockWorkouts = [
  // 筋トレ（strength）の例
  {
    id: 1,
    userID: 1,
    date: '2024-07-26',
    exercise: 'スクワット',
    exerciseType: 'strength',
    sets: 3,
    reps: 30,
    repsDetail: [
      { setNumber: 1, reps: 10 },
      { setNumber: 2, reps: 10 },
      { setNumber: 3, reps: 10 }
    ],
    distance: null,
    duration: null,
    intensity: '中',
    createdAt: '2024-07-26T10:00:00.000Z',
    updatedAt: '2024-07-26T10:00:00.000Z',
  },
  {
    id: 2,
    userID: 1,
    date: '2024-07-27',
    exercise: 'ベンチプレス',
    exerciseType: 'strength',
    sets: 3,
    reps: 24,
    repsDetail: [
      { setNumber: 1, reps: 8 },
      { setNumber: 2, reps: 8 },
      { setNumber: 3, reps: 8 }
    ],
    distance: null,
    duration: null,
    intensity: '高',
    createdAt: '2024-07-27T10:00:00.000Z',
    updatedAt: '2024-07-27T10:00:00.000Z',
  },
  // カーディオ（cardio）の例
  {
    id: 3,
    userID: 2,
    date: '2024-07-26',
    exercise: 'ジョギング',
    exerciseType: 'cardio',
    sets: null,
    reps: null,
    repsDetail: null,
    distance: 5.0,
    duration: 30,
    intensity: '中',
    createdAt: '2024-07-26T10:00:00.000Z',
    updatedAt: '2024-07-26T10:00:00.000Z',
  },
  {
    id: 4,
    userID: 2,
    date: '2024-07-27',
    exercise: 'ウォーキング',
    exerciseType: 'cardio',
    sets: null,
    reps: null,
    repsDetail: null,
    distance: 3.0,
    duration: 45,
    intensity: '低',
    createdAt: '2024-07-27T10:00:00.000Z',
    updatedAt: '2024-07-27T10:00:00.000Z',
  },
  // 複雑な筋トレ例（セット数が異なる）
  {
    id: 5,
    userID: 1,
    date: '2024-07-28',
    exercise: 'デッドリフト',
    exerciseType: 'strength',
    sets: 5,
    reps: 25,
    repsDetail: [
      { setNumber: 1, reps: 5 },
      { setNumber: 2, reps: 5 },
      { setNumber: 3, reps: 5 },
      { setNumber: 4, reps: 5 },
      { setNumber: 5, reps: 5 }
    ],
    distance: null,
    duration: null,
    intensity: '高',
    createdAt: '2024-07-28T10:00:00.000Z',
    updatedAt: '2024-07-28T10:00:00.000Z',
  },
  // 高強度カーディオ例
  {
    id: 6,
    userID: 1,
    date: '2024-07-29',
    exercise: 'ランニング',
    exerciseType: 'cardio',
    sets: null,
    reps: null,
    repsDetail: null,
    distance: 10.0,
    duration: 60,
    intensity: '高',
    createdAt: '2024-07-29T10:00:00.000Z',
    updatedAt: '2024-07-29T10:00:00.000Z',
  }
];

// モックデータ作成関数
export const createMockWorkout = (overrides = {}) => ({
  id: mockWorkouts.length + 1,
  userID: 1,
  date: new Date().toISOString().split('T')[0],
  exercise: 'テストエクササイズ',
  exerciseType: 'strength',
  sets: 3,
  reps: 30,
  repsDetail: [
    { setNumber: 1, reps: 10 },
    { setNumber: 2, reps: 10 },
    { setNumber: 3, reps: 10 }
  ],
  distance: null,
  duration: null,
  intensity: '中',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// 筋トレ用モック作成関数
export const createMockStrengthWorkout = (overrides = {}) => ({
  id: mockWorkouts.length + 1,
  userID: 1,
  date: new Date().toISOString().split('T')[0],
  exercise: 'スクワット',
  exerciseType: 'strength',
  sets: 3,
  reps: 30,
  repsDetail: [
    { setNumber: 1, reps: 10 },
    { setNumber: 2, reps: 10 },
    { setNumber: 3, reps: 10 }
  ],
  distance: null,
  duration: null,
  intensity: '中',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// カーディオ用モック作成関数
export const createMockCardioWorkout = (overrides = {}) => ({
  id: mockWorkouts.length + 1,
  userID: 1,
  date: new Date().toISOString().split('T')[0],
  exercise: 'ジョギング',
  exerciseType: 'cardio',
  sets: null,
  reps: null,
  repsDetail: null,
  distance: 5.0,
  duration: 30,
  intensity: '中',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// バリデーションエラー用の無効なデータ
export const invalidWorkoutData = {
  // exercise が不足
  missingExercise: {
    exerciseType: 'strength',
    intensity: '中',
    setNumber: 1,
    repsNumber: [{ reps: 10 }]
  },
  // exerciseType が不足
  missingExerciseType: {
    exercise: 'ベンチプレス',
    intensity: '中',
    setNumber: 1,
    repsNumber: [{ reps: 10 }]
  },
  // intensity が不足
  missingIntensity: {
    exercise: 'ベンチプレス',
    exerciseType: 'strength',
    setNumber: 1,
    repsNumber: [{ reps: 10 }]
  },
  // 無効な強度
  invalidIntensity: {
    exercise: 'ベンチプレス',
    exerciseType: 'strength',
    intensity: '無効',
    setNumber: 1,
    repsNumber: [{ reps: 10 }]
  },
  // カーディオで距離が不足
  cardioMissingDistance: {
    exercise: 'ランニング',
    exerciseType: 'cardio',
    intensity: '高',
    duration: 30
  },
  // カーディオで時間が不足
  cardioMissingDuration: {
    exercise: 'ランニング',
    exerciseType: 'cardio',
    intensity: '高',
    distance: 10
  }
};