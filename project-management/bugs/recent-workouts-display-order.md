# バグレポート：最近のワークアウト表示順序の問題

## 概要
FitTrackアプリケーションのダッシュボードにおいて、「最近のワークアウト」アコーディオンが降順（最新→最古）で表示されず、ユーザーが最新のワークアウトを確認しにくい状態になっています。

**報告日**: 2025-10-12
**重要度**: 🟡 **High** - ユーザー体験の核心機能に影響
**影響範囲**: 全ユーザー
**ステータス**: 修正計画立案済み（ブランチ: `002-recentworkoutsaccordin`）

## 発見されたバグ

### Bug #1: ワークアウト日付が降順でソートされていない

#### 症状
- 最近のワークアウトアコーディオンを開いたとき、日付グループが時系列順（降順）で表示されない
- 例：10月5日、8日、11日にワークアウトを記録 → アコーディオンでは挿入順やランダムな順序で表示される
- ユーザーは最新のワークアウトを見つけるためにスクロールして探す必要がある

#### 発生箇所
```
ファイル: frontend/src/components/Dashboard/RecentWorkoutsAccordion.jsx
行番号: 46
```

#### 問題のコード
```javascript
// 現在の実装（46行目）
Object.entries(groupedWorkouts).map(([date, dateWorkouts]) => (
  <Box key={date} mb={2}>
    <Typography variant="subtitle1" fontWeight="bold">
      {date}
    </Typography>
    // ...
  </Box>
))
```

#### 原因
- `Object.entries(groupedWorkouts)` がソートされていない
- JavaScript のオブジェクトは挿入順序を保持するが、`groupByDate` 関数からの返却値は日付順序を保証していない
- 結果として、日付グループがソートされずに表示される

#### 影響
- **UX の低下**: ユーザーは「最近」のワークアウトを期待しているが、最新のものが最初に表示されない
- **認知負荷の増加**: ユーザーが日付を目視で探す必要がある
- **機能の不信感**: 「直近のログを見る」という UI テキストと実際の動作が一致しない

---

### Bug #2: 最新10件のワークアウトが正しく選択されていない

#### 症状
- `groupByDate` 関数が、ソートせずに配列の最初の10件を取得している
- データベースやAPIからの返却順序に依存しており、必ずしも最新の10件ではない
- 例：データが古い順で返ってきた場合、最も古い10件が表示される

#### 発生箇所
```
ファイル: frontend/src/services/workoutGrouping.js
行番号: 12
```

#### 問題のコード
```javascript
export const groupByDate = (workouts) => {
  const grouped = {};

  // ❌ ソートせずに最初の10件を取得
  workouts.slice(0, 10).forEach(workout => {
    const dateKey = dayjs(workout.date).format('YYYY-MM-DD');

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(workout);
  });

  return grouped;
};
```

#### 原因
- `workouts.slice(0, 10)` の前に `createdAt` でソートしていない
- データソース（API、データベース）の返却順序に依存している
- 「最新10件」という要件が実装されていない

#### 影響
- **データの不正確性**: ユーザーが期待する「最近の10件」が表示されない可能性
- **古いデータの表示**: 最新のワークアウトが10件以内に表示されない場合がある
- **機能仕様との不一致**: FR-002 (最新の10件を表示) が満たされていない

---

### Bug #3: 同じ日付内のワークアウトが時刻順でソートされていない（潜在的問題）

#### 症状
- 1日に複数のワークアウトを記録した場合、それらが時刻順（降順）で表示される保証がない
- `groupByDate` 関数で配列に追加される順序に依存している
- 例：09:00、14:30、18:00 に記録 → 受信順序によっては 09:00 → 14:30 → 18:00 と表示される可能性

#### 発生箇所
```
ファイル: frontend/src/services/workoutGrouping.js
行番号: 19
```

#### 問題のコード
```javascript
grouped[dateKey].push(workout); // 受信順序でプッシュ
```

#### 原因
- `createdAt` でソートしてから `groupByDate` に渡していないため、同日のワークアウトの順序が保証されない
- 時刻表示 `[HH:mm]` は正しく表示されるが、順序が逆転する可能性がある

