# Week 7-8: パフォーマンス最適化 + PWA化 - 要件定義書

**作成日**: 2025-10-11
**期間**: 2025年11月25日 - 12月8日（2週間）
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
- ダッシュボードのロード時間が遅い（2.5秒）
- 不要な再レンダリングが発生している
- APIレスポンスのキャッシュがない
- PWA対応していない（オフライン利用不可）

### Week 7-8の位置づけ
コア機能完成度向上ロードマップの**最終フェーズ**として、ユーザー体験を最大化し、本番リリース可能な状態に仕上げる。

---

## 目的とゴール

### 目的
> **「ロード時間68%削減、PWA対応でオフライン利用可能にしました」と面接で語る**

### ゴール

#### 1. パフォーマンス最適化
- ✅ ダッシュボードロード時間: 2.5秒 → 0.8秒（68%削減）
- ✅ API応答時間(P95): 450ms → 150ms（67%削減）
- ✅ 不要な再レンダリングの削減

#### 2. PWA化
- ✅ Service Workerの実装
- ✅ オフライン対応
- ✅ ホーム画面へのインストール可能

#### 3. Lighthouse最適化
- ✅ Lighthouseスコア: 65点 → 92点以上
- ✅ Performance: 90点以上
- ✅ Best Practices: 95点以上

---

## 機能要件

### FR-1: React最適化

#### FR-1.1 useMemoによるメモ化
**優先度**: P0（必須）

**要件**:
- 統計計算関数をuseMemoでメモ化
- workouts配列の変更時のみ再計算

**受け入れ基準**:
- [ ] `calculateDashboardWeeklyStats` をメモ化
- [ ] `calculateMonthlyStats` をメモ化
- [ ] `calculateHealthScore` をメモ化
- [ ] 再レンダリング回数: 70%削減

**実装ファイル**:
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/components/insights/HealthScoreCard.jsx`

**実装例**:
```typescript
// Dashboard.tsx
import { memo, useMemo } from 'react';

