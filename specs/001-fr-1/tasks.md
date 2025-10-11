# Task Breakdown: FR-1 ワークヒストリー統合

**Feature**: FR-1 ワークヒストリー統合
**Branch**: `001-fr-1`
**Plan**: [plan.md](./plan.md)
**Spec**: [spec.md](./spec.md)
**Created**: 2025-10-10

---

## Summary

ダッシュボードに「直近のログを見る」Accordion を追加し、旧 WorkoutHistory ページ（約800行）を削除する。ユーザーストーリーに基づき、独立してテスト可能な単位でタスクを分割。

**Total Tasks**: 18
**Estimated Time**: 週6.5時間 × 4週間 = 26時間

---

## Task Organization

タスクは以下の構成で組織化されています:

1. **Phase 1: Setup** (0タスク) - 既存プロジェクト、追加セットアップ不要
2. **Phase 2: Foundational** (2タスク) - バックエンドAPI拡張（全User Storyの前提）
3. **Phase 3: User Story 1** (6タスク) - 過去のワークアウトをダッシュボードで確認
4. **Phase 4: User Story 2** (6タスク) - 旧機能削除とシンプルなダッシュボード
5. **Phase 5: Polish** (4タスク) - 統合テスト・パフォーマンス確認

---

## Phase 1: Setup (既存プロジェクト)

*このフェーズはスキップ: 既存のプロジェクト構造を使用*

---

## Phase 2: Foundational Tasks (必須の前提条件)

これらのタスクは全てのUser Storyの前提となる。完了後、User Story 1と2を並行して実装可能。

### T001: [Foundation] バックエンドAPI に createdAt フィールド追加

**Priority**: P0 (BLOCKING)
**File**: `backend/routes/workouts.js`
**Estimated Time**: 1時間

**Description**:
`GET /workouts` APIのレスポンスに `createdAt` フィールド (ISO 8601形式) を追加。Sequelizeの `created_at` カラムを利用し、データベーススキーマ変更は不要。

**Implementation**:
```javascript
// backend/routes/workouts.js: formatWorkoutData 関数 (行245-269付近)
const formatWorkoutData = (workout) => {
  return {
    id: workout.id,
    date: workout.date,
    createdAt: workout.createdAt,  // 追加: Sequelize の created_at を ISO 8601 で返す
    exercise: workout.exercise,
    exerciseType: workout.exerciseType,
    intensity: workout.intensity,
    duration: workout.duration,
    distance: workout.distance,
    reps: workout.reps,
    sets: workout.sets,
    repsDetail: workout.repsDetail,
  };
};
```

**Acceptance Criteria**:
- [ ] `GET /workouts` のレスポンスに `createdAt` フィールドが含まれる
- [ ] `createdAt` はISO 8601形式 (例: "2025-01-30T07:30:00.000Z")
- [ ] 既存のフィールドはすべて保持（後方互換性）
- [ ] 既存のテストが全て通過

**Dependencies**: なし

---

### T002: [Foundation] バックエンドテスト: createdAt フィールド検証

**Priority**: P0
**File**: `backend/tests/routes/workouts.test.js`
**Estimated Time**: 30分

**Description**:
`GET /workouts` APIが `createdAt` フィールドを返すことを検証するテストを追加。

**Implementation**:
```javascript
// backend/tests/routes/workouts.test.js
describe('GET /workouts', () => {
  it('should return workouts with createdAt field', async () => {
    const res = await request(app)
      .get('/workouts')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.workouts).toHaveLength(greaterThan(0));
    expect(res.body.workouts[0]).toHaveProperty('createdAt');
    expect(res.body.workouts[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
```

**Acceptance Criteria**:
- [ ] テストが追加され、実行される
- [ ] テストが成功する（createdAt フィールドが存在し、ISO 8601形式）

**Dependencies**: T001

---

## Phase 3: User Story 1 - 過去のワークアウトをダッシュボードで確認 (P0)

