import {
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Typography,
  Collapse
} from '@mui/material';
import { useState } from 'react';
import apiClient from '../../services/api';

const StravaSync = () => {
  const [syncState, setSyncState] = useState({
    status: 'idle', // idle, syncing, completed, failed
    result: null,
    error: null,
    startTime: null
  });

  const handleSync = async () => {
    setSyncState({ 
      status: 'syncing', 
      result: null, 
      error: null,
      startTime: Date.now()
    });
    
    try {
      const response = await apiClient.post('/api/strava/sync', { days: 30 });
      setSyncState({
        status: 'completed',
        result: response.data,
        error: null,
        startTime: null
      });
      
      // 3秒後に結果を非表示にする
      setTimeout(() => {
        setSyncState(prev => ({
          ...prev,
          status: 'idle',
          result: null
        }));
      }, 5000);
      
    } catch (error) {
      setSyncState({
        status: 'failed',
        result: null,
        error: error.response?.data?.error || '同期に失敗しました',
        startTime: null
      });
      
      // 5秒後にエラーを非表示にする
      setTimeout(() => {
        setSyncState(prev => ({
          ...prev,
          status: 'idle',
          error: null
        }));
      }, 5000);
    }
  };

  const getSyncButtonProps = () => {
    switch (syncState.status) {
      case 'syncing':
        return {
          text: '同期中...',
          icon: <CircularProgress size={20} color="inherit" />,
          disabled: true,
          color: 'primary'
        };
      case 'completed':
        return {
          text: '同期完了',
          icon: <CheckCircleIcon />,
          disabled: true,
          color: 'success'
        };
      case 'failed':
        return {
          text: '同期失敗',
          icon: <ErrorIcon />,
          disabled: false,
          color: 'error'
        };
      default:
        return {
          text: 'データを同期',
          icon: <SyncIcon />,
          disabled: false,
          color: 'primary'
        };
    }
  };

  const buttonProps = getSyncButtonProps();

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Stravaデータ同期
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Stravaの最新アクティビティをワークアウト履歴に同期します
        </Typography>
        
        <Button
          variant="contained"
          onClick={handleSync}
          disabled={buttonProps.disabled}
          startIcon={buttonProps.icon}
          color={buttonProps.color}
          fullWidth
          sx={{ mb: 2 }}
        >
          {buttonProps.text}
        </Button>

        {/* 進捗表示 */}
        <Collapse in={syncState.status === 'syncing'}>
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Stravaからデータを取得しています...
            </Typography>
          </Box>
        </Collapse>
        
        {/* 成功表示 */}
        <Collapse in={syncState.status === 'completed' && !!syncState.result}>
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ mt: 2 }}
          >
            <Typography variant="body2" component="div">
              <strong>同期完了！</strong>
            </Typography>
            {syncState.result && (
              <Box component="div" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  • 新規追加: {syncState.result.synced}件
                </Typography>
                {syncState.result.skipped > 0 && (
                  <Typography variant="body2">
                    • スキップ: {syncState.result.skipped}件（既存）
                  </Typography>
                )}
                {syncState.result.errors > 0 && (
                  <>
                    <Typography variant="body2" color="warning.main">
                      • エラー: {syncState.result.errors}件
                    </Typography>
                    {syncState.result.errorDetails && syncState.result.errorDetails.length > 0 && (
                      <Box sx={{ mt: 1, pl: 2 }}>
                        {syncState.result.errorDetails.map((err) => (
                          <Box key={`${err.activityId}-${err.activityName}`} sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="error" component="div">
                              - {err.activityName}: {err.error}
                            </Typography>
                            {err.type === 'duplicate_user' && (
                              <Typography variant="caption" color="warning.main" component="div" sx={{ pl: 2 }}>
                                ⚠️ 同じStravaアカウントを複数のユーザーで使用することはできません
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}
          </Alert>
        </Collapse>
        
        {/* エラー表示 */}
        <Collapse in={syncState.status === 'failed' && !!syncState.error}>
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            sx={{ mt: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setSyncState(prev => ({ ...prev, error: null, status: 'idle' }))}
              >
                閉じる
              </Button>
            }
          >
            <Typography variant="body2">
              {syncState.error}
            </Typography>
          </Alert>
        </Collapse>

        {/* ヒント表示 */}
        {syncState.status === 'idle' && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="caption">
                最新30日間のアクティビティを同期します。重複データは自動でスキップされます。
              </Typography>
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StravaSync;