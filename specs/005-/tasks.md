# Tasks: バックエンドエラーハンドリング実装

**機能ブランチ**: `005-`
**作成日**: 2025-11-14
**入力ドキュメント**: plan.md, spec.md, research.md, data-model.md, contracts/

**テスト**: SC-007「既存のすべてのAPIエンドポイントのテストスイートで、エラーケースのテストが追加され、90%以上のテストが成功する」に基づき、テストタスクを含みます。

**組織**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テスト可能にします。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: タスクが属するユーザーストーリー（US1, US2, US3, US4）
- 説明には正確なファイルパスを含む

---

## Phase 1: Setup（共有インフラストラクチャ）

**目的**: プロジェクトの初期化と依存パッケージのインストール

- [ ] **T001** [P] 依存パッケージのインストール: `cd backend && npm install winston winston-daily-rotate-file express-rate-limit uuid`
- [ ] **T002** [P] logsディレクトリの作成: `mkdir -p backend/logs`
- [ ] **T003** [P] .gitignoreにlogsディレクトリを追加: `echo "logs/" >> backend/.gitignore`
- [ ] **T004** [P] .envファイルに環境変数を追加: `LOG_LEVEL=info`（開発環境）、`NODE_ENV=development`

---

## Phase 2: Foundational（ブロックする前提条件）

**目的**: すべてのユーザーストーリーが依存するコアインフラストラクチャ。このフェーズ完了まで、ユーザーストーリーの実装は開始できない。

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリー作業は開始できません

### 基盤ユーティリティ（すべてのストーリーで使用）

- [ ] **T005** [P] **[Foundation]** エラーコード定義を作成: `backend/utils/errorCodes.js`
  - ERROR_CODESオブジェクトを定義: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMIT_EXCEEDED`, `DATABASE_ERROR`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`, `GATEWAY_TIMEOUT`

- [ ] **T006** [P] **[Foundation]** カスタムエラークラスを作成: `backend/utils/AppError.js`
  - `AppError`クラスを実装: コンストラクタで`message`, `statusCode`, `code`, `details`を受け取る
  - `isOperational`プロパティを`true`に設定
  - `Error.captureStackTrace(this, this.constructor)`を呼び出す

- [ ] **T007** **[Foundation]** Winston ロガーを設定: `backend/utils/logger.js`
  - Winston + winston-daily-rotate-file を設定
  - トランスポート: error-%DATE%.log（errorレベルのみ）、combined-%DATE%.log（すべてのレベル）
  - 日次ローテーション、30日保持、20MB上限、gzip圧縮
  - exceptionHandlers, rejectionHandlers を設定
  - 開発環境ではconsole出力も追加
  - JSON形式で構造化ログを記録

### 基盤ミドルウェア（すべてのストーリーで使用）

- [ ] **T008** [P] **[Foundation]** リクエストIDミドルウェアを作成: `backend/middleware/requestId.js`
  - `uuid`パッケージを使ってUUID v4を生成
  - `req.id`にリクエストIDを付与
  - `X-Request-Id`レスポンスヘッダーも設定

**Checkpoint**: 基盤が整いました - ユーザーストーリー実装を並列開始可能

---

## Phase 3: User Story 1 - システムエラー発生時の明確なフィードバック (Priority: P1) 🎯 MVP

**Goal**: すべてのAPIエンドポイントで統一されたエラーレスポンス形式を返し、ユーザーに明確なエラーメッセージを提供する

**Independent Test**: 任意のAPIエンドポイントでエラーを発生させ、レスポンスが統一されたJSON形式（status, code, message, requestId, timestamp）で返ることを確認

### 実装 for User Story 1

- [ ] **T009** **[US1]** 中央集約型エラーハンドラーミドルウェアを作成: `backend/middleware/errorHandler.js`
  - Sequelizeエラー（ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError, TimeoutError）を検出して変換
  - エラーレスポンス形式: `{status, code, message, details?, requestId, timestamp}`
  - 本番環境（`NODE_ENV=production`）ではスタックトレースを除外、開発環境では`details.stack`に含める
  - Winstonロガーでエラーをログ記録（requestId, userId, endpoint, method, statusCode, errorType, message, stack）
  - JWTエラー（UnauthorizedError）を適切に処理（401ステータス）

