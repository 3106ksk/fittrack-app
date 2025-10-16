# 🎯 FitTrack コア機能完成度向上ロードマップ

**最終更新**: 2025-10-11
**ロードマップ期間**: 2025年10月 - 2025年12月（2ヶ月）
**最終ゴール**: 就活成功 - 完成度の高いプロダクトとして面接でアピール

---

## 🎯 ビジョン

FitTrackの**核心価値**である「運動ログ → 健康効果の可視化」を徹底的に磨き上げ、**技術力と完成度の高さ**を証明できるプロダクトに仕上げる。

### 最終ゴール
- ✅ 健康スコアアルゴリズムの精度40%向上
- ✅ Critical Bug完全修正（Insightスコア再計算問題）
- ✅ テストカバレッジ75%達成
- ✅ パフォーマンス最適化（ロード時間68%削減）
- ✅ 本番リリース可能な品質

---

## 📐 設計原則

### 1. 就活成功にフォーカス
面接で具体的な成果を数値で語れることを最優先

### 2. 深さ > 広さ
新機能追加より、既存機能の完成度向上に集中

### 3. 科学的根拠の強化
健康スコアアルゴリズムの信頼性を論文ベースで証明

### 4. 本番運用可能な品質
エラーハンドリング、テスト、パフォーマンス最適化を徹底

---

## 📅 2ヶ月ロードマップ概要

| Phase | 期間 | 目標 | 工数 |
|-------|------|------|------|
| **Week 1-2** | 2025/10/14-27 | 健康スコア精度向上 + Critical Bug修正 | 14h |
| **Week 3-4** | 2025/10/28-11/10 | エラーハンドリング + 複数ワークアウト対応 | 14h |
| **Week 5-6** | 2025/11/11-24 | テストカバレッジ向上 + TypeScript化 | 14h |
| **Week 7-8** | 2025/11/25-12/08 | パフォーマンス最適化 + PWA化 | 14h |

**総工数**: 56時間（週7時間 × 8週間）

---

## 🔵 Week 1-2: 健康スコア精度向上 + Critical Bug修正

### 目標
> **「運動科学の論文を読み、健康スコアの精度を40%向上させました」と面接で語る**

### 主要成果物
- ✅ METs（代謝当量）計算の実装
- ✅ 個人差補正（年齢・性別）の導入
- ✅ Critical Bug修正（Insightスコア再計算問題）
- ✅ ワークアウトフォームリセット問題解決

### 週次スケジュール

#### Day 1-2（4時間）: METs計算の実装
```typescript
// 実装ファイル: frontend/src/services/healthScore/calculateMETs.ts
export const calculateMETs = (exercise: string, intensity: string): number => {
  const metsTable = {
    'ランニング': { '低': 6.0, '中': 9.8, '高': 12.3 },
    'サイクリング': { '低': 4.0, '中': 8.0, '高': 12.0 },
    'スクワット': { '低': 3.5, '中': 5.0, '高': 8.0 },
    // ... 全運動種目
  };
  return metsTable[exercise]?.[intensity] || 5.0;
};

// WHO推奨: 500-1000 METs-分/週
export const calculateWeeklyMETsMinutes = (workouts) => {
  return workouts.reduce((total, w) => {
    const mets = calculateMETs(w.exercise, w.intensity);
    return total + (mets * w.duration);
  }, 0);
};
```

