# JWT/CORS設定強化 - 要件定義書

**プロジェクト名**: FitTrack App セキュリティ強化プロジェクト  
**対象期間**: 2025年9月5日 - 9月13日  
**面接目標日**: 2025年9月13日  
**投資時間**: 3時間（Week1スケジュール内）

---

## 🎯 ビジネス要件

### 1. 面接評価基準への対応
- **ヘルステック企業**: 個人健康情報保護レベルのセキュリティ実装
- **バックエンド企業**: エンタープライズレベルのAPI セキュリティ設計
- **差別化要素**: セキュリティ設計思想を論理的に説明できる実装

### 2. コンプライアンス要求
- GDPR Article 32 (Security of processing) 準拠
- OWASP Top 10 対策の体系的実装  
- 医療情報システム安全管理ガイドライン考慮

---

## 📊 現状分析

### 現状の実装レベル

| 項目 | 現状 | 面接評価 | ギャップ |
|------|------|----------|----------|
| CORS設定 | 基本的な origin 設定 | ✅ 実装済み | セキュリティオプション不足 |
| JWT設定 | 基本的な認証のみ | ✅ 実装済み | ローテーション・ブラックリスト未実装 |
| セキュリティヘッダー | 未実装 | ❌ 致命的 | helmet導入必須 |
| レート制限 | 未実装 | ❌ 本番レベル不足 | API保護が不十分 |
| 環境変数検証 | 未実装 | ❌ 運用品質不足 | 起動時チェック必要 |

---

## 🎯 機能要件定義

### Priority 1: 面接必須項目（120分）

#### F1. 本番レベルCORS設定
```typescript
interface ProductionCORSConfig {
  origin: string | string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}
```

**要求仕様:**
- ✅ 医療システム特有ヘッダー対応: `X-Patient-ID`, `X-Medical-Session`
- ✅ プリフライトキャッシュ: 24時間（本番効率化）
- ✅ メソッド制限: GET, POST, PUT, DELETE のみ許可
- ✅ IE11対応: optionsSuccessStatus 200

#### F2. セキュリティヘッダー実装
```typescript
interface SecurityHeaders {
  contentSecurityPolicy: CSPDirectives;
  hsts: HSTSOptions;
  xssFilter: boolean;
  frameguard: FrameguardOptions;
  noSniff: boolean;
}
```

**要求仕様:**
- ✅ CSP設定: XSS防止、インライン実行制御
- ✅ HSTS: HTTPS強制（本番環境）
- ✅ X-Frame-Options: クリックジャッキング防止
- ✅ X-Content-Type-Options: MIMEタイプスニッフィング防止

#### F3. JWT強化機能
```typescript
interface JWTEnhancements {
  tokenRotation: TokenRotationConfig;
  blacklist: TokenBlacklist;
  refreshToken: RefreshTokenConfig;
}
```

### Priority 2: 差別化項目（60分）

#### F4. API レート制限
- エンドポイント別制限設定
- 認証済みユーザーの制限緩和
- DDoS攻撃対策

#### F5. 環境変数バリデーション
- 起動時必須環境変数チェック
- 不正値の早期検出
- 本番環境向け設定チェック

---

## 🔧 技術仕様設計

### アーキテクチャ設計

```
Client Request
      ↓
Rate Limiting Middleware
      ↓
Helmet Security Headers
      ↓
CORS Validation
      ↓
JWT Authentication
      ↓
Route Handler

Environment Validator → App Startup
Token Blacklist → JWT Authentication
CSP Policy → Helmet Security Headers
```

### 実装ファイル構成

```
backend/
├── middleware/
│   ├── security.js          # セキュリティヘッダー設定
│   ├── rateLimiter.js       # API レート制限
│   ├── corsConfig.js        # 強化CORS設定  
│   └── jwtEnhanced.js       # JWT拡張機能
├── config/
│   ├── security.config.js   # セキュリティ設定集約
│   └── environment.js       # 環境変数検証
└── utils/
    └── tokenManager.js      # トークン管理ユーティリティ
```

---

## 📈 技術仕様詳細

### 1. 強化CORS設定仕様

```javascript
// middleware/corsConfig.js
const getEnhancedCorsConfig = (env) => {
  const baseConfig = {
    credentials: true,
    optionsSuccessStatus: 200, // IE11 support
    preflightContinue: false,
  };

  if (env === 'production') {
    return {
      ...baseConfig,
      origin: process.env.CORS_ORIGIN_PROD,
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // 制限的
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Patient-ID',      // ヘルステック対応
        'X-Medical-Session', // 医療認証
        'X-Request-ID'       // トレーサビリティ
      ],
      exposedHeaders: ['X-Rate-Limit-Remaining'],
      maxAge: 86400, // 24時間プリフライトキャッシュ
    };
  }
  
  // 開発環境: 柔軟性重視
  return {
    ...baseConfig,
    origin: true, // 全origin許可（開発効率）
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  };
};
```

### 2. セキュリティヘッダー仕様

```javascript
// middleware/security.js
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // React/Vite対応
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://d2xx9szqz1v0k8.cloudfront.net"], // Strava画像
      connectSrc: ["'self'", "https://www.strava.com"], // Strava API
      fontSrc: ["'self'", "https://fonts.googleapis.com"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1年
    includeSubDomains: true,
    preload: true
  }
};
```

### 3. JWT強化仕様

```javascript
// utils/tokenManager.js
class TokenManager {
  // アクセストークン: 短期間（15分）
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: '15m',
      issuer: 'fittrack-api',
      audience: 'fittrack-client'
    });
  }

  // リフレッシュトークン: 長期間（7日）
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  // トークンブラックリスト管理
  async blacklistToken(token) {
    const decoded = jwt.decode(token);
    await redis.setex(`blacklist:${token}`, decoded.exp, 'true');
  }
}
```