#### 影響
- **時系列の混乱**: ユーザーが1日のトレーニングシーケンスを把握しにくい
- **一貫性の欠如**: 日付レベルでは降順を期待するのに、時刻レベルでは昇順になる可能性

---

## 再現手順

### Bug #1 の再現（日付順序）
1. アプリケーションにログイン
2. 10月5日、10月8日、10月11日に異なるワークアウトを記録
3. ダッシュボードの「直近のログを見る（10件）」アコーディオンを開く
4. **期待値**: 10月11日 → 10月8日 → 10月5日 の順序で表示
5. **実際の結果**: ランダムな順序、または挿入順序で表示される

### Bug #2 の再現（10件制限）
1. 15件以上のワークアウトを記録（異なる日付で）
2. データが古い順でソートされた状態でAPIから返却される場合
3. ダッシュボードの「直近のログを見る（10件）」アコーディオンを開く
4. **期待値**: 最新の10件が表示される
5. **実際の結果**: 最初の10件（最も古い10件）が表示される

### Bug #3 の再現（同日時刻順序）
1. 同じ日に09:00、14:30、18:00 に3つのワークアウトを記録
2. ダッシュボードのアコーディオンを開く
3. その日付グループを確認
4. **期待値**: [18:00] → [14:30] → [09:00] の順序
5. **実際の結果**: 受信順序に依存（時刻の降順が保証されない）

---

## 技術的詳細

### データフロー分析

```
[データベース/API]
    ↓
[workouts配列を取得] → ❌ ソートされていない可能性
    ↓
[groupByDate関数]
    ↓
[workouts.slice(0, 10)] → ❌ Bug #2: ソートせずに最初の10件
    ↓
[forEach でグループ化] → ⚠️ Bug #3: 受信順序で配列に追加
    ↓
[grouped オブジェクト返却] → 日付キーは挿入順
    ↓
[RecentWorkoutsAccordion]
    ↓
[Object.entries(grouped)] → ❌ Bug #1: ソートされていない
    ↓
[map で描画] → 問題のある順序で表示
```

### 根本原因の分析

#### 1. ソート処理の欠如
```javascript
// 現在: ソートなし
workouts.slice(0, 10).forEach(...)

// 必要な処理:
const sortedWorkouts = [...workouts]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 10);
```

#### 2. 日付グループのソート欠如
```javascript
// 現在: ソートなし
Object.entries(groupedWorkouts).map(...)

// 必要な処理:
Object.entries(groupedWorkouts)
  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
  .map(...)
```

### パフォーマンスへの影響

**現在の計算量**:
- `groupByDate`: O(n) - n は workouts 配列のサイズ（最大10）
- レンダリング: O(m) - m は日付グループの数（最大10）

**修正後の計算量**:
- `groupByDate`: O(n log n) - ソート追加
- レンダリング: O(m log m) - 日付グループのソート追加
- **影響**: n, m ともに最大10なので、パフォーマンスへの影響は無視できる（<1ms）

### useMemo 最適化の保持

```javascript
// 既存のパフォーマンス最適化は維持される
const groupedWorkouts = useMemo(() => {
  return groupByDate(workouts);
}, [workouts]);
```

ソート処理を追加しても `useMemo` による最適化は有効で、`workouts` が変更されない限り再計算されない。

---

## 影響分析

### ユーザーへの影響
- **UX の低下**: 最新のワークアウトを見つけるために余分な認知負荷
- **混乱**: 「直近のログ」という表示と実際の動作の不一致
- **信頼性の低下**: 日付順序が一貫していないことによる不信感
- **モチベーション低下**: 最新の成果がすぐに確認できない

### ビジネスへの影響
- **エンゲージメント低下**: ダッシュボードが直感的でないため、使用頻度が減少する可能性
- **サポート負荷**: 「最新のワークアウトが見つからない」という問い合わせの増加
- **競合との差**: 他のフィットネスアプリでは当然の機能が実装されていない

