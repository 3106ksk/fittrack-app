import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../test/mocks/server';
import { stravaSyncErrorHandlers } from '../../../test/mocks/handlers/strava';
import StravaSync from '../StravaSync';
import { TestWrapper } from './testUtils';

describe('StravaSyncエラーハンドリングテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // タイマーテストのための偽タイマー設定
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('M2-2. 同期処理失敗時のエラー表示', async () => {
    // ステップ1: MSWで同期エラーハンドラーを設定
    server.use(...stravaSyncErrorHandlers);

    // ステップ2: コンポーネントをレンダリング
    render(
      <TestWrapper>
        <StravaSync />
      </TestWrapper>
    );

    // ステップ3: 初期状態を確認（アイドル状態）
    await waitFor(
      () => {
        expect(screen.getByText('データを同期')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // ステップ4: 同期ボタンクリックでAPI呼び出し実行
    const syncButton = screen.getByRole('button', { name: /データを同期/ });
    expect(syncButton).toBeInTheDocument();
    expect(syncButton).not.toBeDisabled();
    fireEvent.click(syncButton);

    // ステップ5: エラー表示を検証
    await waitFor(
      () => {
        // エラーアラートの表示確認
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('Sync failed');
        
        // 「閉じる」ボタンの表示確認
        const closeButton = screen.getByRole('button', { name: /閉じる/ });
        expect(closeButton).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // ステップ6: 5秒後の自動非表示を確認
    // 5秒経過をシミュレート
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      // エラーアラートが非表示になることを確認
      expect(screen.queryByText('Sync failed')).not.toBeInTheDocument();
      
      // アイドル状態に戻ることを確認
      const idleButton = screen.getByRole('button', { name: /データを同期/ });
      expect(idleButton).toBeInTheDocument();
      expect(idleButton).not.toBeDisabled();
    });
  });
});