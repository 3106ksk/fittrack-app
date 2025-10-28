# クイックスタート: ワークアウトフォームリセットバグ修正

**機能**: 003-reset-ui-react
**最終更新**: 2025-10-20

## 概要

このガイドでは、ワークアウトフォーム送信後にリセットが正しく動作しない問題の修正方法を説明します。

## 問題の症状

- ✗ フォーム送信成功後、入力値がUIに残る
- ✗ `reset()`は呼ばれているが、UIに反映されない
- ✗ 設定変更時のリセットが不安定

## 解決策の概要

1. **送信成功時のreset()**: `isSubmitSuccessful`とuseEffectパターンを使用
2. **設定変更時のreset()**: `useLayoutEffect`で同期実行
3. **defaultValues**: `null`から`''`（空文字列）に変更
4. **mode設定**: `mode: 'onSubmit'`と`reValidateMode: 'onSubmit'`を追加

## 修正手順

### ステップ1: WorkoutForm/index.jsx の修正

**場所**: `/frontend/src/components/WorkoutForm/index.jsx`

#### 1.1 useFormの設定を更新

```javascript
const {
  control,
  handleSubmit,
  reset,
  formState: { errors, isSubmitSuccessful }, // ← isSubmitSuccessfulを追加
} = useForm({
  mode: 'onSubmit',           // ← 追加
  reValidateMode: 'onSubmit', // ← 追加
  resolver: yupResolver(validationSchema),
  defaultValues: generateDefaultValues(workoutConfig),
});
```

#### 1.2 送信成功時のリセット処理を追加

```javascript
// 送信成功後のリセット処理を追加
useEffect(() => {
  if (isSubmitSuccessful) {
    reset(generateDefaultValues(workoutConfig));
  }
}, [isSubmitSuccessful, workoutConfig, reset]);
```

#### 1.3 設定変更時のuseEffectをuseLayoutEffectに変更

```javascript
// useEffect → useLayoutEffect に変更
useLayoutEffect(() => {
  if (shouldResetForm) {
    const newDefaults = generateDefaultValues(workoutConfig);
    reset(newDefaults);
    setShouldResetForm(false);
  }
}, [shouldResetForm, workoutConfig, reset]);
```

**完全な修正例:**

```javascript
import { useEffect, useLayoutEffect, useState } from 'react'; // useLayoutEffectをインポート
import { Controller, useForm } from 'react-hook-form';
// ... 他のインポート

const WorkoutForm = () => {
  const {
    workoutConfig,
    availableExercises,
    isCardioExercise,
    updateExercises,
    updateMaxSets,
  } = useFormConfig();

  const validationSchema = useFormValidation(workoutConfig);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { feedback, showFeedback, hideFeedback } = useFeedback();

  // ★ 修正1: mode設定とisSubmitSuccessfulを追加
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: yupResolver(validationSchema),
    defaultValues: generateDefaultValues(workoutConfig),
  });

  const [shouldResetForm, setShouldResetForm] = useState(false);

  const handleConfigSave = () => {
    setShouldResetForm(true);
  };

  // ★ 修正2: useEffect → useLayoutEffect
  useLayoutEffect(() => {
    if (shouldResetForm) {
      const newDefaults = generateDefaultValues(workoutConfig);
      reset(newDefaults);
      setShouldResetForm(false);
    }
  }, [shouldResetForm, workoutConfig, reset]);

  // ★ 修正3: 送信成功時のリセット処理を追加
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(generateDefaultValues(workoutConfig));
    }
  }, [isSubmitSuccessful, workoutConfig, reset]);

  const { handleSubmit: submitWorkout } = useWorkoutSubmit({
    workoutConfig,
    isCardioExercise,
    showFeedback,
  });

  // ... 残りのコード
};
```

---

### ステップ2: useWorkoutSubmit.js の修正

**場所**: `/frontend/src/hooks/useWorkoutSubmit.js`

#### 2.1 reset()呼び出しを削除

**変更前:**