### 開発への影響
- **技術的負債**: 基本的なソート処理が欠如している
- **テストカバレッジの欠如**: ソート順序を検証するテストがない
- **仕様と実装の乖離**: 「最近の10件」という要件が満たされていない

---

## 修正方針

### 短期修正（緊急対応）

#### 1. `groupByDate` 関数の修正（Bug #2, #3 対応）
**ファイル**: `frontend/src/services/workoutGrouping.js`

```javascript
export const groupByDate = (workouts) => {
  const grouped = {};

  // ✅ 修正: createdAt でソートしてから最新10件を取得
  const sortedWorkouts = [...workouts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  sortedWorkouts.forEach(workout => {
    const dateKey = dayjs(workout.date).format('YYYY-MM-DD');

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(workout);
  });

  return grouped;
};
```

**効果**:
- 最新の10件のワークアウトが正しく選択される（Bug #2 解決）
- 同じ日付内のワークアウトも `createdAt` 順で配列に追加される（Bug #3 解決）

#### 2. `RecentWorkoutsAccordion` コンポーネントの修正（Bug #1 対応）
**ファイル**: `frontend/src/components/Dashboard/RecentWorkoutsAccordion.jsx`

```javascript
// 46行目を修正
Object.entries(groupedWorkouts)
  // ✅ 修正: 日付の降順でソート
  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
  .map(([date, dateWorkouts]) => (
    <Box key={date} mb={2}>
      <Typography variant="subtitle1" fontWeight="bold">
        {date}
      </Typography>
      <List>
        {dateWorkouts.map(workout => (
          <ListItem key={workout.id} disableGutters>
            {/* 既存のコード */}
          </ListItem>
        ))}
      </List>
    </Box>
  ))
```

**効果**:
- 日付グループが最新から最古へ降順で表示される（Bug #1 解決）
- ユーザーは最新のワークアウトを一番上で確認できる

### 中長期修正（品質向上）

#### 1. ユニットテストの追加
**ファイル**: `frontend/tests/unit/workoutGrouping.test.js`

```javascript
import { groupByDate } from '@/services/workoutGrouping';

describe('groupByDate', () => {
  it('最新の10件のワークアウトを選択する', () => {
    const workouts = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      date: '2025-10-10',
      createdAt: new Date(2025, 9, 10, 10, i).toISOString(),
      exercise: 'ランニング',
    }));

    const result = groupByDate(workouts);
    const flatWorkouts = Object.values(result).flat();

    expect(flatWorkouts).toHaveLength(10);
    expect(flatWorkouts[0].id).toBe(15); // 最新
    expect(flatWorkouts[9].id).toBe(6);  // 10番目に新しい
  });

  it('日付グループ内でワークアウトが createdAt 降順になる', () => {
    const workouts = [
      { id: 1, date: '2025-10-11', createdAt: '2025-10-11T09:00:00Z', exercise: 'Run1' },
      { id: 2, date: '2025-10-11', createdAt: '2025-10-11T18:00:00Z', exercise: 'Run2' },
      { id: 3, date: '2025-10-11', createdAt: '2025-10-11T14:30:00Z', exercise: 'Run3' },
    ];

    const result = groupByDate(workouts);
    const oct11 = result['2025-10-11'];

    expect(oct11[0].id).toBe(2); // 18:00 が最初
    expect(oct11[1].id).toBe(3); // 14:30 が2番目
    expect(oct11[2].id).toBe(1); // 09:00 が3番目
  });
});
```

