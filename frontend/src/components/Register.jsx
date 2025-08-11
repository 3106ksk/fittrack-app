import {
  Email as EmailIcon,
  Lock as LockIcon,
  PersonAddAlt as PersonAddAltIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Card, CardContent, Container, Divider, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const Register = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');


  const onSubmit = async (data) => {
    try {
      await apiClient.post('/authrouter/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      navigate('/dashboard',{
        state: {
          message: 'アカウント作成が完了しました。ログインしてください。',
        },
      });
    } catch (error) {
      let errorMessage = '';
      if (error.response) {
        const {status, data} = error.response;
        console.log(status, data);
        switch (status) {
          case 400:
            errorMessage = '入力内容に問題があります。全ての項目を正しく入力してください';
            break;
          case 409:
            errorMessage = 'このメールアドレスは既に登録されています。別のメールアドレスをお試しください。';
            break;
          case 422:
            errorMessage = 'パスワードは6文字以上で入力してください';
            break;
          case 429:
            errorMessage = '登録試行回数が制限に達しました。しばらく時間をおいてから再試行してください。';
            break;
          case 500:
            errorMessage = 'サーバーエラーが発生しました。しばらく待ってから再試行してください。';
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = 'サーバーが一時的に利用できません。しばらく経ってから再度お試しください。';
            break;
          default:
            errorMessage = `予期しないエラーが発生しました (${status})`;
        }
      } else if (error.request) {
        setErrorMessage('サーバーに接続できません。インターネット接続を確認してください。');
      } else {
        setErrorMessage('予期しないエラーが発生しました。');
      }
      setErrorMessage(errorMessage);
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
        <Card sx={{ width: '100%', maxWidth: 500}}>
          <CardContent sx={{ p: 4 }}>
            {/* ヘッダーエリア */}
            <Box sx={{ textAlign: 'center'}}>
              <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                mb: 2,
                mx: 'auto'
              }}
              >
                <PersonAddAltIcon fontSize="large" />
              </Avatar>
              <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
                新規登録
              </Typography>
              <Typography variant="body2" color="text.secondary">
                FitStar健康への第一歩
              </Typography>
            </Box>

            {/* エラーメッセージ */}
            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* 登録フォーム */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Controller
              name="username"
              control={control}
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
                autoFocus
                error={!!errors.username}
                helperText={errors.username?.message || "ユーザー名は3文字以上で入力してください"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                />
              )}
              />

              <Controller
              name="email"
              control={control}
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
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                />
              )}
              />

              <Controller
              name="password"
              control={control}
              rules={{
                required: 'パスワードは必須です',
                minLength: {
                  value: 6,
                  message: 'パスワードは6文字以上で入力してください',
                },
              }}
              render={({ field }) => (
                <TextField
                {...field}
                margin="normal"
                fullWidth
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message || "パスワードは6文字以上で入力してください"}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1 }}/>,
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                  ),
                }}
                />
              )}
              />

              <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'パスワード確認を入力してください',
                validate: (value) => {
                  return value === password || 'パスワードが一致しません';
                }
              }}
              render={({ field }) => (
                <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="パスワード確認"
                type="password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
                />
              )}
              />

              <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                mt: 3, mb: 2, height: 50,
                fontWeight: 'bold',
                borderRadius: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  backgroundColor: 'primary.secondary',
                },
              }}
              >
                {isLoading ? '登録中...' : 'アカウント作成'}
              </Button>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  既にアカウントをお持ちの方
                </Typography>
              </Divider>

              <Button
                component={Link}
                to="/login"
                fullWidth
                variant="outlined"
                size="large"
                sx={{ py: 1.5 }}
              >
                ログイン
              </Button>

            </Box>

          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;
