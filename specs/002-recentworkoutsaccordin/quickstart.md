# Quickstart Guide: Recent Workouts Display Order Bug Fix

**Feature**: 002-recentworkoutsaccordin
**Developer**: Quick implementation and testing guide
**Date**: 2025-10-12

## Prerequisites

- Node.js 16+ and npm installed
- Git branch `002-recentworkoutsaccordin` checked out
- Frontend dependencies installed (`cd frontend && npm install`)

## Quick Summary

**What**: Fix display order bug where recent workouts don't appear in descending chronological order
**Where**: 2 files - `workoutGrouping.js` (service) and `RecentWorkoutsAccordion.jsx` (component)
**Estimated Time**: 30-45 minutes (implementation + tests)

## Implementation Steps

### Step 1: Fix `groupByDate` Function (5 minutes)

**File**: `frontend/src/services/workoutGrouping.js`

**Change**: Add sorting before grouping

```javascript
export const groupByDate = (workouts) => {
  const grouped = {};

  // ✅ NEW: Sort by createdAt descending, then take 10 most recent
  const sortedWorkouts = [...workouts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  sortedWorkouts.forEach(workout => {  // ✅ CHANGED: Use sortedWorkouts instead of workouts.slice(0, 10)
    const dateKey = dayjs(workout.date).format('YYYY-MM-DD');

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(workout);
  });

  return grouped;
};
```

**What Changed**:
1. Create shallow copy of workouts array: `[...workouts]`
2. Sort by `createdAt` descending: `(b, a) => new Date(b.createdAt) - new Date(a.createdAt)`
3. Take first 10 items: `.slice(0, 10)`
4. Use `sortedWorkouts` in forEach loop

### Step 2: Fix Component Rendering (5 minutes)

**File**: `frontend/src/components/Dashboard/RecentWorkoutsAccordion.jsx`

**Change**: Add date sorting to Object.entries()

**Find this code** (around line 46):
```javascript
Object.entries(groupedWorkouts).map(([date, dateWorkouts]) => (
  <Box key={date} mb={2}>
```

**Replace with**:
```javascript
Object.entries(groupedWorkouts)
  .sort((a, b) => new Date(b[0]) - new Date(a[0]))  // ✅ NEW: Sort date keys descending
  .map(([date, dateWorkouts]) => (
    <Box key={date} mb={2}>
```

**What Changed**:
- Added `.sort((a, b) => new Date(b[0]) - new Date(a[0]))` before `.map()`
- `a[0]` and `b[0]` are the date keys (first element of entry tuple)
- Descending order (b - a) shows newest dates first

### Step 3: Write Unit Tests (15 minutes)

**File**: `frontend/tests/unit/workoutGrouping.test.js` (create new file)

```javascript
import { describe, it, expect } from 'vitest';
import { groupByDate } from '../../src/services/workoutGrouping';

describe('groupByDate', () => {
  it('should sort workouts by createdAt before grouping', () => {
    const workouts = [
      { id: 1, date: '2025-10-05', createdAt: '2025-10-05T16:00:00Z', exercise: 'Old' },
      { id: 3, date: '2025-10-11', createdAt: '2025-10-11T18:00:00Z', exercise: 'Newest' },
      { id: 2, date: '2025-10-08', createdAt: '2025-10-08T12:00:00Z', exercise: 'Middle' },
    ];

    const grouped = groupByDate(workouts);

    // Should include all 3 workouts
    const allWorkouts = Object.values(grouped).flat();
    expect(allWorkouts).toHaveLength(3);

    // Should have 3 date groups
    expect(Object.keys(grouped)).toHaveLength(3);
  });

  it('should limit to 10 most recent workouts', () => {
    const workouts = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      date: `2025-10-${String(15 - i).padStart(2, '0')}`,
      createdAt: `2025-10-${String(15 - i).padStart(2, '0')}T12:00:00Z`,
      exercise: `Workout ${i + 1}`,
    }));

    const grouped = groupByDate(workouts);

    const allWorkouts = Object.values(grouped).flat();
    expect(allWorkouts).toHaveLength(10);

    // Should have most recent 10 (Oct 15 → Oct 6)
    expect(allWorkouts[0].date).toBe('2025-10-15');
    expect(allWorkouts[9].date).toBe('2025-10-06');
  });

  it('should return empty object for empty input', () => {
    const grouped = groupByDate([]);
    expect(grouped).toEqual({});
  });

  it('should handle single workout', () => {
    const workouts = [
      { id: 1, date: '2025-10-11', createdAt: '2025-10-11T10:00:00Z', exercise: 'Running' }
    ];

    const grouped = groupByDate(workouts);

    expect(Object.keys(grouped)).toEqual(['2025-10-11']);
    expect(grouped['2025-10-11']).toHaveLength(1);
  });
});
```

**Run tests**:
```bash
cd frontend
npm run test workoutGrouping.test.js
```

### Step 4: Write Component Tests (15 minutes)

**File**: `frontend/src/test/components/Dashboard/RecentWorkoutsAccordion.test.jsx` (create new file)

**Create directory first**:
```bash
mkdir -p frontend/src/test/components/Dashboard
```

