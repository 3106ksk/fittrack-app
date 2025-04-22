import { createContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { jwtDecode } from 'jwt-decode';

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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      // バックエンドに実装されているエンドポイント名に合わせて調整
      const res = await axios.post('http://localhost:8000/authrouter/refresh-token');
      const { token } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      return true;
    } catch (error) {
      console.error('トークンの更新エラー:', error);
      logout();
      return false;
    }
  }, [logout]);

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp - currentTime < 600) {
          console.log('トークンの有効期限が近づいています。更新を試みます。');
          refreshToken();
        }
      } catch (error) {
        console.error('トークン検証エラー:', error);
        logout();
      }
    }
  }, [logout, refreshToken]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);
    try {
      // Authorization ヘッダーをログに出力して問題を診断
      console.log('認証ヘッダー:', axios.defaults.headers.common['Authorization']);

      // バックエンドのルートパスを修正
      const res = await axios.get('http://localhost:8000/authrouter/me');
      console.log('ユーザーデータ取得成功:', res.data);
      setUser(res.data);
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error);

      if (error.response) {
        let refreshSuccessful;
        switch (error.response.status) {
          case 401:
            console.error('認証エラー: トークンが無効です');
            break;
          case 403:
            console.error('認証エラー: トークンの期限が切れています');
            // トークン更新を試みる
            refreshSuccessful = await refreshToken();
            if (refreshSuccessful) {
              // トークンが更新されたら再度ユーザー情報を取得
              loadUser();
              return;
            }
            break;
          case 404:
            console.error('エンドポイントエラー: /me が見つかりません');
            break;
          default:
            console.error(`サーバーエラー (${error.response.status}):`, error.response.data);
        }
      } else if (error.request) {
        console.error('サーバー応答なし。接続を確認してください:', error.request);
      } else {
        console.error('リクエスト設定エラー:', error.message);
      }

      // エラーが発生したらトークンをクリア
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    try {
      const res = await axios.post('http://localhost:8000/authrouter/login', credentials);
      const { token, user } = res.data;

      // トークン取得をログに出力
      console.log('ログイン成功! トークン:', token);

      localStorage.setItem('token', token);
      setAuthToken(token);
      setUser(user);
      return user;
    } catch (error) {
      if (error.response) {
        console.error(`ログインエラー (${error.response.status}):`, error.response.data);
      } else if (error.request) {
        console.error('サーバー応答なし:', error.request);
      } else {
        console.error('リクエスト設定エラー:', error.message);
      }

      console.error('スタックトレース:', error.stack);

      throw error;
    }
  };

  // トークン有効期限チェックの定期実行
  useEffect(() => {
    if (user) {
      const intervalId = setInterval(checkTokenExpiration, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user, checkTokenExpiration]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired
}