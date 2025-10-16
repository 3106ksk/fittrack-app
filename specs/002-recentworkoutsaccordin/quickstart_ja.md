# クイックスタートガイド: 最近のワークアウト表示順序バグ修正

**機能**: 002-recentworkoutsaccordin
**対象**: 開発者向け実装・テストガイド
**作成日**: 2025-10-12

## 前提条件

- Node.js 16+ と npm がインストール済み
- Git ブランチ `002-recentworkoutsaccordin` がチェックアウト済み
- フロントエンド依存関係がインストール済み (`cd frontend && npm install`)

## クイック概要

**内容**: 最近のワークアウトが降順の時系列順で表示されない表示順序バグの修正
**対象箇所**: 2ファイル - `workoutGrouping.js`（サービス）と `RecentWorkoutsAccordion.jsx`（コンポーネント）
**所要時間**: 30-45分（実装 + テスト）

## 実装手順

### ステップ 1: `groupByDate` 関数の修正（5分）

**ファイル**: `frontend/src/services/workoutGrouping.js`

**変更**: グループ化前にソートを追加

```javascript
export const groupByDate = (workouts) => {
  const grouped = {};

  // ✅ 新規: createdAtで降順ソート後、最新10件を取得
  const sortedWorkouts = [...workouts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  sortedWorkouts.forEach(workout => {  // ✅ 変更: workouts.slice(0, 10)の代わりにsortedWorkoutsを使用
    const dateKey = dayjs(workout.date).format('YYYY-MM-DD');

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(workout);
  });

  return grouped;
};
```

**変更内容**:
1. ワークアウト配列のシャローコピーを作成: `[...workouts]`
2. `createdAt`で降順ソート: `(b, a) => new Date(b.createdAt) - new Date(a.createdAt)`
3. 最初の10アイテムを取得: `.slice(0, 10)`
4. forEachループで `sortedWorkouts` を使用

### ステップ 2: コンポーネントレンダリングの修正（5分）

**ファイル**: `frontend/src/components/Dashboard/RecentWorkoutsAccordion.jsx`

**変更**: Object.entries()に日付ソートを追加

**このコードを探す**（46行目付近）:
```javascript
Object.entries(groupedWorkouts).map(([date, dateWorkouts]) => (
  <Box key={date} mb={2}>
```

**次のように置き換える**:
```javascript
Object.entries(groupedWorkouts)
  .sort((a, b) => new Date(b[0]) - new Date(a[0]))  // ✅ 新規: 日付キーを降順ソート
  .map(([date, dateWorkouts]) => (
    <Box key={date} mb={2}>
```

**変更内容**:
- `.map()`の前に `.sort((a, b) => new Date(b[0]) - new Date(a[0]))` を追加
- `a[0]` と `b[0]` は日付キー（エントリタプルの最初の要素）
- 降順（b - a）で最新の日付を最初に表示

### ステップ 3: 単体テストの作成（15分）

**ファイル**: `frontend/tests/unit/workoutGrouping.test.js`（新規作成）

