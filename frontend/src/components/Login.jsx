
import { useForm } from 'react-hook-form'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:8000/authrouter/login', data);
      console.log('ログイン成功', response.data);
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.response.status === 400) {
          setErrorMessage('入力内容に問題があります。');
        }
      }
      console.error('ログインエラー', error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input type="text" placeholder="Email" {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: '有効なメールアドレスを入力してください',
          },
        })} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <input type="password" placeholder="Password" {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'パスワードは8文字以上で入力してください',
          },
        })} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <button type="submit">ログイン</button>
      {errorMessage && <p className='error-message'>{errorMessage}</p>}
    </form>
  )
}
export default Login