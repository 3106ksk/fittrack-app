# データベース設計書

## 📊 概要

FitStart Health Decision Supportのデータベース設計。PostgreSQL 17を使用し、健康データの安全な保存と高速なクエリを実現します。

## 🗄️ テーブル構成

### 既存テーブル（拡張）

#### users テーブル
```sql
-- 既存フィールドに追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  health_profile JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{"shareData": false, "allowAnalytics": true}',
  last_insight_calculated_at TIMESTAMP,
  deletion_requested_at TIMESTAMP,
  deletion_scheduled_at TIMESTAMP;

-- インデックス追加
CREATE INDEX idx_users_deletion ON users(deletion_scheduled_at)
  WHERE deletion_scheduled_at IS NOT NULL;
```

#### workouts テーブル
```sql
-- 既存フィールドに追加
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  calories INTEGER,
  zone_minutes JSONB, -- {"zone1": 10, "zone2": 15, "zone3": 5}
  weather JSONB, -- {"temp": 20, "humidity": 60, "wind": 5}
  notes TEXT;

-- パフォーマンス用インデックス
CREATE INDEX idx_workouts_user_date ON workouts(userID, date DESC);
CREATE INDEX idx_workouts_intensity ON workouts(intensity)
  WHERE intensity IS NOT NULL;
```

### 新規テーブル

#### insights テーブル
```sql
CREATE TABLE insights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'achievement'
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  level VARCHAR(20), -- 'excellent', 'good', 'moderate', 'needs_improvement'
  rationale_json JSONB NOT NULL,
  recommendations TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cached_until TIMESTAMP,
  UNIQUE(user_id, date, type)
);

-- インデックス
CREATE INDEX idx_insights_user_date ON insights(user_id, date DESC);
CREATE INDEX idx_insights_score ON insights(score DESC) WHERE score >= 80;
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_cached ON insights(cached_until)
  WHERE cached_until > CURRENT_TIMESTAMP;

-- パーティショニング（月単位）
CREATE TABLE insights_2025_09 PARTITION OF insights
  FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
```

#### consents テーブル
```sql
CREATE TABLE consents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMP,
  revoked_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  version VARCHAR(10) DEFAULT '1.0',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_consents_user ON consents(user_id);
CREATE INDEX idx_consents_type ON consents(consent_type);
CREATE UNIQUE INDEX idx_consents_user_type_active
  ON consents(user_id, consent_type)
  WHERE revoked_at IS NULL;

-- トリガー: 同意の履歴保持
CREATE OR REPLACE FUNCTION archive_consent_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.granted != NEW.granted THEN
    INSERT INTO consent_history
      (user_id, consent_type, granted, changed_at, ip_address)
    VALUES
      (NEW.user_id, NEW.consent_type, NEW.granted, NOW(), NEW.ip_address);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consent_change_trigger
AFTER UPDATE ON consents
FOR EACH ROW EXECUTE FUNCTION archive_consent_history();
```

#### consent_history テーブル
```sql
CREATE TABLE consent_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  consent_type VARCHAR(50) NOT NULL,
  granted BOOLEAN,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  INDEX idx_consent_history_user (user_id)
);
```

#### audit_logs テーブル
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INTEGER,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  request_id UUID DEFAULT gen_random_uuid(),
  duration_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_request ON audit_logs(request_id);

-- パーティショニング（月単位）
CREATE TABLE audit_logs_2025_09 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
```

#### export_jobs テーブル
```sql
CREATE TABLE export_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_type VARCHAR(20) NOT NULL, -- 'pdf', 'csv'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  file_path TEXT,
  file_size_bytes INTEGER,
  parameters JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_export_user ON export_jobs(user_id);
CREATE INDEX idx_export_status ON export_jobs(status);
CREATE INDEX idx_export_expires ON export_jobs(expires_at)
  WHERE expires_at IS NOT NULL;
```

#### webhook_events テーブル
```sql
CREATE TABLE webhook_events (
  id SERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL, -- 'strava', 'healthkit'
  event_id VARCHAR(100) UNIQUE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_webhook_source ON webhook_events(source);
CREATE INDEX idx_webhook_processed ON webhook_events(processed, next_retry_at)
  WHERE processed = false;
CREATE INDEX idx_webhook_event_id ON webhook_events(event_id);
```

#### achievements テーブル
```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  UNIQUE(user_id, achievement_type)
);

-- インデックス
CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_achievements_earned ON achievements(earned_at DESC);
```

## 🔄 マイグレーション

### 初期マイグレーション
```sql
-- /backend/migrations/20250926000000_health_decision_support.sql

BEGIN;

-- insights テーブル作成
CREATE TABLE IF NOT EXISTS insights (...);

-- consents テーブル作成
CREATE TABLE IF NOT EXISTS consents (...);

-- audit_logs テーブル作成
CREATE TABLE IF NOT EXISTS audit_logs (...);

-- インデックス作成
CREATE INDEX CONCURRENTLY IF NOT EXISTS ...;

