# API仕様書

## 📡 API概要

FitStart Health Decision Support APIは、RESTfulアーキテクチャに基づいて設計されています。

### ベースURL
- 開発環境: `http://localhost:8000/api`
- 本番環境: `https://api.fitstart.health/api`

### 認証
すべてのAPIエンドポイントはJWT Bearer Token認証が必要です。

```http
Authorization: Bearer <jwt_token>
```

## 🎯 Insights API

### GET /api/insights/daily

日次の健康スコアと根拠を取得

#### リクエスト

```http
GET /api/insights/daily?date=2025-09-26
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### パラメータ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| date | string | No | YYYY-MM-DD形式。省略時は今日 |
| userId | string | No | 管理者のみ他ユーザーを指定可能 |

#### レスポンス

```json
{
  "status": "success",
  "data": {
    "type": "daily",
    "date": "2025-09-26",
    "score": 85,
    "level": "excellent",
    "rationale": {
      "weeklyMinutes": 157,
      "targetMinutes": 150,
      "achievementRate": 104.7,
      "streakDays": 7,
      "weekOverWeekChange": 12.1,
      "activeDays": 5,
      "healthBenefit": {
        "level": "gold",
        "message": "WHO推奨達成：心疾患リスク30%減",
        "evidence": "WHO Physical Activity Guidelines 2020"
      }
    },
    "recommendations": [
      "Zone2運動をあと15分増やすと脂質代謝が向上します",
      "週末も軽い運動を継続して連続記録を伸ばしましょう"
    ]
  }
}
```

#### エラーレスポンス

```json
{
  "status": "error",
  "error": {
    "code": "INSIGHTS_NOT_FOUND",
    "message": "指定された日付のインサイトが見つかりません",
    "details": {
      "date": "2025-09-26",
      "userId": "123"
    }
  }
}
```

---

### GET /api/insights/weekly

週次の健康スコアサマリーを取得

#### リクエスト

```http
GET /api/insights/weekly?startDate=2025-09-20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### レスポンス

```json
{
  "status": "success",
  "data": {
    "type": "weekly",
    "startDate": "2025-09-20",
    "endDate": "2025-09-26",
    "averageScore": 82,
    "totalMinutes": 157,
    "totalDistance": 25.3,
    "activeDays": 5,
    "dailyScores": [
      { "date": "2025-09-20", "score": 78 },
      { "date": "2025-09-21", "score": 85 },
      { "date": "2025-09-22", "score": 0 },
      { "date": "2025-09-23", "score": 90 },
      { "date": "2025-09-24", "score": 88 },
      { "date": "2025-09-25", "score": 92 },
      { "date": "2025-09-26", "score": 85 }
    ],
    "achievements": [
      {
        "type": "weekly_goal",
        "title": "週間目標達成",
        "description": "WHO推奨の週150分を達成しました",
        "earnedAt": "2025-09-25T10:30:00Z"
      }
    ]
  }
}
```

---

### POST /api/insights/calculate

手動でインサイトを再計算（管理者のみ）

#### リクエスト

```http
POST /api/insights/calculate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "userId": "123",
  "date": "2025-09-26",
  "force": true
}
```

## 🔐 Consent API

### GET /api/consents

ユーザーの同意状態を取得

#### レスポンス

```json
{
  "status": "success",
  "data": {
    "dataUsage": {
      "granted": true,
      "grantedAt": "2025-09-01T10:00:00Z",
      "description": "運動データの健康指標への変換"
    },
    "stravaSync": {
      "granted": true,
      "grantedAt": "2025-09-01T10:00:00Z",
      "description": "Stravaデータの自動同期"
    },
    "exportData": {
      "granted": false,
      "description": "データのエクスポート許可"
    },
    "analytics": {
      "granted": true,
      "grantedAt": "2025-09-01T10:00:00Z",
      "description": "匿名化された利用統計"
    }
  }
}
```

---

### POST /api/consents

同意状態を更新

#### リクエスト

```json
{
  "consentType": "dataUsage",
  "granted": true,
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

#### レスポンス

```json
{
  "status": "success",
  "data": {
    "id": 456,
    "userId": 123,
    "consentType": "dataUsage",
    "granted": true,
    "grantedAt": "2025-09-26T14:30:00Z"
  }
}
```

---

### DELETE /api/consents/:consentType

特定の同意を撤回

#### リクエスト

```http
DELETE /api/consents/stravaSync
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📄 Export API