const Dashboard = memo(() => {
  const { workouts, loading } = useWorkouts();

  // 週次統計の計算をメモ化
  const weeklyStats = useMemo(() => {
    if (!workouts || workouts.length === 0) return null;
    return calculateDashboardWeeklyStats(workouts);
  }, [workouts]); // workouts配列が変更された時のみ再計算

  // 月次統計の計算をメモ化
  const monthlyStats = useMemo(() => {
    if (!workouts || workouts.length === 0) return null;
    return calculateMonthlyStats(workouts);
  }, [workouts]);

  // 健康スコアの計算をメモ化
  const healthScore = useMemo(() => {
    if (!workouts || workouts.length === 0) return null;
    return calculateHealthScore(workouts);
  }, [workouts]);

  if (loading) return <DashboardSkeleton />;

  return (
    <Box>
      <WeeklyStatsCard stats={weeklyStats} />
      <MonthlyStatsCard stats={monthlyStats} />
      <HealthScoreCard score={healthScore} />
    </Box>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;
```

---

#### FR-1.2 React.memoによるコンポーネントメモ化
**優先度**: P0（必須）

**要件**:
- 頻繁に再レンダリングされるコンポーネントをメモ化
- propsが変更されない限り再レンダリングを防ぐ

**受け入れ基準**:
- [ ] `StatCard` をメモ化
- [ ] `WeeklyStatsCard` をメモ化
- [ ] `MonthlyStatsCard` をメモ化
- [ ] `HealthScoreCard` をメモ化
- [ ] 再レンダリング回数: 60%削減

**実装ファイル**:
- `frontend/src/components/statistics/StatCard.jsx`
- `frontend/src/components/statistics/WeeklyStatsCard.jsx`
- `frontend/src/components/insights/HealthScoreCard.jsx`

**実装例**:
```typescript
// StatCard.tsx
import { memo } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  changeRate?: number;
  icon?: React.ReactNode;
}

const StatCard = memo(({ title, value, changeRate, icon }: StatCardProps) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          {icon}
        </Box>
        <Typography variant="h4">{value}</Typography>
        {changeRate !== undefined && (
          <Typography
            variant="body2"
            color={changeRate >= 0 ? 'success.main' : 'error.main'}
          >
            {changeRate >= 0 ? '+' : ''}{changeRate}%
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';
export default StatCard;
```

---

#### FR-1.3 useCallbackによるコールバックメモ化
**優先度**: P1（高）

**要件**:
- イベントハンドラーをuseCallbackでメモ化
- 子コンポーネントへのprops安定化

**受け入れ基準**:
- [ ] フォーム送信ハンドラーをメモ化
- [ ] フィルター変更ハンドラーをメモ化
- [ ] 子コンポーネントの不要な再レンダリングを防ぐ

**実装例**:
```typescript
const WorkoutForm = () => {
  const { submitWorkout } = useWorkoutSubmit();

  const handleSubmit = useCallback(async (data) => {
    await submitWorkout(data);
    showFeedback('ワークアウトを記録しました');
  }, [submitWorkout]);

  return <WorkoutFormComponent onSubmit={handleSubmit} />;
};
```

---

### FR-2: APIキャッシュ戦略

#### FR-2.1 カスタムAPIキャッシュの実装
**優先度**: P0（必須）

**要件**:
- APIレスポンスをメモリキャッシュ
- TTL（Time To Live）: 5分
- キャッシュの無効化機能

**受け入れ基準**:
- [ ] GET /workouts: 5分キャッシュ
- [ ] GET /insights/current: 5分キャッシュ
- [ ] ワークアウト作成後、キャッシュ無効化
- [ ] キャッシュヒット率: 60%以上

**実装ファイル**:
- `frontend/src/services/cache/apiCache.ts`（新規）
- `frontend/src/services/api.ts`（キャッシュ適用）

**実装例**:
```typescript
// apiCache.ts
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

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new APICache();
```

**使用例**:
```typescript
// api.ts
export const getWorkouts = async () => {
  const cacheKey = 'workouts';
  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log('Cache hit:', cacheKey);
    return cached;
  }

  const response = await axios.get('/workouts');
  apiCache.set(cacheKey, response.data);
  return response.data;
};

export const createWorkout = async (data) => {
  const response = await axios.post('/workouts', data);

  // ワークアウト作成後、関連キャッシュを無効化
  apiCache.invalidate('workouts');
  apiCache.invalidate('insights');

  return response.data;
};
```

---

### FR-3: PWA化

#### FR-3.1 Service Workerの実装
**優先度**: P0（必須）

**要件**:
- Service Workerでアセットをキャッシュ
- ネットワーク優先戦略（Network First）
- オフライン時のフォールバック

**受け入れ基準**:
- [ ] Service Workerが正しく登録される
- [ ] 静的アセット（HTML, CSS, JS）がキャッシュされる
- [ ] オフライン時、キャッシュから提供
- [ ] ネットワーク復帰時、自動同期

**実装ファイル**:
- `frontend/public/sw.js`（新規）
- `frontend/src/main.tsx`（Service Worker登録）

**実装例**:
```javascript
// sw.js
const CACHE_NAME = 'fittrack-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/fitstart-runner-favicon-192.png',
  '/fitstart-runner-favicon-512.png',
];

// インストール時: キャッシュ作成
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時: ネットワーク優先戦略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // レスポンスをキャッシュに保存
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // ネットワークエラー時: キャッシュから取得
        return caches.match(event.request);
      })
  );
});

// アクティベート時: 古いキャッシュ削除
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

