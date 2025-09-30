# パフォーマンス指標と測定方法

## 📊 KPI定義と目標値

### 技術的KPI

| 指標 | 目標値 | 警告閾値 | 測定方法 | 頻度 |
|------|--------|---------|---------|------|
| **API Response Time (P95)** | < 200ms | > 500ms | Application Insights | リアルタイム |
| **First Contentful Paint (FCP)** | < 1.5s | > 2.5s | Lighthouse | 日次 |
| **Largest Contentful Paint (LCP)** | < 2.5s | > 4.0s | Web Vitals | リアルタイム |
| **Cumulative Layout Shift (CLS)** | < 0.1 | > 0.25 | Web Vitals | リアルタイム |
| **Time to Interactive (TTI)** | < 3.8s | > 5.0s | Lighthouse | 日次 |
| **エラー率** | < 0.1% | > 1% | Sentry | リアルタイム |
| **可用性** | > 99.9% | < 99.5% | Uptime Robot | 5分毎 |

### ビジネスKPI

| 指標 | 目標値 | 現状（仮） | 測定方法 |
|------|--------|----------|---------|
| **Small Wins生成成功率** | > 95% | 92% | ログ分析 |
| **データ同期レイテンシ (P95)** | < 60s | 55s | Webhook処理時間 |
| **エクスポート利用率** | > 15% | 12% | 月間アクティブユーザー比 |
| **同意取得率** | > 80% | 78% | 新規登録ユーザー比 |
| **D1 Retention** | > 40% | 35% | コホート分析 |
| **D7 Retention** | > 20% | 18% | コホート分析 |
| **D30 Retention** | > 10% | 12% | コホート分析 |

## 🔧 測定実装

### フロントエンド計測

```javascript
// /frontend/src/utils/performanceMonitor.js

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.initializeObservers();
  }

  initializeObservers() {
    // Web Vitals計測
    if ('PerformanceObserver' in window) {
      this.observeLCP();
      this.observeFCP();
      this.observeCLS();
      this.observeFID();
    }

    // カスタムメトリクス
    this.trackAPICallDuration();
    this.trackUserInteractions();
  }

  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;

      // アナリティクスに送信
      this.sendToAnalytics('lcp', this.metrics.lcp);

      // 閾値チェック
      if (this.metrics.lcp > 2500) {
        console.warn('LCP exceeded threshold:', this.metrics.lcp);
        this.reportPerformanceIssue('lcp', this.metrics.lcp);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  observeFCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          this.sendToAnalytics('fcp', this.metrics.fcp);
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  observeCLS() {
    let clsValue = 0;
    let clsEntries = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }

      this.metrics.cls = clsValue;

      if (clsValue > 0.1) {
        console.warn('High CLS detected:', clsValue);
        this.reportLayoutShift(clsEntries);
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  trackAPICallDuration() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        // APIコールの統計を記録
        this.recordAPIMetric(url, duration, response.status);

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.recordAPIMetric(url, duration, 0, error);
        throw error;
      }
    };
  }

  recordAPIMetric(url, duration, status, error = null) {
    const endpoint = new URL(url).pathname;

    if (!this.metrics.api) {
      this.metrics.api = {};
    }

    if (!this.metrics.api[endpoint]) {
      this.metrics.api[endpoint] = {
        calls: 0,
        totalDuration: 0,
        errors: 0,
        durations: []
      };
    }

    const metric = this.metrics.api[endpoint];
    metric.calls++;
    metric.totalDuration += duration;
    metric.durations.push(duration);

    if (error || status >= 400) {
      metric.errors++;
    }

    // P95計算
    if (metric.durations.length >= 20) {
      const sorted = [...metric.durations].sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      metric.p95 = sorted[p95Index];

      // 古いデータを削除（最新100件を保持）
      if (metric.durations.length > 100) {
        metric.durations = metric.durations.slice(-100);
      }
    }

    // 閾値チェック
    if (duration > 1000) {
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
    }
  }

  sendToAnalytics(metricName, value) {
    // Google Analytics or custom analytics
    if (window.gtag) {
      window.gtag('event', 'performance', {
        metric_name: metricName,
        value: value,
        page: window.location.pathname
      });
    }

    // カスタム分析サーバーへ送信
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metricName,
        value: value,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(err => console.error('Analytics error:', err));
  }

  getMetricsSummary() {
    const apiMetrics = this.metrics.api || {};
    const summary = {
      webVitals: {
        lcp: this.metrics.lcp,
        fcp: this.metrics.fcp,
        cls: this.metrics.cls,
        fid: this.metrics.fid
      },
      api: {}
    };

    // API メトリクスのサマリー
    Object.keys(apiMetrics).forEach(endpoint => {
      const metric = apiMetrics[endpoint];
      summary.api[endpoint] = {
        avgDuration: metric.totalDuration / metric.calls,
        p95Duration: metric.p95,
        errorRate: (metric.errors / metric.calls) * 100,
        totalCalls: metric.calls
      };
    });

    return summary;
  }
}

// シングルトンインスタンス
export default new PerformanceMonitor();
```

