# Tasks: ワークアウトフォームリセットバグ修正

**Input**: Design documents from `/specs/003-reset-ui-react/`
**Prerequisites**: plan.md, spec.md, research.md (完了)

**Tests**: Constitution Check (plan.md) でテストが必須と判定されたため、テストタスクを含む

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーの独立した実装とテストを可能にする

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: どのユーザーストーリーに属するか（US1, US2, US3）
- 各タスクに正確なファイルパスを含む

## Path Conventions
- **Web app**: `frontend/src/`, `frontend/tests/`
- パスはplan.mdの構造に基づく

---

## Phase 1: Setup (共有インフラストラクチャ)

**目的**: プロジェクト初期化と基本構造

このバグ修正では、既存のプロジェクト構造を使用するため、新しいセットアップタスクは不要です。

**Checkpoint**: セットアップ不要 - 既存プロジェクトで作業

---

## Phase 2: Foundational (ブロッキング前提条件)

**目的**: すべてのユーザーストーリー実装の前に完了すべきコアインフラ

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの作業を開始できない

### 基盤コード修正

- [ ] **T001** [P] [Foundation] `frontend/src/utils/formDefaults.js`のdefaultValuesを`null`から`''`（空文字列）に変更
  - すべての`defaults[key] = null`を`defaults[key] = ''`に変更
  - 影響: 距離、時間、セット数のすべてのデフォルト値

- [ ] **T002** [P] [Foundation] `frontend/src/components/WorkoutForm/ExerciseCard.jsx`の全Controllerに`value={field.value ?? ''}`を追加
  - 距離入力（カーディオ）のController
  - 時間入力（カーディオ）のController
  - セット入力（筋トレ）のController
  - undefined対策として必須

**Checkpoint**: 基盤完了 - ユーザーストーリー実装を開始可能

---

## Phase 3: User Story 1 - ワークアウト送信後のフォームリセット成功 (優先度: P1) 🎯 MVP

**ゴール**: ワークアウト送信成功後、すべての入力フィールドが即座にクリアされ、ユーザーが次のワークアウトのために新しい状態のフォームを使用できるようにする。

**独立したテスト**: ワークアウトデータ（例：腕立て伏せ15回）を入力 → 送信 → 成功メッセージ確認 → すべてのフィールドが空になることを確認

**受け入れ基準**:
1. 筋トレデータ送信後、すべてのセット入力がクリアされる
2. 有酸素運動データ送信後、距離と時間フィールドがクリアされる
3. 強度セレクターが空状態にリセットされる
4. 複数のエクササイズがすべて同時にリセットされる
5. リセット完了まで500ミリ秒以内

### Tests for User Story 1（TDD）

**NOTE: これらのテストを最初に作成し、実装前にFAILすることを確認**

- [ ] **T003** [P] [US1] `frontend/tests/components/WorkoutForm/WorkoutForm.test.jsx`を作成
  - テスト1: 筋トレデータ送信後のフォームリセット検証
  - テスト2: 有酸素運動データ送信後のフォームリセット検証
  - テスト3: 強度セレクターのリセット検証
  - テスト4: リセット完了時間が500ミリ秒以内であることを検証

- [ ] **T004** [P] [US1] `frontend/tests/components/WorkoutForm/reset-scenarios.test.jsx`を作成
  - テスト1: 複数エクササイズの同時リセット検証
  - テスト2: 送信エラー時に入力値が保持されることを検証
  - テスト3: 急速な連続送信時のリセット動作検証

**実装前チェックポイント**: すべてのテストがFAILすることを確認（`npm test`を実行）

### Implementation for User Story 1

- [ ] **T005** [US1] `frontend/src/components/WorkoutForm/index.jsx`にuseFormの設定を追加
  - `mode: 'onSubmit'`を追加
  - `reValidateMode: 'onSubmit'`を追加
  - formStateから`isSubmitSuccessful`を分割代入に追加
  - ファイル: `/Users/310tea/Documents/fittrack-app/frontend/src/components/WorkoutForm/index.jsx`（行40-47付近）

- [ ] **T006** [US1] `frontend/src/components/WorkoutForm/index.jsx`に送信成功後のリセット処理を追加
  - useEffectをインポート（既にインポートされている場合はスキップ）
  - 新しいuseEffectブロックを追加:
    ```javascript
    useEffect(() => {
      if (isSubmitSuccessful) {
        reset(generateDefaultValues(workoutConfig));
      }
    }, [isSubmitSuccessful, workoutConfig, reset]);
    ```
  - ファイル: `/Users/310tea/Documents/fittrack-app/frontend/src/components/WorkoutForm/index.jsx`（handleConfigSaveの後、行66付近）

