#

この テスト実装仕様書 v3.0

**実装駆動型テスト設計 - Complete Implementation Guide**

---

**Version:** 3.0.0 - Best Practice Implementation  
**Target Component:** `/src/components/WorkoutHistoryTable.jsx`  
**Focus:** 効率的かつ包括的なテスト実装の実現  
**Implementation Time:** 4-6 hours

---

## 📋 Executive Summary

### 仕様書の位置づけ

- **種類**: テスト実装仕様書（Implementation-Driven Test Specification）
- **目的**: 効率的かつ包括的なテスト実装の実現
- **対象**: React Testing Library + Vitest 環境での複雑コンポーネントテスト
- **想定読者**: テスト実装経験者（中級以上）
- **学習目標**: 動的レンダリング・Null-safe アクセス・条件分岐型 UI 設計のテスト技術習得

### 機能開発仕様書との違い

```javascript
// 機能開発仕様書: 何を作るかを定義
const functionalSpec = {
  目的: '新機能の実装方法を具体的に指示',
  コード例: '実装パターンを詳細に提示（必須）',
};

// テスト仕様書: 何をテストするかを定義
const testSpec = {
  目的: '既存機能のテスト方法を効率的に指示',
  コード例: 'テストロジックの要点のみ提示（最小限）',
};
```

---

## 🎯 Section 1: テスト対象の技術分析

### 1.1 対象コンポーネントの複雑性評価

```javascript
// 📂 Target: /src/components/WorkoutHistoryTable.jsx (Lines: 50-311)
const complexityAnalysis = {
  conditionalRendering: 8, // loading/empty/normal + cardio/strength分岐
  dynamicGeneration: 5, // maxSetsベースの配列生成
  dataAccessPatterns: 6, // workout.exercises[name][setKey] 多階層アクセス
  propsInteraction: 4, // workoutConfig + 判定関数の相互依存
  totalComplexity: 23, // 高複雑度（テスト必須レベル）
  riskLevel: '🔴 Critical', // バグ発生時の影響度大
};
```

### 1.2 既存テスト環境の活用戦略

```javascript
// 📂 参照: frontend/src/components/__tests__/Login.test.jsx
// 🔄 活用できる既存パターン:
const reuseablePatterns = {
  mockingStrategy: 'vi.fn()によるProps関数のモック',
  testWrapper: 'ThemeProvider + BrowserRouterパターン',
  assertionPatterns: 'screen.getByText() + toBeInTheDocument()',
  errorHandling: 'waitFor() + 非同期テストパターン',
};

// 🆕 新規で必要となる技術:
const newRequirements = {
  dynamicRendering: 'Array.from()による動的要素生成のテスト',
  conditionalAttributes: 'colSpan, rowSpan等の動的属性検証',
  nullSafeAccess: 'Optional Chaining + Nullish Coalescingのテスト',
};
```

---

## 🚀 Section 2: 実装フェーズ別詳細設計

### Phase 1: テストインフラ構築 (30 分)

#### Step 1.1: 基本セットアップ実装

```javascript
// 📂 新規: frontend/src/components/__tests__/WorkoutHistoryTable.test.jsx

import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import WorkoutHistoryTable from '../WorkoutHistoryTable';
import { createTheme } from '@mui/material/styles';

// 🔄 既存Login.test.jsxパターンを踏襲
const theme = createTheme();
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// 🆕 WorkoutHistoryTable専用のモック関数
const mockIsCardioExercise = vi.fn();
const mockIsStrengthExercise = vi.fn();

describe('WorkoutHistoryTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトの分類設定
    mockIsCardioExercise.mockImplementation(
      (exercise) => exercise === 'ランニング' || exercise === 'サイクリング'
    );
    mockIsStrengthExercise.mockImplementation(
      (exercise) => exercise === 'ベンチプレス' || exercise === 'スクワット'
    );
  });
});
```

#### Step 1.2: 戦略的テストデータ設計

