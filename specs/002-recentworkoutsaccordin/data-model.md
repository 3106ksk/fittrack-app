# Data Model: Recent Workouts Display Order Bug Fix

**Feature**: 002-recentworkoutsaccordin
**Date**: 2025-10-12

## Overview

This bug fix does not introduce new data models or modify existing database schemas. It only changes how existing workout data is sorted and displayed in the frontend. This document describes the data structures involved in the display logic.

## Entities

### Workout (Existing)

**Description**: Represents a single workout session recorded by the user. This entity already exists in the system and is not modified by this bug fix.

**Source**: Backend API (`/api/workouts`), stored in PostgreSQL via Sequelize ORM

**Attributes**:

| Field | Type | Description | Used For |
|-------|------|-------------|----------|
| `id` | Integer | Primary key | Unique identification, React key prop |
| `date` | String (ISO date) | Date workout was performed (YYYY-MM-DD) | Grouping workouts by date |
| `createdAt` | String (ISO timestamp) | When workout was logged in system | **Sorting (most recent first)** |
| `exerciseType` | String | Type of exercise: 'cardio' or 'strength' | Display logic (emoji selection) |
| `exercise` | String | Name of exercise (e.g., "Running", "Bench Press") | Display text |
| `distance` | Number (optional) | Distance in km (cardio only) | Formatting workout details |
| `duration` | Number (optional) | Duration in minutes (cardio only) | Formatting workout details |
| `sets` | Number (optional) | Number of sets (strength only) | Formatting workout details |
| `repsDetail` | Array (optional) | Array of `{reps: Number}` objects (strength only) | Formatting workout details |

**Example**:
```javascript
{
  id: 42,
  date: '2025-10-11',
  createdAt: '2025-10-11T18:30:45.123Z',
  exerciseType: 'cardio',
  exercise: 'Running',
  distance: 5.2,
  duration: 28
}
```

**Validation Rules** (from spec FR-002, FR-006):
- `createdAt` must be a valid ISO 8601 timestamp for sorting
- `date` must be a valid ISO date string (YYYY-MM-DD) for grouping
- Both fields are required (enforced by existing backend validation)

### Grouped Workouts (Derived Structure)

**Description**: Intermediate data structure created by the `groupByDate` function. Maps date strings to arrays of workout objects that occurred on that date.

**Source**: Computed in frontend (`workoutGrouping.js`)

**Structure**:
```javascript
{
  'YYYY-MM-DD': [Workout, Workout, ...],
  'YYYY-MM-DD': [Workout, ...],
  // ...
}
```

**Example**:
```javascript
{
  '2025-10-11': [
    { id: 5, createdAt: '2025-10-11T18:00:00Z', ... },
    { id: 4, createdAt: '2025-10-11T14:30:00Z', ... },
    { id: 3, createdAt: '2025-10-11T09:00:00Z', ... }
  ],
  '2025-10-08': [
    { id: 2, createdAt: '2025-10-08T12:00:00Z', ... }
  ],
  '2025-10-05': [
    { id: 1, createdAt: '2025-10-05T16:00:00Z', ... }
  ]
}
```

**Constraints** (from spec FR-003):
- Total number of workouts across all date groups: max 10
- Each date group array: 1-10 workouts (in practice, usually 1-3)

**Ordering Rules** (from spec FR-001, FR-004):
- Date keys: Must be iterated in descending order (2025-10-11 before 2025-10-08)
- Workout arrays: Must be sorted in descending `createdAt` order within each group

## Data Flow

### Input (Component Props)

```javascript
<RecentWorkoutsAccordion workouts={workouts} />
```

**`workouts` prop**:
- Type: `Array<Workout>`
- Source: Parent component (Dashboard) fetches from API
- Order: No guaranteed order from parent (bug fix handles sorting internally)
- Size: Typically 10-100 workouts (recent history from API)

### Transformation Pipeline

1. **Component receives `workouts` array** (unsorted, may contain 10-100 items)
2. **`useMemo` calls `groupByDate(workouts)`**:
   - Sort by `createdAt` descending
   - Take first 10 workouts (most recent)
   - Group by `date` field into object
   - Return `{ 'YYYY-MM-DD': [Workout, ...] }`
