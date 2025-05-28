
import { useForm } from 'react-hook-form';
import { useFeedback } from './useFeedback';
import { yupResolver } from '@hookform/resolvers/yup';
import { goalFormSchema, defaultGoalFormValues } from '../schemas/goalSchema';
import { getExerciseType } from '../services/exerciseService';
import { createGoal } from '../services/goalApi';

const useGoalForm = () => {
  const { feedback, showFeedback } = useFeedback();

  const form = useForm({
    resolver: yupResolver(goalFormSchema),
    defaultValues: defaultGoalFormValues
  });


  const submitGoal = async (data) => {
    try {
      const submitData = {
        exercise: data.exercise,
        exerciseType: getExerciseType(data.exercise),
        targetAmount: parseInt(data.targetAmount, 10),
        metricUnit: data.metricUnit,
      };

      const { goal, message } = await createGoal(submitData);
      console.log(goal, message);
      showFeedback('目標設定が完了しました', 'success');
      form.reset();
    } catch (error) {
      console.error('エラー発生:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'エラーが発生しました';
      showFeedback(errorMessage, 'error');
    }
  };

  return {
    ...form,
    submitGoal,
    feedback
  }
}

export default useGoalForm