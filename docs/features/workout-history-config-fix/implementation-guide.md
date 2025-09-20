# WorkoutHistory設定管理 - 実装ガイド

**文書番号**: IMG-WH-002
**バージョン**: 2.0.0
**作成日**: 2025-09-20
**ステータス**: FormConfigパターン準拠版

## 1. 実装概要

### 1.1 実装方針
**FormConfigパターン完全準拠**を最優先とし、クロージャー問題を根本的に解決する実装を行います。

### 1.2 優先順位
1. **P0 (必須)**: クロージャー問題の修正（関数型アップデート）
2. **P0 (必須)**: FormConfigと同一パターンの実装
3. **P1 (重要)**: プリセット機能の削除
4. **P2 (推奨)**: 順番変更機能の実装

### 1.3 ファイル構成
```
frontend/src/
├── pages/
│   └── WorkoutHistory.jsx
├── components/
│   ├── WorkoutCustomizationDrawer.jsx
│   └── WorkoutHistoryTable.jsx
├── hooks/
│   └── useWorkoutConfig.js
└── utils/
    └── workoutStorage.js
```

## 2. Phase 1: FormConfigパターン適用（推定時間: 3時間）

### Step 1.1: useWorkoutConfig.jsの修正

```javascript
// hooks/useWorkoutConfig.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXERCISE_DATABASE, WORKOUT_TYPES } from '../data/exercises';

const useWorkoutConfig = () => {
  // 1. exerciseDataの生成（FormConfigと同一）
  const exerciseData = useMemo(() => {
    const cardio = [];
    const strength = [];
    const nameMapping = {};

    Object.values(EXERCISE_DATABASE).forEach(exercise => {
      nameMapping[exercise.id] = exercise.name;

      if (exercise.type === WORKOUT_TYPES.CARDIO) {
        cardio.push(exercise.name);
      } else if (exercise.type === WORKOUT_TYPES.STRENGTH) {
        strength.push(exercise.name);
      }
    });

    return {
      cardio,
      strength,
      all: [...cardio, ...strength],
      nameMapping,
      database: EXERCISE_DATABASE,
    };
  }, []);

  // 2. 初期状態設定
  const [workoutConfig, setWorkoutConfig] = useState({
    exercises: [
      exerciseData.nameMapping.pushup || 'プッシュアップ',
      exerciseData.nameMapping.squat || 'スクワット',
      exerciseData.nameMapping.walking || 'ウォーキング',
    ],
    maxSets: 3,
  });

  // 3. カーディオ判定
  const isCardioExercise = useCallback(
    exerciseName => {
      return exerciseData.cardio.includes(exerciseName);
    },
    [exerciseData.cardio]
  );

  // 4. LocalStorageから読込（プリセット除外）
  useEffect(() => {
    const savedConfig = localStorage.getItem('workoutConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // プリセット関連フィールドを除外
        const { presets, ...validConfig } = parsed;

        const validExercises = validConfig.exercises?.filter(exercise =>
          exerciseData.all.includes(exercise)
        ) || [];

        setWorkoutConfig({
          exercises: validExercises.length > 0
            ? validExercises
            : workoutConfig.exercises,
          maxSets: validConfig.maxSets || 3,
        });
      } catch (error) {
        console.error('設定読み込み失敗:', error);
      }
    }
  }, [exerciseData.all]);

  // 5. 個別更新メソッド（関数型アップデートでクロージャー問題回避）
  const updateExercises = useCallback(exercises => {
    if (!exercises || exercises.length === 0) {
      alert('最低1つの運動は必要です');
      return;
    }

    const validExercises = exercises.filter(exercise =>
      exerciseData.all.includes(exercise)
    );

    if (validExercises.length === 0) {
      alert('有効な種目を選択してください');
      return;
    }

    setWorkoutConfig(prevConfig => {
      const newConfig = {
        ...prevConfig,
        exercises: validExercises,
      };
      localStorage.setItem('workoutConfig', JSON.stringify(newConfig));
      return newConfig;
    });
  }, [exerciseData.all]);

  const updateMaxSets = useCallback(sets => {
    setWorkoutConfig(prevConfig => {
      const newConfig = {
        ...prevConfig,
        maxSets: sets,
      };
      localStorage.setItem('workoutConfig', JSON.stringify(newConfig));
      return newConfig;
    });
  }, []); // 空の依存配列（クロージャー問題回避）

  return {
    workoutConfig,
    availableExercises: exerciseData.all,
    isCardioExercise,
    updateExercises,
    updateMaxSets,
  };
};

export default useWorkoutConfig;
```

### Step 1.2: WorkoutCustomizationDrawer.jsxの修正