**Test file**:
```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecentWorkoutsAccordion from '../../../components/Dashboard/RecentWorkoutsAccordion';

describe('RecentWorkoutsAccordion', () => {
  it('should display dates in descending order', () => {
    const mockWorkouts = [
      { id: 1, date: '2025-10-05', createdAt: '2025-10-05T16:00:00Z', exerciseType: 'cardio', exercise: 'Running', distance: 5, duration: 30 },
      { id: 2, date: '2025-10-08', createdAt: '2025-10-08T12:00:00Z', exerciseType: 'cardio', exercise: 'Cycling', distance: 10, duration: 45 },
      { id: 3, date: '2025-10-11', createdAt: '2025-10-11T18:00:00Z', exerciseType: 'cardio', exercise: 'Running', distance: 3, duration: 20 },
    ];

    render(<RecentWorkoutsAccordion workouts={mockWorkouts} />);

    const dateElements = screen.getAllByText(/2025-10-\d{2}/);

    // Dates should appear in descending order
    expect(dateElements[0].textContent).toBe('2025-10-11');
    expect(dateElements[1].textContent).toBe('2025-10-08');
    expect(dateElements[2].textContent).toBe('2025-10-05');
  });

  it('should display empty state when no workouts', () => {
    render(<RecentWorkoutsAccordion workouts={[]} />);

    expect(screen.getByText('まだワークアウト記録がありません')).toBeInTheDocument();
  });

  it('should display time stamps for same-day workouts in descending order', () => {
    const mockWorkouts = [
      { id: 1, date: '2025-10-11', createdAt: '2025-10-11T09:00:00Z', exerciseType: 'cardio', exercise: 'Morning Run', distance: 5, duration: 30 },
      { id: 2, date: '2025-10-11', createdAt: '2025-10-11T18:00:00Z', exerciseType: 'cardio', exercise: 'Evening Run', distance: 3, duration: 20 },
      { id: 3, date: '2025-10-11', createdAt: '2025-10-11T14:30:00Z', exerciseType: 'cardio', exercise: 'Afternoon Run', distance: 4, duration: 25 },
    ];

    render(<RecentWorkoutsAccordion workouts={mockWorkouts} />);

    // Should show time stamps since multiple workouts on same day
    expect(screen.getByText('[18:00]')).toBeInTheDocument();
    expect(screen.getByText('[14:30]')).toBeInTheDocument();
    expect(screen.getByText('[09:00]')).toBeInTheDocument();

    // Should show corresponding exercises
    expect(screen.getByText(/Evening Run/)).toBeInTheDocument();
    expect(screen.getByText(/Afternoon Run/)).toBeInTheDocument();
    expect(screen.getByText(/Morning Run/)).toBeInTheDocument();
  });
});
```

**Run tests**:
```bash
npm run test RecentWorkoutsAccordion.test.jsx
```

## Manual Testing Checklist

### Test Case 1: Multiple Dates (P1)

1. **Setup**: Create 3+ workouts on different dates (e.g., Oct 5, 8, 11)
2. **Action**: Open dashboard, expand "直近のログを見る（10件）" accordion
3. **Expected**: Dates appear in order: Oct 11 → Oct 8 → Oct 5 (newest first)

### Test Case 2: Same-Day Multiple Workouts (P2)

1. **Setup**: Create 3 workouts on same date at different times (e.g., 09:00, 14:30, 18:00)
2. **Action**: Open accordion, find that date group
3. **Expected**:
   - Time stamps [18:00], [14:30], [09:00] appear in descending order
   - Corresponding exercises appear in correct order

### Test Case 3: Edge Cases

- **Empty state**: Delete all workouts → Should show "まだワークアウト記録がありません"
- **Single workout**: Have only 1 workout → Should display without errors
- **10+ workouts**: Create 15 workouts → Should show only 10 most recent

## Running the Application

### Development Server

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Access Application

- Frontend: http://localhost:5173
- Login with demo account (see `backend/seeders/` for credentials)
- Navigate to Dashboard

## Verification Script

```bash
# Run all tests
cd frontend
npm run test

# Run specific test suites
npm run test workoutGrouping
npm run test RecentWorkoutsAccordion

# Check test coverage
npm run test:coverage
```

**Expected Results**:
- All existing tests pass (no regressions)
- New tests pass (4 unit tests + 3 component tests)
- Coverage increases for `workoutGrouping.js` and `RecentWorkoutsAccordion.jsx`

## Troubleshooting

### Issue: "Cannot find module dayjs"

**Solution**: Ensure dayjs is installed:
```bash
cd frontend
npm install dayjs
```

### Issue: Tests fail with "ReferenceError: groupByDate is not defined"

**Solution**: Check import path in test file:
```javascript
import { groupByDate } from '../../src/services/workoutGrouping';
```

### Issue: Component tests fail to render

**Solution**: Install missing test dependencies:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Issue: Dates still not sorting correctly

**Solution**: Clear browser cache and refresh. Check that:
1. `groupByDate` returns sorted workouts (add console.log to verify)
2. Component uses `.sort()` on `Object.entries()`

## Performance Check

**Before Deployment**:

```bash
# Check bundle size
npm run build
ls -lh dist/assets/*.js

# Check rendering performance (React DevTools Profiler)
# Should be <150ms for dashboard render
```

**Expected Impact**: No performance degradation (sorting 10 items is <1ms)

## Next Steps

After implementation and testing:

1. Run `/speckit.tasks` to generate task breakdown
2. Create PR with branch `002-recentworkoutsaccordin`
3. Include test results and before/after screenshots in PR description
4. Request code review focusing on:
   - Sorting logic correctness
   - Test coverage (aim for 80%+)
   - No regressions in existing functionality

## Reference

- Spec: [spec.md](./spec.md)
- Research: [research.md](./research.md)
- Data Model: [data-model.md](./data-model.md)
- Plan: [plan.md](./plan.md)
