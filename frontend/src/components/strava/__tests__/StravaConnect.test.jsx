import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  stravaAuthErrorHandlers,
  stravaHandlersDisconnected,
} from '../../../test/mocks/handlers/strava';
import { server } from '../../../test/mocks/server';
import StravaConnect from '../StravaConnect';
import { TestWrapper } from './testUtils';

describe('StravaConnect. 基本状態表示テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('接続済み状態の正しい表示', async () => {
    render(
      <TestWrapper>
        <StravaConnect />
      </TestWrapper>
    );

    await waitFor(
      () => {
        expect(
          screen.getByText('Stravaアカウントに接続済み')
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('Athlete ID: 12345')).toBeInTheDocument();
    expect(screen.getByText('最終同期: 2024/1/15')).toBeInTheDocument();
  });

  it('/未接続状態の正しい表示', async () => {
    server.use(...stravaHandlersDisconnected);

    render(
      <TestWrapper>
        <StravaConnect />
      </TestWrapper>
    );

    await waitFor(
      () => {
        expect(
          screen.getByText(
            'Stravaアカウントと連携して、アクティビティデータを自動同期しましょう'
          )
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.queryByText('Athlete ID: 12345')).not.toBeInTheDocument();
  });
});

describe('APIエラーハンドリングテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('認証URL取得失敗時のエラー表示', async () => {
    // ステップ1: MSWでエラーハンドラーを設定
    server.use(...stravaAuthErrorHandlers);

    // ステップ2: コンポーネントをレンダリング
    render(
      <TestWrapper>
        <StravaConnect />
      </TestWrapper>
    );

    // ステップ3: 初期状態を確認（未接続状態）
    await waitFor(
      () => {
        expect(
          screen.getByText(
            'Stravaアカウントと連携して、アクティビティデータを自動同期しましょう'
          )
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // ステップ4: ボタンクリックでAPI呼び出し実行
    const connectButton = screen.getByRole('button', { name: /Stravaに接続/ });
    expect(connectButton).toBeInTheDocument();
    expect(connectButton).not.toBeDisabled();
    fireEvent.click(connectButton);

    // ステップ5: エラー表示を検証
    await waitFor(
      () => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('Failed to get auth URL');
      },
      { timeout: 3000 }
    );

    // ステップ6: UI状態の復旧を確認（再試行可能状態）
    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: /Stravaに接続/ });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).not.toBeDisabled();
    });
  });
});
