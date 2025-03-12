import { useForm } from 'react-hook-form'
import axios from 'axios';


const WorkoutForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    axios.post("http://localhost:8000/workouts", data)
      .then(() => {
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };


  return (
    <form className='formContainer' onSubmit={handleSubmit(onSubmit)}>
      <div className='fitName'>
        <input
          id='fitname'
          type='text'
          placeholder='トレーニング名を入力'
          {...register("fitname", { required: "トレーニング名を入力してください" })}
        />
        {errors.fitname && <p>{errors.fitname.message}</p>}
      </div>

      <div className='setNumber'>
        <input
          id='setNumber'
          type='number'
          placeholder='セット数を入力'
          {...register("setNumber", { min: 1, max: 99, required: "セット数を入力してください" })}
        />
        <span>set</span>
        {errors.setNumber && <p>{errors.setNumber.message}</p>}
      </div>

      <div className='repsNumber'>
        <input
          id='repsNumber'
          type='number'
          placeholder='回数を入力'
          {...register("repsNumber", { required: "回数を入力してください" })}
        />
        <span>回</span>
      </div>
      <div>
        <button type='submit'>送信</button>
      </div>
    </form>
  )
}

export default WorkoutForm