**Story Goal**: ユーザーはダッシュボードでAccordionを展開し、直近10件のワークアウトを日付グループ化して閲覧できる。

**Independent Test**: ダッシュボードにアクセス → Accordion展開 → 直近10件が日付グループ化されて表示

---

### T003: [US1] 日付グループ化ロジックの実装

**Priority**: P0
**File**: `frontend/src/services/workoutGrouping.js` (新規作成)
**Estimated Time**: 1.5時間

**Description**:
ワークアウトデータを日付ごとにグループ化するロジックを実装。効率的なアルゴリズム (O(n)) で、直近10件のみを処理。

**Implementation**:
```javascript
// frontend/src/services/workoutGrouping.js
import dayjs from 'dayjs';

/**
 * ワークアウトを日付ごとにグループ化
 * @param {Array} workouts - ワークアウトの配列
 * @returns {Object} - { 'YYYY-MM-DD': [workout1, workout2, ...] }
 */
export const groupByDate = (workouts) => {
  const grouped = {};

  // 直近10件のみ処理
  workouts.slice(0, 10).forEach(workout => {
    const dateKey = dayjs(workout.date).format('YYYY-MM-DD');
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(workout);
  });

  return grouped;
};

/**
 * 同日に複数回トレーニングしたか判定
 * @param {Array} dateWorkouts - 同じ日のワークアウト配列
 * @returns {boolean}
 */
export const hasMultipleWorkoutsOnSameDay = (dateWorkouts) => {
  return dateWorkouts.length > 1;
};

/**
 * ワークアウトの詳細を文字列化（表示用）
 * @param {Object} workout - ワークアウトオブジェクト
 * @returns {string} - 例: "5km 30分" or "20×3セット"
 */
export const formatWorkoutDetails = (workout) => {
  if (workout.exerciseType === 'cardio') {
    const parts = [];
    if (workout.distance) parts.push(`${workout.distance}km`);
    if (workout.duration) parts.push(`${workout.duration}分`);
    return parts.join(' ');
  } else if (workout.exerciseType === 'strength') {
    if (workout.repsDetail && workout.repsDetail.length > 0) {
      // バラバラのセット (例: 30,27,35)
      const reps = workout.repsDetail.map(d => d.reps).join(',');
      return `${reps} (${workout.sets}セット)`;
    } else if (workout.reps && workout.sets) {
      // 均等なセット (例: 20×3)
      return `${workout.reps / workout.sets}×${workout.sets}`;
    }
  }
  return '';
};
```

**Acceptance Criteria**:
- [ ] `groupByDate` 関数が正しく日付グループ化を行う
- [ ] 直近10件のみを処理する
- [ ] `hasMultipleWorkoutsOnSameDay` が正しく判定する
- [ ] `formatWorkoutDetails` がcardioとstrengthの両方を適切にフォーマット

**Dependencies**: T002 (バックエンドAPI完成後)

---

### T004: [US1] [P] RecentWorkoutsAccordion コンポーネント作成

**Priority**: P0
**File**: `frontend/src/components/RecentWorkoutsAccordion.jsx` (新規作成)
**Estimated Time**: 2時間

**Description**:
Material-UI Accordion を使用し、直近10件のワークアウトを表示するコンポーネントを作成。useMemo でパフォーマンス最適化。

