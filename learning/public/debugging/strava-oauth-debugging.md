# 🎯 ACQUIRE フェーズ 学習記録 - Strava OAuth認証デバッグ

---

## 📋 基本情報

### 日時・環境
- **記録日時**: 2025/09/12 15:00
- **学習時間**: 3時間
- **プロジェクト**: FitTrack App
- **作業ブランチ**: feature/fix-strava-redirect-uri
- **関連ファイル**: 
  - `backend/services/stravaService.js`
  - `backend/routes/stravaRoutes.js`
  - `backend/app.js`
  - `frontend/src/components/strava/StravaConnect.jsx`

### カテゴリ選択（1つ選択）
- [x] error - エラー・バグ対応

### 技術スタック（該当するものをチェック）
- [x] Node.js/Express
- [x] React
- [x] OAuth 2.0
- [x] Docker
- [x] Railway (PaaS)
- [x] その他: Strava API

### 優先度
- [x] high - 即座に解決が必要

---

## 🔍 学習対象・問題の詳細

### 一言でまとめると
```
Strava OAuth認証で複数層にまたがるエラーが発生し、redirect_uri設定とENCRYPTION_KEY環境変数の問題を段階的に解決した
```

### 発生状況・背景
```
[いつ]: 2025/09/12 午後
[どこで]: 本番環境（Railway）でのStrava API連携
[何をしていた時]: ユーザーがStrava連携ボタンをクリックして認証を試みた
[どうなった]: 
1. 最初は「redirect_uri invalid」エラーでStravaの認証画面が開けなかった
2. その後、認証は通るがUIが更新されないバグが発生
3. 最終的にトークン暗号化でエラーが発生
```

### エラーメッセージ・ログ（ある場合）
```javascript
// エラー1: redirect_uri invalid
{
  message: "Bad Request",
  errors: [{
    resource: "Application",
    field: "redirect_uri",
    code: "invalid"
  }]
}

// エラー2: トークン暗号化エラー
Strava callback error: TypeError [ERR_INVALID_ARG_TYPE]: 
The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. 
Received undefined
    at Hash.update (node:internal/crypto/hash:107:11)
    at StravaService.encryptToken (/app/services/stravaService.js:111:45)
```

---

## 💻 コード記録

### ❌ Before - 問題のあったコード / 最初の実装

#### 1. トークン交換時のredirect_uri欠落
```javascript
// backend/services/stravaService.js
async exchangeCodeForToken(code) {
  try {
    const response = await axios.post(`${this.authURL}/token`, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code'
      // redirect_uriが欠落していた！
    });
    return response.data;
  } catch (error) {
    throw new Error(`Token exchange failed: ${error.message}`);
  }
}
```

#### 2. 環境変数チェックなしの暗号化
```javascript
// backend/services/stravaService.js
encryptToken(token) {
  if (!token) return null;
  // ENCRYPTION_KEYがundefinedの可能性を考慮していない
  const key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}
```

### ✅ After - 改善後のコード / 解決策

#### 1. redirect_uri追加とエラーハンドリング改善
```javascript
// backend/services/stravaService.js
async exchangeCodeForToken(code) {
  try {
    const requestData = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri  // 追加！
    };
    
    const response = await axios.post(`${this.authURL}/token`, requestData);
    return response.data;
  } catch (error) {
    throw new Error(`Token exchange failed: ${error.response?.data?.message || error.message}`);
  }
}
```

#### 2. 環境変数の検証を追加
```javascript
// backend/services/stravaService.js
encryptToken(token) {
  if (!token) return null;
  
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    console.error('ENCRYPTION_KEY is not set in environment variables');
    throw new Error('ENCRYPTION_KEY is required for token encryption');
  }
  
  const key = crypto.createHash('sha256').update(encryptionKey).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}
```

#### 3. トークンデータの検証
```javascript
// backend/routes/stravaRoutes.js
const tokenData = await stravaService.exchangeCodeForToken(code);

// トークンデータの検証を追加
if (!tokenData || !tokenData.access_token) {
  console.error('Invalid token data received:', tokenData);
  throw new Error('Failed to obtain access token from Strava');
}
```

---

## 🔎 調査・試行錯誤の記録

### 試したアプローチ

#### アプローチ1: Strava APIダッシュボードの設定変更
**内容**: 
- 認証コールバックドメインに`fittrack-app-production-9f4a.up.railway.app`を追加
- ウェブサイトURLを`http://localhost:5173`から本番URLに変更

**結果**: うまくいった - redirect_uriエラーが解決

#### アプローチ2: デバッグログの追加
```javascript
// 各段階でログを追加
console.log('[Strava Service] 初期化時の設定:');
console.log('- STRAVA_REDIRECT_URI:', this.redirectUri);
console.log('[Strava Auth] 認証URL生成:');
console.log('- redirect_uri:', this.redirectUri);
console.log('Strava token response:', JSON.stringify(response.data, null, 2));
```
**結果**: うまくいった - 問題の特定が容易になった

#### アプローチ3: 環境変数の確認スクリプト作成
```javascript
// check-env.js
console.log('STRAVA_REDIRECT_URI:', process.env.STRAVA_REDIRECT_URI || '未設定');
console.log('ENCRYPTION_KEY exists:', !!process.env.ENCRYPTION_KEY);
```
**結果**: うまくいった - 環境変数の不足を発見

### 参照した情報源

