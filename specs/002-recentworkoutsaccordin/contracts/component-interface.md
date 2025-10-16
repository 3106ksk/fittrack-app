# Component Interface Contract: RecentWorkoutsAccordion

**Feature**: 002-recentworkoutsaccordin
**Type**: React Component Contract
**Date**: 2025-10-12

## Overview

This document defines the interface contract for the `RecentWorkoutsAccordion` component. Since this is a frontend-only bug fix with no API changes, this contract describes the component's props, behavior, and rendering guarantees.

## Component Signature

```javascript
const RecentWorkoutsAccordion = ({ workouts }) => { /* ... */ }
```

## Props Contract

### `workouts` (required)

**Type**: `Array<Workout>`

**Description**: Array of workout objects to be displayed in the accordion. The component will sort, filter (max 10), and group these workouts internally.

**Workout Object Shape**:
```javascript
{
  id: Number,               // Required: Unique identifier
  date: String,             // Required: ISO date (YYYY-MM-DD) for grouping
  createdAt: String,        // Required: ISO timestamp for sorting
  exerciseType: String,     // Required: 'cardio' | 'strength'
  exercise: String,         // Required: Exercise name
  distance?: Number,        // Optional: km (cardio only)
  duration?: Number,        // Optional: minutes (cardio only)
  sets?: Number,            // Optional: count (strength only)
  repsDetail?: Array<{reps: Number}>  // Optional: reps per set (strength only)
}
```

**Constraints**:
- Must be an array (can be empty `[]`)
- Each object must have `id`, `date`, `createdAt`, `exerciseType`, `exercise`
- `createdAt` must be parseable by `new Date()`
- `date` must be parseable by `dayjs()` in YYYY-MM-DD format

**Example Valid Input**:
```javascript
<RecentWorkoutsAccordion
  workouts={[
    {
      id: 1,
      date: '2025-10-11',
      createdAt: '2025-10-11T18:00:00Z',
      exerciseType: 'cardio',
      exercise: 'Running',
      distance: 5,
      duration: 30
    },
    {
      id: 2,
      date: '2025-10-08',
      createdAt: '2025-10-08T12:00:00Z',
      exerciseType: 'strength',
      exercise: 'Bench Press',
      sets: 3,
      repsDetail: [{ reps: 10 }, { reps: 10 }, { reps: 8 }]
    }
  ]}
/>
```

## Behavior Contract

### Sorting Guarantees (POST-FIX)

1. **Date Group Order** (FR-001):
   - Date groups MUST appear in descending chronological order
   - Newest date first, oldest date last
   - Example: 2025-10-11 → 2025-10-08 → 2025-10-05

2. **Workout Selection** (FR-002, FR-003):
   - Component MUST display only the 10 most recently created workouts (by `createdAt`)
   - If input has <10 workouts, all are displayed
   - If input has >10 workouts, oldest are excluded

3. **Within-Group Order** (FR-004):
   - Workouts within the same date group MUST appear in descending `createdAt` order
   - Most recently logged workout appears first within its date group

4. **Time Stamp Display** (FR-005):
   - Time stamps `[HH:mm]` MUST appear when multiple workouts exist on the same date
   - Time stamp format: `[HH:mm]` (24-hour format)
   - Time stamps MUST NOT appear when only 1 workout exists on a date

### Edge Case Behavior

| Input | Expected Behavior |
|-------|-------------------|
| Empty array `[]` | Display "まだワークアウト記録がありません" message |
| Single workout | Display 1 date group with 1 workout, no time stamp |
| 10+ workouts | Display only 10 most recent (by `createdAt`) |
| Multiple workouts on same date | Group together under single date heading, show time stamps |
| Identical `createdAt` timestamps | Display in order received (stable sort) |
| Invalid `createdAt` | Graceful degradation (sorts invalid dates to end) |

## Rendering Contract

### DOM Structure

```html
<Accordion defaultExpanded={false}>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography>直近のログを見る（10件）</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <!-- If workouts exist -->
    <Box key="2025-10-11" mb={2}>
      <Typography variant="subtitle1" fontWeight="bold">2025-10-11</Typography>
      <List>
        <ListItem disableGutters>
          <Typography variant="body2" color="textSecondary" mr={1}>[18:00]</Typography>
          <Typography>🏃 Running 5km 30分</Typography>
        </ListItem>
        <!-- More ListItems... -->
      </List>
    </Box>
    <!-- More Boxes for other dates... -->

    <!-- If no workouts -->
    <Typography color="textSecondary">まだワークアウト記録がありません</Typography>
  </AccordionDetails>
</Accordion>
```

