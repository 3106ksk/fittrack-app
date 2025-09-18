import { useCallback } from 'react';
import apiClient from '../services/api';

/**
 * ワークアウト送信ロジックを管理するカスタムフック
 * データ変換、API送信、エラーハンドリングを担当
 *
 * @param {Object} dependencies - 必要な依存関係
 * @param {Object} dependencies.workoutConfig - ワークアウト設定
 * @param {Function} dependencies.isCardioExercise - カーディオ判定関数
 * @param {Function} dependencies.showFeedback - フィードバック表示関数
 * @param {Function} dependencies.reset - フォームリセット関数
 * @param {Function} dependencies.generateDefaultValues - デフォルト値生成関数
 * @returns {Object} handleSubmit - 送信処理関数
 */
const useWorkoutSubmit = ({
  workoutConfig,
  isCardioExercise,
  showFeedback,
  reset,
  generateDefaultValues
}) => {
  /**
   * カーディオ運動データを送信用に変換
   */
  const transformCardioData = (exercise, data) => {
    const distance = data[`${exercise}_distance`];
    const duration = data[`${exercise}_duration`];

    if (!distance || !duration) {
      return null;
    }

    return {
      exercise,
      exerciseType: 'cardio',
      distance: parseFloat(distance),
      duration: parseInt(duration, 10) * 60,
      intensity: data.intensity,
    };
  };

  /**
   * 筋トレデータを送信用に変換
   */
  const transformStrengthData = (exercise, data) => {
    const repsData = [];

    for (let i = 1; i <= workoutConfig.maxSets; i++) {
      const reps = data[`${exercise}_set${i}`];
      if (reps && reps > 0) {
        repsData.push({
          id: String(i),
          reps: parseInt(reps, 10)
        });
      }
    }

    if (repsData.length === 0) {
      return null;
    }

    return {
      exercise,
      exerciseType: 'strength',
      setNumber: repsData.length,
      repsNumber: repsData,
      intensity: data.intensity,
    };
  };

  /**
   * フォーム送信処理（元の実装と同じ動作を維持）
   */
  const handleSubmit = useCallback(async (data) => {
    try {
      // 元の実装と同じループ処理
      for (const exercise of workoutConfig.exercises) {
        let submitData = null;

        if (isCardioExercise(exercise)) {
          submitData = transformCardioData(exercise, data);
        } else {
          submitData = transformStrengthData(exercise, data);
        }

        // データがある場合のみ送信
        if (submitData) {
          await apiClient.post('/workouts', submitData);
        }
      }

      // 元の実装と完全に同じ成功処理
      showFeedback('ワークアウトを保存しました', 'success');
      reset(generateDefaultValues(workoutConfig));

    } catch (error) {
      // 元の実装と完全に同じエラー処理
      const errorMessage =
        error.response?.data?.error || 'エラーが発生しました';
      showFeedback(errorMessage, 'error');
    }
  }, [
    workoutConfig,
    isCardioExercise,
    showFeedback,
    reset,
    generateDefaultValues
  ]);

  return { handleSubmit };
};

export default useWorkoutSubmit;