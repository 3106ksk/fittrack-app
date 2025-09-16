const axios = require('axios');

jest.mock('axios');
const mockedAxios = axios;

process.env.STRAVA_CLIENT_ID = 'test_client_id';
process.env.STRAVA_CLIENT_SECRET = 'test_client_secret';
process.env.STRAVA_REDIRECT_URI = 'http://localhost:3000/auth/strava/callback';
process.env.ENCRYPTION_KEY = 'test_encryption_key_32_characters';

const stravaService = require('../services/stravaService');

describe('StravaService', () => {
  const mockEnv = {
    STRAVA_CLIENT_ID: 'test_client_id',
    STRAVA_CLIENT_SECRET: 'test_client_secret',
    STRAVA_REDIRECT_URI: 'http://localhost:3000/auth/strava/callback',
    ENCRYPTION_KEY: 'test_encryption_key_32_characters'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe('getAuthUrl - 基礎学習', () => {
    test('正しい認証URLを生成する', () => {
      const state = 'test_state';
      const authUrl = stravaService.getAuthUrl(state);
      
      expect(authUrl).toContain('https://www.strava.com/oauth/authorize');
      
      expect(authUrl).toContain('client_id=test_client_id');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain(`state=${state}`);
      expect(authUrl).toContain('approval_prompt=force');
      expect(authUrl).toContain('scope=read%2Cactivity%3Aread_all');
      
      expect(authUrl).toContain(`redirect_uri=${encodeURIComponent('http://localhost:3000/auth/strava/callback')}`);
    });

    test('状態パラメータが正しく埋め込まれる', () => {
      const testState = 'my_custom_state_12345';
      const authUrl = stravaService.getAuthUrl(testState);
      
      expect(authUrl).toContain(`state=${testState}`);
      expect(authUrl).toContain('https://www.strava.com/oauth/authorize');
    });
  });

  describe('exchangeCodeForToken - 基礎学習', () => {
    test('正常なコードでトークンを取得する', async () => {
      const mockCode = 'test_code';
      const mockTokenResponse = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_at: 1234567890
      };

      mockedAxios.post.mockResolvedValue({ data: mockTokenResponse });
      const result = await stravaService.exchangeCodeForToken(mockCode);

      expect(mockedAxios.post).toHaveBeenCalledWith('https://www.strava.com/oauth/token', {
        client_id: 'test_client_id',
        client_secret: 'test_client_secret',
        code: mockCode,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3000/auth/strava/callback',
      });
      expect(result).toEqual(mockTokenResponse);
    });

    test('モックの基本動作を理解する', async () => {
      const mockResponse = { data: { message: 'success' } };
      
      mockedAxios.post.mockResolvedValue(mockResponse);
      
      const result = await stravaService.exchangeCodeForToken('any_code');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    test('トークン交換に失敗した場合にエラーを投げる', async () => {
      const mockCode = 'invalid_code';
      const mockError = {
        response: {
          data: { message: 'Invalid code' }
        }
      };

      mockedAxios.post.mockRejectedValue(mockError);

      await expect(stravaService.exchangeCodeForToken(mockCode))
        .rejects.toThrow('Token exchange failed: Invalid code');
    });
  });

  describe('getActivities', () => {
    test('デフォルト設定でアクティビティを取得する', async () => {
      const mockAccessToken = 'valid_access_token';
      const mockActivities = [
        {
          id: 123456789,
          name: 'Morning Run',
          sport_type: 'Run',
          start_date: '2024-01-15T07:00:00Z',
          distance: 5000,
          moving_time: 1800,
          elapsed_time: 1900
        }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockActivities });

      const result = await stravaService.getActivities(mockAccessToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.strava.com/api/v3/athlete/activities',
        {
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`
          },
          params: {
            after: expect.any(Number),
            page: 1,
            per_page: 50
          }
        }
      );
      expect(result).toEqual(mockActivities);
    });

    test('期限切れトークンで401エラーを適切に処理する', async () => {
      const mockAccessToken = 'expired_token';
      const mockError = {
        response: { status: 401 }
      };

      mockedAxios.get.mockRejectedValue(mockError);

      await expect(stravaService.getActivities(mockAccessToken))
        .rejects.toThrow('認証エラー：トークンの有効期限切れ');
    });

    test('ネットワークエラー（responseなし）の場合のエラー処理', async () => {
      const mockAccessToken = 'valid_access_token';
      const mockError = new Error('Network Error');
      mockError.code = 'ECONNREFUSED';

      mockedAxios.get.mockRejectedValue(mockError);

      await expect(stravaService.getActivities(mockAccessToken))
        .rejects.toThrow('Failed to fetch activities: Network Error');
    });

    test('500エラーの場合のエラー処理', async () => {
      const mockAccessToken = 'valid_access_token';
      const mockError = {
        response: { status: 500, data: { message: 'Internal server error' } }
      };
      
      mockedAxios.get.mockRejectedValue(mockError);

      await expect(stravaService.getActivities(mockAccessToken))
        .rejects.toThrow('Failed to fetch activities: Internal server error');
    });

    test('responseありでdataなしの場合のエラー処理', async () => {
      const mockAccessToken = 'valid_access_token';
      const mockError = new Error('Request failed with status code 503');
      mockError.response = { status: 503 };

      mockedAxios.get.mockRejectedValue(mockError);

      await expect(stravaService.getActivities(mockAccessToken))
        .rejects.toThrow('Failed to fetch activities: Request failed with status code 503');
    });
  });

  describe('generateState', () => {
    test('ランダムなstateを生成する', () => {
      const state1 = stravaService.generateState();
      const state2 = stravaService.generateState();
      
      expect(state1).toBeTruthy();
      expect(state2).toBeTruthy();
      expect(state1).not.toBe(state2);
      expect(state1).toHaveLength(64); // 32バイト -> 64文字のhex
    });
  });

  describe('mapStravaToWorkout', () => {
    test('ランニングアクティビティを正しくマッピングする', () => {
      const stravaActivity = {
        id: 123456789,
        name: 'Morning Run',
        sport_type: 'Run',
        start_date: '2024-01-15T07:00:00Z',
        distance: 5000,
        moving_time: 1800,
        elapsed_time: 1900
      };
      const userId = 'user123';

      const result = stravaService.mapStravaToWorkout(stravaActivity, userId);

      expect(result).toEqual({
        userID: userId,
        external_id: '123456789',
        source: 'strava',
        date: '2024-01-15',
        exercise: 'ランニング',
        exerciseType: 'cardio',
        distance: 5.0,
        duration: 1800,
        raw_data: stravaActivity,
        synced_at: expect.any(Date)
      });
    });

    test('ウェイトトレーニングアクティビティを正しくマッピングする', () => {
      const stravaActivity = {
        id: 987654321,
        name: 'Strength Training',
        sport_type: 'WeightTraining',
        start_date: '2024-01-16T18:00:00Z',
        distance: null,
        moving_time: 3600,
        elapsed_time: 3900
      };
      const userId = 'user456';

      const result = stravaService.mapStravaToWorkout(stravaActivity, userId);

      expect(result).toEqual({
        userID: userId,
        external_id: '987654321',
        source: 'strava',
        date: '2024-01-16',
        exercise: 'Strength Training',
        exerciseType: 'strength',
        distance: null,
        duration: 3600,
        raw_data: stravaActivity,
        synced_at: expect.any(Date)
      });
    });

    test('未知の種目タイプを適切に処理する', () => {
      const stravaActivity = {
        id: 555555555,
        name: 'Swimming',
        sport_type: 'Swim',
        start_date: '2024-01-17T06:00:00Z',
        distance: 1500,
        moving_time: 2400,
        elapsed_time: 2500
      };
      const userId = 'user789';

      const result = stravaService.mapStravaToWorkout(stravaActivity, userId);

      expect(result.exerciseType).toBe('cardio');
    });

    test('距離がない場合にnullを設定する', () => {
      const stravaActivity = {
        id: 111111111,
        name: 'Yoga',
        sport_type: 'Yoga',
        start_date: '2024-01-18T08:00:00Z',
        distance: 0,
        moving_time: 1800,
        elapsed_time: 1800
      };
      const userId = 'user999';

      const result = stravaService.mapStravaToWorkout(stravaActivity, userId);

      expect(result.distance).toBe(null);
    });
  });
});