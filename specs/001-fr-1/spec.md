# Feature Specification: FR-1 ワークヒストリー統合

**Feature Branch**: `001-fr-1`
**Created**: 2025-10-10
**Status**: Draft
**Input**: User description: "ダッシュボードに「直近のログを見る」Accordion を追加し、旧 WorkoutHistory ページ(約800行)を削除してコア価値に集中する"

## Overview

### Background
現在のFitStartは詳細なワークヒストリーページを持っているが、以下の課題を抱えている:
- ワークヒストリー機能が詳細すぎて、コア価値（運動→健康効果の可視化）と乖離
- 約800行のコードが保守コストを増大させている
- ユーザーは過去のワークアウトを確認したいが、別ページへ遷移する必要がある

### Feature Goal
ダッシュボード内に軽量な過去ログ表示機能を統合し、専用のワークヒストリーページを削除することで、以下を実現する:
- **ユーザー価値**: シンプルで使いやすいダッシュボード、過去ログへの即座のアクセス
- **開発者価値**: コード削減（約800行）による保守性向上、コア機能への集中
- **ビジネス価値**: 就活用ポートフォリオとして「戦略的判断力」を証明する材料

---

## User Scenarios & Testing

### User Story 1 - 過去のワークアウトをダッシュボードで確認する (Priority: P0)

ユーザーはダッシュボードを表示している際に、過去のワークアウト記録を簡単に確認したい。別ページへ遷移することなく、直近10件のワークアウトを日付ごとにグループ化して閲覧できる。

**Why this priority**: アプリのコア価値（運動→健康効果）を損なわずに過去ログを確認できる機能は、ユーザー体験の向上に直結する。

**Independent Test**: ダッシュボードにアクセスし、Accordionを展開することで直近10件のワークアウトが日付グループ化されて表示されることを確認できる。

**Acceptance Scenarios**:

1. **Given** ユーザーがダッシュボードを表示している, **When** 「直近のログを見る」Accordionをクリックする, **Then** Accordionが展開され、直近10件のワークアウトが表示される
2. **Given** ユーザーがAccordionを展開している, **When** ワークアウトリストを確認する, **Then** 日付ごとにグループ化されている
3. **Given** 同じ日に複数回トレーニングした記録がある, **When** そ の日のワークアウトを表示する, **Then** 各ワークアウトに時刻(HH:MM)が表示される
4. **Given** セット回数がバラバラ(30,27,35など)のワークアウトがある, **When** そのワークアウトを表示する, **Then** 各セットのレップ数が正しく表示される

---

### User Story 2 - シンプルなダッシュボードで運動と健康効果に集中する (Priority: P0)

ユーザーはアプリを開いたときに、運動記録と健康効果の可視化というコア価値に集中したシンプルなダッシュボードを体験したい。詳細すぎるワークヒストリーページは不要。

**Why this priority**: FitStartのコア価値である「運動→健康効果の可視化」に集中することで、ユーザーは本質的な価値を即座に理解できる。

**Independent Test**: 旧ワークヒストリーページ(`/workout-history`)にアクセスすると404エラーが表示され、ナビゲーションメニューから「履歴」リンクが削除されていることを確認できる。

**Acceptance Scenarios**:

1. **Given** ユーザーが `/workout-history` へアクセスする, **When** ページが読み込まれる, **Then** 404エラーページが表示される
2. **Given** ユーザーがナビゲーションメニューを確認する, **When** メニュー項目を見る, **Then** 「履歴」リンクが存在しない
3. **Given** 開発者がコードベースを確認する, **When** 削除対象ファイルをチェックする, **Then** WorkoutHistory.jsx, WorkoutHistoryTable.jsx, WorkoutCustomizationDrawer.jsx, useWorkoutConfig.js が削除されている

---

### Edge Cases

- **Accordionがデフォルトで開いている場合**: Accordionはデフォルトで閉じていること。ユーザーが明示的にクリックした場合のみ展開される。
- **10件未満のワークアウトしかない場合**: 実際の件数分だけ表示される（例: 3件のワークアウトがあれば3件表示）。
- **ワークアウトが0件の場合**: Accordion自体は表示されるが、内部に「まだワークアウト記録がありません」などのメッセージを表示する。
- **同日に10回以上トレーニングした場合**: 直近10件の制限があるため、古いワークアウトは表示されない。
- **createdAtフィールドがnullの場合**: 既存データで createdAt がない場合、date フィールドをフォールバックとして使用する。

---

## Requirements

### Functional Requirements

- **FR-001**: システムはダッシュボードに「直近のログを見る」Accordionを表示しなければならない
- **FR-002**: Accordionはデフォルトで閉じた状態で表示されなければならない
- **FR-003**: ユーザーがAccordionをクリックすると、展開・折りたたみが切り替わらなければならない
- **FR-004**: システムは直近10件のワークアウトを表示しなければならない
- **FR-005**: ワークアウトは日付ごとにグループ化されて表示されなければならない
- **FR-006**: 同じ日に複数回トレーニングした場合、各ワークアウトに時刻(HH:MM形式)を表示しなければならない
- **FR-007**: 筋トレワークアウトでセット回数がバラバラ(例: 30,27,35)の場合、各セットのレップ数を正確に表示しなければならない
- **FR-008**: システムは以下のファイルを削除しなければならない:
  - `frontend/src/pages/WorkoutHistory.jsx`
  - `frontend/src/components/WorkoutHistoryTable.jsx`
  - `frontend/src/components/WorkoutCustomizationDrawer.jsx`
  - `frontend/src/hooks/useWorkoutConfig.js`
