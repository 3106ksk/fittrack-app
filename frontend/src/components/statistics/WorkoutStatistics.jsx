import { Grid, Box } from '@mui/material';
import { useState } from 'react';
import { calculateMonthlyStats } from '../../services/StatisticsService';
import StatisticsLoading from './StatisticsLoading';
import MonthlySummaryCard from './MonthlySummaryCard';
import MonthSelector from './MonthSelector';

const WorkoutStatistics = ({ workouts, loading }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // 月別統計計算（MVP実装）
  const stats = calculateMonthlyStats(workouts, selectedMonth);

  if (loading) {
    return <StatisticsLoading variant="single" />;
  }

  return (
    <Box>
      {/* 月選択UI */}
      <MonthSelector
        currentMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* サマリーカード */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={6}>
          <MonthlySummaryCard stats={stats} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkoutStatistics;
