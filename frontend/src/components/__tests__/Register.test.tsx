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

  describe('基本レンダリングテスト', async () => {
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
  });
});