import { Box, Container } from '@mui/material';
import { useEffect } from 'react';
import WorkoutForm from '../components/WorkoutForm';

const WorkoutFormPage = () => {
  useEffect(() => {
    document.title = 'ワークアウト記録 - FitTrack';
    return () => {
      document.title = 'FitTrack';
    };
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <WorkoutForm />
      </Box>
    </Container>
  );
};

export default WorkoutFormPage;
