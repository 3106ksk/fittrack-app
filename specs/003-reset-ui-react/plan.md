# Implementation Plan: ワークアウトフォームリセットバグ修正

**Branch**: `003-reset-ui-react` | **Date**: 2025-10-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-reset-ui-react/spec.md`

## Summary

ワークアウトフォーム送信後にReact Hook Formのreset()が呼ばれているにもかかわらず、UIに入力値が残り続ける問題を修正する。フォームの内部状態とUI表示の同期を確実にし、送信成功後500ミリ秒以内にすべてのフィールドをクリアする。設定変更時のリセットも安定化させる。

**技術的アプローチ**: React Hook Formのreset()とuseFormのモード設定を調整し、フォームの再マウント戦略を実装。状態管理の同期タイミングを最適化し、設定変更時の競合状態を解消する。

## Technical Context

**Language/Version**: JavaScript (React 18.2.0)
**Primary Dependencies**:
  - react-hook-form: ^7.54.2
  - @hookform/resolvers: ^3.9.0
  - yup: ^0.32.11 (バリデーション)
  - @mui/material: ^5.15.4 (UI コンポーネント)
  - vite: ^4.5.7 (開発環境)

**Storage**: LocalStorage (フォーム設定の永続化)
**Testing**: Vitest + React Testing Library + MSW (モック)
**Target Platform**:
  - 主要: iOS Safari (iPhone 14 Pro 390x844)
  - 副次: Chrome/Firefox/Edge (デスクトップ)

**Project Type**: Web application (frontend only - バックエンドAPIは変更なし)

**Performance Goals**:
  - リセット操作完了まで500ミリ秒以内
  - フォーム再レンダリング60fps維持
  - 10回以上の連続送信でパフォーマンス劣化なし

**Constraints**:
  - 既存のuseWorkoutSubmit、useFormConfig、useFormValidationフックのインターフェース破壊不可
  - LocalStorageデータ形式の後方互換性維持
  - バリデーション動作の保持（空フィールドにエラー表示禁止）
  - ページリフレッシュ不要で動作

**Scale/Scope**:
  - 影響範囲: 1コンポーネント (WorkoutForm/index.jsx)
  - 関連フック: 3ファイル (useWorkoutSubmit, useFormConfig, useFormValidation)
  - テスト対象: 9機能要件 + 5エッジケース

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Evidence-Based Health Metrics (NON-NEGOTIABLE)
- **適用**: N/A - このバグ修正は健康効果の数値化や医療データには関与しない
- **判定**: PASS

### ✅ II. Security-First Architecture (NON-NEGOTIABLE)
- **適用**: N/A - フロントエンドのフォームリセット処理のみ。認証やAPIエンドポイントの変更なし
- **判定**: PASS

### ✅ III. Rapid Development & Portfolio Delivery
- **適用**: あり - JavaScript (React 18) の既存実装を維持
- **遵守状況**:
  - ✅ JavaScript実装を継続
  - ✅ Yupスキーマによるクライアントサイドバリデーション維持
  - ✅ 「動くもの」を優先（既存バグの修正で機能追加なし）
- **判定**: PASS

### ✅ IV. Mobile-First Responsive Design
- **適用**: あり - フォームリセットはタッチ操作後の体験に影響
- **遵守状況**:
  - ✅ iPhone 14 Pro基準の最適化を維持
  - ✅ Material-UIコンポーネントの使用継続
  - ✅ タッチ操作フローに影響なし（リセットは送信後の自動処理）
- **判定**: PASS

### ✅ V. Performance Optimization & Scalability
- **適用**: あり - リセット処理のパフォーマンスが要件
- **遵守状況**:
  - ✅ useMemo/useCallbackの既存使用を維持
  - ⚠️ 追加の最適化が必要な可能性（Phase 0で調査）
- **判定**: PASS (要Phase 0調査)

### Testing Requirements
- **適用**: あり - 新規機能ではなくバグ修正だが、テストは必須
- **計画**:
  - 単体テスト: reset()の呼び出し、フォーム状態の検証
  - 統合テスト: 送信→リセット→再送信のフロー
  - カバレッジ目標: 新規/変更コードの90%以上
- **判定**: PASS (Phase 2で実装)

**総合判定**: ✅ **PASS** - すべての原則に準拠。Phase 0へ進行可能。

---

## Constitution Check (Phase 1後の再評価)

*Phase 1デザイン完了後の再評価*

### ✅ I. Evidence-Based Health Metrics (NON-NEGOTIABLE)
- **再評価**: N/A - データモデル変更なし、健康効果の計算に影響なし
- **判定**: PASS

### ✅ II. Security-First Architecture (NON-NEGOTIABLE)
- **再評価**: フロントエンドのみの変更で、セキュリティへの影響なし
- **判定**: PASS

### ✅ III. Rapid Development & Portfolio Delivery
- **再評価**:
  - ✅ JavaScript実装を維持
  - ✅ 既存のReact Hook Form + Material-UIの使用を継続
  - ✅ 新しい技術スタックの導入なし
  - ✅ 調査により実証済みのベストプラクティスを特定
- **判定**: PASS

### ✅ IV. Mobile-First Responsive Design
- **再評価**:
  - ✅ UIコンポーネントの変更なし
  - ✅ リセット処理はバックグラウンドで動作し、ユーザー体験を向上
  - ✅ パフォーマンス最適化（useLayoutEffect）により、タッチ操作後の応答性が向上
- **判定**: PASS

### ✅ V. Performance Optimization & Scalability
- **再評価**:
  - ✅ 既存のuseMemo/useCallbackを維持
  - ✅ フォーム再マウントを避けることでReact Hook Formの最適化を活用
  - ✅ useLayoutEffectによる微小な遅延（< 16ms）は視覚的に認識できない
  - ✅ 調査により、パフォーマンスゴール（500ms以内、60fps維持）の達成が確認された
- **判定**: PASS

### Testing Requirements
- **再評価**:
  - quickstart.mdにテスト方法を記載
  - Phase 2（/speckit.tasks）でテスト実装を計画
  - カバレッジ目標: 新規/変更コードの90%以上
- **判定**: PASS (Phase 2で実装予定)

**Phase 1後の総合判定**: ✅ **PASS** - すべての原則に準拠。実装フェーズ（/speckit.tasks）へ進行可能。

## Project Structure

### Documentation (this feature)

```
specs/003-reset-ui-react/
├── spec.md              # 機能仕様書 (完成)
├── plan.md              # このファイル (作成中)
├── research.md          # Phase 0 output (次のステップ)
├── data-model.md        # N/A (データモデル変更なし)
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A (API変更なし)
├── checklists/
│   └── requirements.md  # 仕様品質チェックリスト (完成)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```
frontend/
├── src/
│   ├── components/
│   │   ├── WorkoutForm/
│   │   │   ├── index.jsx          # 主要修正対象 - フォーム管理
│   │   │   ├── ExerciseCard.jsx   # 影響なし（入力コンポーネント）
│   │   │   ├── WorkoutHeader.jsx  # 影響なし
│   │   │   └── constants.js       # 影響なし
│   │   └── FormConfigDrawer.jsx   # 設定変更時のコールバック検証
│   ├── hooks/
│   │   ├── useWorkoutSubmit.js    # reset()呼び出しロジック検証
│   │   ├── useFormConfig.js       # workoutConfig管理
│   │   ├── useFormValidation.js   # バリデーションスキーマ
│   │   └── useFeedback.js         # 影響なし
│   └── utils/
│       └── formDefaults.js        # generateDefaultValues検証
└── tests/
    └── components/
        └── WorkoutForm/
            ├── WorkoutForm.test.jsx        # 新規作成
            ├── reset-scenarios.test.jsx    # 新規作成（リセット特化）
            └── config-change.test.jsx      # 新規作成（設定変更）
