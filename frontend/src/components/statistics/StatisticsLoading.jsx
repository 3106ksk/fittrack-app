import { Box, Card, CardContent, Grid, Skeleton } from '@mui/material';

const StatisticsLoading = () => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3].map(i => (
        <Grid item xs={12} md={4} key={i}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Skeleton
                  variant="circular"
                  width={48}
                  height={48}
                  sx={{ mr: 2 }}
                />
                <Box flex={1}>
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={40}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width="80%" height={20} />
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="rounded" width={60} height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatisticsLoading;
