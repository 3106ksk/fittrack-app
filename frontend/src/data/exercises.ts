export const WORKOUT_TYPES = {
  CARDIO: 'cardio',
  STRENGTH: 'strength',
} as const;

export type WorkoutType = (typeof WORKOUT_TYPES)[keyof typeof WORKOUT_TYPES];

export const EXERCISE_DATABASE = {
  walking: {
    id: 'walking',
    name: 'ウォーキング',
    type: 'cardio' as const,
    description:
      '全身運動。心肺機能を高め、脚部の筋肉と体幹を軽く鍛える有酸素運動。20-30分、週3-5回行うのが効果的。',
    beginner: true,
    metrics: ['duration', 'distance'] as const,
  },
  jogging: {
    id: 'jogging',
    name: 'ジョギング',
    type: 'cardio' as const,
    description:
      '全身運動。心肺機能を向上させ、下半身の筋肉を強化する有酸素運動。15-20分、週2-3回から始めるのが適切。',
    beginner: true,
    metrics: ['duration', 'distance'] as const,
  },
  running: {
    id: 'running',
    name: 'ランニング',
    type: 'cardio' as const,
    description:
      '高強度の有酸素運動。心肺機能を大幅に向上させ、下半身の筋力強化にも効果的。',
    beginner: true,
    metrics: ['duration', 'distance'] as const,
  },
  cycling: {
    id: 'cycling',
    name: 'サイクリング',
    type: 'cardio' as const,
    description:
      '低負荷で持続可能な有酸素運動。膝への負担が少なく、下半身強化に効果的。',
    beginner: true,
    metrics: ['duration', 'distance'] as const,
  },
  squat: {
    id: 'squat',
    name: 'スクワット',
    type: 'strength' as const,
    description:
      '下半身トレーニング。太もも前部、お尻、体幹を鍛える基本的な自重運動。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
  },
  jump_squat: {
  id: 'jump_squat',
  name: 'ジャンプスクワット',
  type: 'strength' as const,
  description:
    'プライオメトリック 下半身トレーニング。スクワットの動作にジャンプを加えることで、太もも、お尻、ふくらはぎの筋力と爆発力を同時に鍛える。心肺機能向上にも効果的。',
  beginner: false,
  metrics: ['sets', 'reps'] as const,
},
  jumping_lunge: {
  id: 'jumping_lunge',
  name: 'ジャンプランジ',
  type: 'strength' as const,
  description:
    'プライオメトリック下半身トレーニング。ランジの動作にジャンプを加えることで、太もも、お尻、ふくらはぎの筋力とバランス力を強化。片脚ずつ鍛えるため左右差の改善にも効果的。',
  beginner: false,
  metrics: ['sets', 'reps'] as const,
},
  pushup: {
    id: 'pushup',
    name: 'プッシュアップ',
    type: 'strength' as const,
    description:
      '上半身トレーニング。胸筋、三頭筋、肩を鍛える基本的な自重トレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
  },
  plank: {
    id: 'plank',
    name: 'プランク',
    type: 'strength' as const,
    description:
      '体幹トレーニング。腹筋、背筋、インナーマッスルを同時に鍛える静的運動。',
    beginner: true,
    metrics: ['duration'] as const,
  },
  benchpress: {
    id: 'benchpress',
    name: 'ベンチプレス',
    type: 'strength' as const,
    description:
      '上半身トレーニング。胸筋、三頭筋、肩を鍛える基本的なウェイトトレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
  },
  diamond_pushup: {
    id: 'diamond_pushup',
    name: 'ダイヤモンドプッシュアップ',
    type: 'strength' as const,
    description:
      '上腕三頭筋に特化したプッシュアップバリエーション。胸筋下部も鍛える。',
    beginner: false,
    metrics: ['sets', 'reps'] as const,
  },
  pullup: {
    id: 'pullup',
    name: '懸垂（チンニング）',
    type: 'strength' as const,
    description:
      '上半身トレーニング。広背筋、僧帽筋、上腕二頭筋を中心に鍛える複合運動。',
    beginner: false,
    metrics: ['sets', 'reps'] as const,
  },
  deadlift: {
    id: 'deadlift',
    name: 'デッドリフト',
    type: 'strength' as const,
    description:
      '全身トレーニング。背中、お尻、ハムストリングスなど多くの筋群を同時に鍛える複合運動。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
  },
  crunch: {
    id: 'crunch',
    name: 'クランチ',
    type: 'strength' as const,
    description: '腹筋運動。主に腹直筋上部を鍛える自重トレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
  },
  legraise: {
    id: 'legraise',
    name: 'レッグレイズ',
    type: 'strength' as const,
    description: '腹筋運動。下腹部と腸腰筋を重点的に鍛える自重トレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
  },
} as const;

export const EXERCISE_OPTIONS = Object.values(EXERCISE_DATABASE);

export type ExerciseId = keyof typeof EXERCISE_DATABASE;
export type Exercise = (typeof EXERCISE_DATABASE)[ExerciseId];
