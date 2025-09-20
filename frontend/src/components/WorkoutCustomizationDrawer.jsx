import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  FitnessCenter as FitnessCenterIcon,
  DirectionsRun as RunIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';

const WorkoutCustomizationDrawer = ({
  open,
  onClose,
  workoutConfig,
  availableExercises,
  isCardioExercise,
  updateExercises,  // FormConfigと同一
  updateMaxSets,     // FormConfigと同一
}) => {
  // ローカル状態管理（FormConfigDrawerと完全同一）
  const [localConfig, setLocalConfig] = useState({
    exercises: workoutConfig.exercises || [],
    maxSets: workoutConfig.maxSets || 3,
  });

  // ドロワーを開いた時の初期化（FormConfigと同一）
  useEffect(() => {
    if (open) {
      setLocalConfig({
        exercises: workoutConfig.exercises,
        maxSets: workoutConfig.maxSets,
      });
    }
  }, [open, workoutConfig.exercises, workoutConfig.maxSets]);

  // 種目トグル（FormConfigと同一パターン）
  const handleToggle = (exercise) => {
    setLocalConfig(currentConfig => {
      const currentIndex = currentConfig.exercises.indexOf(exercise);
      const newExercises = [...currentConfig.exercises];

      if (currentIndex === -1) {
        // 追加
        if (newExercises.length >= 5) {
          alert('種目は最大5つまでです');
          return currentConfig;
        }
        newExercises.push(exercise);
      } else {
        // 削除
        if (newExercises.length <= 1) {
          alert('最低1つの種目が必要です');
          return currentConfig;
        }
        newExercises.splice(currentIndex, 1);
      }

      return {
        ...currentConfig,
        exercises: newExercises
      };
    });
  };

  // セット数変更
  const handleMaxSetsChange = (event, value) => {
    setLocalConfig(prev => ({
      ...prev,
      maxSets: value
    }));
  };

  // 保存（FormConfigと同一）
  const handleSave = () => {
    if (localConfig.exercises.length === 0) {
      alert('最低1つの種目を選択してください');
      return;
    }
    updateExercises(localConfig.exercises);
    updateMaxSets(localConfig.maxSets);
    onClose();
  };

  // キャンセル（FormConfigと同一）
  const handleCancel = () => {
    setLocalConfig({
      exercises: workoutConfig.exercises,
      maxSets: workoutConfig.maxSets
    });
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCancel}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">ワークアウトカスタマイズ設定</Typography>
          <IconButton onClick={handleCancel} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* 現在選択中の種目 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              現在選択中の種目 ({localConfig.exercises.length}/5)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              チェックボックスで種目を選択・解除できます
            </Typography>
          </Box>

          {/* 種目リスト（チェックボックス方式） */}
          <List>
            {availableExercises.map(exercise => {
              const isSelected = localConfig.exercises.includes(exercise);
              const isDisabled = !isSelected && localConfig.exercises.length >= 5;

              return (
                <ListItem
                  key={exercise}
                  onClick={() => !isDisabled && handleToggle(exercise)}
                  sx={{
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                    '&:hover': {
                      backgroundColor: isDisabled ? 'transparent' : 'action.hover',
                    },
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={isSelected}
                    disabled={isDisabled}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemIcon>
                    {isCardioExercise(exercise) ? (
                      <RunIcon color="secondary" fontSize="small" />
                    ) : (
                      <FitnessCenterIcon color="primary" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={exercise}
                    secondary={isCardioExercise(exercise) ? 'カーディオ' : '筋トレ'}
                  />
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ my: 3 }} />

          {/* セット数設定 */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              筋トレ設定
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              筋トレ種目の最大セット数
            </Typography>
            <Box sx={{ px: 2, mt: 2 }}>
              <Typography gutterBottom>
                最大セット数: {localConfig.maxSets}
              </Typography>
              <Slider
                value={localConfig.maxSets}
                min={1}
                max={5}
                marks
                valueLabelDisplay="auto"
                onChange={handleMaxSetsChange}
              />
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="outlined" fullWidth onClick={handleCancel}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            disabled={localConfig.exercises.length === 0}
          >
            設定を適用
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default WorkoutCustomizationDrawer;