**Implementation**:
```jsx
// frontend/src/components/RecentWorkoutsAccordion.jsx
import React, { useMemo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import {
  groupByDate,
  hasMultipleWorkoutsOnSameDay,
  formatWorkoutDetails,
} from '../services/workoutGrouping';

const RecentWorkoutsAccordion = ({ workouts }) => {
  // useMemo でパフォーマンス最適化
  const groupedWorkouts = useMemo(() => {
    return groupByDate(workouts);
  }, [workouts]);

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>直近のログを見る（10件）</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {Object.keys(groupedWorkouts).length === 0 ? (
          <Typography color="textSecondary">
            まだワークアウト記録がありません
          </Typography>
        ) : (
          Object.entries(groupedWorkouts).map(([date, dateWorkouts]) => (
            <Box key={date} mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                {date}
              </Typography>
              <List>
                {dateWorkouts.map(workout => (
                  <ListItem key={workout.id} disableGutters>
                    {/* 同日複数回の場合、時刻表示 */}
                    {hasMultipleWorkoutsOnSameDay(dateWorkouts) && (
                      <Typography variant="body2" color="textSecondary" mr={1}>
                        [{dayjs(workout.createdAt).format('HH:mm')}]
                      </Typography>
                    )}
                    <Typography>
                      {workout.exerciseType === 'cardio' ? '🏃' : '💪'}{' '}
                      {workout.exercise} {formatWorkoutDetails(workout)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default RecentWorkoutsAccordion;
```

**Acceptance Criteria**:
- [ ] Accordion がデフォルトで閉じている
- [ ] クリックで展開・折りたたみが切り替わる
- [ ] 直近10件のワークアウトが表示される
- [ ] 日付ごとにグループ化されている
- [ ] 同日複数回トレーニング時に時刻 (HH:mm) が表示される
- [ ] 0件の場合、「まだワークアウト記録がありません」と表示される

**Dependencies**: T003

**Parallel**: T003と並行可能（別ファイル）

---

### T005: [US1] Dashboard.jsx に RecentWorkoutsAccordion 統合

**Priority**: P0
**File**: `frontend/src/pages/Dashboard.jsx`
**Estimated Time**: 30分

**Description**:
Dashboard コンポーネントに `RecentWorkoutsAccordion` を追加。「今週のアクティビティ」カードの下に配置。

**Implementation**:
```jsx
// frontend/src/pages/Dashboard.jsx
import RecentWorkoutsAccordion from '../components/RecentWorkoutsAccordion';

// Dashboard 内の return 文
<Grid container spacing={3}>
  {/* 今週のアクティビティ */}
  <Grid item xs={12}>
    <Card>
      <CardContent>
        {/* ... 既存のコード ... */}
      </CardContent>
    </Card>
  </Grid>

  {/* 新規追加: 直近のログ */}
  <Grid item xs={12}>
    <RecentWorkoutsAccordion workouts={workouts} />
  </Grid>

  {/* ... 既存の他のカード ... */}
</Grid>
```

**Acceptance Criteria**:
- [ ] Dashboard に Accordion が表示される
- [ ] Accordion は「今週のアクティビティ」の下に配置される
- [ ] workouts データが正しく渡される
- [ ] ビルドエラーなし

**Dependencies**: T004

---

### T006: [US1] フロントエンドテスト: workoutGrouping.js

**Priority**: P0
**File**: `frontend/tests/services/workoutGrouping.test.js` (新規作成)
**Estimated Time**: 1時間

**Description**:
日付グループ化ロジックの単体テスト。