- [ ] **T007** [US1] `frontend/src/hooks/useWorkoutSubmit.js`からreset()呼び出しを削除
  - 関数パラメータから`reset`と`generateDefaultValues`を削除
  - 行104の`reset(generateDefaultValues(workoutConfig))`を削除
  - useCallbackの依存配列から`reset`と`generateDefaultValues`を削除
  - ファイル: `/Users/310tea/Documents/fittrack-app/frontend/src/hooks/useWorkoutSubmit.js`

**実装後チェックポイント**: US1のすべてのテストがPASSすることを確認

---

## Phase 4: User Story 2 - 設定変更後の信頼性のあるフォームリセット (優先度: P2)

**ゴール**: 設定変更（エクササイズの変更、最大セット数の調整）後、フォームが確実にリセットされ、新しい構造を正しく反映する。

**独立したテスト**: 設定ドロワーを開く → 最大セット数を3から5に変更 → 保存 → すべての入力フィールドがリセットされ、5セット分の入力が表示されることを確認

**受け入れ基準**:
1. 最大セット数変更後、すべてのフィールドがリセットされ、新しいセット数が表示される
2. エクササイズ変更後、新しいエクササイズの空の入力フィールドが表示される
3. 筋トレ⇔有酸素運動の変更後、正しい入力タイプが表示される

### Tests for User Story 2（TDD）

- [ ] **T008** [P] [US2] `frontend/tests/components/WorkoutForm/config-change.test.jsx`を作成
  - テスト1: 最大セット数変更後のフォームリセット検証
  - テスト2: エクササイズ変更後のフォームリセット検証
  - テスト3: 筋トレ→有酸素運動変更後のフォームリセット検証
  - テスト4: 設定変更時のリセット成功率100%を検証

**実装前チェックポイント**: すべてのテストがFAILすることを確認

### Implementation for User Story 2

- [ ] **T009** [US2] `frontend/src/components/WorkoutForm/index.jsx`のuseEffectをuseLayoutEffectに変更
  - `useLayoutEffect`をReactからインポート
  - 行59-65の設定変更時のuseEffectを`useLayoutEffect`に変更:
    ```javascript
    useLayoutEffect(() => {
      if (shouldResetForm) {
        const newDefaults = generateDefaultValues(workoutConfig);
        reset(newDefaults);
        setShouldResetForm(false);
      }
    }, [shouldResetForm, workoutConfig, reset]);
    ```
  - ファイル: `/Users/310tea/Documents/fittrack-app/frontend/src/components/WorkoutForm/index.jsx`

**実装後チェックポイント**: US2のすべてのテストがPASSすることを確認

---

## Phase 5: User Story 3 - 複数回の送信サイクルにわたる一貫したフォーム動作 (優先度: P3)

**ゴール**: 連続して複数回ワークアウトを送信しても、各送信サイクルで一貫したリセット動作を維持する。

**独立したテスト**: 3〜5回のワークアウトを連続送信 → 各送信で完全なフォームリセットが行われることを確認

**受け入れ基準**:
1. 2回目以降の送信でも1回目と同じくらい確実にリセットされる
2. 10回以上の連続送信でパフォーマンス劣化なし
3. 設定変更と送信を組み合わせてもリセットが機能し続ける

### Tests for User Story 3（TDD）

- [ ] **T010** [P] [US3] `frontend/tests/components/WorkoutForm/reset-scenarios.test.jsx`に連続送信テストを追加
  - テスト1: 5回連続送信でのリセット一貫性検証
  - テスト2: 10回連続送信でのパフォーマンス検証（60fps維持）
  - テスト3: 設定変更+送信の組み合わせでのリセット検証

**実装前チェックポイント**: すべてのテストがFAILすることを確認

### Implementation for User Story 3

このユーザーストーリーは、US1とUS2の実装により自動的に達成されます。追加の実装タスクは不要ですが、テストで検証が必要です。

- [ ] **T011** [US3] パフォーマンス検証とメモリリーク確認
  - ブラウザDevToolsのPerformanceタブで10回連続送信を記録
  - フレームレートが60fps を維持していることを確認
  - メモリリークがないことを確認（Heap Snapshotで比較）
  - ファイル: ブラウザDevTools使用（コード変更なし）

**実装後チェックポイント**: US3のすべてのテストがPASSすることを確認

---

## Phase 6: Polish & Cross-Cutting Concerns

**目的**: 複数のユーザーストーリーに影響する改善

- [ ] **T012** [P] [Polish] `frontend/tests/`のすべてのテストを実行してカバレッジを確認
  - 目標: 新規/変更コードの90%以上のカバレッジ
  - コマンド: `npm run test:coverage`

- [ ] **T013** [P] [Polish] 手動テストを実施（quickstart.mdのテスト方法に従う）
  - テスト1: 送信後のリセット
  - テスト2: 設定変更後のリセット
  - テスト3: 連続送信
  - テスト4: エラー時の動作

- [ ] **T014** [Polish] ブラウザ互換性確認
  - iOS Safari (iPhone 14 Pro) で動作確認
  - Chrome/Firefox/Edge (デスクトップ) で動作確認

