import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkoutForm from '../index';

describe('WorkoutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('筋トレフォーム送信後、全フィールドがリセットされる', async () => {
    const user = userEvent.setup();

    render(<WorkoutForm />);

    const pushUpCard = screen.getByText('腕立て伏せ').closest('.MuiCard-root');

    const selectField = within(pushUpCard).getAllByLabelText(/セット目/)[0];
    await user.click(selectField);

    const option = screen.getByRole('option', { name: '10 回' });
    await user.click(option);

    const intensity = screen.getByLabelText('全体的な強度');
    await user.click(intensity);
    const intensityOption = screen.getByRole('option', { name: /高/ });
    await user.click(intensityOption);

    const submitButton = screen.getByRole('button', {
      name: 'ワークアウトを保存',
    });
    await user.click(submitButton);

    await waitFor(() => {
      const resetField = within(pushUpCard).getAllByLabelText(/セット目/)[0];
      expect(resetField).toHaveValue('');
    });
  });
});