### Accessibility

- `key` prop: Each date Box uses date string as key (guaranteed unique)
- `key` prop: Each ListItem uses `workout.id` (guaranteed unique)
- Screen reader support: Inherited from Material-UI Accordion/List components

## Performance Contract

### Optimization Guarantees

1. **useMemo Hook**:
   - `groupByDate` function is memoized
   - Only re-runs when `workouts` prop changes (referential equality)
   - No re-computation on unrelated re-renders

2. **Computational Complexity**:
   - Sorting: O(n log n) where n = input workout count
   - Grouping: O(n) where n = sorted workout count (max 10)
   - Rendering: O(m) where m = number of date groups (max 10)

3. **Performance Target**:
   - Component render time: <50ms (part of <150ms dashboard target)
   - No perceivable lag on mobile devices (iPhone 14 Pro baseline)

### Anti-Patterns Avoided

- ❌ No inline function definitions in map (would recreate on each render)
- ❌ No conditional hooks (useMemo always called)
- ❌ No direct mutation of props (`[...workouts]` creates copy)

## Error Handling

### Invalid Input Handling

| Invalid Input | Behavior | Rationale |
|---------------|----------|-----------|
| `null` or `undefined` workouts | Runtime error | Caller responsibility to provide array |
| Missing required fields | May render incorrectly or crash | Backend validation ensures data integrity |
| Malformed `createdAt` | Invalid Date sorts to end | Graceful degradation, doesn't crash |
| Non-array workouts | Runtime error | TypeScript would catch (future migration) |

**Error Boundary**: Not implemented (parent Dashboard component handles errors)

## Testing Contract

### Unit Test Coverage

**`workoutGrouping.js` functions**:
- ✅ Sorts workouts by `createdAt` descending
- ✅ Limits to 10 workouts
- ✅ Groups by date correctly
- ✅ Handles empty input
- ✅ Handles single workout

**Expected Coverage**: >80% for `workoutGrouping.js`

### Component Test Coverage

**`RecentWorkoutsAccordion.jsx` component**:
- ✅ Renders dates in descending order
- ✅ Displays empty state message
- ✅ Shows time stamps for same-day workouts
- ✅ useMemo optimization works (no unnecessary re-grouping)

**Expected Coverage**: >70% for component (focus on sorting logic)

## Backward Compatibility

### Breaking Changes: NONE

- ✅ Props interface unchanged (still accepts `workouts` array)
- ✅ Component API unchanged (same export, same name)
- ✅ Parent components (Dashboard) require no updates
- ✅ Existing Material-UI component hierarchy preserved

### Internal Changes (Non-Breaking)

- `groupByDate` function signature unchanged (input → output contract preserved)
- `hasMultipleWorkoutsOnSameDay` function unchanged
- `formatWorkoutDetails` function unchanged

## Future Compatibility

### Planned Enhancements (Post-Fix)

- **TypeScript Migration** (Constitution III): Replace JSDoc with TypeScript types
- **Virtualization** (if >100 workouts): Use react-window for large lists
- **Configurable Limit**: Allow parent to specify workout count (not just 10)

### Extension Points

- `workouts` prop can be extended with new fields without breaking existing code
- Additional utility functions can be added to `workoutGrouping.js`
- Component can be wrapped in error boundary in future

## Validation

### Contract Compliance Checklist

- [x] Props: `workouts` is Array<Workout> with required fields
- [x] Sorting: Dates appear in descending order
- [x] Sorting: Workouts within date groups in descending `createdAt` order
- [x] Limit: Max 10 workouts displayed
- [x] Display: Time stamps appear for same-day multiple workouts
- [x] Edge Cases: Empty state, single workout, 10+ workouts handled
- [x] Performance: useMemo optimization maintained
- [x] Compatibility: No breaking changes to API

## References

- Spec: [spec.md](../spec.md)
- Data Model: [data-model.md](../data-model.md)
- Implementation: `frontend/src/components/Dashboard/RecentWorkoutsAccordion.jsx`
- Service: `frontend/src/services/workoutGrouping.js`
