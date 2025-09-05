import {
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  SportsScore as StravaIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../../services/api';

const StravaConnect = ({ onStatusChange }) => {
  const [connectionState, setConnectionState] = useState({
    loading: true,
    connected: false,
    error: null,
    athleteId: null,
    lastSync: null
  });

  useEffect(() => {
    checkStravaStatus();
  }, []);

  const checkStravaStatus = async () => {
    try {
      setConnectionState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiClient.get('/api/strava/status');
      const newState = {
        loading: false,
        connected: response.data.connected,
        error: null,
        athleteId: response.data.athlete_id,
        lastSync: response.data.last_sync
      };
      setConnectionState(newState);
      

      if (onStatusChange) {
        onStatusChange({ connected: response.data.connected });
      }
    } catch (error) {
      const newState = {
        loading: false,
        connected: false,
        error: error.response?.data?.error || 'ステータス確認に失敗しました',
        athleteId: null,
        lastSync: null
      };
      setConnectionState(newState);
      

      if (onStatusChange) {
        onStatusChange({ connected: false });
      }
    }
  };

  const handleConnect = async () =>{
    try {
      setConnectionState(prev => ({
        ...prev,
        loading: true,
        error: null
       }));
      
      const response = await apiClient.post('/api/strava/auth');
      if (!response) {
        throw new Error('Strava認証URLの取得に失敗しました');
      }
      const authUrl = response.data.authUrl;
      window.location.href = authUrl;
      
    } catch (error) {
      setConnectionState(prev =>({
        ...prev,
        loading: false,
        error: error.response?.data?.error || error.message || 'Strava接続に失敗しました'
      }));
    }
  };

  const handleDisconnect = async () => {
    const isConfirmed = window.confirm(
    "Stravaとの連携を解除しますか？\n" +
    "保存されているトレーニングデータは削除されません。"
    );
    if (!isConfirmed){
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, loading: true, error: null }));
      await apiClient.delete('/api/strava/disconnect');
      
      await checkStravaStatus();
    } catch (error) {
      if (error.response?.status === 401){
        setConnectionState(prev => ({
          ...prev,
          loading: false,
          error: 'Strava認証が必要です。再度接続してください。'
        }));
      } else {
        setConnectionState(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.error || error.message || 'Strava連携解除に失敗しました'
        }));
      }
    }
  };

  if (connectionState.loading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" p={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Strava接続状況を確認中...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <StravaIcon sx={{ mr: 1, color: '#FC4C02' }} />
          Strava連携
        </Typography>

        {connectionState.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {connectionState.error}
          </Alert>
        )}

        {connectionState.connected ? (
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <LinkIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body1" color="success.main">
                Stravaアカウントに接続済み
              </Typography>
            </Box>
            
            <Box mb={2}>
              <Chip
                icon={<PersonIcon />}
                label={`Athlete ID: ${connectionState.athleteId}`}
                variant="outlined"
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
              {connectionState.lastSync && (
                <Chip
                  icon={<ScheduleIcon />}
                  label={`最終同期: ${new Date(connectionState.lastSync).toLocaleDateString('ja-JP')}`}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Button
              variant="outlined"
              color="error"
              onClick={handleDisconnect}
              disabled={connectionState.loading}
              startIcon={<LinkOffIcon />}
              size="small"
            >
              連携解除
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Stravaアカウントと連携して、アクティビティデータを自動同期しましょう
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleConnect}
              disabled={connectionState.loading}
              startIcon={<LinkIcon />}
              fullWidth
              sx={{ 
                bgcolor: '#FC4C02',
                '&:hover': { bgcolor: '#e63c00' },
                color: 'white'
              }}
            >
              Stravaに接続
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StravaConnect;