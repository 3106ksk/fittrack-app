
import {
  Box,
  Card,
  Chip,
  Grid,
  Typography
} from '@mui/material';

const StatCard = ({
  title,
  value,
  unit,
  changeRate,
  icon: Icon,
  lastValue,
  color,
  gridSize = {xs:6, sm:3}
}) => {
  const isPositive = changeRate >= 0;




  return (
    <Grid item {...gridSize}>
      <Card 
        elevation={2} 
        sx={{ 
          borderRadius: 2, 
          textAlign: 'center', 
          p: 2,
          height: '100%',  // 統一された高さ
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        {/* アイコンエリア */}
        <Box sx={{ color: `${color}.main`, mb: 1 }}>
          <Icon sx={{ fontSize: 40 }} />
        </Box>

        {/* 値表示エリア */}
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          color={`${color}.main`}
          component="div"
        >
          {value}{unit}
        </Typography>

        {/* タイトルエリア */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>

        {/* 前月比較チップ */}
        <Box sx={{ mt: 1 }}>
          <Chip 
            label={
              changeRate !== undefined 
                ? `先月より ${isPositive ? '+' : ''}${changeRate}%`
                : `先月 ${lastValue}${unit}`
            }
            size="small" 
            color={
              changeRate !== undefined 
                ? (isPositive ? 'success' : 'error')
                : 'default'
            }
            sx={{ 
              fontSize: '0.7rem',
              height: 24,  // 統一された高さ
            }}
          />
        </Box>
      </Card>
    </Grid>
  );
};
export default StatCard;
