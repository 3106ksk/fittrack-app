import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import WorkoutHistoryTable from '../WorkoutHistoryTable';
import {
  TestWrapper,
  setupMocks,
  testData,
  defaultProps,
} from './WorkoutHistoryTable.testUtils';

describe('WorkoutHistoryTable - Basic functionality', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('完全なワークアウトデータの正常表示', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[testData.workouts.complete]}
          workoutConfig={testData.configs.maxSets3}
          {...defaultProps}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('詳細履歴')).toBeInTheDocument();
    expect(defaultProps.isCardioExercise).toHaveBeenCalledWith('ベンチプレス');
    expect(defaultProps.isStrengthExercise).toHaveBeenCalledWith('ベンチプレス');
  });

  it('ローディング状態の表示', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[]}
          workoutConfig={testData.configs.maxSets3}
          loading={true}
          {...defaultProps}
        />
      </TestWrapper>
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('空のワークアウトリストの処理', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[]}
          workoutConfig={testData.configs.maxSets3}
          {...defaultProps}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});