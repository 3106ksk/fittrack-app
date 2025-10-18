import { describe, expect, it } from 'vitest';
import { groupByDate } from '../workoutGrouping.js';

describe('groupByDate', () => {
  it('最新のワークアウトが最初に来る', () => {
    const workouts = [
      {
        id: 2,
        date: '2025-10-08',
        createdAt: '2025-10-08T14:00:00Z',
        exercise: 'Run2',
      },
      {
        id: 1,
        date: '2025-10-05',
        createdAt: '2025-10-05T09:00:00Z',
        exercise: 'Run1',
      },
      {
        id: 3,
        date: '2025-10-11',
        createdAt: '2025-10-11T18:00:00Z',
        exercise: 'Run3',
      },
    ];

    const result = groupByDate(workouts);
    const workoutsDesc = Object.values(result).flat();
    console.log(workoutsDesc);

    expect(workoutsDesc[0].id).toBe(3);
    expect(workoutsDesc[workoutsDesc.length - 1].id).toBe(1);
  });

  it('同日複数ワークアウトは時刻降順で並ぶ', () => {
    const workouts = [
      {
        id: 2,
        date: '2025-10-11',
        createdAt: '2025-10-11T14:00:00Z',
        exercise: 'Run2',
      },
      {
        id: 1,
        date: '2025-10-11',
        createdAt: '2025-10-11T09:00:00Z',
        exercise: 'Run1',
      },
      {
        id: 3,
        date: '2025-10-11',
        createdAt: '2025-10-11T18:00:00Z',
        exercise: 'Run3',
      },
    ];

    const result = groupByDate(workouts);
    const oct11 = result['2025-10-11'];

    expect(oct11[0].id).toBe(3);
    expect(oct11[1].id).toBe(2);
    expect(oct11[2].id).toBe(1);
  });

  it('空配列を渡すと空オブジェクトを返す', () => {
    const workouts = [];
    const result = groupByDate(workouts);
    expect(result).toEqual({});
  });

  it('1件のワークアウトでも正しくグループ化される', () => {
    const workouts = [
      {
        id: 1,
        date: '2025-10-11',
        createdAt: '2025-10-11T10:00:00Z',
        exercise: 'ランニング',
      },
    ];

    const result = groupByDate(workouts);

    expect(result['2025-10-11']).toHaveLength(1);
    expect(result['2025-10-11'][0].id).toBe(1);
  });

  it('複数日にまたがるワークアウトが正しくグループ化される', () => {
    const workouts = [
      {
        id: 2,
        date: '2025-10-08',
        createdAt: '2025-10-08T10:00:00Z',
        exercise: 'Run2',
      },
      {
        id: 3,
        date: '2025-10-11',
        createdAt: '2025-10-11T10:00:00Z',
        exercise: 'Run3',
      },
      {
        id: 1,
        date: '2025-10-05',
        createdAt: '2025-10-05T10:00:00Z',
        exercise: 'Run1',
      },
    ];

    const result = groupByDate(workouts);
    console.log(result);
    const dateKeys = Object.keys(result);
    console.log(dateKeys);

    expect(dateKeys).toHaveLength(3);
    expect(result['2025-10-05'][0].id).toBe(1);
    expect(result['2025-10-08'][0].id).toBe(2);
    expect(result['2025-10-11'][0].id).toBe(3);
  });

  it('10件のみ処理される', () => {
    const workouts = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      date: '2025-10-10',
      createdAt: new Date(2025, 9, 10, 10, 14 - i).toISOString(),
      exercise: 'Run',
    }));

    const result = groupByDate(workouts);
    const workoutsDesc = Object.values(result).flat();

    expect(workoutsDesc.length).toBeLessThanOrEqual(10);

    if (workoutsDesc.length === 10) {
      expect(workoutsDesc[0].id).toBe(1);
      expect(workoutsDesc[9].id).toBe(10);
    }
  });
});
