import { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'



export const AuthContext = createContext(null)

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const res = await axios.get('http://localhost:8000/authrouter/me');
          setUser(res.data);
        } catch (error) {
          console.error('ユーザーの読み込みエラー:', error);
          localStorage.removeItem('token');
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await axios.post('http://localhost:8000/authrouter/login', credentials);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      setUser(user);
      return user;
    } catch (error) {
      if (error.response) {
        console.error(`サーバーエラー (${error.response.status}):`, error.response.data);
      } else if (error.request) {
        console.error('サーバー応答なし:', error.request);
      } else {
        console.error('リクエスト設定エラー:', error.message);
      }

      console.error('スタックトレース:', error.stack);

      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>

  )
}

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired
}