import {
  Alert,
  Button,
  CircularProgress,
  Collapse,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import WorkoutStatistics from '../components/statistics/WorkoutStatistics';


const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/workouts', {
          signal: controller.signal
        });
        setWorkouts(response.data);
        setLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('ワークアウト履歴の取得がキャンセルされました');
          return;
        }
        setError(error);
        setLoading(false);
      }
    };
    fetchWorkouts();
    return () => controller.abort();
  }, []);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        トレーニング履歴
      </Typography>

      <WorkoutStatistics workouts={workouts} loading={loading} />
      
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error.message}</Alert>}

      {workouts.length > 0 && (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>日付</TableCell>
                <TableCell>種目</TableCell>
                <TableCell>セット／距離</TableCell>
                <TableCell>時間</TableCell>
                <TableCell>強度</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workouts.map(workout => (
                <React.Fragment key={workout.id}>
                  <TableRow>
                    <TableCell>{workout.date}</TableCell>
                    <TableCell>{workout.exercise}</TableCell>
                    <TableCell>
                      {workout.isCardio
                        ? `${workout.distance} km`
                        : (
                          <Button size="small" onClick={() => toggle(workout.id)}>
                            {workout.sets} セット
                          </Button>
                        )
                      }
                    </TableCell>
                    <TableCell>
                      {workout.isCardio ? `${workout.duration} 分` : '-'}
                    </TableCell>
                    <TableCell>{workout.intensity}</TableCell>
                  </TableRow>

                  {!workout.isCardio && openId === workout.id && (
                    <TableRow key={`${workout.id}-detail`}>
                      <TableCell colSpan={5} sx={{ py: 0, border: 0 }}>
                        <Collapse in>
                          <ul style={{ margin: 8, paddingLeft: 16 }}>
                            {workout.repsDetail.map(reps =>
                              <li key={reps.setNumber}>
                                {reps.setNumber}セット目
                                {reps.reps}回
                              </li>
                            )}
                          </ul>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!loading && !error && workouts.length === 0 && (
        <Alert severity="info">
          トレーニング履歴がありません
        </Alert>
      )}
    </Container>

  )
}

export default WorkoutHistory