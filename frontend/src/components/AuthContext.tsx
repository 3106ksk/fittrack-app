import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useState } from 'react';

import { AxiosError, AxiosResponse } from 'axios';
import {
  AuthContextProviderProps,
  AuthContextValue,
  JwtPayload,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  User,
} from '../types/auth';

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthContextProvider = ({
  children,
}: AuthContextProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setAuthToken = (token: string | null): void => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const logout = useCallback((): void => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const res: AxiosResponse<RefreshTokenResponse> = await axios.post(
        'http://localhost:8000/authrouter/refresh-token'
      );
      const { token } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      return true;
    } catch (error: unknown) {
      console.error('トークンの更新エラー:', error);
      if (error instanceof AxiosError && error.response) {
        switch (error.response.status) {
          case 401:
            console.error('認証エラー: トークンが無効です');
            break;
          case 403:
            console.error('認証エラー: トークンの期限が切れています');
            break;
          case 500:
            console.error(
              'サーバーエラー: サーバーが予期せぬエラーを返しました'
            );
            break;
          default:
            console.error(
              `トークン更新エラー (${error.response.status}):`,
              error.response.data
            );
        }
      } else if (error instanceof AxiosError && error.request) {
        console.error('サーバー応答なし:', error.request);
      } else if (error instanceof Error) {
        console.error('リクエスト設定エラー:', error.message);
      } else {
        console.error('未知のエラー:', error);
      }
      logout();
      return false;
    }
  }, [logout]);

  const checkTokenExpiration = useCallback((): void => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp - currentTime < 600) {
          console.log('トークンの有効期限が近づいています。更新を試みます。');
          refreshToken();
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('トークン検証エラー:', error.message);
        } else {
          console.error('未知のエラー:', error);
        }
        logout();
      }
    }
  }, [logout, refreshToken]);

  const loadUser = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    try {
      const res: AxiosResponse<User> = await axios.get(
        'http://localhost:8000/authrouter/me'
      );
      console.log('ユーザーデータ取得成功:', res.data);
      setUser(res.data);
    } catch (error: unknown) {
      console.error('ユーザーデータ取得エラー:', error);

      if (error instanceof AxiosError && error.response) {
        let refreshSuccessful: boolean;
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
            console.error(
              `サーバーエラー (${error.response.status}):`,
              error.response.data
            );
        }
      } else if (error instanceof AxiosError && error.request) {
        console.error(
          'サーバー応答なし。接続を確認してください:',
          error.request
        );
      } else if (error instanceof Error) {
        console.error('リクエスト設定エラー:', error.message);
      } else {
        console.error('未知のエラー:', error);
      }
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

  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      const res: AxiosResponse<LoginResponse> = await axios.post(
        'http://localhost:8000/authrouter/login',
        credentials
      );
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      setUser(user);
      return user;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        switch (error.response.status) {
          case 401:
            console.error('認証エラー: ユーザー名またはパスワードが無効です');
            break;
          case 404:
            console.error('エンドポイントエラー: /login が見つかりません');
            break;
          case 500:
            console.error(
              'サーバーエラー: サーバーが予期せぬエラーを返しました'
            );
            break;
          default:
            console.error(
              `ログインエラー (${error.response.status}):`,
              error.response.data
            );
        }
      } else if (error instanceof AxiosError && error.request) {
        console.error('サーバー応答なし:', error.request);
      } else if (error instanceof Error) {
        console.error('リクエスト設定エラー:', error.message);
      } else {
        console.error('未知のエラー:', error);
      }
      throw error;
    }
  };

  // トークン有効期限チェックの定期実行
  useEffect((): (() => void) | undefined => {
    if (user) {
      const intervalId = setInterval(checkTokenExpiration, 60000);
      return () => clearInterval(intervalId);
    }
    return undefined;
  }, [user, checkTokenExpiration]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
