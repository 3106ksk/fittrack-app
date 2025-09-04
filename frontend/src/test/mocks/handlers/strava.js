import { http, HttpResponse } from 'msw';

// Strava API用のモックハンドラー - 接続済み状態
export const stravaHandlers = [
  // GET /api/strava/status - 接続状態確認API
  http.get('*/api/strava/status', () => {
    return HttpResponse.json({
      connected: true,
      athlete_id: '12345',
      last_sync: '2024-01-15T10:30:00Z'
    });
  }),

  // POST /api/strava/auth - 認証URL取得API
  http.post('*/api/strava/auth', () => {
    return HttpResponse.json({
      authUrl: 'https://www.strava.com/oauth/authorize?client_id=test&redirect_uri=test'
    });
  }),

  // POST /api/strava/sync - データ同期API
  http.post('*/api/strava/sync', () => {
    return HttpResponse.json({
      synced: 5,
      skipped: 2,
      errors: 0
    });
  }),

  // DELETE /api/strava/disconnect - 接続解除API
  http.delete('*/api/strava/disconnect', () => {
    return new HttpResponse(null, { status: 204 });
  })
];

// 未接続状態用のハンドラー（テスト時に切り替え使用）
export const stravaHandlersDisconnected = [
  http.get('*/api/strava/status', () => {
    return HttpResponse.json({
      connected: false,
      athlete_id: null,
      last_sync: null
    });
  })
];

// M2-1テスト用：認証URL取得エラーハンドラー
export const stravaAuthErrorHandlers = [
  // 未接続状態を返す
  http.get('*/api/strava/status', () => {
    return HttpResponse.json({
      connected: false,
      athlete_id: null,
      last_sync: null,
    });
  }),

  // 認証URL取得時に500エラーを返す
  http.post('*/api/strava/auth', () => {
    return HttpResponse.json(
      { error: 'Failed to get auth URL' },
      { status: 500 }
    );
  }),
];

// M2-2テスト用：同期処理エラーハンドラー
export const stravaSyncErrorHandlers = [
  // 接続済み状態を返す（同期処理前提）
  http.get('*/api/strava/status', () => {
    return HttpResponse.json({
      connected: true,
      athlete_id: '12345',
      last_sync: '2024-01-15T10:30:00Z'
    });
  }),

  // 同期処理時に500エラーを返す
  http.post('*/api/strava/sync', () => {
    return HttpResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }),
];

