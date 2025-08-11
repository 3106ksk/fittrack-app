import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('🌐 API Base URL:', API_BASE_URL); 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      console.warn('JWTトークンが見つかりませんでした。');
    }
    return config;
  },
  error => {
    console.error('リクエストインターセプターエラー:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      console.error(
        '401 Unauthorized - JWTトークンが無効または期限切れです'
      );
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
