import * as yup from 'yup';

// バリデーションスキーマを分離
export const goalFormSchema = yup.object().shape({
  exercise: yup.string().required('トレーニング種目を選択してください'),
  targetAmount: yup.number()
    .required('目標回数を入力してください')
    .min(1, '1回以上入力してください'),
  metricUnit: yup.string().required('単位を選択してください'),
});

// デフォルト値も分離
export const defaultGoalFormValues = {
  exercise: '',
  targetAmount: '',
  metricUnit: '',
};