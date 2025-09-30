# 🐛 ワークアウトフォームリセットバグ - 詳細レポート

## 概要

ワークアウトフォームにおいて、フォーム送信後に入力値がリセットされない問題が継続的に発生しています。
**報告日**: 2025-09-30

## 🔴 問題の症状

### 1. **主要なバグ**

- **問題**: フォーム送信成功後、入力した値（回数、距離、時間等）がフォームに残る
- **期待される動作**: 送信成功後、すべての入力値がクリアされる
- **影響**: ユーザーが同じ値を重複送信する可能性がある

### 2. **副次的な問題**

- **問題**: 設定変更時のリセット処理が不安定
- **期待される動作**: 設定変更時、確認後にフォームがリセットされる
- **現状**: リセット処理は実行されるが、UI に反映されない場合がある

## 🔍 技術的詳細

### 環境

- **フレームワーク**: React 18.x
- **フォームライブラリ**: React Hook Form 7.x
- **UI ライブラリ**: Material-UI 5.x
- **状態管理**: カスタムフック（useFormConfig, useWorkoutSubmit）

### 関連ファイル

```
frontend/src/
├── components/
│   ├── WorkoutForm/
│   │   ├── index.jsx          # メインフォームコンポーネント
│   │   └── ExerciseCard.jsx   # 各種目の入力UI
│   └── FormConfigDrawer.jsx   # 設定変更UI
├── hooks/
│   ├── useFormConfig.js       # フォーム設定管理
│   ├── useWorkoutSubmit.js    # 送信処理
│   └── useWorkoutConfig.js    # ワークアウト設定管理
└── utils/
    └── formDefaults.js        # デフォルト値生成
```

## 🔬 調査結果

### 1. **送信処理のフロー**

```javascript
// useWorkoutSubmit.js
1. データ送信成功
2. showFeedback() で成功メッセージ表示
3. reset(generateDefaultValues(workoutConfig)) 実行
4. → しかし、フォームの値が残る
```

### 2. **問題の可能性**

#### A. React Hook Form の`reset()`が正しく動作していない

- `reset()`は呼ばれているが、UI に反映されない
- React Hook Form の内部状態と UI の同期問題

#### B. 複数の useEffect による競合

- 以前のコード:
  ```javascript
  useEffect(() => {
    const newDefaults = generateDefaultValues(workoutConfig);
    Object.keys(newDefaults).forEach((key) => {
      setValue(key, newDefaults[key]);
    });
  }, [workoutConfig, setValue]);
  ```
- この useEffect が削除されたが、別の場所で同様の処理が残っている可能性

#### C. LocalStorage の影響

- `formConfig`と`workoutConfig`の 2 つのキーが存在
- 異なるフックが異なる LocalStorage キーを参照
- データの不整合が発生している可能性

#### D. 非同期処理のタイミング問題

- `reset()`の実行タイミング
- コンポーネントの再レンダリング
- 状態更新の順序

## 📊 デバッグログ分析

### 送信時のログ

```
送信成功後のreset実行前
リセット用デフォルト値: {intensity: '', 懸垂_set1: null, ...}
WorkoutForm内 - reset関数が呼ばれた: {intensity: '', ...}
送信成功後のreset実行完了
現在のフォーム値: {intensity: '', 懸垂_set1: null, ...}  // ← 正しくリセットされている
```

**しかし、UI には値が残っている** → React Hook Form と UI の同期問題

## 🎯 試みた修正と結果

| 修正内容                            | 結果          | 問題点                     |
| ----------------------------------- | ------------- | -------------------------- |
| useEffect で setValue()を使用       | ❌ 失敗       | 設定変更時に不要なリセット |
| useEffect を削除                    | ❌ 失敗       | 送信後のリセットが効かない |
| 条件付きリセット（shouldResetForm） | ⚠️ 部分的成功 | 設定変更時のみ動作         |
| reset()にオプション追加             | ❌ 失敗       | 根本解決にならず           |

## 🚀 推奨される解決策

### 1. **即座の対処法**

```javascript
// 強制的にフォームを再マウント
const [formKey, setFormKey] = useState(0);

const handleSubmitSuccess = () => {
  setFormKey((prev) => prev + 1);
};

<WorkoutForm key={formKey} />;
```

### 2. **根本的な解決**

- React Hook Form のバージョン確認とアップデート
- `reset()`の代わりに、各フィールドを個別にクリア
- フォームの状態管理を一元化

### 3. **調査が必要な項目**

- [ ] React Hook Form のバージョンと既知の問題確認
- [ ] コンポーネントの再レンダリングタイミング
- [ ] LocalStorage の完全クリア後の動作確認
- [ ] 他のブラウザでの動作確認

## 📝 再現手順

1. ワークアウトフォームページを開く
2. 任意の種目に値を入力（例：プッシュアップ 15 回）
3. 送信ボタンをクリック
4. 成功メッセージが表示される
5. **バグ**: フォームに入力した値（15 回）が残っている

## 🔧 次のステップ

1. React Hook Form の最新ドキュメント確認
2. `useForm`の`mode`オプション調整
3. カスタムリセット関数の実装
4. E2E テストの作成

## 📌 優先度

**高** - ユーザーエクスペリエンスに直接影響する重要なバグ

---

作成日: 2024 年
最終更新: 現在
