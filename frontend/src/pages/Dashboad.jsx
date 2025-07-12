import {
    Add as AddIcon,
    CalendarToday as CalendarIcon,
    LocalFireDepartment as FireIcon,
    Settings as SettingsIcon,
    TrendingUp as TrendingUpIcon,
    EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/Hook';
import WorkoutStatistics from '../components/statistics/WorkoutStatistics';

export const DashboadPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    weeklyGoal: 3,
    weeklyCompleted: 0,
  });
  const [workouts, _setWorkouts] = useState([]);
  const [loading, _setLoading] = useState(false);

  // モックデータ（実際のAPIから取得する場合は置き換える）
  useEffect(() => {
    // 実際のAPIコールをここに実装
    const mockData = {
      currentStreak: 7,
      longestStreak: 14,
      weeklyGoal: 3,
      weeklyCompleted: 2,
    };
    setStreakData(mockData);
    
    // TODO: 実際のAPIからワークアウトデータを取得
    // _setLoading(true);
    // fetchWorkouts().then(data => {
    //   _setWorkouts(data);
    //   _setLoading(false);
    // });
  }, []);

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) {return '今日も一日頑張りましょう！';}
    if (hour < 18) {return 'お疲れ様です！今日のワークアウトはいかがですか？';}
    return '今日のワークアウトはお疲れ様でした！';
  };

  const getStreakColor = (streak) => {
    if (streak >= 14) {return 'success';}
    if (streak >= 7) {return 'warning';}
    return 'primary';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ウェルカムセクション */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
          border: `1px solid ${theme.palette.primary.light}30`,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              おかえりなさい、{user?.name || 'ユーザー'}さん！
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {getMotivationalMessage()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<FireIcon />}
                label={`${streakData.currentStreak}日連続`}
                color={getStreakColor(streakData.currentStreak)}
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                icon={<TrophyIcon />}
                label={`最長 ${streakData.longestStreak}日`}
                variant="outlined"
              />
              <Chip
                icon={<CalendarIcon />}
                label={`今週 ${streakData.weeklyCompleted}/${streakData.weeklyGoal} 完了`}
                color={streakData.weeklyCompleted >= streakData.weeklyGoal ? 'success' : 'default'}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                component={Link}
                to="/"
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontSize: '1.1rem',
                  mb: 1,
                }}
              >
                新しいワークアウト
              </Button>
              <Box>
                <IconButton
                  component={Link}
                  to="/workout-history"
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    mr: 1,
                    '&:hover': { bgcolor: theme.palette.action.hover },
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 進捗セクション */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  週間進捗
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {streakData.weeklyCompleted}/{streakData.weeklyGoal} ワークアウト完了
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round((streakData.weeklyCompleted / streakData.weeklyGoal) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((streakData.weeklyCompleted / streakData.weeklyGoal) * 100, 100)}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: theme.palette.grey[200],
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                あと {Math.max(0, streakData.weeklyGoal - streakData.weeklyCompleted)} 回で目標達成！
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FireIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  継続記録
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    {streakData.currentStreak}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    現在の連続記録
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                    {streakData.longestStreak}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最長記録
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                素晴らしい継続力です！この調子で頑張りましょう！
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 統計情報セクション */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            トレーニング統計
          </Typography>
          <WorkoutStatistics workouts={workouts} loading={loading} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboadPage;
