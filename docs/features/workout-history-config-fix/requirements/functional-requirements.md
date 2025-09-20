# WorkoutHistory設定管理機能改善 - 機能要件書

**文書番号**: FRD-WH-002
**バージョン**: 2.0.0
**作成日**: 2025-09-20
**ステータス**: FormConfigパターン準拠版

## 改訂履歴
| バージョン | 日付 | 変更者 | 変更内容 |
|-----------|------|--------|----------|
| 1.0.0 | 2025-09-20 | System | 初版作成 |
| 2.0.0 | 2025-09-20 | System | FormConfigパターン準拠、順番変更機能追加 |

## 1. 機能概要

### 1.1 目的
WorkoutHistory設定管理におけるクロージャー問題を解決し、FormConfig（ワークアウト入力フォーム）と完全に統一された設定管理パターンを実装する。ローカル状態管理による編集モード（下書き）パターンを採用し、関数型アップデートでクロージャー問題を根本的に解決する。

### 1.2 スコープ

#### 対象範囲
- WorkoutHistory設定のクロージャー問題修正（stale closure問題）
- FormConfigと完全同一の設定管理パターンの実装
  - localConfig状態管理
  - handleToggleメソッド
  - updateExercises/updateMaxSets個別更新メソッド
- プリセット機能の完全削除
- 種目の順番変更機能の実装（WorkoutHistory独自機能）
- 動的なテーブル表示（順番に応じた列配置）

#### 対象外（将来の拡張機能）
- TypeScript化
- カスタムプリセット保存機能（v3.0）
- 設定のエクスポート/インポート機能
- 複数設定プロファイル管理

### 1.3 ビジネス価値
- **ユーザーエクスペリエンス**: 設定変更の下書き機能により誤操作防止
- **システム安定性**: クロージャー問題の根本解決によるバグゼロ化
- **コード品質**: FormConfigとの統一によるメンテナンス性向上
- **独自価値**: 順番変更による柔軟な履歴表示

## 2. ユーザーストーリー

### US-001: 編集モード（下書き）機能
**As a** フィットネスアプリユーザー
**I want to** 設定変更を下書きとして編集できる
**So that** 確認してから適用または破棄できる

**受け入れ条件**:
- [ ] ドロワー内の変更はローカル状態で管理される
- [ ] 変更中も元の設定は維持される
- [ ] キャンセルで全ての変更が破棄される
- [ ] 適用で全ての変更が一括反映される

### US-002: 種目の順番変更
**As a** フィットネスアプリユーザー
**I want to** 選択した種目の順番を変更できる
**So that** 履歴テーブルの表示順をカスタマイズできる

**受け入れ条件**:
- [ ] ドラッグ&ドロップで種目の順番を変更できる
- [ ] 順番変更がリアルタイムでプレビューされる
- [ ] 保存後、テーブルの列順が変更される
- [ ] 順番情報がLocalStorageに保持される

### US-003: FormConfigと統一された操作性
**As a** フィットネスアプリユーザー
**I want to** FormConfigと同じ操作方法で設定できる
**So that** 学習コストなく直感的に操作できる

**受け入れ条件**:
- [ ] チェックボックスによる種目選択（FormConfigと同一）
- [ ] スライダーによるセット数変更（FormConfigと同一）
- [ ] 保存/キャンセルボタンの配置と動作（FormConfigと同一）

## 3. 機能要件詳細

### 3.1 データ要件

#### WorkoutConfig構造（FormConfigと同一形式）
```javascript
{
  exercises: string[],  // 選択された種目の配列（順番保持、最大5個）
  maxSets: number       // 筋トレの最大セット数（1-5）
}
// 注: displayColumnsは削除（プリセット関連）
```

#### LocalStorage管理
- キー: `workoutConfig`（FormConfigは`formConfig`）
- 保存タイミング: updateExercises/updateMaxSets呼び出し時
- データ形式: JSON文字列
- プリセット関連フィールドは自動除外

### 3.2 ビジネスルール

1. **種目選択制限**
   - 最小: 1種目
   - 最大: 5種目
   - 重複選択不可
   - 順番情報を保持

2. **セット数制限**
   - 範囲: 1〜5セット
   - 筋トレ種目にのみ適用
   - カーディオ種目は影響なし

3. **状態管理（FormConfigパターン）**
   - ドロワー内: localConfig（編集中の下書き）
   - グローバル: workoutConfig（確定した設定）
   - 更新: 個別メソッド（updateExercises, updateMaxSets）

### 3.3 処理フロー

