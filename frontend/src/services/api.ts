import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター: 全てのリクエストにJWTトークンを自動追加
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        '🔐 JWT Token added to request:',
        `Bearer ${token.substring(0, 20)}...`
      );
    } else {
      console.warn('⚠️ No JWT token found in localStorage');
    }
    return config;
  },
  error => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター: 401エラーの処理
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      console.error(
        '🚫 401 Unauthorized - JWT token may be invalid or expired'
      );
      // トークンが無効な場合は削除
      localStorage.removeItem('token');
      // ログインページにリダイレクト（必要に応じて）
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
