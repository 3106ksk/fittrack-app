# 🔧 [Refactor] WorkoutFormコンポーネントの単一責任原則に基づく分割

## 📋 概要
WorkoutFormコンポーネント（380行）を単一責任の原則に基づいて複数の小さなコンポーネントとカスタムフックに分割し、保守性とテスタビリティを向上させる。

## 🎯 目的と背景

### 現状の問題点
- 1つのファイルに7つの責任が混在している
- テストが書きにくい
- 変更時の影響範囲が大きい
- コードの再利用ができない

### 期待される効果
- ✅ 各ファイルが単一の責任を持つ
- ✅ ユニットテストが容易になる
- ✅ 再利用可能なカスタムフックの作成
- ✅ 保守性の向上

## 📊 技術仕様

### Before（現状）
```
components/WorkoutForm.jsx (380行)
├── フォーム状態管理
├── API通信処理
├── UI定数定義
├── フィードバック管理
├── 設定管理
├── バリデーション
└── UIレンダリング
```

### After（目標）
```
components/WorkoutForm/
├── index.jsx (50行) - コンテナ
├── WorkoutForm.jsx (100行) - プレゼンテーション
├── components/ - 子コンポーネント
└── constants.js - 定数

hooks/
├── useWorkoutForm.js
├── useWorkoutSubmit.js
└── useFeedback.js
```

## 📝 実装タスク

### Phase 1: 定数の分離 ⏱️ 30分
- [ ] `constants.js`ファイル作成
- [ ] DISTANCE_OPTIONS, DURATION_OPTIONS, REPS_OPTIONS移動
- [ ] インポート更新
- [ ] 動作確認

### Phase 2: フィードバック機能分離 ⏱️ 45分
- [ ] `useFeedback.js`カスタムフック作成
- [ ] フィードバック状態とロジックを移動
- [ ] タイマー処理の動作確認
- [ ] エラー/成功メッセージ表示確認

### Phase 3: 送信ロジック分離 ⏱️ 1時間
- [ ] `useWorkoutSubmit.js`カスタムフック作成
- [ ] API送信処理を移動
- [ ] データ変換ロジックを整理
- [ ] エラーハンドリング確認

### Phase 4: UIコンポーネント分割 ⏱️ 2時間
- [ ] WorkoutHeader.jsx作成
- [ ] ExerciseCard.jsx作成
- [ ] CardioFields.jsx作成
- [ ] StrengthFields.jsx作成
- [ ] Container/Presentationalパターン適用

### Phase 5: 最終調整 ⏱️ 30分
- [ ] ESLintエラー修正
- [ ] 不要なコメント削除
- [ ] 全体動作確認
- [ ] ドキュメント更新

## 🔍 影響範囲

### フロントエンド
- `pages/WorkoutForm.jsx` - インポートパス修正（1箇所）
- `components/FormConfigDrawer.jsx` - 影響なし（props変更なし）

### バックエンド
- **影響なし** - APIインターフェース変更なし

### テスト
- 既存テストなし - 新規作成の機会

## ✅ 受け入れ条件

### 機能要件
- [ ] 既存の全機能が正常動作すること
- [ ] FormConfigDrawerとの連携が維持されること
- [ ] APIへのデータ送信形式が変更されないこと

### 非機能要件
- [ ] 各ファイルが150行以下であること
- [ ] ESLintエラーが0件であること
- [ ] ビルドが成功すること
- [ ] コンポーネントの責任が明確に分離されていること

## 🚨 リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| props受け渡しミス | 中 | 段階的実装とテスト |
| 状態管理の不整合 | 高 | 既存ロジックを維持 |
| パフォーマンス低下 | 低 | React.memoの活用 |

## 📚 参考情報

- [実装手順書](./plan.md)
- [チェックリスト](./checklist.md)
- [単一責任の原則](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [Container/Presentationalパターン](https://www.patterns.dev/posts/presentational-container-pattern)

## 🏷️ ラベル
- `refactoring`
- `frontend`
- `enhancement`
- `code-quality`

## 👥 担当者
- 実装: @assignee
- レビュー: @reviewer

## 🔗 関連Issue/PR
- 元のfeature実装: #167
- 設定分離の修正: #xxx

## 💬 補足事項
このリファクタリングは既存機能に影響を与えないため、段階的にリリース可能です。
各Phaseごとにコミット・PRレビューを行い、問題があれば即座にロールバックできる体制を整えます。

---
**Estimated Time**: 5時間
**Priority**: Medium
**Sprint**: 次スプリント候補