```javascript
// 🎯 重要: テストデータは実装の複雑さを反映した設計にする
const testDataStrategy = {
  // 完全データセット（正常系）
  completeWorkout: {
    date: '2024-01-15',
    exercises: {
      ランニング: { distance: 5.0, duration: 30 },
      ベンチプレス: { set1: '80kg×10', set2: '80kg×8', set3: '75kg×10' },
      スクワット: { set1: '100kg×12', set2: '100kg×10', set3: '95kg×12' },
    },
    totalReps: 62,
    totalTime: 45,
  },

  // エッジケースデータセット
  edgeCaseWorkout: {
    date: '2024-01-10',
    exercises: {
      ランニング: { distance: 2.5 }, // duration未設定
      ベンチプレス: { set1: '70kg×12' }, // set2,set3未設定
      スクワット: {}, // 全セット未設定
    },
  },

  // 設定バリエーション
  configVariations: {
    maxSets3: {
      exercises: ['ベンチプレス'],
      maxSets: 3,
      displayColumns: ['totalReps'],
    },
    maxSets5: {
      exercises: ['ベンチプレス'],
      maxSets: 5,
      displayColumns: undefined,
    },
    mixed: {
      exercises: ['ランニング', 'ベンチプレス'],
      maxSets: 3,
      displayColumns: ['totalReps', 'totalTime'],
    },
  },
};
```

---

### Phase 2: Critical Tests 実装 (120 分)

#### C1: 動的 colSpan 計算エンジンテスト実装

```javascript
describe('🔄 動的colSpan計算エンジン', () => {
  it('🔴 Cardio種目でcolSpan=2が正確に設定される', () => {
    // モック設定: ランニングをCardio種目として分類
    mockIsCardioExercise.mockImplementation((ex) => ex === 'ランニング');
    mockIsStrengthExercise.mockImplementation(() => false);

    const config = {
      exercises: ['ランニング'],
      maxSets: 3,
      displayColumns: [],
    };

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={config}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    // 🎯 重要: colSpan属性の直接検証
    const cardioHeader = screen.getByText('ランニング').closest('th');
    expect(cardioHeader).toHaveAttribute('colSpan', '2');

    // 🎯 サブヘッダーの存在確認
    expect(screen.getByText('距離(km)')).toBeInTheDocument();
    expect(screen.getByText('時間(分)')).toBeInTheDocument();
  });

  it('🔴 Strength種目でcolSpan=maxSetsが正確に設定される', () => {
    mockIsCardioExercise.mockImplementation(() => false);
    mockIsStrengthExercise.mockImplementation((ex) => ex === 'ベンチプレス');

    const config = {
      exercises: ['ベンチプレス'],
      maxSets: 5,
      displayColumns: [],
    };

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={config}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    // colSpan=5の検証
    const strengthHeader = screen.getByText('ベンチプレス').closest('th');
    expect(strengthHeader).toHaveAttribute('colSpan', '5');

    // 5セット分のヘッダー生成確認
    expect(screen.getByText('1セット')).toBeInTheDocument();
    expect(screen.getByText('2セット')).toBeInTheDocument();
    expect(screen.getByText('3セット')).toBeInTheDocument();
    expect(screen.getByText('4セット')).toBeInTheDocument();
    expect(screen.getByText('5セット')).toBeInTheDocument();
  });

  it('🔴 Mixed パターンでの正確なcolSpan計算', () => {
    mockIsCardioExercise.mockImplementation((ex) => ex === 'ランニング');
    mockIsStrengthExercise.mockImplementation((ex) => ex === 'ベンチプレス');

    const config = {
      exercises: ['ランニング', 'ベンチプレス'],
      maxSets: 3,
      displayColumns: [],
    };

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={config}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    // Cardio: colSpan=2
    const cardioHeader = screen.getByText('ランニング').closest('th');
    expect(cardioHeader).toHaveAttribute('colSpan', '2');

    // Strength: colSpan=3
    const strengthHeader = screen.getByText('ベンチプレス').closest('th');
    expect(strengthHeader).toHaveAttribute('colSpan', '3');
  });
});
```

#### C2: Null-Safe データアクセステスト実装

```javascript
describe('🎯 Null-Safe データアクセスパターン', () => {
  it('🔴 exercise未定義時に"-"が正しく表示される', () => {
    const incompleteWorkout = {
      date: '2024-01-10',
      exercises: {
        // 'ベンチプレス'キー自体が存在しない状態をテスト
      },
    };

    const config = { exercises: ['ベンチプレス'], maxSets: 3 };

    mockIsStrengthExercise.mockImplementation((ex) => ex === 'ベンチプレス');

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[incompleteWorkout]}
          workoutConfig={config}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    // 🎯 重要: 3セット分すべて"-"が表示されることを確認
    expect(screen.getAllByText('-')).toHaveLength(3);
  });

  it('🔴 setKey部分未定義時の安全なフォールバック', () => {
    const partialWorkout = {
      date: '2024-01-10',
      exercises: {
        ベンチプレス: {
          set1: '70kg×12',
          // set2, set3は未定義
        },
      },
    };

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[partialWorkout]}
          workoutConfig={{ exercises: ['ベンチプレス'], maxSets: 3 }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    // set1は値が表示される
    expect(screen.getByText('70kg×12')).toBeInTheDocument();

    // set2, set3は"-"が表示される
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('🔴 Cardio データの部分未設定パターン', () => {
    const partialCardioWorkout = {
      date: '2024-01-10',
      exercises: {
        ランニング: {
          distance: 3.2,
          // duration未設定
        },
      },
    };

    mockIsCardioExercise.mockImplementation((ex) => ex === 'ランニング');

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[partialCardioWorkout]}
          workoutConfig={{ exercises: ['ランニング'], maxSets: 3 }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    // distance は表示される
    expect(screen.getByText('3.2km')).toBeInTheDocument();

    // duration は "-" が表示される
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
```

