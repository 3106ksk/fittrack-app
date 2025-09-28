/**
 * useInsights カスタムフック
 *
 * 【段階的実装計画】
 * ステップ1: 最小限のフック構造（状態管理のみ） ✅
 * ステップ2: モックデータとの連携 ✅
 * ステップ3: UIコンポーネントの作成 ← 現在
 *
 * 現在: モックデータを使用したシンプル実装
 */

import { useEffect, useState } from 'react';
import { mockCurrentInsightResponse } from '../mocks/insightsMockData';

/**
 * ステップ1: 最小限のフック構造
 *
 * 【実装理由】
 * - まず状態管理の基本構造を作る
 * - data, loading, error の3つの状態は必須
 * - refetch関数で手動更新を可能にする
 *
 */
export const useInsights = () => {
  // 3つの基本状態
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ステップ2: モックデータ取得（シンプル実装）
  const fetchCurrentInsight = async () => {
    try {
      setLoading(true);
      setError(null); // 前回のエラーをクリア

      // APIレスポンス時間をシミュレート
      await new Promise(resolve => setTimeout(resolve, 500));

      // モックデータを設定
      setData(mockCurrentInsightResponse);

    } catch (error) {
      setError(error.message || 'データの取得に失敗しました');
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      console.log('updated data:', data);
    } // レンダー後に確実に新しい値
  }, [data]);

  // 手動更新用の関数
  const refetch = () => {
    fetchCurrentInsight();
  };

  // 公開インターフェース
  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default useInsights;