```javascript
import { describe, it, expect } from 'vitest';
import { groupByDate } from '../../src/services/workoutGrouping';

describe('groupByDate', () => {
  it('groupByDateはグループ化前にcreatedAtでソートすべき', () => {
    const workouts = [
      { id: 1, date: '2025-10-05', createdAt: '2025-10-05T16:00:00Z', exercise: '古い' },
      { id: 3, date: '2025-10-11', createdAt: '2025-10-11T18:00:00Z', exercise: '最新' },
      { id: 2, date: '2025-10-08', createdAt: '2025-10-08T12:00:00Z', exercise: '中間' },
    ];

    const grouped = groupByDate(workouts);

    // 3件のワークアウトすべてを含むべき
    const allWorkouts = Object.values(grouped).flat();
    expect(allWorkouts).toHaveLength(3);

    // 3つの日付グループを持つべき
    expect(Object.keys(grouped)).toHaveLength(3);
  });

  it('最新10件のワークアウトに制限すべき', () => {
    const workouts = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      date: `2025-10-${String(15 - i).padStart(2, '0')}`,
      createdAt: `2025-10-${String(15 - i).padStart(2, '0')}T12:00:00Z`,
      exercise: `ワークアウト ${i + 1}`,
    }));

    const grouped = groupByDate(workouts);

    const allWorkouts = Object.values(grouped).flat();
    expect(allWorkouts).toHaveLength(10);

    // 最新10件を持つべき（10月15日 → 10月6日）
    expect(allWorkouts[0].date).toBe('2025-10-15');
    expect(allWorkouts[9].date).toBe('2025-10-06');
  });

  it('空入力に対して空オブジェクトを返すべき', () => {
    const grouped = groupByDate([]);
    expect(grouped).toEqual({});
  });

  it('単一ワークアウトを処理すべき', () => {
    const workouts = [
      { id: 1, date: '2025-10-11', createdAt: '2025-10-11T10:00:00Z', exercise: 'ランニング' }
    ];

    const grouped = groupByDate(workouts);

    expect(Object.keys(grouped)).toEqual(['2025-10-11']);
    expect(grouped['2025-10-11']).toHaveLength(1);
  });
});
```

**テスト実行**:
```bash
cd frontend
npm run test workoutGrouping.test.js
```

### ステップ 4: コンポーネントテストの作成（15分）

**ファイル**: `frontend/src/test/components/Dashboard/RecentWorkoutsAccordion.test.jsx`（新規作成）

**最初にディレクトリを作成**:
```bash
mkdir -p frontend/src/test/components/Dashboard
```

**テストファイル**:
```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecentWorkoutsAccordion from '../../../components/Dashboard/RecentWorkoutsAccordion';

describe('RecentWorkoutsAccordion', () => {
  it('日付を降順で表示すべき', () => {
    const mockWorkouts = [
      { id: 1, date: '2025-10-05', createdAt: '2025-10-05T16:00:00Z', exerciseType: 'cardio', exercise: 'ランニング', distance: 5, duration: 30 },
      { id: 2, date: '2025-10-08', createdAt: '2025-10-08T12:00:00Z', exerciseType: 'cardio', exercise: 'サイクリング', distance: 10, duration: 45 },
      { id: 3, date: '2025-10-11', createdAt: '2025-10-11T18:00:00Z', exerciseType: 'cardio', exercise: 'ランニング', distance: 3, duration: 20 },
    ];

    render(<RecentWorkoutsAccordion workouts={mockWorkouts} />);

    const dateElements = screen.getAllByText(/2025-10-\d{2}/);

    // 日付は降順で表示されるべき
    expect(dateElements[0].textContent).toBe('2025-10-11');
    expect(dateElements[1].textContent).toBe('2025-10-08');
    expect(dateElements[2].textContent).toBe('2025-10-05');
  });

  it('ワークアウトがないとき空状態を表示すべき', () => {
    render(<RecentWorkoutsAccordion workouts={[]} />);

    expect(screen.getByText('まだワークアウト記録がありません')).toBeInTheDocument();
  });

  it('同日のワークアウトに対してタイムスタンプを降順で表示すべき', () => {
    const mockWorkouts = [
      { id: 1, date: '2025-10-11', createdAt: '2025-10-11T09:00:00Z', exerciseType: 'cardio', exercise: '朝ラン', distance: 5, duration: 30 },
      { id: 2, date: '2025-10-11', createdAt: '2025-10-11T18:00:00Z', exerciseType: 'cardio', exercise: '夕ラン', distance: 3, duration: 20 },
      { id: 3, date: '2025-10-11', createdAt: '2025-10-11T14:30:00Z', exerciseType: 'cardio', exercise: '午後ラン', distance: 4, duration: 25 },
    ];

    render(<RecentWorkoutsAccordion workouts={mockWorkouts} />);

    // 同日に複数ワークアウトがあるためタイムスタンプを表示すべき
    expect(screen.getByText('[18:00]')).toBeInTheDocument();
    expect(screen.getByText('[14:30]')).toBeInTheDocument();
    expect(screen.getByText('[09:00]')).toBeInTheDocument();

    // 対応する運動を表示すべき
    expect(screen.getByText(/夕ラン/)).toBeInTheDocument();
    expect(screen.getByText(/午後ラン/)).toBeInTheDocument();
    expect(screen.getByText(/朝ラン/)).toBeInTheDocument();
  });
});
```

