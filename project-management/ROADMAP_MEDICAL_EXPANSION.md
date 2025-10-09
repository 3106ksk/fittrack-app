# 🏥 FitTrack 医療データ拡張ロードマップ

**最終更新**: 2025-10-09
**ロードマップ期間**: 2025年10月 - 2026年1月（4ヶ月）
**最終ゴール**: 医療機関・保険会社と連携可能な健康管理プラットフォーム

---

## 🎯 ビジョン

FitTrackを単なるフィットネストラッカーから、**医療データ拡張可能な健康管理プラットフォーム**へと進化させる。

### 最終ゴール
- ✅ HIPAA準拠のセキュリティ基盤
- ✅ GDPR対応のデータ管理
- ✅ FHIR標準による医療機関連携
- ✅ 監査証跡の完備（7年保持）

---

## 📐 設計原則

### 1. 医療データ拡張への段階的準備
各Phaseでセキュリティレベルを段階的に向上させ、最終的に医療データを扱える基盤を構築

### 2. 1ヶ月サイクルの実行可能な粒度
- 各Phase: 20-30時間（週5-7時間 × 4週間）
- 就活並行可能な工数設計
- 週次で完結するタスク分割

### 3. 明確な価値提供
- **ユーザー価値**: 各Phaseで体感できる改善
- **面接評価**: 技術的判断力・実装力の証明
- **医療準備度**: セキュリティ・コンプライアンスの進捗

### 4. セキュリティファースト
- Phase 1: 基盤（CSP, Rate Limit, Logging）
- Phase 2: 認証（httpOnly Cookie, 暗号化）
- Phase 3: コンプライアンス（監査ログ, RBAC）
- Phase 4: 実装（医療データ統合）

---

## 📅 4ヶ月ロードマップ概要

| Phase | 期間 | 目標 | 医療準備度 | 工数 |
|-------|------|------|-----------|------|
| **Phase 1** | 2025/10 | コア機能改善 + セキュリティ基盤 | 20% | 26h |
| **Phase 2** | 2025/11 | トークンセキュリティ + データ暗号化 | 50% | 26h |
| **Phase 3** | 2025/12 | 監査ログ + コンプライアンス | 80% | 26h |
| **Phase 4** | 2026/01 | 医療データ拡張実装 | 100% | 28h |

---

## 🔵 Phase 1: コア機能改善 + セキュリティ基盤（2025年10月）

### 目標
> **「800行削減 + 全バグ修正 + セキュリティ基盤構築」で面接で語れるストーリーを作る**

### 主要成果物
- ✅ ワークヒストリー統合（Pattern C改良版）
- ✅ 全バグ修正完了（4/4件）
- ✅ CSP（Content Security Policy）実装
- ✅ Rate Limiting 実装
- ✅ 監査ログ基盤（Winston Logger）

### 週次スケジュール

#### Week 1（7時間）: ワークヒストリー統合
- バックエンド: `createdAt` をAPIレスポンスに追加
- フロントエンド: `RecentWorkoutsList.jsx` 作成
- クリーンアップ: 旧コンポーネント削除（約800行）
- テスト: 複数回トレーニングのテストケース

#### Week 2（6時間）: 認証バグ修正 + セキュリティ強化
- バグ修正: 新規登録後のナビゲーション問題
- バグ修正: ワークアウトフォームのリセット問題
- セキュリティ: CSP（Content Security Policy）実装
- セキュリティ: Rate Limiting 実装

#### Week 3（7時間）: データ整合性 + 監査準備
- バグ修正: 複数ワークアウトの重複問題
- 監査ログ: Winston Logger 導入
- 監査ログ: 重要操作のログ記録
- 監査ログ: ログフォーマット統一

#### Week 4（6時間）: Strava修正 + ドキュメント整備
- バグ修正: Strava連携の接続エラー
- ドキュメント: README 更新
- ドキュメント: CHANGELOG 作成

### 技術スタック
- **セキュリティ**: helmet, express-rate-limit
- **ロギング**: winston, winston-daily-rotate-file
- **テスト**: vitest, @testing-library/react

### 面接アピールポイント
1. **戦略的判断力**: ワークヒストリー800行削減の意思決定プロセス
2. **セキュリティ意識**: XSS対策（CSP）とDDoS対策（Rate Limit）
3. **実装力**: フルスタック開発、既存コードのリファクタリング

### 詳細ドキュメント
- [Phase 1 要件定義書](./features/phase1-core-improvements/requirements.md)
- [Phase 1 設計書](./features/phase1-core-improvements/design.md)

---

## 🟢 Phase 2: トークンセキュリティ + データ暗号化（2025年11月）

### 目標
> **「localStorage → httpOnly Cookie 移行」で医療データに必要な認証セキュリティを確立**

### 主要成果物
- ✅ httpOnly Cookie ベース認証
- ✅ Refresh Token 実装
- ✅ 機密データ暗号化（AES-256-CBC）
- ✅ Token Blacklist システム
- ✅ セキュリティテスト実施

