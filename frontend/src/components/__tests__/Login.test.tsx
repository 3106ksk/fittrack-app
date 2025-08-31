
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from '../Login';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../Hook', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);


describe('Login Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockClear();
    mockNavigate.mockClear();
  });

  it('ログインページが正しく表示される', () => {

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '新規アカウント作成' })).toBeInTheDocument();
    
    expect(screen.getByText('FitStarへようこそ')).toBeInTheDocument();
    
    expect(screen.getByTestId('email-field')).toBeInTheDocument();
    expect(screen.getByTestId('password-field')).toBeInTheDocument();
  });

  it('正常な認証情報入力でログインが成功し、ダッシュボードへ遷移する', async () => {
    const user = userEvent.setup();
    
    mockLogin.mockResolvedValueOnce({});

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('⚠️ 必須フィールド未入力でフォーム送信がブロックされる', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });


  it('🔒 認証失敗（401）: 存在しないユーザー', async () => {
    const user = userEvent.setup();

    mockLogin.mockRejectedValueOnce({
      response: { 
        status: 401, 
        data: [{ message: "This user is not found" }]
      },
    });
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    await user.type(emailInput, 'nonexistent@example.com');
    await user.type(passwordInput, 'somepassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('This user is not found')).toBeInTheDocument();
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'nonexistent@example.com',
      password: 'somepassword',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('🔒 認証失敗（401）: パスワード不一致', async () => {
    const user = userEvent.setup();


    mockLogin.mockRejectedValueOnce({
      response: { 
        status: 401, 
        data: [{ message: "Incorrect password" }]
      },
    });
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Incorrect password')).toBeInTheDocument();
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'existing@example.com',
      password: 'wrongpassword',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('🚨 サーバーエラー（500）', async () => {
    const user = userEvent.setup();

    mockLogin.mockRejectedValueOnce({
      response: { 
        status: 500, 
        data: { message: "Internal server error" }
      },
    });
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Internal server error')).toBeInTheDocument();
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('🌐 ネットワークエラー', async () => {
    const user = userEvent.setup();

    mockLogin.mockRejectedValueOnce({
      message: 'Network Error'
    });
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('ネットワークエラーが発生しました。')).toBeInTheDocument();
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('⏳ ローディング状態の管理', async () => {
    const user = userEvent.setup();
    
    mockLogin.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 100))
    );

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeDisabled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});