import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi, MockedObject } from 'vitest';
import apiClient from '../../services/api';
import Register from '../Register';

// API client をモック
vi.mock('../../services/api');
const mockedApiClient = vi.mocked(apiClient);

// React Router のナビゲーションをモック
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// テスト用ラッパーコンポーネント
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
    
    // API成功レスポンスをモック
    mockedApiClient.post.mockResolvedValueOnce({
      data: { message: '登録成功' },
      status: 201,
    });

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    // 全フィールドに有効な値を入力
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

    // APIが正しく呼ばれることを確認
    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith('/authrouter/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // ナビゲーションを確認
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
      state: {
        message: 'アカウント作成が完了しました。ログインしてください。',
      },
    });
  });
});