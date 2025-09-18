import { Box, IconButton, Typography } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

// 日本語ロケールを設定
dayjs.locale('ja');

const MonthSelector = ({ currentMonth, onMonthChange }) => {
  const current = dayjs(currentMonth);
  const now = dayjs();

  // 前月へ移動
  const handlePreviousMonth = () => {
    const previousMonth = current.subtract(1, 'month').toDate();
    onMonthChange(previousMonth);
  };

  // 次月へ移動
  const handleNextMonth = () => {
    const nextMonth = current.add(1, 'month').toDate();
    onMonthChange(nextMonth);
  };

  // 未来の月は選択不可
  const isNextDisabled = current.year() >= now.year() &&
                         current.month() >= now.month();

  // 月の表示フォーマット（例: "2025年1月"）
  const monthDisplay = current.format('YYYY年M月');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        my: 2,
      }}
    >
      <IconButton
        onClick={handlePreviousMonth}
        aria-label="前月へ"
        sx={{
          border: 1,
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <Typography
        variant="h6"
        component="h2"
        sx={{
          minWidth: 120,
          textAlign: 'center',
          fontWeight: 600,
        }}
      >
        {monthDisplay}
      </Typography>

      <IconButton
        onClick={handleNextMonth}
        disabled={isNextDisabled}
        aria-label="次月へ"
        sx={{
          border: 1,
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          '&.Mui-disabled': {
            borderColor: 'action.disabledBackground',
          },
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

export default MonthSelector;