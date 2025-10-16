# Week 3-4: エラーハンドリング + 複数ワークアウト対応 - 要件定義書

**作成日**: 2025-10-11
**期間**: 2025年10月28日 - 11月10日（2週間）
**工数**: 14時間（週7時間 × 2週間）
**担当**: Keisuke Sato

---

## 📋 目次

1. [概要](#概要)
2. [目的とゴール](#目的とゴール)
3. [機能要件](#機能要件)
4. [非機能要件](#非機能要件)
5. [成功基準](#成功基準)

---

## 概要

### 背景
現在のFitTrackは以下の課題を抱えている:
- APIエンドポイントにエラーハンドリングが不十分
- 複数ワークアウトの重複問題が未解決
- Strava連携が不安定（接続エラー、タイムアウト）
- エラーログが不足し、問題の追跡が困難

### Week 3-4の位置づけ
コア機能完成度向上ロードマップの**第2フェーズ**として、本番運用可能な堅牢性を実現する。

---

## 目的とゴール

### 目的
> **「本番運用可能な堅牢性を実現しました」と面接で語る**

### ゴール

#### 1. エラーハンドリング
- ✅ 全APIエンドポイントにエラーハンドリング実装
- ✅ ユーザーフレンドリーなエラーメッセージ
- ✅ エラーログの完全記録

#### 2. データ整合性
- ✅ 複数ワークアウト重複問題の完全解決
- ✅ 同日複数回ワークアウトの正確な表示・集計

#### 3. 外部API連携
- ✅ Strava連携の安定化（リトライロジック）
- ✅ タイムアウト・Rate Limit対応

---

## 機能要件

### FR-1: 統一エラーハンドリングの実装

#### FR-1.1 AppErrorクラスの作成
**優先度**: P0（必須）

**要件**:
- カスタムエラークラス `AppError` を作成
- HTTPステータスコード、エラーメッセージ、エラーコードを管理
- 運用エラー（Operational Error）と非運用エラーを区別

**受け入れ基準**:
- [ ] `AppError` クラスが実装されている
- [ ] `statusCode`, `message`, `isOperational` フィールドを持つ
- [ ] スタックトレースをキャプチャ

**実装ファイル**:
- `backend/middleware/errorHandler.js`（新規）

**実装例**:
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 使用例
throw new AppError('Workout not found', 404);
throw new AppError('Invalid workout data', 400);
```

---

#### FR-1.2 グローバルエラーハンドラーの実装
**優先度**: P0（必須）

**要件**:
- Express グローバルエラーハンドリングミドルウェアを実装
- 開発環境と本番環境で異なるエラーレスポンス
- エラーログの記録

**受け入れ基準**:
- [ ] 開発環境: スタックトレース含む詳細エラー
- [ ] 本番環境: 安全なエラーメッセージのみ
- [ ] 全エラーがWinstonでログ記録される
- [ ] 非運用エラー（プログラミングエラー）は500で返す

**実装ファイル**:
- `backend/middleware/errorHandler.js`
- `backend/app.js`（ミドルウェア登録）

**実装例**:
```javascript
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // エラーログ記録
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
  });

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  } else {
    // 本番環境: 安全なエラーメッセージのみ
    res.status(err.statusCode).json({
      success: false,
      error: err.isOperational ? err.message : 'Something went wrong',
    });
  }
};
```

---

#### FR-1.3 全APIエンドポイントへの適用
**優先度**: P0（必須）

**要件**:
- 全APIエンドポイントで `AppError` を使用
- try-catchブロックで予期しないエラーをキャッチ
- 適切なHTTPステータスコードを返す

**受け入れ基準**:
- [ ] `backend/routes/workouts.js`: 全エンドポイント対応
- [ ] `backend/routes/authRoutes.js`: 全エンドポイント対応
- [ ] `backend/routes/insightRoutes.js`: 全エンドポイント対応
- [ ] `backend/routes/stravaRoutes.js`: 全エンドポイント対応

**適用箇所**:
- 認証エラー: 401 Unauthorized
- バリデーションエラー: 400 Bad Request
- リソース未発見: 404 Not Found
- サーバーエラー: 500 Internal Server Error

**実装例**:
```javascript
// backend/routes/workouts.js
router.get('/:workoutId', authMiddleware, async (req, res, next) => {
  try {
    const { workoutId } = req.params;
    const workout = await Workout.findByPk(workoutId);

    if (!workout) {
      throw new AppError('Workout not found', 404);
    }

    if (workout.userID !== req.user.id) {
      throw new AppError('Unauthorized access to workout', 403);
    }

    res.json({ success: true, workout });
  } catch (error) {
    next(error);
  }
});
```

---

### FR-2: 複数ワークアウト対応

#### FR-2.1 TransformWorkoutDataの修正
**優先度**: P0（必須）

**現状の問題**:
同日に同じエクササイズを複数回行った場合、最後の1回分のみ表示される

**要件**:
- 同じエクササイズを配列で管理
- セッションごとに記録
- 累積値（totalDistance, totalDuration）を計算

**受け入れ基準**:
- [ ] 同日の同じエクササイズを全て表示
- [ ] セッションごとに時刻を表示
- [ ] 累積値が正しく計算される

**実装ファイル**:
- `frontend/src/services/TransformWorkoutData.js`

**実装例**:
```javascript
if (workout.exerciseType === 'cardio') {
  const exerciseName = workout.exercise;

  if (!acc[dateKey].exercises[exerciseName]) {
    acc[dateKey].exercises[exerciseName] = {
      sessions: [],
      totalDistance: 0,
      totalDuration: 0,
    };
  }

  // セッションごとに記録
  acc[dateKey].exercises[exerciseName].sessions.push({
    id: workout.id,
    distance: workout.distance,
    duration: workout.duration,
    createdAt: workout.createdAt,
  });

  // 累積値を計算
  acc[dateKey].exercises[exerciseName].totalDistance += workout.distance || 0;
  acc[dateKey].exercises[exerciseName].totalDuration += workout.duration || 0;
  acc[dateKey].totalTime += workout.duration || 0;
}
```

---

#### FR-2.2 ワークアウト履歴表示の改善
**優先度**: P1（高）

**要件**:
- 複数セッションを折りたたみ表示
- クリックで詳細展開
- 累積値をハイライト

**受け入れ基準**:
- [ ] 同日複数回のワークアウトが全て表示される
- [ ] 累積値が太字で表示される
- [ ] セッション詳細を展開・折りたたみ可能

**実装ファイル**:
- `frontend/src/components/WorkoutHistoryTable.jsx`（削除済みの場合はスキップ）
- `frontend/src/components/Dashboard/RecentWorkoutsAccordion.jsx`

---

### FR-3: Strava連携の安定化

#### FR-3.1 リトライロジックの実装
**優先度**: P0（必須）

**要件**:
- axios-retry ライブラリの導入
- 3回までリトライ
- 指数バックオフ（Exponential Backoff）

**受け入れ基準**:
- [ ] ネットワークエラー時、3回までリトライ
- [ ] Rate Limit（429）時、リトライ
- [ ] リトライ間隔: 1秒、2秒、4秒（指数バックオフ）

**実装ファイル**:
- `backend/services/stravaService.js`

**実装例**:
```javascript
const axios = require('axios');
const axiosRetry = require('axios-retry');

// リトライ設定
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status === 429; // Rate Limit
  },
});

