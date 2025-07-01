
export const WORKOUT_TYPES = {
  CARDIO: 'cardio',
  STRENGTH: 'strength'
} as const;

export type WorkoutType = typeof WORKOUT_TYPES[keyof typeof WORKOUT_TYPES];

export const EXERCISE_DATABASE = {
  walking: {
    id: 'walking',
    name: 'ウォーキング',
    type: 'cardio' as const,
    description: '全身運動。心肺機能を高め、脚部の筋肉と体幹を軽く鍛える有酸素運動。20-30分、週3-5回行うのが効果的。',
    beginner: true,
    metrics: ['duration', 'distance'] as const
  },
  jogging: {
    id: 'jogging',
    name: 'ジョギング',
    type: 'cardio' as const,
    description: '全身運動。心肺機能を向上させ、下半身の筋肉を強化する有酸素運動。15-20分、週2-3回から始めるのが適切。',
    beginner: true,
    metrics: ['duration', 'distance'] as const
  },
  squat: {
    id: 'squat',
    name: 'スクワット',
    type: 'strength' as const,
    description: '下半身トレーニング。太もも前部、お尻、体幹を鍛える基本的な自重運動。',
    beginner: true,
    metrics: ['sets', 'reps'] as const
  },
  pushup: {
    id: 'pushup',
    name: 'プッシュアップ',
    type: 'strength' as const,
    description: '上半身トレーニング。胸筋、三頭筋、肩を鍛える基本的な自重トレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const
  },
  benchpress: {
    id: 'benchpress',
    name: 'ベンチプレス',
    type: 'strength' as const,
    description: '上半身トレーニング。胸筋、三頭筋、肩を鍛える基本的なウェイトトレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const
  },
  pullup: {
    id: 'pullup',
    name: '懸垂（チンニング）',
    type: 'strength' as const,
    description: '上半身トレーニング。広背筋、僧帽筋、上腕二頭筋を中心に鍛える複合運動。',
    beginner: false,
    metrics: ['sets', 'reps'] as const
  },
  deadlift: {
    id: 'deadlift',
    name: 'デッドリフト',
    type: 'strength' as const,
    description: '全身トレーニング。背中、お尻、ハムストリングスなど多くの筋群を同時に鍛える複合運動。',
    beginner: true,
    metrics: ['sets', 'reps'] as const
  },
  crunch: {
    id: 'crunch',
    name: 'クランチ',
    type: 'strength' as const,
    description: '腹筋運動。主に腹直筋上部を鍛える自重トレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const
  },
  legraise: {
    id: 'legraise',
    name: 'レッグレイズ',
    type: 'strength' as const,
    description: '腹筋運動。下腹部と腸腰筋を重点的に鍛える自重トレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const
  }
} as const;

export const EXERCISE_OPTIONS = Object.values(EXERCISE_DATABASE);

export type ExerciseId = keyof typeof EXERCISE_DATABASE;
export type Exercise = typeof EXERCISE_DATABASE[ExerciseId];

