# 📚 ACQUIRE テンプレート記入例 - Strava API 連携

> 実際の学習内容を記入した例です

---

## 📋 基本情報

### 日時・環境

- **記録日時**: 2025/01/24 15:30
- **学習時間**: 3 時間
- **プロジェクト**: FitTrack App
- **作業ブランチ**: feature/strava-integration
- **関連ファイル**:
  - `src/services/stravaService.ts`
  - `src/app/api/strava/callback/route.ts`
  - `src/types/strava.ts`

### カテゴリ選択

- [ ] error
- [x] pattern - 設計パターン・アーキテクチャ
- [ ] technology
- [ ] architecture

### 技術スタック

- [x] Next.js 14
- [x] Supabase
- [x] TypeScript
- [ ] Tailwind CSS
- [ ] React Hook Form
- [ ] Zod
- [x] その他: Strava API v3

### 優先度

- [x] high - 即座に解決が必要
- [ ] medium
- [ ] low

---

## 🔍 学習対象・問題の詳細

### 一言でまとめると

```
Strava API連携で関数設計からクラス設計に変更したら、トークン管理が劇的に改善した
```

### 発生状況・背景

```
[いつ]: 2025/01/24 14:00頃
[どこで]: src/services/stravaService.ts の実装中
[何をしていた時]: Stravaからユーザーのランニングデータを同期する機能を開発
[どうなった]: トークンの有効期限管理が複雑になり、複数ユーザー対応も必要になった
```

### エラーメッセージ・ログ

```typescript
// 最初のエラー
TypeError: Cannot read property 'accessToken' of undefined
  at getStravaActivities (stravaService.ts:45:23)
  at async handleSync (route.ts:12:5)

// リフレッシュトークン関連のエラー
Error: Token expired and refresh failed
  at ensureValidToken (stravaService.ts:67:11)
```

---

## 💻 コード記録

### ❌ Before - 問題のあったコード

```typescript
// グローバル変数で状態管理（アンチパターン）
let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiry: Date | null = null;

async function authenticateStrava(code: string) {
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();
    // グローバル変数に保存（問題点1: 複数ユーザー対応不可）
    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    tokenExpiry = new Date(data.expires_at * 1000);
  } catch (error) {
    console.error('Auth failed:', error);
    throw error;
  }
}

async function getStravaActivities(userId: string) {
  // 問題点2: トークンの有効性チェックが分散
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  // 問題点3: 有効期限チェックロジックが各関数に重複
  if (tokenExpiry && tokenExpiry < new Date()) {
    await refreshStravaToken();
  }

  const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
}

// 問題点4: エラーハンドリングが一貫していない
async function refreshStravaToken() {
  if (!refreshToken) throw new Error('No refresh token');

  // リフレッシュ処理...
}
```

### ✅ After - 改善後のコード

```typescript
// クラスベースでカプセル化
class StravaService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private userId: string;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
    userId: string
  ) {
    this.userId = userId;
    // 既存トークンをDBから復元
    this.loadTokensFromDatabase();
  }

  async authenticate(code: string): Promise<void> {
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.statusText}`);
      }

      const data = await response.json();
      await this.saveTokens(data);
    } catch (error) {
      console.error('Strava authentication failed:', error);
      throw new StravaAuthError('Failed to authenticate with Strava', error);
    }
  }

  private async saveTokens(data: any): Promise<void> {
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiry = new Date(data.expires_at * 1000);

    // Supabaseに保存
    await supabase.from('strava_tokens').upsert({
      user_id: this.userId,
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
      expires_at: this.tokenExpiry,
    });
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken) {
      throw new StravaAuthError('Not authenticated. Please connect Strava first.');
    }

    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    // 5分前にリフレッシュ（安全マージン）
    const expiryWithBuffer = new Date(this.tokenExpiry.getTime() - 5 * 60 * 1000);
    return expiryWithBuffer < new Date();
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new StravaAuthError('No refresh token available');
    }

    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      await this.saveTokens(data);
    } catch (error) {
      throw new StravaAuthError('Failed to refresh token', error);
    }
  }

  async getActivities(page: number = 1, perPage: number = 30): Promise<StravaActivity[]> {
    await this.ensureValidToken();

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new StravaAPIError(`Failed to fetch activities: ${response.statusText}`);
    }

    return response.json();
  }
}

