<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0 (MINOR)
- Modified principles: III. Type Safety (TypeScript → 将来的な拡張として位置づけ)
- Reason: 就活用ポートフォリオとして「動くサービス」を優先、現状はJavaScript実装
- Templates status: ✅ All templates compatible
- Follow-up: TypeScript移行時に2.0.0へMajor bump
-->

# FitStart Constitution

## Core Principles

### I. Evidence-Based Health Metrics (NON-NEGOTIABLE)

**運動データをエビデンスベースの健康効果に翻訳する**

- すべての健康効果の数値化はWHO/CDC等の国際基準に基づくこと
- 科学的根拠のない健康スコアや効果表示は禁止
- 参照論文・ガイドラインは必ずドキュメント化すること
- 健康スコア算出ロジックには必ず出典を明記

**根拠**:
- [WHO 身体活動・座位行動ガイドライン 2020](https://www.who.int/publications/i/item/9789240015128)
- 医療データという性質上、誤った情報提供は健康被害につながる可能性がある

### II. Security-First Architecture (NON-NEGOTIABLE)

**医療データ連携を見据えた堅牢なセキュリティ**

- JWT認証必須: すべての保護されたエンドポイントはJWT Bearer Tokenで認証
- パスワード暗号化: bcryptによるハッシュ化必須 (ラウンド数10以上)
- HTTPS通信: 本番環境では必ずHTTPS、ローカル開発のみHTTP許可
- CORS設定: 許可されたオリジンのみ明示的に指定
- セキュリティヘッダー: Helmet.jsによる多層的なヘッダー設定
- 入力検証: express-validatorによるすべてのAPI入力の検証

**根拠**:
- 個人の健康データはセンシティブ情報であり、GDPR/個人情報保護法の対象
- 将来的な医療機関連携を見据え、初期段階から高水準のセキュリティを確保

### III. Rapid Development & Portfolio Delivery

**完璧よりも動くサービスを優先 (就活用ポートフォリオ開発)**

- **現状**: JavaScript (React 18 + Node.js/Express) で実装
- **入力検証**: express-validator + Yup スキーマによるランタイムバリデーション
- **API契約**: 手動でのフロントエンド・バックエンド間の型整合性確認
- **将来的な拡張**: TypeScript移行を視野に入れた設計
  - 複雑なワークアウトデータ構造は明確に定義
  - 関数の引数・戻り値はJSDocでドキュメント化推奨
  - Yupスキーマをクライアント・サーバー両側で再利用

**根拠**:
- 就活用ポートフォリオとして「動くもの」を早く見せることが優先
- TypeScriptは学習コストと開発速度のトレードオフを考慮し、将来の拡張として位置づけ
- express-validatorとYupによる二重のバリデーションで実用レベルの品質を確保

### IV. Mobile-First Responsive Design

**トレーニング中・完了後の即座の入力を可能にする**

- iPhone 14 Pro (390x844) を基準に最適化
- タッチ操作を優先したUI設計
- Material-UI (MUI) による一貫したデザインシステム
- ワークアウト入力フォームは最小タップ数で完了
- レスポンシブUI: デスクトップでも快適に使用可能

**根拠**:
- Apple Health、Google Fit、Stravaなどのネイティブアプリが市場を占有
- Webアプリとして競争するには、ネイティブアプリに劣らない操作感が必須

### V. Performance Optimization & Scalability

**useMemoによるレンダリング最適化とモジュラー設計**

- useMemo/useCallback: 不要な再計算・再レンダリングを防ぐ
- RESTful API: ステートレス設計でスケーラビリティを確保
- PostgreSQL JSONB: 柔軟なデータ構造と時系列分析への拡張性

**根拠**:
- ダッシュボード再描画時間を150ms→60msへ削減した実績
- 将来的な機能拡張 (医療データ分析、パフォーマンストレンド) を見据えた設計

## Development Standards

### Testing Requirements

- **単体テスト**: 新規機能は必ずテストファースト (TDD)
- **カバレッジ目標**: 80%以上 (critical pathは90%以上)
- **統合テスト**: 以下の領域は必須
  - 認証フロー (JWT発行・検証)
  - ワークアウトデータのCRUD操作
  - 健康スコア算出ロジック
  - Strava API連携 (OAuth認証・データ同期)

### Code Review Standards

- **Pull Request**: すべての機能追加・修正はPRを経由
- **レビュー観点**:
  1. Constitution遵守の確認 (特にI. Evidence-Based, II. Security-First)
  2. 入力検証の実装 (express-validator/Yup)
  3. テストカバレッジ (理想は80%、最低限critical pathをカバー)
  4. パフォーマンスへの影響 (useMemoの適切な使用)

### Documentation Requirements

- **API変更**: OpenAPI/Swagger形式でドキュメント化
- **健康スコアアルゴリズム**: 参照論文・計算式を必ず記載
- **環境変数**: .env.exampleで必須変数を明示
- **コミットメッセージ**: Conventional Commits形式 (feat/fix/docs/refactor)

## Technology Stack Constraints

### Approved Technologies

- **Frontend**: React 18 + JavaScript (Vite + Material-UI)
- **Backend**: Node.js + Express + JavaScript
- **Database**: PostgreSQL 17 + Sequelize ORM
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator + Yup
- **External APIs**: Strava API (OAuth 2.0), 将来的にApple HealthKit / Google Fit
- **Deployment**: Vercel (Frontend + Backend)
- **CI/CD**: GitHub Actions
- **Future Migration**: TypeScript (Phase 1-4完了後に検討)

### Prohibited Practices

- ❌ 科学的根拠のない健康効果の表示
- ❌ 平文パスワードの保存
- ❌ CORSの全オリジン許可 (`*`)
- ❌ SQLインジェクション脆弱性を持つクエリ
- ❌ 本番環境でのconsole.logの残存
- ❌ 入力検証なしのAPI実装

## Governance

### Amendment Process

1. **提案**: GitHub Issueで変更理由と影響範囲を明記
2. **レビュー**: プロジェクトオーナーによる承認
3. **バージョニング**: セマンティックバージョニング
   - MAJOR: 後方互換性のない原則の削除・再定義
   - MINOR: 新原則の追加
   - PATCH: 文言の明確化、タイポ修正
4. **ドキュメント更新**: テンプレートとの整合性チェック

### Compliance Verification

- すべてのPull Requestは本Constitutionへの準拠を確認
- 原則に反する実装は、正当な理由なしにマージ禁止
- 複雑性の導入には必ず理由を明記

### Living Document

本Constitutionはプロジェクトの成長とともに進化する。Phase 1-4のロードマップに応じて、医療データ連携やAI機能追加時には適宜更新を行う。

**Version**: 1.1.0 | **Ratified**: 2025-10-10 | **Last Amended**: 2025-10-10