**Implementation**:
```javascript
// frontend/tests/services/workoutGrouping.test.js
import { describe, it, expect } from 'vitest';
import {
  groupByDate,
  hasMultipleWorkoutsOnSameDay,
  formatWorkoutDetails,
} from '../../src/services/workoutGrouping';

describe('groupByDate', () => {
  it('should group workouts by date', () => {
    const workouts = [
      { id: 1, date: '2025-01-30', exercise: 'Running' },
      { id: 2, date: '2025-01-30', exercise: 'Squat' },
      { id: 3, date: '2025-01-29', exercise: 'Cycling' },
    ];
    const grouped = groupByDate(workouts);

    expect(grouped['2025-01-30']).toHaveLength(2);
    expect(grouped['2025-01-29']).toHaveLength(1);
  });

  it('should limit to 10 workouts', () => {
    const workouts = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      date: `2025-01-${30 - i}`,
      exercise: 'Test',
    }));
    const grouped = groupByDate(workouts);

    const totalCount = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
    expect(totalCount).toBe(10);
  });
});

describe('hasMultipleWorkoutsOnSameDay', () => {
  it('should return true for multiple workouts', () => {
    const workouts = [{ id: 1 }, { id: 2 }];
    expect(hasMultipleWorkoutsOnSameDay(workouts)).toBe(true);
  });

  it('should return false for single workout', () => {
    const workouts = [{ id: 1 }];
    expect(hasMultipleWorkoutsOnSameDay(workouts)).toBe(false);
  });
});

describe('formatWorkoutDetails', () => {
  it('should format cardio workout', () => {
    const workout = {
      exerciseType: 'cardio',
      distance: 5,
      duration: 30,
    };
    expect(formatWorkoutDetails(workout)).toBe('5km 30分');
  });

  it('should format strength workout with repsDetail', () => {
    const workout = {
      exerciseType: 'strength',
      reps: 92,
      sets: 3,
      repsDetail: [
        { setNumber: 1, reps: 30 },
        { setNumber: 2, reps: 27 },
        { setNumber: 3, reps: 35 },
      ],
    };
    expect(formatWorkoutDetails(workout)).toBe('30,27,35 (3セット)');
  });
});
```

**Acceptance Criteria**:
- [ ] すべてのテストが通過する
- [ ] エッジケース（0件、10件超、同日複数回）をカバー

**Dependencies**: T003

**Parallel**: T004と並行可能（別ファイル）

---

### T007: [US1] フロントエンドテスト: RecentWorkoutsAccordion.jsx

**Priority**: P0
**File**: `frontend/tests/components/RecentWorkoutsAccordion.test.jsx` (新規作成)
**Estimated Time**: 1.5時間

**Description**:
`RecentWorkoutsAccordion` コンポーネントの統合テスト。

**Implementation**:
```javascript
// frontend/tests/components/RecentWorkoutsAccordion.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecentWorkoutsAccordion from '../../src/components/RecentWorkoutsAccordion';

describe('RecentWorkoutsAccordion', () => {
  it('should be closed by default', () => {
    render(<RecentWorkoutsAccordion workouts={[]} />);
    const emptyMessage = screen.queryByText('まだワークアウト記録がありません');
    expect(emptyMessage).not.toBeVisible();
  });

  it('should expand on click', () => {
    const workouts = [
      { id: 1, date: '2025-01-30', exercise: 'Running', exerciseType: 'cardio' },
    ];
    render(<RecentWorkoutsAccordion workouts={workouts} />);

    fireEvent.click(screen.getByText('直近のログを見る（10件）'));
    expect(screen.getByText('2025-01-30')).toBeVisible();
  });

  it('should group workouts by date', () => {
    const workouts = [
      { id: 1, date: '2025-01-30', exercise: 'Running', exerciseType: 'cardio' },
      { id: 2, date: '2025-01-30', exercise: 'Squat', exerciseType: 'strength' },
      { id: 3, date: '2025-01-29', exercise: 'Cycling', exerciseType: 'cardio' },
    ];
    render(<RecentWorkoutsAccordion workouts={workouts} />);
    fireEvent.click(screen.getByText('直近のログを見る（10件）'));

    expect(screen.getByText('2025-01-30')).toBeInTheDocument();
    expect(screen.getByText('2025-01-29')).toBeInTheDocument();
  });

  it('should display time for multiple workouts on same day', () => {
    const workouts = [
      {
        id: 1,
        date: '2025-01-30',
        createdAt: '2025-01-30T07:30:00Z',
        exercise: 'Running',
        exerciseType: 'cardio',
      },
      {
        id: 2,
        date: '2025-01-30',
        createdAt: '2025-01-30T08:00:00Z',
        exercise: 'Squat',
        exerciseType: 'strength',
      },
    ];
    render(<RecentWorkoutsAccordion workouts={workouts} />);
    fireEvent.click(screen.getByText('直近のログを見る（10件）'));

    expect(screen.getByText(/07:30/)).toBeInTheDocument();
    expect(screen.getByText(/08:00/)).toBeInTheDocument();
  });

  it('should show empty message when no workouts', () => {
    render(<RecentWorkoutsAccordion workouts={[]} />);
    fireEvent.click(screen.getByText('直近のログを見る（10件）'));

    expect(screen.getByText('まだワークアウト記録がありません')).toBeVisible();
  });
});
```

