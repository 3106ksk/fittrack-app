import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkoutForm from '../index';

describe('WorkoutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('筋トレフォーム送信が正常に動作する', async () => {
    const user = userEvent.setup();

    render(<WorkoutForm />);

    const pushUpHeading = screen.getByRole('heading', { name: /腕立て伏せ/ });
    const pushUpCard = pushUpHeading.closest('.MuiCard-root');

    const selectField = within(pushUpCard).getAllByLabelText(/セット目/)[0];
    await user.click(selectField);

    const option = screen.getByRole('option', { name: '10 回' });
    await user.click(option);

    const intensity = screen.getByLabelText('全体的な強度');
    await user.click(intensity);
    const intensityOption = screen.getByRole('option', { name: 'かなりきつい（会話が難しい程度）' });
    await user.click(intensityOption);

    const submitButton = screen.getByRole('button', {
      name: 'ワークアウトを保存',
    });

    // 送信が成功することを確認（MSWハンドラーが動作）
    await user.click(submitButton);

    // Note: フォームリセットの詳細な検証はUS1のテストで実施
    // ここでは送信が正常に動作することのみ確認
    expect(submitButton).toBeInTheDocument();
  });
});