### バックエンド計測

```javascript
// /backend/middleware/performanceMonitor.js

const prometheus = require('prom-client');

// Prometheusメトリクス定義
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const smallWinsCalculationDuration = new prometheus.Histogram({
  name: 'small_wins_calculation_duration_seconds',
  help: 'Duration of Small Wins calculation',
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

const cacheHitRate = new prometheus.Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate percentage',
  labelNames: ['cache_type']
});

// ミドルウェア
const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  // レスポンス完了時の処理
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    // Prometheusメトリクス更新
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);

    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();

    // スローリクエストのログ
    if (duration > 1) {
      console.warn('Slow request:', {
        method: req.method,
        path: req.path,
        duration: `${duration}s`,
        status: res.statusCode
      });
    }

    // エラー率の追跡
    if (res.statusCode >= 500) {
      recordError(req, res, duration);
    }
  });

  next();
};

// データベースクエリ計測
const dbQueryMonitor = {
  queryStart: null,

  beforeQuery(query) {
    this.queryStart = Date.now();
  },

  afterQuery(query, result, error) {
    const duration = Date.now() - this.queryStart;

    // スロークエリのログ
    if (duration > 100) {
      console.warn('Slow query:', {
        query: query.sql,
        duration: `${duration}ms`,
        error: error?.message
      });
    }

    // メトリクス記録
    recordDBMetric(query, duration, error);
  }
};

module.exports = {
  performanceMonitor,
  dbQueryMonitor,
  metrics: prometheus.register
};
```

### SQL計測クエリ

```sql
-- Small Wins生成成功率
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN score > 0 THEN 1 END) as successful,
  (COUNT(CASE WHEN score > 0 THEN 1 END)::float / COUNT(*)) * 100 as success_rate
FROM insights
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- API レスポンスタイム分析
SELECT
  action,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99,
  AVG(duration_ms) as avg,
  COUNT(*) as count
FROM audit_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
  AND duration_ms IS NOT NULL
GROUP BY action
ORDER BY p95 DESC;

-- ユーザーリテンション計算
WITH cohorts AS (
  SELECT
    DATE_TRUNC('day', u.created_at) as cohort_date,
    u.id as user_id,
    MIN(w.date) as first_workout,
    MAX(w.date) as last_workout
  FROM users u
  LEFT JOIN workouts w ON u.id = w.userID
  WHERE u.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE_TRUNC('day', u.created_at), u.id
),
retention AS (
  SELECT
    cohort_date,
    COUNT(DISTINCT user_id) as cohort_size,
    COUNT(DISTINCT CASE
      WHEN first_workout >= cohort_date AND first_workout < cohort_date + INTERVAL '1 day'
      THEN user_id END) as d0,
    COUNT(DISTINCT CASE
      WHEN last_workout >= cohort_date + INTERVAL '1 day'
      THEN user_id END) as d1,
    COUNT(DISTINCT CASE
      WHEN last_workout >= cohort_date + INTERVAL '7 days'
      THEN user_id END) as d7,
    COUNT(DISTINCT CASE
      WHEN last_workout >= cohort_date + INTERVAL '30 days'
      THEN user_id END) as d30
  FROM cohorts
  GROUP BY cohort_date
)
SELECT
  cohort_date,
  cohort_size,
  ROUND(100.0 * d1 / NULLIF(cohort_size, 0), 2) as d1_retention,
  ROUND(100.0 * d7 / NULLIF(cohort_size, 0), 2) as d7_retention,
  ROUND(100.0 * d30 / NULLIF(cohort_size, 0), 2) as d30_retention
FROM retention
ORDER BY cohort_date DESC;

-- エクスポート利用率
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(DISTINCT user_id) as export_users,
  (SELECT COUNT(DISTINCT id) FROM users WHERE created_at <= DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month') as total_users,
  ROUND(100.0 * COUNT(DISTINCT user_id) /
    (SELECT COUNT(DISTINCT id) FROM users WHERE created_at <= DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'), 2) as export_rate
FROM export_jobs
WHERE status = 'completed'
  AND created_at >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY DATE_TRUNC('month', created_at);
```

