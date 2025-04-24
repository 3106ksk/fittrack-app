import { useState, useEffect } from 'react';
import axios from 'axios';
const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/workouts')
      .then(res => setWorkouts(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>トレーニング履歴</h1>
      {loading && <p>ローディング中...</p>}
      {error && <p>エラーが発生しました: {error.message}</p>}
      {!loading && !error && (
        <ul className='workout-list'>
          {workouts.map(workout => (
            <li key={workout.id}>
              <h2>{workout.date}</h2>
              <p>{workout.exercise}</p>
              <p>{workout.exerciseType}</p>
              <p>{workout.intensity}</p>
              {workout.isCardio && (
                <>
                  <p>距離: {workout.distance}km</p>
                  <p>時間: {workout.duration}分</p>
                </>
              )}

            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default WorkoutHistory