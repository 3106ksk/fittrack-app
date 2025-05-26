import { Controller, useForm } from 'react-hook-form';
import { TextField, MenuItem, Alert } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useState } from 'react';


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

  const schema = yup.object().shape({
    exercise: yup.string().required('トレーニング種目を選択してください'),
    targetAmount: yup.number()
      .required('目標回数を入力してください')
      .min(1, '1回以上入力してください'),
    metricUnit: yup.string().required('単位を選択してください'),
  });

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
    resolver: yupResolver(schema),
    defaultValues: {
      exercise: '',
      targetAmount: '',
      metricUnit: '',
    }
  })

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const selectedExercise = workoutExercises.find(exercise =>
        exercise.name === data.exercise
      );

      const submitData = {
        exercise: data.exercise,
        exerciseType: selectedExercise?.type || 'strength',
        targetAmount: parseInt(data.targetAmount, 10),
        metricUnit: data.metricUnit,
      };

      const response = await axios.post("http://localhost:8000/goals", submitData, config);
      console.log(response.data);

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
                <MenuItem value="reps">回</MenuItem>
                <MenuItem value="distance">km</MenuItem>
                <MenuItem value="duration">分</MenuItem>
              </TextField>
            )}
          />
        </div>

        <div>
          <button type='submit'>送信</button>
        </div>

      </form>
    </>
  )
};

export default GoalsettingForm;