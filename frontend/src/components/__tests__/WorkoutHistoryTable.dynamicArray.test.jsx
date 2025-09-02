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

describe('WorkoutHistoryTable - 動的配列生成ロジック', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('maxSets変更時の動的セット数生成', () => {
    // TODO(human): このテストケースを実装してください
    // 以下の要件を満たすテストを作成:
    // 1. testCasesを使って、maxSets 3, 5, 1のケースをテスト
    // 2. 各ケースで期待されるセット数のヘッダーが存在することを確認
    // 3. 期待以上のセット数は存在しないことを確認
    // 4. unmount()で各テストケース後にクリーンアップ
    // 5. ベンチプレス（筋トレ種目）を使用して、completeワークアウトデータでテスト

    mockIsCardioExercise.mockImplementation(() => false);
    mockIsStrengthExercise.mockImplementation(ex => ex === 'ベンチプレス');

    const testCases = [
      { maxSets: 3, expectedSets: ['1セット', '2セット', '3セット'] },
      { maxSets: 5, expectedSets: ['1セット', '2セット', '3セット', '4セット', '5セット'] },
      { maxSets: 1, expectedSets: ['1セット'] },
    ];

    testCases.forEach(({maxSets, expectedSets})=>{

      const {unmount} = render(
        <TestWrapper>
          <WorkoutHistoryTable
          workouts={[testData.workouts.complete]}
          workoutConfig={{ exercises: ['ベンチプレス'], maxSets}}
          {...defaultProps}
        />
      </TestWrapper>
          );

          expectedSets.forEach((expectedSet)=>{
            expect(screen.getByText(expectedSet)).toBeInTheDocument();
          });

          // 期待以上のセット数は存在しないことを確認
          if (maxSets < 5) {
            expect(screen.queryByText(`${maxSets + 1}セット`)).not.toBeInTheDocument();
          }

      unmount();

    
    })

  });
});