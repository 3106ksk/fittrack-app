export const WORKOUT_TYPES = {
  CARDIO: 'cardio',
  STRENGTH: 'strength'
};

export const METRIC_UNITS = {
  REPS: 'reps',
  DISTANCE: 'distance',
  DURATION: 'duration'
};

export const GOAL_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

export const createGoalData = (exercise, exerciseType, targetAmount, metricUnit) => ({
  exercise,
  exerciseType,
  targetAmount: parseInt(targetAmount, 10),
  metricUnit,
  progressAmount: 0,
  status: GOAL_STATUS.IN_PROGRESS
});