import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Register from '../Register';
import apiClient from '../../services/api';

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

  describe('基本レンダリングテスト', () => {
    it('新規登録フォームが正しく表示される', async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      // ヘッダー要素の確認
      expect(screen.getByRole('heading', { name: '新規登録' })).toBeInTheDocument();
      expect(screen.getByText('FitStar健康への第一歩')).toBeInTheDocument();

      // フォーム要素の確認
        expect(screen.getByTestId('username-field')).toBeInTheDocument();
        expect(screen.getByTestId('email-field')).toBeInTheDocument();
        expect(screen.getByTestId('password-field')).toBeInTheDocument();
        expect(screen.getByTestId('confirm-password-field')).toBeInTheDocument();

      // ボタンの確認
      expect(screen.getByRole('button', { name: 'アカウント作成' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'ログイン' })).toBeInTheDocument();
    });

    it('初期状態でエラーメッセージが表示されない', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('フォームバリデーションテスト', () => {
    it('必須項目が未入力の場合、バリデーションエラーが表示される', async () => {
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
    });

    it('ユーザー名が3文字未満の場合、バリデーションエラーが表示される', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const usernameInput = screen.getByLabelText('ユーザー名');
      await user.type(usernameInput, 'ab');
      
      const submitButton = screen.getByRole('button', { name: 'アカウント作成' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('ユーザー名は3文字以上で入力してください')).toBeInTheDocument();
      });
    });

    it('無効なメールアドレス形式の場合、バリデーションエラーが表示される', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('メールアドレス');
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: 'アカウント作成' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
      });
    });

    it('パスワードが6文字未満の場合、バリデーションエラーが表示される', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('パスワード');
      await user.type(passwordInput, '12345');
      
      const submitButton = screen.getByRole('button', { name: 'アカウント作成' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
      });
    });

    it('パスワード確認が一致しない場合、バリデーションエラーが表示される', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('パスワード');
      const confirmPasswordInput = screen.getByLabelText('パスワード確認');
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password456');
      
      const submitButton = screen.getByRole('button', { name: 'アカウント作成' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
      });
    });
  });
});