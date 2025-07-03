import { useCallback, useMemo, useState } from 'react';
import { EXERCISE_DATABASE, WORKOUT_TYPES } from '../data/exercises';

const useWorkoutConfig = () => {
  // 🎯 1. exercises.tsから種目データを活用
  const exerciseData = useMemo(() => {
    const cardio = [];
    const strength = [];
    const nameMapping = {};
    
    // EXERCISE_DATABASEから種目を分類
    Object.values(EXERCISE_DATABASE).forEach(exercise => {
      nameMapping[exercise.id] = exercise.name;
      
      if (exercise.type === WORKOUT_TYPES.CARDIO) {
        cardio.push(exercise.name);
      } else if (exercise.type === WORKOUT_TYPES.STRENGTH) {
        strength.push(exercise.name);
      }
    });
    
    return {
      cardio,
      strength,
      all: [...cardio, ...strength],
      nameMapping,
      database: EXERCISE_DATABASE
    };
  }, []);

    const [workoutConfig, setWorkoutConfig] = useState({
    exercises: [
      exerciseData.nameMapping.pushup || 'プッシュアップ',
      exerciseData.nameMapping.squat || 'スクワット', 
      exerciseData.nameMapping.walking || 'ウォーキング'
    ],
    maxSets: 3,
    displayColumns: ['totalReps', 'totalTime']
  });

   const isCardioExercise = useCallback((exerciseName) => {
    return exerciseData.cardio.includes(exerciseName);
  }, [exerciseData.cardio]);

  const isStrengthExercise = useCallback((exerciseName) => {
    return exerciseData.strength.includes(exerciseName);
  }, [exerciseData.strength]);

  const getExerciseInfo = useCallback((exerciseName) => {
    return Object.values(EXERCISE_DATABASE).find(
      exercise => exercise.name === exerciseName
    );
  }, []);

  const presets = useMemo(() => ({
    strength_basic: {
      name: '筋トレ基本',
      exercises: [
        exerciseData.nameMapping.pushup,
        exerciseData.nameMapping.squat,
        exerciseData.nameMapping.crunch
      ].filter(Boolean), // undefined除外
      maxSets: 3
    },
    cardio_basic: {
      name: 'カーディオ基本', 
      exercises: [
        exerciseData.nameMapping.walking,
        exerciseData.nameMapping.jogging
      ].filter(Boolean),
      maxSets: 1
    },
    mixed_beginner: {
      name: '初心者ミックス',
      exercises: [
        exerciseData.nameMapping.walking,
        exerciseData.nameMapping.pushup,
        exerciseData.nameMapping.squat
      ].filter(Boolean),
      maxSets: 2
    },
    advanced_strength: {
      name: '上級筋トレ',
      exercises: [
        exerciseData.nameMapping.deadlift,
        exerciseData.nameMapping.pullup,
        exerciseData.nameMapping.benchpress
      ].filter(Boolean),
      maxSets: 3
    }
  }), [exerciseData.nameMapping]);

  

  return {
    workoutConfig,
    isCardioExercise,
    isStrengthExercise,
    getExerciseInfo,
    presets,
    setWorkoutConfig
  };
};

export default useWorkoutConfig;