```

**Structure Decision**: Web application (Option 2) - frontend/のみ変更。backendは影響なし。

## Complexity Tracking

*この機能はConstitution違反がないため、このセクションは空です。*

## Phase 0: Research Outline

### 調査タスク

1. **React Hook Form reset() ベストプラクティス**
   - バージョン7.54.2のreset()の正しい使い方
   - useFormのmode設定がresetに与える影響
   - resetOptionsの適切な設定（keepErrors, keepDirty, keepIsSubmitted等）

2. **フォーム状態とUI同期の問題パターン**
   - React Hook FormでUIが更新されない既知の問題
   - Controlled vs Uncontrolled componentの影響
   - Material-UI TextFieldとreact-hook-form統合の注意点

3. **設定変更時のリセット競合状態**
   - useEffectのdependency arrayとreset()のタイミング
   - workoutConfig変更時の適切な同期戦略
   - shouldResetFormフラグパターンの改善方法

4. **パフォーマンス最適化**
   - reset()後の不要な再レンダリング防止
   - useMemo/useCallbackの適切な配置
   - フォームキー戦略（key propによる強制再マウント）の是非

### 想定される決定事項

- **決定1**: reset()のタイミング（同期 vs 非同期）
- **決定2**: フォーム再マウント戦略の採用可否
- **決定3**: useFormのmode設定（onChange/onBlur/onSubmit/all）
- **決定4**: 設定変更時の状態管理パターン

### 成果物

`research.md` - 各調査タスクの結果、決定事項、根拠、却下された代替案を記載

---

**次のステップ**: Phase 0の調査を実行し、research.mdを生成
