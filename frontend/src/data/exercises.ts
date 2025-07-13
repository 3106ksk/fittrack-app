export const WORKOUT_TYPES = {
  CARDIO: 'cardio',
  STRENGTH: 'strength',
} as const;

export type WorkoutType = (typeof WORKOUT_TYPES)[keyof typeof WORKOUT_TYPES];

// トレーニング効果の種類
export const TRAINING_EFFECTS = {
  CARDIOVASCULAR: 'cardiovascular',
  MUSCLE_STRENGTH: 'muscle_strength',
  MUSCLE_ENDURANCE: 'muscle_endurance',
  POWER: 'power',
  FLEXIBILITY: 'flexibility',
  BALANCE: 'balance',
  CORE_STABILITY: 'core_stability',
  FAT_BURNING: 'fat_burning',
  AGILITY: 'agility',
} as const;

// ターゲット筋群
export const MUSCLE_GROUPS = {
  CHEST: 'chest',
  BACK: 'back',
  SHOULDERS: 'shoulders',
  ARMS: 'arms',
  CORE: 'core',
  LEGS: 'legs',
  GLUTES: 'glutes',
  CALVES: 'calves',
  FULL_BODY: 'full_body',
} as const;

export const EXERCISE_DATABASE = {
  walking: {
    id: 'walking',
    name: 'ウォーキング',
    type: 'cardio' as const,
    description:
      '全身運動。心肺機能を高め、脚部の筋肉と体幹を軽く鍛える有酸素運動。20-30分、週3-5回行うのが効果的。',
    beginner: true,
    metrics: ['duration', 'distance'] as const,
    targetMuscles: [MUSCLE_GROUPS.LEGS, MUSCLE_GROUPS.CORE],
    primaryEffects: [TRAINING_EFFECTS.CARDIOVASCULAR, TRAINING_EFFECTS.FAT_BURNING],
    secondaryEffects: [TRAINING_EFFECTS.MUSCLE_ENDURANCE],
    intensity: 2, // 1-5スケール
    calorieBurnRate: 'low', // low, medium, high
  },
  jogging: {
    id: 'jogging',
    name: 'ジョギング',
    type: 'cardio' as const,
    description:
      '全身運動。心肺機能を向上させ、下半身の筋肉を強化する有酸素運動。15-20分、週2-3回から始めるのが適切。',
    beginner: true,
    metrics: ['duration', 'distance'] as const,
    targetMuscles: [MUSCLE_GROUPS.LEGS, MUSCLE_GROUPS.CORE],
    primaryEffects: [TRAINING_EFFECTS.CARDIOVASCULAR, TRAINING_EFFECTS.MUSCLE_ENDURANCE],
    secondaryEffects: [TRAINING_EFFECTS.FAT_BURNING],
    intensity: 3,
    calorieBurnRate: 'medium',
  },
  running: {
    id: 'running',
    name: 'ランニング',
    type: 'cardio' as const,
    description:
      '高強度の有酸素運動。心肺機能を大幅に向上させ、下半身の筋力強化にも効果的。',
    beginner: true,
    metrics: ['duration', 'distance'] as const,
    targetMuscles: [MUSCLE_GROUPS.LEGS, MUSCLE_GROUPS.CORE],
    primaryEffects: [TRAINING_EFFECTS.CARDIOVASCULAR, TRAINING_EFFECTS.POWER],
    secondaryEffects: [TRAINING_EFFECTS.MUSCLE_STRENGTH, TRAINING_EFFECTS.FAT_BURNING],
    intensity: 4,
    calorieBurnRate: 'high',
  },
  cycling: {
    id: 'cycling',
    name: 'サイクリング',
    type: 'cardio' as const,
    description:
      '低負荷で持続可能な有酸素運動。膝への負担が少なく、下半身強化に効果的。',
    beginner: true,
    metrics: ['duration', 'distance'] as const,
    targetMuscles: [MUSCLE_GROUPS.LEGS, MUSCLE_GROUPS.GLUTES],
    primaryEffects: [TRAINING_EFFECTS.CARDIOVASCULAR, TRAINING_EFFECTS.MUSCLE_ENDURANCE],
    secondaryEffects: [TRAINING_EFFECTS.FAT_BURNING],
    intensity: 3,
    calorieBurnRate: 'medium',
  },
  squat: {
    id: 'squat',
    name: 'スクワット',
    type: 'strength' as const,
    description:
      '下半身トレーニング。太もも前部、お尻、体幹を鍛える基本的な自重運動。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
    targetMuscles: [MUSCLE_GROUPS.LEGS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.CORE],
    primaryEffects: [TRAINING_EFFECTS.MUSCLE_STRENGTH, TRAINING_EFFECTS.MUSCLE_ENDURANCE],
    secondaryEffects: [TRAINING_EFFECTS.CORE_STABILITY, TRAINING_EFFECTS.BALANCE],
    intensity: 3,
    calorieBurnRate: 'medium',
  },
  jump_squat: {
  id: 'jump_squat',
  name: 'ジャンプスクワット',
  type: 'strength' as const,
  description:
    'プライオメトリック 下半身トレーニング。スクワットの動作にジャンプを加えることで、太もも、お尻、ふくらはぎの筋力と爆発力を同時に鍛える。心肺機能向上にも効果的。',
  beginner: false,
  metrics: ['sets', 'reps'] as const,
  targetMuscles: [MUSCLE_GROUPS.LEGS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.CALVES],
  primaryEffects: [TRAINING_EFFECTS.POWER, TRAINING_EFFECTS.AGILITY],
  secondaryEffects: [TRAINING_EFFECTS.CARDIOVASCULAR, TRAINING_EFFECTS.MUSCLE_STRENGTH],
  intensity: 4,
  calorieBurnRate: 'high',
},
  jumping_lunge: {
  id: 'jumping_lunge',
  name: 'ジャンプランジ',
  type: 'strength' as const,
  description:
    'プライオメトリック下半身トレーニング。ランジの動作にジャンプを加えることで、太もも、お尻、ふくらはぎの筋力とバランス力を強化。片脚ずつ鍛えるため左右差の改善にも効果的。',
  beginner: false,
  metrics: ['sets', 'reps'] as const,
  targetMuscles: [MUSCLE_GROUPS.LEGS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.CALVES],
  primaryEffects: [TRAINING_EFFECTS.POWER, TRAINING_EFFECTS.BALANCE],
  secondaryEffects: [TRAINING_EFFECTS.AGILITY, TRAINING_EFFECTS.CORE_STABILITY],
  intensity: 4,
  calorieBurnRate: 'high',
},
  pushup: {
    id: 'pushup',
    name: 'プッシュアップ',
    type: 'strength' as const,
    description:
      '上半身トレーニング。胸筋、三頭筋、肩を鍛える基本的な自重トレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
    targetMuscles: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.ARMS, MUSCLE_GROUPS.SHOULDERS],
    primaryEffects: [TRAINING_EFFECTS.MUSCLE_STRENGTH, TRAINING_EFFECTS.MUSCLE_ENDURANCE],
    secondaryEffects: [TRAINING_EFFECTS.CORE_STABILITY],
    intensity: 3,
    calorieBurnRate: 'medium',
  },
  plank: {
    id: 'plank',
    name: 'プランク',
    type: 'strength' as const,
    description:
      '体幹トレーニング。腹筋、背筋、インナーマッスルを同時に鍛える静的運動。',
    beginner: true,
    metrics: ['duration'] as const,
    targetMuscles: [MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.SHOULDERS],
    primaryEffects: [TRAINING_EFFECTS.CORE_STABILITY, TRAINING_EFFECTS.MUSCLE_ENDURANCE],
    secondaryEffects: [TRAINING_EFFECTS.BALANCE],
    intensity: 2,
    calorieBurnRate: 'low',
  },
  benchpress: {
    id: 'benchpress',
    name: 'ベンチプレス',
    type: 'strength' as const,
    description:
      '上半身トレーニング。胸筋、三頭筋、肩を鍛える基本的なウェイトトレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
    targetMuscles: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.ARMS, MUSCLE_GROUPS.SHOULDERS],
    primaryEffects: [TRAINING_EFFECTS.MUSCLE_STRENGTH],
    secondaryEffects: [TRAINING_EFFECTS.MUSCLE_ENDURANCE],
    intensity: 4,
    calorieBurnRate: 'medium',
  },
  diamond_pushup: {
    id: 'diamond_pushup',
    name: 'ダイヤモンドプッシュアップ',
    type: 'strength' as const,
    description:
      '上腕三頭筋に特化したプッシュアップバリエーション。胸筋下部も鍛える。',
    beginner: false,
    metrics: ['sets', 'reps'] as const,
    targetMuscles: [MUSCLE_GROUPS.ARMS, MUSCLE_GROUPS.CHEST],
    primaryEffects: [TRAINING_EFFECTS.MUSCLE_STRENGTH],
    secondaryEffects: [TRAINING_EFFECTS.CORE_STABILITY],
    intensity: 4,
    calorieBurnRate: 'medium',
  },
  pullup: {
    id: 'pullup',
    name: '懸垂（チンニング）',
    type: 'strength' as const,
    description:
      '上半身トレーニング。広背筋、僧帽筋、上腕二頭筋を中心に鍛える複合運動。',
    beginner: false,
    metrics: ['sets', 'reps'] as const,
    targetMuscles: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.ARMS, MUSCLE_GROUPS.SHOULDERS],
    primaryEffects: [TRAINING_EFFECTS.MUSCLE_STRENGTH],
    secondaryEffects: [TRAINING_EFFECTS.CORE_STABILITY],
    intensity: 5,
    calorieBurnRate: 'medium',
  },
  deadlift: {
    id: 'deadlift',
    name: 'デッドリフト',
    type: 'strength' as const,
    description:
      '全身トレーニング。背中、お尻、ハムストリングスなど多くの筋群を同時に鍛える複合運動。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
    targetMuscles: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.LEGS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.CORE],
    primaryEffects: [TRAINING_EFFECTS.MUSCLE_STRENGTH],
    secondaryEffects: [TRAINING_EFFECTS.CORE_STABILITY, TRAINING_EFFECTS.POWER],
    intensity: 5,
    calorieBurnRate: 'high',
  },
  crunch: {
    id: 'crunch',
    name: 'クランチ',
    type: 'strength' as const,
    description: '腹筋運動。主に腹直筋上部を鍛える自重トレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
    targetMuscles: [MUSCLE_GROUPS.CORE],
    primaryEffects: [TRAINING_EFFECTS.MUSCLE_STRENGTH, TRAINING_EFFECTS.MUSCLE_ENDURANCE],
    secondaryEffects: [TRAINING_EFFECTS.CORE_STABILITY],
    intensity: 2,
    calorieBurnRate: 'low',
  },
  legraise: {
    id: 'legraise',
    name: 'レッグレイズ',
    type: 'strength' as const,
    description: '腹筋運動。下腹部と腸腰筋を重点的に鍛える自重トレーニング。',
    beginner: true,
    metrics: ['sets', 'reps'] as const,
    targetMuscles: [MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.LEGS],
    primaryEffects: [TRAINING_EFFECTS.MUSCLE_STRENGTH, TRAINING_EFFECTS.CORE_STABILITY],
    secondaryEffects: [TRAINING_EFFECTS.FLEXIBILITY],
    intensity: 3,
    calorieBurnRate: 'low',
  },
} as const;

