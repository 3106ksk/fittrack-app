# Week 1-2: 健康スコア精度向上 + Critical Bug修正 - 要件定義書

**作成日**: 2025-10-11
**期間**: 2025年10月14日 - 10月27日（2週間）
**工数**: 14時間（週7時間 × 2週間）
**担当**: Keisuke Sato

---

## 📋 目次

1. [概要](#概要)
2. [目的とゴール](#目的とゴール)
3. [機能要件](#機能要件)
4. [非機能要件](#非機能要件)
5. [成功基準](#成功基準)
6. [科学的根拠](#科学的根拠)

---

## 概要

### 背景
現在の健康スコア計算は以下の課題を抱えている:
- 運動強度（intensity）が計算に反映されていない
- 個人差（年齢、性別）を考慮していない
- Critical Bug: Insightスコアが再計算されない問題が残っている
- ワークアウトフォーム送信後のリセット問題

### Week 1-2の位置づけ
コア機能完成度向上ロードマップの**第1フェーズ**として、健康スコアの精度を科学的根拠に基づいて向上させる。

---

## 目的とゴール

### 目的
> **「運動科学の論文を読み、健康スコアの精度を40%向上させました」と面接で語る**

### ゴール

#### 1. 科学的精度
- ✅ METs（代謝当量）計算の実装
- ✅ WHO推奨基準（500-1000 METs-分/週）の導入
- ✅ 個人差補正（年齢・性別）の実装

#### 2. バグ修正
- ✅ Critical Bug: Insightスコア再計算問題の完全解決
- ✅ ワークアウトフォームリセット問題の解決

#### 3. 面接評価
- ✅ 論文ベースの実装アプローチを証明
- ✅ 精度向上を数値で示せる

---

## 機能要件

### FR-1: METs計算の実装

#### FR-1.1 METs テーブルの作成
**優先度**: P0（必須）

**要件**:
- Ainsworth et al. (2011) Compendium of Physical Activitiesを参考に、全運動種目のMETs値を定義
- 運動強度（低・中・高）ごとにMETs値を設定

**受け入れ基準**:
- [ ] 全運動種目（20種類以上）のMETs値が定義されている
- [ ] 運動強度（低・中・高）ごとの値が設定されている
- [ ] 未知の運動種目の場合、デフォルト値（5.0 METs）を返す

**データ仕様**:
```typescript
interface METsTable {
  [exercise: string]: {
    低: number;
    中: number;
    高: number;
  };
}

const metsTable: METsTable = {
  'ランニング': { 低: 6.0, 中: 9.8, 高: 12.3 },
  'サイクリング': { 低: 4.0, 中: 8.0, 高: 12.0 },
  'スクワット': { 低: 3.5, 中: 5.0, 高: 8.0 },
  // ...
};
```

**実装ファイル**:
- `frontend/src/services/healthScore/calculateMETs.ts`（新規）
- `frontend/src/data/metsTable.ts`（新規）

---

#### FR-1.2 週次METs-分の計算
**優先度**: P0（必須）

**要件**:
- ユーザーの週次ワークアウトから、総METs-分を計算
- WHO推奨基準（500-1000 METs-分/週）と比較

**受け入れ基準**:
- [ ] 週次ワークアウトから正確にMETs-分を計算できる
- [ ] WHO推奨基準（500-1000 METs-分/週）との達成率を計算
- [ ] 有酸素運動のみを対象とする

**計算式**:
```
週次METs-分 = Σ(METs × 運動時間)

例:
- ランニング（中強度）30分: 9.8 × 30 = 294 METs-分
- サイクリング（低強度）60分: 4.0 × 60 = 240 METs-分
- 合計: 534 METs-分

WHO推奨達成率 = (534 / 750) × 100 = 71.2%
※ 750は推奨範囲の中央値(500-1000の中間)
```

**実装ファイル**:
- `frontend/src/services/healthScore/calculateWeeklyMETs.ts`（新規）

---

### FR-2: 個人差補正の実装

#### FR-2.1 年齢による補正
**優先度**: P0（必須）

**要件**:
- ユーザーの年齢に基づいて健康スコアを補正
- 高齢者ほど同じ運動量でも高評価

**受け入れ基準**:
- [ ] 年齢30歳未満: スコア × 0.95
- [ ] 年齢30-59歳: スコア × 1.0（補正なし）
- [ ] 年齢60歳以上: スコア × 1.15

**科学的根拠**:
- CDC Physical Activity Guidelines: 高齢者は若年者より運動達成が困難

**実装ファイル**:
- `frontend/src/services/healthScore/personalAdjustment.ts`（新規）

---

#### FR-2.2 性別による補正（筋力トレーニングのみ）
**優先度**: P1（高）

**要件**:
- 筋力トレーニングのスコア計算時、性別による補正を適用
- 女性の場合、同じレップ数でも高評価

**受け入れ基準**:
- [ ] 筋力トレーニングスコア: 女性 × 1.1、男性 × 1.0
- [ ] 有酸素運動スコア: 性別補正なし

**科学的根拠**:
- 筋力の性差を考慮した評価

**実装ファイル**:
- `frontend/src/services/healthScore/personalAdjustment.ts`

---

### FR-3: Critical Bug修正

#### FR-3.1 Insightスコア再計算問題の解決
**優先度**: P0（必須）

**現状の問題**:
新しいワークアウト追加後、Insightスコアが更新されない

**原因**:
既存のInsightレコードが存在する場合、再計算をスキップする実装

**解決策**:
常に最新のworkoutsデータを取得し、Insightを再計算

**受け入れ基準**:
- [ ] ワークアウト追加後、Insightスコアが即座に更新される
- [ ] 1日に複数回ワークアウトを追加しても、正しく累積計算される
- [ ] `Insight.upsert()`で既存レコードを更新

**実装ファイル**:
- `backend/routes/insightRoutes.js:30-57`

**修正コード**:
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
    await Insight.upsert({
      userId,
      date: today,
      totalScore: result.score.total,
      cardioScore: result.score.cardio,
      strengthScore: result.score.strength,
      // ... その他のフィールド
    }, {
      where: { userId, date: today }
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Insight calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate insight' });
  }
});
```

---

#### FR-3.2 ワークアウトフォームリセット問題の解決
**優先度**: P0（必須）

**現状の問題**:
ワークアウト送信後、フォームの入力値がリセットされない

**原因**:
React Hook Formの`reset()`が正しく動作していない

**解決策**:
フォームコンポーネントを強制的に再マウント

**受け入れ基準**:
- [ ] ワークアウト送信成功後、全フォームフィールドがクリアされる
- [ ] セット数のカウンターが初期値にリセットされる
- [ ] エラーメッセージがクリアされる

**実装ファイル**:
- `frontend/src/hooks/useWorkoutSubmit.js`
- `frontend/src/pages/WorkoutForm.jsx`

**修正コード**:
```javascript
// WorkoutForm.jsx
const [formKey, setFormKey] = useState(0);

const handleSubmitSuccess = async (data) => {
  await submitWorkout(data);
  showFeedback('ワークアウトを記録しました');

  // フォームを強制再マウント
  setFormKey(prev => prev + 1);
};

return <WorkoutFormComponent key={formKey} />;
```

---

## 非機能要件

### NFR-1: パフォーマンス
- [ ] METs計算: O(1)（テーブルルックアップ）
- [ ] 週次METs-分計算: O(n)（n = ワークアウト数、通常10-20件）
- [ ] Insightスコア再計算: 200ms以内

### NFR-2: 精度
- [ ] METs値の誤差: ±0.1以内（論文値との差）
- [ ] 週次METs-分の計算精度: 小数点第1位まで
- [ ] 健康スコアの精度向上: 40%以上

### NFR-3: 保守性
- [ ] TypeScriptで型安全性を確保
- [ ] ユニットテストカバレッジ: 90%以上（健康スコアロジック）
- [ ] コメントで科学的根拠を明記

---

## 成功基準

### 定量的基準

| 指標 | Before | After | 目標 |
|-----|--------|-------|------|
| 健康スコア精度 | 60% | 84% | +40% |
| Critical Bug | 1件 | 0件 | 完全解決 |
| METs計算カバレッジ | - | 20種目 | 20種目 |
| 週次METs-分精度 | - | ±1% | 高精度 |

### 定性的基準

#### ユーザー価値
- [ ] 運動強度が適切に評価される
- [ ] 個人差を考慮した公平な評価
- [ ] ワークアウト追加後、即座にスコア更新

#### 開発者体験
- [ ] METs計算ロジックが明確
- [ ] 科学的根拠がドキュメント化されている
- [ ] テストで精度を保証

#### 面接評価
- [ ] 論文ベースの実装を5分で説明できる
- [ ] METs計算の具体例を示せる
- [ ] 精度向上の数値を語れる

---

## 科学的根拠

### 1. METs（代謝当量）
**出典**: Ainsworth BE et al. (2011) "2011 Compendium of Physical Activities"

**定義**:
- METs = 運動時のエネルギー消費量 / 安静時のエネルギー消費量
- 1 MET = 安静時の代謝量（約3.5 mL O₂/kg/分）

**例**:
- 座っている: 1.0 MET
- ゆっくり歩く: 2.5 METs
- 中強度ランニング: 9.8 METs
- 高強度サイクリング: 12.0 METs

### 2. WHO推奨基準
**出典**: WHO (2020) "Guidelines on physical activity and sedentary behaviour"

**推奨運動量**:
- 週150-300分の中強度有酸素運動
- または週75-150分の高強度有酸素運動
- METs-分換算: 週500-1000 METs-分

**計算例**:
- 中強度ランニング（9.8 METs）を週150分
- → 9.8 × 150 = 1,470 METs-分（推奨達成）

### 3. 年齢による補正
**出典**: CDC (2018) "Physical Activity Guidelines for Americans, 2nd edition"

**根拠**:
- 高齢者（65歳以上）は運動達成が困難
- 同じ運動量でもより高い健康効果が得られる

### 4. 性別による補正
**出典**: 筋力の性差に関する研究

**根拠**:
- 女性は男性の約60-70%の筋力
- 同じ筋トレ回数でも、女性の方が相対的な負荷が高い

---

## リスクと対応策

### リスク1: METs値の不正確さ
**発生確率**: 低
**影響度**: 中

**対応策**:
- 信頼性の高い論文（Compendium of Physical Activities）を参照
- 複数の論文で値を検証
- 未知の運動は保守的なデフォルト値（5.0 METs）

### リスク2: 個人差補正の主観性
**発生確率**: 中
**影響度**: 低

**対応策**:
- 補正係数を控えめに設定（±15%以内）
- 今後、ユーザーフィードバックで調整
- 補正なしのスコアも表示（オプション）

---

## 次のステップ

1. [Week 1-2 設計書](./design.md) の確認
2. METs計算の実装開始
3. Critical Bug修正の実施

---

**最終更新**: 2025-10-11
**承認者**: Keisuke Sato
**次回レビュー**: 2025-10-27（Week 1-2完了時）
