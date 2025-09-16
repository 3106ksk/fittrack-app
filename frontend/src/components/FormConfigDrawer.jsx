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
} from '@mui/material';
import { useEffect, useState } from 'react';

const FormConfigDrawer = ({
  open,
  onClose,
  workoutConfig,
  availableExercises,
  isCardioExercise,
  updateExercises,
}) => {
  const [selectedExercises, setSelectedExercises] = useState(
    workoutConfig.exercises
  );

  // 設定が変更されたら選択状態を更新
  useEffect(() => {
    setSelectedExercises(workoutConfig.exercises);
  }, [workoutConfig.exercises]);

  const handleToggle = exercise => {
    const currentIndex = selectedExercises.indexOf(exercise);
    const newSelected = [...selectedExercises];

    if (currentIndex === -1) {
      newSelected.push(exercise);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedExercises(newSelected);
  };

  const handleSave = () => {
    if (selectedExercises.length === 0) {
      alert('最低1つの種目を選択してください');
      return;
    }
    updateExercises(selectedExercises);
    onClose();
  };

  const handleCancel = () => {
    // キャンセル時は元の設定に戻す
    setSelectedExercises(workoutConfig.exercises);
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
        {/* ヘッダー */}
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

        {/* 説明文 */}
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
            選択中: {selectedExercises.length}種目 / 最大10種目
          </Typography>
        </Box>

        {/* 種目リスト */}
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
                  checked={selectedExercises.includes(exercise)}
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

        <Divider sx={{ my: 2 }} />

        {/* アクションボタン */}
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleCancel} fullWidth>
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            fullWidth
            disabled={selectedExercises.length === 0}
          >
            保存
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FormConfigDrawer;
