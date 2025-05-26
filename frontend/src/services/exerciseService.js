import { EXERCISE_OPTIONS, WORKOUT_TYPES } from '../config/exercise';

// 運動関連のビジネスロジックを分離
class ExerciseService {
  getExerciseType(exerciseName) {
    const exercise = EXERCISE_OPTIONS.find(ex => ex.name === exerciseName);
    return exercise ? exercise.type : WORKOUT_TYPES.STRENGTH;
  }
}

export const exerciseService = new ExerciseService();