import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import WorkoutHistoryTable from '../WorkoutHistoryTable';
import {
  TestWrapper,
  defaultProps,
  mockIsCardioExercise,
  mockIsStrengthExercise,
  setupMocks,
  testData,
} from './WorkoutHistoryTable.testUtils';

describe('WorkoutHistoryTable - Null-Safe data access', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('exercise未定義時に"-"が正しく表示される', () => {
    const config = { exercises: ['ベンチプレス'], maxSets: 3 };

    mockIsCardioExercise.mockImplementation(() => false);
    mockIsStrengthExercise.mockImplementation(ex => ex === 'ベンチプレス');

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[testData.workouts.incomplete]}
          workoutConfig={config}
          {...defaultProps}
        />
      </TestWrapper>
    );

    expect(screen.getAllByText('-')).toHaveLength(3);
  });

  it('setKey部分未定義時の安全なフォールバック', () => {
    mockIsStrengthExercise.mockImplementation(ex => ex === 'ベンチプレス');
    mockIsCardioExercise.mockImplementation(() => false);

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[testData.workouts.partialStrength]}
          workoutConfig={{ exercises: ['ベンチプレス'], maxSets: 3 }}
          {...defaultProps}
        />
      </TestWrapper>
    );

    expect(screen.getByText('70kg×12')).toBeInTheDocument();
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('ベンチプレスオブジェクト自体が空の場合', () => {
    const emptyStrengthWorkout = {
      date: '2024-01-10',
      exercises: {
        ベンチプレス: {},
      },
    };

    mockIsStrengthExercise.mockImplementation(ex => ex === 'ベンチプレス');
    mockIsCardioExercise.mockImplementation(() => false);

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[emptyStrengthWorkout]}
          workoutConfig={{ exercises: ['ベンチプレス'], maxSets: 3 }}
          {...defaultProps}
        />
      </TestWrapper>
    );

    expect(screen.getAllByText('-')).toHaveLength(3);
  });

  it('Cardio自体が空の場合', () => {
    const partialCardioWorkout = {
      date: '2024-01-10',
      exercises: {
        ランニング: {},
      },
    };

    mockIsCardioExercise.mockImplementation(ex => ex === 'ランニング');
    mockIsStrengthExercise.mockImplementation(() => false);

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[partialCardioWorkout]}
          workoutConfig={{ exercises: ['ランニング'], maxSets: 3 }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    console.log('------------------デバッグ-----------');
    console.log(screen.debug());
    console.log('------------------デバッグ-----------');

    expect(screen.getAllByText('-')).toHaveLength(2);
  });
});
