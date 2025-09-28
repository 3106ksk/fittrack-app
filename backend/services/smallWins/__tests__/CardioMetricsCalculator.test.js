/**
 * CardioMetricsCalculator のユニットテスト
 *
 * テストの目的：
 * 1. WHO基準（週150分）に対するスコア計算の正確性を保証
 * 2. 境界値での正しい動作を確認
 * 3. 異常データに対する堅牢性を検証
 */

const CardioMetricsCalculator = require('../metrics/CardioMetricsCalculator');

describe('CardioMetricsCalculator', () => {
  let calculator;

  // 各テストの前に新しいインスタンスを作成
  // これにより、テスト間の状態汚染を防ぐ
  beforeEach(() => {
    calculator = new CardioMetricsCalculator();
  });

  describe('WHO基準スコア計算の正確性', () => {
    test('週150分ちょうどで100点になること', () => {
      // 【学習ポイント】境界値テスト
      // WHO基準の150分は9000秒。この値でちょうど100点になるべき
      const workouts = [
        {
          exerciseType: 'cardio',
          duration: 4500,
          date: '2025-09-22',
        },
        {
          exerciseType: 'cardio',
          duration: 4000,
          date: '2025-09-23',
        },
        {
          exerciseType: 'cardio',
          duration: 500, // 150分 = 9000秒
          date: '2025-09-23',
        },
      ];

      const result = calculator.calculate(workouts);
      console.log(result);

      // 期待値の検証
      expect(result.score).toBe(100);
      expect(result.whoAchieved).toBe(true);
      expect(result.details.weeklyMinutes).toBe(150);
      expect(result.details.achievementRate).toBe(100);
    });

    test('週75分で50点になること', () => {
      // 【学習ポイント】線形計算の検証
      // 150分の半分（75分）で50点になることを確認
      const workouts = [
        {
          exerciseType: 'cardio',
          duration: 4500, // 75分 = 4500秒
          date: '2025-09-24',
        },
      ];

      const result = calculator.calculate(workouts);

      expect(result.score).toBe(50);
      expect(result.whoAchieved).toBe(false);
      expect(result.details.weeklyMinutes).toBe(75);
      expect(result.details.achievementRate).toBe(50);
    });

    test('週300分でも100点を超えないこと', () => {
      // 【学習ポイント】上限キャップの動作
      // WHO基準を超えても、スコアは100点が上限
      const workouts = [
        {
          exerciseType: 'cardio',
          duration: 18000, // 300分 = 18000秒
          date: '2025-09-25',
        },
      ];

      const result = calculator.calculate(workouts);
      expect(result.score).toBe(100); // 上限でキャップされる
      expect(result.whoAchieved).toBe(true);
      expect(result.details.weeklyMinutes).toBe(300);
      expect(result.details.achievementRate).toBe(200); // 達成率は200%
    });

    test('運動なしで0点になること', () => {
      // 【学習ポイント】ゼロケースの処理
      const workouts = [];

      const result = calculator.calculate(workouts);

      expect(result.score).toBe(0);
      expect(result.whoAchieved).toBe(false);
      expect(result.details.weeklyMinutes).toBe(0);
      expect(result.details.workoutCount).toBe(0);
    });
  });

  describe('データ型の堅牢性', () => {
    test('null/undefinedを含む配列を安全に処理すること', () => {
      // 【学習ポイント】防御的プログラミング
      // 実環境では不完全なデータが来ることがある
      const workouts = [
        null,
        undefined,
        {
          exerciseType: 'cardio',
          duration: 1800, // 30分
          date: '2025-09-23',
        },
        {
          exerciseType: 'cardio',
          duration: null, // durationがnull
          date: '2025-09-24',
        },
        {
          exerciseType: 'cardio',
          // durationが存在しない
          date: '2025-09-25',
        },
      ];

      const result = calculator.calculate(workouts);

      // エラーが起きずに、有効なデータのみ集計されること
      expect(result.score).toBe(20); // 30分のみカウント
      expect(result.details.weeklyMinutes).toBe(30);
      expect(result.details.workoutCount).toBe(3); // cardioタイプは3つ
    });

    test('exerciseTypeがstrengthのデータを除外すること', () => {
      // 【学習ポイント】フィルタリングの正確性
      const workouts = [
        {
          exerciseType: 'cardio',
          duration: 3000, // 50分
          date: '2025-09-23',
        },
        {
          exerciseType: 'strength', // 筋トレは除外されるべき
          sets: 3,
          reps: 30,
          date: '2025-09-24',
        },
        {
          exerciseType: 'cardio',
          duration: 2400, // 40分
          date: '2025-09-25',
        },
      ];

      const result = calculator.calculate(workouts);

      expect(result.details.weeklyMinutes).toBe(90); // 50 + 40 = 90分
      expect(result.details.workoutCount).toBe(2); // cardioのみ2つ
    });

    test('文字列のdurationを数値に変換すること', () => {
      // 【学習ポイント】型変換の処理
      // フロントエンドから文字列で来る可能性がある
      const workouts = [
        {
          exerciseType: 'cardio',
          duration: '3600', // 文字列の60分
          date: '2025-09-23',
        },
        {
          exerciseType: 'cardio',
          duration: 1800, // 数値の30分
          date: '2025-09-24',
        },
      ];

      const result = calculator.calculate(workouts);

      expect(result.details.weeklyMinutes).toBe(90); // 60 + 30 = 90分
    });
  });

  describe('日別集計の正確性', () => {
    test('同一日の複数ワークアウトを正しく集計すること', () => {
      // 【学習ポイント】累積ロジックのテスト
      // 同じ日に朝と夜に運動した場合の集計
      const workouts = [
        {
          exerciseType: 'cardio',
          duration: 1200, // 朝の20分ラン
          date: '2025-09-23',
        },
        {
          exerciseType: 'cardio',
          duration: 1800, // 夜の30分ラン
          date: '2025-09-23',
        },
        {
          exerciseType: 'cardio',
          duration: 2400, // 別の日の40分
          date: '2025-09-24',
        },
      ];

      const result = calculator.calculate(workouts);

      // 合計時間の検証
      expect(result.details.weeklyMinutes).toBe(90); // 20 + 30 + 40 = 90分

      // byDayの検証：同じ日のデータが合算されているか
      expect(result.details.byDay['2025-09-23']).toBe(50); // 20 + 30 = 50分
      expect(result.details.byDay['2025-09-24']).toBe(40); // 40分
      expect(Object.keys(result.details.byDay)).toHaveLength(2); // 2日分
    });

    test('byDayオブジェクトが正しい構造を持つこと', () => {
      // 【学習ポイント】データ構造の検証
      const workouts = [
        {
          exerciseType: 'cardio',
          duration: 3600, // 60分
          date: '2025-09-23',
        },
        {
          exerciseType: 'cardio',
          duration: 2700, // 45分
          date: '2025-09-25',
        },
        {
          exerciseType: 'cardio',
          duration: 900, // 15分
          date: '2025-09-27',
        },
      ];

      const result = calculator.calculate(workouts);

      // byDayの構造検証
      const byDay = result.details.byDay;

      // 正しい日付がキーとして存在するか
      expect(byDay).toHaveProperty('2025-09-23');
      expect(byDay).toHaveProperty('2025-09-25');
      expect(byDay).toHaveProperty('2025-09-27');

      // 値が分単位で正しく格納されているか
      expect(byDay['2025-09-23']).toBe(60);
      expect(byDay['2025-09-25']).toBe(45);
      expect(byDay['2025-09-27']).toBe(15);

      // 合計が正しいか
      let dailyTotal = 0;
      Object.values(byDay).forEach((min) => {
        dailyTotal += min;
      });
      expect(dailyTotal).toBe(120);
    });
  });

  // 🎯 Learn by Doing
  describe('エッジケースのテスト', () => {
    test.todo('巨大なduration値（MAX_SAFE_INTEGER）を処理できること');
    test.todo('負のduration値を0として処理すること');
    test.todo('1週間分（7日）のデータを正しく処理すること');

    // ヒント: これらのテストを実装することで、
    // より堅牢なアプリケーションになります
    test('巨大なduration値（MAX_SAFE_INTEGER）を処理できること', () => {
      const workouts = [
        {
          exerciseType: 'cardio',
          duration: 999999999,
          date: '2025-09-23',
        },
      ];
      const result = calculator.calculate(workouts);
      const byDay = result.details.byDay;

      expect(result.score).toBe(100); // 上限張り付き
      expect(result.whoAchieved).toBe(true);
      expect(byDay).toHaveProperty('2025-09-23');
      expect(result.details.workoutCount).toBe(1);
    });

    test('負のduration値を0として処理すること', () => {
      const workouts = [
        {
          exerciseType: 'cardio',
          duration: -6000, // -10分（0扱いにする想定）
          date: '2025-09-23',
        },
        {
          exerciseType: 'cardio',
          duration: 0,
          date: '2025-09-24',
        },
      ];
      const result = calculator.calculate(workouts);

      expect(result.details.weeklyMinutes).toBe(0);
      expect(result.score).toBe(0);
      expect(result.whoAchieved).toBe(false);
    });
  });
});
