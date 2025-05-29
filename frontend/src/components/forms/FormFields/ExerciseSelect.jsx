import { MenuItem, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { EXERCISE_OPTIONS } from '../../../config/exercise';

const ExerciseSelect = ({ 
  control,
  errors,
  exercises = EXERCISE_OPTIONS,
  label = 'トレーニング種目',
  name = 'exercise'
}) => {
  // エラーハンドリング: exercisesが無効な場合
  if (!Array.isArray(exercises) || exercises.length === 0) {
    console.warn('ExerciseSelect: 無効なexercisesデータが渡されました');
    return null;
  }

  return (
    <div className='exercise'>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            select
            fullWidth
            error={!!errors[name]}
            helperText={errors[name]?.message}
          >
            {exercises.map((exercise) => (
              <MenuItem key={exercise.name} value={exercise.name}>
                {exercise.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </div>
  );
};

export default ExerciseSelect;