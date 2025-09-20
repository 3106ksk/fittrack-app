import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXERCISE_DATABASE, WORKOUT_TYPES } from '../data/exercises';

const useWorkoutConfig = () => {
  const exerciseData = useMemo(() => {
    const cardio = [];
    const strength = [];
    const nameMapping = {};

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
      database: EXERCISE_DATABASE,
    };
  }, []);

  // 初期状態（種目数を5個以内に制限）
  const [workoutConfig, setWorkoutConfig] = useState({
    exercises: [
      exerciseData.nameMapping.pushup || 'プッシュアップ',
      exerciseData.nameMapping.squat || 'スクワット',
      exerciseData.nameMapping.walking || 'ウォーキング',
    ],
    maxSets: 3,
  });

  const isCardioExercise = useCallback(
    exerciseName => {
      return exerciseData.cardio.includes(exerciseName);
    },
    [exerciseData.cardio]
  );

  const isStrengthExercise = useCallback(
    exerciseName => {
      return exerciseData.strength.includes(exerciseName);
    },
    [exerciseData.strength]
  );

  // LocalStorageから読込
  useEffect(() => {
    const savedConfig = localStorage.getItem('workoutConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);

        // バリデーション
        const validExercises =
          parsed.exercises?.filter(exercise =>
            exerciseData.all.includes(exercise)
          ) || [];

        setWorkoutConfig({
          exercises:
            validExercises.length > 0
              ? validExercises.slice(0, 5) // 最大5個に制限
              : workoutConfig.exercises,
          maxSets: parsed.maxSets || 3,
        });
      } catch (error) {
        console.error('設定読み込み失敗:', error);
      }
    }
  }, [exerciseData.all]);


  const updateExercises = useCallback(exercises => {
    if (!exercises || exercises.length === 0) {
      alert('最低1つの運動は必要です');
      return;
    }

    if (exercises.length > 5) {
      alert('種目は最大5つまでです');
      return;
    }

    const validExercises = exercises.filter(exercise =>
      exerciseData.all.includes(exercise)
    );

    if (validExercises.length === 0) {
      alert('有効な種目を選択してください');
      return;
    }

    setWorkoutConfig(prevConfig => {
      const newConfig = {
        ...prevConfig,
        exercises: validExercises,
      };
      localStorage.setItem('workoutConfig', JSON.stringify(newConfig));
      return newConfig;
    });
  }, []); // 空の依存配列（クロージャー問題回避）

  // 最大セット数更新 - 関数型アップデートでクロージャー問題回避
  const updateMaxSets = useCallback(sets => {
    setWorkoutConfig(prevConfig => {
      const newConfig = {
        ...prevConfig,
        maxSets: sets,
      };
      localStorage.setItem('workoutConfig', JSON.stringify(newConfig));
      return newConfig;
    });
  }, []); // 空の依存配列（クロージャー問題回避）

  return {
    // 状態
    workoutConfig,
    availableExercises: exerciseData.all,

    // ユーティリティ
    isCardioExercise,
    isStrengthExercise,

    // アクション関数（FormConfig同一パターン）
    updateExercises,
    updateMaxSets,
  };
};

export default useWorkoutConfig;
