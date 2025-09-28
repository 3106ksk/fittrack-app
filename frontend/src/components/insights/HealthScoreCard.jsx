/**
 * HealthScoreCard コンポーネント
 *
 * 健康スコアを表示するカードコンポーネント
 * 総合スコア、有酸素運動、筋力トレーニングの各スコアを視覚的に表示
 */
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FitnessCenter as FitnessIcon,
  DirectionsRun as RunIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import useInsights from '../../hooks/useInsights';

const HealthScoreCard = () => {
  const { data, loading, error, refetch } = useInsights();

  // ローディング状態
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            健康スコア
          </Typography>
          <Typography color="text.secondary">データ取得中...</Typography>
        </CardContent>
      </Card>
    );
  }

  // エラー状態
  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            健康スコア
          </Typography>
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            action={
              <Typography
                component="span"
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={refetch}
              >
                再試行
              </Typography>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // 正常なデータ表示
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          健康スコア
        </Typography>

        {data ? (
          <>
            <Box sx={{ mb: 3 }}>
              {/* 総合スコア */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h2" component="div" color="primary">
                  {data.scores.total}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  総合スコア
                </Typography>
              </Box>

              {/* 個別スコア */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      textAlign: 'center',
                    }}
                  >
                    <RunIcon color="action" sx={{ mb: 1 }} />
                    <Typography variant="h4" component="div">
                      {data.scores.cardio}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      有酸素運動
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      textAlign: 'center',
                    }}
                  >
                    <FitnessIcon color="action" sx={{ mb: 1 }} />
                    <Typography variant="h4" component="div">
                      {data.scores.strength}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      筋力トレーニング
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* WHO達成状況 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                WHO推奨達成状況
              </Typography>

              {data.whoCompliance && (
                <Grid container spacing={1}>
                  {/* 有酸素運動 */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 1.5,
                        border: 1,
                        borderColor: data.whoCompliance.cardio
                          ? 'success.main'
                          : 'grey.300',
                        borderRadius: 1,
                        bgcolor: data.whoCompliance.cardio
                          ? 'success.50'
                          : 'grey.50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      {data.whoCompliance.cardio ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <CancelIcon color="disabled" fontSize="small" />
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          有酸素運動
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            data.whoCompliance.cardio
                              ? 'success.main'
                              : 'text.secondary'
                          }
                        >
                          {data.whoCompliance.cardio
                            ? '目標達成'
                            : '目標未達成'}
                          {` (${data.metrics.cardio.weeklyMinutes}/150分)`}
                          {` (${data.metrics.cardio.achievementRate}/100%)`}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* 筋力トレーニング */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 1.5,
                        border: 1,
                        borderColor: data.whoCompliance.strength
                          ? 'success.main'
                          : 'grey.300',
                        borderRadius: 1,
                        bgcolor: data.whoCompliance.strength
                          ? 'success.50'
                          : 'grey.50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      {data.whoCompliance.strength ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <CancelIcon color="disabled" fontSize="small" />
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          筋力トレーニング
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            data.whoCompliance.strength
                              ? 'success.main'
                              : 'text.secondary'
                          }
                        >
                          {data.whoCompliance.strength
                            ? '目標達成'
                            : '目標未達成'}
                          {` (${data.metrics.strength.weeklyDays}/2日)`}
                          {` (${data.metrics.strength.achievementRate}/100%)`}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>

            {/* 健康メッセージ */}
            {data.healthMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {data.healthMessage}
                </Typography>
              </Alert>
            )}

            {/* 推奨事項 */}
            {data.recommendations && data.recommendations.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  改善のヒント
                </Typography>
                <Box sx={{ pl: 1 }}>
                  {data.recommendations.map((recommendation, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      • {recommendation}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* メトリクス情報 */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`有酸素: ${data.metrics.cardio.weeklyMinutes}分/週`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`筋トレ: ${data.metrics.strength.weeklyDays}日/週`}
                size="small"
                variant="outlined"
              />
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            データがありません
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthScoreCard;