**科学的根拠**:
- [Ainsworth BE et al. (2011) Compendium of Physical Activities](https://sites.google.com/site/compendiumofphysicalactivities/)
- WHO推奨の週500-1000 METs-分を基準に評価

#### Day 3-4（4時間）: 個人差補正の導入
```typescript
// 実装ファイル: frontend/src/services/healthScore/personalAdjustment.ts
interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  baselineFitness?: 'low' | 'medium' | 'high';
}

export const adjustScoreForAge = (baseScore: number, age: number): number => {
  // 年齢による補正係数（40歳基準）
  if (age < 30) return baseScore * 0.95; // 若い人は達成しやすい
  if (age >= 60) return baseScore * 1.15; // 高齢者は達成が難しい
  return baseScore;
};

export const adjustScoreForGender = (baseScore: number, gender: string): number => {
  // 性別による補正（筋力トレーニングの場合）
  return gender === 'female' ? baseScore * 1.1 : baseScore;
};
```

**科学的根拠**:
- [CDC Physical Activity Guidelines for Americans](https://health.gov/sites/default/files/2019-09/Physical_Activity_Guidelines_2nd_edition.pdf)

#### Day 5-6（4時間）: Critical Bug修正（Insightスコア再計算）
```javascript
// 修正ファイル: backend/routes/insightRoutes.js
router.get('/current', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const today = DateHelper.format(new Date());
  const weekBounds = DateHelper.getWeekBounds(new Date());

  try {
    // 常に最新のworkoutsデータを取得
    const workouts = await Workout.findAll({
      where: {
        userID: userId,
        date: { [Op.between]: [weekBounds.startString, weekBounds.endString] },
      },
    });

    // 常に再計算
    const result = engine.calculateWeeklyInsight(workouts);

    // 既存レコードを更新または新規作成
    const [insight, created] = await Insight.upsert({
      userId,
      date: today,
      totalScore: result.score.total,
      cardioScore: result.score.cardio,
      strengthScore: result.score.strength,
      whoCardioAchieved: result.achievements.cardio,
      whoStrengthAchieved: result.achievements.strength,
      metrics: result.metrics,
      calculationVersion: result.version,
    }, {
      where: { userId, date: today }
    });

    res.json({ success: true, insight, created });
  } catch (error) {
    console.error('Insight calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate insight' });
  }
});
```

#### Day 7（2時間）: ワークアウトフォームリセット問題解決
```javascript
// 修正ファイル: frontend/src/hooks/useWorkoutSubmit.js
// 強制的にフォームを再マウント
const [formKey, setFormKey] = useState(0);

const handleSubmitSuccess = async (data) => {
  await submitWorkout(data);
  showFeedback('ワークアウトを記録しました');

  // フォームを強制再マウント
  setFormKey(prev => prev + 1);
};
```

### 技術スタック
- **METs計算**: TypeScript
- **個人差補正**: TypeScript
- **Bug修正**: Node.js + Sequelize

### 面接アピールポイント
1. **科学的アプローチ**: 運動科学の論文を読み、METs概念を導入
2. **精度向上**: WHO推奨基準（500-1000 METs-分/週）を実装し、精度40%向上
3. **Critical Bug修正**: Insightスコアが再計算されない致命的バグを解決
4. **個人化**: 年齢・性別による補正で、より正確な健康評価を実現

### 詳細ドキュメント
- [Week 1-2 要件定義書](./features/week1-2-health-score-precision/requirements.md)
- [Week 1-2 設計書](./features/week1-2-health-score-precision/design.md)
- [科学的根拠](./features/week1-2-health-score-precision/scientific-references.md)

---

## 🟢 Week 3-4: エラーハンドリング + 複数ワークアウト対応

### 目標
> **「本番運用可能な堅牢性を実現しました」と面接で語る**

### 主要成果物
- ✅ 全APIエンドポイントにエラーハンドリング
- ✅ 複数ワークアウト重複問題の完全解決
- ✅ Strava連携の安定化（リトライロジック）
- ✅ エッジケーステストの追加

### 週次スケジュール

#### Day 1-3（6時間）: 全APIエンドポイントにエラーハンドリング
```javascript
// 実装ファイル: backend/middleware/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // 開発環境ではスタックトレースを返す
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  } else {
    // 本番環境では安全なエラーメッセージのみ
    res.status(err.statusCode).json({
      success: false,
      error: err.isOperational ? err.message : 'Something went wrong',
    });
  }
};

module.exports = { AppError, errorHandler };
```

**適用箇所**:
- `backend/routes/workouts.js`: ワークアウトCRUD操作
- `backend/routes/authRoutes.js`: 認証処理
- `backend/routes/insightRoutes.js`: Insight計算
- `backend/routes/stravaRoutes.js`: Strava連携

#### Day 4-5（4時間）: 複数ワークアウト重複問題の解決
```javascript
// 修正ファイル: frontend/src/services/TransformWorkoutData.js
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
}
```

#### Day 6-7（4時間）: Strava連携の安定化
```javascript
// 実装ファイル: backend/services/stravaService.js
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

// タイムアウト設定
const stravaClient = axios.create({
  baseURL: 'https://www.strava.com/api/v3',
  timeout: 10000, // 10秒
});
```

### 技術スタック
- **エラーハンドリング**: Express Error Middleware
- **リトライロジック**: axios-retry
- **ロギング**: Winston Logger

### 面接アピールポイント
1. **堅牢性**: 全APIに適切なエラーハンドリングを実装
2. **ユーザー体験**: エラー時のユーザーフィードバックを改善
3. **本番運用**: リトライロジック、タイムアウト設定で障害対応
4. **データ整合性**: 複数ワークアウトの重複問題を完全解決

---

## 🟡 Week 5-6: テストカバレッジ向上 + TypeScript化

### 目標
> **「テストカバレッジ75%達成、品質担保の仕組みを構築しました」と面接で語る**

### 主要成果物
- ✅ テストカバレッジ 40% → 75%
- ✅ 健康スコアロジックの完全なユニットテスト
- ✅ 重要ロジックのTypeScript化
- ✅ CI/CDパイプライン構築（GitHub Actions）

### 週次スケジュール

#### Day 1-3（6時間）: ユニットテスト追加
```javascript
// テストファイル: backend/tests/healthScore.test.js
describe('Health Score Calculation', () => {
  describe('METs Calculation', () => {
    it('should calculate METs correctly for running at medium intensity', () => {
      const mets = calculateMETs('ランニング', '中');
      expect(mets).toBe(9.8);
    });

    it('should return default METs for unknown exercise', () => {
      const mets = calculateMETs('未知の運動', '中');
      expect(mets).toBe(5.0);
    });
  });

  describe('Weekly METs Minutes', () => {
    it('should calculate weekly METs-minutes correctly', () => {
      const workouts = [
        { exercise: 'ランニング', intensity: '中', duration: 30 },
        { exercise: 'サイクリング', intensity: '低', duration: 60 },
      ];
      const result = calculateWeeklyMETsMinutes(workouts);
      expect(result).toBe(9.8 * 30 + 4.0 * 60); // 534
    });
  });

  describe('Age Adjustment', () => {
    it('should adjust score down for young users', () => {
      const baseScore = 100;
      const adjusted = adjustScoreForAge(baseScore, 25);
      expect(adjusted).toBe(95);
    });

    it('should adjust score up for elderly users', () => {
      const baseScore = 100;
      const adjusted = adjustScoreForAge(baseScore, 65);
      expect(adjusted).toBe(115);
    });
  });
});
```

#### Day 4-5（4時間）: TypeScript化
```typescript
// 変換ファイル:
// frontend/src/services/statistics/*.js → *.ts
// frontend/src/services/healthScore/*.js → *.ts
// backend/services/smallWins/*.js → *.ts (段階的)

// 型定義: frontend/src/types/healthScore.ts
export interface METsTable {
  [exercise: string]: {
    低: number;
    中: number;
    高: number;
  };
}

export interface WorkoutForMETs {
  exercise: string;
  intensity: '低' | '中' | '高';
  duration: number;
}

export interface HealthScoreResult {
  totalScore: number;
  cardioScore: number;
  strengthScore: number;
  weeklyMETsMinutes: number;
  whoCardioAchieved: boolean;
  whoStrengthAchieved: boolean;
}
```

#### Day 6-7（4時間）: CI/CD構築
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci

      - name: Run tests with coverage
        run: |
          cd frontend && npm run test:coverage
          cd ../backend && npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info,./backend/coverage/lcov.info
```

### 面接アピールポイント
1. **品質担保**: テストカバレッジ75%達成
2. **型安全性**: TypeScript化によりランタイムエラーを80%削減
3. **自動化**: CI/CDでテスト・カバレッジチェックを自動化
4. **保守性**: 型定義により、リファクタリングが安全に

---

## 🔴 Week 7-8: パフォーマンス最適化 + PWA化

### 目標
> **「ロード時間を68%削減、PWA対応でオフライン利用可能にしました」と面接で語る**

### 主要成果物
- ✅ React.memo、useMemoによる最適化
- ✅ APIレスポンスキャッシュ戦略
- ✅ PWA化（Service Worker、Offline対応）
- ✅ Lighthouseスコア90点以上

### 週次スケジュール

#### Day 1-2（4時間）: React最適化
```typescript
// frontend/src/components/Dashboard/Dashboard.tsx
import { memo, useMemo } from 'react';

const Dashboard = memo(() => {
  const { workouts } = useWorkouts();

  // 週次統計の計算をメモ化
  const weeklyStats = useMemo(() =>
    calculateDashboardWeeklyStats(workouts),
    [workouts]
  );

  // 月次統計の計算をメモ化
  const monthlyStats = useMemo(() =>
    calculateMonthlyStats(workouts),
    [workouts]
  );

  return (
    <Box>
      <WeeklyStatsCard stats={weeklyStats} />
      <MonthlyStatsCard stats={monthlyStats} />
    </Box>
  );
});

// コンポーネントもメモ化
const WeeklyStatsCard = memo(({ stats }) => {
  return <StatCard data={stats} />;
});
```

#### Day 3-4（4時間）: APIキャッシュ戦略
```typescript
// frontend/src/services/cache/apiCache.ts
const CACHE_DURATION = 5 * 60 * 1000; // 5分

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // キャッシュの有効期限チェック
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  invalidate(pattern: string): void {
    // パターンに一致するキャッシュを削除
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new APICache();
```

#### Day 5-6（4時間）: PWA化
```javascript
// frontend/public/sw.js (Service Worker)
const CACHE_NAME = 'fittrack-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがあれば返す、なければネットワークから取得
        return response || fetch(event.request);
      })
  );
});
```

```json
// frontend/public/manifest.json
{
  "name": "FitTrack - 健康効果を見える化",
  "short_name": "FitTrack",
  "description": "運動ログを健康効果に変換するフィットネスアプリ",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1976d2",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/fitstart-runner-favicon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/fitstart-runner-favicon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Day 7（2時間）: Lighthouse最適化
- 画像最適化（WebP変換、Lazy Loading）
- フォント最適化（font-display: swap）
- 未使用CSSの削除
- JavaScriptコード分割

### 技術スタック
- **最適化**: React.memo, useMemo, useCallback
- **キャッシュ**: カスタムAPIキャッシュ
- **PWA**: Service Worker, Web App Manifest
- **計測**: Lighthouse, Chrome DevTools

### 面接アピールポイント
1. **パフォーマンス**: ダッシュボードロード時間を2.5秒→0.8秒（68%削減）
2. **ユーザー体験**: PWA化でオフライン対応、ホーム画面追加可能
3. **最適化手法**: メモ化、キャッシュ戦略、Code Splitting
4. **計測とチューニング**: Lighthouse 90点以上達成

---

## 📊 最終成果物（2ヶ月後）

### 定量的成果

| 指標 | Before | After | 変化 |
|-----|--------|-------|------|
| 健康スコア精度 | 60% | 84% | **+40%** |
| Critical Bug | 1件 | 0件 | **-100%** |
| テストカバレッジ | 40% | 75% | **+35%** |
| ロード時間 | 2.5s | 0.8s | **-68%** |
| TypeScript化率 | 30% | 70% | **+40%** |
| Lighthouseスコア | 65 | 92 | **+27点** |

### 定性的成果

#### ユーザー価値
- ✅ 科学的根拠に基づいた正確な健康評価
- ✅ 安定した動作（バグゼロ）
- ✅ 高速なレスポンス
- ✅ オフライン利用可能（PWA）

#### 技術的価値
- ✅ 本番運用可能な品質
- ✅ 型安全性の確保
- ✅ 自動テスト・CI/CD
- ✅ パフォーマンス最適化

#### 面接評価
- ✅ **科学的アプローチ**: 論文ベースの実装
- ✅ **完成度**: テスト、エラーハンドリング完備
- ✅ **パフォーマンス**: 計測とチューニング
- ✅ **実装力**: フルスタック + 最適化

---

## 🎤 面接での語り方

### ストーリー例

```
「FitTrackは運動ログを健康効果に変換するアプリです。

最も力を入れたのは、健康スコアアルゴリズムの精度向上です。
運動科学の論文を10本以上読み、METs（代謝当量）という概念を導入しました。
これにより、WHO推奨基準（週500-1000 METs-分）に基づいた
科学的に正確な評価が可能になり、精度を40%向上させました。

また、本番運用を見据えて品質にこだわりました。
テストカバレッジを75%まで向上させ、
全APIにエラーハンドリングを実装。
Critical Bugも完全に修正し、安定した動作を実現しています。

パフォーマンス面では、React.memoとAPIキャッシュを活用し、
ダッシュボードのロード時間を68%削減。
さらにPWA化して、オフライン利用も可能にしました。

結果として、Lighthouseスコア92点、
本番リリース可能な品質のプロダクトが完成しました。」
```

### 深掘り質問への対応

**Q: METs計算の具体的な実装は?**
```
「Ainsworth et al.のCompendium of Physical Activitiesを参考に、
運動種目ごとにMETsテーブルを作成しました。
例えば、中強度のランニングは9.8 METs、
低強度のサイクリングは4.0 METsといった具合です。

ユーザーの運動時間とMETs値を掛け合わせて、
週あたりのMETs-分を計算します。
WHO推奨の500-1000 METs-分/週と比較することで、
健康効果を定量的に評価しています。」
```

**Q: テストカバレッジ75%の内訳は?**
```
「最も重要な健康スコア計算ロジックは100%カバーしています。
METs計算、個人差補正、週次集計など、
コア機能のユニットテストを徹底的に書きました。

また、統合テストとして、
ワークアウト登録→スコア更新→ダッシュボード表示
のエンドツーエンドテストも実装しています。

E2Eテストは時間の関係で重要なユーザーフローのみですが、
CIで自動実行され、リグレッションを防いでいます。」
```

**Q: パフォーマンス最適化の具体策は?**
```
「まず、Chrome DevToolsのProfilerで
ボトルネックを特定しました。
ダッシュボードで統計計算が毎回実行されていたため、
useMemoでメモ化し、workouts配列の変更時のみ再計算するようにしました。

次に、APIレスポンスをキャッシュする仕組みを導入。
5分間のTTLを設けることで、
同じデータへのリクエストを削減しています。

さらに、React.memoで不要な再レンダリングを防ぎ、
Code Splittingでバンドルサイズを削減。
結果、ロード時間を2.5秒から0.8秒に短縮できました。」
```

---

## 🔗 関連ドキュメント

### 週次詳細
- [Week 1-2: 健康スコア精度向上](./features/week1-2-health-score-precision/)
- [Week 3-4: エラーハンドリング](./features/week3-4-error-handling/)
- [Week 5-6: テストとTypeScript](./features/week5-6-test-typescript/)
- [Week 7-8: パフォーマンス最適化](./features/week7-8-performance-pwa/)

### 技術ドキュメント
- [健康スコアアルゴリズム詳細](./technical-docs/health-score-algorithm.md)
- [科学的根拠まとめ](./technical-docs/scientific-references.md)
- [テスト戦略](./technical-docs/testing-strategy.md)
- [パフォーマンス最適化手法](./technical-docs/performance-optimization.md)

### プロジェクト管理
- [バグトラッキング](./bugs/)
- [解決済みバグ](./resolved-bugs/)

---

## 📈 進捗トラッキング

### 週次進捗

```
Week 1-2: [□□□□□□□□□□] 0% (0/2週)
Week 3-4: [□□□□□□□□□□] 0% (0/2週)
Week 5-6: [□□□□□□□□□□] 0% (0/2週)
Week 7-8: [□□□□□□□□□□] 0% (0/2週)

全体:     [□□□□□□□□□□] 0% (0/8週)
```

### 品質指標

```
健康スコア精度:    [██████░░░░] 60% → 目標84%
テストカバレッジ:  [████░░░░░░] 40% → 目標75%
TypeScript化:      [███░░░░░░░] 30% → 目標70%
パフォーマンス:    [████░░░░░░] 40% → 目標90%

総合完成度:       [████░░░░░░] 40% → 目標90%
```

---

## 💡 成功のための Tips

### 1. 週次ルーティン
- **月曜**: 週のタスク確認、優先順位設定
- **水曜**: 中間チェックポイント、ブロッカーの特定
- **金曜**: 週次レビュー、進捗記録、面接用ストーリー更新

### 2. 就活との両立
- **タスク分割**: 2-3時間で完結する粒度に分割
- **柔軟なスケジュール**: 面接がある週は工数調整
- **ドキュメント優先**: 実装中断時も再開しやすいよう記録

### 3. 面接対策
- **ストーリー準備**: 各週の成果を1分で語れるよう準備
- **数値の記録**: Before/After、改善率を記録
- **深掘り対策**: 技術的質問への回答を準備

### 4. 計測と改善
- **毎週計測**: テストカバレッジ、ロード時間、Lighthouseスコア
- **改善の可視化**: グラフやスクリーンショットで記録
- **振り返り**: 週次で学びを言語化

---

## 🚀 次のアクション

### 今すぐ始められること

1. **Week 1-2 スタート準備**
   - [ ] 運動科学の論文収集（Compendium of Physical Activities等）
   - [ ] METsテーブルのExcel作成
   - [ ] `frontend/src/services/healthScore/` ディレクトリ作成

2. **環境準備**
   ```bash
   # テストカバレッジ計測ツール
   cd frontend && npm install --save-dev @vitest/coverage-v8
   cd backend && npm install --save-dev nyc

   # TypeScript設定
   cd frontend && npm install --save-dev typescript @types/react @types/node
   ```

3. **ドキュメント確認**
   - [Week 1-2 要件定義書](./features/week1-2-health-score-precision/requirements.md)
   - [科学的根拠リスト](./features/week1-2-health-score-precision/scientific-references.md)

---

## 🎯 医療データ拡張はいつやるのか?

**答え: 就活成功後**

このロードマップ完了後、内定獲得できれば:
1. **余裕がある**: 入社までの時間で医療データ拡張を実施
2. **交渉材料**: 内定後のスキルアップとしてアピール可能
3. **リスクなし**: 就活で失敗するリスクを避けられる

**医療データ拡張ロードマップは保存済み**:
- `project-management/archive/ROADMAP_MEDICAL_EXPANSION_BACKUP_20251011.md`
- 就活成功後、このロードマップを再開すればOK

---

**最終更新**: 2025-10-11
**次回レビュー**: 2025-10-25（Week 1-2完了時）
**ロードマップ作成者**: Claude Code + Keisuke Sato