const stravaClient = axios.create({
  baseURL: 'https://www.strava.com/api/v3',
  timeout: 10000, // 10秒
});
```

---

#### FR-3.2 タイムアウト設定
**優先度**: P0（必須）

**要件**:
- Strava API リクエストに10秒のタイムアウト
- タイムアウト時のエラーハンドリング

**受け入れ基準**:
- [ ] 10秒でタイムアウト
- [ ] タイムアウト時、適切なエラーメッセージ
- [ ] ユーザーに再試行を促す

---

#### FR-3.3 Rate Limit対応
**優先度**: P1（高）

**要件**:
- Strava Rate Limit（15分で100リクエスト、1日で1000リクエスト）に対応
- Rate Limitヘッダーを記録
- 制限に近づいたら警告

**受け入れ基準**:
- [ ] Rate Limitヘッダーを解析
- [ ] 残り回数をログ記録
- [ ] 制限超過時、適切なエラーメッセージ

**実装例**:
```javascript
const syncActivities = async (userId, accessToken) => {
  try {
    const response = await stravaClient.get('/athlete/activities', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { per_page: 30 },
    });

    // Rate Limit情報をログ記録
    const rateLimit = {
      limit: response.headers['x-ratelimit-limit'],
      usage: response.headers['x-ratelimit-usage'],
    };
    logger.info(`Strava Rate Limit: ${rateLimit.usage}/${rateLimit.limit}`);

    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new AppError('Strava rate limit exceeded. Please try again later.', 429);
    }
    throw error;
  }
};
```

---

## 非機能要件

### NFR-1: 信頼性
- [ ] エラー発生時もアプリケーションがクラッシュしない
- [ ] 全エラーがログに記録される
- [ ] ユーザーにフレンドリーなエラーメッセージ

### NFR-2: 保守性
- [ ] エラーハンドリングのコードが統一されている
- [ ] エラーログから問題を追跡しやすい
- [ ] テストカバレッジ: 80%以上

### NFR-3: パフォーマンス
- [ ] エラーハンドリングによるオーバーヘッド: 10ms以内
- [ ] リトライロジックによる最大遅延: 7秒（1+2+4秒）

---

## 成功基準

### 定量的基準

| 指標 | Before | After | 目標 |
|-----|--------|-------|------|
| エラーハンドリングカバー率 | 30% | 100% | 完全実装 |
| 複数ワークアウト対応 | 0% | 100% | 完全解決 |
| Strava成功率 | 70% | 95% | +25% |
| エラーログ記録率 | 50% | 100% | 完全記録 |

### 定性的基準

#### ユーザー価値
- [ ] エラー発生時も適切なフィードバック
- [ ] 複数回ワークアウトが正確に表示
- [ ] Strava連携が安定動作

#### 開発者体験
- [ ] エラーログから問題を特定しやすい
- [ ] エラーハンドリングのパターンが統一
- [ ] 本番運用で障害が起きにくい

#### 面接評価
- [ ] 堅牢性の高さを具体例で説明できる
- [ ] エラーハンドリング戦略を語れる
- [ ] 本番運用を見据えた設計を証明できる

---

## リスクと対応策

### リスク1: 既存コードへの影響
**発生確率**: 中
**影響度**: 高

**対応策**:
- 段階的な実装（ルートごと）
- 既存のテストを全て実行
- ステージング環境での検証

### リスク2: Strava API仕様変更
**発生確率**: 低
**影響度**: 中

**対応策**:
- Strava API公式ドキュメントを定期確認
- エラーレスポンスを詳細にログ記録
- フォールバック処理の実装

---

## 次のステップ

1. [Week 3-4 設計書](./design.md) の確認
2. エラーハンドリングミドルウェアの実装開始
3. 複数ワークアウト対応の実装

---

**最終更新**: 2025-10-11
**承認者**: Keisuke Sato
**次回レビュー**: 2025-11-10（Week 3-4完了時）
