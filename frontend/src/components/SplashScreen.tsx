import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, LinearProgress } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useAuth } from './Hook';

const SplashScreen = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#F8FAF8',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        animation: 'fadeIn 0.5s ease-in',
      }}
    >
      <FitnessCenterIcon 
        sx={{ 
          fontSize: 80, 
          color: 'primary.main',
          mb: 2 
        }} 
      />
      <Typography 
        variant="h4" 
        component="h1"
        sx={{ mb: 4 }}
      >
        FitStart
      </Typography>
      <LinearProgress 
        sx={{ 
          width: 200,
          height: 4,
          borderRadius: 2
        }} 
      />
    </Box>
  );
};

export default SplashScreen;