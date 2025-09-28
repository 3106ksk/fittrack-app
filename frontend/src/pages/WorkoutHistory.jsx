import { Settings as SettingsIcon } from '@mui/icons-material';
import { Button, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import WorkoutCustomizationDrawer from '../components/WorkoutCustomizationDrawer';
import WorkoutHistoryTable from '../components/WorkoutHistoryTable';
import useWorkoutConfig from '../hooks/useWorkoutConfig';
import apiClient from '../services/api';
import transformWorkoutData from '../services/TransformWorkoutData';

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false); // カスタマイズドロワーの開閉状態

  const {
    workoutConfig,
    availableExercises,
    isCardioExercise,
    isStrengthExercise,
    updateExercises, // FormConfigパターン
    updateMaxSets, // FormConfigパターン
  } = useWorkoutConfig();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/workouts');
        const transformedData = transformWorkoutData(response.data);
        setWorkouts(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('ワークアウト履歴の取得に失敗しました:', error);
        setError(error);
        setLoading(false);
        setWorkouts([]);
      }
    };
    fetchWorkouts();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button
        variant="outlined"
        startIcon={<SettingsIcon />}
        onClick={() => setDrawerOpen(true)}
      >
        ここから表示するワークアウトとセット数を変更できます
      </Button>

      {/* カスタマイズドロワー */}
      <WorkoutCustomizationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        workoutConfig={workoutConfig}
        availableExercises={availableExercises}
        isCardioExercise={isCardioExercise}
        updateExercises={updateExercises} // FormConfigパターン
        updateMaxSets={updateMaxSets} // FormConfigパターン
      />

      {/* ワークアウト履歴テーブル */}
      <WorkoutHistoryTable
        workouts={workouts}
        workoutConfig={workoutConfig}
        loading={loading}
        isCardioExercise={isCardioExercise}
        isStrengthExercise={isStrengthExercise}
      />
    </Container>
  );
};

export default WorkoutHistory;
