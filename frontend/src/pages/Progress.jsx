import { useEffect, useState } from 'react'
import axios from 'axios';


const Progress = () => {
  const [workoutData, setWorkoutData] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8000/workouts")
      .then((response) => {
        const users = response.data;
        setWorkoutData(users);
      })
      .catch((error) => {
        console.error("fething data error::", error);
      });
  }, []);

  return (
    <div className='workoutCotentainer'>
      <div className='conteiner'>
        <div className='workoutList'>
          {workoutData.map((workout) => {
            return (
              <div className='workoutItem' key={workout.id}>
                <div className='createdDate'>
                  <span className='value'>{workout.date}</span>
                </div>
                <div className='workoutDeatails'>
                  <span className='label'>トレーニング名: </span>
                  <span className='value'>{workout.exercise}</span>
                </div>
                <div className='workoutDeatails'>
                  <span className='label'>セット数: </span>
                  <span className='value'>{workout.sets}</span>
                </div>
                <div className='workoutDeatails'>
                  <span className='label'>回数: </span>
                  <span className='value'>{workout.reps}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default Progress