import {
  Close as CloseIcon,
  FitnessCenter as FitnessCenterIcon,
  DirectionsRun as RunIcon,
} from '@mui/icons-material';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Slider,

} from '@mui/material';
import { useEffect, useState } from 'react';

const FormConfigDrawer = ({
  open,
  onClose,
  workoutConfig,
  availableExercises,
  isCardioExercise,
  updateExercises,
  updateMaxSets,
  onConfigSave,
}) => {

  const [localConfig, setLocalConfig] = useState({
    exercises: workoutConfig.exercises || [],
    maxSets: workoutConfig.maxSets || 5,
  });

  useEffect(() => {
    if (open) {
      setLocalConfig({
        exercises: workoutConfig.exercises,
        maxSets: workoutConfig.maxSets,
      });
    }
  }, [open, workoutConfig.exercises, workoutConfig.maxSets]);

  const handleToggle = exercise => {
    setLocalConfig(currentConfig => {
      const currentIndex = currentConfig.exercises.indexOf(exercise);
      const newExercises = [...currentConfig.exercises];

      if (currentIndex === -1) {
        newExercises.push(exercise);
      } else {
        newExercises.splice(currentIndex, 1);
      }

      return {
        ...currentConfig,
        exercises: newExercises
      };
    });
  };

  const handleSave = () => {
    if (localConfig.exercises.length === 0) {
      alert('最低1つの種目を選択してください');
      return;
    }

    // 設定が実際に変更されたか確認
    const hasExerciseChanged =
      JSON.stringify(localConfig.exercises) !==
      JSON.stringify(workoutConfig.exercises);
    const hasMaxSetsChanged = localConfig.maxSets !== workoutConfig.maxSets;

    if (hasExerciseChanged || hasMaxSetsChanged) {
      // 変更がある場合のみ確認ダイアログを表示
      if (window.confirm('設定を変更すると、入力中のフォームがリセットされます。続行しますか？')) {
        updateExercises(localConfig.exercises);
        updateMaxSets(localConfig.maxSets);

        // 親コンポーネントに設定変更を通知
        if (onConfigSave) {
          onConfigSave();
        }

        onClose();
      }
    } else {
      // 変更がない場合はそのまま閉じる
      onClose();
    }
  };

  const handleMaxSetsChange = (event, value) => {
    // 最大セット数を更新
    setLocalConfig(prev => ({
      ...prev,
      maxSets: value,
    }));
  };

  const handleCancel = () => {
    // ローカル設定を元の設定にリセット
    setLocalConfig({
      exercises: workoutConfig.exercises,
      maxSets: workoutConfig.maxSets,
    });

    // ドロワーを閉じる
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
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">フォーム表示設定</Typography>
          <IconButton onClick={handleCancel} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ px: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ワークアウトフォームに表示する種目を選択してください。
            選択した種目のみが入力フォームに表示されます。
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            選択中: {localConfig.exercises.length}種目 / 最大10種目
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
          <List dense>
            {availableExercises.map(exercise => (
              <ListItem
                key={exercise}
                divider
                onClick={() => handleToggle(exercise)}
                sx={{ cursor: 'pointer' }}
              >
                <Checkbox
                  edge="start"
                  checked={localConfig.exercises.includes(exercise)}
                  tabIndex={-1}
                  disableRipple
                />
                <Box sx={{ mx: 1 }}>
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
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            筋トレ設定
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            筋トレ種目の最大セット数を設定
          </Typography>

          <Box sx={{ px: 2 }}>
            <Typography variant="body2" gutterBottom>
              最大セット数: {localConfig.maxSets}
            </Typography>
            <Slider
              value={localConfig.maxSets}
              onChange={handleMaxSetsChange}
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

        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleCancel} fullWidth>
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            fullWidth
            disabled={localConfig.exercises.length === 0}
          >
            保存
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FormConfigDrawer;
