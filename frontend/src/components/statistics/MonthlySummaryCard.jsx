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
          typeof changeRate === 'number' && (
            <Chip
              size="small"
              color={isPositive ? 'success' : 'error'}
              label={`${isPositive ? '↑' : '↓'} ${Math.abs(changeRate)}%`}
              sx={{
                fontSize: '0.75rem',
                height: 26,
                fontWeight: 600,
                minWidth: 65
              }}
            />
          )
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
            <Box display="flex" alignItems="center" gap={2}>
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

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.9rem' }}
              >
                ｜
              </Typography>

              <Box display="flex" alignItems="baseline" gap={0.5}>
                <Typography variant="body2" color="text.secondary">
                  先月:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: 'text.secondary' }}
                >
                  {lastValue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {unit}
                </Typography>
              </Box>
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
        title="月間統計サマリー"
        subheader="今月と先月の実績比較"
        sx={{
          pb: 0.5,
          background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
          '& .MuiCardHeader-title': {
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'primary.dark'
          },
          '& .MuiCardHeader-subheader': {
            fontSize: '0.85rem',
            mt: 0.5
          }
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
