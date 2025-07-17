import {
  LocalFireDepartment as FireIcon,
  FitnessCenter as FitnessCenterIcon,
  History as HistoryIcon,
  DirectionsRun as RunIcon,
  Settings as SettingsIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/Hook';
import WorkoutStatistics from '../components/statistics/WorkoutStatistics';
import transformWorkoutData from '../services/TransformWorkoutData';


const DashboardPage = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/workouts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const transformedData = transformWorkoutData(response.data);
        setWorkouts(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('📈ダッシュボードデータ取得エラー📊:', error);
      } finally {
        setLoading(false);
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
    weeklyGoalProgress: 75
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
          position: 'relative'
        }}
      >
        <CardContent sx={{ p: 4, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  mr: 3,
                  border: '3px solid rgba(255,255,255,0.3)'
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
                      fontWeight: 'bold'
                    }}
                  />
                  <Chip
                    icon={<TrophyIcon />}
                    label="継続チャンピオン"
                    sx={{ 
                      bgcolor: 'rgba(255,193,7,0.9)', 
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Box>
            </Box>
            
          </Box>
        </CardContent>
      </Paper>

      <Grid container spacing={1}>
        {/* 統計カード群 - 継続性の視覚化 */}
          {/* メイン統計コンポーネント */}
          <WorkoutStatistics workouts={workouts} loading={loading} />
        {/* アクションパネル - カスタマイズ性の表現 */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(145deg, #f5f5f5 0%, #ffffff 100%)',
              border: '1px solid rgba(46, 125, 50, 0.1)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
                🎯 今日のアクション
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Button
                  component={Link}
                  to="/workout-form"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<FitnessCenterIcon />}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  ワークアウトを記録する
                </Button>
              </Box>

              <Button
                component={Link}
                to="/workout-history"
                variant="outlined"
                color="primary"
                fullWidth
                size="large"
                startIcon={<HistoryIcon />}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(46, 125, 50, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                ワークアウト詳細を確認
              </Button>

              <Divider sx={{ my: 3 }} />

              {/* カスタマイズヒント */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'rgba(46, 125, 50, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(46, 125, 50, 0.1)'
                }}
              >
                <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  💡 今日のヒント
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  継続は力なり。小さな運動でも毎日続けることで大きな変化を実感できます！
                </Typography>
                
                {/* パーソナライゼーション要素 */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label="あなた専用"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <IconButton size="small" color="primary">
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
