import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import WorkoutForm from '../index';

export const testData = {
  workouts: {
    strengthWorkout: {
      date: '2024-01-15',
      exercises: {
        ベンチプレス: { set1: '10', set2: '8', set3: '10' },
        スクワット: { set1: '12', set2: '10', set3: '12' },
      },
    },

    cardioWorkout: {
      date: '2024-01-10',
      exercises: {
        ランニング: { distance: 3.2, duration: 20 },
      },
    },

    mixedWorkout: {
      date: '2024-01-10',
      exercises: {
        ランニング: { distance: 3.2, duration: 20 },
        ベンチプレス: { set1: '10', set2: '8', set3: '10' },
        スクワット: { set1: '12', set2: '10', set3: '12' },
      },
    },
  },
};

const 
describe('WorkoutForm', () => {
  beforeEach(() => {
  vi.clearAllMocks();

  });

  it('筋トレフォームクリア', () => {
    render(<WorkoutForm />);
    expect(screen.getByText('WorkoutForm')).toBeInTheDocument();
  });
});
