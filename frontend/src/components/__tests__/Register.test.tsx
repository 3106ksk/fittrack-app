import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../services/api';
import Register from '../Register';

vi.mock('../../services/api');
const mockedApiClient = vi.mocked(apiClient);

const mockNavigate = vi.fn();
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

describe('Register Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('✅ 正常な登録フローが完了し、ダッシュボードへ遷移する', async () => {
    const user = userEvent.setup();
    
    mockedApiClient.post.mockResolvedValueOnce({
      data: { message: '登録成功' },
      status: 201,
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-field').querySelector('input')!;
    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const confirmPasswordInput = screen.getByTestId('confirm-password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'アカウント作成' });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith('/authrouter/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
      state: {
        message: 'アカウント作成が完了しました。ログインしてください。',
      },
    });
  });

  it('⚠️ 必須項目が未入力の場合、適切なバリデーションエラーが表示される', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'アカウント作成' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ユーザー名は必須です')).toBeInTheDocument();
      expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument();
      expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
      expect(screen.getByText('パスワード確認を入力してください')).toBeInTheDocument();
    });

    expect(mockedApiClient.post).not.toHaveBeenCalled();
  });

  it('🔒 パスワードが一致しない場合、エラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-field').querySelector('input')!;
    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const confirmPasswordInput = screen.getByTestId('confirm-password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'アカウント作成' });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password456');
    await user.click(submitButton);


    await waitFor(() => {
      expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
    });


    expect(mockedApiClient.post).not.toHaveBeenCalled();
  });

  it('⚠️ 409エラー：既存メールアドレス', async () => {
    const user = userEvent.setup();
    
    mockedApiClient.post.mockRejectedValueOnce({
      response: { status: 409, data: {} },
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-field').querySelector('input')!;
    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const confirmPasswordInput = screen.getByTestId('confirm-password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'アカウント作成' });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('このメールアドレスは既に登録されています。別のメールアドレスをお試しください。')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('🚨 500エラー：サーバーエラー', async () => {
    const user = userEvent.setup();
    
    mockedApiClient.post.mockRejectedValueOnce({
      response: { status: 500, data: {} },
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-field').querySelector('input')!;
    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const confirmPasswordInput = screen.getByTestId('confirm-password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'アカウント作成' });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('サーバーエラーが発生しました。しばらく待ってから再試行してください。')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('⏳ ローディング状態の管理', async () => {
    const user = userEvent.setup();
    
    mockedApiClient.post.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: {}, status: 201 }), 100))
    );

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-field').querySelector('input')!;
    const emailInput = screen.getByTestId('email-field').querySelector('input')!;
    const passwordInput = screen.getByTestId('password-field').querySelector('input')!;
    const confirmPasswordInput = screen.getByTestId('confirm-password-field').querySelector('input')!;
    const submitButton = screen.getByRole('button', { name: 'アカウント作成' });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByRole('button', { name: '登録中...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録中...' })).toBeDisabled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        state: {
          message: 'アカウント作成が完了しました。ログインしてください。',
        },
      });
    });
  });
});