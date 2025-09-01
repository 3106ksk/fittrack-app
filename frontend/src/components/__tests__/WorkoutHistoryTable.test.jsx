import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkoutHistoryTable from '../WorkoutHistoryTable';

const theme = createTheme();
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

const mockIsCardioExercise = vi.fn();
const mockIsStrengthExercise = vi.fn();

const testDataStrategy = {
  completeWorkout: {
    date: '2024-01-15',
    exercises: {
      ランニング: { distance: 5.0, duration: 30 },
      ベンチプレス: { set1: '10', set2: '8', set3: '10' },
      スクワット: { set1: '12', set2: '10', set3: '12' },
    },
    totalReps: 62,
    totalTime: 45,
  },

  partialWorkout: {
    date: '2024-01-10',
    exercises: {
      ランニング: { distance: 3.2, duration: 20 },
      ベンチプレス: { set1: '15' },
      スクワット: {}, // その日はスキップ（体調・時間等）
    },
    totalReps: 15,
    totalTime: 20,
  },

  inconsistentDataWorkout: {
    date: '2024-01-08',
    exercises: {
      ランニング: { distance: 2.5 },
      ベンチプレス: { set1: '12', set3: '10' },
      スクワット: { set2: '15' }, // set1なしでset2のみ（珍しいが可能）
    },
  },

  configVariations: {
    maxSets3: {
      exercises: ['ベンチプレス'],
      maxSets: 3,
      displayColumns: ['totalReps'],
    },
    maxSets5: {
      exercises: ['ベンチプレス'],
      maxSets: 5,
      displayColumns: undefined,
    },
    mixed: {
      exercises: ['ランニング', 'ベンチプレス'],
      maxSets: 3,
      displayColumns: ['totalReps', 'totalTime'],
    },
  },
};

describe('WorkoutHistoryTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsCardioExercise.mockImplementation(
      exercise => exercise === 'ランニング' || exercise === 'サイクリング'
    );
    mockIsStrengthExercise.mockImplementation(
      exercise => exercise === 'ベンチプレス' || exercise === 'スクワット'
    );
  });

  it('🔴 完全なワークアウトデータの正常表示', () => {

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[testDataStrategy.completeWorkout]}
          workoutConfig={testDataStrategy.configVariations.maxSets3}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('詳細履歴')).toBeInTheDocument();

    expect(mockIsCardioExercise).toHaveBeenCalledWith('ベンチプレス');
    expect(mockIsStrengthExercise).toHaveBeenCalledWith('ベンチプレス');
  });

  describe('🔄 動的colSpan計算エンジン', () => {
    it('🔴 Cardio種目でcolSpan=2が正確に設定される', () => {
      mockIsCardioExercise.mockImplementation(ex => ex === 'ランニング');
      mockIsStrengthExercise.mockImplementation(() => false);

      const config = {
        exercises: ['ランニング'],
        maxSets: 3,
        displayColumns: [],
      };

      render(
        <TestWrapper>
          <WorkoutHistoryTable
            workouts={[testDataStrategy.completeWorkout]}
            workoutConfig={config}
            loading={false}
            isCardioExercise={mockIsCardioExercise}
            isStrengthExercise={mockIsStrengthExercise}
          />
        </TestWrapper>
      );

      expect(
        screen.getByRole('columnheader', { name: 'ランニング (距離・時間)' })
      ).toHaveAttribute('colSpan', '2');
    });

    it('🔴 Strength種目でcolSpan=maxSetsが正確に設定される', () => {
      mockIsCardioExercise.mockImplementation(() => false);
      mockIsStrengthExercise.mockImplementation(ex => ex === 'ベンチプレス');

      const config = {
        exercises: ['ベンチプレス'],
        maxSets: 5,
        displayColumns: [],
      };

      render(
        <TestWrapper>
          <WorkoutHistoryTable
            workouts={[testDataStrategy.completeWorkout]}
            workoutConfig={config}
            loading={false}
            isCardioExercise={mockIsCardioExercise}
            isStrengthExercise={mockIsStrengthExercise}
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

    it('🔴 Mixed パターンでの正確なcolSpan計算', () => {
      mockIsCardioExercise.mockImplementation(ex => ex === 'ランニング');
      mockIsStrengthExercise.mockImplementation(ex => ex === 'ベンチプレス');

      const config = {
        exercises: ['ランニング', 'ベンチプレス'],
        maxSets: 3,
        displayColumns: [],
      };

      render(
        <TestWrapper>
          <WorkoutHistoryTable
            workouts={[testDataStrategy.completeWorkout]}
            workoutConfig={config}
            loading={false}
            isCardioExercise={mockIsCardioExercise}
            isStrengthExercise={mockIsStrengthExercise}
          />
        </TestWrapper>
      );

      const cardioHeader = screen.getByRole('columnheader', {
        name: 'ランニング (距離・時間)',
      });

            console.log('Header Elements:');
            screen.getAllByRole('columnheader').forEach(header => {
              console.log({
                name: header.textContent,
                colspan: header.getAttribute('colspan'),
                html: header.outerHTML,
              });
            });

      expect(cardioHeader).toHaveAttribute('colSpan', '2');

      // Strength: colSpan=3
      const strengthHeader = screen.getByRole('columnheader', {
        name: 'ベンチプレス',
      });
      expect(strengthHeader).toHaveAttribute('colSpan', '3');

      // Cardio詳細ヘッダー確認
      expect(screen.getByText('距離(km)')).toBeInTheDocument();
      expect(screen.getByText('時間(分)')).toBeInTheDocument();

      // Strength詳細ヘッダー確認（3セット分）
      expect(screen.getByText('1セット')).toBeInTheDocument();
      expect(screen.getByText('2セット')).toBeInTheDocument();
      expect(screen.getByText('3セット')).toBeInTheDocument();
    });
  });
});