**Acceptance Criteria**:
- [ ] すべてのテストが通過する
- [ ] Accordion の展開・折りたたみをテスト
- [ ] 日付グループ化をテスト
- [ ] 同日複数回トレーニング時の時刻表示をテスト
- [ ] 0件の場合のメッセージ表示をテスト

**Dependencies**: T004

---

### T008: [US1] 統合テスト: Dashboard表示確認

**Priority**: P0
**Estimated Time**: 30分

**Description**:
ダッシュボードに Accordion が正しく表示され、動作することを手動で確認。

**Test Steps**:
1. `npm run dev` (frontend) と `npm run dev` (backend) を起動
2. ブラウザで `http://localhost:5173` にアクセス
3. ログイン後、ダッシュボードを表示
4. 「直近のログを見る（10件）」Accordion が表示されることを確認
5. Accordion をクリックして展開
6. 直近10件のワークアウトが日付グループ化されて表示されることを確認
7. 同日に複数回トレーニングした記録がある場合、時刻が表示されることを確認

**Acceptance Criteria**:
- [ ] Accordion がデフォルトで閉じている
- [ ] クリックで展開・折りたたみできる
- [ ] 直近10件が表示される
- [ ] 日付グループ化が正しい
- [ ] 同日複数回トレーニング時に時刻表示

**Dependencies**: T005

---

**Checkpoint US1**: User Story 1 完了。ダッシュボードでAccordion経由で過去ログを確認できる。

---

## Phase 4: User Story 2 - 旧機能削除とシンプルなダッシュボード (P0)

**Story Goal**: 旧WorkoutHistoryページ（約800行）を削除し、ナビゲーションメニューから「履歴」リンクを削除する。

**Independent Test**: `/workout-history` へアクセス → 404エラー表示、ナビゲーションメニューに「履歴」リンクなし

---

### T009: [US2] WorkoutHistory.jsx 削除

**Priority**: P0
**File**: `frontend/src/pages/WorkoutHistory.jsx` (削除)
**Estimated Time**: 5分

**Description**:
WorkoutHistory ページを削除。

**Command**:
```bash
rm frontend/src/pages/WorkoutHistory.jsx
```

**Acceptance Criteria**:
- [ ] `frontend/src/pages/WorkoutHistory.jsx` が存在しない

**Dependencies**: T008 (User Story 1 完了後)

---

### T010: [US2] [P] WorkoutHistoryTable.jsx 削除

**Priority**: P0
**File**: `frontend/src/components/WorkoutHistoryTable.jsx` (削除)
**Estimated Time**: 5分

**Description**:
WorkoutHistoryTable コンポーネントを削除。

**Command**:
```bash
rm frontend/src/components/WorkoutHistoryTable.jsx
```

**Acceptance Criteria**:
- [ ] `frontend/src/components/WorkoutHistoryTable.jsx` が存在しない

**Dependencies**: T008

**Parallel**: T009と並行可能（別ファイル）

---

### T011: [US2] [P] WorkoutCustomizationDrawer.jsx 削除

**Priority**: P0
**File**: `frontend/src/components/WorkoutCustomizationDrawer.jsx` (削除)
**Estimated Time**: 5分

**Description**:
WorkoutCustomizationDrawer コンポーネントを削除。

**Command**:
```bash
rm frontend/src/components/WorkoutCustomizationDrawer.jsx
```

**Acceptance Criteria**:
- [ ] `frontend/src/components/WorkoutCustomizationDrawer.jsx` が存在しない

**Dependencies**: T008

**Parallel**: T009, T010と並行可能（別ファイル）

