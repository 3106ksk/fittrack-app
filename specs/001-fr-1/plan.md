# Implementation Plan: FR-1 ワークヒストリー統合

**Branch**: `001-fr-1` | **Date**: 2025-10-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fr-1/spec.md`

## Summary

ダッシュボードに「直近のログを見る」Accordion を追加し、旧 WorkoutHistory ページ（約800行）を削除する。これにより、コア価値（運動→健康効果の可視化）に集中したシンプルな UI を実現する。

**技術アプローチ**:
- **フロントエンド**: Material-UI Accordion を Dashboard.jsx に統合、直近10件のワークアウトを日付グループ化して表示
- **バックエンド**: `GET /workouts` API に `createdAt` フィールド (ISO 8601) を追加（後方互換性維持）
- **削除**: WorkoutHistory 関連の4ファイルとルート設定を削除（約800行削減）

---

## Technical Context

**Language/Version**: JavaScript (React 18.2.0, Node.js 20.x)
**Primary Dependencies**:
- Frontend: React 18, Material-UI 5.x, Vite 4.x, dayjs 1.11.x
- Backend: Express 4.x, Sequelize 6.x, express-validator 7.x

**Storage**: PostgreSQL 17 + Sequelize ORM
**Testing**: Jest 30.x (backend), Vitest (frontend)
**Target Platform**: Web application (Chrome, Firefox, Safari最新2バージョン)
**Project Type**: Web (フロントエンド + バックエンド分離)
**Performance Goals**:
- ダッシュボードロード時間: 2秒以内
- Accordion展開レスポンス: 即座（遅延なし）
- 直近10件表示: 1秒以内

**Constraints**:
- コード削減: 約800行（Git diffで確認）
- 後方互換性: 既存の `GET /workouts` API を利用するクライアントに影響を与えない
- データベーススキーマ変更なし: 既存の `created_at` カラムを使用

**Scale/Scope**:
- ユーザー数: MVP段階（数十〜数百ユーザー想定）
- ワークアウト表示件数: 直近10件のみ
- ページ削除: 1ページ（WorkoutHistory）+ 関連コンポーネント3個 + カスタムフック1個

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Evidence-Based Health Metrics ✅
- **Status**: PASS
- **Reason**: この機能は健康スコア算出には影響しない。過去ログの表示機能のみ。

### II. Security-First Architecture ✅
- **Status**: PASS
- **Reason**:
  - JWT認証: 既存の `/workouts` API は JWT 認証済み（変更なし）
  - 入力検証: 新規ユーザー入力なし（表示のみ）
  - CORS設定: 既存設定を維持

### III. Rapid Development & Portfolio Delivery ✅
- **Status**: PASS
- **Reason**:
  - JavaScript実装: React 18 + Node.js/Express（Constitution準拠）
  - Material-UI使用: 既存の依存関係、追加インストール不要
  - 就活用ポートフォリオ: 800行削減の戦略的判断を証明

### IV. Mobile-First Responsive Design ✅
- **Status**: PASS
- **Reason**:
  - Material-UI Accordion: レスポンシブ対応済み
  - iPhone 14 Pro (390x844) で動作確認予定
  - タッチ操作: Accordionのタップで展開・折りたたみ

### V. Performance Optimization & Scalability ✅
- **Status**: PASS
- **Reason**:
  - useMemo使用: 直近10件のワークアウトデータをメモ化
  - 日付グループ化ロジック: 効率的なアルゴリズム（O(n)）
  - コード削減: 800行削減により全体のビルド時間短縮

### Testing Requirements ⚠️
- **Status**: REQUIRES ATTENTION
- **Action**: WorkoutHistory関連のテストを削除し、新しいAccordionコンポーネントのテストを追加
- **Coverage**: critical pathをカバー（Accordion展開・日付グループ化・時刻表示）

### Code Review Standards ✅
- **Status**: PASS
- **Reason**: PR作成時に Constitution遵守を確認（特に III. Rapid Development）

---

## Project Structure

### Documentation (this feature)

```
specs/001-fr-1/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technical research)
├── data-model.md        # Phase 1 output (data model)
├── quickstart.md        # Phase 1 output (developer guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── workouts-api.yaml
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/
├── routes/
│   └── workouts.js              # 修正: formatWorkoutData に createdAt 追加
├── middleware/
│   └── checkJWT.js              # 変更なし（既存の JWT 認証）
└── tests/
    └── routes/
        └── workouts.test.js     # 修正: createdAt フィールドのテスト追加

frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx                          # 修正: Accordion 追加
│   │   └── WorkoutHistory.jsx                     # 削除
│   ├── components/
│   │   ├── WorkoutHistoryTable.jsx                # 削除
│   │   ├── WorkoutCustomizationDrawer.jsx         # 削除
│   │   └── RecentWorkoutsAccordion.jsx            # 新規作成
│   ├── hooks/
│   │   └── useWorkoutConfig.js                    # 削除
│   ├── services/
│   │   └── workoutGrouping.js                     # 新規作成: 日付グループ化ロジック
│   └── App.jsx                                     # 修正: /workout-history ルート削除
└── tests/
    └── components/
        └── RecentWorkoutsAccordion.test.jsx       # 新規作成
```

**Structure Decision**: Web application structure (Option 2) を使用。フロントエンドとバックエンドが分離されており、それぞれ独立してデプロイ可能。

---

## Complexity Tracking

*この機能には Constitution Check の違反がないため、このセクションは空欄*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |

---

## Phase 0: Research & Decision Log

### Research Task 1: Material-UI Accordion Best Practices

**Decision**: Material-UI の `Accordion` コンポーネントを使用

**Rationale**:
- 既存の依存関係（Material-UI 5.x）で利用可能
- レスポンシブ対応済み
- アクセシビリティ対応（ARIA属性自動設定）
- デフォルトで閉じた状態の実装が簡単（`defaultExpanded={false}`）

**Alternatives Considered**:
- **独自実装**: 実装コストが高く、アクセシビリティ対応が不十分
- **react-collapsible**: 追加の依存関係が必要

**Example Code**:
```jsx
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

<Accordion defaultExpanded={false}>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    直近のログを見る（10件）
  </AccordionSummary>
  <AccordionDetails>
    {/* ワークアウトリスト */}
  </AccordionDetails>
</Accordion>
```

---

### Research Task 2: 日付グループ化のアルゴリズム

**Decision**: `dayjs` を使用した日付グループ化

**Rationale**:
- 既存の依存関係（`dayjs 1.11.x`）で利用可能
- ISO 8601形式の日付処理が簡単
- 軽量（moment.jsの代替）

**Algorithm**:
```javascript
// 日付グループ化ロジック (O(n))
const groupByDate = (workouts) => {
  const grouped = {};

  workouts.slice(0, 10).forEach(workout => {
    const dateKey = dayjs(workout.date).format('YYYY-MM-DD');
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(workout);
  });

  return grouped;
};
```

**Alternatives Considered**:
- **Lodash groupBy**: 追加の依存関係が必要
- **手動実装**: dayjsの方が日付処理が安全

---

### Research Task 3: createdAt フィールドの追加方法

**Decision**: Sequelize の `created_at` カラムを `createdAt` として返す

**Rationale**:
- データベーススキーマ変更不要
- Sequelize は自動的に `created_at` カラムを作成している
- 後方互換性を維持（既存のクライアントは `createdAt` を無視）

**Implementation**:
```javascript
// backend/routes/workouts.js: formatWorkoutData 関数
const formatWorkoutData = (workout) => {
  return {
    id: workout.id,
    date: workout.date,
    createdAt: workout.createdAt,  // 追加: Sequelize の created_at
    exercise: workout.exercise,
    exerciseType: workout.exerciseType,
    // ... 他のフィールド
  };
};
```

**Alternatives Considered**:
- **新規カラム追加**: データベースマイグレーションが必要、過剰
- **日付から推測**: 不正確（同日に複数回トレーニングした場合に区別できない）

---

### Research Task 4: ファイル削除の影響範囲

**Decision**: 削除対象ファイルは他のコンポーネントから依存されていないことを確認

**Analysis**:
```bash
# 依存関係チェック
grep -r "WorkoutHistory" frontend/src/
grep -r "WorkoutHistoryTable" frontend/src/
grep -r "WorkoutCustomizationDrawer" frontend/src/
grep -r "useWorkoutConfig" frontend/src/
```

**Result**: `/workout-history` ルート以外からの参照なし

**Files to Delete**:
- `frontend/src/pages/WorkoutHistory.jsx` (約250行)
- `frontend/src/components/WorkoutHistoryTable.jsx` (約300行)
- `frontend/src/components/WorkoutCustomizationDrawer.jsx` (約200行)
- `frontend/src/hooks/useWorkoutConfig.js` (約50行)

**Total**: 約800行

---

## Phase 1: Design & Contracts

### Data Model

**Entity**: Workout（変更なし、`createdAt` フィールド追加のみ）

```
Workout {
  id: integer (primary key)
  user_id: integer (foreign key → Users)
  date: string (YYYY-MM-DD)
  createdAt: string (ISO 8601 timestamp) ← 追加
  exercise: string
  exerciseType: enum('cardio', 'strength')

  // cardio
  distance: float (nullable)
  duration: integer (nullable)

  // strength
  reps: integer (nullable)
  sets: integer (nullable)
  repsDetail: JSON (nullable, array of {setNumber, reps})
}
```

**Validation Rules** (変更なし):
- `date` は必須
- `exerciseType` は 'cardio' または 'strength'
- cardio の場合、`distance` または `duration` が必須
- strength の場合、`reps` または `repsDetail` が必須

---

### API Contracts

**Endpoint**: `GET /workouts`

**Request**:
```
GET /workouts
Headers:
  Authorization: Bearer <JWT_TOKEN>