```javascript
const useWorkoutSubmit = ({
  workoutConfig,
  isCardioExercise,
  showFeedback,
  reset,                    // ← 削除
  generateDefaultValues,    // ← 削除
}) => {
  const handleSubmit = useCallback(
    async data => {
      try {
        // ... API呼び出し
        showFeedback('成功', 'success');
        reset(generateDefaultValues(workoutConfig)); // ← 削除
      } catch (error) {
        showFeedback(errorMessage, 'error');
      }
    },
    [workoutConfig, isCardioExercise, showFeedback, reset, generateDefaultValues] // ← 削除
  );

  return { handleSubmit };
};
```

**変更後:**

```javascript
const useWorkoutSubmit = ({
  workoutConfig,
  isCardioExercise,
  showFeedback,
  // reset, generateDefaultValuesを削除
}) => {
  const handleSubmit = useCallback(
    async data => {
      try {
        for (const exercise of workoutConfig.exercises) {
          let submitData = null;

          if (isCardioExercise(exercise)) {
            submitData = transformCardioData(exercise, data);
          } else {
            submitData = transformStrengthData(exercise, data);
          }

          if (submitData) {
            await apiClient.post('/workouts', submitData);
          }
        }

        showFeedback(
          'ワークアウトを保存しました。頑張った自分にコーヒーブレイクでもどうですか？',
          'success'
        );
        // reset()の呼び出しを削除
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || 'エラーが発生しました';
        showFeedback(errorMessage, 'error');
      }
    },
    [workoutConfig, isCardioExercise, showFeedback] // reset, generateDefaultValuesを削除
  );

  return { handleSubmit };
};
```

---

### ステップ3: formDefaults.js の修正

**場所**: `/frontend/src/utils/formDefaults.js`

#### 3.1 null を空文字列に変更

**変更前:**

```javascript
export const generateDefaultValues = formConfig => {
  const defaults = { intensity: '' };

  formConfig.exercises.forEach(exercise => {
    const isCardio = ['ウォーキング', 'ジョギング', 'ランニング', 'サイクリング'].includes(exercise);

    if (isCardio) {
      defaults[`${exercise}_distance`] = null; // ← ''に変更
      defaults[`${exercise}_duration`] = null; // ← ''に変更
    } else {
      for (let i = 1; i <= formConfig.maxSets; i++) {
        defaults[`${exercise}_set${i}`] = null; // ← ''に変更
      }
    }
  });

  return defaults;
};
```

**変更後:**

```javascript
export const generateDefaultValues = formConfig => {
  const defaults = { intensity: '' };

  formConfig.exercises.forEach(exercise => {
    const isCardio = ['ウォーキング', 'ジョギング', 'ランニング', 'サイクリング'].includes(exercise);

    if (isCardio) {
      defaults[`${exercise}_distance`] = '';
      defaults[`${exercise}_duration`] = '';
    } else {
      for (let i = 1; i <= formConfig.maxSets; i++) {
        defaults[`${exercise}_set${i}`] = '';
      }
    }
  });

  return defaults;
};
```

---

### ステップ4: ExerciseCard.jsx の修正（推奨）

**場所**: `/frontend/src/components/WorkoutForm/ExerciseCard.jsx`

#### 4.1 field.valueにundefined対策を追加

すべてのControllerに`value={field.value ?? ''}`を追加:

**変更前:**

```javascript
<Controller
  name={`${exercise}_distance`}
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      label="距離 (km)"
      select
      fullWidth
    />
  )}
/>
```

**変更後:**

```javascript
<Controller
  name={`${exercise}_distance`}
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      value={field.value ?? ''} // ← 追加
      label="距離 (km)"
      select
      fullWidth
    />
  )}
/>
```

**適用箇所:**
- 距離入力（カーディオ）
- 時間入力（カーディオ）
- セット入力（筋トレ）

---

## テスト方法

### 手動テスト

#### テスト1: 送信後のリセット

1. ワークアウトフォームを開く
2. 任意のエクササイズに値を入力（例：懸垂 10回）
3. 「ワークアウトを保存」をクリック
4. **期待結果**: 成功メッセージ表示後、すべての入力フィールドが空になる

