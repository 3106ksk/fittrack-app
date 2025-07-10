import calculateWorkoutStats from '../../services/StatisticsService';
import StatCard from './StatCard';
import StatisticsLoading from './StatisticsLoading';
import { Grid } from '@mui/material';

import {
  CalendarToday as CalendarIcon,
  FitnessCenter as FitnessIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

const WorkoutStatistics = ({ workouts, loading }) => {
  const stats = calculateWorkoutStats(workouts);

  if (loading) {
    return <StatisticsLoading />;
  }

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <StatCard
        title="総ワークアウト日数"
        value={stats.currentTotalDays}
        unit="日"
        icon={CalendarIcon}
        change={stats.daysChangeRate}
        lastValue={stats.lastTotalDays}
        color="primary"
      />
      <StatCard
        title="総回数"
        value={stats.currentTotalReps}
        unit="回"
        icon={FitnessIcon}
        change={stats.repsChangeRate}
        lastValue={stats.lastTotalReps}
        color="success"
      />
      <StatCard
        title="総時間"
        value={stats.currentTotalTime}
        unit="分"
        icon={TimerIcon}
        change={stats.timeChangeRate}
        lastValue={stats.lastTotalTime}
        color="info"
      />
    </Grid>
  );
};

export default WorkoutStatistics;