---

### T012: [US2] [P] useWorkoutConfig.js 削除

**Priority**: P0
**File**: `frontend/src/hooks/useWorkoutConfig.js` (削除)
**Estimated Time**: 5分

**Description**:
useWorkoutConfig カスタムフックを削除。

**Command**:
```bash
rm frontend/src/hooks/useWorkoutConfig.js
```

**Acceptance Criteria**:
- [ ] `frontend/src/hooks/useWorkoutConfig.js` が存在しない

**Dependencies**: T008

**Parallel**: T009, T010, T011と並行可能（別ファイル）

---

### T013: [US2] App.jsx: /workout-history ルート削除

**Priority**: P0
**File**: `frontend/src/App.jsx`
**Estimated Time**: 10分

**Description**:
`/workout-history` ルートを削除。WorkoutHistory のインポートも削除。

**Implementation**:
```jsx
// frontend/src/App.jsx
// 削除: import WorkoutHistory from './pages/WorkoutHistory';

// <Routes> 内から以下を削除:
// <Route path="/workout-history" element={<WorkoutHistory />} />
```

**Acceptance Criteria**:
- [ ] `/workout-history` ルートが存在しない
- [ ] WorkoutHistory のインポート文が削除されている
- [ ] ビルドエラーなし

**Dependencies**: T009, T010, T011, T012 (全ファイル削除後)

---

### T014: [US2] ナビゲーションメニュー: 「履歴」リンク削除

**Priority**: P0
**File**: `frontend/src/components/Navigation.jsx` (または該当ファイル)
**Estimated Time**: 10分

**Description**:
ナビゲーションメニューから「履歴」リンクを削除。

**Implementation**:
ナビゲーションメニューのコンポーネントから `/workout-history` へのリンクを削除。

**Acceptance Criteria**:
- [ ] ナビゲーションメニューに「履歴」リンクが存在しない
- [ ] ビルドエラーなし

**Dependencies**: T013

---

**Checkpoint US2**: User Story 2 完了。旧WorkoutHistory機能が削除され、ナビゲーションがシンプル化。

---

## Phase 5: Polish & Integration

### T015: コード削減確認

**Priority**: P0
**Estimated Time**: 15分

**Description**:
Git diff で約800行のコード削減を確認。

**Command**:
```bash
git diff --stat feature/phase1-core-improvements..001-fr-1
```

**Acceptance Criteria**:
- [ ] 約800行のコードが削減されている
- [ ] 削除されたファイル: WorkoutHistory.jsx, WorkoutHistoryTable.jsx, WorkoutCustomizationDrawer.jsx, useWorkoutConfig.js

**Dependencies**: T014

---

### T016: 統合テスト: /workout-history で404確認

**Priority**: P0
**Estimated Time**: 10分

**Description**:
`/workout-history` へアクセスし、404エラーが表示されることを確認。

**Test Steps**:
1. ブラウザで `http://localhost:5173/workout-history` にアクセス
2. 404エラーページが表示されることを確認

**Acceptance Criteria**:
- [ ] `/workout-history` で404エラーが表示される

**Dependencies**: T013

---

### T017: ビルド確認

**Priority**: P0
**Estimated Time**: 15分

**Description**:
フロントエンドのビルドが成功することを確認。

**Command**:
```bash
cd frontend
npm run build
```

**Acceptance Criteria**:
- [ ] ビルドが成功する
- [ ] エラーメッセージなし

**Dependencies**: T014

---

### T018: パフォーマンス確認

**Priority**: P1
**Estimated Time**: 30分

**Description**:
ダッシュボードのロード時間とAccordion展開のレスポンスを確認。

**Test Steps**:
1. Chrome DevTools の Performance タブを開く
2. ダッシュボードをリロード
3. ロード時間を測定（目標: 2秒以内）
4. Accordion を展開し、レスポンスを測定（目標: 即座、遅延なし）

