# 📋 Phase 1: コア機能改善 + セキュリティ基盤 - タスク一覧

**期間**: 2025年10月（Month 1）
**工数**: 26時間
**関連**: [Phase 1 要件定義書](../features/phase1-core-improvements/requirements.md) | [Phase 1 設計書](../features/phase1-core-improvements/design.md)

---

## 週次タスク

### Week 1: ワークヒストリー統合（7時間）

#### バックエンド修正（0.5時間）
- [ ] `backend/routes/workouts.js:247` に `createdAt` 追加
- [ ] API動作確認（Postman or curl）
- [ ] 既存テストが通ることを確認

#### フロントエンド実装（3時間）
- [ ] `frontend/src/components/activity/` ディレクトリ作成
- [ ] `RecentWorkoutsList.jsx` 作成
- [ ] `WorkoutItem.jsx` 作成
- [ ] `utils/formatWorkoutDetails.js` 作成
- [ ] `utils/groupByDate.js` 作成
- [ ] コンポーネントのユニットテスト作成

#### Dashboard統合（1時間）
- [ ] `Dashboard.jsx` に Accordion 追加
- [ ] `RecentWorkoutsList` をインポート・配置
- [ ] スタイリング調整

#### クリーンアップ（2時間）
- [ ] `WorkoutHistory.jsx` 削除
- [ ] `WorkoutHistoryTable.jsx` 削除
- [ ] `WorkoutCustomizationDrawer.jsx` 削除
- [ ] `useWorkoutConfig.js` 削除
- [ ] `App.jsx` から `/workout-history` ルート削除
- [ ] ナビゲーションから「履歴」リンク削除
- [ ] 関連テストファイル削除

#### テスト（0.5時間）
- [ ] 複数回トレーニングのテストケース
- [ ] セット回数バラバラのテストケース
- [ ] E2Eテスト（Dashboard表示確認）

---

### Week 2: 認証バグ修正 + セキュリティ強化（6時間）

#### バグ修正（3時間）

**新規登録後のナビゲーション問題**
- [ ] `backend/routes/authRoutes.js:38-43` 修正（JWT発行追加）
- [ ] フロントエンド側でトークン受信・保存
- [ ] E2Eテスト（登録→ダッシュボード遷移）

**ワークアウトフォームのリセット問題**
- [ ] `frontend/src/pages/WorkoutForm.jsx` 修正
- [ ] React Hook Form の `reset` 呼び出し
- [ ] E2Eテスト（送信→フォームクリア確認）

#### セキュリティ強化（3時間）

**CSP実装**
- [ ] `backend/config/security.js` 作成
- [ ] Helmet 設定（開発環境・本番環境別）
- [ ] `backend/app.js` に適用
- [ ] ブラウザコンソールでCSP違反チェック
- [ ] `package.json` に `helmet` 追加

**Rate Limiting実装**
- [ ] `backend/middleware/rateLimiter.js` 作成
- [ ] `authRoutes.js` に `authLimiter` 適用
- [ ] `workouts.js` に `apiLimiter` 適用
- [ ] `stravaRoutes.js` に `stravaLimiter` 適用
- [ ] 手動テスト（5回ログイン試行でブロック確認）
- [ ] `package.json` に `express-rate-limit` 追加

---

### Week 3: データ整合性 + 監査準備（7時間）

#### 重複問題修正（3時間）
- [ ] `backend/migrations/add-unique-constraint-workouts.js` 作成
- [ ] ユニーク制約追加（userID, date, exercise, createdAt）
- [ ] マイグレーション実行
- [ ] エラーハンドリング追加（重複時の適切なメッセージ）
- [ ] テスト（重複作成を試みて409エラー確認）

#### 監査ログ基盤（4時間）

**Winston Logger導入**
- [ ] `backend/utils/logger.js` 作成
- [ ] `logs/` ディレクトリ作成
- [ ] 日次ローテーション設定（最大30日保持）
- [ ] ログレベル定義（error, warn, info, debug）
- [ ] 動作確認（ログファイル生成確認）
- [ ] `package.json` に `winston`, `winston-daily-rotate-file` 追加