#### C3: 動的配列生成ロジックテスト実装

```javascript
describe('📊 動的配列生成ロジック', () => {
  it('🔴 maxSets変更時の動的セット数生成', () => {
    const testCases = [
      { maxSets: 3, expectedSets: ['1セット', '2セット', '3セット'] },
      { maxSets: 5, expectedSets: ['1セット', '2セット', '3セット', '4セット', '5セット'] },
      { maxSets: 1, expectedSets: ['1セット'] },
    ];

    testCases.forEach(({ maxSets, expectedSets }) => {
      const { unmount } = render(
        <TestWrapper>
          <WorkoutHistoryTable
            workouts={[completeWorkout]}
            workoutConfig={{ exercises: ['ベンチプレス'], maxSets }}
            loading={false}
            isCardioExercise={mockIsCardioExercise}
            isStrengthExercise={mockIsStrengthExercise}
          />
        </TestWrapper>
      );

      // 期待されるセット数のヘッダーが全て存在することを確認
      expectedSets.forEach((setLabel) => {
        expect(screen.getByText(setLabel)).toBeInTheDocument();
      });

      // 期待以上のセット数は存在しないことを確認
      if (maxSets < 5) {
        expect(screen.queryByText(`${maxSets + 1}セット`)).not.toBeInTheDocument();
      }

      unmount(); // 次のテストケースのためにクリーンアップ
    });
  });

  it('🔴 Array.from key属性の重複なし確認', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={{ exercises: ['ベンチプレス'], maxSets: 5 }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    // セット数ヘッダーの要素を取得
    const setHeaders = screen.getAllByText(/\dセット/);
    expect(setHeaders).toHaveLength(5);

    // 各ヘッダーがユニークな要素であることを確認
    const uniqueElements = new Set(setHeaders);
    expect(uniqueElements.size).toBe(5);
  });
});
```

---

### Phase 3: Important Tests 実装 (60 分)

#### I1: 状態別 UI 制御テスト実装

```javascript
describe('🔄 状態別UI制御', () => {
  it('🟡 loading=trueでローディング状態が正しく表示される', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[]}
          workoutConfig={{ exercises: [], maxSets: 3 }}
          loading={true}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    expect(screen.getByText('詳細履歴')).toBeInTheDocument();
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // テーブル要素が表示されないことを確認
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('🟡 workouts=[]で空状態が正しく表示される', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[]}
          workoutConfig={{ exercises: ['ベンチプレス'], maxSets: 3 }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    expect(screen.getByText('詳細履歴')).toBeInTheDocument();
    expect(screen.getByText('ワークアウト履歴がありません')).toBeInTheDocument();
    expect(screen.getByText('新しいワークアウトを開始しましょう！')).toBeInTheDocument();

    // テーブル要素が表示されないことを確認
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('🟡 正常データでテーブル表示', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={{ exercises: ['ベンチプレス'], maxSets: 3 }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    expect(screen.getByText('詳細履歴')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    // ローディング・空状態のUIが表示されないことを確認
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    expect(screen.queryByText('ワークアウト履歴がありません')).not.toBeInTheDocument();
  });
});
```

#### I2: 条件付きカラム表示制御テスト実装