-- 初期データ投入
INSERT INTO consents (user_id, consent_type, granted, granted_at)
SELECT id, 'dataUsage', true, NOW()
FROM users
WHERE created_at < '2025-09-26';

COMMIT;
```

### ロールバック
```sql
BEGIN;

DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS export_jobs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS consent_history CASCADE;
DROP TABLE IF EXISTS consents CASCADE;
DROP TABLE IF EXISTS insights CASCADE;

-- カラム削除
ALTER TABLE users
  DROP COLUMN IF EXISTS health_profile,
  DROP COLUMN IF EXISTS privacy_settings,
  DROP COLUMN IF EXISTS last_insight_calculated_at,
  DROP COLUMN IF EXISTS deletion_requested_at,
  DROP COLUMN IF EXISTS deletion_scheduled_at;

ALTER TABLE workouts
  DROP COLUMN IF EXISTS heart_rate_avg,
  DROP COLUMN IF EXISTS heart_rate_max,
  DROP COLUMN IF EXISTS calories,
  DROP COLUMN IF EXISTS zone_minutes,
  DROP COLUMN IF EXISTS weather,
  DROP COLUMN IF EXISTS notes;

COMMIT;
```

## 📈 パフォーマンス最適化

### インデックス戦略
```sql
-- 複合インデックス（よく使うクエリ用）
CREATE INDEX idx_insights_user_date_type
  ON insights(user_id, date DESC, type);

CREATE INDEX idx_workouts_user_exercise_date
  ON workouts(userID, exercise, date DESC);

-- 部分インデックス（特定条件のクエリ高速化）
CREATE INDEX idx_high_score_insights
  ON insights(user_id, score)
  WHERE score >= 80;

-- JSONB用GINインデックス
CREATE INDEX idx_rationale_gin ON insights USING gin(rationale_json);
```

### クエリ最適化例
```sql
-- 週間サマリー取得（最適化済み）
WITH week_data AS (
  SELECT
    w.userID,
    DATE_TRUNC('week', w.date) as week_start,
    SUM(w.duration) as total_minutes,
    COUNT(DISTINCT w.date) as active_days,
    COUNT(*) as workout_count
  FROM workouts w
  WHERE w.userID = $1
    AND w.date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY w.userID, DATE_TRUNC('week', w.date)
)
SELECT
  wd.*,
  i.score,
  i.rationale_json
FROM week_data wd
LEFT JOIN insights i ON
  i.user_id = wd.userID
  AND i.date = CURRENT_DATE
  AND i.type = 'weekly';
```

### バキューム戦略
```sql
-- 自動バキューム設定
ALTER TABLE insights SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- 手動バキューム（週次）
VACUUM ANALYZE insights;
VACUUM ANALYZE workouts;
```

## 🔒 セキュリティ

### Row Level Security (RLS)
```sql
-- RLS有効化
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY insights_user_policy ON insights
  FOR ALL
  TO application_user
  USING (user_id = current_setting('app.current_user_id')::int);

CREATE POLICY consents_user_policy ON consents
  FOR ALL
  TO application_user
  USING (user_id = current_setting('app.current_user_id')::int);
```

### 暗号化
```sql
-- 機密データの暗号化
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Stravaトークンの暗号化保存
UPDATE users SET
  strava_access_token = pgp_sym_encrypt(
    strava_access_token,
    current_setting('app.encryption_key')
  )
WHERE strava_access_token IS NOT NULL;
```

## 📊 監視用ビュー

```sql
-- アクティブユーザー統計
CREATE VIEW v_user_activity_stats AS
SELECT
  u.id as user_id,
  COUNT(DISTINCT w.date) as total_workout_days,
  MAX(w.date) as last_workout_date,
  AVG(i.score) as avg_health_score,
  CASE
    WHEN MAX(w.date) >= CURRENT_DATE - INTERVAL '7 days' THEN 'active'
    WHEN MAX(w.date) >= CURRENT_DATE - INTERVAL '30 days' THEN 'inactive'
    ELSE 'dormant'
  END as activity_status
FROM users u
LEFT JOIN workouts w ON u.id = w.userID
LEFT JOIN insights i ON u.id = i.user_id
GROUP BY u.id;

-- エクスポート統計
CREATE VIEW v_export_stats AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  job_type,
  COUNT(*) as total_exports,
  AVG(file_size_bytes) as avg_file_size,
  COUNT(DISTINCT user_id) as unique_users
FROM export_jobs
WHERE status = 'completed'
GROUP BY DATE_TRUNC('day', created_at), job_type;
```

## 🗃️ バックアップ戦略

```bash
# 日次バックアップ
pg_dump -h localhost -U postgres -d fitstart \
  --table=workouts \
  --table=insights \
  --table=consents \
  -f backup_$(date +%Y%m%d).sql

# 増分バックアップ（WAL）
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'

# Point-in-Time Recovery設定
restore_command = 'cp /backup/wal/%f %p'
```

---

**作成日**: 2025年9月26日
**バージョン**: 1.0.0
**作成者**: FitStart Tech Lead