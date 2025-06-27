import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { defaultGoalFormValues, goalFormSchema } from '../schemas/goalSchema';
import { handleApiError } from '../services/errorHandler';
import { getExerciseType } from '../services/exerciseService';
import { goalAPI } from '../services/goalApi';
import { SimpleAppError } from '../types/error';
import type { GoalFormData, GoalSubmitData } from '../types/form';
import { useFeedback } from './useFeedback';



const useGoalForm = () => {
  const form = useForm<GoalFormData>({
    resolver: yupResolver(goalFormSchema) as any,
    defaultValues: defaultGoalFormValues
  });

  const { feedback, showFeedback } = useFeedback();

  const submitGoal = async (data: GoalFormData): Promise<void> => {
    try {
      const submitData: GoalSubmitData = {
        exercise: data.exercise,
        exerciseType: getExerciseType(data.exercise) as 'strength' | 'cardio',
        targetAmount: data.targetAmount,
        metricUnit: 'reps',
      };
      const result = await goalAPI.createGoal(submitData);
      showFeedback(result.message || '目標設定が完了しました', 'success');
      form.reset();
    } catch (error: unknown) {
      console.log('❌ エラーキャッチ:', error);
      try {
        handleApiError(error);
      } catch (processedError: unknown) {
        if (processedError instanceof SimpleAppError) {
        console.log('⚡ 処理後エラー:', processedError);
        console.log('📝 エラータイプ:', processedError.type);
        console.log('💬 ユーザーメッセージ:', processedError.message);
        showFeedback(processedError.message, 'error');
        }
      }
    }
  };

  return {
    ...form,
    submitGoal,
    feedback
  };
};

export default useGoalForm;