---

## 🎭 面接説明シナリオ

### ヘルステック企業向け（3分間）

**Opening (30秒)**
> 「FitTrackアプリでは、個人健康情報保護を最重要視したセキュリティ設計を実装しています。GDPR Article 32準拠レベルの技術的安全管理措置を適用しました。」

**技術詳細 (90秒)**
> 「具体的には、3つの層で保護しています。第1層はCORS設定で、医療認証ヘッダー`X-Patient-ID`に対応し、プリフライト24時間キャッシュで効率と安全性を両立。第2層はCSP設定で、外部スクリプト実行を完全制御してXSS攻撃を防止。第3層はJWTトークンローテーション（15分）で、長期セッション情報漏洩のリスクを最小化しています。」

**差別化要素 (60秒)**
> 「特に、医療システム連携を想定した`X-Medical-Session`ヘッダー対応や、HIPAA準拠レベルの監査ログ設計により、将来的な医療機関との連携拡張にも対応可能な構成になっています。」

### バックエンド企業向け（3分間）

**Opening (30秒)**  
> 「スケーラブルなAPI基盤として、エンタープライズレベルのセキュリティ設計を実装しています。OWASP Top 10を体系的に対策し、99.9%可用性を目指した設計です。」

**技術詳細 (90秒)**
> 「アーキテクチャとしては、レイヤード・セキュリティを採用。入口でRate Limiting（認証済み100req/min、未認証20req/min）、Helmetで11種類のセキュリティヘッダー自動設定、動的CORS検証で不正オリジンを排除。認証層では、短期アクセストークン（15分）と長期リフレッシュトークン（7日）の組み合わせで、セキュリティと利便性を両立させています。」

**運用観点 (60秒)**
> 「本番運用では、環境変数の起動時バリデーション、Redis使用のトークンブラックリスト、APIエンドポイント別の詳細な監査ログにより、障害時の迅速な原因特定と自動復旧を実現しています。」

---

## 📋 実装優先順位マトリックス

| 優先度 | 機能 | 面接インパクト | 実装時間 | 技術難易度 | ROI |
|--------|------|----------------|----------|------------|-----|
| **🔥 P0** | Helmet セキュリティヘッダー | ⭐⭐⭐⭐⭐ | 30分 | 低 | 超高 |
| **🔥 P0** | 強化CORS設定 | ⭐⭐⭐⭐⭐ | 45分 | 中 | 超高 |  
| **🔴 P1** | 環境変数バリデーション | ⭐⭐⭐⭐ | 30分 | 低 | 高 |
| **🔴 P1** | API レート制限 | ⭐⭐⭐⭐ | 45分 | 中 | 高 |
| **🟡 P2** | JWT トークンローテーション | ⭐⭐⭐ | 60分 | 高 | 中 |
| **🟡 P2** | セキュリティログ | ⭐⭐ | 30分 | 低 | 中 |

### 3時間での推奨実装順序

```bash
# Phase 1 (75分): 基盤強化
1. npm install helmet express-rate-limit morgan    # 5分
2. Helmet導入 + 基本CSP設定                         # 30分  
3. 強化CORS設定（医療ヘッダー対応）                   # 40分

# Phase 2 (60分): 運用品質向上  
4. 環境変数バリデーション                           # 30分
5. API レート制限（エンドポイント別）                 # 30分

# Phase 3 (45分): 差別化要素
6. 基本的なセキュリティログ                         # 30分
7. 面接用コメント・説明資料                         # 15分
```

---

## ✅ 受け入れ基準

### 機能テスト基準
- [ ] CORS preflight リクエストが正常に処理される
- [ ] 不正オリジンからのリクエストが拒否される  
- [ ] CSPヘッダーが適切に設定される
- [ ] レート制限が正常に動作する
- [ ] JWT トークンローテーションが機能する

### 面接評価基準  
- [ ] セキュリティ設計の3分間説明ができる
- [ ] 「なぜこの設定にしたのか」を根拠とともに答えられる
- [ ] OWASP Top 10 のうち最低5項目への対策を説明できる
- [ ] 医療情報保護の観点を含めて説明できる
- [ ] 本番運用を考慮した設定理由を説明できる

---

## 🚀 完了判定基準

### 技術達成基準
- [ ] `helmet()` 導入でセキュリティヘッダー11種類が自動設定される
- [ ] CORS設定で医療認証ヘッダーが適切に許可される
- [ ] 不正なオリジンからのリクエストが確実に拒否される
- [ ] API レート制限が環境別に正しく動作する
- [ ] 必須環境変数の不足時に適切なエラーで停止する

### 面接準備基準  
- [ ] セキュリティ設計の3分間説明ができる
- [ ] 「なぜこの設定にしたのか」を根拠とともに答えられる
- [ ] OWASP Top 10 のうち最低5項目への対策を説明できる
- [ ] 医療情報保護の観点を含めた説明ができる
- [ ] 本番運用時の監視・メンテナンス方針を説明できる

---

## 🎯 成功指標

**最小限成功ライン (面接通過レベル)**
- セキュリティヘッダー設定完了: 100%
- 強化CORS設定完了: 100%
- 3分間説明練習: 3回以上

**優秀ライン (面接高評価レベル)**
- 全Priority 1機能実装完了: 100%
- セキュリティ設計根拠説明: 流暢レベル
- 医療/バックエンド両パターン説明準備: 完了

---

**この要件定義書により、3時間の投資で面接レベルのセキュリティ実装を体系的に実現できます。Priority 0の2項目（Helmet + 強化CORS）だけでも、セキュリティ設計思想を持つエンジニアとして十分差別化可能です。**