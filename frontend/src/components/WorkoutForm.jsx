import { yupResolver } from '@hookform/resolvers/yup';
import { Settings as SettingsIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import useFormValidation from '../hooks/useFormValidation';
import useFormConfig from '../hooks/useFormConfig';
import apiClient from '../services/api';
import { generateDefaultValues } from '../utils/formDefaults';
import FormConfigDrawer from './FormConfigDrawer';
import {
  DISTANCE_OPTIONS,
  DURATION_OPTIONS,
  REPS_OPTIONS,
  FEEDBACK_DISPLAY_DURATION
} from './WorkoutForm/constants';

const WorkoutForm = () => {
  // フォーム専用の設定フックを使用（統一化）
  const {
    workoutConfig,
    availableExercises,
    isCardioExercise,
    updateExercises,
    updateMaxSets,
  } = useFormConfig();

  // バリデーションにもworkoutConfigを使用
  const validationSchema = useFormValidation(workoutConfig);

  // 設定ドロワーの開閉状態
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    defaultValues: generateDefaultValues(workoutConfig),
  });

  useEffect(() => {
    // フォームのデフォルト値を更新
    const newDefaults = generateDefaultValues(workoutConfig);
    Object.keys(newDefaults).forEach(key => {
      setValue(key, newDefaults[key]);
    });
  }, [workoutConfig, setValue]);

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
      }, FEEDBACK_DISPLAY_DURATION);
      return () => clearTimeout(timer);
    }
  }, [feedback.visible]);

  // フォーム送信処理
  const onSubmit = async data => {
    try {
      for (const exercise of workoutConfig.exercises) {
        if (isCardioExercise(exercise)) {
          const distance = data[`${exercise}_distance`];
          const duration = data[`${exercise}_duration`];

          if (distance && duration) {
            const submitData = {
              exercise,
              exerciseType: 'cardio',
              distance: parseFloat(distance),
              duration: parseInt(duration, 10) * 60,
              intensity: data.intensity,
            };

            await apiClient.post('/workouts', submitData);
          }
        } else {
          const repsData = [];
          for (let i = 1; i <= workoutConfig.maxSets; i++) {
            const reps = data[`${exercise}_set${i}`];
            if (reps && reps > 0) {
              repsData.push({ id: String(i), reps: parseInt(reps, 10) });
            }
          }

          if (repsData.length > 0) {
            const submitData = {
              exercise,
              exerciseType: 'strength',
              setNumber: repsData.length,
              repsNumber: repsData,
              intensity: data.intensity,
            };

            await apiClient.post('/workouts', submitData);
          }
        }
      }

      showFeedback('ワークアウトが保存されました', 'success');
      reset(generateDefaultValues(workoutConfig));
    } catch (error) {
      // エラーのログはデバッグ時のみ必要（本番環境では削除）
      // console.error('エラー発生:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.error || 'エラーが発生しました';
      showFeedback(errorMessage, 'error');
    }
  };
  // 定数はconstants.jsから取得

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h4" component="h1">
              ワークアウト記録
            </Typography>
          </Box>

          {/* 現在の設定表示 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              設定中の種目:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {workoutConfig.exercises.map(exercise => (
                <Chip
                  key={exercise}
                  label={exercise}
                  color={isCardioExercise(exercise) ? 'primary' : 'secondary'}
                  variant="outlined"
                />
              ))}
            </Box>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              color="primary"
              sx={{ ml: 2 }}
              title="表示種目を設定"
            >
              <SettingsIcon />
              入力フォーム変更
            </IconButton>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block' }}
            >
              設定アイコンから表示種目を変更できます
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* 各種目の入力フィールド */}
              {workoutConfig.exercises.map(exercise => (
                <Grid item xs={12} key={exercise}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {exercise}
                        <Chip
                          label={
                            isCardioExercise(exercise) ? 'カーディオ' : '筋トレ'
                          }
                          size="small"
                          color={
                            isCardioExercise(exercise) ? 'primary' : 'secondary'
                          }
                          sx={{ ml: 1 }}
                        />
                      </Typography>

                      {isCardioExercise(exercise) ? (
                        // カーディオ用フィールド
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Controller
                              name={`${exercise}_distance`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="距離 (km)"
                                  select
                                  fullWidth
                                  error={!!errors[`${exercise}_distance`]}
                                  helperText={
                                    errors[`${exercise}_distance`]?.message
                                  }
                                >
                                  {DISTANCE_OPTIONS.map(distance => (
                                    <MenuItem key={distance} value={distance}>
                                      {distance} km
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Controller
                              name={`${exercise}_duration`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="時間 (分)"
                                  select
                                  fullWidth
                                  error={!!errors[`${exercise}_duration`]}
                                  helperText={
                                    errors[`${exercise}_duration`]?.message
                                  }
                                >
                                  {DURATION_OPTIONS.map(duration => (
                                    <MenuItem key={duration} value={duration}>
                                      {duration} 分
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                            />
                          </Grid>
                        </Grid>
                      ) : (
                        // 筋トレ用フィールド
                        <Grid container spacing={2}>
                          {Array.from(
                            { length: workoutConfig.maxSets },
                            (_, i) => (
                              <Grid item xs={12 / workoutConfig.maxSets} key={i}>
                                <Controller
                                  name={`${exercise}_set${i + 1}`}
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      label={`${i + 1}セット目`}
                                      select
                                      fullWidth
                                      error={
                                        !!errors[`${exercise}_set${i + 1}`]
                                      }
                                      helperText={
                                        errors[`${exercise}_set${i + 1}`]
                                          ?.message
                                      }
                                    >
                                      <MenuItem value="">なし</MenuItem>
                                      {REPS_OPTIONS.map(reps => (
                                        <MenuItem key={reps} value={reps}>
                                          {reps} 回
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  )}
                                />
                              </Grid>
                            )
                          )}
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* 強度選択 */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Controller
                  name="intensity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="全体的な強度"
                      select
                      fullWidth
                      error={!!errors.intensity}
                      helperText={errors.intensity?.message}
                    >
                      <MenuItem value="低">
                        楽に感じる（軽い息切れ程度）
                      </MenuItem>
                      <MenuItem value="中">
                        少しきつい（会話しながらできる程度）
                      </MenuItem>
                      <MenuItem value="高">
                        かなりきつい（会話が難しい程度）
                      </MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              {/* 送信ボタン */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mt: 2 }}
                >
                  ワークアウトを保存
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* フィードバック表示 */}
          {feedback.visible && (
            <Alert
              severity={feedback.type === 'success' ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {feedback.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 設定ドロワー */}
      <FormConfigDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        workoutConfig={workoutConfig}
        availableExercises={availableExercises}
        isCardioExercise={isCardioExercise}
        updateExercises={updateExercises}
        updateMaxSets={updateMaxSets}
      />
    </Box>
  );
};

export default WorkoutForm;
