# WorkoutForm コンポーネント リファクタリング手順書

## 📌 概要
WorkoutFormコンポーネントを単一責任の原則に基づいて分割し、保守性・テスタビリティを向上させる。

## 🎯 目的
- **現状**: 380行の巨大コンポーネントに7つの責任が混在
- **目標**: 各ファイルが単一の責任を持つ構造に再編成
- **効果**: テスト容易性、再利用性、保守性の向上

## 📊 現状分析

### 現在のWorkoutFormが持つ責任
1. フォーム状態管理（useForm、setValue、reset）
2. API通信処理（onSubmit内のapiClient.post）
3. UI定数の定義（DISTANCE_OPTIONS等）
4. フィードバック管理（showFeedback、feedbackステート）
5. 設定管理（drawerOpen、設定フック）
6. バリデーション（validationSchema）
7. UIレンダリング（大量のMUIコンポーネント）

### 影響範囲
- **フロントエンド影響**: 最小限（1ファイルのインポートパス修正のみ）
- **バックエンド影響**: なし（APIインターフェース変更なし）
- **テスト影響**: なし（テストファイル未作成）

## 🏗️ 目標アーキテクチャ

```
frontend/src/
├── components/
│   └── WorkoutForm/
│       ├── index.jsx                    # コンテナーコンポーネント
│       ├── WorkoutForm.jsx              # プレゼンテーションコンポーネント
│       ├── components/
│       │   ├── ExerciseCard.jsx         # 各種目カード
│       │   ├── CardioFields.jsx         # カーディオ入力
│       │   ├── StrengthFields.jsx       # 筋トレ入力
│       │   └── WorkoutHeader.jsx        # ヘッダー
│       └── constants.js                 # UI定数
│
├── hooks/
│   ├── useWorkoutForm.js               # フォームロジック
│   ├── useWorkoutSubmit.js             # 送信処理
│   └── useFeedback.js                  # フィードバック管理
│
└── utils/
    └── workoutDataTransformer.js       # データ変換
```

## 📝 実装手順

### Phase 0: 準備作業
```bash
# 1. 新規ブランチ作成
git checkout main
git pull origin main
git checkout -b refactor/workout-form-single-responsibility

# 2. ディレクトリ作成
mkdir -p frontend/src/components/WorkoutForm
mkdir -p frontend/src/components/WorkoutForm/components
```

### Phase 1: 定数の分離（リスク: 低）
**作業時間目安**: 30分

1. `constants.js`ファイルを作成
```javascript
// frontend/src/components/WorkoutForm/constants.js
export const DISTANCE_OPTIONS = Array.from({ length: 21 }, (_, i) =>
  (i * 0.5).toFixed(1)
);

export const DURATION_OPTIONS = Array.from({ length: 25 }, (_, i) => i * 5)
  .filter(d => d > 0);

export const REPS_OPTIONS = [5, 10, 15, 20, 25, 30];

export const INTENSITY_LEVELS = [
  { value: '低', label: '楽に感じる（軽い息切れ程度）' },
  { value: '中', label: '少しきつい（会話しながらできる程度）' },
  { value: '高', label: 'かなりきつい（会話が難しい程度）' }
];
```

2. WorkoutForm.jsxから定数を削除し、インポート追加
3. 動作確認
4. コミット: `refactor: extract constants from WorkoutForm`

### Phase 2: フィードバック機能の分離（リスク: 低）
**作業時間目安**: 45分

1. `useFeedback.js`フックを作成
```javascript
// frontend/src/hooks/useFeedback.js
import { useState, useEffect } from 'react';

const useFeedback = () => {
  const [feedback, setFeedback] = useState({
    message: '',
    type: '',
    visible: false,
  });

  const showFeedback = (message, type) => {
    setFeedback({
      message,
      type,
      visible: true,
    });
  };

  useEffect(() => {
    if (feedback.visible) {
      const timer = setTimeout(() => {
        setFeedback(prev => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.visible]);

  return { feedback, showFeedback };
};

export default useFeedback;
```

2. WorkoutFormでuseFeedbackを使用
3. 動作確認
4. コミット: `refactor: extract feedback logic to custom hook`

### Phase 3: 送信ロジックの分離（リスク: 中）
**作業時間目安**: 1時間

