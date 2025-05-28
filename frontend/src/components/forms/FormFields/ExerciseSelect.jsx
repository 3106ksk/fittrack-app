import { Controller } from 'react-hook-form';
import { TextField, MenuItem } from '@mui/material';
import { EXERCISE_OPTIONS } from '../../../config/exercise';

const ExerciseSelect = ({ control, errors }) => {
  return (
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
            {EXERCISE_OPTIONS.map((exercise) => (
              <MenuItem key={exercise.name} value={exercise.name}>
                {exercise.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </div>
  )
}

export default ExerciseSelect;