### 週次スケジュール

#### Week 1（7時間）: httpOnly Cookie 実装
- バックエンド: Cookie ベース認証への移行
- バックエンド: CSRF トークン実装
- バックエンド: Refresh Token 実装
- フロントエンド: AuthContext リファクタリング

#### Week 2（6時間）: 機密データ暗号化
- バックエンド: 環境変数の暗号化（dotenv-vault）
- バックエンド: DB カラムレベル暗号化
- バックエンド: 暗号化ユーティリティ作成

#### Week 3（7時間）: Token Blacklist + セッション管理
- バックエンド: Token Blacklist 実装（Redis or DB）
- バックエンド: セッション管理（最大3デバイス）
- フロントエンド: ログアウト機能強化

#### Week 4（6時間）: セキュリティテスト + ドキュメント
- セキュリティテスト: OWASP ZAP による侵入テスト
- ドキュメント: セキュリティドキュメント作成
- ドキュメント: HIPAA準拠チェックリスト

### 技術スタック
- **認証**: cookie-parser, csurf
- **暗号化**: crypto (Node.js標準), dotenv-vault
- **セッション**: Redis または PostgreSQL
- **セキュリティテスト**: OWASP ZAP

### 面接アピールポイント
1. **XSS脆弱性の理解**: localStorage → httpOnly Cookie の移行理由を説明
2. **暗号化技術**: AES-256-CBC による機密データ保護
3. **医療データ準拠**: HIPAA Technical Safeguards の理解

### 詳細ドキュメント
- [Phase 2 要件定義書](./features/phase2-authentication-security/requirements.md)
- [Phase 2 設計書](./features/phase2-authentication-security/design.md)

---

## 🟡 Phase 3: 監査ログ + コンプライアンス（2025年12月）

### 目標
> **「完全な監査証跡」で医療データ拡張に必要なコンプライアンス基盤を確立**

### 主要成果物
- ✅ Audit Log テーブル実装
- ✅ データ保持ポリシー（Soft Delete）
- ✅ GDPR対応（データエクスポート機能）
- ✅ RBAC（Role-Based Access Control）準備
- ✅ HIPAA準拠チェックリスト（80%達成）

### 週次スケジュール

#### Week 1（7時間）: 監査ログ完全実装
- バックエンド: Audit Log テーブル作成
- バックエンド: Audit Middleware 実装
- バックエンド: ログ保持期間設定（7年）

#### Week 2（6時間）: データ保持ポリシー
- バックエンド: 論理削除（Soft Delete）実装
- バックエンド: データエクスポート機能（CSV, JSON）
- フロントエンド: データエクスポート UI

#### Week 3（7時間）: アクセス制御 + 権限管理
- バックエンド: RBAC準備（Role, Permission テーブル）
- バックエンド: リソースアクセス制御
- ミドルウェア: Authorization Middleware

#### Week 4（6時間）: コンプライアンスドキュメント
- ドキュメント: HIPAA準拠チェックリスト作成
- ドキュメント: プライバシーポリシー作成
- ドキュメント: 利用規約作成

### 技術スタック
- **監査ログ**: PostgreSQL��audit_logs テーブル）
- **データ管理**: Sequelize（Soft Delete hooks）
- **アクセス制御**: カスタムミドルウェア
- **ドキュメント**: Markdown

### 面接アピールポイント
1. **法規対応**: GDPR、HIPAA の理解と実装
2. **監査証跡**: 医療データ法的要件（7年保持）の設計
3. **アクセス制御**: 医師・患者間のRBAC設計

### 詳細ドキュメント
- [Phase 3 要件定義書](./features/phase3-audit-compliance/requirements.md)
- [Phase 3 設計書](./features/phase3-audit-compliance/design.md)

---

## 🔴 Phase 4: 医療データ拡張実装（2026年1月）

### 目標
> **「実際の医療データ統合」で医療機関連携のプロトタイプを完成**

### 主要成果物
- ✅ HealthMetrics テーブル実装
- ✅ バイタルデータ API
- ✅ 健康インサイト統合（運動 × バイタル）
- ✅ FHIR準拠データエクスポート
- ✅ E2Eテスト実装

### 週次スケジュール

#### Week 1（8時間）: バイタルデータモデル
- バックエンド: HealthMetrics テーブル作成
- バックエンド: バイタルデータ API
- フロントエンド: バイタル入力フォーム

#### Week 2（7時間）: 健康インサイト統合
- バックエンド: Health Insight Engine 拡張
- バックエンド: 異常値検出アルゴリズム
- フロントエンド: 健康ダッシュボード拡張

#### Week 3（7時間）: 医療機関連携準備
- バックエンド: FHIR（Fast Healthcare Interoperability Resources）調査
- バックエンド: データエクスポート（FHIR形式）
- ドキュメント: 医療機関連携ガイド作成

#### Week 4（6時間）: 最終仕上げ + デモ準備
- テスト: E2Eテスト実装（Cypress）
- テスト: パフォーマンステスト
- デモ: デモデータ作成
- デモ: プレゼン資料作成