- [ ] **T015** [P] [Polish] コードレビュー実施
  - Constitution遵守の確認（特にIII. Rapid Development）
  - パフォーマンスへの影響確認
  - テストカバレッジ確認

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: スキップ - 既存プロジェクト
- **Foundational (Phase 2)**: 依存関係なし - すぐに開始可能 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-5)**: すべてFoundational phase完了に依存
  - ユーザーストーリーは優先順位順に実行（P1 → P2 → P3）
  - US3はUS1+US2の実装により自動達成
- **Polish (Phase 6)**: すべてのユーザーストーリー完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational (Phase 2)完了後に開始可能 - 他のストーリーへの依存なし
- **User Story 2 (P2)**: Foundational (Phase 2)完了後に開始可能 - US1と独立してテスト可能
- **User Story 3 (P3)**: US1+US2の実装により自動達成 - テストのみ必要

### Within Each User Story

- テストを最初に作成し、実装前にFAILすることを確認
- 実装タスクを順番に実行
- ストーリー完了後、次の優先度に移動

### Parallel Opportunities

- **Phase 2（Foundational）**: T001とT002は並列実行可能（異なるファイル）
- **US1のテスト**: T003とT004は並列実行可能
- **US1の実装**: T005, T006, T007は順次実行（同じファイルを複数回編集）
- **Phase 6（Polish）**: T012, T013, T015は並列実行可能

---

## Parallel Example: Foundational Phase

```bash
# Foundational tasksを同時に起動:
Task T001: "frontend/src/utils/formDefaults.jsのdefaultValuesを''に変更"
Task T002: "frontend/src/components/WorkoutForm/ExerciseCard.jsxにvalue={field.value ?? ''}を追加"
```

---

## Parallel Example: User Story 1 Tests

```bash
# US1のすべてのテストを同時に起動:
Task T003: "frontend/tests/components/WorkoutForm/WorkoutForm.test.jsxを作成"
Task T004: "frontend/tests/components/WorkoutForm/reset-scenarios.test.jsxを作成"
```

---

## Implementation Strategy

### MVP First (User Story 1のみ)

1. Phase 2完了: Foundational
2. **Phase 3完了: User Story 1**
3. **STOP and VALIDATE**: US1を独立してテスト
4. 成功したらデプロイ/デモ

### Incremental Delivery

1. Foundational → 基盤準備完了
2. + User Story 1 → 独立してテスト → デプロイ/デモ（MVP!）
3. + User Story 2 → 独立してテスト → デプロイ/デモ
4. + User Story 3 → 独立してテスト → デプロイ/デモ
5. 各ストーリーが前のストーリーを壊すことなく価値を追加

### Sequential Strategy (推奨)

バグ修正のため、順次実行を推奨:

1. Phase 2: Foundational（T001, T002を並列）
2. **Phase 3: US1**（テスト → 実装 → 検証）← MVP
3. **Phase 4: US2**（テスト → 実装 → 検証）
4. **Phase 5: US3**（テスト → 検証）
5. Phase 6: Polish（並列可能なタスク）

---

## Task Summary

### Total Tasks: 15

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1: Setup | 0 | スキップ（既存プロジェクト） |
| Phase 2: Foundational | 2 | 基盤コード修正（T001-T002） |
| Phase 3: US1 (P1) 🎯 MVP | 5 | テスト2 + 実装3（T003-T007） |
| Phase 4: US2 (P2) | 2 | テスト1 + 実装1（T008-T009） |
| Phase 5: US3 (P3) | 2 | テスト1 + 検証1（T010-T011） |
| Phase 6: Polish | 4 | テスト検証とレビュー（T012-T015） |

### Tasks per User Story

- **US1 (P1)**: 5タスク（テスト2 + 実装3）
- **US2 (P2)**: 2タスク（テスト1 + 実装1）
- **US3 (P3)**: 2タスク（テスト1 + 検証1）

### Parallel Opportunities

- Phase 2: 2タスク並列可能
- US1テスト: 2タスク並列可能
- Phase 6: 3タスク並列可能

### Independent Test Criteria

- **US1**: ワークアウト送信後、すべてのフィールドが500ms以内にクリア
- **US2**: 設定変更後、フォームが100%の確率でリセット
- **US3**: 10回連続送信で60fps維持、リセット動作に劣化なし

### Suggested MVP Scope

**MVP = Phase 2 + Phase 3 (User Story 1のみ)**

これにより、最も重要な問題（送信後のリセット）が解決され、即座に価値を提供できます。

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベル = 特定のユーザーストーリーへのトレーサビリティ
- 各ユーザーストーリーは独立して完了・テスト可能
- 実装前にテストがFAILすることを確認
- 各タスクまたは論理グループ後にコミット
- 各チェックポイントでストーリーを独立して検証
- 避けるべき: 曖昧なタスク、同じファイルの競合、ストーリーの独立性を壊す依存関係
