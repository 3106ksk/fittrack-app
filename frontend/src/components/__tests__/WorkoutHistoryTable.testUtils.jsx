import { createTheme, ThemeProvider } from '@mui/material/styles';
import { vi } from 'vitest';

export const theme = createTheme();

export const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export const mockIsCardioExercise = vi.fn();
export const mockIsStrengthExercise = vi.fn();

export const setupMocks = () => {
  vi.clearAllMocks();
  mockIsCardioExercise.mockImplementation(
    exercise => exercise === 'ランニング' || exercise === 'サイクリング'
  );
  mockIsStrengthExercise.mockImplementation(
    exercise => exercise === 'ベンチプレス' || exercise === 'スクワット'
  );
};

export const testData = {
  workouts: {
    complete: {
      date: '2024-01-15',
      exercises: {
        ランニング: { distance: 5.0, duration: 30 },
        ベンチプレス: { set1: '10', set2: '8', set3: '10' },
        スクワット: { set1: '12', set2: '10', set3: '12' },
      },
      totalReps: 62,
      totalTime: 45,
    },

    partial: {
      date: '2024-01-10',
      exercises: {
        ランニング: { distance: 3.2, duration: 20 },
        ベンチプレス: { set1: '15' },
        スクワット: {},
      },
      totalReps: 15,
      totalTime: 20,
    },

    inconsistent: {
      date: '2024-01-08',
      exercises: {
        ランニング: { distance: 2.5 },
        ベンチプレス: { set1: '12', set3: '10' },
        スクワット: { set2: '15' },
      },
    },

    incomplete: {
      date: '2024-01-10',
      exercises: {},
    },

    partialStrength: {
      date: '2024-01-10',
      exercises: {
        ベンチプレス: {
          set1: '70kg×12',
        },
      },
    },

    partialCardio: {
      date: '2024-01-10',
      exercises: {
        ランニング: {
          distance: 3.2,
        },
      },
    },
  },

  configs: {
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

    cardioOnly: {
      exercises: ['ランニング'],
      maxSets: 3,
      displayColumns: [],
    },

    strengthOnly: {
      exercises: ['ベンチプレス'],
      maxSets: 3,
      displayColumns: [],
    },
  },
};

export const defaultProps = {
  loading: false,
  isCardioExercise: mockIsCardioExercise,
  isStrengthExercise: mockIsStrengthExercise,
};