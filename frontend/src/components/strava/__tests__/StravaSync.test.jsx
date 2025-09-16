import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../test/mocks/server';
import { stravaSyncErrorHandlers } from '../../../test/mocks/handlers/strava';
import StravaSync from '../StravaSync';
import { TestWrapper } from './testUtils';

describe('StravaSyncエラーハンドリングテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it('M2-2. 同期処理失敗時のエラー表示', async () => {
    server.use(...stravaSyncErrorHandlers);

    render(
      <TestWrapper>
        <StravaSync />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('データを同期')).toBeInTheDocument();
    });

    const syncButton = screen.getByRole('button', { name: /データを同期/ });
    expect(syncButton).toBeInTheDocument();
    expect(syncButton).not.toBeDisabled();


    await act(async () => {
      fireEvent.click(syncButton);
    });


    await waitFor(
      () => {

        const alerts = screen.getAllByRole('alert');
        const errorAlert = alerts.find(alert =>
          alert.classList.contains('MuiAlert-colorError')
        );
        expect(errorAlert).toBeDefined();
        expect(errorAlert).toHaveTextContent('Sync failed');

        const closeButton = screen.getByRole('button', { name: /閉じる/ });
        expect(closeButton).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {

      const alerts = screen.queryAllByRole('alert');
      const errorAlert = alerts.find(alert =>
        alert.classList.contains('MuiAlert-colorError')
      );
      expect(errorAlert).toBeUndefined();

      const idleButton = screen.getByRole('button', { name: /データを同期/ });
      expect(idleButton).toBeInTheDocument();
      expect(idleButton).not.toBeDisabled();

      const infoAlerts = screen.queryAllByRole('alert');
      const infoAlert = infoAlerts.find(alert =>
        alert.classList.contains('MuiAlert-colorInfo')
      );
      expect(infoAlert).toBeDefined();
    });
  });
});