## 📈 ダッシュボード設計

### リアルタイムダッシュボード

```typescript
// /frontend/src/components/PerformanceDashboard.tsx

interface MetricCard {
  title: string;
  value: number;
  unit: string;
  target: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await fetch('/api/metrics/realtime').then(r => r.json());

      setMetrics([
        {
          title: 'API Response Time (P95)',
          value: data.apiP95,
          unit: 'ms',
          target: 200,
          status: data.apiP95 < 200 ? 'good' : data.apiP95 < 500 ? 'warning' : 'critical',
          trend: data.apiP95Trend
        },
        {
          title: 'Error Rate',
          value: data.errorRate,
          unit: '%',
          target: 0.1,
          status: data.errorRate < 0.1 ? 'good' : data.errorRate < 1 ? 'warning' : 'critical',
          trend: data.errorTrend
        },
        {
          title: 'Small Wins Success',
          value: data.smallWinsSuccess,
          unit: '%',
          target: 95,
          status: data.smallWinsSuccess > 95 ? 'good' : data.smallWinsSuccess > 90 ? 'warning' : 'critical',
          trend: data.smallWinsTrend
        }
      ]);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // 30秒ごと更新

    return () => clearInterval(interval);
  }, []);

  return (
    <Grid container spacing={3}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} md={4} key={index}>
          <MetricCard {...metric} />
        </Grid>
      ))}
    </Grid>
  );
};
```

## 🚨 アラート設定

### アラートルール

```yaml
# prometheus-alerts.yml
groups:
  - name: fitstart
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} (threshold: 1%)"

      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "API response time degraded"
          description: "P95 response time is {{ $value }}s (threshold: 500ms)"

      - alert: LowCacheHitRate
        expr: cache_hit_rate < 60
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Cache hit rate is low"
          description: "Cache hit rate is {{ $value }}% (threshold: 60%)"
```

### 通知設定

```javascript
// /backend/services/alertManager.js

class AlertManager {
  async sendAlert(alert) {
    const channels = this.getAlertChannels(alert.severity);

    for (const channel of channels) {
      switch (channel) {
        case 'slack':
          await this.sendSlackAlert(alert);
          break;
        case 'email':
          await this.sendEmailAlert(alert);
          break;
        case 'pagerduty':
          await this.sendPagerDutyAlert(alert);
          break;
      }
    }
  }

  async sendSlackAlert(alert) {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    const color = {
      critical: 'danger',
      warning: 'warning',
      info: 'good'
    }[alert.severity];

    await fetch(webhook, {
      method: 'POST',
      body: JSON.stringify({
        attachments: [{
          color,
          title: alert.title,
          text: alert.description,
          fields: [
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Time', value: new Date().toISOString(), short: true }
          ]
        }]
      })
    });
  }
}
```

## 📊 レポート生成

### 週次パフォーマンスレポート

```javascript
// /backend/jobs/weeklyReport.js

const generateWeeklyReport = async () => {
  const report = {
    period: {
      start: dayjs().subtract(1, 'week').startOf('week'),
      end: dayjs().subtract(1, 'week').endOf('week')
    },
    metrics: {},
    insights: [],
    recommendations: []
  };

  // メトリクス収集
  report.metrics.availability = await calculateAvailability();
  report.metrics.avgResponseTime = await calculateAvgResponseTime();
  report.metrics.errorRate = await calculateErrorRate();
  report.metrics.userMetrics = await calculateUserMetrics();

  // インサイト生成
  if (report.metrics.errorRate > 0.5) {
    report.insights.push('エラー率が目標を超えています。エラーログを確認してください。');
  }

  if (report.metrics.avgResponseTime > 300) {
    report.insights.push('レスポンスタイムが遅延しています。パフォーマンス最適化を検討してください。');
  }

  // レポート送信
  await sendReportEmail(report);
  await saveReportToS3(report);

  return report;
};
```

---

**作成日**: 2025年9月26日
**バージョン**: 1.0.0
**作成者**: FitStart Tech Lead