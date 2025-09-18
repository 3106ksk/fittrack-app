import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Divider
} from '@mui/material';

const ListRowSkeleton = () => (
  <>
    <Box display="flex" alignItems="center" py={1.25} px={2}>
      <Skeleton
        variant="circular"
        width={40}
        height={40}
        sx={{ mr: 2 }}
      />
      <Box flex={1}>
        <Skeleton variant="text" width="40%" height={24} />
        <Skeleton variant="text" width="25%" height={32} />
      </Box>
      <Skeleton variant="rounded" width={90} height={24} />
    </Box>
    <Divider />
  </>
);

const StatisticsLoading = ({ variant = 'cards' }) => {
  // 新: シングルカード表示
  if (variant === 'single') {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Skeleton
                variant="text"
                width="30%"
                height={30}
                sx={{ mb: 0.5 }}
              />
              <Skeleton
                variant="text"
                width="45%"
                height={20}
                sx={{ mb: 1.5 }}
              />
              <Divider />
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // 既存: 3枚カード表示（後方互換性）
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
