import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { defaultGoalFormValues, goalFormSchema } from '../schemas/goalSchema';
import { handleApiError } from '../services/errorHandler';
import { getExerciseType } from '../services/exerciseService';
import { goalAPI } from '../services/goalApi';
import { useFeedback } from './useFeedback';

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
        metricUnit: 'reps',
      };

      console.log('🚀 目標作成開始:', submitData);
      const result = await goalAPI.createGoal(submitData);
      console.log('✅ 目標作成成功:', result);
      showFeedback(result.message || '目標設定が完了しました', 'success');
      form.reset();
    } catch (error) {
      console.log('❌ エラーキャッチ:', error);
      try {
        handleApiError(error);
      } catch (processedError) {
        console.log('⚡ 処理後エラー:', processedError);
        console.log('📝 エラータイプ:', processedError.type);
        console.log('💬 ユーザーメッセージ:', processedError.message);
        showFeedback(processedError.message, 'error');
      }
    }
  };

  return {
    ...form,
    submitGoal,
    feedback
  }
}

export default useGoalForm