// 相乗効果の組み合わせ定義
export const SYNERGY_COMBINATIONS = {
  cardio_strength_balance: {
    exercises: ['walking', 'squat', 'plank'],
    effect: '有酸素運動と筋トレのバランス型。脂肪燃焼と筋力向上を同時に実現',
    score: 8.5,
  },
  explosive_power: {
    exercises: ['jump_squat', 'jumping_lunge'],
    effect: 'プライオメトリック組み合わせ。爆発力と俊敏性を大幅に向上',
    score: 9.0,
  },
  upper_lower_balance: {
    exercises: ['pushup', 'squat'],
    effect: '上半身・下半身のバランス型。全身の筋力を均等に発達',
    score: 8.0,
  },
  core_stability_focus: {
    exercises: ['plank', 'deadlift', 'crunch'],
    effect: '体幹強化特化型。姿勢改善と怪我予防に最適',
    score: 8.7,
  },
  functional_movement: {
    exercises: ['deadlift', 'squat', 'pushup'],
    effect: '機能的動作パターン。日常生活の動きを強化',
    score: 9.2,
  },
} as const;

export const EXERCISE_OPTIONS = Object.values(EXERCISE_DATABASE);

export type ExerciseId = keyof typeof EXERCISE_DATABASE;
export type Exercise = (typeof EXERCISE_DATABASE)[ExerciseId];
export type TrainingEffect = (typeof TRAINING_EFFECTS)[keyof typeof TRAINING_EFFECTS];
export type MuscleGroup = (typeof MUSCLE_GROUPS)[keyof typeof MUSCLE_GROUPS];
