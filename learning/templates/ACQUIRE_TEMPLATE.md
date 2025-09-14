# 🎯 ACQUIRE フェーズ 学習記録テンプレート

> このテンプレートをコピーして、学習しながら埋めていき、最後にカスタムコマンドに貼り付けます

---

## 📋 基本情報

### 日時・環境
- **記録日時**: 2025/01/24 15:30
- **学習時間**: [ ]時間
- **プロジェクト**: FitTrack App
- **作業ブランチ**: feature/[ブランチ名]
- **関連ファイル**: 
  - `src/[ファイルパス1]`
  - `src/[ファイルパス2]`

### カテゴリ選択（1つ選択）
- [ ] error - エラー・バグ対応
- [ ] pattern - 設計パターン・アーキテクチャ
- [ ] technology - 新技術・ライブラリ
- [ ] architecture - システム設計

### 技術スタック（該当するものをチェック）
- [ ] Next.js 14
- [ ] Supabase
- [ ] TypeScript
- [ ] Tailwind CSS
- [ ] React Hook Form
- [ ] Zod
- [ ] その他: [技術名]

### 優先度
- [ ] high - 即座に解決が必要
- [ ] medium - 通常の学習項目
- [ ] low - 知識として蓄積

---

## 🔍 学習対象・問題の詳細

### 一言でまとめると
```
[例: Strava API連携で関数設計からクラス設計に変更したら品質が向上した]
```

### 発生状況・背景
```
[いつ]: 
[どこで]: 
[何をしていた時]: 
[どうなった]: 

例：
[いつ]: 2025/01/24 午後
[どこで]: src/services/stravaService.ts
[何をしていた時]: Strava APIからアクティビティデータを取得する機能を実装
[どうなった]: トークン管理が複雑になり、リファクタリングの必要性を感じた
```

### エラーメッセージ・ログ（ある場合）
```typescript
// エラーメッセージをそのままコピペ
[エラーメッセージ]

// 例：
TypeError: Cannot read property 'accessToken' of undefined
  at getStravaActivities (stravaService.ts:45:23)
  at async handleSync (route.ts:12:5)
```

---

## 💻 コード記録

### ❌ Before - 問題のあったコード / 最初の実装
```typescript
// 問題のあったコード、または最初に書いたコードをコピペ

// 例：関数ベースの実装
let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiry: Date | null = null;

async function authenticateStrava(code: string) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code'
    })
  });
  
  const data = await response.json();
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  tokenExpiry = new Date(data.expires_at * 1000);
}

async function getStravaActivities() {
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  
  if (tokenExpiry && tokenExpiry < new Date()) {
    await refreshStravaToken();
  }
  
  // アクティビティ取得処理...
}
```

### ✅ After - 改善後のコード / 解決策
```typescript
// 改善後のコード、または解決策のコードをコピペ

// 例：クラスベースの実装
class StravaService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string
  ) {}

  async authenticate(code: string): Promise<void> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code'
      })
    });
    
    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiry = new Date(data.expires_at * 1000);
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }
    
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
  }

  private isTokenExpired(): boolean {
    return this.tokenExpiry ? this.tokenExpiry < new Date() : false;
  }

  async getActivities(): Promise<StravaActivity[]> {
    await this.ensureValidToken();
    
    const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    
    return response.json();
  }
}
```

---

## 🔎 調査・試行錯誤の記録

### 試したアプローチ
#### アプローチ1: [アプローチ名]
```typescript
// 試したコード
[コード]
```
**結果**: [うまくいった/失敗した] - [理由]

#### アプローチ2: [アプローチ名]
```typescript
// 試したコード
[コード]
```
**結果**: [うまくいった/失敗した] - [理由]

### 参照した情報源

#### 公式ドキュメント
- [ ] 確認した
- **URL**: [URL]
- **重要な情報**: 
```
[ドキュメントから得た重要な情報をコピペ]
```

