import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { formatDistance, formatDuration } from '../utils/formatters';

const WorkoutHistoryTable = ({
  workouts = [],
  workoutConfig,
  loading = false,
  isCardioExercise,
  isStrengthExercise,
}) => {
  const theme = useTheme();
  if (loading) {
    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 256,
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CircularProgress data-testid="loading-spinner" size={32} />
          <Typography variant="body2" color="text.secondary">
            読み込み中...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (workouts.length === 0) {
    return (
      <Box>
        <Box
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: theme.palette.info.light + '20',
            borderRadius: 2,
            m: 3,
          }}
        >
          <Typography
            variant="h6"
            color="info.main"
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            ワークアウト履歴がありません
          </Typography>
          <Typography variant="body2" color="info.main">
            新しいワークアウトを開始しましょう！
          </Typography>
        </Box>
      </Box>
    );
  }

  const getDisplayDescription = () => {
    const cardioExercises = workoutConfig.exercises.filter(ex =>
      isCardioExercise(ex)
    );
    const strengthExercises = workoutConfig.exercises.filter(ex =>
      isStrengthExercise(ex)
    );

    let description = '表示中: ';
    if (cardioExercises.length > 0) {
      description += cardioExercises.join('、') + ' (距離・時間)';
      if (strengthExercises.length > 0) {
        description += '、';
      }
    }
    if (strengthExercises.length > 0) {
      description +=
        strengthExercises.join('、') + ` (${workoutConfig.maxSets}セット)`;
    }

    return description;
  };

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="body1" color="text.secondary">
          {getDisplayDescription()}
        </Typography>
      </Box>

      {/* テーブル */}
      <TableContainer
        sx={{
          width: '100%',
          maxWidth: '1700px',
          margin: '0 auto',
          boxShadow: 3,
        }}
      >
        <Table
          sx={{
            minWidth: 750,
            width: '100%',
          }}
          aria-label="workout history table"
        >
          {/* テーブルヘッダー */}
          <TableHead>
            {/* 第1段階: 種目名のヘッダー */}
            <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  borderRight: `1px solid ${theme.palette.divider}`,
                  minWidth: 100,
                }}
              >
                日付
              </TableCell>
              {workoutConfig.exercises.map(exerciseName => {
                const isCardio = isCardioExercise(exerciseName);
                const colSpan = isCardio ? 2 : workoutConfig.maxSets;

                return (
                  <TableCell
                    key={exerciseName}
                    colSpan={colSpan}
                    align="center"
                    sx={{
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: 'bold',
                      minWidth: isCardio ? 160 : colSpan * 80,
                    }}
                  >
                    {exerciseName}
                    {isCardio && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        (距離・時間)
                      </Typography>
                    )}
                  </TableCell>
                );
              })}

              {/* 合計列のヘッダー */}
              {workoutConfig.displayColumns?.includes('totalReps') && (
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    borderRight: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  合計回数
                </TableCell>
              )}
              {workoutConfig.displayColumns?.includes('totalTime') && (
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  合計時間
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          {/* 第2段階: データセル */}
          <TableHead>
            {/* 第2段階: セット/詳細のヘッダー */}
            <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableCell
                sx={{ borderRight: `1px solid ${theme.palette.divider}` }}
              />
              {workoutConfig.exercises.map(exerciseName => {
                const isCardio = isCardioExercise(exerciseName);
                return (
                  <React.Fragment key={`${exerciseName}-headers`}>
                    {isCardio ? (
                      <>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: '0.75rem',
                            color: theme.palette.text.secondary,
                            borderRight: `1px solid ${theme.palette.divider}`,
                            py: 1,
                          }}
                        >
                          距離(km)
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: '0.75rem',
                            color: theme.palette.text.secondary,
                            borderRight: `1px solid ${theme.palette.divider}`,
                            py: 1,
                          }}
                        >
                          時間(分)
                        </TableCell>
                      </>
                    ) : (
                      Array.from({ length: workoutConfig.maxSets }, (_, i) => (
                        <TableCell
                          key={i}
                          align="center"
                          sx={{
                            fontSize: '0.75rem',
                            color: theme.palette.text.secondary,
                            borderRight: `1px solid ${theme.palette.divider}`,
                            py: 1,
                          }}
                        >
                          {i + 1}セット
                        </TableCell>
                      ))
                    )}
                  </React.Fragment>
                );
              })}

              {/* 合計列の空セル */}
              {workoutConfig.displayColumns?.includes('totalReps') && (
                <TableCell
                  sx={{ borderRight: `1px solid ${theme.palette.divider}` }}
                />
              )}
              {workoutConfig.displayColumns?.includes('totalTime') && (
                <TableCell />
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {workouts.map(workout => (
              <TableRow
                key={workout.date}
                sx={{
                  '&:nth-of-type(odd)': { bgcolor: theme.palette.action.hover },
                  '&:hover': { bgcolor: theme.palette.action.selected },
                }}
              >
                {/* 日付セル */}
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    fontWeight: 'bold',
                    borderRight: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {workout.date}
                </TableCell>

                {/* 種目セル */}
                {workoutConfig.exercises.map(exerciseName => {
                  const exercise = workout.exercises[exerciseName];
                  const isCardio = isCardioExercise(exerciseName);

                  return (
                    <React.Fragment key={`${workout.date}-${exerciseName}`}>
                      {isCardio ? (
                        <>
                          <TableCell
                            align="center"
                            sx={{
                              borderRight: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            {formatDistance(exercise?.distance)}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              borderRight: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            {formatDuration(exercise?.duration)}
                          </TableCell>
                        </>
                      ) : (
                        Array.from(
                          { length: workoutConfig.maxSets },
                          (_, i) => {
                            const setKey = `set${i + 1}`;
                            return (
                              <TableCell
                                key={setKey}
                                align="center"
                                sx={{
                                  borderRight: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                {exercise?.[setKey] || '-'}
                              </TableCell>
                            );
                          }
                        )
                      )}
                    </React.Fragment>
                  );
                })}

                {/* 合計値セル */}
                {workoutConfig.displayColumns?.includes('totalReps') && (
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette.text.primary.main,
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {workout.totalReps}
                  </TableCell>
                )}
                {workoutConfig.displayColumns?.includes('totalTime') && (
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette.secondary.main,
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {workout.totalTime}分
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WorkoutHistoryTable;
