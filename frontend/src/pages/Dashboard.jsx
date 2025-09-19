import {
  LocalFireDepartment as FireIcon,
  FitnessCenter as FitnessCenterIcon,
  History as HistoryIcon,
  DirectionsRun as RunIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/Hook';
import WorkoutStatistics from '../components/statistics/WorkoutStatistics';
import StravaConnect from '../components/strava/StravaConnect';
import StravaSync from '../components/strava/StravaSync';
import apiClient from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stravaStatus, setStravaStatus] = useState({
    connected: false,
    loading: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 並行してワークアウトデータとStrava状態を取得
        const [workoutResponse, stravaResponse] = await Promise.all([
          apiClient.get('/workouts'),
          apiClient
            .get('/api/strava/status')
            .catch(() => ({ data: { connected: false } })),
        ]);

        // 統計計算用に生データをそのまま使用（単一責任の原則）
        setWorkouts(workoutResponse.data);
        setStravaStatus({
          connected: stravaResponse.data.connected,
          loading: false,
        });
      } catch {
        // エラーハンドリングはfinallyブロックで処理
      } finally {
        setLoading(false);
        setStravaStatus(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'おはようございます';
    } else if (hour < 18) {
      return 'こんにちは! 今日も頑張りましょう!';
    } else {
      return '今日も一日お疲れ様でした。今日の活動を記録しましょう。';
    }
  };

  // 継続性データ（モック）
  const continuityData = {
    currentStreak: 4,
    totalWorkouts: 905,
    totalMinutes: 90,
    weeklyGoalProgress: 75,
  };

  // Strava接続状態更新用のコールバック
  const handleStravaStatusChange = newStatus => {
    setStravaStatus(prev => ({ ...prev, connected: newStatus.connected }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ヘルローカード - 継続性とパーソナライゼーション */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <CardContent sx={{ p: 4, color: 'white' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  mr: 3,
                  border: '3px solid rgba(255,255,255,0.3)',
                }}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : 'T'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {getGreeting()}、{user?.username || 'testuser'}さん!
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RunIcon sx={{ mr: 1, fontSize: 24 }} />
                  <Typography variant="h6">
                    今日も健康的な1日を始めましょう!
                  </Typography>
                </Box>

                {/* 継続性バッジ */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<FireIcon />}
                    label={`${continuityData.currentStreak}日連続`}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                  <Chip
                    icon={<TrophyIcon />}
                    label="継続チャンピオン"
                    sx={{
                      bgcolor: 'rgba(255,193,7,0.9)',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 今日のヒント */}
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              💡 今日のヒント
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6, opacity: 0.95 }}>
              継続は力なり。小さな運動でも毎日続けることで大きな変化を実感できます！
            </Typography>
          </Box>
        </CardContent>
      </Paper>

      {/* アクションセクション */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* アクションボタン - 左側 */}
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                component={Link}
                to="/workout-form"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<FitnessCenterIcon />}
                sx={{
                  py: 2.5,
                  borderRadius: 2,
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                ワークアウトを記録する
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                component={Link}
                to="/workout-history"
                variant="outlined"
                color="primary"
                fullWidth
                size="large"
                startIcon={<HistoryIcon />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(46, 125, 50, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                ワークアウト詳細を確認
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Strava連携パネル - 右側固定 */}
        <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '300px' } }}>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ color: 'primary.main', mb: 2 }}
              >
                🌐 連携サービス
              </Typography>
              <StravaConnect onStatusChange={handleStravaStatusChange} />
              {stravaStatus.connected && !stravaStatus.loading && (
                <Box sx={{ mt: 2 }}>
                  <StravaSync />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 統計カード - 分析情報を下部に配置 */}
      <WorkoutStatistics workouts={workouts} loading={loading} />
    </Container>
  );
};

export default DashboardPage;
