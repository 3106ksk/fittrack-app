# 🎯 ACQUIRE フェーズ 学習記録

---

## 📋 基本情報

### 日時・環境
- **記録日時**: 2025/01/18
- **学習時間**: 約3時間
- **プロジェクト**: FitTrack App
- **作業ブランチ**: feat/separate-workout-configs
- **関連ファイル**:
  - `frontend/src/components/FormConfigDrawer.jsx`
  - `frontend/src/hooks/useFormWorkoutConfig.js`
  - `frontend/src/components/WorkoutForm.jsx`

### カテゴリ選択
- [x] pattern - 設計パターン・アーキテクチャ

### 技術スタック
- [x] React (Hooks)
- [x] JavaScript
- [x] Material-UI
- [x] 状態管理パターン

### 優先度
- [x] high - 即座に解決が必要

---

## 🔍 学習対象・問題の詳細

### 一言でまとめると
```
Reactコンポーネントでprops管理とローカル管理を混在させた結果、状態の不整合が発生し、
ローカル管理パターンに統一することで解決した
```

### 発生状況・背景
```
[いつ]: 2025/01/18
[どこで]: FormConfigDrawer.jsx（ワークアウト設定ドロワー）
[何をしていた時]: スライダーでセット数を変更する機能を実装
[どうなった]:
1. スライダーを動かしてもUIに変更が反映されない
2. リロードすると正しく表示される
3. エクササイズを選択後、セット数を変更すると選択がリセットされる
```

### エラーパターン
```javascript
// stale closure問題
const updateMaxSets = useCallback(
  sets => {
    const newConfig = {
      ...workoutConfig,  // 古い値を参照し続ける
      maxSets: sets,
    };
    saveConfig(newConfig);
  },
  [workoutConfig, saveConfig]  // 依存配列があっても問題は解決しない
);
```

---

## 💻 コード記録

### ❌ Before - 問題のあったコード

```javascript
// FormConfigDrawer.jsx - 混在した状態管理
const FormConfigDrawer = ({ workoutConfig, updateExercises, updateMaxSets }) => {
  // exercisesはローカル管理
  const [selectedExercises, setSelectedExercises] = useState(
    workoutConfig.exercises
  );

  // workoutConfigが変わるたびに同期（問題の原因！）
  useEffect(() => {
    setSelectedExercises(workoutConfig.exercises);
  }, [workoutConfig.exercises]);

  // maxSetsはpropsから直接参照
  <Slider
    value={workoutConfig.maxSets}  // propsを参照
    onChange={(event, value) => updateMaxSets(value)}  // 即座に親を更新
  />

  // 保存ボタン
  const handleSave = () => {
    updateExercises(selectedExercises);  // exercisesのみ更新
    onClose();
  };
};
```

```javascript
// useFormWorkoutConfig.js - stale closure問題
const updateMaxSets = useCallback(
  sets => {
    const newConfig = {
      ...workoutConfig,  // クロージャーで固定された古い値
      maxSets: sets,
    };
    saveConfig(newConfig);
  },
  [workoutConfig, saveConfig]
);
```

### ✅ After - 改善後のコード

```javascript
// FormConfigDrawer.jsx - ローカル管理に統一
const FormConfigDrawer = ({ workoutConfig, updateExercises, updateMaxSets }) => {
  // 全てをローカルで一元管理
  const [localConfig, setLocalConfig] = useState({
    exercises: workoutConfig.exercises || [],
    maxSets: workoutConfig.maxSets || 5,
  });

  // ドロワーが開いた時だけ同期
  useEffect(() => {
    if (open) {
      setLocalConfig({
        exercises: workoutConfig.exercises,
        maxSets: workoutConfig.maxSets,
      });
    }
  }, [open, workoutConfig.exercises, workoutConfig.maxSets]);

  // エクササイズの選択/解除
  const handleToggle = exercise => {
    setLocalConfig(currentConfig => {
      const currentIndex = currentConfig.exercises.indexOf(exercise);
      const newExercises = [...currentConfig.exercises];

      if (currentIndex === -1) {
        newExercises.push(exercise);
      } else {
        newExercises.splice(currentIndex, 1);
      }

      return {
        ...currentConfig,
        exercises: newExercises
      };
    });
  };

  // スライダー操作
  <Slider
    value={localConfig.maxSets}  // ローカル状態を参照
    onChange={(event, value) => setLocalConfig(prev => ({
      ...prev,
      maxSets: value
    }))}
  />

  // 保存時に一括更新
  const handleSave = () => {
    if (localConfig.exercises.length === 0) {
      alert('最低1つの種目を選択してください');
      return;
    }
    updateExercises(localConfig.exercises);
    updateMaxSets(localConfig.maxSets);
    onClose();
  };
};
```

```javascript
// useFormWorkoutConfig.js - 関数型アップデートで修正
const updateMaxSets = useCallback(sets => {
  setWorkoutConfig(prevConfig => {
    const newConfig = {
      ...prevConfig,  // 実行時の最新値を参照
      maxSets: sets,
    };
    localStorage.setItem('formConfig', JSON.stringify(newConfig));
    return newConfig;
  });
}, []);  // 空の依存配列
```

