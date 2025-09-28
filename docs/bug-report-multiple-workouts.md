# バグレポート：同日複数ワークアウトの処理問題

## 概要
FitTrackアプリケーションにおいて、1日に複数回のワークアウトを記録した際に、データの保存・表示・スコア計算の各層で不整合が発生する致命的なバグを発見しました。

**報告日**: 2025-09-28
**重要度**: 🔴 **Critical** - ユーザーの運動記録とスコア計算の信頼性に直接影響
**影響範囲**: 全ユーザー

## 発見されたバグ

### Bug #1: ワークアウト履歴表示の上書き問題

#### 症状
- 1日に同じ種類のエクササイズを複数回行った場合、履歴画面には最後の1回分のみが表示される
- 例：朝にランニング30分、夕方にランニング20分を記録 → 履歴には20分のみ表示

#### 発生箇所
```
ファイル: frontend/src/services/TransformWorkoutData.js
行番号: 23-26（cardio）, 35（strength）
```

#### 問題のコード
```javascript
// 有酸素運動の場合
acc[dateKey].exercises[workout.exercise] = {
  distance: workout.distance,
  duration: workout.duration,
};

// 筋力トレーニングの場合
acc[dateKey].exercises[workout.exercise] = exerciseData;
```

#### 原因
- オブジェクトのキーに同じエクササイズ名を使用しているため、後から来たデータで上書きされる
- 累積処理やデータの配列化が実装されていない

#### 影響
- ユーザーが実際の運動量を正確に把握できない
- 運動履歴の信頼性が失われる

---

### Bug #2: Insightスコアが再計算されない問題

#### 症状
- 新しいワークアウトを追加してもInsightスコアが変化しない
- 初回計算後、その日のスコアが固定される

#### 発生箇所
```
ファイル: backend/routes/insightRoutes.js
行番号: 30-57
```

#### 問題のコード
```javascript
let insight = await Insight.findOne({
  where: { userId, date: today },
});

// データがなければ新規計算
if (!insight) {
  // 計算処理...
  insight = await Insight.create({...});
}
// 既存データがあれば何もしない（再計算しない）
```

#### 原因
- 既存のInsightレコードが存在する場合、再計算をスキップする設計
- ワークアウトが追加/更新されてもInsightの更新トリガーがない

#### 影響
- WHO基準の達成状況が正しく反映されない
- ユーザーのモチベーション低下（努力が数値に反映されない）
- 健康改善の進捗が正確に測定できない

---

### Bug #3: データ不整合の問題

#### 症状
- データベースには複数のワークアウトが正しく保存されている
- ダッシュボードのweeklyStatsは累積値を表示（正常）
- 履歴画面では最後の1件のみ表示（異常）
- Insightスコアは初回値から変化しない（異常）

#### 確認結果
```sql
-- データベース確認結果
SELECT "userID", date, exercise, "exerciseType"
FROM workouts
WHERE "userID" = 1 AND date = '2025-09-28';

-- 結果: 2件のワークアウトが正しく保存されている
userID | date       | exercise   | exerciseType
1      | 2025-09-28 | ランニング | cardio
1      | 2025-09-28 | 腕立て伏せ | strength
```

#### 原因
- 各層（DB、API、フロントエンド）で異なるデータ処理ロジック
- 統一されたデータ集計ポリシーの欠如

---

## 再現手順

### Bug #1の再現
1. アプリケーションにログイン
2. ワークアウトフォームから「ランニング」30分を記録
3. 同じ日に再度「ランニング」20分を記録
4. ワークアウト履歴を確認
5. **結果**: 20分のみ表示される（期待値: 両方または合計50分）

### Bug #2の再現
1. アプリケーションにログイン
2. Insightページで現在のスコアを確認（例: 30点）
3. 新しいワークアウトを追加（有酸素運動30分）
4. Insightページを再読み込み
5. **結果**: スコアが30点のまま変化しない

---

## 技術的詳細

### データフロー分析

```
[ユーザー入力]
    ↓
[POST /api/workouts] → ✅ 正常: 新規レコード作成
    ↓
[データベース] → ✅ 正常: 複数レコード保存
    ↓
[GET /api/workouts/monthly] → ✅ 正常: 全レコード取得
    ↓
[TransformWorkoutData] → ❌ バグ: データ上書き
    ↓
[WorkoutHistoryTable] → ❌ 影響: 最後の1件のみ表示

[GET /api/insights/current]
    ↓
[Insight.findOne] → ❌ バグ: 既存レコードで再計算スキップ
    ↓
[レスポンス] → ❌ 影響: 古いスコアを返却
```

### スコア計算エンジンの動作

```javascript
// CardioMetricsCalculator.js - 正常に動作
cardioWorkouts.forEach(({ date, duration = 0 }) => {
  const minutes = Math.floor(validDuration / 60);
  byDay[date] = (byDay[date] || 0) + minutes; // ✅ 累積処理
});
```

計算ロジック自体は正しく実装されているが、APIレベルで再計算がトリガーされない。

---

## 影響分析

