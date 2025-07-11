import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Slider,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  FitnessCenter as FitnessCenterIcon,
  DirectionsRun as RunIcon,
} from '@mui/icons-material';

const WorkoutCustomizationDrawer = ({
  open,
  onClose,
  presets,
  isCardioExercise,
  applyPreset,
  availableExercises,
  workoutConfig,
  addExercise,
  removeExercise,
  updateMaxSets,
}) => {
  const [presetExpanded, setPresetExpanded] = useState(false);

  const handlePresetToggle = () => {
    setPresetExpanded(!presetExpanded);
  };

  // 利用可能種目をフィルタリング（選択済み除外）
  const availableToAdd = availableExercises.filter(
    exercise => !workoutConfig.exercises.includes(exercise)
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 700 },
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* ヘッダー */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="h2">
            ワークアウトカスタマイズ設定
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* スクロール可能コンテンツ */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* プリセットセクション - 折りたたみ式 */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                py: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={handlePresetToggle}
            >
              <Box>
                <Typography variant="subtitle1">プリセット</Typography>
                <Typography variant="body2" color="text.secondary">
                  よく使われる設定から選択
                </Typography>
              </Box>
              <IconButton
                size="small"
                sx={{
                  transform: presetExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>

            <Collapse in={presetExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2 }}>
                {Object.entries(presets).map(([key, preset]) => {
                  const cardioCount =
                    preset.exercises.filter(isCardioExercise).length;
                  const strengthCount = preset.exercises.length - cardioCount;
                  return (
                    <Card
                      key={key}
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        mb: 1,
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50',
                        },
                      }}
                      onClick={() => applyPreset(key)}
                    >
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {preset.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {preset.exercises.join(', ')}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                            mt: 1,
                          }}
                        >
                          {cardioCount > 0 && (
                            <Chip
                              icon={<RunIcon />}
                              label={`カーディオ ${cardioCount}種目`}
                              size="small"
                              color="secondary"
                            />
                          )}
                          {strengthCount > 0 && (
                            <Chip
                              icon={<FitnessCenterIcon />}
                              label={`筋トレ ${strengthCount}種目 (${preset.maxSets}セット)`}
                              size="small"
                              color="primary"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Collapse>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 現在選択中種目セクション */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              現在選択中の種目
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              選択中: {workoutConfig.exercises.length}/5種目
            </Typography>

            <List dense>
              {workoutConfig.exercises.map((exercise, index) => (
                <ListItem key={`${exercise}-${index}`} divider>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    {isCardioExercise(exercise) ? (
                      <RunIcon color="secondary" fontSize="small" />
                    ) : (
                      <FitnessCenterIcon color="primary" fontSize="small" />
                    )}
                  </Box>
                  <ListItemText
                    primary={exercise}
                    secondary={
                      isCardioExercise(exercise)
                        ? 'カーディオ'
                        : `筋トレ (${workoutConfig.maxSets}セット)`
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => removeExercise(exercise)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* セット数変更セクション */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              筋トレ設定
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              筋トレ種目の最大セット数を設定
            </Typography>

            <Box sx={{ px: 2 }}>
              <Typography variant="body2" gutterBottom>
                最大セット数: {workoutConfig.maxSets}
              </Typography>
              <Slider
                value={workoutConfig.maxSets}
                onChange={(event, value) => updateMaxSets(value)}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' },
                ]}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 種目追加セクション */}
          {workoutConfig.exercises.length >= 5 ? (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                📝 種目は最大3つまで選択可能です
              </Typography>
              <Typography variant="body2" color="text.secondary">
                種目を変更したい場合は、現在の種目を削除してください
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                種目追加
              </Typography>
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {availableToAdd.map(exercise => (
                  <ListItem key={exercise} divider>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      {isCardioExercise(exercise) ? (
                        <RunIcon color="secondary" fontSize="small" />
                      ) : (
                        <FitnessCenterIcon color="primary" fontSize="small" />
                      )}
                    </Box>
                    <ListItemText
                      primary={exercise}
                      secondary={
                        isCardioExercise(exercise) ? 'カーディオ' : '筋トレ'
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => addExercise(exercise)}
                        color="primary"
                      >
                        <AddIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {/* フッター */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Button variant="contained" fullWidth onClick={onClose} size="large">
            設定を適用
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default WorkoutCustomizationDrawer;
