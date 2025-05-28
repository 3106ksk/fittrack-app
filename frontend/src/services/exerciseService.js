import { EXERCISE_OPTIONS, WORKOUT_TYPES } from '../config/exercise';

// 運動関連のビジネスロジックを分離

const getExerciseType = (exerciseName) => {
  const exercise = EXERCISE_OPTIONS.find(exercise => exercise.name === exerciseName);
  return exercise ? exercise.type : WORKOUT_TYPES.STRENGTH;
};

export { getExerciseType };