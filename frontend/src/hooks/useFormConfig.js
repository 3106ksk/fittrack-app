import { useMemo } from 'react';
// フォーム専用の設定を使用するように変更
import useFormWorkoutConfig from './useFormWorkoutConfig';

const useFormConfig = () => {
  const { workoutConfig } = useFormWorkoutConfig();

  return useMemo(() => ({
    exercises: workoutConfig.exercises,
    maxSets: workoutConfig.maxSets
  }), [workoutConfig.exercises, workoutConfig.maxSets]);
};

export default useFormConfig;