```mermaid
flowchart TD
    A[ドロワーを開く] --> B[workoutConfigをlocalConfigにコピー]
    B --> C{ユーザー操作}
    C -->|種目トグル| D[handleToggle → localConfig更新]
    C -->|順番変更| E[handleReorder → localConfig更新]
    C -->|セット数変更| F[handleMaxSetsChange → localConfig更新]
    D --> C
    E --> C
    F --> C
    C -->|キャンセル| G[handleCancel]
    C -->|保存| H[handleSave]
    G --> I[localConfigをリセット]
    H --> J[updateExercises(localConfig.exercises)]
    H --> K[updateMaxSets(localConfig.maxSets)]
    I --> L[onClose()]
    J --> M[関数型アップデートでworkoutConfig更新]
    K --> M
    M --> N[LocalStorage自動保存]
    N --> L
```

## 4. 技術要件

### 4.1 クロージャー問題の解決

#### 問題のあったパターン
```javascript
// ❌ stale closure
const updateMaxSets = useCallback(sets => {
  const newConfig = {...workoutConfig, maxSets: sets};  // 古い値
}, [workoutConfig]);
```

#### 解決パターン（FormConfig準拠）
```javascript
// ✅ 関数型アップデート
const updateMaxSets = useCallback(sets => {
  setWorkoutConfig(prev => ({...prev, maxSets: sets}));  // 最新値
}, []);  // 空の依存配列
```

### 4.2 ファイル構造（単一責任原則）
```
frontend/src/
├── pages/WorkoutHistory.jsx
├── components/WorkoutCustomizationDrawer.jsx
├── components/WorkoutHistoryTable.jsx
├── hooks/useWorkoutConfig.js
└── utils/workoutStorage.js
```

## 5. 非機能要件

### 5.1 パフォーマンス
- localConfig更新: 即座（<16ms）
- ドラッグ&ドロップ: 60fps維持
- LocalStorage保存: 50ms以内
- 不要な再レンダリング: ゼロ（メモ化適用）

### 5.2 使いやすさ
- FormConfigと同一の操作性
- 直感的なドラッグ&ドロップ
- 明確なビジュアルフィードバック
- エラー時の適切なメッセージ

### 5.3 信頼性
- クロージャー問題: 完全解決
- データ整合性: 原子性保証
- エラー処理: グレースフルデグラデーション

## 6. 制約事項

### 技術制約
- React 18.x（JavaScript実装）
- Material-UI v5
- LocalStorage容量制限（5MB）
- TypeScriptは将来拡張

### 設計制約
- FormConfigパターンとの完全統一
- 既存データとの後方互換性維持
- MVP原則（最小限の実装）

## 7. リスクと対策

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|----------|------|
| 既存プリセットデータの扱い | 中 | 高 | 自動除外処理で対応済み |
| ドラッグ&ドロップの実装複雑性 | 中 | 中 | ライブラリ活用またはPhase2へ延期 |
| FormConfigとの不整合 | 高 | 低 | 完全同一パターン採用で防止 |
| クロージャー問題の再発 | 高 | 低 | 関数型アップデートで根本解決 |

## 8. 成功指標

### 定量的指標
- クロージャーバグ: 0件（100%解消）
- 設定変更成功率: 99.9%以上
- 操作完了時間: 30秒以内
- コード重複率: 20%削減（FormConfigとの統一）

### 定性的指標
- ユーザー満足度: 設定変更の安心感向上
- 開発効率: FormConfigの知識を活用可能
- 保守性: 統一パターンによる理解容易性

## 9. テスト要件

### 単体テスト
```javascript
describe('useWorkoutConfig', () => {
  it('関数型アップデートで最新値を参照', () => {});
  it('LocalStorageへの自動保存', () => {});
  it('プリセット関連フィールドの除外', () => {});
  it('無効な種目のフィルタリング', () => {});
});

describe('WorkoutCustomizationDrawer', () => {
  it('開いた時にlocalConfigを初期化', () => {});
  it('handleToggleで種目の追加/削除', () => {});
  it('handleReorderで順番変更', () => {});
  it('handleSaveで個別メソッド呼び出し', () => {});
  it('handleCancelでlocalConfigリセット', () => {});
});
```

### 統合テスト
- [ ] FormConfigとの操作一貫性
- [ ] 順番変更がテーブルに反映
- [ ] LocalStorage同期の確認
- [ ] クロージャー問題が発生しないこと

### E2Eテスト
- [ ] 設定変更の完全フロー
- [ ] 複数タブでの動作
- [ ] エラーケースのリカバリー

## 10. 実装フェーズ

### Phase 1: 基本実装（FormConfigパターン適用）
- クロージャー問題の解決
- localConfig状態管理
- 個別更新メソッド実装
- プリセット機能削除

### Phase 2: 独自機能追加
- 順番変更機能（handleReorder）
- ドラッグ&ドロップUI
- 動的テーブル表示

### Phase 3: 品質向上
- パフォーマンス最適化
- アクセシビリティ対応
- テスト網羅