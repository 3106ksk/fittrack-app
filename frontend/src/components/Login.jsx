import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './Hook';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const successMessage = location.state?.message;

  // 🔍 デバッグ用: location と successMessage の値を確認
  console.log('🔍 [Login.jsx] location:', location);
  console.log('🔍 [Login.jsx] location.state:', location.state);
  console.log('🔍 [Login.jsx] successMessage:', successMessage);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit', // バリデーションは送信時に実行される
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async data => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          if (data.errors && data.errors.length > 0) {
            setErrorMessage(data.errors[0].msg);
          } else {
            setErrorMessage('入力内容に問題があります。');
          }
        } else if (status === 401) {
          if (Array.isArray(data) && data.length > 0 && data[0].message) {
            setErrorMessage(data[0].message);
          } else {
            setErrorMessage(
              'メールアドレスまたはパスワードが正しくありません。'
            );
          }
        } else if (status === 500) {
          const message =
            data.message ||
            'サーバーエラーが発生しました。しばらく待ってから再試行してください。';
          setErrorMessage(message);
        } else {
          setErrorMessage('予期しないエラーが発生しました。');
        }
      } else {
        setErrorMessage('ネットワークエラーが発生しました。');
      }
      console.error('ログインエラー', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 500,
            animation: 'fadeIn 0.5s ease-in-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* ヘッダーエリア */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  mx: 'auto',
                  mb: 2,
                  width: 70,
                  height: 70,
                  bgcolor: 'primary.main',
                  color: 'white',
                }}
              >
                <LoginIcon fontSize="large" />
              </Avatar>
              <Typography
                component="h1"
                variant="h4"
                fontWeight="bold"
                gutterBottom
              >
                ログイン
              </Typography>
              <Typography variant="body3" color="text.secondary">
                FitStarへようこそ
              </Typography>
            </Box>
            {/* 登録成功メッセージ*/}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 6 }}>
                {successMessage}
              </Alert>
            )}

            {/* エラーメッセージ */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 6 }}>
                {errorMessage}
              </Alert>
            )}

            {/* フォーム */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('email', {
                  required: 'メールアドレスは必須です',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: '有効なメールアドレスを入力してください',
                  },
                })}
                data-testid="email-field"
                margin="normal"
                required
                fullWidth
                label="メールアドレス"
                type="email"
                autoComplete="email"
                autoFocus
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ color: 'action.active', mr: 1 }} />
                  ),
                }}
              />

              <TextField
                {...register('password', {
                  required: 'パスワードは必須です',
                  minLength: {
                    value: 8,
                    message: 'パスワードは8文字以上で入力してください',
                  },
                })}
                data-testid="password-field"
                margin="normal"
                required
                fullWidth
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1 }} />,
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2, height: 50, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>

              <Divider>
                <Typography variant="body2" color="text.secondary">
                  または
                </Typography>
              </Divider>
              <Button
                component={Link}
                to="/signup"
                fullWidth
                variant="outlined"
                color="secondary"
                sx={{
                  mt: 2,
                  mb: 2,
                  height: 50,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'secondary.light',
                    color: 'white',
                    transform: 'scale(1.02)',
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                新規アカウント作成
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
export default Login;
