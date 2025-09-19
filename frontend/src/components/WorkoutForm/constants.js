/**
 * WorkoutForm用の定数定義
 * UIで使用する選択肢や設定値を一元管理
 */

// 距離オプション（0.0km〜5.0km、0.1km刻み）
export const DISTANCE_OPTIONS = Array.from({ length: 50 }, (_, i) =>
  ((i + 1) * 0.1).toFixed(1)
);

// 時間オプション（1分〜60分、1分刻み）
export const DURATION_OPTIONS = Array.from({ length: 60 }, (_, i) => i + 1);

// レップ数オプション（1〜40まで選択可能）
export const REPS_OPTIONS = Array.from({ length: 40 }, (_, i) => i + 1);

// 運動強度レベル
export const INTENSITY_LEVELS = [
  {
    value: '低',
    label: '楽に感じる（軽い息切れ程度）',
    description: '会話しながら余裕で運動できるレベル',
  },
  {
    value: '中',
    label: '少しきつい（会話しながらできる程度）',
    description: '適度な負荷で持続可能なレベル',
  },
  {
    value: '高',
    label: 'かなりきつい（会話が難しい程度）',
    description: '高負荷で長時間は困難なレベル',
  },
];

// フィードバック表示時間（ミリ秒）
export const FEEDBACK_DISPLAY_DURATION = 3000;

// デフォルトの最大セット数
export const DEFAULT_MAX_SETS = 5;
