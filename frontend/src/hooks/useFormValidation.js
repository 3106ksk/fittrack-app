import { useMemo } from 'react';
import * as yup from 'yup';
import useWorkoutConfig from './useWorkoutConfig';

const useFormValidation = formConfig => {
  const { isCardioExercise } = useWorkoutConfig();

  return useMemo(() => {
    const schemaFields = {};

    formConfig.exercises.forEach(exercise => {
      if (isCardioExercise(exercise)) {
        schemaFields[`${exercise}_distance`] = yup
          .number()
          .nullable()
          .min(0.1, '距離は0.1km以上で入力してください');
        schemaFields[`${exercise}_duration`] = yup
          .number()
          .nullable()
          .min(1, '時間は1分以上で入力してください');
      } else {
        for (let i = 1; i <= formConfig.maxSets; i++) {
          schemaFields[`${exercise}_set${i}`] = yup
            .number()
            .min(0, '回数は0以上で入力してください')
            .nullable();
        }
      }
    });

    schemaFields.intensity = yup.string().required('強度を選択してください');

    return yup.object().shape(schemaFields);
  }, [JSON.stringify(formConfig), isCardioExercise]);
};

export default useFormValidation;