### 技術スタック
- **バイタルデータ**: PostgreSQL（health_metrics テーブル）
- **FHIR**: カスタム変換ロジック（FHIR R4準拠）
- **テスト**: Cypress（E2E）, k6（パフォーマンス）
- **可視化**: Chart.js または Recharts

### 面接アピールポイント
1. **医療データ実装**: 実際の医療データモデルの設計・実装
2. **標準規格対応**: FHIR（国際標準）の理解
3. **多元データ分析**: 運動ログ × バイタルデータの相関分析

### 詳細ドキュメント
- [Phase 4 要件定義書](./features/phase4-medical-data-expansion/requirements.md)
- [Phase 4 設計書](./features/phase4-medical-data-expansion/design.md)

---

## 📊 最終成果物（4ヶ月後）

### 定量的成果

| 指標 | Before | After | 変化 |
|-----|--------|-------|------|
| コード行数 | ~15,000 | ~14,500 | **-500行** |
| バグ件数 | 4 | 0 | **-100%** |
| セキュリティスコア | C | A | **+2段階** |
| テストカバレッジ | 40% | 75% | **+35%** |
| 医療準備度 | 0% | 100% | **+100%** |

### 定性的成果

#### ユーザー価値
- ✅ シンプルで使いやすいダッシュボード
- ✅ 安全な認証・セッション管理
- ✅ 健康データの統合管理
- ✅ プライバシー尊重（GDPR準拠）

#### 面接評価
- ✅ **戦略的判断力**: 800行削減の意思決定
- ✅ **セキュリティ意識**: httpOnly Cookie, 暗号化, 監査ログ
- ✅ **実装力**: フルスタック開発、外部API連携
- ✅ **医療知識**: FHIR, HIPAA, GDPR対応

#### 医療準備度
- ✅ HIPAA Technical Safeguards準拠
- ✅ GDPR データ管理準拠
- ✅ FHIR標準対応
- ✅ 監査証跡完備（7年保持）

---

## 🔗 関連ドキュメント

### フェーズ別詳細
- [Phase 1: コア機能改善](./features/phase1-core-improvements/)
- [Phase 2: 認証セキュリティ](./features/phase2-authentication-security/)
- [Phase 3: 監査・コンプライアンス](./features/phase3-audit-compliance/)
- [Phase 4: 医療データ拡張](./features/phase4-medical-data-expansion/)

### 技術ドキュメント
- [セキュリティ対策](./technical-docs/security/)
- [データベース設計](./technical-docs/database/)
- [API仕様](./technical-docs/api/)

### プロジェクト管理
- [TODO管理](./TODO/)
- [バグトラッキング](./bugs/)
- [解決済みバグ](./resolved-bugs/)

---

## 📈 進捗トラッキング

### Phase別進捗

```
Phase 1: [□□□□□□□□□□] 0% (0/4週)
Phase 2: [□□□□□□□□□□] 0% (0/4週)
Phase 3: [□□□□□□□□□□] 0% (0/4週)
Phase 4: [□□□□□□□□□□] 0% (0/4週)

全体:    [□□□□□□□□□□] 0% (0/16週)
```

### 医療準備度

```
セキュリティ基盤:     [□□□□□□□□□□] 0%
認証・暗号化:         [□□□□□□□□□□] 0%
監査・コンプライアンス: [□□□□□□□□□□] 0%
医療データ実装:       [□□□□□□□□□□] 0%

総合準備度:          [□□□□□□□□□□] 0%
```

---

## 💡 成功のための Tips

### 1. 週次ルーティン
- **月曜**: 週のタスク確認、優先順位設定
- **水曜**: 中間チェックポイント、ブロッカーの特定
- **金曜**: 週次レビュー、進捗記録

### 2. 就活との両立
- **タスク分割**: 2-3時間で完結する粒度に分割
- **柔軟なスケジュール**: 面接がある週は工数調整
- **ドキュメント優先**: 実装中断時も再開しやすいよう記録

### 3. 面接対策
- **ストーリー準備**: 各Phaseの意思決定プロセスを言語化
- **技術深掘り**: なぜその技術を選んだか説明できるように
- **成果の可視化**: Before/After の比較データを準備

---

## 🚀 次のアクション

### 今すぐ始められること

1. **Phase 1 Week 1 スタート**
   - [ ] `backend/routes/workouts.js` に `createdAt` 追加
   - [ ] `RecentWorkoutsList.jsx` 作成
   - [ ] 旧コンポーネント削除

2. **環境準備**
   ```bash
   # 必要なパッケージインストール
   npm install --save helmet express-rate-limit winston
   ```

3. **ドキュメント確認**
   - [Phase 1 要件定義書](./features/phase1-core-improvements/requirements.md)
   - [Phase 1 設計書](./features/phase1-core-improvements/design.md)

---

**最終更新**: 2025-10-09
**次回レビュー**: 2025-11-01（Phase 1完了時）
