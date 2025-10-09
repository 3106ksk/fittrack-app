# Phase 2: トークンセキュリティ + データ暗号化 - 要件定義書（簡略版）

**作成日**: 2025-10-09
**期間**: 2025年11月（Month 2）
**工数**: 26時間
**前提**: [Phase 1](../phase1-core-improvements/) 完了後

---

## 目的

> **「localStorage → httpOnly Cookie 移行」で医療データに必要な認証セキュリティを確立**

---

## 主要機能要件

### FR-1: httpOnly Cookie ベース認証

- ✅ Cookie-based JWT authentication
- ✅ CSRF protection (csurf)
- ✅ Refresh Token mechanism
- ✅ AuthContext refactoring (remove localStorage)

**受け入れ基準**:
- [ ] JWT は httpOnly Cookie に格納される
- [ ] localStorage からトークンが削除されている
- [ ] CSRF トークンが正しく機能する
- [ ] XSS攻撃からトークンが保護されている

---

### FR-2: 機密データ暗号化

- ✅ 環境変数の暗号化 (dotenv-vault)
- ✅ DBカラムレベル暗号化 (AES-256-CBC)
- ✅ 暗号化ユーティリティ作成

**受け入れ基準**:
- [ ] Stravaトークンが暗号化されてDBに保存される
- [ ] 環境変数が安全に管理されている
- [ ] 暗号化・復号化ユーティリティが動作する

---

### FR-3: Token Blacklist システム

- ✅ ログアウト時のトークン無効化
- ✅ `ignoreExpiration: true` の削除
- ✅ セッション管理（最大3デバイス）

**受け入れ基準**:
- [ ] ログアウト後、トークンが無効化される
- [ ] Refresh Token のセキュリティホールが解消される
- [ ] 同時ログインセッション数が制限される

---

### FR-4: セキュリティテスト

- ✅ OWASP ZAP による侵入テスト
- ✅ セキュリティレポート作成
- ✅ HIPAA準拠チェックリスト（50%達成）

---

## 技術スタック

- **認証**: cookie-parser, csurf
- **暗号化**: crypto (Node.js), dotenv-vault
- **セッション**: Redis or PostgreSQL
- **テスト**: OWASP ZAP

---

## 医療準備度目標

**50%達成**: 認証・暗号化完了

---

**詳細設計**: Phase 1 完了後に作成予定
