import {
  CalendarMonth as CalendarIcon,
  CloudSync as CloudSyncIcon,
  LightMode as DayIcon,
  DirectionsRun as DirectionsRunIcon,
  FitnessCenter as FitnessCenterIcon,
  HelpOutline as HelpOutlineIcon,
  History as HistoryIcon,
  WbSunny as MorningIcon,
  NightsStay as NightIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
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
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackButton from '../components/FeedbackButton';
import { useAuth } from '../components/Hook';
import HealthScoreCard from '../components/insights/HealthScoreCard';
import RecentWorkoutsAccordion from '../components/Dashboard/RecentWorkoutsAccordion';
import WorkoutStatistics from '../components/statistics/WorkoutStatistics';
import StravaConnect from '../components/strava/StravaConnect';
import StravaSync from '../components/strava/StravaSync';
import apiClient from '../services/api';
import { calculateDashboardWeeklyStats } from '../services/StatisticsService';

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
        icon: <MorningIcon sx={{ fontSize: 14 }} />,
        message:
          'たった1～3分のストレッチや階段でも代謝は上がります。小さく始めて、しっかり健康投資をスタートしましょう。',
        backgroundColor: '#388E3C',
      };
    } else if (hour < 18) {
      return {
        text: 'こんにちは',
        icon: <DayIcon sx={{ fontSize: 14 }} />,
        message:
          '短い歩き・軽いスクワット1セットでOK。小さな積み重ねが、体力と気分に大きなリターンを得ることができます。',
        backgroundColor: '#388E3C',
      };
    } else {
      return {
        text: 'お疲れ様でした',
        icon: <NightIcon sx={{ fontSize: 14 }} />,
        message:
          '1分のケアでも睡眠の質は変わります。今日の"ちょい運動"を記録して、明日の自分を軽くしましょう。',
        backgroundColor: '#388E3C',
      };
    }
  };

  const greeting = getGreeting();

  // 週間統計データを計算（メモ化で最適化）
  const weeklyStats = useMemo(() => {
    return calculateDashboardWeeklyStats(workouts);
  }, [workouts]);


  // クイックスタットデータ（前週比較付き）
  const quickStats = [
    {
      label: '今週のワークアウト',
      value: weeklyStats.weeklyWorkouts,
      unit: '回',
      icon: <CalendarIcon sx={{ fontSize: 17 }} />,
      color: '#4CAF50',
      previousValue: weeklyStats.previousWeek.weeklyWorkouts,
      changeRate: weeklyStats.changeRates.workouts,
    },
    {
      label: '今週のレップス回数',
      value: weeklyStats.weeklyReps,
      unit: '回',
      icon: <FitnessCenterIcon sx={{ fontSize: 17 }} />,
      color: '#2196F3',
      previousValue: weeklyStats.previousWeek.weeklyReps,
      changeRate: weeklyStats.changeRates.reps,
    },
    {
      label: '今週の距離',
      value: weeklyStats.weeklyDistance.toFixed(1),
      unit: 'km',
      icon: <DirectionsRunIcon sx={{ fontSize: 17 }} />,
      color: '#FF5722',
      previousValue: weeklyStats.previousWeek.weeklyDistance.toFixed(1),
      changeRate: weeklyStats.changeRates.distance,
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
      {/* フィードバックボタン（上部配置） */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FeedbackButton />
      </Box>

      {/* ダイナミックヘローカード */}
      <Fade in={true} timeout={600}>
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            backgroundColor: greeting.backgroundColor,
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
          <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
            <Grid container spacing={1}>
              {/* パーソナライズド挨拶 */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ color: 'white' }}>{greeting.icon}</Box>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          fontSize: {
                            xs: '0.96rem',
                            sm: '1.2rem',
                            md: '1.32rem',
                          },
                          ml: 0.75,
                          color: 'white',
                          textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      >
                        {greeting.text}、{user?.username || 'testuser'}さん!
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                      }}
                    >
                      <Avatar
                        src="/doctor-icon.png"
                        alt="医療アドバイザー"
                        sx={{
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                          bgcolor: 'white',
                          border: '2px solid rgba(255,255,255,0.5)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '& img': {
                            objectFit: 'contain',
                            padding: '4px',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          flex: 1,
                          position: 'relative',
                          bgcolor: '#ffffff',
                          borderRadius: 2,
                          p: { xs: 1, sm: 1.5 },
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: -8,
                            top: 10,
                            width: 0,
                            height: 0,
                            borderStyle: 'solid',
                            borderWidth: '8px 8px 8px 0',
                            borderColor:
                              'transparent #ffffff transparent transparent',
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#424242',
                            fontSize: { xs: '0.78rem', sm: '0.84rem' },
                            lineHeight: 1.4,
                            fontWeight: 500,
                          }}
                        >
                          {greeting.message}
                        </Typography>
                      </Box>
                    </Box>
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
                            bgcolor: '#ffffff',
                            borderRadius: 2,
                            p: { xs: 0.75, sm: 1 },
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.3)',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            '&:hover': {
                              bgcolor: '#ffffff',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              mb: 1,
                              color: stat.color,
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                              fontSize: { xs: '1.08rem', sm: '1.32rem' },
                              mb: 0.2,
                              color: '#212121',
                            }}
                          >
                            {stat.value}
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{
                                ml: 0.5,
                                fontSize: { xs: '0.72rem', sm: '0.84rem' },
                                color: '#616161',
                              }}
                            >
                              {stat.unit}
                            </Typography>
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#757575',
                              fontSize: { xs: '0.66rem', sm: '0.78rem' },
                              mb: 0.5,
                            }}
                          >
                            {stat.label}
                          </Typography>

                          {/* 前週比較 */}
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#9e9e9e',
                                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                display: 'block',
                              }}
                            >
                              先週: {stat.previousValue}
                              {stat.unit}
                            </Typography>

                            {/* 変化率表示 */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mt: 0.5,
                              }}
                            >
                              {stat.changeRate > 0 && (
                                <TrendingUpIcon
                                  sx={{
                                    fontSize: 14,
                                    color: '#4CAF50',
                                    mr: 0.5,
                                  }}
                                />
                              )}
                              {stat.changeRate < 0 && (
                                <TrendingDownIcon
                                  sx={{
                                    fontSize: 14,
                                    color: '#f44336',
                                    mr: 0.5,
                                  }}
                                />
                              )}
                              {stat.changeRate === 0 && (
                                <TrendingFlatIcon
                                  sx={{
                                    fontSize: 14,
                                    color: '#bdbdbd',
                                    mr: 0.5,
                                  }}
                                />
                              )}
                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    stat.changeRate > 0
                                      ? '#4CAF50'
                                      : stat.changeRate < 0
                                        ? '#f44336'
                                        : '#9e9e9e',
                                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                  fontWeight: 'bold',
                                }}
                              >
                                {stat.changeRate > 0 ? '+' : ''}
                                {stat.changeRate}%
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Paper>
      </Fade>

      {/* 健康スコアカード */}
      <Box sx={{ mb: 2 }}>
        <HealthScoreCard />
      </Box>

      {/* 直近のログを見る（新規追加） */}
      <Box sx={{ mb: 3 }}>
        <RecentWorkoutsAccordion workouts={workouts} />
      </Box>

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
                  <CloudSyncIcon
                    sx={{
                      fontSize: 20,
                      color: 'text.secondary',
                      mr: 0.5,
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    sx={{ color: 'text.secondary' }}
                  >
                    外部連携
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
