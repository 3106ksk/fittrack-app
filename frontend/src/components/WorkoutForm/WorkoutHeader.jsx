import { Settings as SettingsIcon } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import { memo } from 'react';

const WorkoutHeader = ({
  workoutConfig,
  isCardioExercise,
  onOpenDrawer
}) => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          ワークアウト記録
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          設定中の種目:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {workoutConfig.exercises.map(exercise => (
            <Chip
              key={exercise}
              label={exercise}
              color={isCardioExercise(exercise) ? 'primary' : 'secondary'}
              variant="outlined"
            />
          ))}
        </Box>
        <IconButton
          onClick={onOpenDrawer}
          color="primary"
          sx={{ ml: 2 }}
          title="表示種目を設定"
        >
          <SettingsIcon />
          入力フォーム変更
        </IconButton>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: 'block' }}
        >
          設定アイコンから表示種目を変更できます
        </Typography>
      </Box>
    </>
  );
};

export default memo(WorkoutHeader);