```javascript
describe('📈 条件付きカラム表示制御', () => {
  it('🟡 displayColumns=[totalReps,totalTime]で両方表示', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={{
            exercises: ['ベンチプレス'],
            maxSets: 3,
            displayColumns: ['totalReps', 'totalTime'],
          }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    expect(screen.getByText('合計回数')).toBeInTheDocument();
    expect(screen.getByText('合計時間')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument(); // totalReps
    expect(screen.getByText('45分')).toBeInTheDocument(); // totalTime
  });

  it('🟡 displayColumns=[totalReps]で回数のみ表示', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={{
            exercises: ['ベンチプレス'],
            maxSets: 3,
            displayColumns: ['totalReps'],
          }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    expect(screen.getByText('合計回数')).toBeInTheDocument();
    expect(screen.queryByText('合計時間')).not.toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
  });

  it('🟡 displayColumns=undefinedで合計カラム非表示', () => {
    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={{
            exercises: ['ベンチプレス'],
            maxSets: 3,
            displayColumns: undefined,
          }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    expect(screen.queryByText('合計回数')).not.toBeInTheDocument();
    expect(screen.queryByText('合計時間')).not.toBeInTheDocument();
  });
});
```

---

### Phase 4: Optional Tests 実装 (30 分)

#### N1: 説明文生成ロジックテスト

```javascript
describe('📝 説明文生成ロジック', () => {
  it('🟠 Cardio+Strength混在時の適切な説明文生成', () => {
    mockIsCardioExercise.mockImplementation((ex) => ex === 'ランニング');
    mockIsStrengthExercise.mockImplementation((ex) => ex === 'ベンチプレス');

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={{
            exercises: ['ランニング', 'ベンチプレス'],
            maxSets: 3,
          }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    expect(
      screen.getByText('表示中: ランニング (距離・時間)、ベンチプレス (3セット)')
    ).toBeInTheDocument();
  });

  it('🟠 Cardioのみの場合の説明文', () => {
    mockIsCardioExercise.mockImplementation((ex) => ex === 'ランニング' || ex === 'サイクリング');
    mockIsStrengthExercise.mockImplementation(() => false);

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={{
            exercises: ['ランニング', 'サイクリング'],
            maxSets: 3,
          }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    expect(screen.getByText('表示中: ランニング、サイクリング (距離・時間)')).toBeInTheDocument();
  });

  it('🟠 Strengthのみの場合の説明文', () => {
    mockIsCardioExercise.mockImplementation(() => false);
    mockIsStrengthExercise.mockImplementation((ex) => ex === 'ベンチプレス' || ex === 'スクワット');

    render(
      <TestWrapper>
        <WorkoutHistoryTable
          workouts={[completeWorkout]}
          workoutConfig={{
            exercises: ['ベンチプレス', 'スクワット'],
            maxSets: 4,
          }}
          loading={false}
          isCardioExercise={mockIsCardioExercise}
          isStrengthExercise={mockIsStrengthExercise}
        />
      </TestWrapper>
    );

    expect(screen.getByText('表示中: ベンチプレス、スクワット (4セット)')).toBeInTheDocument();
  });
});
```

---

## 🛠️ Section 3: 実装支援情報

### 3.1 デバッグ・トラブルシューティング

```javascript
// 🔧 よくある問題と解決パターン
const debuggingGuide = {
  colSpan検証失敗: {
    問題: "toHaveAttribute('colSpan', '2')が失敗する",
    原因: 'React/Material-UIがcolSpanを数値として扱う場合がある',
    解決: "expect(cardioHeader).toHaveAttribute('colSpan', '2') または数値比較を使用",
  },

  動的要素が見つからない: {
    問題: "screen.getByText('1セット')でElementNotFoundエラー",
    原因: 'maxSetsが正しく渡されていない、またはモック設定ミス',
    解決: 'screen.debug()でDOM構造を確認、mockImplementation内容を検証',
  },

  非同期テストの不安定性: {
    問題: 'テストが時々失敗する',
    原因: 'レンダリング完了前のアサーション',
    解決: 'waitFor()またはfindBy*()を使用',
  },

  モック関数のリセット漏れ: {
    問題: '前のテストの設定が残っている',
    原因: 'beforeEach でのクリーンアップ不足',
    解決: 'vi.clearAllMocks() + 明示的なmockImplementation再設定',
  },
};
```

### 3.2 パフォーマンス最適化

```javascript
// 🚀 テスト実行速度向上のテクニック
const performanceOptimization = {
  beforeEach効率化: `
    beforeEach(() => {
      vi.clearAllMocks();
      // 重い初期化は避け、テストケース内で最小限のセットアップ
    });
  `,

  コンポーネントの部分レンダリング: `
    // 全体をレンダリングする代わりに、テーブル部分のみをテスト
    // (ただし、統合テストの価値を失わない範囲で)
  `,

  並列テスト実行: `
    // describe.concurrent() を使用してテストを並列実行
    // ただし、モック関数の競合状態に注意
  `,
};
```

