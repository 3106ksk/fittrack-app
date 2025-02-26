
import { useForm } from 'react-hook-form'


const SignupForm = () => {

  const {
    register,
    handleSubmit,
    // formState: { errors },
  } = useForm();

  const onSubmit = (data) => console.log(data);


  return (
    <div className='signupForm'>
      <h1>ユーザー登録</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor='email'>Email</label>
          <input id="email" {...register('email')} />
        </div>

        <div>
          <label htmlFor='password'>Password</label>
          <input id="password" {...register('password')} type='password' />
        </div>
        <button type='submit'>アカウント作成</button>
      </form>

    </div>
  )
}

export default SignupForm