- [ ] **T010** **[US1]** app.jsにミドルウェアを統合: `backend/app.js`
  - ミドルウェアの順序を修正:
    1. `helmet()` - セキュリティヘッダー
    2. `cors()` - CORS設定
    3. `requestIdMiddleware` - リクエストID付与
    4. `express.json()`, `express.urlencoded()` - ボディパーサー
    5. ルート定義の前: グローバルレート制限（Phase 5で実装）
    6. ルート定義
    7. 404 Not Foundハンドラー（新規追加）
    8. `errorHandler` - エラーハンドラー（最後）
  - 404ハンドラーを追加: `new AppError('指定されたリソースが見つかりません', 404, 'NOT_FOUND')`を`next()`に渡す

- [ ] **T011** **[US1]** 既存ルートのエラーハンドリングを新システムに移行: `backend/routes/authRoutes.js`
  - 既存のtry-catchブロックを保持しつつ、エラーを`AppError`でラップして`next()`に渡す
  - `SequelizeUniqueConstraintError`は削除（エラーハンドラーで処理）
  - バリデーションエラーはexpress-validatorの結果をそのまま`AppError`の`details`に含める

- [ ] **T012** [P] **[US1]** 既存ルートのエラーハンドリングを新システムに移行: `backend/routes/workouts.js`
  - 既存のSequelizeエラー処理を削除（エラーハンドラーで統一処理）
  - `next(error)`でエラーハンドラーに渡す

- [ ] **T013** [P] **[US1]** 既存ルートのエラーハンドリングを新システムに移行: `backend/routes/stravaRoutes.js`
  - 汎用的なエラーメッセージを`AppError`に変換
  - `next(error)`でエラーハンドラーに渡す

- [ ] **T014** [P] **[US1]** 既存ルートのエラーハンドリングを新システムに移行: `backend/routes/insightRoutes.js`
  - 汎用的なエラーメッセージを`AppError`に変換
  - `next(error)`でエラーハンドラーに渡す

### テスト for User Story 1

- [ ] **T015** [P] **[US1]** エラーハンドラーミドルウェアのユニットテストを作成: `backend/tests/middleware/errorHandler.test.js`
  - Sequelize ValidationErrorが400 + VALIDATION_ERRORに変換されることをテスト
  - Sequelize UniqueConstraintErrorが409 + CONFLICTに変換されることをテスト
  - Sequelize DatabaseErrorが503 + SERVICE_UNAVAILABLEに変換されることをテスト
  - Sequelize TimeoutErrorが504 + GATEWAY_TIMEOUTに変換されることをテスト
  - 本番環境でスタックトレースが除外されることをテスト
  - 開発環境でスタックトレースが含まれることをテスト

- [ ] **T016** [P] **[US1]** リクエストIDミドルウェアのユニットテストを作成: `backend/tests/middleware/requestId.test.js`
  - `req.id`にUUID v4が付与されることをテスト
  - `X-Request-Id`レスポンスヘッダーが設定されることをテスト

- [ ] **T017** **[US1]** エラーハンドリングの統合テストを作成: `backend/tests/integration/errorHandling.test.js`
  - `/authrouter/register`にバリデーションエラーが発生した場合、400 + 統一形式で返されることをテスト
  - `/authrouter/register`に重複メールアドレスでリクエストした場合、409 + 「このメールアドレスは既に使用されています」が返されることをテスト
  - 存在しないエンドポイントにリクエストした場合、404 + NOT_FOUNDが返されることをテスト
  - すべてのエラーレスポンスに`requestId`と`timestamp`が含まれることをテスト
  - 本番環境でエラーレスポンスにスタックトレースが含まれないことをテスト

**Checkpoint**: User Story 1完了 - 統一エラーレスポンス形式がすべてのエンドポイントで動作

---

## Phase 4: User Story 2 - エラーの追跡とデバッグの容易性 (Priority: P2)

**Goal**: 構造化ログによりエラーを追跡可能にし、リクエストIDで検索できるようにする

**Independent Test**: エラーを発生させ、`logs/`ディレクトリに構造化ログ（JSON形式）が記録されること、リクエストIDでログを検索できることを確認

### 実装 for User Story 2

- [ ] **T018** **[US2]** errorHandler.jsのロギング機能を強化: `backend/middleware/errorHandler.js`
  - エラーレスポンス送信前に、Winstonで構造化ログを記録
  - ログフィールド: `timestamp`, `level`, `requestId`, `userId`, `endpoint`, `method`, `statusCode`, `errorType`, `message`, `stack`, `metadata`
  - statusCode >= 500は`error`レベル、statusCode >= 400は`warn`レベル
  - センシティブ情報（password, token, jwt）をマスキング