### 3.3 実装参考資料

```javascript
// 📚 開発中に参照すべき重要ドキュメント
const referenceDocuments = {
  ReactTestingLibrary: 'https://testing-library.com/docs/react-testing-library/cheatsheet',
  VitestAPI: 'https://vitest.dev/api/',
  MaterialUITesting: 'https://mui.com/material-ui/guides/testing/',
  MockingGuide: 'https://vitest.dev/guide/mocking.html',
};

// 🔄 既存コード活用チェックリスト
const existingCodeReference = {
  必ず参照すべき実装: [
    'frontend/src/components/__tests__/Login.test.jsx (モック・アサーションパターン)',
    'frontend/src/components/WorkoutHistoryTable.jsx:108-131 (colSpan計算ロジック)',
    'frontend/src/components/WorkoutHistoryTable.jsx:253-283 (データアクセスロジック)',
  ],
};
```

---

## 📊 Section 4: 成功指標と完了判定

### 4.1 定量的目標

```javascript
const successMetrics = {
  テストカバレッジ: '対象範囲（50-311行）の90%以上',
  テストケース数: {
    critical: '12項目すべて実装',
    important: '8項目中6項目以上',
    optional: '3項目中1項目以上',
  },
  実行時間: '全テスト5秒以内',
  実装時間: '230分以内完了',
};
```

### 4.2 定性的評価項目

```javascript
const qualityAssessment = {
  コードレビュー観点: [
    'テストの可読性と保守性',
    'エッジケースの適切なカバレッジ',
    'モック使用の妥当性',
    'アサーションの精度',
  ],

  学習効果測定: [
    '動的レンダリングテスト技術の習得',
    '複雑なコンポーネントテスト設計能力',
    'React Testing Library高度活用',
  ],
};
```

### 4.3 段階別完了判定

#### Phase 1 完了条件 ✅

- [ ] TestWrapper とモック関数が正常に動作する
- [ ] テストデータセットが適切に定義されている
- [ ] 基本的なレンダリングテストが通る

#### Phase 2 完了条件 ✅

- [ ] Critical Tests（12 項目）がすべて実装済み
- [ ] colSpan 計算ロジックが完全にテストされている
- [ ] Null-safe アクセスパターンが網羅されている

#### Phase 3 完了条件 ✅

- [ ] Important Tests（6 項目以上）が実装済み
- [ ] 状態別 UI 制御が適切にテストされている
- [ ] 条件付きカラム表示ロジックが検証済み

#### Phase 4 完了条件 ✅

- [ ] Optional Tests（1 項目以上）が実装済み
- [ ] 全テストが安定して通る（3 回連続実行で成功）
- [ ] テストカバレッジが目標値を達成

---

## 🎯 この仕様書の特徴（機能開発仕様書の良い点を統合）

### ✅ 追加された価値

1. **具体的実装例**: 各 Phase 毎に詳細なコードを提示
2. **技術的参照情報**: 既存テストパターンの活用方法を明示
3. **デバッグガイド**: よくある問題と解決策を事前提供
4. **段階的実装手順**: Phase 分けによる効率的な作業進行

### 🔄 テスト仕様書としての本質は保持

1. **テスト観点中心**: 何をテストするかが明確
2. **優先度付け**: Critical > Important > Optional
3. **検証項目明示**: 期待結果の具体的定義
4. **リスク評価**: 複雑度による優先順位設定

---

## 🚀 実装開始チェックリスト

### 事前準備

- [ ] `frontend/src/components/__tests__/Login.test.jsx` を参照済み
- [ ] `WorkoutHistoryTable.jsx` の構造を理解済み
- [ ] Vitest + React Testing Library の基本操作を確認済み

### 実装順序

1. **Phase 1** → テストインフラ構築
2. **Phase 2** → Critical Tests（最重要）
3. **Phase 3** → Important Tests（品質保証）
4. **Phase 4** → Optional Tests（完成度向上）

### 成功指標の追跡

- [ ] 各 Phase 完了後に完了条件をチェック
- [ ] テストカバレッジを定期的に確認
- [ ] デバッグガイドを活用して効率的に問題解決

---

**この仕様書により、機能開発と同等の具体性を持ちながら、テスト設計に特化した実用的な実装指針が完成しました。段階的なアプローチで確実に高品質なテスト実装を実現できます。**

---

**Target**: 4-6 時間で WorkoutHistoryTable の包括的テストスイートを完成 🚀