```

**Response** (変更: `createdAt` 追加):
```json
{
  "workouts": [
    {
      "id": 123,
      "date": "2025-01-30",
      "createdAt": "2025-01-30T07:30:00.000Z",  // 追加
      "exercise": "Running",
      "exerciseType": "cardio",
      "distance": 5.0,
      "duration": 30
    },
    {
      "id": 124,
      "date": "2025-01-30",
      "createdAt": "2025-01-30T08:00:00.000Z",  // 追加
      "exercise": "Squat",
      "exerciseType": "strength",
      "reps": 60,
      "sets": 3,
      "repsDetail": [
        {"setNumber": 1, "reps": 20},
        {"setNumber": 2, "reps": 20},
        {"setNumber": 3, "reps": 20}
      ]
    }
  ]
}
```

**Backward Compatibility**: ✅
- 既存のクライアントは `createdAt` フィールドを無視できる
- 既存のフィールド（`id`, `date`, `exercise` など）は変更なし

---

### Frontend Component Design

**New Component**: `RecentWorkoutsAccordion.jsx`

```jsx
import React, { useMemo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';

const RecentWorkoutsAccordion = ({ workouts }) => {
  // useMemo でパフォーマンス最適化
  const groupedWorkouts = useMemo(() => {
    return groupByDate(workouts.slice(0, 10));
  }, [workouts]);

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>直近のログを見る（10件）</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {Object.keys(groupedWorkouts).length === 0 ? (
          <Typography>まだワークアウト記録がありません</Typography>
        ) : (
          Object.entries(groupedWorkouts).map(([date, dateWorkouts]) => (
            <div key={date}>
              <Typography variant="subtitle1">{date}</Typography>
              <List>
                {dateWorkouts.map(workout => (
                  <ListItem key={workout.id}>
                    {/* 同日複数回の場合、時刻表示 */}
                    {dateWorkouts.length > 1 && (
                      <span>[{dayjs(workout.createdAt).format('HH:mm')}]</span>
                    )}
                    <span>{workout.exercise} {formatWorkoutDetails(workout)}</span>
                  </ListItem>
                ))}
              </List>
            </div>
          ))
        )}
      </AccordionDetails>
    </Accordion>
  );
};
```

---

### Modified Component: `Dashboard.jsx`

**Changes**:
1. `RecentWorkoutsAccordion` コンポーネントをインポート
2. 「今週のアクティビティ」カードの下に Accordion を追加

```jsx
import RecentWorkoutsAccordion from '../components/RecentWorkoutsAccordion';

// Dashboard 内
<Grid container spacing={3}>
  {/* 今週のアクティビティ */}
  <Grid item xs={12}>
    <Card>
      <CardContent>
        {/* ... */}
      </CardContent>
    </Card>
  </Grid>

  {/* 新規追加: 直近のログ */}
  <Grid item xs={12}>
    <RecentWorkoutsAccordion workouts={workouts} />
  </Grid>
