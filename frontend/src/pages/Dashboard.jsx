import {
  AutoAwesome as AutoAwesomeIcon,
  CalendarMonth as CalendarIcon,
  LightMode as DayIcon,
  LocalFireDepartment as FireIcon,
  FitnessCenter as FitnessCenterIcon,
  HelpOutline as HelpOutlineIcon,
  History as HistoryIcon,
  WbSunny as MorningIcon,
  NightsStay as NightIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Container,
  Fade,
  Grid,
  Grow,
  LinearProgress,
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
  const [showStravaInfo, setShowStravaInfo] = useState(false);

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
      return {
        text: 'おはようございます',
        icon: <MorningIcon sx={{ fontSize: 28 }} />,
        message:
          'たった1～3分のストレッチや階段でも代謝は上がります。小さく始めて、しっかり健康投資。',
        gradient: 'linear-gradient(135deg, #FFE082 0%, #FB8C00 100%)',
      };
    } else if (hour < 18) {
      return {
        text: 'こんにちは',
        icon: <DayIcon sx={{ fontSize: 28 }} />,
        message:
          '短い歩き・軽いスクワット1セットでOK。小さな積み重ねが、体力と気分に大きなリターン。',
        gradient: 'linear-gradient(135deg, #4FC3F7 0%, #1976D2 100%)',
      };
    } else {
      return {
        text: 'お疲れ様でした',
        icon: <NightIcon sx={{ fontSize: 28 }} />,
        message:
          '1分のケアでも睡眠の質は変わります。今日の“ちょい運動”を記録して、明日の自分を軽くしよう。',
        gradient: 'linear-gradient(135deg, #9575CD 0%, #512DA8 100%)',
      };
    }
  };

  const greeting = getGreeting();

  // 統計データ
  const getWeeklyWorkouts = () => {
    if (!workouts || workouts.length === 0) {
      return 0;
    }
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    return workouts.filter(w => {
      const workoutDate = new Date(w.date || w.dateForSort);
      return workoutDate >= weekStart;
    }).length;
  };

  const continuityData = {
    currentStreak: workouts?.length > 0 ? Math.min(workouts.length, 7) : 0,
    totalWorkouts: workouts?.length || 0,
    totalMinutes:
      workouts?.reduce((acc, w) => acc + (w.duration || 30), 0) || 0,
    weeklyGoalProgress: Math.min((getWeeklyWorkouts() / 5) * 100, 100),
    weeklyWorkouts: getWeeklyWorkouts(),
  };

  // クイックスタットデータ
  const quickStats = [
    {
      label: '今週のワークアウト',
      value: continuityData.weeklyWorkouts,
      unit: '回',
      icon: <CalendarIcon sx={{ fontSize: 20 }} />,
      color: '#4CAF50',
    },
    {
      label: '今週のレップス回数',
      value: Math.floor(continuityData.totalMinutes / 60),
      unit: '回',
      icon: <ScheduleIcon sx={{ fontSize: 20 }} />,
      color: '#2196F3',
    },
    {
      label: '今週の距離',
      value: continuityData.currentStreak,
      unit: 'km',
      icon: <FireIcon sx={{ fontSize: 20 }} />,
      color: '#FF5722',
    },
  ];

  // Strava接続状態更新用のコールバック
  const handleStravaStatusChange = newStatus => {
    setStravaStatus(prev => ({ ...prev, connected: newStatus.connected }));
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: { xs: 1, sm: 2, md: 3 }, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}
    >
      {/* ダイナミックヘローカード */}
      <Fade in={true} timeout={600}>
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            background: greeting.gradient,
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
            },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 }, color: 'white' }}>
            <Grid container spacing={3}>
              {/* パーソナライズド挨拶 */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  }}
                >
                  <Grow in={true} timeout={800}>
                    <Avatar
                      sx={{
                        width: { xs: 60, sm: 80 },
                        height: { xs: 60, sm: 80 },
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        bgcolor: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(10px)',
                        mr: { xs: 2, sm: 3 },
                        mb: { xs: 2, sm: 0 },
                        border: '3px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    >
                      {user?.username
                        ? user.username.charAt(0).toUpperCase()
                        : 'T'}
                    </Avatar>
                  </Grow>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {greeting.icon}
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{
                          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.2rem' },
                          ml: 1,
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        {greeting.text}、{user?.username || 'testuser'}さん!
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        opacity: 0.95,
                        fontSize: { xs: '0.9rem', sm: '1.1rem' },
                        mb: 2,
                      }}
                    >
                      {greeting.message}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* クイックスタット */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {quickStats.map((stat, index) => (
                    <Grid item xs={4} key={stat.label}>
                      <Fade in={true} timeout={1000 + index * 200}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.15)',
                            borderRadius: 2,
                            p: { xs: 1.5, sm: 2 },
                            textAlign: 'center',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.25)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              mb: 1,
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{
                              fontSize: { xs: '1.5rem', sm: '2rem' },
                              mb: 0.5,
                            }}
                          >
                            {stat.value}
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{
                                ml: 0.5,
                                fontSize: { xs: '0.8rem', sm: '1rem' },
                              }}
                            >
                              {stat.unit}
                            </Typography>
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.9,
                              fontSize: { xs: '0.7rem', sm: '0.875rem' },
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* プログレスバー */}
              <Grid item xs={12}>
                <Fade in={true} timeout={1600}>
                  <Box
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      p: 2,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AutoAwesomeIcon sx={{ fontSize: 20, mr: 1 }} />
                      <Typography variant="body2" fontWeight="bold">
                        設定目標(🛠️👷開発中)
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ ml: 'auto', fontWeight: 'bold' }}
                      >
                        {Math.round(continuityData.weeklyGoalProgress)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={continuityData.weeklyGoalProgress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.9)',
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.9, mt: 1, display: 'block' }}
                    >
                      あと{Math.max(5 - continuityData.weeklyWorkouts, 0)}
                      回で次のマイルストーン達成！
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            </Grid>
          </CardContent>
        </Paper>
      </Fade>

      {/* アクションセクション */}
      <Box
        sx={{
          mb: 3,
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

        {/* 外部連携セクション */}
        <Fade in={true} timeout={1400}>
          <Box sx={{ mb: 4, maxWidth: 300 }}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                height: '100%',
                bgcolor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                {/* タイトル */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    sx={{ color: 'text.secondary' }}
                  >
                    Strava連携
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      ml: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.7,
                      },
                    }}
                    onClick={() => setShowStravaInfo(!showStravaInfo)}
                  >
                    <HelpOutlineIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', ml: 0.5 }}
                    >
                      Stravaとは？
                    </Typography>
                  </Box>
                </Box>

                {/* Strava連携（縦配置） */}
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  <StravaConnect onStatusChange={handleStravaStatusChange} />
                  {stravaStatus.connected && !stravaStatus.loading && (
                    <StravaSync />
                  )}
                  {!stravaStatus.connected && !stravaStatus.loading && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        mt: 1,
                      }}
                    >
                      ランニング等の
                      <br />
                      有酸素運動を自動記録
                    </Typography>
                  )}
                </Box>

                {/* 説明（折りたたみ） */}
                <Collapse in={showStravaInfo} timeout="auto" unmountOnExit>
                  <Box
                    sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.5,
                        fontSize: '0.7rem',
                      }}
                    >
                      <strong>Strava</strong>
                      は、ランニングやサイクリングを自動記録するアプリ。連携で有酸素運動が自動同期されます。
                    </Typography>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Box>

      {/* 統計・分析情報 */}
      <Fade in={true} timeout={1600}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUpIcon
              sx={{ fontSize: 28, color: 'primary.main', mr: 1 }}
            />
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: 'text.primary' }}
            >
              パフォーマンス分析
            </Typography>
          </Box>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              },
            }}
          >
            <WorkoutStatistics workouts={workouts} loading={loading} />
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

export default DashboardPage;
