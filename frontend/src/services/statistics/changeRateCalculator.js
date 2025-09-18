/**
 * 変化率計算に関する責任を持つモジュール
 */

/**
 * 変化率を計算する
 * @param {number} current - 現在の値
 * @param {number} last - 前回の値
 * @returns {number} 変化率（％）
 */
export const calculateChangeRate = (current, last) => {
  if (last === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - last) / last) * 100);
};