### GET /api/export/pdf

健康レポートをPDF形式でダウンロード

#### リクエスト

```http
GET /api/export/pdf?startDate=2025-08-01&endDate=2025-09-26&lang=ja
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### パラメータ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| startDate | string | Yes | 開始日（YYYY-MM-DD） |
| endDate | string | Yes | 終了日（YYYY-MM-DD） |
| lang | string | No | 言語（ja/en）デフォルト: ja |
| format | string | No | medical/personal デフォルト: personal |

#### レスポンス

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="health_report_2025-09-26.pdf"
Content-Length: 245632

[Binary PDF Data]
```

---

### GET /api/export/csv

運動データをCSV形式でダウンロード

#### リクエスト

```http
GET /api/export/csv?startDate=2025-08-01&endDate=2025-09-26
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### レスポンス

```csv
Date,Exercise,Type,Duration(min),Distance(km),Intensity,Score,HealthBenefit
2025-09-26,ランニング,cardio,30,5.2,moderate,85,WHO推奨達成
2025-09-25,筋トレ,strength,45,,high,90,筋力向上
```

## 🔄 Webhook API

### POST /api/strava/webhook

Stravaからのイベント通知を受信

#### リクエスト（Stravaから）

```json
{
  "subscription_id": 120475,
  "owner_id": 134815,
  "object_id": 987654321,
  "object_type": "activity",
  "aspect_type": "create",
  "event_time": 1695830400
}
```

#### レスポンス

```json
{
  "status": "success",
  "message": "Event received and queued"
}
```

---

### GET /api/strava/webhook

Webhook検証（Strava登録時）

#### リクエスト

```http
GET /api/strava/webhook?hub.mode=subscribe&hub.verify_token=FITSTART_2025&hub.challenge=15f7d1a91c1f40f8
```

#### レスポンス

```json
{
  "hub.challenge": "15f7d1a91c1f40f8"
}
```

## 🏥 Health Metrics API

### GET /api/health/weekly-metrics

週間健康メトリクスの取得

#### レスポンス

```json
{
  "status": "success",
  "data": {
    "weeklyMinutes": 157,
    "activeDays": 5,
    "totalSleepHours": 49,
    "preSleepHighIntensity": 1,
    "streakDays": 7,
    "weekOverWeekChange": 12.1,
    "zone2Minutes": 45,
    "recommendations": {
      "exercise": "Zone2運動を週2回追加",
      "sleep": "就寝2時間前の運動を避ける",
      "recovery": "週1回の完全休養日を設ける"
    }
  }
}
```

## 🛡️ エラーコード一覧

| コード | HTTPステータス | 説明 |
|-------|--------------|------|
| AUTH_INVALID_TOKEN | 401 | 無効なトークン |
| AUTH_EXPIRED_TOKEN | 401 | 期限切れトークン |
| AUTH_INSUFFICIENT_PERMISSIONS | 403 | 権限不足 |
| INSIGHTS_NOT_FOUND | 404 | インサイトが見つからない |
| INSIGHTS_CALCULATION_ERROR | 500 | 計算エラー |
| CONSENT_REQUIRED | 403 | 同意が必要 |
| EXPORT_INVALID_RANGE | 400 | 無効な日付範囲 |
| EXPORT_TOO_LARGE | 413 | データ量が大きすぎる |
| RATE_LIMIT_EXCEEDED | 429 | レート制限超過 |
| WEBHOOK_INVALID_SIGNATURE | 401 | 無効な署名 |

## ⚡ レート制限

| エンドポイント | 制限 | ウィンドウ |
|--------------|------|-----------|
| /api/insights/* | 100回 | 1分 |
| /api/export/* | 10回 | 1時間 |
| /api/consents/* | 50回 | 1分 |
| /api/strava/webhook | 1000回 | 1分 |

レート制限情報はレスポンスヘッダーに含まれます：

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1695830400
```

## 🔄 バージョニング

APIバージョンはURLパスに含めません。代わりにAcceptヘッダーで指定：

```http
Accept: application/vnd.fitstart.v1+json
```

破壊的変更がある場合は新バージョンを作成し、6ヶ月間は旧バージョンもサポートします。

---

**作成日**: 2025年9月26日
**バージョン**: 1.0.0
**作成者**: FitStart Tech Lead