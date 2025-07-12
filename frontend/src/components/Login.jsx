import {
    Email as EmailIcon,
    FitnessCenter as FitnessCenterIcon,
    Lock as LockIcon,
    Timer as TimerIcon,
    TrendingUp as TrendingUpIcon,
    EmojiEvents as TrophyIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './Hook';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.response.status === 400) {
          setErrorMessage('入力内容に問題があります。');
        }
      }
      console.error('ログインエラー', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* 左側 - ワークアウトイメージ */}
        <Grid
          item
          xs={false}
          sm={4}
          md={4}
          sx={{
            position: 'relative',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}30, ${theme.palette.primary.dark}70), 
                         url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><defs><pattern id="fitness" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="2" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100%" height="100%" fill="%232E7D32"/><rect width="100%" height="100%" fill="url(%23fitness)"/></svg>')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}90, ${theme.palette.primary.dark}70)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              color: 'white',
            }}
          >
            <FitnessCenterIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              あなたの
              <br />
              ワークアウトを
              <br />
              記録しよう
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9, mt: 2 }}>
              筋トレもカーディオも
              <br />
              すべて一箇所で管理
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 24, mb: 1 }} />
                <Typography variant="caption" display="block">進捗追跡</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <TimerIcon sx={{ fontSize: 24, mb: 1 }} />
                <Typography variant="caption" display="block">時間管理</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <TrophyIcon sx={{ fontSize: 24, mb: 1 }} />
                <Typography variant="caption" display="block">目標達成</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* 中央 - ログインフォーム */}
        <Grid
          item
          xs={12}
          sm={4}
          md={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FitnessCenterIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
              </Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                FitTrack
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                フィットネスジャーニーにログイン
              </Typography>
            </Box>

            {/* ログインフォーム */}
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  textAlign="center"
                  sx={{ fontWeight: 'bold', mb: 3 }}
                >
                  ログイン
                </Typography>

                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errorMessage}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                  <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: 'メールアドレスは必須です',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: '有効なメールアドレスを入力してください',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="normal"
                        fullWidth
                        label="メールアドレス"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: 'パスワードは必須です',
                      minLength: {
                        value: 8,
                        message: 'パスワードは8文字以上で入力してください',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="normal"
                        fullWidth
                        label="パスワード"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 3 }}
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      mt: 2,
                      mb: 2,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 2,
                    }}
                  >
                    {isLoading ? 'ログイン中...' : 'ログイン'}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      まだアカウントをお持ちでないですか？{' '}
                      <Button
                        component={Link}
                        to="/signup"
                        variant="text"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 'bold',
                          textDecoration: 'underline',
                        }}
                      >
                        サインアップ
                      </Button>
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Grid>

        {/* 右側 - 統計・進捗イメージ */}
        <Grid
          item
          xs={false}
          sm={4}
          md={4}
          sx={{
            position: 'relative',
            background: `linear-gradient(225deg, ${theme.palette.secondary.main}30, ${theme.palette.secondary.dark}70), 
                         url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><defs><pattern id="stats" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><rect x="10" y="40" width="8" height="10" fill="%23ffffff" opacity="0.1"/><rect x="22" y="30" width="8" height="20" fill="%23ffffff" opacity="0.1"/><rect x="34" y="20" width="8" height="30" fill="%23ffffff" opacity="0.1"/><rect x="46" y="35" width="8" height="15" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100%" height="100%" fill="%23FF6F00"/><rect width="100%" height="100%" fill="url(%23stats)"/></svg>')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(225deg, ${theme.palette.secondary.main}90, ${theme.palette.secondary.dark}70)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              color: 'white',
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              進捗を
              <br />
              可視化して
              <br />
              継続力アップ
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9, mt: 2 }}>
              統計情報と目標設定で
              <br />
              モチベーション維持
            </Typography>
            
            {/* モックアップ統計カード */}
            <Paper
              elevation={8}
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: 'text.primary',
                minWidth: 200,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.secondary.main }}>
                今週の記録
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">ワークアウト回数</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>4/5</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">連続記録</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>7日</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">総回数</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>1,250回</Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