**監査ログミドルウェア**
- [ ] `backend/middleware/auditLogger.js` 作成
- [ ] `authRoutes.js` に適用（register, login）
- [ ] `workouts.js` に適用（create, update, delete）
- [ ] `stravaRoutes.js` に適用（connect, sync）
- [ ] ログファイル確認（JSON形式で記録されているか）

---

### Week 4: Strava修正 + ドキュメント整備（6時間）

#### Stravaバグ修正（4時間）
- [ ] `backend/services/stravaService.js` のエラーハンドリング強化
- [ ] リトライロジック追加（exponential backoff）
- [ ] タイムアウト設定確認（30秒）
- [ ] エラーメッセージ改善（ユーザーフレンドリーに）
- [ ] 動作確認（Strava連携テスト）
- [ ] テスト追加（エラーケース）

#### ドキュメント整備（2時間）

**README.md 更新**
- [ ] プロジェクト概要更新
- [ ] アーキテクチャ図追加
- [ ] セキュリティ対策の説明追加
  - CSP実装
  - Rate Limiting
  - 監査ログ
- [ ] 800行削減の意思決定プロセス追加
- [ ] セットアップ手順更新

**CHANGELOG.md 作成**
- [ ] Phase 1 の全変更を記録
  - ワークヒストリー統合
  - 全バグ修正（4件）
  - セキュリティ強化
  - 監査ログ基盤

---

## チェックリスト（Phase 1 完了基準）

### 機能完成度
- [ ] ワークヒストリーがダッシュボードに統合されている
- [ ] 直近10件のログが日付グループ化で表示される
- [ ] 同日複数回トレーニング時に時刻が表示される
- [ ] repsDetailがバラバラでも正しく表示される
- [ ] 旧WorkoutHistory関連ファイルが全て削除されている

### バグ修正
- [ ] 新規登録後、自動的に `/dashboard` へ遷移する
- [ ] ワークアウト送信後、フォームがリセットされる
- [ ] 重複ワークアウトが作成できない
- [ ] Strava連携が正常に動作する

### セキュリティ
- [ ] CSPヘッダーが設定されている
- [ ] CSP違反がブラウザコンソールに出ない
- [ ] Rate Limitingが動作する（5回ログイン試行でブロック）
- [ ] 監査ログが記録されている（logs/fittrack-YYYY-MM-DD.log）

### テスト
- [ ] ユニットテストカバレッジ: 60%以上
- [ ] E2Eテストが全て通る
- [ ] ビルドエラーがない
- [ ] ESLint警告がない

### ドキュメント
- [ ] README.md が更新されている
- [ ] CHANGELOG.md が作成されている
- [ ] Phase 1 要件定義書が完成している
- [ ] Phase 1 設計書が完成している

### コード品質
- [ ] 約800行のコードが削減されている
- [ ] 新規追加コードに適切なコメントがある
- [ ] TypeScript型エラーがない

---

## 進捗トラッキング

### Week別進捗

```
Week 1: [□□□□□□□□□□] 0% (0/7時間)
Week 2: [□□□□□□□□□□] 0% (0/6時間)
Week 3: [□□□□□□□□□□] 0% (0/7時間)
Week 4: [□□□□□□□□□□] 0% (0/6時間)

Phase 1 全体: [□□□□□□□□□□] 0% (0/26時間)
```

### タスク別進捗

| カテゴリ | タスク数 | 完了 | 進捗率 |
|---------|---------|------|--------|
| ワークヒストリー統合 | 15 | 0 | 0% |
| バグ修正 | 8 | 0 | 0% |
| セキュリティ強化 | 10 | 0 | 0% |
| 監査ログ | 8 | 0 | 0% |
| ドキュメント | 6 | 0 | 0% |
| **合計** | **47** | **0** | **0%** |

---

## 次のステップ

1. **Week 1 Day 1**: `backend/routes/workouts.js:247` に `createdAt` 追加
2. **環境準備**: `npm install helmet express-rate-limit winston winston-daily-rotate-file`
3. **週次レビュー**: 毎週金曜日に進捗確認

---

**最終更新**: 2025-10-09
**次回レビュー**: 2025-10-15（Week 2完了時）

---

[← Phase 1 要件定義書](../features/phase1-core-improvements/requirements.md) | [Phase 1 設計書 →](../features/phase1-core-improvements/design.md)
