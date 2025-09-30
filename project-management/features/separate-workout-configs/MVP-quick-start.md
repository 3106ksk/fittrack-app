# MVP実装 - すぐに始められるコード

## 🚀 30分で実装できる最小バージョン

### 1. フォーム設定フック（5分）

`frontend/src/hooks/useFormWorkoutConfig.js`を作成:

```javascript
import { useState, useEffect } from 'react';
import { EXERCISE_DATABASE } from '../data/exercises';

export const useFormWorkoutConfig = () => {
  // デフォルトは既存のuseWorkoutConfigから取得
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('formConfig');
    if (saved) return JSON.parse(saved);

    // 既存設定からコピー（初回のみ）
    const oldConfig = localStorage.getItem('workoutConfig');
    if (oldConfig) {
      const parsed = JSON.parse(oldConfig);
      return {
        exercises: parsed.exercises || ['プッシュアップ', 'スクワット'],
        maxSets: parsed.maxSets || 3
      };
    }

    return {
      exercises: ['プッシュアップ', 'スクワット', 'ランニング'],
      maxSets: 3
    };
  });

  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('formConfig', JSON.stringify(newConfig));
  };

  const updateExercises = (exercises) => {
    saveConfig({ ...config, exercises });
  };

  const updateMaxSets = (maxSets) => {
    saveConfig({ ...config, maxSets });
  };

  // 既存のuseWorkoutConfigと互換性を保つ
  const isCardioExercise = (exerciseName) => {
    const exercise = Object.values(EXERCISE_DATABASE).find(
      e => e.name === exerciseName
    );
    return exercise?.type === 'cardio';
  };

  return {
    workoutConfig: config,  // 既存コードとの互換性
    config,
    saveConfig,
    updateExercises,
    updateMaxSets,
    isCardioExercise,
    availableExercises: Object.values(EXERCISE_DATABASE).map(e => e.name)
  };
};
```

### 2. WorkoutFormの最小修正（10分）

`frontend/src/components/WorkoutForm.jsx`の修正:

```javascript
// 既存のインポート部分を変更
// import useWorkoutConfig from '../hooks/useWorkoutConfig';
import { useFormWorkoutConfig } from '../hooks/useFormWorkoutConfig';  // 新しいフック
import { useState } from 'react';
import { IconButton, Drawer, List, ListItem, Checkbox, Button, Box, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const WorkoutForm = () => {
  // 既存のuseWorkoutConfigを新しいフックに置き換え
  const { config, updateExercises, availableExercises, isCardioExercise } = useFormWorkoutConfig();

  // 設定ドロワーの状態
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tempExercises, setTempExercises] = useState(config.exercises);

  // 既存のformConfigをconfigに置き換え
  // const formConfig = useFormConfig(); を削除
  // formConfig.exercises を config.exercises に変更
  // formConfig.maxSets を config.maxSets に変更

  // 既存のフォーム処理はそのまま...

  const handleExerciseToggle = (exercise) => {
    if (tempExercises.includes(exercise)) {
      setTempExercises(tempExercises.filter(e => e !== exercise));
    } else {
      setTempExercises([...tempExercises, exercise]);
    }
  };

  const handleSaveConfig = () => {
    updateExercises(tempExercises);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* 既存のフォームUI */}

      {/* 設定ボタンを追加（タイトルの横など） */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">ワークアウト記録</Typography>
        <IconButton onClick={() => setDrawerOpen(true)} sx={{ ml: 2 }}>
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* 簡易設定ドロワー */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            フォーム表示種目
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            入力フォームに表示する種目を選択
          </Typography>

          <List>
            {availableExercises.map(exercise => (
              <ListItem key={exercise} disablePadding>
                <Checkbox
                  checked={tempExercises.includes(exercise)}
                  onChange={() => handleExerciseToggle(exercise)}
                />
                <Typography>{exercise}</Typography>
                {isCardioExercise(exercise) &&
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    (カーディオ)
                  </Typography>
                }
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handleSaveConfig} fullWidth>
              保存
            </Button>
            <Button variant="outlined" onClick={() => setDrawerOpen(false)} fullWidth>
              キャンセル
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* 既存のフォーム部分（config.exercisesを使うように変更） */}
      {config.exercises.map(exercise => (
        // 既存の入力フィールド
      ))}
    </>
  );
};
```

### 3. useFormConfigの修正（5分）

`frontend/src/hooks/useFormConfig.js`:

```javascript
import { useMemo } from 'react';
// import useWorkoutConfig from './useWorkoutConfig';
import { useFormWorkoutConfig } from './useFormWorkoutConfig';  // 変更

const useFormConfig = () => {
  const { config } = useFormWorkoutConfig();  // 変更

  return useMemo(() => ({
    exercises: config.exercises,  // workoutConfig → config
    maxSets: config.maxSets
  }), [config.exercises, config.maxSets]);
};

export default useFormConfig;
```

### 4. 動作確認（10分）

1. アプリを起動
2. WorkoutFormページで設定アイコンをクリック
3. 種目を選択/解除
4. 保存
5. ページをリロードして設定が維持されているか確認

## 🎯 さらに簡単バージョン（10分で完了）

既存コードを最小限の変更で対応:

```javascript
// WorkoutForm.jsxの上部に追加するだけ
const WorkoutForm = () => {
  // 設定をローカルに管理
  const [localExercises, setLocalExercises] = useState(() => {
    const saved = localStorage.getItem('formExercises');
    return saved ? JSON.parse(saved) : null;
  });

  // 既存のuseWorkoutConfigはフォールバックとして使用
  const { workoutConfig, isCardioExercise } = useWorkoutConfig();

  // localExercisesがあればそれを使い、なければ既存設定を使用
  const exercises = localExercises || workoutConfig.exercises;

  // 設定保存（超シンプル版）
  const handleQuickSettings = () => {
    const input = prompt('使用する種目をカンマ区切りで入力\n例: プッシュアップ,スクワット,ランニング', exercises.join(','));
    if (input) {
      const newExercises = input.split(',').map(e => e.trim());
      setLocalExercises(newExercises);
      localStorage.setItem('formExercises', JSON.stringify(newExercises));
    }
  };

  // あとは exercises を使って既存のフォームを表示
};
```

## ✅ 完了チェックリスト

- [ ] formConfigがLocalStorageに保存される
- [ ] ページリロード後も設定が保持される
- [ ] WorkoutHistoryには影響しない
- [ ] UIで種目の選択/解除ができる

## 🔥 トラブルシューティング

**Q: エラーが出る**
A: まずは既存のuseWorkoutConfigをそのまま使い、設定だけ別キーに保存する最小実装から始める

**Q: 種目リストが表示されない**
A: EXERCISE_DATABASEのインポートパスを確認。エラーが出たらハードコードの配列で代用

**Q: 保存されない**
A: LocalStorageの容量を確認。開発者ツールのApplicationタブでクリア

---

これで**30分以内**に動作するMVPが完成します。完璧でなくていい、まず動かす！