```javascript
// components/WorkoutCustomizationDrawer.jsx
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  FitnessCenter as FitnessCenterIcon,
  DirectionsRun as RunIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';

const WorkoutCustomizationDrawer = ({
  open,
  onClose,
  workoutConfig,
  availableExercises,
  isCardioExercise,
  updateExercises,  // FormConfigと同一
  updateMaxSets,     // FormConfigと同一
}) => {
  // 1. ローカル状態管理（FormConfigDrawerと完全同一）
  const [localConfig, setLocalConfig] = useState({
    exercises: workoutConfig.exercises || [],
    maxSets: workoutConfig.maxSets || 3,
  });

  // 2. ドロワーを開いた時の初期化（FormConfigと同一）
  useEffect(() => {
    if (open) {
      setLocalConfig({
        exercises: workoutConfig.exercises,
        maxSets: workoutConfig.maxSets,
      });
    }
  }, [open, workoutConfig.exercises, workoutConfig.maxSets]);

  // 3. 種目トグル（FormConfigと同一パターン）
  const handleToggle = (exercise) => {
    setLocalConfig(currentConfig => {
      const currentIndex = currentConfig.exercises.indexOf(exercise);
      const newExercises = [...currentConfig.exercises];

      if (currentIndex === -1) {
        // 追加
        if (newExercises.length >= 5) {
          alert('種目は最大5つまでです');
          return currentConfig;
        }
        newExercises.push(exercise);
      } else {
        // 削除
        if (newExercises.length <= 1) {
          alert('最低1つの種目が必要です');
          return currentConfig;
        }
        newExercises.splice(currentIndex, 1);
      }

      return {
        ...currentConfig,
        exercises: newExercises
      };
    });
  };

  // 4. セット数変更
  const handleMaxSetsChange = (event, value) => {
    setLocalConfig(prev => ({
      ...prev,
      maxSets: value
    }));
  };

  // 5. 保存（FormConfigと同一）
  const handleSave = () => {
    if (localConfig.exercises.length === 0) {
      alert('最低1つの種目を選択してください');
      return;
    }
    updateExercises(localConfig.exercises);
    updateMaxSets(localConfig.maxSets);
    onClose();
  };

  // 6. キャンセル（FormConfigと同一）
  const handleCancel = () => {
    setLocalConfig({
      exercises: workoutConfig.exercises,
      maxSets: workoutConfig.maxSets
    });
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCancel}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">ワークアウトカスタマイズ設定</Typography>
          <IconButton onClick={handleCancel} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* 現在選択中の種目 */}
          <Typography variant="subtitle1" gutterBottom>
            現在選択中の種目 ({localConfig.exercises.length}/5)
          </Typography>

          {/* 種目リスト（チェックボックス方式） */}
          <List>
            {availableExercises.map(exercise => {
              const isSelected = localConfig.exercises.includes(exercise);
              const isDisabled = !isSelected && localConfig.exercises.length >= 5;

              return (
                <ListItem
                  key={exercise}
                  onClick={() => !isDisabled && handleToggle(exercise)}
                  sx={{
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={isSelected}
                    disabled={isDisabled}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemIcon>
                    {isCardioExercise(exercise) ? (
                      <RunIcon color="secondary" fontSize="small" />
                    ) : (
                      <FitnessCenterIcon color="primary" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={exercise}
                    secondary={isCardioExercise(exercise) ? 'カーディオ' : '筋トレ'}
                  />
                </ListItem>
              );
            })}
          </List>

          {/* セット数設定 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              筋トレ設定
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              最大セット数: {localConfig.maxSets}
            </Typography>
            <Slider
              value={localConfig.maxSets}
              min={1}
              max={5}
              marks
              valueLabelDisplay="auto"
              onChange={handleMaxSetsChange}
            />
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="outlined" fullWidth onClick={handleCancel}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            disabled={localConfig.exercises.length === 0}
          >
            設定を適用
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default WorkoutCustomizationDrawer;
```

### Step 1.3: WorkoutHistory.jsxの更新

```javascript
// pages/WorkoutHistory.jsx
import { useState } from 'react';
import { Button } from '@mui/material';
import WorkoutCustomizationDrawer from '../components/WorkoutCustomizationDrawer';
import WorkoutHistoryTable from '../components/WorkoutHistoryTable';
import useWorkoutConfig from '../hooks/useWorkoutConfig';

const WorkoutHistory = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // useWorkoutConfigから必要な要素を取得
  const {
    workoutConfig,
    availableExercises,
    isCardioExercise,
    updateExercises,  // 個別更新メソッド
    updateMaxSets,     // 個別更新メソッド
  } = useWorkoutConfig();

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setDrawerOpen(true)}
      >
        設定をカスタマイズ
      </Button>

      <WorkoutHistoryTable
        workoutConfig={workoutConfig}
      />

      <WorkoutCustomizationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        workoutConfig={workoutConfig}
        availableExercises={availableExercises}
        isCardioExercise={isCardioExercise}
        updateExercises={updateExercises}  // FormConfigと同一
        updateMaxSets={updateMaxSets}       // FormConfigと同一
      />
    </>
  );
};

export default WorkoutHistory;
```

## 3. Phase 2: 順番変更機能（推定時間: 2時間）

### Step 2.1: ドラッグ&ドロップライブラリの導入

```bash
npm install react-beautiful-dnd
# または
npm install @dnd-kit/sortable @dnd-kit/core
```

### Step 2.2: WorkoutCustomizationDrawerに順番変更機能追加

