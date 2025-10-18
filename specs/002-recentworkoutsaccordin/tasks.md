# Tasks: Recent Workouts Display Order Bug Fix

**Input**: Design documents from `/specs/002-recentworkoutsaccordin/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md
**Branch**: `002-recentworkoutsaccordin`

**Tests**: Included - Testing strategy explicitly defined in research.md with detailed test cases

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions
This is a web application with `frontend/` and `backend/` directories. All changes are frontend-only for this bug fix.

---

## Phase 1: Setup (Test Infrastructure)

**Purpose**: Create test file structure for the bug fix

- [x] T001 [P] Create test directory structure `frontend/tests/unit/` if not exists
- [x] T002 [P] Create test directory structure `frontend/src/test/components/Dashboard/` if not exists

**Checkpoint**: Test directories ready for test files

---

## Phase 2: Foundational (No Blocking Prerequisites)

**Purpose**: This bug fix has no foundational infrastructure requirements. All dependencies (React, dayjs, Material-UI, Vitest) are already configured in the project.

**Note**: Phase 2 is empty because this is a bug fix in existing code. Proceed directly to user story implementation.

---

## Phase 3: User Story 1 - View Most Recent Workouts First (Priority: P1) 🎯 MVP

**Goal**: Fix date group ordering so the most recent workout dates appear first in the accordion. Users should see their newest workout activity at the top without scrolling.

**Independent Test**: Create 3+ workouts on different dates (e.g., Oct 5, Oct 8, Oct 11), open the recent workouts accordion, and verify dates appear in descending order (Oct 11 → Oct 8 → Oct 5).

**Acceptance Criteria** (from spec.md):
1. Dates displayed in order: newest first, oldest last
2. Most recent 10 workouts selected by `createdAt`
3. Today's workout appears at top of list

### Tests for User Story 1

**NOTE: Write these tests FIRST using TDD - ensure they FAIL before implementation**

- [ ] T003 [P] [US1] Write unit test for sorting workouts by `createdAt` before grouping in `frontend/tests/unit/workoutGrouping.test.js` (Test: Given 15 unsorted workouts with different createdAt timestamps, verify groupByDate returns only 10 most recent by createdAt)
- [ ] T004 [P] [US1] Write unit test for 10-item limit in `frontend/tests/unit/workoutGrouping.test.js` (Test: Given 20 workouts, verify exactly 10 are returned)
- [ ] T005 [P] [US1] Write unit test for empty input in `frontend/tests/unit/workoutGrouping.test.js` (Test: Given empty array, return empty object)
- [ ] T006 [P] [US1] Write unit test for single workout in `frontend/tests/unit/workoutGrouping.test.js` (Test: Given 1 workout, return single-date group with 1 item)
- [ ] T007 [US1] Run unit tests for `groupByDate` function and verify they FAIL (expected, no implementation yet)
- [ ] T008 [P] [US1] Write component test for date visual order in `frontend/src/test/components/Dashboard/RecentWorkoutsAccordion.test.jsx` (Test: Given workouts on Oct 5, 8, 11, verify DOM elements appear Oct 11 → Oct 8 → Oct 5)
- [ ] T009 [P] [US1] Write component test for empty state in `frontend/src/test/components/Dashboard/RecentWorkoutsAccordion.test.jsx` (Test: Given no workouts, verify "まだワークアウト記録がありません" message)
- [ ] T010 [US1] Run component tests and verify they FAIL (expected, no implementation yet)

### Implementation for User Story 1

- [ ] T011 [US1] Implement sorting by `createdAt` in `groupByDate` function at `frontend/src/services/workoutGrouping.js:8` (Add: `const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);` and use sortedWorkouts in forEach)
- [ ] T012 [US1] Run unit tests for `groupByDate` and verify they PASS
- [ ] T013 [US1] Implement date group sorting in component at `frontend/src/components/Dashboard/RecentWorkoutsAccordion.jsx:46` (Add: `.sort((a, b) => new Date(b[0]) - new Date(a[0]))` between Object.entries() and .map())
- [ ] T014 [US1] Run component tests and verify they PASS
- [ ] T015 [US1] Manual test with real data: Create 3 workouts on Oct 5, 8, 11 and verify Oct 11 appears first in accordion

**Checkpoint**: User Story 1 complete - dates appear in descending order, 10 most recent workouts selected correctly

---

## Phase 4: User Story 2 - View Multiple Workouts on Same Day in Chronological Order (Priority: P2)

**Goal**: Ensure workouts within the same date group appear in reverse chronological order (newest time first). Users who do multiple workouts per day can track their session sequence.

**Independent Test**: Create 3 workouts on the same date at different times (09:00, 14:30, 18:00), open accordion, and verify they appear with time stamps in descending order (18:00 → 14:30 → 09:00).

**Acceptance Criteria** (from spec.md):
1. Same-day workouts ordered by time (newest first)
2. Time stamps [HH:mm] decrease from top to bottom within each date group

**Note**: User Story 2 is largely completed by User Story 1's implementation. The sorting by `createdAt` in `groupByDate` already ensures within-group chronological order. This phase focuses on verification and edge case testing.

### Tests for User Story 2

- [ ] T016 [P] [US2] Write unit test for within-group order in `frontend/tests/unit/workoutGrouping.test.js` (Test: Given 3 workouts on same date at different times, verify they appear in descending createdAt order within the date group)
- [ ] T017 [US2] Run unit test and verify it PASSES (should pass due to US1 implementation)
- [ ] T018 [P] [US2] Write component test for time stamp display and order in `frontend/src/test/components/Dashboard/RecentWorkoutsAccordion.test.jsx` (Test: Given 3 workouts on Oct 11 at 09:00, 14:30, 18:00, verify [18:00], [14:30], [09:00] appear in that order)
- [ ] T019 [US2] Run component test and verify it PASSES (should pass due to existing hasMultipleWorkoutsOnSameDay logic)

### Implementation for User Story 2

- [ ] T020 [US2] Verify within-group sorting works correctly (no code changes needed, verify by inspection of sortedWorkouts in groupByDate)
- [ ] T021 [US2] Manual test with real data: Create 3 workouts on same date at 09:00, 14:30, 18:00 and verify [18:00] appears first with correct time ordering

**Checkpoint**: User Story 2 complete - same-day workouts appear in reverse chronological order with correct time stamps

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and edge case testing across both user stories

- [ ] T022 [P] [US1+US2] Test edge case: All 10 workouts on same date (verify single date group with 10 time-ordered workouts)
- [ ] T023 [P] [US1+US2] Test edge case: Identical timestamps (verify stable sort, no crashes)
- [ ] T024 [P] [US1+US2] Test edge case: 11+ workouts (verify only 10 most recent shown)
- [ ] T025 [US1+US2] Verify useMemo optimization preserved (check that groupByDate doesn't re-run on unrelated Dashboard re-renders)
- [ ] T026 [US1+US2] Run full test suite with coverage: `cd frontend && npm run test:coverage` (verify 80%+ coverage for workoutGrouping.js)
- [ ] T027 [US1+US2] Performance check: Verify dashboard rendering stays <150ms (use React DevTools Profiler)
- [ ] T028 [US1+US2] Follow quickstart.md manual testing checklist at `specs/002-recentworkoutsaccordin/quickstart.md`
- [ ] T029 [US1+US2] Code review self-check: Verify no breaking changes to component props or API
- [ ] T030 [US1+US2] Git commit with message: "fix(frontend): sort recent workouts in descending chronological order (#002)"

**Checkpoint**: Bug fix complete, tested, and ready for PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Empty (no blocking prerequisites)
- **User Story 1 (Phase 3)**: Depends on Setup completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (inherits sorting logic)
- **Polish (Phase 5)**: Depends on both user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 implementation (sorting logic is shared)

**Note**: Unlike typical multi-story features, US2 is not fully independent because it relies on the sorting logic implemented in US1. However, it adds independent test coverage for same-day workout ordering.

### Within Each User Story

**User Story 1**:
1. Write all unit tests in parallel (T003-T006 can run together)
2. Run unit tests to verify FAIL (T007)
3. Write all component tests in parallel (T008-T009 can run together)
4. Run component tests to verify FAIL (T010)
5. Implement `groupByDate` sorting (T011)
6. Verify unit tests PASS (T012)
7. Implement component date sorting (T013)
8. Verify component tests PASS (T014)
9. Manual validation (T015)

**User Story 2**:
1. Write unit test for within-group order (T016)
2. Verify test PASSES (T017) - leverages US1 work
3. Write component test for time stamps (T018)
4. Verify test PASSES (T019) - leverages existing logic
5. Inspect code for correctness (T020)
6. Manual validation (T021)

### Parallel Opportunities

**Phase 1 - Setup**:
```bash
# Both test directories can be created in parallel
Task T001: Create frontend/tests/unit/
Task T002: Create frontend/src/test/components/Dashboard/
```

**Phase 3 - US1 Unit Tests**:
```bash
# All unit test cases can be written in parallel (different test cases)
Task T003: Test sorting by createdAt
Task T004: Test 10-item limit
Task T005: Test empty input
Task T006: Test single workout
```

**Phase 3 - US1 Component Tests**:
```bash
# Both component test cases can be written in parallel
Task T008: Test date visual order
Task T009: Test empty state
```

**Phase 4 - US2 Tests**:
```bash
# Both tests can be written in parallel
Task T016: Unit test for within-group order
Task T018: Component test for time stamps
```

**Phase 5 - Polish**:
```bash
# Edge case tests can run in parallel
Task T022: Test all workouts on same date
Task T023: Test identical timestamps
Task T024: Test 11+ workouts
```

---

## Parallel Example: User Story 1 Testing

```bash
# Launch all unit test writing tasks together:
Task T003: "Write unit test for sorting workouts by createdAt in frontend/tests/unit/workoutGrouping.test.js"
Task T004: "Write unit test for 10-item limit in frontend/tests/unit/workoutGrouping.test.js"
Task T005: "Write unit test for empty input in frontend/tests/unit/workoutGrouping.test.js"
Task T006: "Write unit test for single workout in frontend/tests/unit/workoutGrouping.test.js"

