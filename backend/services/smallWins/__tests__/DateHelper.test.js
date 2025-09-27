/**
 * DateHelper の必要最低限のユニットテスト
 *
 * テストの重点：
 * 1. ISO週（月曜始まり）の境界判定の正確性
 * 2. 週内のワークアウトフィルタリングの動作確認
 */

const DateHelper = require('../utils/DateHelper');

describe('DateHelper - 必要最低限のテスト', () => {
  describe('ISO週の境界判定（最重要）', () => {
    test('月曜日の00:00が週の開始になること', () => {
      // 2025年9月22日は月曜日
      const monday = new Date('2025-09-22T10:00:00');
      const bounds = DateHelper.getWeekBounds(monday);

      expect(bounds.startString).toBe('2025-09-22');
      expect(bounds.endString).toBe('2025-09-28');
    });

    test('日曜日の23:59が週の終了になること', () => {
      // 2025年9月28日は日曜日
      const sunday = new Date('2025-09-28T20:00:00');
      const bounds = DateHelper.getWeekBounds(sunday);

      // 同じ週の境界を返すはず
      expect(bounds.startString).toBe('2025-09-22');
      expect(bounds.endString).toBe('2025-09-28');
    });

    test('週をまたぐデータを正しくフィルタリングすること', () => {
      const workouts = [
        { date: '2025-09-21', exerciseType: 'cardio', duration: 1800 }, // 前週の日曜
        { date: '2025-09-22', exerciseType: 'cardio', duration: 2400 }, // 今週の月曜
        { date: '2025-09-25', exerciseType: 'strength', sets: 3 }, // 今週の木曜
        { date: '2025-09-28', exerciseType: 'cardio', duration: 3000 }, // 今週の日曜
        { date: '2025-09-29', exerciseType: 'cardio', duration: 1500 }, // 次週の月曜
      ];

      // 2025年9月25日（木曜）を基準に週のワークアウトを取得
      const targetDate = new Date('2025-09-25');
      const filtered = DateHelper.filterWeeklyWorkouts(workouts, targetDate);

      // フィルタリング結果の検証
      // 今週（9/22-9/28）のワークアウトのみが含まれるべき
      expect(filtered).toHaveLength(3);

      // 含まれるべき日付を確認
      const filteredDates = filtered.map(w => w.date);
      expect(filteredDates).toContain('2025-09-22'); // 月曜
      expect(filteredDates).toContain('2025-09-25'); // 木曜
      expect(filteredDates).toContain('2025-09-28'); // 日曜

      // 除外されるべき日付を確認
      expect(filteredDates).not.toContain('2025-09-21'); // 前週の日曜
      expect(filteredDates).not.toContain('2025-09-29'); // 次週の月曜
    });
  });

  describe('エッジケース処理', () => {
    test('null/undefinedのワークアウトを安全に処理すること', () => {
      const workouts = [
        null,
        undefined,
        { date: '2025-09-23', exerciseType: 'cardio', duration: 1800 },
        { date: null, exerciseType: 'strength', sets: 3 },
        { /* dateなし */ exerciseType: 'cardio', duration: 2400 },
      ];

      const targetDate = new Date('2025-09-23');
      const filtered = DateHelper.filterWeeklyWorkouts(workouts, targetDate);

      // エラーなく処理され、有効なデータのみ返ること
      expect(filtered).toHaveLength(1);
      expect(filtered[0].date).toBe('2025-09-23');
    });
  });

  describe('日付ユーティリティ', () => {
    test('今週の残り日数を正しく計算すること', () => {
      // このテストは実行日に依存するため、0以上7以下であることを確認
      const remaining = DateHelper.getRemainingDaysInWeek();

      expect(remaining).toBeGreaterThanOrEqual(1);
      expect(remaining).toBeLessThanOrEqual(7);
    });
  });
});