```javascript
// handleReorderメソッドを追加
const handleReorder = (fromIndex, toIndex) => {
  setLocalConfig(currentConfig => {
    const newExercises = [...currentConfig.exercises];
    const [movedItem] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, movedItem);

    return {
      ...currentConfig,
      exercises: newExercises
    };
  });
};

// DraggableListコンポーネントの実装
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const DraggableExerciseList = ({ exercises, onReorder, onRemove }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="exercises">
        {(provided) => (
          <List {...provided.droppableProps} ref={provided.innerRef}>
            {exercises.map((exercise, index) => (
              <Draggable key={exercise} draggableId={exercise} index={index}>
                {(provided, snapshot) => (
                  <ListItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      backgroundColor: snapshot.isDragging ? '#f0f0f0' : 'white',
                    }}
                  >
                    <DragIndicatorIcon />
                    <ListItemText primary={exercise} />
                    <IconButton onClick={() => onRemove(exercise)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
};
```

### Step 2.3: WorkoutHistoryTableの動的表示

```javascript
// components/WorkoutHistoryTable.jsx
const WorkoutHistoryTable = ({ workoutConfig }) => {
  // workoutConfig.exercisesの順番通りに列を生成
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>日付</TableCell>
          {workoutConfig.exercises.map(exercise => (
            <TableCell key={exercise}>
              {exercise}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {/* データ行も同じ順番で表示 */}
      </TableBody>
    </Table>
  );
};
```

## 4. テスト実装

### 4.1 単体テスト

```javascript
// __tests__/useWorkoutConfig.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import useWorkoutConfig from '../hooks/useWorkoutConfig';

describe('useWorkoutConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('関数型アップデートで最新値を参照する', () => {
    const { result } = renderHook(() => useWorkoutConfig());

    act(() => {
      result.current.updateMaxSets(4);
    });

    expect(result.current.workoutConfig.maxSets).toBe(4);

    // 連続更新でもクロージャー問題が発生しない
    act(() => {
      result.current.updateMaxSets(5);
    });

    expect(result.current.workoutConfig.maxSets).toBe(5);
  });

  it('プリセット関連フィールドを除外する', () => {
    localStorage.setItem('workoutConfig', JSON.stringify({
      exercises: ['プッシュアップ'],
      maxSets: 3,
      presets: { test: {} }  // 除外される
    }));

    const { result } = renderHook(() => useWorkoutConfig());

    expect(result.current.workoutConfig.presets).toBeUndefined();
  });
});
```

### 4.2 統合テスト

```javascript
// __tests__/WorkoutCustomizationDrawer.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkoutCustomizationDrawer from '../components/WorkoutCustomizationDrawer';

describe('WorkoutCustomizationDrawer', () => {
  const mockProps = {
    open: true,
    onClose: jest.fn(),
    workoutConfig: {
      exercises: ['プッシュアップ'],
      maxSets: 3
    },
    availableExercises: ['プッシュアップ', 'スクワット', 'ウォーキング'],
    isCardioExercise: jest.fn(),
    updateExercises: jest.fn(),
    updateMaxSets: jest.fn()
  };

  it('localConfigで編集し、保存時に親を更新', async () => {
    render(<WorkoutCustomizationDrawer {...mockProps} />);

    // チェックボックスをクリック
    const squatCheckbox = screen.getByLabelText('スクワット');
    fireEvent.click(squatCheckbox);

    // この時点では親の更新メソッドは呼ばれない
    expect(mockProps.updateExercises).not.toHaveBeenCalled();

    // 保存ボタンをクリック
    const saveButton = screen.getByText('設定を適用');
    fireEvent.click(saveButton);

    // 親の更新メソッドが呼ばれる
    await waitFor(() => {
      expect(mockProps.updateExercises).toHaveBeenCalledWith(
        ['プッシュアップ', 'スクワット']
      );
    });
  });
});
```

## 5. デプロイチェックリスト

### 開発環境
- [ ] ローカル環境でのテスト完了
- [ ] ESLintエラーなし
- [ ] コンソールエラーなし

### コードレビュー
- [ ] クロージャー問題の解決確認
- [ ] FormConfigとの一貫性確認
- [ ] 不要コード削除の確認

### テスト
- [ ] 単体テスト実行・通過
- [ ] 統合テスト実行・通過
- [ ] 手動テストシナリオ完了

### ドキュメント
- [ ] 設計書の更新
- [ ] READMEの更新
- [ ] コメントの追加

## 6. トラブルシューティング

### 問題1: スライダー操作が反映されない
**原因**: クロージャー問題
**解決**: 関数型アップデート使用
```javascript
// ❌ 悪い例
setConfig({...config, maxSets: value});

// ✅ 良い例
setConfig(prev => ({...prev, maxSets: value}));
```

### 問題2: 種目選択がリセットされる
**原因**: propsとローカル状態の混在
**解決**: 完全なローカル状態管理
```javascript
// localConfigで全て管理
const [localConfig, setLocalConfig] = useState({
  exercises: [],
  maxSets: 3
});
```

### 問題3: LocalStorageのデータ不整合
**原因**: プリセット関連フィールド
**解決**: 読み込み時に除外
```javascript
const { presets, ...validConfig } = parsed;
```