# Then run verification (sequential):
Task T007: "Run unit tests and verify FAIL"

# Launch component test writing tasks together:
Task T008: "Write component test for date visual order in frontend/src/test/components/Dashboard/RecentWorkoutsAccordion.test.jsx"
Task T009: "Write component test for empty state in frontend/src/test/components/Dashboard/RecentWorkoutsAccordion.test.jsx"

# Then run verification (sequential):
Task T010: "Run component tests and verify FAIL"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (test directories)
2. Complete Phase 3: User Story 1
   - Write tests (T003-T010)
   - Implement sorting (T011-T014)
   - Manual validation (T015)
3. **STOP and VALIDATE**: Test User Story 1 independently
4. Deploy/demo if ready

**MVP Deliverable**: Dates appear in descending order, 10 most recent workouts shown correctly

### Full Feature (Both User Stories)

1. Complete MVP (User Story 1)
2. Add User Story 2:
   - Write verification tests (T016-T019)
   - Verify within-group ordering (T020-T021)
3. Complete Polish phase:
   - Edge case testing (T022-T024)
   - Performance validation (T025-T027)
   - Final checks (T028-T030)
4. Create PR for code review

**Full Feature Deliverable**: Both date-level and time-level sorting working correctly with comprehensive test coverage

### TDD Workflow (Recommended)

