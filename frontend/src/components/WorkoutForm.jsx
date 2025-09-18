import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Snackbar,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import useFeedback from '../hooks/useFeedback';
import useFormConfig from '../hooks/useFormConfig';
import useFormValidation from '../hooks/useFormValidation';
import useWorkoutSubmit from '../hooks/useWorkoutSubmit';
import { generateDefaultValues } from '../utils/formDefaults';
import FormConfigDrawer from './FormConfigDrawer';
import WorkoutHeader from './WorkoutForm/WorkoutHeader';
import ExerciseCard from './WorkoutForm/ExerciseCard';

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

  // フィードバック管理用カスタムフック
  const { feedback, showFeedback, hideFeedback } = useFeedback();

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

  // 送信ロジックをカスタムフックに委譲
  const { handleSubmit: submitWorkout } = useWorkoutSubmit({
    workoutConfig,
    isCardioExercise,
    showFeedback,
    reset,
    generateDefaultValues
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <WorkoutHeader
            workoutConfig={workoutConfig}
            isCardioExercise={isCardioExercise}
            onOpenDrawer={() => setDrawerOpen(true)}
          />

          <form onSubmit={handleSubmit(submitWorkout)}>
            <Grid container spacing={3}>
              {/* 各種目の入力フィールド */}
              {workoutConfig.exercises.map(exercise => (
                <Grid item xs={12} key={exercise}>
                  <ExerciseCard
                    exercise={exercise}
                    isCardio={isCardioExercise(exercise)}
                    control={control}
                    errors={errors}
                    maxSets={workoutConfig.maxSets}
                  />
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
        </CardContent>
      </Card>

      {/* フィードバック表示 */}
      <Snackbar
        open={feedback.visible}
        autoHideDuration={3000}
        onClose={hideFeedback}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={hideFeedback}
          severity={feedback.type === 'success' ? 'success' : 'error'}
          variant="filled"
          sx={{
            color: 'white',
            width: '100%',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: 3,
          }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>

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
