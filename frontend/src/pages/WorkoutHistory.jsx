import { Settings as SettingsIcon } from '@mui/icons-material';
import { Button, Container, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import WorkoutStatistics from '../components/statistics/WorkoutStatistics';
import WorkoutCustomizationDrawer from '../components/WorkoutCustomizationDrawer';
import WorkoutHistoryTable from '../components/WorkoutHistoryTable';
import useWorkoutConfig from '../hooks/useWorkoutConfig';
import transformWorkoutData from '../services/TransformWorkoutData';

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false); // カスタマイズドロワーの開閉状態

  const {
    workoutConfig,
    availableExercises,
    presets,
    isCardioExercise,
    isStrengthExercise,
    addExercise,
    removeExercise,
    applyPreset,
    updateMaxSets,
  } = useWorkoutConfig();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/workouts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const transformedData = transformWorkoutData(response.data);
        console.log('📊WorkoutHistory - transformedData:', transformedData);
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

  const getConfigDescription = () => {
    if (workoutConfig.exercises.length === 0) {
      return '種目が選択されていません';
    }

    const cardio = workoutConfig.exercises.filter(isCardioExercise);
    const strength = workoutConfig.exercises.filter(isStrengthExercise);

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

  if (error) {
    const getErrorMessage = () => {
      if (error.response?.status === 401) {
        return '認証情報が無効です。再度ログインしてください。';
      }
      if (error.code === 'ERR_NETWORK') {
        return 'インターネット接続を確認してください。';
      }
      return `エラーが発生しました。': ${error.message}`;
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{getErrorMessage()}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }



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

      {/* カスタマイズドロワー */}
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

      {/* 統計情報 */}
      <WorkoutStatistics workouts={workouts} loading={loading} />

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
