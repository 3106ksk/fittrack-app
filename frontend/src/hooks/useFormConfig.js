import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXERCISE_DATABASE, WORKOUT_TYPES } from '../data/exercises';

const useFormConfig = () => {

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

  // 初期化フェーズ
  const [workoutConfig, setWorkoutConfig] = useState({
    exercises: [
      exerciseData.nameMapping.pushup || 'プッシュアップ',
      exerciseData.nameMapping.squat || 'スクワット',
      exerciseData.nameMapping.walking || 'ウォーキング',
    ],
    maxSets: 5,
  });

  // カーディオ判定用のユーティリティ関数
  const isCardioExercise = useCallback(
    exerciseName => {
      return exerciseData.cardio.includes(exerciseName);
    },
    [exerciseData.cardio]
  );

  // LocalStorageから設定を読み込み
  useEffect(() => {
    const savedConfig = localStorage.getItem('formConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // バリデーション：exercises.tsに存在する種目のみ許可
        const validExercises =
          parsed.exercises?.filter(exercise =>
            exerciseData.all.includes(exercise)
          ) || [];

        setWorkoutConfig({
          ...parsed,
          exercises:
            validExercises.length > 0
              ? validExercises
              : workoutConfig.exercises,
        });
      } catch (error) {
        console.error('フォーム設定読み込み失敗:', error);
      }
    }
  }, [exerciseData.all]);


  // 種目リスト更新
  const updateExercises = useCallback(
    exercises => {
      if (!exercises || exercises.length === 0) {
        alert('最低1つの運動は必要です');
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
        localStorage.setItem('formConfig', JSON.stringify(newConfig));
        console.log(newConfig);
        return newConfig;
      });
    },
    [exerciseData.all]
  );

  // 最大セット数を更新
  const updateMaxSets = useCallback(sets => {
    setWorkoutConfig(prevConfig => {
      const newConfig = {
        ...prevConfig,
        maxSets: sets,
      };
      localStorage.setItem('formConfig', JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);

  return {
    // 状態
    workoutConfig,
    availableExercises: exerciseData.all,

    // ユーティリティ
    isCardioExercise,

    // アクション関数
    updateExercises,
    updateMaxSets,
  };
};

export default useFormConfig;