#### 公式ドキュメント
- [x] 確認した
- **URL**: https://developers.strava.com/docs/authentication/
- **重要な情報**: 
```
- OAuth 2.0のトークン交換時にもredirect_uriが必要
- Authorized Callback Domainにはプロトコルを含めない
- 1つのアプリに複数のドメインをカンマ区切りで設定可能
```

#### AIツールとの対話
- [x] Claude

**質問内容**:
```
Strava APIでredirect_uri invalidエラーが発生する原因は？
```

**得られた回答の要点**:
```
1. Stravaダッシュボードの設定とredirect_uriの不一致
2. トークン交換時のredirect_uri欠落
3. ウェブサイトURLとコールバックドメインの不整合
```

---

## 💡 学習内容・気づき

### 技術的な学び

#### 1. OAuth 2.0の仕様理解
```
トークン交換時にもredirect_uriが必要な理由：
- セキュリティ上の追加検証として機能
- 認証時と同じredirect_uriを使用することを強制
- 中間者攻撃を防ぐための仕組み
```

#### 2. 環境変数管理の重要性
```
本番環境での環境変数チェックリスト：
- すべての必須環境変数が設定されているか
- 値が正しい形式か（URLの場合はプロトコル含む）
- シークレットキーが適切に設定されているか
- 環境ごとに異なる値が必要な変数の確認
```

#### 3. デバッグログの戦略的配置
```
効果的なデバッグログの配置：
1. 初期化時：設定値の確認
2. API呼び出し前：パラメータの確認
3. API呼び出し後：レスポンスの確認
4. エラー時：詳細なコンテキスト情報
```

### 概念的な理解

#### なぜこの方法が良いのか
```
段階的なデバッグアプローチの利点：
1. 問題の層を特定できる（フロントエンド/バックエンド/外部API）
2. 仮説を立てて検証できる
3. 複数の問題が絡み合っている場合も順次解決
4. 将来の同様の問題に対する知見が蓄積される
```

#### いつ使うべきか
```
このアプローチが有効な場面：
- 外部APIとの連携でエラーが発生した時
- 本番環境でのみ発生する問題
- 複数のサービス間での認証フロー
- 環境依存の問題が疑われる時
```

---

## 🏥 ヘルステック特有の考慮事項

### データプライバシー
```
- Stravaから取得したユーザーデータは暗号化して保存
- アクセストークン・リフレッシュトークンの暗号化が必須
- ENCRYPTION_KEYは環境変数で厳重に管理
- ユーザーの健康データへのアクセスは最小限に
```

### 規制・コンプライアンス
```
- PHI（Protected Health Information）に該当する可能性のあるデータの扱い
- ユーザーの明示的な同意を得てからデータ連携
- データの利用範囲を明確に提示
```

### パフォーマンス・信頼性
```
- Strava APIのレート制限（15分あたり100回）への対応
- トークンの有効期限管理（6時間）
- リフレッシュトークンを使った自動更新の実装
- エラー時のリトライ戦略
```

---

## 🎯 次のアクション

### 理解を深めるべき点
- [x] OAuth 2.0の完全なフローの理解
- [ ] JWTトークンとOAuthトークンの違い
- [ ] 各PaaSプラットフォームの環境変数管理のベストプラクティス

### 実装で検証すべき仮説
- [ ] トークンリフレッシュの自動化が正しく動作するか
- [ ] 複数ユーザーの同時認証でstate管理が適切か

### 追加で調査が必要な項目
- [ ] Strava Webhook APIの活用方法
- [ ] アクティビティデータの効率的な同期戦略

---

## 📝 メモ・備考

```
重要な発見事項：
1. Railwayのデプロイログには「Stopping Container」というメッセージが出るが、
   これは新しいデプロイ時の正常な動作

2. Stravaダッシュボードの「ウェブサイト」フィールドも
   redirect_uriの検証に影響する可能性がある

3. Docker環境でのデバッグはpackage-lock.jsonの
   Gitへのコミットが必須（npm ciで必要）

4. エラーメッセージから原因を「断定」するのではなく、
   仮説を立てて検証することが重要
```

---

## 🚀 カスタムコマンド実行用

### コマンド生成情報
```yaml
topic: "Strava OAuth認証の複数層エラーデバッグ"
context: "本番環境でredirect_uriエラーとトークン暗号化エラーが発生"
category: error
stack: nodejs,oauth,railway
priority: high
files: "backend/services/stravaService.js,backend/routes/stravaRoutes.js"
```

---

## ✅ 提出前チェックリスト

- [x] エラーメッセージは正確にコピーした
- [x] Before/Afterのコードを記録した
- [x] 試したアプローチを全て記録した
- [x] 学習内容を言語化した
- [x] ヘルステック特有の考慮事項を確認した
- [x] 機密情報や個人情報は含まれていない
- [x] 次のアクションが明確になった

---

## 🎓 主要な教訓

1. **環境変数の完全性チェックは必須**
   - 特に暗号化キーのような重要な変数
   - デプロイ前のチェックリスト作成が有効

2. **OAuth認証のデバッグは段階的に**
   - 認証URL生成 → リダイレクト → トークン交換 → データ保存
   - 各段階でログを配置して問題を特定

3. **推測ではなく検証を**
   - エラーから原因を断定せず、仮説と検証を繰り返す
   - デバッグログは後で削除することを前提に積極的に追加

4. **外部サービス連携の注意点**
   - ダッシュボードの全フィールドが影響する可能性
   - ドキュメントに記載されていない制約もある
   - 本番環境での検証が最終的に必要