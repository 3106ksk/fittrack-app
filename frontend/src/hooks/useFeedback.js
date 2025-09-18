import { useState, useEffect } from 'react';
import { FEEDBACK_DISPLAY_DURATION } from '../components/WorkoutForm/constants';

/**
 * フィードバックメッセージ管理用カスタムフック
 * 成功/エラーメッセージの表示と自動消去を管理
 *
 * @returns {Object} feedback - フィードバック状態
 * @returns {Function} showFeedback - フィードバック表示関数
 * @returns {Function} hideFeedback - フィードバック非表示関数
 */
const useFeedback = () => {
  const [feedback, setFeedback] = useState({
    message: '',
    type: '', // 'success' | 'error' | 'info' | 'warning'
    visible: false,
  });

  const showFeedback = (message, type = 'info') => {
    setFeedback({
      message,
      type,
      visible: true,
    });
  };

  const hideFeedback = () => {
    setFeedback(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (feedback.visible) {
      const timer = setTimeout(() => {
        hideFeedback();
      }, FEEDBACK_DISPLAY_DURATION);

      return () => clearTimeout(timer);
    }
  }, [feedback.visible]);

  return {
    feedback,
    showFeedback,
    hideFeedback,
  };
};

export default useFeedback;