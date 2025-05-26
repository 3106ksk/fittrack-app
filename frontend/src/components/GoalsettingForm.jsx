import { Controller, useForm } from 'react-hook-form'
import { TextField, MenuItem, } from '@mui/material'

const GoalsettingForm = () => {
  const workoutExercises = [
    { name: 'ウォーキング', type: 'cardio' },
    { name: 'ジョギング', type: 'cardio' },
    { name: 'スクワット', type: 'strength' },
    { name: 'プッシュアップ', type: 'strength' },
    { name: 'ベンチプレス', type: 'strength' },
    { name: '懸垂（チンニング）', type: 'strength' },
    { name: 'デッドリフト', type: 'strength' },
    { name: 'クランチ', type: 'strength' },
    { name: 'レッグレイズ', type: 'strength' }
  ];
  const { control, handleSubmit } = useForm({
    defaultValues: {
      exercises: '',
      target: '',
      metricUnit: '回数'
    }
  })

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form className='formContainer' onSubmit={handleSubmit(onSubmit)}>
      <div className='exerciseName'>
        <Controller
          name='exercises'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='トレーニング種目'
              select
              fullWidth
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
          name='target'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='目標回数'
              type='number'
              fullWidth
            />
          )}
        />
      </div>
    </form>
  )
}

export default GoalsettingForm