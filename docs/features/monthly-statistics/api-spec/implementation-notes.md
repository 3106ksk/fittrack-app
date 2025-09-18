# 月別統計機能 - API実装ノート

**文書番号**: API-MS-001
**バージョン**: 1.0.0
**作成日**: 2025-01-18
**ステータス**: Draft

## 1. API戦略（MVP版）

### 1.1 基本方針
**MVP実装では新規APIエンドポイントを追加せず、既存のAPIを活用する**

### 1.2 理由
- 開発コストの最小化
- バックエンドの変更不要
- 即座に実装開始可能
- フロントエンドでの集計で十分なパフォーマンス

## 2. 既存API活用

### 2.1 使用するエンドポイント

#### GET /workouts
**現在の仕様**
```javascript
// Request
GET /workouts
Authorization: Bearer {jwt_token}

// Response
[
  {
    "id": 1,
    "date": "2025-01-15T00:00:00Z",
    "exercise": "プッシュアップ",
    "exerciseType": "strength",
    "sets": 3,
    "reps": 30,
    "repsDetail": [
      {"reps": 10},
      {"reps": 10},
      {"reps": 10}
    ],
    "intensity": "中"
  },
  {
    "id": 2,
    "date": "2025-01-16T00:00:00Z",
    "exercise": "ランニング",
    "exerciseType": "cardio",
    "duration": 30,
    "distance": 5.0,
    "intensity": "高"
  }
]
```

### 2.2 フロントエンド処理
```javascript
// 既存のAPIレスポンスをフロントエンドで月別にフィルタリング
const response = await apiClient.get('/workouts');
const allWorkouts = transformWorkoutData(response.data);

// StatisticsServiceで月別集計
const monthlyStats = calculateMonthlyStats(allWorkouts, selectedMonth);
```

## 3. 将来のAPI拡張（Phase 2以降）

### 3.1 月別集計エンドポイント（将来実装）
```yaml
# OpenAPI 3.1仕様（将来の参考用）
/api/v1/workouts/statistics/monthly:
  get:
    summary: 月別ワークアウト統計取得
    parameters:
      - name: year
        in: query
        required: true
        schema:
          type: integer
          example: 2025
      - name: month
        in: query
        required: true
        schema:
          type: integer
          minimum: 1
          maximum: 12
          example: 1
    responses:
      200:
        description: 月別統計データ
        content:
          application/json:
            schema:
              type: object
              properties:
                current:
                  $ref: '#/components/schemas/MonthlyStats'
                previous:
                  $ref: '#/components/schemas/MonthlyStats'
                changeRates:
                  $ref: '#/components/schemas/ChangeRates'

components:
  schemas:
    MonthlyStats:
      type: object
      properties:
        totalDays:
          type: integer
          description: 総ワークアウト日数
        totalReps:
          type: integer
          description: 総回数
        totalTime:
          type: integer
          description: 総時間（分）
        period:
          type: string
          description: 期間（例: "2025年1月"）

    ChangeRates:
      type: object
      properties:
        daysChangeRate:
          type: number
          format: float
          description: 日数変化率（%）
        repsChangeRate:
          type: number
          format: float
          description: 回数変化率（%）
        timeChangeRate:
          type: number
          format: float
          description: 時間変化率（%）
```

### 3.2 期間指定エンドポイント（将来実装）
```yaml
/api/v1/workouts/statistics/range:
  get:
    summary: 指定期間のワークアウト統計取得
    parameters:
      - name: startDate
        in: query
        required: true
        schema:
          type: string
          format: date
      - name: endDate
        in: query
        required: true
        schema:
          type: string
          format: date
```

## 4. パフォーマンス考慮事項

### 4.1 現在のアプローチ（全データ取得）
**メリット**:
- キャッシング効果が高い
- 月切り替えが高速
- オフライン対応が容易

**デメリット**:
- 初回ロードが重い（データ量に依存）
- メモリ使用量が多い

### 4.2 最適化案（1000件以上のデータ時）
```javascript
// ページネーション実装
const fetchAllWorkouts = async () => {
  const limit = 100;
  let offset = 0;
  let allData = [];
  let hasMore = true;

  while (hasMore) {
    const response = await apiClient.get('/workouts', {
      params: { limit, offset }
    });
    allData = [...allData, ...response.data];
    hasMore = response.data.length === limit;
    offset += limit;
  }

  return allData;
};
```

## 5. キャッシング戦略

### 5.1 ローカルストレージ活用
```javascript
const CACHE_KEY = 'workout_stats_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5分

const getCachedStats = (month) => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const data = JSON.parse(cached);
  const now = Date.now();

  if (now - data.timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  return data.stats[month];
};

const setCachedStats = (month, stats) => {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  cached.stats = cached.stats || {};
  cached.stats[month] = stats;
  cached.timestamp = Date.now();
  localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
};
```

## 6. エラーハンドリング

### 6.1 フロントエンド処理
```javascript
const fetchMonthlyStatistics = async (month) => {
  try {
    const workouts = await fetchWorkouts();
    return calculateMonthlyStats(workouts, month);
  } catch (error) {
    console.error('統計データの取得に失敗:', error);

    // フォールバック処理
    return {
      current: { totalDays: 0, totalReps: 0, totalTime: 0 },
      previous: { totalDays: 0, totalReps: 0, totalTime: 0 },
      changeRates: { daysChangeRate: 0, repsChangeRate: 0, timeChangeRate: 0 }
    };
  }
};
```

## 7. 移行計画

### Phase 1（MVP - 現在）
- 既存API（GET /workouts）を使用
- フロントエンドで全処理を実装
- 基本的な月別フィルタリング

### Phase 2（最適化）
- データ量に応じたページネーション
- キャッシング実装
- 部分更新の最適化

### Phase 3（バックエンド拡張）
- 専用の統計APIエンドポイント追加
- サーバーサイド集計
- データベースレベルの最適化

## 8. セキュリティ考慮事項
- JWT認証は既存実装を活用
- ユーザーは自身のデータのみアクセス可能
- XSS/CSRF対策は既存のミドルウェアで対応

## 9. モニタリング
- APIレスポンスタイムの監視
- フロントエンド処理時間の計測
- エラー率のトラッキング