</Grid>
```

---

### Deleted Files

- `frontend/src/pages/WorkoutHistory.jsx`
- `frontend/src/components/WorkoutHistoryTable.jsx`
- `frontend/src/components/WorkoutCustomizationDrawer.jsx`
- `frontend/src/hooks/useWorkoutConfig.js`

### Modified Routing: `App.jsx`

**Before**:
```jsx
<Route path="/workout-history" element={<WorkoutHistory />} />
```

**After**:
```jsx
// /workout-history ルートを削除（404エラー）
```

---

## Testing Strategy

### Backend Tests

**File**: `backend/tests/routes/workouts.test.js`

**New Test**:
```javascript
describe('GET /workouts', () => {
  it('should return workouts with createdAt field', async () => {
    const res = await request(app)
      .get('/workouts')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.workouts).toHaveLength(2);
    expect(res.body.workouts[0]).toHaveProperty('createdAt');
    expect(res.body.workouts[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
```

---

### Frontend Tests

**File**: `frontend/tests/components/RecentWorkoutsAccordion.test.jsx`

**Test Cases**:
1. Accordion がデフォルトで閉じている
2. クリックで展開・折りたたみ
3. 日付グループ化が正しく動作
4. 同日複数回トレーニング時に時刻表示
5. 0件の場合、適切なメッセージ表示

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import RecentWorkoutsAccordion from '../../src/components/RecentWorkoutsAccordion';

describe('RecentWorkoutsAccordion', () => {
  it('should be closed by default', () => {
    render(<RecentWorkoutsAccordion workouts={[]} />);
    expect(screen.queryByText('まだワークアウト記録がありません')).not.toBeVisible();
  });

  it('should expand on click', () => {
    render(<RecentWorkoutsAccordion workouts={mockWorkouts} />);
    fireEvent.click(screen.getByText('直近のログを見る（10件）'));
    expect(screen.getByText('2025-01-30')).toBeVisible();
  });

  it('should group workouts by date', () => {
    const workouts = [
      { id: 1, date: '2025-01-30', exercise: 'Running' },
      { id: 2, date: '2025-01-30', exercise: 'Squat' },
      { id: 3, date: '2025-01-29', exercise: 'Cycling' },
    ];
    render(<RecentWorkoutsAccordion workouts={workouts} />);
    fireEvent.click(screen.getByText('直近のログを見る（10件）'));

    const date1Items = screen.getAllByText(/2025-01-30/);
    expect(date1Items).toHaveLength(1); // 日付ヘッダー1つ
  });

  it('should display time for multiple workouts on same day', () => {
    const workouts = [
      { id: 1, date: '2025-01-30', createdAt: '2025-01-30T07:30:00Z', exercise: 'Running' },
      { id: 2, date: '2025-01-30', createdAt: '2025-01-30T08:00:00Z', exercise: 'Squat' },
    ];
    render(<RecentWorkoutsAccordion workouts={workouts} />);
    fireEvent.click(screen.getByText('直近のログを見る（10件）'));

    expect(screen.getByText(/07:30/)).toBeInTheDocument();
    expect(screen.getByText(/08:00/)).toBeInTheDocument();
  });
});
```

---

## Success Metrics

- **SC-001**: ダッシュボード表示時間 < 1秒（10件表示）
  - **測定**: Chrome DevTools Performance タブ
- **SC-002**: コード削減 -800行
  - **測定**: `git diff --stat feature/phase1-core-improvements..001-fr-1`
- **SC-003**: 既存テスト全て通過
  - **測定**: `npm test` (backend), `npm run test` (frontend)
- **SC-004**: `/workout-history` で404エラー
  - **測定**: 手動テスト、404ページの表示確認
- **SC-005**: ビルドエラーなし
  - **測定**: `npm run build` (frontend)

---

## Implementation Notes

### Week-by-Week Plan (Phase 1)

**Week 1: バックエンドAPI拡張**
- [ ] `formatWorkoutData` 関数に `createdAt` 追加
- [ ] バックエンドテスト追加・実行

**Week 2: フロントエンドAccordion実装**
- [ ] `RecentWorkoutsAccordion.jsx` 作成
- [ ] `workoutGrouping.js` ロジック実装
- [ ] `Dashboard.jsx` に統合

**Week 3: 旧機能削除**
- [ ] WorkoutHistory 関連ファイル削除（4ファイル）
- [ ] `/workout-history` ルート削除
- [ ] ナビゲーションメニュー修正

**Week 4: テスト & デバッグ**
- [ ] フロントエンドテスト作成・実行
- [ ] 統合テスト（ダッシュボード表示確認）
- [ ] コード削減確認（Git diff）

---

## Agent Context Update

*Will be executed by `.specify/scripts/bash/update-agent-context.sh claude` after this plan*

**New Technologies**:
- Material-UI Accordion コンポーネント
- dayjs 日付処理ライブラリ（既存）

**Key Files**:
- `frontend/src/components/RecentWorkoutsAccordion.jsx` (新規)
- `frontend/src/services/workoutGrouping.js` (新規)
- `frontend/src/pages/Dashboard.jsx` (修正)
- `backend/routes/workouts.js` (修正: formatWorkoutData)

---

## References

- **Feature Specification**: [spec.md](./spec.md)
- **Constitution**: `.specify/memory/constitution.md` (v1.1.0)
- **Requirements**: `/Users/310tea/Documents/fittrack-app/project-management/features/phase1-core-improvements/requirements.md`
- **Material-UI Accordion Docs**: https://mui.com/material-ui/react-accordion/
- **dayjs Docs**: https://day.js.org/

---

**Plan Status**: ✅ Complete
**Next Command**: `/speckit.tasks` (to generate task breakdown)