// カスタムエラークラス
class StravaAuthError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(message);
    this.name = 'StravaAuthError';
  }
}

class StravaAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StravaAPIError';
  }
}
```

---

## 🔎 調査・試行錯誤の記録

### 試したアプローチ

#### アプローチ 1: シングルトンパターン

```typescript
class StravaService {
  private static instance: StravaService;

  static getInstance(): StravaService {
    if (!this.instance) {
      this.instance = new StravaService();
    }
    return this.instance;
  }
}
```

**結果**: 失敗 - 複数ユーザーのトークンを管理できない

#### アプローチ 2: ファクトリーパターン

```typescript
class StravaServiceFactory {
  static create(userId: string): StravaService {
    return new StravaService(
      process.env.STRAVA_CLIENT_ID!,
      process.env.STRAVA_CLIENT_SECRET!,
      process.env.STRAVA_REDIRECT_URI!,
      userId
    );
  }
}
```

**結果**: 成功 - ユーザーごとにインスタンスを作成可能

### 参照した情報源

#### 公式ドキュメント

- [x] 確認した
- **URL**: https://developers.strava.com/docs/authentication/
- **重要な情報**:

```
- アクセストークンの有効期限は通常6時間
- リフレッシュトークンは無期限だが、使用時に新しいものが発行される
- Rate Limitは15分あたり100リクエスト、1日あたり1000リクエスト
```

#### Stack Overflow / GitHub Issues

- [x] 確認した
- **URL**: https://github.com/strava/developers/issues/123
- **解決策の要約**:

```
トークンリフレッシュは有効期限の5分前に行うのがベストプラクティス
並行リクエストでの重複リフレッシュを防ぐためにロック機構が必要
```

#### AI ツールとの対話

- [ ] ChatGPT
- [x] Claude
- [x] GitHub Copilot

**質問内容**:

```
外部API連携で関数設計とクラス設計のどちらが適切か？
特にトークン管理と複数ユーザー対応を考慮した場合
```

**得られた回答の要点**:

```
クラス設計の利点：
1. 状態のカプセル化によるデータ保護
2. インスタンスごとの独立した状態管理
3. 依存性注入によるテスタビリティ向上
4. 継承による機能拡張の容易さ
```

---

## 💡 学習内容・気づき

### 技術的な学び

#### 1. クラスによるカプセル化の威力

```
privateメンバーを使うことで：
- トークンなどの機密情報を外部から隠蔽
- 不正な状態変更を防止
- getterを通じた制御されたアクセス

実例：
this.accessTokenは外部から直接アクセス不可
getActivities()メソッド内でのみ使用
```

#### 2. constructor での依存性注入

```
constructorで設定を注入することで：
- テスト時にモックを注入可能
- 環境ごとの設定切り替えが容易
- readonlyで不変性を保証

実例：
constructor(
  private readonly clientId: string,  // 後から変更不可
  private readonly clientSecret: string,
  private readonly redirectUri: string
)
```

#### 3. エラーハンドリングの一元化

```
カスタムエラークラスを作成することで：
- エラーの種類を明確に区別
- 適切なエラーメッセージの提供
- スタックトレースの保持

実例：
StravaAuthError: 認証関連のエラー
StravaAPIError: API呼び出しのエラー
```

### 概念的な理解

#### なぜクラス設計が外部 API 連携に適しているか

```
1. 状態管理の複雑さへの対応
   - トークン、有効期限、ユーザー情報を一元管理
   - 状態の一貫性を保証

