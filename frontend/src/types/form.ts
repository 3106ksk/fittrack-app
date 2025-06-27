export interface GoalFormData {
  exercise: string;
  targetAmount: number;
  [key: string]: any;
}

export interface GoalCreateData {
  exercise: string;
  exerciseType: 'strength' | 'cardio';
  targetAmount: number;
  metricUnit: 'reps'
}

// 後方互換性のためのエイリアス
export type GoalSubmitData = GoalCreateData;