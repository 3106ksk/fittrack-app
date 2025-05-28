import { Controller } from 'react-hook-form';
import { TextField, MenuItem, Alert, Button } from '@mui/material';

import { EXERCISE_OPTIONS } from '../../config/exercise';
import useGoalForm from '../../hooks/useGoalForm';

const GoalsettingForm = () => {
  const workoutExercises = EXERCISE_OPTIONS;

  const {
    control,
    handleSubmit,
    formState: { errors },
    feedback,
    submitGoal
  } = useGoalForm();





  return (
    <>
      {feedback.visible && (
        <Alert severity={feedback.type} sx={{ mt: 2 }}>
          {feedback.message}
        </Alert>
      )}
      <form className='formContainer' onSubmit={handleSubmit(submitGoal)}>
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

        {/* 測定単位は自動で「回」に設定されるため、選択フィールドを削除 */}
        <Controller
          name='metricUnit'
          control={control}
          render={({ field }) => (
            <input {...field} type="hidden" value="reps" />
          )}
        />

        <Button type='submit' variant='contained' color='primary'>
          目標設定
        </Button>

      </form>
    </>
  )
};

export default GoalsettingForm;