#### 2. コンポーネントテストの追加
**ファイル**: `frontend/src/test/components/Dashboard/RecentWorkoutsAccordion.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import RecentWorkoutsAccordion from '@/components/Dashboard/RecentWorkoutsAccordion';

describe('RecentWorkoutsAccordion', () => {
  it('日付が降順で表示される', () => {
    const workouts = [
      { id: 1, date: '2025-10-05', createdAt: '2025-10-05T10:00:00Z', exercise: 'ランニング', exerciseType: 'cardio', distance: 5, duration: 30 },
      { id: 2, date: '2025-10-08', createdAt: '2025-10-08T10:00:00Z', exercise: 'スクワット', exerciseType: 'strength', sets: 3 },
      { id: 3, date: '2025-10-11', createdAt: '2025-10-11T10:00:00Z', exercise: 'サイクリング', exerciseType: 'cardio', distance: 10, duration: 45 },
    ];

    render(<RecentWorkoutsAccordion workouts={workouts} />);

    const dates = screen.getAllByRole('heading', { level: 6 }).map(el => el.textContent);
    expect(dates[0]).toBe('2025-10-11'); // 最新が最初
    expect(dates[1]).toBe('2025-10-08');
    expect(dates[2]).toBe('2025-10-05');
  });
});
```

#### 3. エッジケーステストの追加

```javascript
describe('Edge cases', () => {
  it('ワークアウトが0件の場合、空のオブジェクトを返す', () => {
    const result = groupByDate([]);
    expect(result).toEqual({});
  });

  it('ワークアウトが1件の場合、正しくグループ化される', () => {
    const workouts = [{ id: 1, date: '2025-10-11', createdAt: '2025-10-11T10:00:00Z' }];
    const result = groupByDate(workouts);
    expect(result['2025-10-11']).toHaveLength(1);
  });

  it('すべて同じ日付の場合、単一のグループにまとまる', () => {
    const workouts = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      date: '2025-10-11',
      createdAt: new Date(2025, 9, 11, 10, i).toISOString(),
    }));

    const result = groupByDate(workouts);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['2025-10-11']).toHaveLength(10);
  });

  it('同一 createdAt の場合、安定したソートになる', () => {
    const workouts = [
      { id: 1, date: '2025-10-11', createdAt: '2025-10-11T10:00:00Z', exercise: 'A' },
      { id: 2, date: '2025-10-11', createdAt: '2025-10-11T10:00:00Z', exercise: 'B' },
    ];

    // エラーが発生しないことを確認
    expect(() => groupByDate(workouts)).not.toThrow();
  });
});
```

#### 4. パフォーマンステスト

```javascript
describe('Performance', () => {
  it('大量のワークアウトでも150ms以内で処理される', () => {
    const workouts = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      date: '2025-10-11',
      createdAt: new Date(2025, 9, 11, 10, i).toISOString(),
      exercise: 'ランニング',
    }));

    const start = performance.now();
    groupByDate(workouts);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(150);
  });
});
```

---

## テスト計画

### TDD (Test-Driven Development) アプローチ

#### フェーズ1: Red（テストを書いて失敗を確認）
1. ✅ `groupByDate` のユニットテストを作成
2. ✅ `RecentWorkoutsAccordion` のコンポーネントテストを作成
3. ✅ テストを実行して失敗することを確認（バグの存在確認）

#### フェーズ2: Green（最小限の実装でテストを通過）
1. ✅ `groupByDate` に `createdAt` ソートと `slice(0, 10)` を実装
2. ✅ `RecentWorkoutsAccordion` に日付グループのソートを実装
3. ✅ テストを実行して成功することを確認

#### フェーズ3: Refactor（リファクタリングと最適化）
1. ✅ パフォーマンステストの実施
2. ✅ エッジケースの網羅
3. ✅ コードレビューとクリーンアップ

### 手動テスト計画

#### テストケース1: 基本的な日付順序
**前提**:
- 10月5日、8日、11日にワークアウトを記録

**手順**:
1. ダッシュボードを開く
2. 「直近のログを見る（10件）」アコーディオンをクリック

**期待結果**:
- 日付が「2025-10-11」→「2025-10-08」→「2025-10-05」の順で表示される

#### テストケース2: 同日複数ワークアウト
**前提**:
- 10月11日の09:00、14:30、18:00 に3つのワークアウトを記録

**手順**:
1. アコーディオンを開く
2. 10月11日のグループを確認

**期待結果**:
- [18:00]、[14:30]、[09:00] の順でワークアウトが表示される

#### テストケース3: 11件以上のワークアウト
**前提**:
- 15件のワークアウトを異なる日付で記録

