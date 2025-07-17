import { Grid } from '@mui/material';
import calculateWorkoutStats from '../../services/StatisticsService';
import StatCard from './StatCard';
import StatisticsLoading from './StatisticsLoading';

import {
  CalendarToday as CalendarIcon,
  FitnessCenter as FitnessIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

const WorkoutStatistics = ({ workouts, loading }) => {
  const stats = calculateWorkoutStats(workouts);

  if (loading) {
    return <StatisticsLoading />;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <StatCard
          title="総ワークアウト日数"
          value={stats.currentTotalDays}
          unit="日"
          icon={CalendarIcon}
        change={stats.daysChangeRate}
        lastValue={stats.lastTotalDays}
        color="primary"
        gridSize={{xs:6,sm:3}}
      />
      <StatCard
        title="総回数"
        value={stats.currentTotalReps}
        unit="回"
        icon={FitnessIcon}
        change={stats.repsChangeRate}
        lastValue={stats.lastTotalReps}
        color="success"
        gridSize={{xs:6,sm:3}}
      />
      <StatCard
        title="総時間"
        value={stats.currentTotalTime}
        unit="分"
        icon={TimerIcon}
        change={stats.timeChangeRate}
        lastValue={stats.lastTotalTime}
        color="info"
        gridSize={{xs:6,sm:3}}
      />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default WorkoutStatistics;