**Acceptance Criteria**:
- [ ] ダッシュボードロード時間 < 2秒
- [ ] Accordion展開レスポンス: 即座（遅延なし）
- [ ] 直近10件表示: 1秒以内

**Dependencies**: T015

---

## Dependencies & Execution Order

### Dependency Graph

```
Phase 2: Foundation
  T001 (API拡張)
    └─> T002 (APIテスト)

Phase 3: User Story 1
  T002 (APIテスト)
    ├─> T003 (日付グループ化ロジック)
    │     ├─> T004 (Accordion コンポーネント) [P]
    │     └─> T006 (ロジックテスト) [P]
    └─> T004 (Accordion コンポーネント)
          └─> T005 (Dashboard統合)
                ├─> T007 (Accordionテスト)
                └─> T008 (統合テスト)

Phase 4: User Story 2 (T008完了後)
  T008 (US1完了)
    ├─> T009 (WorkoutHistory削除) [P]
    ├─> T010 (WorkoutHistoryTable削除) [P]
    ├─> T011 (WorkoutCustomizationDrawer削除) [P]
    └─> T012 (useWorkoutConfig削除) [P]
          └─> T013 (ルート削除)
                └─> T014 (ナビゲーション修正)

Phase 5: Polish
  T014 (US2完了)
    ├─> T015 (コード削減確認)
    ├─> T016 (404確認) [P]
    └─> T017 (ビルド確認) [P]
          └─> T018 (パフォーマンス確認)
```

---

## Parallel Execution Opportunities

### Phase 2
- **Sequential**: T001 → T002 (同じ機能)

### Phase 3 (User Story 1)
- **Parallel Set 1**: T003完了後、T004 (Accordion) と T006 (ロジックテスト) を並行実行
- **Parallel Set 2**: T005完了後、T007 (Accordionテスト) と T008 (統合テスト) は順次実行

### Phase 4 (User Story 2)
- **Parallel Set 3**: T009, T010, T011, T012 (4ファイル削除) を並行実行
- **Sequential**: T013, T014 (ルート削除とナビゲーション修正)

### Phase 5 (Polish)
- **Parallel Set 4**: T016 (404確認) と T017 (ビルド確認) を並行実行

**Total Parallel Opportunities**: 7タスクを並行実行可能

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**User Story 1のみ**: ダッシュボードでAccordion経由で過去ログを確認できる機能。

**MVP Tasks**: T001 ~ T008 (8タスク)
**Estimated Time**: 約8時間
**Deliverable**: ダッシュボードに Accordion が追加され、直近10件のワークアウトが日付グループ化されて表示される。

### Full Feature Scope
**User Story 1 + 2**: 過去ログ表示 + 旧機能削除

**Full Tasks**: T001 ~ T018 (18タスク)
**Estimated Time**: 約11時間（並行実行で短縮可能）

---

## Task Summary

| Phase | Tasks | Estimated Time | Parallel Opportunities |
|---|---|---|---|
| Phase 1: Setup | 0 | 0時間 | - |
| Phase 2: Foundation | T001-T002 | 1.5時間 | 0 |
| Phase 3: User Story 1 | T003-T008 | 7.5時間 | 2タスク |
| Phase 4: User Story 2 | T009-T014 | 0.5時間 | 4タスク |
| Phase 5: Polish | T015-T018 | 1.5時間 | 2タスク |
| **Total** | **18タスク** | **11時間** | **8タスク並行可能** |

---

## Next Steps

1. **Week 1**: Phase 2 (Foundation) 完了 - T001, T002
2. **Week 2**: Phase 3 (User Story 1) 完了 - T003 ~ T008
3. **Week 3**: Phase 4 (User Story 2) 完了 - T009 ~ T014
4. **Week 4**: Phase 5 (Polish) 完了 - T015 ~ T018

---

**Tasks Status**: ✅ Ready for Implementation
**Total Tasks**: 18
**Estimated Time**: 11時間（並行実行で短縮可能）
**Next**: 実装開始