2. スケーラビリティ
   - 複数ユーザー対応が容易（インスタンス分離）
   - 新機能追加時の影響範囲を限定

3. 保守性
   - 責任の明確化（単一責任の原則）
   - テストの書きやすさ

4. セキュリティ
   - 機密情報の隠蔽
   - アクセス制御の実装
```

#### いつ使うべきか

```
クラス設計を選ぶべき場面：
- 状態を持つ処理（トークン、セッション）
- 外部サービスとの連携
- 複数のインスタンスが必要
- ライフサイクル管理が必要
- 将来的な拡張が予想される

関数設計で十分な場面：
- 純粋な計算処理
- ステートレスなユーティリティ
- 単発の処理
```

---

## 🏥 ヘルステック特有の考慮事項

### データプライバシー

```
実装した対策：
- Stravaトークンは暗号化してSupabaseに保存
- ユーザーごとにRow Level Securityを適用
- アクティビティデータは最小限のみ保存
- 個人識別情報（名前、写真）は別管理
```

### 規制・コンプライアンス

```
考慮した点：
- GDPR対応：データ削除機能の実装
- 利用目的の明示（プライバシーポリシー）
- サードパーティAPIの利用規約遵守
- アクセスログの記録（監査用）
```

### パフォーマンス・信頼性

```
実装した最適化：
- Rate Limit対策：リクエストのキューイング
- エラー時の自動リトライ（最大3回）
- キャッシュの活用（5分間）
- バッチ処理での同期（深夜実行）
```

---

## 🎯 次のアクション

### 理解を深めるべき点

- [x] TypeScript のアクセス修飾子の詳細
- [ ] Dependency Injection パターンの応用
- [ ] OAuth 2.0 フローの完全理解

### 実装で検証すべき仮説

- [ ] Redis を使ったトークンキャッシュで性能向上するか
- [ ] WebSocket でリアルタイム同期が可能か

### 追加で調査が必要な項目

- [ ] Strava Webhook API の活用方法
- [ ] 他のフィットネス API（Garmin, Fitbit）との統合

---

## 📝 メモ・備考

```
重要な発見：
- Stravaの無料プランではAPI呼び出しが15分あたり100回まで
- トークンの有効期限は正確には6時間（21600秒）
- リフレッシュトークンを使うと新しいリフレッシュトークンが発行される（重要！）
- アクティビティは最大200件ずつしか取得できない

次回注意すること：
- エラーレスポンスのbodyも必ずチェック（rate limit情報が含まれる）
- 並行処理時のトークンリフレッシュ競合状態
- タイムゾーンの扱い（StravaはUTC、表示は現地時間）
```

---

## 🚀 カスタムコマンド実行用

### コマンド生成情報

```yaml
topic: 'Strava API連携でクラス設計の重要性を学んだ'
context: 'トークン管理が複雑になり、関数設計からクラス設計にリファクタリング'
category: pattern
stack: typescript
priority: high
files: 'src/services/stravaService.ts,src/app/api/strava/callback/route.ts,src/types/strava.ts'
```

### 実行例

```bash
claude-code learning acquire \
  --topic "Strava API連携でクラス設計の重要性を学んだ" \
  --context "トークン管理が複雑になり、関数設計からクラス設計にリファクタリング" \
  --category pattern \
  --stack typescript \
  --priority high \
  --files "src/services/stravaService.ts,src/app/api/strava/callback/route.ts,src/types/strava.ts"
```

---

## ✅ 提出前チェックリスト

- [x] エラーメッセージは正確にコピーした
- [x] Before/After のコードを記録した
- [x] 試したアプローチを全て記録した
- [x] 学習内容を言語化した
- [x] ヘルステック特有の考慮事項を確認した
- [x] 機密情報や個人情報は含まれていない
- [x] 次のアクションが明確になった
