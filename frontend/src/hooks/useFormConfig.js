import { useMemo } from 'react';
import useWorkoutConfig from './useWorkoutConfig';

const useFormConfig = () => {
  const { workoutConfig } = useWorkoutConfig();
  
  return useMemo(() => ({
    exercises: workoutConfig.exercises,
    maxSets: workoutConfig.maxSets
  }), [workoutConfig.exercises, workoutConfig.maxSets]);
};

export default useFormConfig;