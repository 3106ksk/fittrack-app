import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const StatCard = ({
  title,
  value,
  unit,
  changeRate,
  icon: Icon,
  lastValue,
  color,
}) => {
  const isPositive = changeRate >= 0;
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        elevation={2}
        sx={{
          height: '100%',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3,
          },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                bgcolor: `${color}.main`,
                mr: 2,
                width: 48,
                height: 48,
              }}
            >
              <Icon />
            </Avatar>
            <Box flex={1}>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color="text.primary"
              >
                {value}
                {unit}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {title}
              </Typography>
            </Box>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" color="text.secondary">
              先月 {lastValue}
              {unit}
            </Typography>
            <Chip
              icon={<TrendIcon />}
              label={`${isPositive ? '+' : ''}${changeRate}%`}
              color={isPositive ? 'success' : 'error'}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};
export default StatCard;
