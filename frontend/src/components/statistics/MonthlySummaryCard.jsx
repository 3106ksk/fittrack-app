import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  FitnessCenter as FitnessIcon,
  DirectionsRun as RunIcon
} from '@mui/icons-material';

const Row = ({
  icon: Icon,
  label,
  value,
  unit,
  lastValue,
  changeRate,
  highlight = 'primary',
}) => {
  const isPositive = typeof changeRate === 'number' ? changeRate >= 0 : null;

  return (
    <>
      <ListItem
        sx={{
          px: 2,
          py: 1.25,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        disableGutters
        secondaryAction={
          <Chip
            size="small"
            color={
              typeof changeRate === 'number'
                ? isPositive
                  ? 'success'
                  : 'error'
                : 'default'
            }
            label={
              typeof changeRate === 'number'
                ? `先月より ${isPositive ? '+' : ''}${changeRate}%`
                : `先月 ${lastValue}${unit}`
            }
            sx={{ fontSize: '0.72rem', height: 24 }}
          />
        }
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: `${highlight}.light`,
              color: `${highlight}.main`,
              width: 40,
              height: 40,
            }}
          >
            <Icon fontSize="small" />
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
          }
          secondary={
            <Box display="flex" alignItems="baseline" gap={0.5}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: `${highlight}.main` }}
              >
                {value.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unit}
              </Typography>
            </Box>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};

const MonthlySummaryCard = ({ stats }) => {
  // データ形式の調整（StatisticsServiceとの整合性）
  const data = {
    days: {
      current: stats?.currentTotalDays || 0,
      last: stats?.lastTotalDays || 0,
      changeRate: stats?.daysChangeRate,
    },
    reps: {
      current: stats?.currentTotalReps || 0,
      last: stats?.lastTotalReps || 0,
      changeRate: stats?.repsChangeRate,
    },
    distance: {
      current: stats?.currentTotalDistance || 0,
      last: stats?.lastTotalDistance || 0,
      changeRate: stats?.distanceChangeRate,
    },
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 6
        },
      }}
    >
      <CardHeader
        title="今月のレコード"
        subheader="この月の合計値と先月比"
        sx={{
          pb: 0.5,
          '& .MuiCardHeader-title': {
            fontWeight: 800,
            fontSize: '1.1rem'
          },
        }}
      />
      <CardContent sx={{ pt: 0, pb: 0 }}>
        <List sx={{ py: 0 }}>
          <Divider />
          <Row
            icon={CalendarIcon}
            label="総ワークアウト日数"
            value={data.days.current}
            unit="日"
            lastValue={data.days.last}
            changeRate={data.days.changeRate}
            highlight="primary"
          />
          <Row
            icon={FitnessIcon}
            label="総回数"
            value={data.reps.current}
            unit="回"
            lastValue={data.reps.last}
            changeRate={data.reps.changeRate}
            highlight="success"
          />
          <Row
            icon={RunIcon}
            label="総距離"
            value={data.distance.current}
            unit="km"
            lastValue={data.distance.last}
            changeRate={data.distance.changeRate}
            highlight="info"
          />
        </List>
      </CardContent>
    </Card>
  );
};

export default MonthlySummaryCard;