**テスト実行**:
```bash
npm run test RecentWorkoutsAccordion.test.jsx
```

## 手動テストチェックリスト

### テストケース 1: 複数の日付（P1）

1. **準備**: 異なる日付に3つ以上のワークアウトを作成（例：10月5日、8日、11日）
2. **操作**: ダッシュボードを開き、「直近のログを見る（10件）」アコーディオンを展開
3. **期待**: 日付が順序通りに表示：10月11日 → 10月8日 → 10月5日（最新が最初）

### テストケース 2: 同日の複数ワークアウト（P2）

1. **準備**: 同じ日付に異なる時刻で3件のワークアウトを作成（例：09:00、14:30、18:00）
2. **操作**: アコーディオンを開き、その日付グループを見つける
3. **期待**:
   - タイムスタンプ [18:00]、[14:30]、[09:00] が降順で表示
   - 対応する運動が正しい順序で表示

### テストケース 3: エッジケース

- **空状態**: すべてのワークアウトを削除 → 「まだワークアウト記録がありません」を表示すべき
- **単一ワークアウト**: 1件のワークアウトのみ → エラーなく表示すべき
- **10件以上のワークアウト**: 15件のワークアウトを作成 → 最新10件のみ表示すべき

## アプリケーションの実行

### 開発サーバー

```bash
# ターミナル 1: バックエンド
cd backend
npm run dev

# ターミナル 2: フロントエンド
cd frontend
npm run dev
```

### アプリケーションへのアクセス

- フロントエンド: http://localhost:5173
- デモアカウントでログイン（認証情報は `backend/seeders/` を参照）
- ダッシュボードに移動

## 検証スクリプト

```bash
# すべてのテストを実行
cd frontend
npm run test

# 特定のテストスイートを実行
npm run test workoutGrouping
npm run test RecentWorkoutsAccordion

# テストカバレッジを確認
npm run test:coverage
```

**期待される結果**:
- 既存のテストがすべて合格（リグレッションなし）
- 新しいテストが合格（4単体テスト + 3コンポーネントテスト）
- `workoutGrouping.js` と `RecentWorkoutsAccordion.jsx` のカバレッジ向上

## トラブルシューティング

### 問題: "Cannot find module dayjs"

**解決策**: dayjsがインストールされていることを確認:
```bash
cd frontend
npm install dayjs
```

### 問題: テストが "ReferenceError: groupByDate is not defined" で失敗

**解決策**: テストファイルのインポートパスを確認:
```javascript
import { groupByDate } from '../../src/services/workoutGrouping';
```

### 問題: コンポーネントテストがレンダリングに失敗

**解決策**: 不足しているテスト依存関係をインストール:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### 問題: 日付が依然として正しくソートされない

**解決策**: ブラウザキャッシュをクリアして更新。確認事項:
1. `groupByDate` がソートされたワークアウトを返す（確認のため console.log を追加）
2. コンポーネントが `Object.entries()` で `.sort()` を使用している

## 次のステップ

実装とテスト後:

1. `/speckit.tasks` を実行してタスク分解を生成
2. ブランチ `002-recentworkoutsaccordin` でPRを作成
3. PR説明にテスト結果と修正前後のスクリーンショットを含める
4. 以下に焦点を当ててコードレビューを依頼:
   - ソートロジックの正確性
   - テストカバレッジ（80%以上を目指す）
   - 既存機能のリグレッションなし

## 参考資料

- 仕様書: [spec.md](./spec.md)
- 調査資料: [research.md](./research.md)
- データモデル: [data-model.md](./data-model.md)
- 実装計画: [plan.md](./plan.md)
