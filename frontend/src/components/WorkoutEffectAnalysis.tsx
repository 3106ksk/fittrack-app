import {
    BarChart,
    CheckCircle,
    Favorite,
    FitnessCenter,
    LocalFireDepartment,
    Psychology,
    Speed,
    Timer,
    TrendingUp,
    Warning,
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography
} from '@mui/material';
import React from 'react';
import { WorkoutAnalysisResult } from '../services/workoutEffectAnalyzer';

interface WorkoutEffectAnalysisProps {
  analysis: WorkoutAnalysisResult;
  compact?: boolean;
}

const WorkoutEffectAnalysis: React.FC<WorkoutEffectAnalysisProps> = ({ 
  analysis, 
  compact = false 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getBalanceColor = (balance: string) => {
    switch (balance) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'fair': return 'warning';
      default: return 'error';
    }
  };

  const getEffectIcon = (effectName: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      '心肺機能': <Favorite color="error" />,
      '筋力': <FitnessCenter color="primary" />,
      '筋持久力': <Speed color="info" />,
      '瞬発力': <Speed color="warning" />,
      '体幹安定性': <Psychology color="secondary" />,
      '脂肪燃焼': <LocalFireDepartment color="error" />,
      'バランス': <BarChart color="info" />,
    };
    return iconMap[effectName] || <FitnessCenter />;
  };

  if (compact) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: `${getScoreColor(analysis.overallScore)}.main`, 
              mr: 2,
              width: 32,
              height: 32 
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {analysis.overallScore}
            </Typography>
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              トレーニング効果スコア
            </Typography>
            <LinearProgress
              variant="determinate"
              value={analysis.overallScore * 10}
              color={getScoreColor(analysis.overallScore)}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              消費カロリー
            </Typography>
            <Typography variant="body2">
              {analysis.estimatedCalorieBurn}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              強度レベル
            </Typography>
            <Typography variant="body2">
              {analysis.intensityLevel}
            </Typography>
          </Grid>
        </Grid>

        {analysis.synergyEffects.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              相乗効果
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
              {analysis.synergyEffects.slice(0, 2).map((synergy, index) => (
                <Chip
                  key={index}
                  label={synergy.name}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* 総合スコア */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar 
              sx={{ 
                bgcolor: `${getScoreColor(analysis.overallScore)}.main`, 
                width: 80, 
                height: 80, 
                mx: 'auto',
                mb: 2 
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                {analysis.overallScore}
              </Typography>
            </Avatar>
            <Typography variant="h5" gutterBottom>
              トレーニング効果スコア
            </Typography>
            <LinearProgress
              variant="determinate"
              value={analysis.overallScore * 10}
              color={getScoreColor(analysis.overallScore)}
              sx={{ height: 8, borderRadius: 4, maxWidth: 300, mx: 'auto' }}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <LocalFireDepartment color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  消費カロリー
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {analysis.estimatedCalorieBurn}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Timer color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  強度レベル
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {analysis.intensityLevel}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <BarChart color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  筋肉バランス
                </Typography>
                                 <Chip 
                   label={`${analysis.muscleBalance.coverage}%`}
                   color={getBalanceColor(analysis.muscleBalance.balance)}
                   size="medium"
                 />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* 主要効果 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1 }} />
                主要なトレーニング効果
              </Typography>
              <List dense>
                {analysis.primaryEffects.slice(0, 5).map((effect, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      {getEffectIcon(effect.effect)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            {effect.effect}
                          </Typography>
                          <Chip 
                            label={`${effect.strength}/10`}
                            size="small"
                            color={effect.strength >= 7 ? 'success' : effect.strength >= 5 ? 'warning' : 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {effect.description}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={effect.strength * 10}
                            color={effect.strength >= 7 ? 'success' : effect.strength >= 5 ? 'warning' : 'inherit'}
                            sx={{ mt: 1, height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 相乗効果と改善提案 */}
        <Grid item xs={12} md={6}>
          {/* 相乗効果 */}
          {analysis.synergyEffects.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Psychology sx={{ mr: 1 }} />
                  相乗効果
                </Typography>
                {analysis.synergyEffects.map((synergy, index) => (
                  <Alert 
                    key={index} 
                    severity="success" 
                    sx={{ mb: 2 }}
                    icon={<CheckCircle />}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {synergy.name} (スコア: {synergy.score.toFixed(1)})
                    </Typography>
                    <Typography variant="body2">
                      {synergy.description}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {synergy.exercises.map((exercise, i) => (
                        <Chip key={i} label={exercise} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 改善提案 */}
          {analysis.recommendations.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning sx={{ mr: 1 }} />
                  改善提案
                </Typography>
                {analysis.recommendations.map((recommendation, index) => (
                  <Alert 
                    key={index} 
                    severity="info" 
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2">
                      {recommendation}
                    </Typography>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 強みと改善エリア */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom color="success.main">
                強化されるエリア
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {analysis.strengthAreas.map((area, index) => (
                  <Chip
                    key={index}
                    label={area}
                    color="success"
                    variant="outlined"
                    icon={<CheckCircle />}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom color="warning.main">
                改善の余地があるエリア
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {analysis.improvementAreas.map((area, index) => (
                  <Chip
                    key={index}
                    label={area}
                    color="warning"
                    variant="outlined"
                    icon={<Warning />}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WorkoutEffectAnalysis; 