#### テスト2: 設定変更後のリセット

1. ワークアウトフォームに値を入力
2. 設定アイコンをクリックして設定ドロワーを開く
3. 最大セット数を変更（例：3 → 5）
4. 保存ボタンをクリック
5. **期待結果**: すべての入力フィールドがリセットされ、5セット分の入力が表示される

#### テスト3: 連続送信

1. ワークアウトを入力して送信
2. 異なるワークアウトを入力して再度送信
3. これを5回繰り返す
4. **期待結果**: 毎回、送信後に確実にリセットされる

#### テスト4: エラー時の動作

1. ネットワークを切断（DevToolsでオフライン化）
2. ワークアウトを入力して送信
3. **期待結果**: エラーメッセージが表示され、入力値は保持される

### 自動テスト（後で追加）

```javascript
// WorkoutForm.test.jsx
describe('WorkoutForm reset behavior', () => {
  it('should reset form after successful submission', async () => {
    // テスト実装
  });

  it('should reset form after config change', () => {
    // テスト実装
  });

  it('should not reset form on submission error', async () => {
    // テスト実装
  });
});
```

---

## トラブルシューティング

### 問題1: まだUIに値が残る

**原因**: ブラウザキャッシュの影響

**解決策**:
1. ハードリフレッシュ（Ctrl+Shift+R / Cmd+Shift+R）
2. `localStorage`をクリア: DevTools → Application → Local Storage → Clear All

### 問題2: 「controlled/uncontrolled」警告

**原因**: `null`値が残っている

**解決策**:
- `formDefaults.js`のすべての`null`を`''`に変更したか確認
- `ExerciseCard.jsx`で`value={field.value ?? ''}`を追加したか確認

### 問題3: 設定変更時にリセットされない

**原因**: `useEffect`が`useLayoutEffect`に変更されていない

**解決策**:
- `WorkoutForm/index.jsx`で`useLayoutEffect`を使用しているか確認
- インポート文に`useLayoutEffect`が含まれているか確認

---

## 成功基準の確認

修正後、以下の基準をすべて満たすこと:

- ✓ 送信成功後500ミリ秒以内にすべてのフィールドがクリアされる
- ✓ 設定変更後、確実にフォームがリセットされる
- ✓ 10回以上の連続送信でパフォーマンス劣化なし
- ✓ エラー時は入力値が保持される
- ✓ 空フィールドにバリデーションエラーが表示されない

---

## 参考資料

- [research.md](./research.md) - 詳細な技術調査結果
- [spec.md](./spec.md) - 機能仕様書
- [React Hook Form 公式ドキュメント](https://react-hook-form.com/)

---

## 📊 セッション進捗（2025-10-27更新）

### ✅ 完了したタスク

- **T001** ✅ `formDefaults.js`のdefaultValuesを`null`→`''`に変更
- **T002** ✅ `ExerciseCard.jsx`に`value={field.value ?? ''}`を追加
- **学習ログ作成** ✅ `/learning/daily/2025/10/2025-10-27-controlled-component-form-fix.md`

### 🚨 発見した問題

**Yupバリデーションエラー**:
```
スクワット_set2 must be a `number` type, but the final value was: `NaN`
```

**原因**: T001で`null`→`''`に変更したことで、Yupの`.number()`が空文字列を`NaN`に変換しようとしてエラー

**解決策**: T003で`useFormValidation.js`に`.transform()`を追加

### 🎯 次のタスク

**T003**: `frontend/src/hooks/useFormValidation.js`の修正

3箇所に以下を追加:
```javascript
.transform((value, originalValue) => {
  return originalValue === '' ? null : value;
})
```

**対象箇所**:
1. カーディオ距離（行19-22）
2. カーディオ時間（行23-26）
3. 筋トレセット（行29-32）

### 📝 次回セッション開始方法

```bash
/learn_pair '/Users/310tea/Documents/fittrack-app/specs/003-reset-ui-react'
```

**重要**: 次回開始時は`session-notes.md`を読み込んで、T003から再開してください。
