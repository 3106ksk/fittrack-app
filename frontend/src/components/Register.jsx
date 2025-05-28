import { useForm } from 'react-hook-form'
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Register = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post('http://localhost:8000/authrouter/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.response.status === 400) {
          setErrorMessage('入力内容に問題があります。');
        } else if (error.response.status === 404) {
          setErrorMessage('リソースが見つかりません。');
        } else if (error.response.status >= 500) {
          setErrorMessage('サーバーエラーが発生しました。後でもう一度お試しください。');
        }
      } else if (error.request) {
        setErrorMessage('サーバーに接続できません。インターネット接続を確認してください。');
      } else {
        setErrorMessage('予期しないエラーが発生しました。');
      }
    }
  }


  return (
    <div className='signupForm'>
      <h1>ユーザー登録</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor='username'>Username</label>
          <input id="username" {...register('username', {
            required: 'ユーザー名は必須です',
            minLength: {
              value: 3,
              message: 'ユーザー名は3文字以上で入力してください',
            },
          })} />
          {errors.username && <p>{errors.username.message}</p>}
        </div>
        <div>
          <label htmlFor='email'>Email</label>
          <input id="email" {...register('email', {
            required: 'メールアドレスは必須です',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: '有効なメールアドレスを入力してください',
            },
          })} />
          {errors.email && <p>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor='password'>Password</label>
          <input id="password" {...register('password', {
            required: 'パスワードは必須です',
            minLength: {
              value: 8,
              message: 'パスワードは8文字以上で入力してください',
            },
          })} type='password' />
          {errors.password && <p>{errors.password.message}</p>}
        </div>
        <button type='submit'>アカウント作成</button>
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
      </form>

    </div>
  )
}


export default Register