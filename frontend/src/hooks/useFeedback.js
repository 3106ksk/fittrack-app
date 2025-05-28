import { useState } from 'react';

// フィードバック機能を再利用可能なHookに分離
export const useFeedback = () => {
  const [feedback, setFeedback] = useState({
    message: '',
    type: '',
    visible: false,
  });

  const showFeedback = (message, type) => {
    setFeedback({ message, type, visible: true });
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const hideFeedback = () => {
    setFeedback(prev => ({ ...prev, visible: false }));
  };

  return {
    feedback,
    showFeedback,
    hideFeedback
  };
};