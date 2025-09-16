# MVP版: ワークアウト設定分離 - 実装計画

**目標**: 2-3日で動作する最小限の実装
**方針**: TypeScript後回し、動くものを優先

## 🎯 MVP スコープ（これだけやる）

### 必須機能
1. ✅ フォーム用とヒストリー用の設定を別々のLocalStorageキーに保存
2. ✅ 各画面に設定ボタンを追加
3. ✅ 種目選択UIの実装（チェックボックスリスト）
4. ✅ 設定の保存と読み込み

### やらないこと
- ❌ TypeScript型定義
- ❌ 複雑なマイグレーション
- ❌ エラーハンドリングの網羅
- ❌ パフォーマンス最適化
- ❌ テストコード
- ❌ 設定同期機能

## 📁 最小限のファイル構成

```
frontend/src/
├── hooks/
│   ├── useFormWorkoutConfig.js      # NEW: フォーム設定フック
│   └── useHistoryWorkoutConfig.js   # NEW: ヒストリー設定フック
└── components/
    └── WorkoutForm/
        └── FormConfigDrawer.jsx     # NEW: フォーム設定UI
```

## 🚀 Day 1: 基本実装（4-6時間）

### Step 1: Custom Hooks作成（1時間）

**useFormWorkoutConfig.js**
```javascript
import { useState, useEffect } from 'react';

const DEFAULT_CONFIG = {
  exercises: ['プッシュアップ', 'スクワット', 'ランニング'],
  maxSets: 3
};

export const useFormWorkoutConfig = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // 読み込み
  useEffect(() => {
    const saved = localStorage.getItem('formConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  // 保存
  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('formConfig', JSON.stringify(newConfig));
  };

  return { config, saveConfig };
};
```

**useHistoryWorkoutConfig.js** (同様の構造でコピー)

### Step 2: 設定UIコンポーネント（2時間）

**FormConfigDrawer.jsx**
```javascript
import { Drawer, List, ListItem, Checkbox, Button } from '@mui/material';
import { useState } from 'react';

const AVAILABLE_EXERCISES = [
  'プッシュアップ', 'スクワット', 'ランニング',
  'プランク', '懸垂', 'ウォーキング'
];

const FormConfigDrawer = ({ open, onClose, config, onSave }) => {
  const [selected, setSelected] = useState(config.exercises);

  const handleToggle = (exercise) => {
    if (selected.includes(exercise)) {
      setSelected(selected.filter(e => e !== exercise));
    } else {
      setSelected([...selected, exercise]);
    }
  };

  const handleSave = () => {
    onSave({ ...config, exercises: selected });
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div style={{ width: 300, padding: 20 }}>
        <h3>フォーム設定</h3>
        <List>
          {AVAILABLE_EXERCISES.map(exercise => (
            <ListItem key={exercise}>
              <Checkbox
                checked={selected.includes(exercise)}
                onChange={() => handleToggle(exercise)}
              />
              {exercise}
            </ListItem>
          ))}
        </List>
        <Button onClick={handleSave} variant="contained">
          保存
        </Button>
      </div>
    </Drawer>
  );
};
```

### Step 3: 既存コンポーネントの更新（1-2時間）

**WorkoutForm.jsx** (追加部分のみ)
```javascript
import { useFormWorkoutConfig } from '../hooks/useFormWorkoutConfig';
import FormConfigDrawer from './FormConfigDrawer';
import { IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const WorkoutForm = () => {
  const { config, saveConfig } = useFormWorkoutConfig();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 既存コードはそのまま
  // formConfigの代わりにconfig.exercisesを使用

  return (
    <>
      {/* 既存のフォーム */}

      {/* 設定ボタン追加 */}
      <IconButton onClick={() => setDrawerOpen(true)}>
        <SettingsIcon />
      </IconButton>

      {/* 設定ドロワー */}
      <FormConfigDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        config={config}
        onSave={saveConfig}
      />
    </>
  );
};
```

## 🚀 Day 2: 動作確認と調整（2-3時間）

1. **動作テスト**
   - フォームで設定変更 → LocalStorage確認
   - ページリロード → 設定が維持されるか確認
   - ヒストリー側も同様に実装

2. **バグ修正**
   - 最小限のエラーハンドリング追加
   - UIの微調整

3. **完了確認**
   - フォームとヒストリーが独立して動作
   - 設定が保存される
   - UIが機能する

## ⚡ 超シンプル版（さらに簡略化）

もっと早く実装したい場合:

```javascript
// 1ファイルで全部やる版
const WorkoutForm = () => {
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('formExercises');
    return saved ? JSON.parse(saved) : ['プッシュアップ', 'スクワット'];
  });

  const updateExercises = (newExercises) => {
    setExercises(newExercises);
    localStorage.setItem('formExercises', JSON.stringify(newExercises));
  };

  // UIレンダリング...
};
```

## 📊 時間見積もり

| タスク | 時間 | 優先度 |
|-------|------|--------|
| Custom Hooks作成 | 1時間 | 必須 |
| 設定UI作成 | 2時間 | 必須 |
| 既存コンポーネント更新 | 1-2時間 | 必須 |
| 動作確認 | 1時間 | 必須 |
| **合計** | **5-6時間** | - |

## ✅ 完了基準

- [ ] フォームの設定がlocalStorage['formConfig']に保存される
- [ ] ヒストリーの設定がlocalStorage['historyConfig']に保存される
- [ ] 各画面で独立して種目を選択できる
- [ ] ページリロード後も設定が維持される

## 🔧 後で追加する機能（Phase 2）

1. TypeScript化
2. エラーハンドリング強化
3. 設定同期機能
4. プリセット機能
5. テストコード
6. パフォーマンス最適化

---

**重要**: まず動くものを作る。完璧は後回し。