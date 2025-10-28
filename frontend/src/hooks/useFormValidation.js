import { useMemo } from 'react';
import * as yup from 'yup';
import { EXERCISE_DATABASE, WORKOUT_TYPES } from '../data/exercises';

const useFormValidation = formConfig => {
  // Helper function to check if an exercise is cardio
  const isCardioExercise = exerciseName => {
    const exercise = Object.values(EXERCISE_DATABASE).find(
      ex => ex.name === exerciseName
    );
    return exercise?.type === WORKOUT_TYPES.CARDIO;
  };

  return useMemo(() => {
    const schemaFields = {};
    const emptyToNull = (value, originalvalue) =>
      originalvalue === '' ? null : value;

    formConfig.exercises.forEach(exercise => {
      if (isCardioExercise(exercise)) {
        schemaFields[`${exercise}_distance`] = yup
          .number()
          .transform(emptyToNull)
          .nullable()
          .min(0.1, '距離は0.1km以上で入力してください');
        schemaFields[`${exercise}_duration`] = yup
          .number()
          .transform(emptyToNull)
          .nullable()
          .min(1, '時間は1分以上で入力してください');
      } else {
        for (let i = 1; i <= formConfig.maxSets; i++) {
          schemaFields[`${exercise}_set${i}`] = yup
            .number()
            .transform(emptyToNull)
            .min(0, '回数は0以上で入力してください')
            .nullable();
        }
      }
    });

    schemaFields.intensity = yup.string().required('強度を選択してください');

    return yup.object().shape(schemaFields);
  }, [JSON.stringify(formConfig)]);
};

export default useFormValidation;
