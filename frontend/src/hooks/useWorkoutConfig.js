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

    useEffect(() => {
    const savedConfig = localStorage.getItem('workoutConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // バリデーション：exercises.tsに存在する種目のみ許可
        const validExercises = parsed.exercises?.filter(exercise => 
          exerciseData.all.includes(exercise)
        ) || [];
        
        setWorkoutConfig({
          ...parsed,
          exercises: validExercises.length > 0 ? validExercises : workoutConfig.exercises
        });
        console.log('📖 設定読み込み・バリデーション完了:', parsed);
      } catch (error) {
        console.error('❌ 設定読み込み失敗:', error);
      }
    }
  }, [exerciseData.all]);

    const saveConfig = useCallback((newConfig) => {
    setWorkoutConfig(newConfig);
    localStorage.setItem('workoutConfig', JSON.stringify(newConfig));
    console.log('💾 設定保存完了:', newConfig);
  }, []);

    const addExercise = useCallback((exercise) => {
   if (!exerciseData.all.includes(exercise)) {
    console.error('❌ 未定義の種目:', exercise);
    console.log('利用可能な種目:', exerciseData.all);
    alert(`「${exercise}」は利用できません`);
    return;
  }
    
    if (workoutConfig.exercises.length >= 3) {
      alert('種目は最大3つまでです');
      return;
    }
    
    if (workoutConfig.exercises.includes(exercise)) {
      alert('すでに選択済みの種目です');
      return;
    }

    const newConfig = {
      ...workoutConfig,
      exercises: [...workoutConfig.exercises, exercise]
    };
    saveConfig(newConfig);
  }, [workoutConfig, saveConfig, exerciseData.all]);

  const removeExercise = useCallback((exercise) => {
  if (workoutConfig.exercises.length <= 1) {
    alert('最低1つの運動は必要です');
    return;
  }
  const newConfig = {
    ...workoutConfig,
    exercises: workoutConfig.exercises.filter(ex => ex !== exercise)
  };
  saveConfig(newConfig);
}, [workoutConfig, saveConfig]);

const applyPreset = useCallback((presetKey) => {
    const preset = presets[presetKey];

     if (!preset) {
    console.error('❌ 存在しないプリセット:', presetKey);
    console.log('利用可能なプリセット:', Object.keys(presets));
    return;
  }
  
  if (!preset.exercises || !Array.isArray(preset.exercises)) {
    console.error('❌ プリセットの運動リストが無効:', preset);
    return;
  }

    const newConfig = {
      ...workoutConfig,
      exercises: preset.exercises,
      maxSets: preset.maxSets
    };
    saveConfig(newConfig);
  }, [workoutConfig, saveConfig, presets]);

    const updateMaxSets = useCallback((sets) => {
    const newConfig = {
      ...workoutConfig,
      maxSets: sets
    };
    saveConfig(newConfig);
  }, [workoutConfig, saveConfig]);
  

  return {
    // 状態
    workoutConfig,
    availableExercises: exerciseData.all,
    cardioExercises: exerciseData.cardio,
    strengthExercises: exerciseData.strength,
    presets,
    // ユーティリティ
    isCardioExercise,
    isStrengthExercise,
    getExerciseInfo, 

    // アクション関数
    saveConfig,
    addExercise,
    removeExercise,
    applyPreset,
    updateMaxSets


  };
};

export default useWorkoutConfig;