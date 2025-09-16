import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXERCISE_DATABASE, WORKOUT_TYPES } from '../data/exercises';

const useFormWorkoutConfig = () => {
  // 既存のuseWorkoutConfigと同じ構造でexerciseDataを作成
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

  // フォーム専用の設定（formConfigキーを使用）
  const [workoutConfig, setWorkoutConfig] = useState({
    exercises: [
      exerciseData.nameMapping.pushup || 'プッシュアップ',
      exerciseData.nameMapping.squat || 'スクワット',
      exerciseData.nameMapping.walking || 'ウォーキング',
    ],
    maxSets: 3,
  });

  // カーディオ判定用のユーティリティ関数
  const isCardioExercise = useCallback(
    exerciseName => {
      return exerciseData.cardio.includes(exerciseName);
    },
    [exerciseData.cardio]
  );

  // LocalStorageから設定を読み込み（formConfigキーを使用）
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

  // 設定を保存
  const saveConfig = useCallback(newConfig => {
    setWorkoutConfig(newConfig);
    localStorage.setItem('formConfig', JSON.stringify(newConfig));
  }, []);

  // 種目リストを更新（まとめて更新用）
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

      const newConfig = {
        ...workoutConfig,
        exercises: validExercises,
      };
      saveConfig(newConfig);
    },
    [workoutConfig, saveConfig, exerciseData.all]
  );

  // 最大セット数を更新
  const updateMaxSets = useCallback(
    sets => {
      const newConfig = {
        ...workoutConfig,
        maxSets: sets,
      };
      saveConfig(newConfig);
    },
    [workoutConfig, saveConfig]
  );

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

export default useFormWorkoutConfig;