---

## 🔎 調査・試行錯誤の記録

### 試したアプローチ

#### アプローチ1: 部分的なローカル管理
```javascript
// exercisesだけローカル、maxSetsはprops
const [selectedExercises, setSelectedExercises] = useState(workoutConfig.exercises);
<Slider value={workoutConfig.maxSets} />
```
**結果**: 失敗 - セット数変更時にエクササイズ選択がリセットされる

#### アプローチ2: リアルタイム更新
```javascript
onChange={(value) => updateMaxSets(value)}  // 即座に親を更新
```
**結果**: 部分的に成功 - LocalStorageは更新されるがUIに反映されない

#### アプローチ3: 完全なローカル管理
```javascript
const [localConfig, setLocalConfig] = useState({
  exercises: [],
  maxSets: 5
});
```
**結果**: 成功 - 全ての操作が期待通りに動作

### AIとの対話

**質問内容**:
```
「handleToggleはこのローカル管理のどの役割かを理解できていない。
handleToggleがどうローカル管理して、保存ボタンによる一括更新機能に
関係しているのかを解説して」
```

**得られた回答の要点**:
```
handleToggleは「編集モード」の実装パターン。
ユーザーの操作を「一時的にローカルに保存」し、
保存ボタンを押すまで親の状態に影響を与えない。
これが「下書き」のような仕組みを実現する。
```

---

## 💡 学習内容・気づき

### 技術的な学び

#### 1. Stale Closure問題
```
JavaScriptのクロージャーとReactのuseCallbackが組み合わさると、
意図せず古い状態値を参照し続ける問題が発生する。

解決策：
- 関数型アップデート: setState(prev => ...)
- 依存配列を空にする: useCallback(() => {}, [])
```

#### 2. 状態管理の原則
```
Reactコンポーネントでは「全てローカル」か「全てprops」のどちらか。
混在すると必ず状態の同期問題が発生する。

ローカル管理のメリット：
- 原子性: 全ての変更が一括で反映または破棄
- 一貫性: 中途半端な状態が存在しない
- 独立性: 編集中の状態が他に影響しない
```

#### 3. データフローの設計
```
【推奨パターン】
ドロワーを開く → 親の状態をローカルにコピー
↓
ユーザーが編集（ローカル状態のみ更新）
↓
保存ボタン → 親の状態を一括更新
キャンセル → 変更を破棄

これはデータベースのトランザクションと同じ概念。
```

### 概念的な理解

#### なぜローカル管理が良いのか
```
1. ユーザー体験
   - 編集中の変更を自由に試せる
   - 誤操作をキャンセルできる
   - 予測可能な動作

2. 技術的利点
   - propsの更新伝播を待つ必要がない
   - 状態の不整合が発生しない
   - テストが書きやすい

3. 保守性
   - データフローが明確
   - バグが発生しにくい
   - 他のコンポーネントに影響しない
```

#### いつ使うべきか
```
- モーダル/ドロワーでの編集UI
- フォームの一時的な編集
- 複数の項目を同時に変更する場合
- 確定/キャンセルの操作が必要な場合
```

---

## 🎯 次のアクション

### 理解を深めるべき点
- [x] React Hooksの依存配列の仕組み
- [x] クロージャーとstale closure問題
- [ ] useReducerを使った状態管理
- [ ] React Context APIとの組み合わせ

### 実装で検証すべき仮説
- [x] 親コンポーネントの再レンダリング確認
- [ ] 複数のドロワーを開いた時の状態管理
- [ ] 大量のデータでのパフォーマンス

### 追加で調査が必要な項目
- [ ] formConfigとworkoutConfigの統合方法
- [ ] TypeScriptでの型安全な実装
- [ ] React Hook Formとの統合

---

## 📝 メモ・備考

```
重要な学び：
- 「部分的な解決」は新たな問題を生む
- UIの状態管理は「全てか無か」の二択
- ユーザーの操作フローを先に設計すべき

面接での説明ポイント：
1. 問題の本質（stale closure）を理解している
2. 複数の解決策を試して比較検討した
3. ユーザー体験を考慮した設計選択
4. ACIDのようなDB概念をUIに適用
```

---

## 🚀 カスタムコマンド実行用

### コマンド生成情報
```yaml
topic: "Reactの状態管理でprops/ローカル混在からローカル管理統一への設計変更"
context: "FormConfigDrawerでセット数変更時にエクササイズ選択がリセットされる問題を解決"
category: pattern
stack: react
priority: high
files: "FormConfigDrawer.jsx,useFormWorkoutConfig.js,WorkoutForm.jsx"
```

---

## ✅ 提出前チェックリスト

- [x] エラーメッセージは正確にコピーした
- [x] Before/Afterのコードを記録した
- [x] 試したアプローチを全て記録した
- [x] 学習内容を言語化した
- [x] 機密情報や個人情報は含まれていない
- [x] 次のアクションが明確になった