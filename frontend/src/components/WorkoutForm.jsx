import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { MenuItem, TextField } from '@mui/material';
import axios from 'axios';
import * as yup from 'yup';
import '../styles/WorkoutForm.css';

const WORKOUT_TYPES = {
  CARDIO: 'cardio',
  STRENGTH: 'strength',
};

const workoutExercises = [
  {
    name: 'ウォーキング',
    type: WORKOUT_TYPES.CARDIO,
    description:
      '全身運動。心肺機能を高め、脚部の筋肉と体幹を軽く鍛える有酸素運動。20-30分、週3-5回行うのが効果的。メリット：基礎代謝アップ、ストレス軽減、生活習慣病予防、睡眠の質向上、長時間の運動耐性向上',
    beginner: true,
  },
  {
    name: 'ジョギング',
    type: WORKOUT_TYPES.CARDIO,
    description:
      '全身運動。心肺機能を向上させ、下半身の筋肉を強化する有酸素運動。15-20分、週2-3回から始めるのが適切。メリット：脂肪燃焼効果が高い、心肺機能の大幅な向上、持久力アップ、メンタルヘルス改善、骨密度増加',
    beginner: true,
  },
  {
    name: 'スクワット',
    type: WORKOUT_TYPES.STRENGTH,
    description:
      '下半身トレーニング。太もも前部、お尻、体幹を鍛える基本的な自重運動。初めは自重から始め、フォームを重視する。メリット：基礎代謝向上、日常動作の安定性向上、姿勢改善、下半身のバランス強化、ホルモン分泌促進',
    beginner: true,
  },
  {
    name: 'プッシュアップ',
    type: WORKOUT_TYPES.STRENGTH,
    description:
      '上半身トレーニング。胸筋、三頭筋、肩を鍛える基本的な自重トレーニング。初心者は膝をついた状態から始めても良い。メリット：上半身の筋力バランス向上、姿勢改善、腕の引き締め効果、体幹強化、どこでも手軽にできる',
    beginner: true,
  },
  {
    name: 'ベンチプレス',
    type: WORKOUT_TYPES.STRENGTH,
    description:
      '上半身トレーニング。胸筋、三頭筋、肩を鍛える基本的なウェイトトレーニング。初めは軽いバーから始めてフォームを習得する。メリット：上半身の筋肉量増加、押す動作の強化、胸部の発達による姿勢改善、上半身の見た目の向上',
    beginner: true,
  },
  {
    name: '懸垂（チンニング）',
    type: WORKOUT_TYPES.STRENGTH,
    description:
      '上半身トレーニング。広背筋、僧帽筋、上腕二頭筋を中心に鍛える複合運動。自重を使った引く動作のトレーニングで、初心者は補助器具から始めるのがおすすめ。メリット：背中の筋肉の発達、腕力の向上、姿勢改善、グリップ力の強化、体幹の安定性向上',
    beginner: false,
  },
  {
    name: 'デッドリフト',
    type: WORKOUT_TYPES.STRENGTH,
    description:
      '全身トレーニング。背中、お尻、ハムストリングスなど多くの筋群を同時に鍛える複合運動。フォームを重視し、軽い重量から始める。メリット：全身の筋力バランス向上、背筋強化による姿勢改善、基礎代謝の大幅アップ、日常生活での腰痛リスク軽減',
    beginner: true,
  },
  {
    name: 'クランチ',
    type: WORKOUT_TYPES.STRENGTH,
    description:
      '腹筋運動。主に腹直筋上部を鍛える自重トレーニング。背中への負担が少なく初心者に適している。メリット：体幹安定性の向上、腹部の引き締め効果、姿勢改善、腰痛予防、見た目の変化が実感しやすい',
    beginner: true,
  },
  {
    name: 'レッグレイズ',
    type: WORKOUT_TYPES.STRENGTH,
    description:
      '腹筋運動。下腹部と腸腰筋を重点的に鍛える自重トレーニング。仰向けに寝た状態から脚を持ち上げる動作で行う。メリット：下腹部の引き締め、体幹強化、姿勢改善、腰痛予防、骨盤の安定性向上',
    beginner: true,
  },
];

const SETS_OPTIONS = [1, 2, 3, 4, 5];
const REPS_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50];
const DISTANCE_OPTIONS = Array.from({ length: 10 }, (_, i) => i * 0.5);
const DURATION_OPTIONS = Array.from({ length: 13 }, (_, i) => i * 5);

const schema = yup.object().shape({
  exercise: yup.string().required('種目を入力してください'),
  intensity: yup.string().required('強度を選択してください'),
  setNumber: yup.number().when('exercise', {
    is: exercise => getExerciseType(exercise) === WORKOUT_TYPES.STRENGTH,
    then: yup.number().required('セット数を選択してください'),
  }),
  repsNumber: yup.array().when('exercise', {
    is: exercise => getExerciseType(exercise) === WORKOUT_TYPES.STRENGTH,
    then: yup.array().of(
      yup.object().shape({
        reps: yup.number().required('回数を選択してください'),
      })
    ),
  }),
  duration: yup.number().when('exercise', {
    is: exercise => getExerciseType(exercise) === WORKOUT_TYPES.CARDIO,
    then: yup.number().required('時間を選択してください'),
  }),
  distance: yup.number().when('exercise', {
    is: exercise => getExerciseType(exercise) === WORKOUT_TYPES.CARDIO,
    then: yup.number().required('距離を選択してください'),
  }),
});

const getExerciseType = exerciseName => {
  const selectedExercise = workoutExercises.find(
    exercise => exercise.name === exerciseName
  );
  return selectedExercise ? selectedExercise.type : 'null';
};

const WorkoutForm = () => {
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
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      exercise: '',
      setNumber: 3,
      repsNumber: [
        { id: '1', reps: '' },
        { id: '2', reps: '' },
        { id: '3', reps: '' },
      ],
      duration: '',
      intensity: '',
    },
  });

  const showFeedback = (message, type) => {
    setFeedback({
      message,
      type,
      visible: true,
    });
  };

  const selectedExerciseName = watch('exercise');

  const exerciseType = getExerciseType(selectedExerciseName);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'repsNumber',
  });
  const setNumber = watch('setNumber');

  // セット数変更時のフィールド管理
  useEffect(() => {
    if (exerciseType === WORKOUT_TYPES.STRENGTH && setNumber) {
      const currentLength = fields.length;

      if (currentLength < setNumber) {
        for (let i = currentLength; i < setNumber; i++) {
          append({ id: String(i + 1), reps: '' });
        }
      } else if (currentLength > setNumber) {
        for (let i = currentLength - 1; i >= setNumber; i--) {
          remove(i);
        }
      }
    }
  }, [exerciseType, setNumber, fields, append, remove]);

  // フィードバック表示時のタイマー管理
  useEffect(() => {
    if (feedback.visible) {
      const timer = setTimeout(() => {
        setFeedback(prev => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.visible]);

  const onSubmit = data => {
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
