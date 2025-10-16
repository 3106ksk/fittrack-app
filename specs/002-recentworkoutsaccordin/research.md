# Research: Recent Workouts Display Order Bug Fix

**Feature**: 002-recentworkoutsaccordin
**Date**: 2025-10-12
**Status**: Complete

## Overview

This document consolidates research findings for implementing the display order bug fix in the RecentWorkoutsAccordion component. The bug involves two-level sorting: (1) date groups must appear in descending order, and (2) workouts within each date group must be sorted by creation time.

## Root Cause Analysis

### Current Implementation Issues

**Issue 1: No Pre-Sorting Before Grouping**
```javascript
// workoutGrouping.js:12 (CURRENT - BUGGY)
workouts.slice(0, 10).forEach(workout => {
  const dateKey = dayjs(workout.date).format('YYYY-MM-DD');
  // ...
});
```

**Problem**: Takes the first 10 workouts from the array *as-is* without sorting by `createdAt`. If the parent component doesn't sort the data, or if workouts are ordered by `date` instead of `createdAt`, the wrong 10 items may be selected.

**Issue 2: No Date Group Sorting in Component**
```javascript
// RecentWorkoutsAccordion.jsx:46 (CURRENT - BUGGY)
Object.entries(groupedWorkouts).map(([date, dateWorkouts]) => (
  // ...
))
```

**Problem**: JavaScript's `Object.entries()` does not guarantee any particular order for object keys. While modern engines often preserve insertion order, this is not reliable for date sorting. Date groups may appear in arbitrary order.

**Issue 3: No Within-Group Sorting**
The bug report document indicates that when multiple workouts exist on the same day, they should display in reverse chronological order (newest first) but there's no sorting logic for `dateWorkouts` array within each group.

## Sorting Strategy Research

### Decision: Two-Level Sorting Approach

**Level 1: Sort by createdAt Before Grouping**
```javascript
const sortedWorkouts = [...workouts]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 10);
```

**Rationale**:
- Ensures we select the 10 most recently *created* workouts, not just the first 10 in the array
- Uses `createdAt` timestamp for accurate recency determination
- Descending order (b - a) puts newest first

**Alternatives Considered**:
- ❌ Sort by `date` field: Would select workouts by when they were performed, not when they were logged. User Story 1 requires showing "most recent workout entries" (creation-based).
- ❌ Rely on parent component sorting: Fragile, creates implicit dependency

**Level 2: Sort Date Groups in Component**
```javascript
Object.entries(groupedWorkouts)
  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
  .map(([date, dateWorkouts]) => (
    // ...
  ))
```

**Rationale**:
- Explicit sorting of date keys in descending order
- Simple, performant (max 10 date groups to sort)
- Makes ordering behavior explicit and testable

**Alternatives Considered**:
- ❌ Return array from `groupByDate`: Would require changing function signature and break existing useMemo optimization
- ❌ Use Map instead of Object: Over-engineering for small dataset

### Date Parsing and Comparison

**Decision**: Use `new Date()` for sorting, dayjs for formatting

**Rationale**:
- `new Date()` is native, fast, and sufficient for simple comparisons
- `dayjs` already used for formatting (YYYY-MM-DD), no need to duplicate for sorting
- Date subtraction (`b - a`) is idiomatic JavaScript for sorting

**Best Practice**: Always use descending sort (b - a) for "most recent first" semantics

## Testing Strategy

### Unit Tests for `groupByDate` Function

**Test File**: `frontend/tests/unit/workoutGrouping.test.js`

**Test Cases**:
1. **Sorting Before Grouping**: Given 15 unsorted workouts, verify only the 10 most recent (by `createdAt`) are included
2. **Date Group Keys**: Verify grouped object has correct date keys in YYYY-MM-DD format
3. **Within-Group Order**: Given 3 workouts on same date at different times, verify they appear in descending `createdAt` order
4. **Empty Input**: Given empty array, return empty object
5. **Single Workout**: Given 1 workout, return single-date group with 1 item
6. **10-Item Limit**: Given 20 workouts, verify exactly 10 are returned

**Testing Framework**: Vitest (already configured in project)

### Component Tests for `RecentWorkoutsAccordion`

**Test File**: `frontend/src/test/components/Dashboard/RecentWorkoutsAccordion.test.jsx`

**Test Cases**:
1. **Visual Date Order**: Given workouts on Oct 5, Oct 8, Oct 11, verify DOM elements appear in descending order (Oct 11 → Oct 8 → Oct 5)
2. **Empty State**: Given no workouts, verify "まだワークアウト記録がありません" message appears
3. **Time Stamp Display**: Given multiple workouts on same date, verify [HH:mm] timestamps appear and are in descending order
4. **useMemo Optimization**: Verify `groupByDate` is not called on re-render when workouts prop doesn't change

**Testing Framework**: Vitest + React Testing Library

**Mocking Strategy**:
```javascript
const mockWorkouts = [
  { id: 1, date: '2025-10-11', createdAt: '2025-10-11T18:00:00Z', ... },
  { id: 2, date: '2025-10-08', createdAt: '2025-10-08T14:30:00Z', ... },
  { id: 3, date: '2025-10-05', createdAt: '2025-10-05T09:00:00Z', ... },
];
```

## Performance Considerations

### Computational Complexity

**Current Performance**: O(n) - single pass forEach loop
**New Performance**: O(n log n) - sorting before grouping

**Analysis**:
- Dataset size: max 10-20 workouts (after initial filtering from parent)
- Sorting 10-20 items: negligible performance impact (<1ms on modern devices)
- `useMemo` ensures sorting only happens when `workouts` prop changes
- No additional network requests or state management overhead

**Conclusion**: Performance impact is acceptable and maintains Constitution Principle V (Performance Optimization).

### Memory Considerations

**Spread Operator**: `[...workouts]` creates shallow copy to avoid mutating original array
- Cost: O(n) memory for up to ~20 workout objects
- Benefit: Pure function, no side effects, testable

## Implementation Checklist

- [x] Research root cause (2-level sorting problem identified)
- [x] Choose sorting strategy (sort by createdAt, then by date keys)
- [x] Define test cases (unit + component tests specified)
- [x] Performance analysis (O(n log n) acceptable for small dataset)
- [ ] Implement `groupByDate` sorting (Phase 1)
- [ ] Implement component date sorting (Phase 1)
- [ ] Write unit tests (Phase 1)
- [ ] Write component tests (Phase 1)
- [ ] Manual testing with real data (Phase 1)

## References

- JavaScript Array.prototype.sort(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
- Date comparison in JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
- React useMemo optimization: https://react.dev/reference/react/useMemo
- Constitution Principle V (Performance): `.specify/memory/constitution.md`

## Open Questions

None - all technical decisions resolved during research phase.