- [ ] **T019** [P] **[US2]** Railwayデプロイ環境でのログ設定を確認: `backend/app.js`
  - `app.set('trust proxy', 1)`を設定（Railwayのリバースプロキシ対応）
  - logsディレクトリの存在確認: `fs.mkdirSync('logs', { recursive: true })`

### テスト for User Story 2

- [ ] **T020** [P] **[US2]** Winstonロガーのユニットテストを作成: `backend/tests/utils/logger.test.js`
  - ログがJSON形式で記録されることをテスト
  - エラーレベルのログが`logs/error-*.log`に記録されることをテスト
  - すべてのログが`logs/combined-*.log`に記録されることをテスト
  - ログファイルのローテーションが動作することをテスト（モック使用）

- [ ] **T021** **[US2]** ログ記録の統合テストを作成: `backend/tests/integration/logging.test.js`
  - APIエラー発生時に構造化ログが記録されることをテスト
  - ログに`requestId`, `endpoint`, `method`, `statusCode`, `errorType`, `message`, `stack`が含まれることをテスト
  - リクエストIDでログを検索できることをテスト（grep相当の処理）
  - センシティブ情報（password）がマスキングされることをテスト

**Checkpoint**: User Story 2完了 - エラーログが構造化され、リクエストIDで追跡可能

---

## Phase 5: User Story 3 - API乱用からの保護 (Priority: P3)

**Goal**: レート制限により短時間の大量リクエストを防ぎ、正当なユーザーには適切なフィードバックを提供する

**Independent Test**: 特定のエンドポイントに短時間で大量のリクエストを送信し、HTTP 429が返されること、`Retry-After`ヘッダーが含まれることを確認

### 実装 for User Story 3

- [ ] **T022** **[US3]** レート制限ミドルウェアを作成: `backend/middleware/rateLimiter.js`
  - express-rate-limitを使用してグローバルリミッター（100リクエスト/15分）を作成
  - 認証エンドポイント用リミッター（5リクエスト/15分、`skipSuccessfulRequests: true`）を作成
  - ワークアウトエンドポイント用リミッター（200リクエスト/15分）を作成
  - Stravaエンドポイント用リミッター（100リクエスト/15分）を作成
  - レート制限到達時のエラーレスポンス形式を統一: `{status: 429, code: 'RATE_LIMIT_EXCEEDED', message: '...', requestId, timestamp}`
  - `Retry-After`ヘッダーを含める
  - エクスポート: `{ globalLimiter, authLimiter, workoutLimiter, stravaLimiter }`

- [ ] **T023** **[US3]** app.jsにレート制限を統合: `backend/app.js`
  - グローバルリミッターを`/api`パスに適用（ボディパーサーの後、ルート定義の前）
  - `/api/health`エンドポイントをレート制限から除外（グローバルリミッターの前に定義）

- [ ] **T024** [P] **[US3]** 認証ルートにレート制限を適用: `backend/routes/authRoutes.js`
  - `/login`, `/register`エンドポイントに`authLimiter`を適用
  - 例: `router.post('/login', authLimiter, async (req, res, next) => { ... })`

- [ ] **T025** [P] **[US3]** ワークアウトルートにレート制限を適用: `backend/routes/workouts.js`
  - ルートハンドラーの前に`workoutLimiter`を適用

- [ ] **T026** [P] **[US3]** Stravaルートにレート制限を適用: `backend/routes/stravaRoutes.js`
  - ルートハンドラーの前に`stravaLimiter`を適用

### テスト for User Story 3

- [ ] **T027** [P] **[US3]** レート制限ミドルウェアのユニットテストを作成: `backend/tests/middleware/rateLimiter.test.js`
  - グローバルリミッターが100リクエスト/15分で制限されることをテスト
  - 認証リミッターが5リクエスト/15分で制限されることをテスト
  - レート制限到達時に429ステータスが返されることをテスト
  - `Retry-After`ヘッダーが含まれることをテスト

- [ ] **T028** **[US3]** レート制限の統合テストを作成: `backend/tests/integration/rateLimiting.test.js`
  - `/authrouter/login`に6回連続でリクエストした場合、6回目が429を返すことをテスト
  - `/api/workouts`に201回連続でリクエストした場合、201回目が429を返すことをテスト
  - レート制限エラーレスポンスが統一形式（status, code, message, requestId, timestamp）であることをテスト
  - レート制限リセット後、正常にリクエストが処理されることをテスト
  - `/api/health`エンドポイントがレート制限から除外されることをテスト