**手順**:
1. アコーディオンを開く
2. 表示されるワークアウトの数を確認

**期待結果**:
- 最新の10件のみが表示される
- 最も古い5件は表示されない

#### テストケース4: 空の状態
**前提**:
- ワークアウトが0件

**手順**:
1. アコーディオンを開く

**期待結果**:
- 「まだワークアウト記録がありません」メッセージが表示される

---

## 推奨対応優先度

### 🔴 最優先: Bug #1 と Bug #2 の修正
- **工数**: 2時間（実装30分 + テスト1.5時間）
- **影響**: ユーザー体験の即時改善
- **リスク**: 低（既存機能への影響なし）

**タスク**:
1. `workoutGrouping.js` に `createdAt` ソートを追加
2. `RecentWorkoutsAccordion.jsx` に日付グループソートを追加
3. ユニットテストを作成
4. コンポーネントテストを作成
5. 手動テストで確認

### 🟡 高優先: テストカバレッジの向上
- **工数**: 1時間
- **影響**: 今後の品質保証、回帰バグの防止
- **リスク**: なし

**タスク**:
1. エッジケーステストの追加
2. パフォーマンステストの追加
3. カバレッジ80%以上を確認

### 🟢 中優先: ドキュメント更新
- **工数**: 30分
- **影響**: 開発者体験の向上
- **リスク**: なし

**タスク**:
1. `workoutGrouping.js` の JSDoc を更新（ソート仕様を明記）
2. コンポーネントの Props ドキュメントを更新
3. quickstart.md に手動テスト手順を追加

---

## 関連ファイル

### フロントエンド - 修正対象
- ✅ `/frontend/src/services/workoutGrouping.js` - `groupByDate` 関数の修正
- ✅ `/frontend/src/components/Dashboard/RecentWorkoutsAccordion.jsx` - 日付グループソートの追加

### テストファイル - 新規作成
- 📝 `/frontend/tests/unit/workoutGrouping.test.js` - ユニットテスト
- 📝 `/frontend/src/test/components/Dashboard/RecentWorkoutsAccordion.test.jsx` - コンポーネントテスト

### 関連仕様書
- 📄 `/specs/002-recentworkoutsaccordin/spec.md` - 機能仕様
- 📄 `/specs/002-recentworkoutsaccordin/tasks.md` - タスク一覧（30タスク）
- 📄 `/specs/002-recentworkoutsaccordin/quickstart.md` - クイックスタートガイド

---

## 影響を受けないコンポーネント

以下のコンポーネントは `groupByDate` を使用していないため、影響を受けません:

- ✅ `Dashboard.jsx` - `groupedWorkouts` の受け取り側なので変更不要
- ✅ `WeeklyStats.jsx` - 独立した週次統計ロジック
- ✅ `WorkoutForm.jsx` - ワークアウト登録フォーム
- ✅ `InsightPanel.jsx` - スコア表示パネル

---

## まとめ

このバグは、基本的なソート処理の欠如によって発生しており、修正は比較的シンプルです。しかし、ユーザー体験に直接影響する重要な問題です。

**修正のポイント**:
1. ✅ `createdAt` でソートしてから最新10件を選択
2. ✅ 日付グループを降順でソート
3. ✅ TDDアプローチでテストを先に書く
4. ✅ エッジケースを網羅的にテスト

**期待される効果**:
- ユーザーは最新のワークアウトをすぐに確認できる
- 「直近のログを見る」という UI と実際の動作が一致する
- データの信頼性が向上する
- テストカバレッジによる品質保証

**修正後の検証**:
- ユニットテスト: ソートロジックの正確性
- コンポーネントテスト: UI の視覚的順序
- 手動テスト: 実際のユーザーフローでの確認
- パフォーマンステスト: 処理速度の劣化がないことを確認

---

**関連ブランチ**: `002-recentworkoutsaccordin`
**関連PR**: （修正完了後に作成予定）
**レポート作成者**: Claude Code
**最終更新**: 2025-10-12
