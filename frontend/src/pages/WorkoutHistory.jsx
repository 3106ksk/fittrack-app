import { Settings as SettingsIcon } from '@mui/icons-material';
import {
  Alert,
  Button,
  CircularProgress,
  Collapse,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import WorkoutStatistics from '../components/statistics/WorkoutStatistics';
import WorkoutCustomizationDrawer from '../components/WorkoutCustomizationDrawer';
import useWorkoutConfig from '../hooks/useWorkoutConfig';

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    workoutConfig,
    availableExercises,
    presets,
    isCardioExercise,
    addExercise,
    removeExercise,
    applyPreset,
    updateMaxSets
  } = useWorkoutConfig();

  useEffect(() => {
    const controller = new AbortController();
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/workouts', {
          signal: controller.signal
        });
        setWorkouts(response.data);
        setLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('ワークアウト履歴の取得がキャンセルされました');
          return;
        }
        setError(error);
        setLoading(false);
      }
    };
    fetchWorkouts();
    return () => controller.abort();
  }, []);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };


  const getConfigDescription = () => {
    if (workoutConfig.exercises.length === 0) {
      return '種目が選択されていません';
    }
    
    const cardio = workoutConfig.exercises.filter(isCardioExercise);
    const strength = workoutConfig.exercises.filter(ex => !isCardioExercise(ex));
    
    let description = '';
    if (cardio.length > 0) {
      description += `${cardio.join('、')} (距離・時間)`;
      if (strength.length > 0) {
        description += '、';
      }
    }
    if (strength.length > 0) {
      description += `${strength.join('、')} (${workoutConfig.maxSets}セット)`;
    }
    
    return description;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      
      <Typography variant="h6">ワークアウト履歴</Typography>
      <Typography variant="body2" color="text.secondary">
        カスタム設定：{getConfigDescription()}
      </Typography>
      <Button
      variant="outlined"
      startIcon={<SettingsIcon />}
      onClick={() => setDrawerOpen(true)}
      >
        カスタマイズ
      </Button>

      <WorkoutCustomizationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        workoutConfig={workoutConfig}
        availableExercises={availableExercises}
        presets={presets}
        isCardioExercise={isCardioExercise}
        addExercise={addExercise}
        removeExercise={removeExercise}
        applyPreset={applyPreset}
        updateMaxSets={updateMaxSets}
      />



      <WorkoutStatistics workouts={workouts} loading={loading} />
      
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error.message}</Alert>}

      {workouts.length > 0 && (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>日付</TableCell>
                <TableCell>種目</TableCell>
                <TableCell>セット／距離</TableCell>
                <TableCell>時間</TableCell>
                <TableCell>強度</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workouts.map(workout => (
                <React.Fragment key={workout.id}>
                  <TableRow>
                    <TableCell>{workout.date}</TableCell>
                    <TableCell>{workout.exercise}</TableCell>
                    <TableCell>
                      {workout.isCardio
                        ? `${workout.distance} km`
                        : (
                          <Button size="small" onClick={() => toggle(workout.id)}>
                            {workout.sets} セット
                          </Button>
                        )
                      }
                    </TableCell>
                    <TableCell>
                      {workout.isCardio ? `${workout.duration} 分` : '-'}
                    </TableCell>
                    <TableCell>{workout.intensity}</TableCell>
                  </TableRow>

                  {!workout.isCardio && openId === workout.id && (
                    <TableRow key={`${workout.id}-detail`}>
                      <TableCell colSpan={5} sx={{ py: 0, border: 0 }}>
                        <Collapse in>
                          <ul style={{ margin: 8, paddingLeft: 16 }}>
                            {workout.repsDetail.map(reps =>
                              <li key={reps.setNumber}>
                                {reps.setNumber}セット目
                                {reps.reps}回
                              </li>
                            )}
                          </ul>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!loading && !error && workouts.length === 0 && (
        <Alert severity="info">
          トレーニング履歴がありません
        </Alert>
      )}
    </Container>

  )
}

export default WorkoutHistory