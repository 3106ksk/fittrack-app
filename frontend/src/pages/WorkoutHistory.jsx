import { Refresh as RefreshIcon, Settings as SettingsIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Paper,
    Typography,
    useTheme
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import WorkoutStatistics from '../components/statistics/WorkoutStatistics';
import WorkoutCustomizationDrawer from '../components/WorkoutCustomizationDrawer';
import WorkoutHistoryTable from '../components/WorkoutHistoryTable';
import useWorkoutConfig from '../hooks/useWorkoutConfig';
import transformWorkoutData from '../services/TransformWorkoutData';

const WorkoutHistory = () => {
  const theme = useTheme();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/workouts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const transformedData = transformWorkoutData(response.data);
      setWorkouts(transformedData);
    } catch (error) {
      console.error('ワークアウト履歴の取得に失敗しました:', error);
      setError(error);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const getErrorMessage = () => {
    if (error?.response?.status === 401) {
      return '認証情報が無効です。再度ログインしてください。';
    }
    if (error?.code === 'ERR_NETWORK') {
      return 'インターネット接続を確認してください。';
    }
    return `エラーが発生しました: ${error?.message || '不明なエラー'}`;
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchWorkouts}
              startIcon={<RefreshIcon />}
            >
              再試行
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {getErrorMessage()}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ヘッダーセクション */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              ワークアウト履歴
            </Typography>
            <Typography variant="body1" color="text.secondary">
              カスタム設定：{getConfigDescription()}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={() => setDrawerOpen(true)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            カスタマイズ
          </Button>
        </Box>
      </Paper>

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

      {/* 統計情報セクション */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <WorkoutStatistics workouts={workouts} loading={loading} />
        </CardContent>
      </Card>

      {/* ワークアウト履歴テーブルセクション */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <WorkoutHistoryTable
            workouts={workouts}
            workoutConfig={workoutConfig}
            loading={loading}
            isCardioExercise={isCardioExercise}
            isStrengthExercise={isStrengthExercise}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default WorkoutHistory;