**Checkpoint**: User Story 3完了 - レート制限が動作し、API乱用を防止

---

## Phase 6: User Story 4 - データベース障害時のグレースフルな応答 (Priority: P2)

**Goal**: データベース接続エラーを適切に処理し、サーバー起動時にDB接続を確認する

**Independent Test**: データベースを停止した状態でサーバー起動を試行し、起動が失敗することを確認。データベース稼働中にクエリエラーを発生させ、適切なエラーレスポンスが返されることを検証。

### 実装 for User Story 4

- [ ] **T029** **[US4]** server.jsにDB接続確認を追加: `backend/server.js`
  - サーバー起動前に`sequelize.authenticate()`でDB接続を確認
  - 接続失敗時は、エラーログを出力して`process.exit(1)`
  - 接続成功時のみ、`app.listen()`を実行

- [ ] **T030** **[US4]** errorHandler.jsのSequelizeエラー処理を強化: `backend/middleware/errorHandler.js`（T009で作成済み）
  - `ConnectionError`（データベース接続失敗）を検出して503 SERVICE_UNAVAILABLEを返す
  - `TimeoutError`（クエリタイムアウト）を検出して504 GATEWAY_TIMEOUTを返す
  - `ForeignKeyConstraintError`を検出して400 + 「関連するデータが見つかりません」を返す
  - すでにT009で実装済みだが、テストケースを追加

### テスト for User Story 4

- [ ] **T031** [P] **[US4]** DB接続確認のユニットテストを作成: `backend/tests/server.test.js`
  - データベース接続成功時にサーバーが起動することをテスト
  - データベース接続失敗時にサーバーが起動せず、`process.exit(1)`が呼ばれることをテスト（モック使用）

- [ ] **T032** **[US4]** DB障害時のエラーハンドリング統合テストを作成: `backend/tests/integration/databaseErrors.test.js`
  - データベース接続切断時に503 SERVICE_UNAVAILABLEが返されることをテスト（モック使用）
  - クエリタイムアウト時に504 GATEWAY_TIMEOUTが返されることをテスト（モック使用）
  - 外部キー制約違反時に400 + 「関連するデータが見つかりません」が返されることをテスト

**Checkpoint**: User Story 4完了 - データベース障害時の適切な処理が実装され、サーバー起動時にDB接続確認が動作

---

## Phase 7: Polish & Cross-Cutting Concerns

**目的**: 複数のユーザーストーリーに影響する改善

- [ ] **T033** [P] **[Polish]** パフォーマンスベンチマークを実行: `backend/middleware/requestId.js`, `backend/utils/logger.js`
  - リクエストID生成のオーバーヘッドを計測（目標: <0.1ms）
  - Winstonロギングのオーバーヘッドを計測（目標: <5ms）
  - レート制限チェックのオーバーヘッドを計測（目標: <1ms）
  - `process.hrtime.bigint()`を使用して実測

- [ ] **T034** [P] **[Polish]** 環境変数のドキュメントを更新: `backend/.env.example`
  - `NODE_ENV`, `LOG_LEVEL`を追加
  - 各変数の説明を記載

- [ ] **T035** [P] **[Polish]** quickstart.mdの検証: `specs/005-/quickstart.md`
  - クイックスタートガイドの手順に従って、エラーハンドリングシステムが動作することを確認
  - 必要に応じてドキュメントを更新

- [ ] **T036** **[Polish]** 既存テストスイートのエラーケースカバレッジを確認
  - 全APIエンドポイントのテストスイートを確認
  - エラーケースのテストが追加されているか確認
  - SC-007「90%以上のテストが成功する」を検証

- [ ] **T037** [P] **[Polish]** エラーメッセージの国際化対応を検討（Future）
  - `message`フィールドを日本語と英語で切り替えられるように設計を検討
  - `Accept-Language`ヘッダーに基づく切り替え（Phase 8以降で実装）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし - すぐに開始可能
- **Foundational (Phase 2)**: Setup完了後に開始 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-6)**: すべてFoundational完了後に開始可能
  - 複数開発者がいれば並列実行可能
  - 単独開発者なら優先順位順（P1 → P2 → P3 → P2）