**Service Worker登録**:
```typescript
// main.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

---

#### FR-3.2 Web App Manifestの作成
**優先度**: P0（必須）

**要件**:
- manifest.jsonの作成
- アイコン設定（192x192, 512x512）
- ホーム画面へのインストールプロンプト

**受け入れ基準**:
- [ ] manifest.jsonが正しく配置されている
- [ ] アイコンが2サイズ（192x192, 512x512）ある
- [ ] "Add to Home Screen" プロンプトが表示される
- [ ] インストール後、スタンドアロンで起動

**実装ファイル**:
- `frontend/public/manifest.json`（新規）

**実装例**:
```json
{
  "name": "FitTrack - 健康効果を見える化",
  "short_name": "FitTrack",
  "description": "運動ログを健康効果に変換するフィットネスアプリ",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1976d2",
  "background_color": "#ffffff",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/fitstart-runner-favicon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/fitstart-runner-favicon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

### FR-4: Lighthouse最適化

#### FR-4.1 画像最適化
**優先度**: P1（高）

**要件**:
- WebP形式への変換
- Lazy Loadingの実装
- 適切なサイズ指定

**受け入れ基準**:
- [ ] 全画像をWebP形式に変換
- [ ] 画像にLazy Loading適用
- [ ] width/height属性を指定

**実装例**:
```tsx
<img
  src="/images/demo.webp"
  alt="Demo"
  width="350"
  height="700"
  loading="lazy"
/>
```

---

#### FR-4.2 フォント最適化
**優先度**: P1（高）

**要件**:
- `font-display: swap` の設定
- 必要なフォントのみ読み込み

**受け入れ基準**:
- [ ] `font-display: swap` が設定されている
- [ ] CLS（Cumulative Layout Shift）: 0.1以下

**実装例**:
```css
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/roboto.woff2') format('woff2');
  font-display: swap;
}
```

---

#### FR-4.3 Code Splitting
**優先度**: P2（中）

**要件**:
- Routeごとにコード分割
- 動的インポート

**受け入れ基準**:
- [ ] 初期バンドルサイズ: 300KB以下
- [ ] Routeごとに分割されている

**実装例**:
```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const WorkoutForm = lazy(() => import('./pages/WorkoutForm'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workout" element={<WorkoutForm />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 非機能要件

### NFR-1: パフォーマンス
- [ ] ダッシュボードロード時間: 0.8秒以内
- [ ] API応答時間(P95): 150ms以内
- [ ] FCP（First Contentful Paint）: 1.5秒以内
- [ ] TTI（Time to Interactive）: 2.5秒以内

### NFR-2: Lighthouse スコア
- [ ] Performance: 90点以上
- [ ] Accessibility: 95点以上
- [ ] Best Practices: 95点以上
- [ ] SEO: 90点以上

### NFR-3: PWA
- [ ] オフライン動作: 基本機能利用可能
- [ ] インストール可能: iOS, Android両対応
- [ ] Service Worker更新: 自動

---

## 成功基準

### 定量的基準

| 指標 | Before | After | 目標 |
|-----|--------|-------|------|
| ダッシュボードロード時間 | 2.5s | 0.8s | -68% |
| API応答時間(P95) | 450ms | 150ms | -67% |
| 再レンダリング回数 | 100% | 30% | -70% |
| Lighthouseスコア | 65 | 92 | +27点 |
| 初期バンドルサイズ | 500KB | 280KB | -44% |
| キャッシュヒット率 | 0% | 65% | +65% |

### 定性的基準

#### ユーザー価値
- [ ] ダッシュボードが高速に表示される
- [ ] オフラインでも基本機能が使える
- [ ] ホーム画面から起動できる

#### 開発者体験
- [ ] パフォーマンス計測が自動化されている
- [ ] Lighthouseスコアをモニタリング
- [ ] PWA対応で開発効率向上

#### 面接評価
- [ ] パフォーマンス最適化の具体的手法を語れる
- [ ] 計測とチューニングのプロセスを説明できる
- [ ] PWAの技術的メリットを理解している

---

## リスクと対応策

### リスク1: 最適化の効果が限定的
**発生確率**: 低
**影響度**: 中

**対応策**:
- Chrome DevToolsでボトルネック特定
- 計測→最適化→計測のサイクルを回す
- 効果の大きい施策を優先

### リスク2: Service Worker の複雑さ
**発生確率**: 中
**影響度**: 低

**対応策**:
- Workboxライブラリの活用（オプション）
- シンプルなキャッシュ戦略から開始
- 段階的な実装

---

## 次のステップ

1. [Week 7-8 設計書](./design.md) の確認
2. React最適化の実装開始
3. Lighthouseスコア計測

---

**最終更新**: 2025-10-11
**承認者**: Keisuke Sato
**次回レビュー**: 2025-12-08（Week 7-8完了時）