1. `useWorkoutSubmit.js`フックを作成
```javascript
// frontend/src/hooks/useWorkoutSubmit.js
import { useCallback } from 'react';
import apiClient from '../services/api';

const useWorkoutSubmit = ({
  workoutConfig,
  isCardioExercise,
  showFeedback,
  reset,
  generateDefaultValues
}) => {
  const handleSubmit = useCallback(async (data) => {
    try {
      for (const exercise of workoutConfig.exercises) {
        if (isCardioExercise(exercise)) {
          // カーディオ処理
          const distance = data[`${exercise}_distance`];
          const duration = data[`${exercise}_duration`];

          if (distance && duration) {
            const submitData = {
              exercise,
              exerciseType: 'cardio',
              distance: parseFloat(distance),
              duration: parseInt(duration, 10) * 60,
              intensity: data.intensity,
            };
            await apiClient.post('/workouts', submitData);
          }
        } else {
          // 筋トレ処理
          const repsData = [];
          for (let i = 1; i <= workoutConfig.maxSets; i++) {
            const reps = data[`${exercise}_set${i}`];
            if (reps && reps > 0) {
              repsData.push({ id: String(i), reps: parseInt(reps, 10) });
            }
          }

          if (repsData.length > 0) {
            const submitData = {
              exercise,
              exerciseType: 'strength',
              setNumber: repsData.length,
              repsNumber: repsData,
              intensity: data.intensity,
            };
            await apiClient.post('/workouts', submitData);
          }
        }
      }

      showFeedback('ワークアウトが保存されました', 'success');
      reset(generateDefaultValues(workoutConfig));
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'エラーが発生しました';
      showFeedback(errorMessage, 'error');
    }
  }, [workoutConfig, isCardioExercise, showFeedback, reset, generateDefaultValues]);

  return { handleSubmit };
};

export default useWorkoutSubmit;
```

2. WorkoutFormで使用
3. 動作確認
4. コミット: `refactor: extract submit logic to custom hook`

### Phase 4: UIコンポーネントの分割（リスク: 中）
**作業時間目安**: 2時間

1. 各コンポーネントファイルを作成
   - `WorkoutHeader.jsx`
   - `ExerciseCard.jsx`
   - `CardioFields.jsx`
   - `StrengthFields.jsx`

2. `index.jsx`（コンテナー）と`WorkoutForm.jsx`（プレゼンテーション）に分割

3. インポートパスの更新
```javascript
// frontend/src/pages/WorkoutForm.jsx
import WorkoutForm from '../components/WorkoutForm'; // index.jsxが自動的に読まれる
```

4. 動作確認
5. コミット: `refactor: split WorkoutForm into smaller components`

### Phase 5: 最終調整とクリーンアップ
**作業時間目安**: 30分

1. 不要なコメント削除
2. PropTypesまたはTypeScript型定義追加（オプション）
3. 全体動作確認
4. コミット: `refactor: cleanup and final adjustments`

## ✅ チェックリスト

### 実装前チェック
- [ ] mainブランチが最新状態
- [ ] 新規ブランチ作成済み
- [ ] npm installで依存関係最新化

### Phase 1 完了条件
- [ ] constants.jsファイル作成
- [ ] WorkoutFormから定数削除
- [ ] インポート追加
- [ ] ビルドエラーなし
- [ ] 画面表示正常

### Phase 2 完了条件
- [ ] useFeedback.js作成
- [ ] フィードバック機能動作確認
- [ ] タイマー処理正常動作
- [ ] エラー/成功メッセージ表示確認

### Phase 3 完了条件
- [ ] useWorkoutSubmit.js作成
- [ ] API送信成功
- [ ] エラーハンドリング動作
- [ ] フォームリセット動作

### Phase 4 完了条件
- [ ] 全コンポーネントファイル作成
- [ ] props受け渡し正常
- [ ] FormConfigDrawer連携確認
- [ ] インポートパス更新

### Phase 5 完了条件
- [ ] ESLintエラーなし
- [ ] ビルド成功
- [ ] 全機能動作確認
- [ ] PR作成準備完了

## 🚨 トラブルシューティング

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| インポートエラー | パス間違い | 相対パスを確認、index.jsxの存在確認 |
| 状態更新されない | props渡し忘れ | コンテナーからのprops確認 |
| APIエラー | データ形式変更 | 送信データ形式を確認 |
| ビルドエラー | 循環参照 | import順序を見直し |

## 📈 成功指標

- **コード行数**: WorkoutForm.jsx が380行 → 100行以下に
- **ファイル数**: 1ファイル → 10ファイル程度に分割
- **責任数**: 7つ → 各ファイル1つに
- **テスタビリティ**: 各機能を独立してテスト可能に

## 🔄 ロールバック手順

問題発生時：
```bash
# 特定のコミットまで戻る
git log --oneline  # コミット履歴確認
git reset --hard <commit-hash>

# ブランチごと破棄する場合
git checkout main
git branch -D refactor/workout-form-single-responsibility
```

## 📚 参考資料
- [単一責任の原則（SRP）](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [React公式: コンポーネントの分割](https://react.dev/learn/thinking-in-react)
- [Container/Presentational パターン](https://www.patterns.dev/posts/presentational-container-pattern)