- **Polish (Phase 7)**: すべてのユーザーストーリー完了後

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完了後に開始可能 - 他ストーリーへの依存なし
- **User Story 2 (P2)**: Foundational完了後に開始可能 - US1と統合するが独立してテスト可能
- **User Story 3 (P3)**: Foundational完了後に開始可能 - US1, US2と独立
- **User Story 4 (P2)**: Foundational完了後に開始可能 - US1と統合するが独立してテスト可能

### 各ユーザーストーリー内の順序

- テスト → 実装（TDDアプローチ）
- ユーティリティ → ミドルウェア → ルート統合
- ユニットテスト → 統合テスト
- コア実装 → 統合 → ストーリー完了

### 並列実行の機会

- **Phase 1（Setup）**: T001, T002, T003, T004 すべて並列実行可能
- **Phase 2（Foundational）**: T005, T006, T008 は並列実行可能（T007はT005, T006の後）
- **Foundational完了後**: すべてのユーザーストーリー（US1, US2, US3, US4）を並列開始可能
- **各ユーザーストーリー内**:
  - US1: T011, T012, T013, T014（既存ルート移行）は並列実行可能
  - US1: T015, T016（ユニットテスト）は並列実行可能
  - US3: T024, T025, T026（ルートへのレート制限適用）は並列実行可能
  - US3: T027（ユニットテスト）は並列実行可能

---

## Parallel Example: User Story 1

```bash
# ユニットテストを並列起動:
Task T015: "エラーハンドラーミドルウェアのユニットテストを作成: backend/tests/middleware/errorHandler.test.js"
Task T016: "リクエストIDミドルウェアのユニットテストを作成: backend/tests/middleware/requestId.test.js"

# 既存ルート移行を並列起動:
Task T012: "既存ルートのエラーハンドリングを新システムに移行: backend/routes/workouts.js"
Task T013: "既存ルートのエラーハンドリングを新システムに移行: backend/routes/stravaRoutes.js"
Task T014: "既存ルートのエラーハンドリングを新システムに移行: backend/routes/insightRoutes.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup完了
2. Phase 2: Foundational完了（CRITICAL - すべてのストーリーをブロック）
3. Phase 3: User Story 1完了
4. **STOP and VALIDATE**: User Story 1を独立してテスト
5. デプロイ/デモ可能

### Incremental Delivery

1. Setup + Foundational完了 → 基盤準備完了
2. User Story 1追加 → 独立テスト → デプロイ/デモ（MVP!）
3. User Story 2追加 → 独立テスト → デプロイ/デモ
4. User Story 4追加 → 独立テスト → デプロイ/デモ
5. User Story 3追加 → 独立テスト → デプロイ/デモ
6. 各ストーリーが価値を追加し、既存ストーリーを破壊しない

### Parallel Team Strategy

複数開発者がいる場合:

1. チーム全体でSetup + Foundationalを完了
2. Foundational完了後:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 4
   - Developer D: User Story 3
3. 各ストーリーが独立して完了・統合

---

## Notes

- **[P]** タスク = 異なるファイル、依存関係なし
- **[Story]** ラベルで特定のユーザーストーリーにタスクをマップ（トレーサビリティ）
- 各ユーザーストーリーは独立して完成・テスト可能
- テスト作成前に実装を確認（TDD）
- 各タスクまたは論理的なグループごとにコミット
- 各チェックポイントでストーリーを独立して検証
- 避けるべき: 曖昧なタスク、同じファイルの競合、ストーリーの独立性を損なうクロスストーリー依存

---

## Summary

**総タスク数**: 37タスク

**ユーザーストーリー別タスク数**:
- User Story 1（P1）: 9タスク（実装6 + テスト3）
- User Story 2（P2）: 4タスク（実装2 + テスト2）
- User Story 3（P3）: 7タスク（実装5 + テスト2）
- User Story 4（P2）: 4タスク（実装2 + テスト2）
- Setup: 4タスク
- Foundational: 4タスク
- Polish: 5タスク

**並列実行機会**:
- Phase 1: 4タスク並列可能
- Phase 2: 3タスク並列可能
- User Stories: 4ストーリー並列開始可能（Foundational完了後）
- US1内: 5タスク並列可能
- US3内: 4タスク並列可能

**推奨MVPスコープ**: Phase 1 + Phase 2 + Phase 3（User Story 1のみ）

**実装期間見積もり**:
- MVP（US1のみ）: 3-4日
- 全機能: 7-10日（単独開発者）/ 4-5日（4名並列）
