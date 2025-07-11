import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { MenuItem, TextField } from '@mui/material';
import axios from 'axios';
import '../styles/WorkoutForm.css';
import useFormConfig from '../hooks/useFormConfig';
import useFormValidation from '../hooks/useFormValidation';
import { generateDefaultValues } from '../utiks/formDefaults';

const WORKOUT_TYPES = {
  CARDIO: 'cardio',
  STRENGTH: 'strength',
};



const WorkoutForm = () => {
  const formConfig = useFormConfig();
  const validationSchema = useFormValidation(formConfig);
  const { isCardioExercise } = useWorkoutConfig();
  
  const [feedback, setFeedback] = useState({
    message: '',
    type: '',
    visible: false,
  });


  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: generateDefaultValues(formConfig)
  });

    useEffect(() => {
    console.log('📱 設定変更検知:', formConfig);
    // フォームのデフォルト値を更新
    const newDefaults = generateDefaultValues(formConfig);
    Object.keys(newDefaults).forEach(key => {
      setValue(key, newDefaults[key]);
    });
  }, [formConfig, setValue]);

  const showFeedback = (message, type) => {
    setFeedback({
      message,
      type,
      visible: true,
    });
  };


  // フィードバック表示時のタイマー管理
  useEffect(() => {
    if (feedback.visible) {
      const timer = setTimeout(() => {
        setFeedback(prev => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.visible]);

  const onSubmit = async (data) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const exerciseType = getExerciseType(data.exercise);

    const submitData = {
      ...data,
      exerciseType,
      ...(exerciseType === 'strength' && {
        setNumber: parseInt(data.setNumber, 10),
        repsNumber: data.repsNumber.map(rep => ({
          ...rep,
          reps: parseInt(rep.reps, 10),
        })),
      }),
      ...(exerciseType === 'cardio' && {
        distance: parseInt(data.distance, 10),
        duration: parseInt(data.duration, 10),
      }),
    };

    axios
      .post('http://localhost:8000/workouts', submitData, config)
      .then(response => {
        showFeedback(
          response.data.message || 'ワークアウトが保存されました',
          'success'
        );
        reset();
      })
      .catch(error => {
        console.error('エラー発生:', error.response?.data || error.message);
        const errorMessage =
          error.response?.data?.error || 'エラーが発生しました';
        showFeedback(errorMessage, 'error');
      });
  };

  return (
    <form className="formContainer" onSubmit={handleSubmit(onSubmit)}>
      <div className="exercise">
        <Controller
          name="exercise"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="トレーニング名"
              required
              select
              fullWidth
              error={!!errors.exercise}
              helperText={errors.exercise?.message}
            >
              {workoutExercises.map(exercise => (
                <MenuItem key={exercise.name} value={exercise.name}>
                  {exercise.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </div>

      {exerciseType === WORKOUT_TYPES.STRENGTH && (
        <>
          <div className="setNumber">
            <Controller
              name="setNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="セット数"
                  required
                  select
                  fullWidth
                  error={!!errors.setNumber}
                  helperText={errors.setNumber?.message}
                >
                  {SETS_OPTIONS.map(set => (
                    <MenuItem key={set} value={set}>
                      {set}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="repsNumber">
              <Controller
                name={`repsNumber.${index}.reps`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`セット${index + 1}の回数`}
                    required
                    select
                    fullWidth
                    error={!!errors.repsNumber}
                    helperText={errors.repsNumber?.message}
                  >
                    {REPS_OPTIONS.map(rep => (
                      <MenuItem key={rep} value={rep}>
                        {rep}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </div>
          ))}
        </>
      )}

      {exerciseType === WORKOUT_TYPES.CARDIO && (
        <>
          <div className="distance">
            <Controller
              name="distance"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="距離"
                  required
                  select
                  fullWidth
                  error={!!errors.distance}
                  helperText={errors.distance?.message}
                >
                  {DISTANCE_OPTIONS.map(distance => (
                    <MenuItem key={distance} value={distance}>
                      {distance}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </div>
          <div className="duration">
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="時間" required select fullWidth>
                  {DURATION_OPTIONS.map(duration => (
                    <MenuItem key={duration} value={duration}>
                      {duration}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </div>
        </>
      )}

      <div className="intensity">
        <Controller
          name="intensity"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="強度" required select fullWidth>
              <MenuItem value="低">楽に感じる（軽い息切れ程度）</MenuItem>
              <MenuItem value="中">
                少しきつい（会話しながらできる程度）
              </MenuItem>
              <MenuItem value="高">かなりきつい（会話が難しい程度）</MenuItem>
            </TextField>
          )}
          error={!!errors.intensity}
          helperText={errors.intensity?.message}
        />
      </div>

      <div>
        <button type="submit">送信</button>
      </div>
      {feedback.visible && (
        <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
      )}
    </form>
  );
};

export default WorkoutForm;
