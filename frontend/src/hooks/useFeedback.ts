import { useState } from 'react';
import { FeedbackState, FeedbackType } from '../types/feedback';

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackState>({
    message: '',
    type: 'success',
    visible: false,
  });

  const showFeedback = (message: string, type: FeedbackType): void => {
    setFeedback({ message, type, visible: true });
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const hideFeedback = (): void => {
    setFeedback(prev => ({ ...prev, visible: false }));
  };

  return {
    feedback,
    showFeedback,
    hideFeedback,
  };
};