3. **Component renders**:
   - Convert object to entries: `Object.entries(groupedWorkouts)`
   - Sort entries by date key descending
   - Map to Material-UI components (Box, Typography, List)

### Output (DOM)

```
Accordion: "直近のログを見る（10件）"
  └─ AccordionDetails
      ├─ Box (date: 2025-10-11)  ← NEWEST DATE FIRST
      │   ├─ Typography: "2025-10-11"
      │   └─ List
      │       ├─ [18:00] 🏃 Running 5km 30分  ← NEWEST TIME FIRST
      │       ├─ [14:30] 💪 Bench Press 10,10,8 (3セット)
      │       └─ [09:00] 🏃 Running 3km 20分
      ├─ Box (date: 2025-10-08)
      │   └─ ...
      └─ Box (date: 2025-10-05)  ← OLDEST DATE LAST
          └─ ...
```

## State Transitions

N/A - This is a display-only bug fix with no state mutations. The component is read-only.

## Relationships

**Parent-Child**:
- Dashboard (parent) → RecentWorkoutsAccordion (child)
- Relationship: Data flow via props (one-way data binding)

**Data Dependencies**:
- `workoutGrouping.js` service functions → Used by RecentWorkoutsAccordion component
- `dayjs` library → Used for date formatting (already in use, no changes)

**No Changes To**:
- Backend API contracts (no new endpoints or parameters)
- Database schema (no migrations)
- State management (no Redux/Context changes)

## Testing Data Structure

### Mock Data for Unit Tests

```javascript
const mockWorkouts = [
  // Oct 11 - 3 workouts (different times)
  { id: 5, date: '2025-10-11', createdAt: '2025-10-11T18:00:00Z', exerciseType: 'cardio', exercise: 'Running', distance: 5, duration: 30 },
  { id: 4, date: '2025-10-11', createdAt: '2025-10-11T14:30:00Z', exerciseType: 'strength', exercise: 'Bench Press', sets: 3, repsDetail: [{reps: 10}, {reps: 10}, {reps: 8}] },
  { id: 3, date: '2025-10-11', createdAt: '2025-10-11T09:00:00Z', exerciseType: 'cardio', exercise: 'Running', distance: 3, duration: 20 },

  // Oct 8 - 1 workout
  { id: 2, date: '2025-10-08', createdAt: '2025-10-08T12:00:00Z', exerciseType: 'cardio', exercise: 'Cycling', distance: 10, duration: 45 },

  // Oct 5 - 1 workout
  { id: 1, date: '2025-10-05', createdAt: '2025-10-05T16:00:00Z', exerciseType: 'strength', exercise: 'Squat', sets: 4, repsDetail: [{reps: 12}, {reps: 10}, {reps: 10}, {reps: 8}] },
];
```

### Edge Case Data

**Empty Array**:
```javascript
const emptyWorkouts = [];
// Expected: {} (empty grouped object)
```

**Single Workout**:
```javascript
const singleWorkout = [
  { id: 1, date: '2025-10-11', createdAt: '2025-10-11T10:00:00Z', exerciseType: 'cardio', exercise: 'Running', distance: 5, duration: 30 }
];
// Expected: { '2025-10-11': [singleWorkout[0]] }
```

**11+ Workouts** (testing 10-item limit):
```javascript
const manyWorkouts = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  date: `2025-10-${String(15 - i).padStart(2, '0')}`,
  createdAt: `2025-10-${String(15 - i).padStart(2, '0')}T12:00:00Z`,
  exerciseType: 'cardio',
  exercise: 'Running',
  distance: 5,
  duration: 30
}));
// Expected: Only most recent 10 workouts (Oct 15 → Oct 6), excluding Oct 5-1
```

## Data Validation

**No New Validation Required** - This bug fix relies on existing backend validation:
- `createdAt` and `date` fields are already required and validated by backend
- Frontend assumes well-formed ISO timestamps (existing behavior)
- If malformed data exists, current `new Date()` parsing will handle gracefully (Invalid Date sorts to end)

**Type Safety Note** (from Constitution III):
- Project uses JavaScript, not TypeScript
- Runtime validation via existing `express-validator` on backend
- Frontend assumes data contract is honored (pragmatic approach per Constitution)
