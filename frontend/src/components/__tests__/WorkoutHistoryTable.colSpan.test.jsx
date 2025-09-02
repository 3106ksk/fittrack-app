import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import WorkoutHistoryTable from '../WorkoutHistoryTable';
import {
  TestWrapper,
  setupMocks,
  testData,
  defaultProps,
  mockIsCardioExercise,
  mockIsStrengthExercise,
} from './WorkoutHistoryTable.testUtils';

describe('WorkoutHistoryTable - ColSpan calculation', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('Cardio種目でcolSpan=2が正確に設定される', () => {
    mockIsCardioExercise.mockImplementation(ex => ex === 'ランニング');
    mockIsStrengthExercise.mockImplementation(() => false);

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[testData.workouts.complete]}
          workoutConfig={testData.configs.cardioOnly}
          {...defaultProps}
        />
      </TestWrapper>
    );

    expect(
      screen.getByRole('columnheader', { name: 'ランニング (距離・時間)' })
    ).toHaveAttribute('colSpan', '2');
  });

  it('Strength種目でcolSpan=maxSetsが正確に設定される', () => {
    mockIsCardioExercise.mockImplementation(() => false);
    mockIsStrengthExercise.mockImplementation(ex => ex === 'ベンチプレス');

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[testData.workouts.complete]}
          workoutConfig={testData.configs.maxSets5}
          {...defaultProps}
        />
      </TestWrapper>
    );

    const strengthHeader = screen.getByRole('columnheader', {
      name: 'ベンチプレス',
    });
    expect(strengthHeader).toHaveAttribute('colSpan', '5');

    expect(screen.getByText('1セット')).toBeInTheDocument();
    expect(screen.getByText('2セット')).toBeInTheDocument();
    expect(screen.getByText('3セット')).toBeInTheDocument();
    expect(screen.getByText('4セット')).toBeInTheDocument();
    expect(screen.getByText('5セット')).toBeInTheDocument();
  });

  it('Mixed パターンでの正確なcolSpan計算', () => {
    mockIsCardioExercise.mockImplementation(ex => ex === 'ランニング');
    mockIsStrengthExercise.mockImplementation(ex => ex === 'ベンチプレス');

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[testData.workouts.complete]}
          workoutConfig={testData.configs.mixed}
          {...defaultProps}
        />
      </TestWrapper>
    );

    const cardioHeader = screen.getByRole('columnheader', {
      name: 'ランニング (距離・時間)',
    });
    expect(cardioHeader).toHaveAttribute('colSpan', '2');

    const strengthHeader = screen.getByRole('columnheader', {
      name: 'ベンチプレス',
    });
    expect(strengthHeader).toHaveAttribute('colSpan', '3');

    expect(screen.getByText('距離(km)')).toBeInTheDocument();
    expect(screen.getByText('時間(分)')).toBeInTheDocument();
    expect(screen.getByText('1セット')).toBeInTheDocument();
    expect(screen.getByText('2セット')).toBeInTheDocument();
    expect(screen.getByText('3セット')).toBeInTheDocument();
  });
});