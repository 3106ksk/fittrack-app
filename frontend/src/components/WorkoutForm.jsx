import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Grid, MenuItem, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import useFormConfig from '../hooks/useFormConfig';
import useFormValidation from '../hooks/useFormValidation';
import useWorkoutConfig from '../hooks/useWorkoutConfig';
import { workoutEffectAnalyzer } from '../services/workoutEffectAnalyzer';
import { generateDefaultValues } from '../utils/formDefaults';
import WorkoutEffectAnalysis from './WorkoutEffectAnalysis';

const WorkoutForm = () => {
  const formConfig = useFormConfig();
  const validationSchema = useFormValidation(formConfig);
  const { isCardioExercise } = useWorkoutConfig();
  
  const [feedback, setFeedback] = useState({
    message: '',
    type: '',
    visible: false,
  });

  // トレーニング効果分析をリアルタイムで計算
  const workoutAnalysis = useMemo(() => {
    if (formConfig.exercises.length === 0) {return null;}
    return workoutEffectAnalyzer.analyzeWorkout(formConfig.exercises, formConfig.maxSets);
  }, [formConfig.exercises, formConfig.maxSets]);


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

  // フォーム送信処理
  const onSubmit = async (data) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {

      for (const exercise of formConfig.exercises) {
        if (isCardioExercise(exercise)) {

          const distance = data[`${exercise}_distance`];
          const duration = data[`${exercise}_duration`];
          
          if (distance && duration) {
            const submitData = {
              exercise,
              exerciseType: 'cardio',
              distance: parseFloat(distance),
              duration: parseInt(duration, 10),
              intensity: data.intensity
            };
            
            await axios.post("http://localhost:8000/workouts", submitData, config);
          }
        } else {

          const repsData = [];
          for (let i = 1; i <= formConfig.maxSets; i++) {
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
              intensity: data.intensity
            };
            
            await axios.post("http://localhost:8000/workouts", submitData, config);
          }
        }
      }
      
      showFeedback('ワークアウトが保存されました', 'success');
      reset(generateDefaultValues(formConfig));
    } catch (error) {
      console.error('エラー発生:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'エラーが発生しました';
      showFeedback(errorMessage, 'error');
    }
  };
  const DISTANCE_OPTIONS = Array.from({ length: 21 }, (_, i) => (i * 0.5).toFixed(1));
  const DURATION_OPTIONS = Array.from({ length: 25 }, (_, i) => i * 5).filter(d => d > 0);
  const REPS_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            ワークアウト記録
          </Typography>
          
          {/* 現在の設定表示 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              設定中の種目:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formConfig.exercises.map(exercise => (
                <Chip 
                  key={exercise}
                  label={exercise}
                  color={isCardioExercise(exercise) ? 'primary' : 'secondary'}
                  variant="outlined"
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              履歴ページで種目設定を変更できます
            </Typography>
          </Box>

          {/* トレーニング効果予測 */}
          {workoutAnalysis && (
            <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 今回のワークアウト効果予測
                </Typography>
                <WorkoutEffectAnalysis analysis={workoutAnalysis} compact />
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* 各種目の入力フィールド */}
              {formConfig.exercises.map((exercise, index) => (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {exercise}
                        <Chip 
                          label={isCardioExercise(exercise) ? 'カーディオ' : '筋トレ'}
                          size="small"
                          color={isCardioExercise(exercise) ? 'primary' : 'secondary'}
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
                                  helperText={errors[`${exercise}_distance`]?.message}
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
                                  helperText={errors[`${exercise}_duration`]?.message}
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
                          {Array.from({ length: formConfig.maxSets }, (_, i) => (
                            <Grid item xs={12/formConfig.maxSets} key={i}>
                              <Controller
                                name={`${exercise}_set${i + 1}`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label={`${i + 1}セット目`}
                                    select
                                    fullWidth
                                    error={!!errors[`${exercise}_set${i + 1}`]}
                                    helperText={errors[`${exercise}_set${i + 1}`]?.message}
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
                          ))}
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
                      <MenuItem value="低">楽に感じる（軽い息切れ程度）</MenuItem>
                      <MenuItem value="中">少しきつい（会話しながらできる程度）</MenuItem>
                      <MenuItem value="高">かなりきつい（会話が難しい程度）</MenuItem>
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
    </Box>
  );
};

export default WorkoutForm;