- **FR-009**: システムは `/workout-history` ルートを削除しなければならない
- **FR-010**: ナビゲーションメニューから「履歴」リンクを削除しなければならない
- **FR-011**: バックエンドの `GET /workouts` APIは、各ワークアウトに `createdAt` フィールド(ISO 8601形式)を含めて返さなければならない
- **FR-012**: `GET /workouts` APIの変更は後方互換性を維持しなければならない（既存のクライアントが影響を受けない）
- **FR-013**: システムはワークアウトが0件の場合、適切なメッセージ（例: 「まだワークアウト記録がありません」）を表示しなければならない

### Key Entities

- **Workout**: ユーザーが記録したトレーニング活動
  - 主要属性: id, date, createdAt, exercise, exerciseType (cardio/strength), distance, duration, reps, sets, repsDetail
  - 関係: ユーザーに紐づく

- **WorkoutDisplay**: Accordion内で表示されるワークアウトのデータ形式
  - 主要属性: 日付グループ、時刻、運動種目、運動タイプ、距離/時間（有酸素）、レップ数/セット数（筋トレ）
  - 関係: Workoutエンティティから派生

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: ユーザーはダッシュボード上で直近のワークアウトを1秒以内に確認できる（10件表示時）
- **SC-002**: コードベースから約800行のコードが削減される（Git diffで確認）
- **SC-003**: 既存のテストケースがすべて通過する（WorkoutHistory関連テストを除く）
- **SC-004**: `/workout-history` へのアクセス時に404エラーが返される
- **SC-005**: ビルドプロセスがエラーなく完了する
- **SC-006**: 面接で「戦略的判断力」（800行削減の意思決定）を5分以内に説明できる
- **SC-007**: Accordionの展開・折りたたみがユーザー操作に対して即座に反応する（遅延なし）
- **SC-008**: 日付グループ化が正しく動作し、ユーザーが過去の記録を日付単位で理解できる

---

## Assumptions

- ユーザーは直近10件のワークアウトを確認できれば十分である（それ以上の履歴は不要）
- Accordionコンポーネントとして Material-UI の Accordion を使用する
- 既存の `GET /workouts` API は現在 `createdAt` フィールドを返していない
- バックエンドの `formatWorkoutData` 関数を修正することで `createdAt` を追加できる
- 既存のフロントエンドコードは `createdAt` フィールドがあっても問題なく動作する（後方互換性）
- 削除対象のファイル（WorkoutHistory関連）は他のコンポーネントから依存されていない
- ワークアウトデータは常に `date` フィールドを持っている（必須フィールド）

---

## Dependencies

### External Dependencies
- Material-UI Accordion コンポーネント（既存の依存関係）
- 既存の `GET /workouts` API エンドポイント

### Internal Dependencies
- ダッシュボードコンポーネント（`frontend/src/pages/Dashboard.jsx`）
- ワークアウトデータ取得ロジック（既存のAPIクライアント）
- バックエンドの `formatWorkoutData` 関数（`backend/routes/workouts.js:245-269`）

---

## Constraints

### Technical Constraints
- React 18 + JavaScript を使用（TypeScript 移行は将来の拡張として位置づけ）
- Material-UI Accordion コンポーネントを使用
- 既存の `GET /workouts` API に `createdAt` フィールドを追加（後方互換性を維持）
- データベーススキーマの変更は行わない（`createdAt` は既存の `created_at` カラムから取得）

### Time Constraints
- Phase 1（2025年10月）の一部として実装
- 週6.5時間以内で完了する必要がある

### Resource Constraints
- 開発者: 1名
- 環境: ローカル開発環境のみ（本番デプロイは Phase 4 後）

---

## Out of Scope

以下はこの機能の範囲外:
- ワークアウトの詳細編集機能（削除されるWorkoutHistory ページに存在した機能）
- ワークアウトのフィルタリング機能（日付範囲、運動タイプ等）
- ワークアウトのソート機能（デフォルトで日付降順のみ）
- ページネーション（直近10件のみ表示）
- ワークアウトの削除機能（別途実装が必要な場合）
- カスタマイズ可能なワークアウト設定（削除される useWorkoutConfig.js の機能）

---

## References

- **Requirements Document**: `/Users/310tea/Documents/fittrack-app/project-management/features/phase1-core-improvements/requirements.md`
- **Constitution**: `.specify/memory/constitution.md` (特に III. Rapid Development & Portfolio Delivery)
- **Backend API**: `backend/routes/workouts.js:245-269` (formatWorkoutData 関数)
- **Frontend Dashboard**: `frontend/src/pages/Dashboard.jsx`

---

## Notes

- この機能は Phase 1 の FR-1.1, FR-1.2, FR-1.3 をカバーする
- 約800行のコード削減は、就活用ポートフォリオで「戦略的判断力」を証明する重要な材料
- ユーザーは「運動→健康効果の可視化」というコア価値に集中できるようになる
- 将来的に詳細な履歴機能が必要になった場合、このAccordionを拡張するか、別の軽量な実装を検討する
