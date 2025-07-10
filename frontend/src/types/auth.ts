export interface User {
  id: string | number;
  email: string;
  name?: string;
}

// ログイン認証情報
export interface LoginCredentials {
  email: string;
  password: string;
}

// JWT ペイロード
export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  role?: string;
}

// API レスポンス型
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RefreshTokenResponse {
  token: string;
}

// AuthContext の値の型
export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

// AuthContextProvider の Props
export interface AuthContextProviderProps {
  children: React.ReactNode;
}

// エラー型
export interface AuthError {
  code: string;
  message: string;
  status?: number;
}
