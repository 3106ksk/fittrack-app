import { Controller, useForm } from 'react-hook-form';
import { TextField, MenuItem, Alert, Button } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';

import { goalFormSchema, defaultGoalFormValues } from '../../schemas/goalSchema';
import { goalApi } from '../../services/goalApi';
import { exerciseService } from '../../services/exerciseService';
import { EXERCISE_OPTIONS, METRIC_UNITS } from '../../config/exercise';

const GoalsettingForm = () => {

  const workoutExercises = EXERCISE_OPTIONS;
  const metricUnits = METRIC_UNITS;

  const [feedback, setFeedback] = useState({
    message: '',
    type: '',
    visible: false,
  });

  const showFeedback = (message, type) => {
    setFeedback({ message, type, visible: true });
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(goalFormSchema),
    defaultValues: defaultGoalFormValues,
  });



  const onSubmit = async (data) => {
    try {
      const submitData = {
        exercise: data.exercise,
        exerciseType: exerciseService.getExerciseType(data.exercise),
        targetAmount: parseInt(data.targetAmount, 10),
        metricUnit: data.metricUnit,
      };

      await goalApi.createGoal(submitData);
      showFeedback('目標設定が完了しました', 'success');
      reset();
    } catch (error) {
      console.error('エラー発生:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'エラーが発生しました';
      showFeedback(errorMessage, 'error');
    }
  };

  return (
    <>
      {feedback.visible && (
        <Alert severity={feedback.type} sx={{ mt: 2 }}>
          {feedback.message}
        </Alert>
      )}
      <form className='formContainer' onSubmit={handleSubmit(onSubmit)}>
        <div className='exercise'>
          <Controller
            name='exercise'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='トレーニング種目'
                select
                fullWidth
                error={!!errors.exercise}
                helperText={errors.exercise?.message}
              >
                {workoutExercises.map((exercise) => (
                  <MenuItem key={exercise.name} value={exercise.name}>
                    {exercise.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </div>

        <div className='targetAmount'>
          <Controller
            name='targetAmount'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='目標回数'
                type='number'
                fullWidth
                error={!!errors.targetAmount}
                helperText={errors.targetAmount?.message}
              />
            )}
          />
        </div>

        <div className='metricUnit'>
          <Controller
            name='metricUnit'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='測定単位'
                select
                fullWidth
                error={!!errors.metricUnit}
                helperText={errors.metricUnit?.message}
              >
                {metricUnits.map((unit) => (
                  <MenuItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </div>
        <Button type='submit' variant='contained' color='primary'>
          目標設定
        </Button>

      </form>
    </>
  )
};

export default GoalsettingForm;