### ユーザーへの影響
- **データの信頼性低下**: 実際の運動量と表示が一致しない
- **モチベーション低下**: 努力が数値に反映されない
- **健康管理の妨げ**: WHO基準達成の正確な判定ができない

### ビジネスへの影響
- **ユーザー離脱リスク**: アプリの基本機能が正しく動作しない
- **データ分析の信頼性**: 集計データが不正確
- **サポート負荷増加**: バグに関する問い合わせ増加の可能性

---

## 修正方針

### 短期修正（緊急対応）

#### 1. TransformWorkoutData.jsの修正
```javascript
// 修正案: 同じエクササイズを累積または配列化
if (workout.exerciseType === 'cardio') {
  const exerciseName = workout.exercise;

  if (!acc[dateKey].exercises[exerciseName]) {
    acc[dateKey].exercises[exerciseName] = {
      sessions: [],
      totalDistance: 0,
      totalDuration: 0,
    };
  }

  acc[dateKey].exercises[exerciseName].sessions.push({
    distance: workout.distance,
    duration: workout.duration,
  });
  acc[dateKey].exercises[exerciseName].totalDistance += workout.distance;
  acc[dateKey].exercises[exerciseName].totalDuration += workout.duration;
  acc[dateKey].totalTime += workout.duration || 0;
}
```

#### 2. insightRoutes.jsの修正
```javascript
router.get('/current', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const today = DateHelper.format(new Date());
  const weekBounds = DateHelper.getWeekBounds(new Date());

  try {
    // 常に最新のworkoutsデータを取得
    const workouts = await Workout.findAll({
      where: {
        userID: userId,
        date: { [Op.between]: [weekBounds.startString, weekBounds.endString] },
      },
    });

    // 常に再計算
    const result = engine.calculateWeeklyInsight(workouts);

    // 既存レコードを更新または新規作成
    const [insight, created] = await Insight.upsert({
      userId,
      date: today,
      totalScore: result.score.total,
      cardioScore: result.score.cardio,
      strengthScore: result.score.strength,
      whoCardioAchieved: result.achievements.cardio,
      whoStrengthAchieved: result.achievements.strength,
      metrics: result.metrics,
      calculationVersion: result.version,
    }, {
      where: { userId, date: today }
    });

    // レスポンス返却
    res.json({...});
  } catch (error) {
    // エラーハンドリング
  }
});
```

### 中長期修正（根本対応）

1. **イベント駆動アーキテクチャの導入**
   - ワークアウト追加時にInsight再計算をトリガー
   - WebSocketでリアルタイム更新

2. **データ集計ポリシーの統一**
   - 同日複数ワークアウトの扱いを明確に定義
   - 全層で同じ集計ロジックを使用

3. **キャッシュ戦略の実装**
   - Insightデータのキャッシュと無効化ルール
   - パフォーマンスとデータ整合性のバランス

---

## テスト計画

### ユニットテスト追加
```javascript
describe('TransformWorkoutData', () => {
  it('同日の同じエクササイズを複数回記録した場合、累積される', () => {
    const input = [
      { date: '2025-09-28', exercise: 'ランニング', duration: 30, distance: 5 },
      { date: '2025-09-28', exercise: 'ランニング', duration: 20, distance: 3 },
    ];
    const result = transformWorkoutData(input);
    expect(result[0].exercises['ランニング'].totalDuration).toBe(50);
    expect(result[0].exercises['ランニング'].totalDistance).toBe(8);
  });
});
```

### 統合テスト
1. 複数ワークアウト登録 → 履歴確認
2. ワークアウト追加 → Insightスコア更新確認
3. 日付変更 → 新規Insight作成確認

### 回帰テスト
- 既存機能への影響確認
- パフォーマンステスト（大量データでの動作確認）

---

## 推奨対応優先度

1. **🔴 最優先**: insightRoutes.jsの修正（スコア再計算）
   - ユーザーの信頼に直結
   - 修正工数: 小

2. **🟡 高優先**: TransformWorkoutData.jsの修正（履歴表示）
   - UX改善に重要
   - 修正工数: 中

3. **🟢 中優先**: テストコード追加
   - 今後の品質保証
   - 修正工数: 中

---

## 関連ファイル

### バックエンド
- `/backend/routes/insightRoutes.js`
- `/backend/routes/workouts.js`
- `/backend/services/smallWins/metrics/CardioMetricsCalculator.js`
- `/backend/services/smallWins/metrics/StrengthMetricsCalculator.js`

### フロントエンド
- `/frontend/src/services/TransformWorkoutData.js`
- `/frontend/src/components/WorkoutHistoryTable.jsx`
- `/frontend/src/hooks/useInsights.js`

---

## まとめ

このバグは、アプリケーションの信頼性に関わる重要な問題です。特に健康管理アプリケーションにおいて、データの正確性は最も重要な要素の一つです。

早急な修正により、ユーザーの信頼を維持し、正確な健康管理をサポートできるようになります。

---

**レポート作成者**: Claude Code
**最終更新**: 2025-09-28