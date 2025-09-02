import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import WorkoutHistoryTable from '../WorkoutHistoryTable';
import {
  TestWrapper,
  defaultProps,
  setupMocks,
  testData
} from './WorkoutHistoryTable.testUtils';

describe('🔄 I1: 状態別UI制御テスト', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('loading=true でローディング状態が正しく表示される', async () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable workouts={[]} {...defaultProps} loading={true} />
      </TestWrapper>
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    expect(screen.getByText('詳細履歴')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('workouts=[]で空状態が正しく表示される', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[]}
          workoutConfig={{ exercises: ['ベンチプレス'], maxSets: 3 }}
          {...defaultProps}
          loading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('詳細履歴')).toBeInTheDocument();
    expect(screen.getByText('ワークアウト履歴がありません')).toBeInTheDocument();
    expect(screen.getByText('新しいワークアウトを開始しましょう！')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('正常データでテーブル表示', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[testData.workouts.complete]}
          workoutConfig={{ exercises: ['ベンチプレス'], maxSets: 3 }}
          {...defaultProps}
          loading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('詳細履歴')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    expect(screen.queryByText('ワークアウト履歴がありません')).not.toBeInTheDocument();
  });
});
