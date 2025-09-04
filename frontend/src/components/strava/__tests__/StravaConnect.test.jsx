import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../test/mocks/server';
import { stravaHandlersDisconnected } from '../../../test/mocks/handlers/strava';
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
