import {
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { memo } from 'react';
import { Controller } from 'react-hook-form';
import {
  DISTANCE_OPTIONS,
  DURATION_OPTIONS,
  REPS_OPTIONS
} from './constants';

const ExerciseCard = ({
  exercise,
  isCardio,
  control,
  errors,
  maxSets
}) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {exercise}
          <Chip
            label={isCardio ? 'カーディオ' : '筋トレ'}
            size="small"
            color={isCardio ? 'primary' : 'secondary'}
            sx={{ ml: 1 }}
          />
        </Typography>

        {isCardio ? (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name={`${exercise}_distance`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="距離 (km)"
                    select
                    fullWidth
                    error={!!errors[`${exercise}_distance`]}
                    helperText={errors[`${exercise}_distance`]?.message}
                  >
                    {DISTANCE_OPTIONS.map(distance => (
                      <MenuItem key={distance} value={distance}>
                        {distance} km
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name={`${exercise}_duration`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="時間 (分)"
                    select
                    fullWidth
                    error={!!errors[`${exercise}_duration`]}
                    helperText={errors[`${exercise}_duration`]?.message}
                  >
                    {DURATION_OPTIONS.map(duration => (
                      <MenuItem key={duration} value={duration}>
                        {duration} 分
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {Array.from({ length: maxSets }, (_, i) => (
              <Grid item xs={12 / maxSets} key={i}>
                <Controller
                  name={`${exercise}_set${i + 1}`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={`${i + 1}セット目`}
                      select
                      fullWidth
                      error={!!errors[`${exercise}_set${i + 1}`]}
                      helperText={errors[`${exercise}_set${i + 1}`]?.message}
                    >
                      {REPS_OPTIONS.map(reps => (
                        <MenuItem key={reps} value={reps}>
                          {reps} 回
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(ExerciseCard);