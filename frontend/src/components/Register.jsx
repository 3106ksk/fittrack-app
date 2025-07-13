import {
    Email as EmailIcon,
    LocalFireDepartment as FireIcon,
    FitnessCenter as FitnessCenterIcon,
    Lock as LockIcon,
    PersonalVideo as PersonalVideoIcon,
    Person as PersonIcon,
    Timeline as TimelineIcon,
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
import axios from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

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
      setSuccessMessage(null);
      
      await axios.post('http://localhost:8000/authrouter/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      
      setSuccessMessage('アカウントが正常に作成されました！ログインページに移動します...');
      
      // 2秒後にログインページに移動
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.response.status === 400) {
          setErrorMessage('入力内容に問題があります。');
        } else if (error.response.status === 404) {
          setErrorMessage('リソースが見つかりません。');
        } else if (error.response.status >= 500) {
          setErrorMessage(
            'サーバーエラーが発生しました。後でもう一度お試しください。'
          );
        }
      } else if (error.request) {
        setErrorMessage(
          'サーバーに接続できません。インターネット接続を確認してください。'
        );
      } else {
        setErrorMessage('予期しないエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* 左側 - 新しい始まりイメージ */}
        <Grid
          item
          xs={false}
          sm={4}
          md={4}
          sx={{
            position: 'relative',
            background: `linear-gradient(45deg, ${theme.palette.secondary.main}30, ${theme.palette.secondary.dark}70), 
                         url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><defs><pattern id="start" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"><polygon points="25,5 30,20 45,20 35,30 40,45 25,35 10,45 15,30 5,20 20,20" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100%" height="100%" fill="%23FF6F00"/><rect width="100%" height="100%" fill="url(%23start)"/></svg>')`,
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
              background: `linear-gradient(135deg, ${theme.palette.secondary.main}90, ${theme.palette.secondary.dark}70)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              color: 'white',
            }}
          >
            <FireIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              新しい
              <br />
              フィットネス
              <br />
              ジャーニーを
              <br />
              始めよう
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9, mt: 2 }}>
              今日から始めて
              <br />
              継続する習慣を
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <PersonalVideoIcon sx={{ fontSize: 24, mb: 1 }} />
                <Typography variant="caption" display="block">カスタマイズ</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <TimelineIcon sx={{ fontSize: 24, mb: 1 }} />
                <Typography variant="caption" display="block">記録管理</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <TrophyIcon sx={{ fontSize: 24, mb: 1 }} />
                <Typography variant="caption" display="block">達成感</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* 中央 - サインアップフォーム */}
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
                    bgcolor: theme.palette.secondary.main,
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
                今日からフィットネスジャーニーを始めましょう
              </Typography>
            </Box>

            {/* サインアップフォーム */}
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  textAlign="center"
                  sx={{ fontWeight: 'bold', mb: 3 }}
                >
                  アカウント作成
                </Typography>

                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errorMessage}
                  </Alert>
                )}

                {successMessage && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {successMessage}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                  <Controller
                    name="username"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: 'ユーザー名は必須です',
                      minLength: {
                        value: 3,
                        message: 'ユーザー名は3文字以上で入力してください',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="normal"
                        fullWidth
                        label="ユーザー名"
                        autoComplete="username"
                        autoFocus
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

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
                        autoComplete="new-password"
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
                      bgcolor: theme.palette.secondary.main,
                      '&:hover': {
                        bgcolor: theme.palette.secondary.dark,
                      },
                    }}
                  >
                    {isLoading ? 'アカウント作成中...' : 'アカウントを作成'}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      すでにアカウントをお持ちですか？{' '}
                      <Button
                        component={Link}
                        to="/login"
                        variant="text"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 'bold',
                          textDecoration: 'underline',
                        }}
                      >
                        ログイン
                      </Button>
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Grid>

        {/* 右側 - コミュニティ・継続イメージ */}
        <Grid
          item
          xs={false}
          sm={4}
          md={4}
          sx={{
            position: 'relative',
            background: `linear-gradient(225deg, ${theme.palette.primary.main}30, ${theme.palette.primary.dark}70), 
                         url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><defs><pattern id="community" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="6" fill="%23ffffff" opacity="0.1"/><circle cx="60" cy="20" r="6" fill="%23ffffff" opacity="0.1"/><circle cx="40" cy="40" r="8" fill="%23ffffff" opacity="0.15"/><circle cx="20" cy="60" r="6" fill="%23ffffff" opacity="0.1"/><circle cx="60" cy="60" r="6" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100%" height="100%" fill="%232E7D32"/><rect width="100%" height="100%" fill="url(%23community)"/></svg>')`,
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
              background: `linear-gradient(225deg, ${theme.palette.primary.main}90, ${theme.palette.primary.dark}70)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              color: 'white',
            }}
          >
            <TrophyIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              あなただけの
              <br />
              フィットネス
              <br />
              ストーリーを
              <br />
              作ろう
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9, mt: 2 }}>
              毎日の小さな積み重ねが
              <br />
              大きな変化を生む
            </Typography>
            
            {/* モチベーションカード */}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.primary.main }}>
                始めるメリット
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FireIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="body2">継続記録の可視化</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimelineIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="body2">進捗の詳細分析</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonalVideoIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="body2">自由なカスタマイズ</Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;