#### Stack Overflow / GitHub Issues
- [ ] 確認した
- **URL**: [URL]
- **解決策の要約**: 
```
[見つけた解決策の要約]
```

#### AIツールとの対話
- [ ] ChatGPT
- [ ] Claude
- [ ] GitHub Copilot

**質問内容**:
```
[AIに質問した内容]
```

**得られた回答の要点**:
```
[重要な部分だけ抜粋]
```

---

## 💡 学習内容・気づき

### 技術的な学び

#### 1. [学習項目1]
```
[詳細な説明]

例：
クラス設計により状態管理が一元化される
- privateメンバーで内部状態を隠蔽
- publicメソッドで制御されたアクセスを提供
- インスタンスごとに独立した状態を保持
```

#### 2. [学習項目2]
```
[詳細な説明]

例：
constructorでの依存性注入の利点
- テスト時にモックを注入しやすい
- 設定の不変性を保証（readonly）
- 初期化ロジックを一箇所に集約
```

#### 3. [学習項目3]
```
[詳細な説明]
```

### 概念的な理解

#### なぜこの方法が良いのか
```
[理由の説明]

例：
外部API連携でクラス設計が優れている理由：
1. トークンのライフサイクル管理が容易
2. 複数のAPIインスタンスを独立して管理可能
3. エラーハンドリングとリトライロジックを共通化
4. 認証状態とビジネスロジックを分離
```

#### いつ使うべきか
```
[使用場面の説明]

例：
- 状態を持つ処理を扱う時
- 外部サービスとの連携時
- 複数のインスタンスが必要な時
- テスタビリティを重視する時
```

---

## 🏥 ヘルステック特有の考慮事項

### データプライバシー
```
[該当する場合に記入]

例：
- ユーザーの健康データは暗号化して保存
- アクセストークンは環境変数で管理
- PHI（Protected Health Information）への配慮
```

### 規制・コンプライアンス
```
[該当する場合に記入]

例：
- HIPAA準拠のためのアクセスログ記録
- データ保持期間の制限
- ユーザー同意の明示的な取得
```

### パフォーマンス・信頼性
```
[該当する場合に記入]

例：
- APIレート制限への対応
- フェイルセーフな実装
- データ同期の整合性保証
```

---

## 🎯 次のアクション

### 理解を深めるべき点
- [ ] [項目1]
- [ ] [項目2]
- [ ] [項目3]

### 実装で検証すべき仮説
- [ ] [仮説1]
- [ ] [仮説2]

### 追加で調査が必要な項目
- [ ] [項目1]
- [ ] [項目2]

---

## 📝 メモ・備考

```
[自由記述欄]

例：
- Stravaの無料プランではAPI呼び出しが15分あたり100回まで
- トークンの有効期限は6時間
- リフレッシュトークンは無期限だが、再認証を求められることがある
```

---

## 🚀 カスタムコマンド実行用

### コマンド生成情報
```yaml
topic: "[一言でまとめた学習内容]"
context: "[発生状況の要約]"
category: [error/pattern/technology/architecture]
stack: [nextjs/supabase/typescript/general]
priority: [high/medium/low]
files: "[関連ファイルをカンマ区切り]"
```

### 実行例
```bash
claude-code learning acquire \
  --topic "[topic]" \
  --context "[context]" \
  --category [category] \
  --stack [stack] \
  --priority [priority] \
  --files "[files]"
```

---

## ✅ 提出前チェックリスト

- [ ] エラーメッセージは正確にコピーした
- [ ] Before/Afterのコードを記録した
- [ ] 試したアプローチを全て記録した
- [ ] 学習内容を言語化した
- [ ] ヘルステック特有の考慮事項を確認した
- [ ] 機密情報や個人情報は含まれていない
- [ ] 次のアクションが明確になった

---

**このテンプレートの使い方**：
1. 学習開始時にこのテンプレートをコピー
2. 学習しながら各セクションを埋める
3. 最後に全体をコピーしてカスタムコマンドのプロンプトに貼り付け
4. コマンドを実行して学習記録を自動生成