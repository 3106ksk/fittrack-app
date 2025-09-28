/**
 * useInsights カスタムフック
 *
 * Insights APIとの連携を担当するカスタムフック
 * 現在はモックデータを使用した実装
 *
 * @returns {Object} data - インサイトデータ
 * @returns {boolean} loading - ローディング状態
 * @returns {string|null} error - エラーメッセージ
 * @returns {Function} refetch - データ再取得関数
 */

import { useEffect, useState } from 'react';
import { mockCurrentInsightResponse } from '../mocks/insightsMockData';
export const useInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurrentInsight = async () => {
    try {
      setLoading(true);
      setError(null);

      // APIレスポンス時間をシミュレート（実APIでは削除）
      await new Promise(resolve => setTimeout(resolve, 500));

      // TODO: 将来的には実APIに置き換える
      // const response = await apiClient.get('/api/insights/current');
      // setData(response.data);

      setData(mockCurrentInsightResponse);
    } catch (err) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回マウント時にデータを取得
  useEffect(() => {
    fetchCurrentInsight();
  }, []);

  const refetch = () => {
    fetchCurrentInsight();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default useInsights;
