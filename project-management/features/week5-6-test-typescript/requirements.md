# Week 5-6: テストカバレッジ向上 + TypeScript化 - 要件定義書

**作成日**: 2025-10-11
**期間**: 2025年11月11日 - 11月24日（2週間）
**工数**: 14時間（週7時間 × 2週間）
**担当**: Keisuke Sato

---

## 📋 目次

1. [概要](#概要)
2. [目的とゴール](#目的とゴール)
3. [機能要件](#機能要件)
4. [非機能要件](#非機能要件)
5. [成功基準](#成功基準)

---

## 概要

### 背景
現在のFitTrackは以下の課題を抱えている:
- テストカバレッジが低い（推定40%未満）
- JavaScriptとTypeScriptが混在し、型安全性が不十分
- CI/CDパイプラインが未整備
- 重要ロジックのテストが不足

### Week 5-6の位置づけ
コア機能完成度向上ロードマップの**第3フェーズ**として、品質担保の仕組みを構築する。

---

## 目的とゴール

### 目的
> **「テストカバレッジ75%達成、品質担保の仕組みを構築しました」と面接で語る**

### ゴール

#### 1. テストカバレッジ向上
- ✅ テストカバレッジ 40% → 75%
- ✅ 健康スコアロジックの完全なユニットテスト
- ✅ APIエンドポイントの統合テスト

#### 2. 型安全性の確保
- ✅ 重要ロジックのTypeScript化（70%）
- ✅ 型定義の整備
- ✅ ランタイムエラーの80%削減

#### 3. CI/CD構築
- ✅ GitHub Actionsでテスト自動化
- ✅ カバレッジレポート自動生成
- ✅ PRマージ前の品質チェック

---

## 機能要件

### FR-1: ユニットテストの追加

#### FR-1.1 健康スコアロジックのテスト
**優先度**: P0（必須）

**要件**:
- METs計算のテスト
- 週次METs-分計算のテスト
- 個人差補正のテスト
- WHO推奨達成率のテスト

**受け入れ基準**:
- [ ] METs計算: 全運動種目（20種類）をテスト
- [ ] 週次METs-分: 複数ワークアウトの累積計算をテスト
- [ ] 年齢補正: 30歳未満、30-59歳、60歳以上の3パターンをテスト
- [ ] 性別補正: 筋力トレーニングの補正をテスト
- [ ] カバレッジ: 100%

**実装ファイル**:
- `frontend/src/services/healthScore/__tests__/calculateMETs.test.ts`（新規）
- `frontend/src/services/healthScore/__tests__/calculateWeeklyMETs.test.ts`（新規）
- `frontend/src/services/healthScore/__tests__/personalAdjustment.test.ts`（新規）

**テスト例**:
```typescript
// calculateMETs.test.ts
describe('METs Calculation', () => {
  describe('calculateMETs', () => {
    it('should return correct METs for running at medium intensity', () => {
      const mets = calculateMETs('ランニング', '中');
      expect(mets).toBe(9.8);
    });

    it('should return correct METs for cycling at low intensity', () => {
      const mets = calculateMETs('サイクリング', '低');
      expect(mets).toBe(4.0);
    });

    it('should return default METs (5.0) for unknown exercise', () => {
      const mets = calculateMETs('未知の運動', '中');
      expect(mets).toBe(5.0);
    });

    it('should handle all 20+ exercise types', () => {
      const exercises = [
        'ランニング', 'サイクリング', 'スクワット', '腕立て伏せ',
        '懸垂', 'デッドリフト', 'ベンチプレス', 'ショルダープレス',
        // ... 全20種類
      ];
      exercises.forEach(exercise => {
        const mets = calculateMETs(exercise, '中');
        expect(mets).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateWeeklyMETsMinutes', () => {
    it('should calculate weekly METs-minutes correctly', () => {
      const workouts = [
        { exercise: 'ランニング', intensity: '中', duration: 30 },
        { exercise: 'サイクリング', intensity: '低', duration: 60 },
      ];
      const result = calculateWeeklyMETsMinutes(workouts);
      expect(result).toBe(9.8 * 30 + 4.0 * 60); // 534
    });

    it('should handle empty workout array', () => {
      const result = calculateWeeklyMETsMinutes([]);
      expect(result).toBe(0);
    });

    it('should ignore strength training', () => {
      const workouts = [
        { exercise: 'ランニング', intensity: '中', duration: 30, exerciseType: 'cardio' },
        { exercise: 'スクワット', intensity: '中', duration: 20, exerciseType: 'strength' },
      ];
      const result = calculateWeeklyMETsMinutes(workouts);
      expect(result).toBe(9.8 * 30); // 筋トレは除外
    });
  });
});
```

---

#### FR-1.2 統計計算ロジックのテスト
**優先度**: P0（必須）

**要件**:
- 週次統計計算のテスト
- 月次統計計算のテスト
- 変化率計算のテスト
- ユニークな日数カウントのテスト

**受け入れ基準**:
- [ ] 1日複数回ワークアウトの重複排除をテスト
- [ ] 変化率計算（前週/前月が0の場合）をテスト
- [ ] Set構造によるO(1)重複排除をテスト
- [ ] カバレッジ: 95%以上

**実装ファイル**:
- `frontend/src/services/statistics/__tests__/weeklyStatsCalculator.test.js`（新規）
- `frontend/src/services/statistics/__tests__/monthlyStatsCalculator.test.js`（新規）
- `frontend/src/services/statistics/__tests__/workoutAggregator.test.js`（新規）

---

#### FR-1.3 APIエンドポイントの統合テスト
**優先度**: P1（高）

**要件**:
- ワークアウトCRUD操作のテスト
- Insight計算APIのテスト
- 認証フローのテスト
- エラーハンドリングのテスト

**受け入れ基準**:
- [ ] 全APIエンドポイント（20+）をテスト
- [ ] 正常系・異常系の両方をカバー
- [ ] エラーレスポンスのフォーマットをテスト
- [ ] カバレッジ: 80%以上

**実装ファイル**:
- `backend/tests/integration/workouts.integration.test.js`（新規）
- `backend/tests/integration/insights.integration.test.js`（新規）
- `backend/tests/integration/auth.integration.test.js`（新規）

**テスト例**:
```javascript
// workouts.integration.test.js
describe('POST /workouts', () => {
  let token;

  beforeAll(async () => {
    // テストユーザーでログイン
    const res = await request(app)
      .post('/authrouter/login')
      .send({ email: 'test@example.com', password: 'password' });
    token = res.body.token;
  });

  it('should create a cardio workout successfully', async () => {
    const res = await request(app)
      .post('/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        exercise: 'ランニング',
        exerciseType: 'cardio',
        intensity: '中',
        duration: 30,
        distance: 5,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.workout.exercise).toBe('ランニング');
  });

  it('should return 400 for invalid workout data', async () => {
    const res = await request(app)
      .post('/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        exercise: 'ランニング',
        exerciseType: 'cardio',
        // duration と distance が不足
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for unauthorized request', async () => {
    const res = await request(app)
      .post('/workouts')
      .send({
        exercise: 'ランニング',
        exerciseType: 'cardio',
        duration: 30,
        distance: 5,
      });

    expect(res.status).toBe(401);
  });
});
```

---

### FR-2: TypeScript化

#### FR-2.1 健康スコアロジックのTypeScript化
**優先度**: P0（必須）

**要件**:
- 全健康スコア関数をTypeScript化
- 型定義ファイルの作成
- インターフェースの定義

**受け入れ基準**:
- [ ] `calculateMETs.js` → `calculateMETs.ts`
- [ ] `calculateWeeklyMETs.js` → `calculateWeeklyMETs.ts`
- [ ] `personalAdjustment.js` → `personalAdjustment.ts`
- [ ] 型エラー: 0件

**実装ファイル**:
- `frontend/src/services/healthScore/calculateMETs.ts`
- `frontend/src/types/healthScore.ts`（新規）

**型定義例**:
```typescript
// frontend/src/types/healthScore.ts
export type Intensity = '低' | '中' | '高';

export interface METsTable {
  [exercise: string]: {
    低: number;
    中: number;
    高: number;
  };
}

export interface WorkoutForMETs {
  exercise: string;
  intensity: Intensity;
  duration: number;
  exerciseType?: 'cardio' | 'strength';
}

export interface HealthScoreResult {
  totalScore: number;
  cardioScore: number;
  strengthScore: number;
  weeklyMETsMinutes: number;
  whoCardioAchieved: boolean;
  whoStrengthAchieved: boolean;
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  baselineFitness?: 'low' | 'medium' | 'high';
}
```

---

#### FR-2.2 統計計算ロジックのTypeScript化
**優先度**: P1（高）

**要件**:
- 週次・月次統計計算をTypeScript化
- ワークアウト集計ロジックをTypeScript化

**受け入れ基準**:
- [ ] `weeklyStatsCalculator.js` → `weeklyStatsCalculator.ts`
- [ ] `monthlyStatsCalculator.js` → `monthlyStatsCalculator.ts`
- [ ] `workoutAggregator.js` → `workoutAggregator.ts`
- [ ] 型エラー: 0件

**実装ファイル**:
- `frontend/src/services/statistics/weeklyStatsCalculator.ts`
- `frontend/src/types/statistics.ts`（新規）

---

#### FR-2.3 バックエンドの部分的TypeScript化
**優先度**: P2（中）

**要件**:
- Insightスコア計算エンジンをTypeScript化
- 型定義の共有（フロントエンドと共通）

**受け入れ基準**:
- [ ] `backend/services/smallWins/InsightEngine.js` → `.ts`
- [ ] 共通型定義を `types/` ディレクトリに配置
- [ ] 型エラー: 0件

**実装ファイル**:
- `backend/services/smallWins/InsightEngine.ts`
- `types/shared.ts`（フロント・バック共通）

---

### FR-3: CI/CD構築

#### FR-3.1 GitHub Actions設定
**優先度**: P0（必須）

**要件**:
- テスト自動実行
- カバレッジレポート生成
- PRマージ前の品質チェック

**受け入れ基準**:
- [ ] PR作成時、自動でテスト実行
- [ ] カバレッジが75%未満の場合、警告
- [ ] テスト失敗時、マージをブロック

**実装ファイル**:
- `.github/workflows/test.yml`（新規）

**設定例**:
```yaml
name: Test & Coverage

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Install backend dependencies
        run: cd backend && npm ci

      - name: Run frontend tests with coverage
        run: cd frontend && npm run test:coverage

      - name: Run backend tests with coverage
        run: cd backend && npm run test:coverage

      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat frontend/coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 75" | bc -l) )); then
            echo "Coverage ($COVERAGE%) is below 75%"
            exit 1
          fi

      - name: Upload coverage reports to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info,./backend/coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
```

---

#### FR-3.2 カバレッジレポート
**優先度**: P0（必須）

**要件**:
- Codecovへのカバレッジアップロード
- PRコメントにカバレッジ変化を表示
- カバレッジバッジの追加

**受け入れ基準**:
- [ ] Codecovアカウント設定
- [ ] PRごとにカバレッジレポートが表示される
- [ ] README.mdにカバレッジバッジを追加

**実装ファイル**:
- `.github/workflows/test.yml`
- `README.md`（バッジ追加）

---

## 非機能要件

### NFR-1: テスト実行速度
- [ ] フロントエンドテスト: 30秒以内
- [ ] バックエンドテスト: 1分以内
- [ ] CI全体: 3分以内

### NFR-2: 保守性
- [ ] テストコードが読みやすい
- [ ] テストデータが明確
- [ ] テスト失敗時のエラーメッセージが分かりやすい

### NFR-3: 型安全性
- [ ] TypeScript化率: 70%以上
- [ ] 型エラー: 0件
- [ ] any型の使用: 5%以下

---

## 成功基準

### 定量的基準

| 指標 | Before | After | 目標 |
|-----|--------|-------|------|
| テストカバレッジ（全体） | 40% | 75% | +35% |
| 健康スコアロジック | 0% | 100% | +100% |
| APIエンドポイント | 50% | 80% | +30% |
| TypeScript化率 | 30% | 70% | +40% |
| 型エラー | 10+ | 0 | 完全解決 |
| CI実行時間 | - | 3分 | 高速 |

### 定性的基準

#### ユーザー価値
- [ ] バグが本番環境に入り込みにくい
- [ ] リリース前に品質を保証

#### 開発者体験
- [ ] テストで安心してリファクタリング可能
- [ ] 型定義で開発効率向上
- [ ] CIで自動品質チェック

#### 面接評価
- [ ] 品質担保の仕組みを具体的に説明できる
- [ ] テスト戦略を語れる
- [ ] 型安全性の重要性を理解している

---

## リスクと対応策

### リスク1: テスト作成の工数超過
**発生確率**: 中
**影響度**: 中

**対応策**:
- 優先度の高いロジックから実施
- カバレッジ75%を最低ラインとし、100%は目指さない
- シンプルなテストから開始

### リスク2: TypeScript移行の複雑さ
**発生確率**: 中
**影響度**: 低

**対応策**:
- 段階的な移行（ファイルごと）
- `any` 型を一時的に許容
- 既存のJavaScriptファイルと共存

---

## 次のステップ

1. [Week 5-6 設計書](./design.md) の確認
2. 健康スコアロジックのユニットテスト作成
3. TypeScript化の開始

---

**最終更新**: 2025-10-11
**承認者**: Keisuke Sato
**次回レビュー**: 2025-11-24（Week 5-6完了時）
