import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
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
import useFeedback from '../../hooks/useFeedback';
import useFormConfig from '../../hooks/useFormConfig';
import useFormValidation from '../../hooks/useFormValidation';
import useWorkoutSubmit from '../../hooks/useWorkoutSubmit';
import { generateDefaultValues } from '../../utils/formDefaults';
import FormConfigDrawer from '../FormConfigDrawer';
import WorkoutHeader from './WorkoutHeader';
import ExerciseCard from './ExerciseCard';

const WorkoutForm = () => {
  const {
    workoutConfig,
    availableExercises,
    isCardioExercise,
    updateExercises,
    updateMaxSets,
  } = useFormConfig();

  const validationSchema = useFormValidation(workoutConfig);

  const [drawerOpen, setDrawerOpen] = useState(false);

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
    const newDefaults = generateDefaultValues(workoutConfig);
    Object.keys(newDefaults).forEach(key => {
      setValue(key, newDefaults[key]);
    });
  }, [workoutConfig, setValue]);

  const { handleSubmit: submitWorkout } = useWorkoutSubmit({
    workoutConfig,
    isCardioExercise,
    showFeedback,
    reset,
    generateDefaultValues
  });

  return (
    <>
      <Card>
        <CardContent>
          <WorkoutHeader
            workoutConfig={workoutConfig}
            isCardioExercise={isCardioExercise}
            onOpenDrawer={() => setDrawerOpen(true)}
          />

          <form onSubmit={handleSubmit(submitWorkout)}>
            <Grid container spacing={3}>
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

      <FormConfigDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        workoutConfig={workoutConfig}
        availableExercises={availableExercises}
        isCardioExercise={isCardioExercise}
        updateExercises={updateExercises}
        updateMaxSets={updateMaxSets}
      />
    </>
  );
};

export default WorkoutForm;
