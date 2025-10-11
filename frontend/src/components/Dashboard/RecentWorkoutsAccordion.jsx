import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
  formatWorkoutDetails,
  groupByDate,
  hasMultipleWorkoutsOnSameDay,
} from '../../services/workoutGrouping';

/**
 * RecentWorkoutsAccordion コンポーネント
 *
 * ダッシュボードで直近10件のワークアウトを日付グループ化して表示する。
 *
 * @param {Object} props
 * @param {Array} props.workouts - ワークアウトデータの配列
 * @returns {JSX.Element}
 */
const RecentWorkoutsAccordion = ({ workouts }) => {
  // useMemo でパフォーマンス最適化
  // workouts配列が変更されない限り、日付グループ化処理を再実行しない
  const groupedWorkouts = useMemo(() => {
    return groupByDate(workouts);
  }, [workouts]);

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>直近のログを見る（10件）</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {Object.keys(groupedWorkouts).length === 0 ? (
          <Typography color="textSecondary">
            まだワークアウト記録がありません
          </Typography>
        ) : (
          Object.entries(groupedWorkouts).map(([date, dateWorkouts]) => (
            <Box key={date} mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                {date}
              </Typography>
              <List>
                {dateWorkouts.map(workout => (
                  <ListItem key={workout.id} disableGutters>
                    {/* 同日複数回の場合、時刻表示 */}
                    {hasMultipleWorkoutsOnSameDay(dateWorkouts) && (
                      <Typography variant="body2" color="textSecondary" mr={1}>
                        [{dayjs(workout.createdAt).format('HH:mm')}]
                      </Typography>
                    )}
                    <Typography>
                      {workout.exerciseType === 'cardio' ? '🏃' : '💪'}{' '}
                      {workout.exercise} {formatWorkoutDetails(workout)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default RecentWorkoutsAccordion;
