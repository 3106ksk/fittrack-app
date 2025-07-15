import { FitnessCenter as FitnessCenterIcon, History as HistoryIcon, DirectionsRun as RunIcon } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
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

  return (
    <Container maxWidth="lg" sx={{mt:4, mb:4}}>
      {/* ウェルカムセクション */}
      <Card>
        <CardContent>
          <Box>
            <Avatar>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'UU'}
            </Avatar>
          </Box>
          <Box>
            <Typography>
              {getGreeting()}、{user?.username || 'ユーザー'}さん!
            </Typography>
            <Typography>
              <RunIcon sx={{mr:1, color:'primary.main', fontSize:40}}/> 今日も健康的な1日を始めましょう! 
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{mt:2, mb:2}}>
        <Grid item xs={12} md={6}>
          <WorkoutStatistics workouts={workouts} loading={loading} />
        </Grid>

        <Card>
          <CardContent>
            <Box>
            <Button
            component={Link}
            to="/workout-form"
            variant="contained"
            color="primary"
            sx={{mt:2}}
            startIcon={<FitnessCenterIcon/>}>
              ワークアウトを記録する
            </Button>
          </Box>

          <Box>
            <Button
            component={Link}
            to="/workout-history"
            variant="outlined"
            color="primary"
            sx={{mt:2}}
            startIcon={<HistoryIcon/>}>
              ワークアウト詳細を確認
            </Button>
          </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                💡 今日のヒント
              </Typography>
              <Typography variant="body1" color="text.secondary">
                継続は力なり。小さな運動でも毎日続けることで大きな変化を実感できます！
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