This bug fix follows Test-Driven Development:

1. **Red**: Write failing tests (T003-T010)
2. **Green**: Implement minimum code to pass tests (T011-T014)
3. **Refactor**: Verify performance and edge cases (Phase 5)

**Benefits**:
- Confirms bug exists (tests fail initially)
- Confirms fix works (tests pass after implementation)
- Prevents regression (tests remain in codebase)

---

## Task Summary

**Total Tasks**: 30
- Phase 1 (Setup): 2 tasks
- Phase 2 (Foundational): 0 tasks (no prerequisites)
- Phase 3 (User Story 1): 13 tasks (8 tests + 5 implementation)
- Phase 4 (User Story 2): 6 tasks (4 tests + 2 verification)
- Phase 5 (Polish): 9 tasks (edge cases + validation)

**Tasks by User Story**:
- User Story 1 (P1): 13 tasks (critical path)
- User Story 2 (P2): 6 tasks (incremental)
- Shared/Polish: 11 tasks (setup + polish)

**Parallel Opportunities**: 12 tasks can run in parallel (marked with [P])

**Independent Test Criteria**:
- US1: Create workouts on Oct 5, 8, 11 → Verify Oct 11 appears first
- US2: Create 3 workouts on same date at 09:00, 14:30, 18:00 → Verify [18:00] appears first

**Estimated Time** (from quickstart.md):
- Setup: 2 minutes
- US1 Implementation: 10 minutes (5 min per file)
- US1 Testing: 15 minutes (unit tests)
- US2 Verification: 10 minutes (tests only)
- Polish: 15 minutes (edge cases + validation)
- **Total**: 52 minutes (~1 hour)

---

## Notes

- [P] tasks = different files/test cases, no dependencies between them
- [Story] label maps task to specific user story (US1, US2) for traceability
- US2 is not fully independent due to shared sorting logic, but adds independent test coverage
- Follow TDD: Write tests first, watch them FAIL, implement, watch them PASS
- Verify tests fail before implementing (confirms tests are actually testing the bug)
- Each checkpoint allows you to validate story independently
- Commit after each phase or logical group of tasks
- All file paths are absolute from repository root
- No backend, API, or database changes required
- Zero breaking changes to component props or API contracts
