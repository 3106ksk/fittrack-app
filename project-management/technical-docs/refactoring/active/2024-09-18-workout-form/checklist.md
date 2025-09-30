# 📝 WorkoutFormリファクタリング 実装チェックリスト

## 🚀 開始前の準備

### 環境準備
- [ ] リポジトリが最新状態 `git pull origin main`
- [ ] node_modulesが最新 `npm install`
- [ ] 現在のアプリが正常動作することを確認
- [ ] 開発サーバー起動確認 `npm run dev`

### ブランチ作成
- [ ] mainブランチにいることを確認 `git branch --show-current`
- [ ] 新規ブランチ作成 `git checkout -b refactor/workout-form-single-responsibility`
- [ ] ブランチがpushされていることを確認（Draft PR用）

## 📦 Phase 1: 定数の分離（30分）

### 実装
- [ ] ディレクトリ作成 `mkdir -p frontend/src/components/WorkoutForm`
- [ ] `constants.js`ファイル作成
- [ ] 以下の定数を移動:
  - [ ] DISTANCE_OPTIONS
  - [ ] DURATION_OPTIONS
  - [ ] REPS_OPTIONS
  - [ ] INTENSITY_LEVELS（新規作成）

### コード変更
```javascript
// 削除する行（WorkoutForm.jsx）
- const DISTANCE_OPTIONS = Array.from({ length: 21 }, (_, i) => (i * 0.5).toFixed(1));
- const DURATION_OPTIONS = Array.from({ length: 25 }, (_, i) => i * 5).filter(d => d > 0);
- const REPS_OPTIONS = [5, 10, 15, 20, 25, 30];

// 追加する行（WorkoutForm.jsx）
+ import { DISTANCE_OPTIONS, DURATION_OPTIONS, REPS_OPTIONS, INTENSITY_LEVELS } from './constants';
```

### 動作確認
- [ ] ビルドエラーがないこと
- [ ] ドロップダウンの選択肢が表示されること
- [ ] 数値の選択が正常に動作すること

### コミット
- [ ] `git add frontend/src/components/WorkoutForm/constants.js`
- [ ] `git add frontend/src/components/WorkoutForm.jsx`
- [ ] `git commit -m "refactor(WorkoutForm): extract constants to separate file"`

## 🔔 Phase 2: フィードバック機能の分離（45分）

### 実装
- [ ] `frontend/src/hooks/useFeedback.js`作成
- [ ] フィードバック状態管理を移動
- [ ] showFeedback関数を移動
- [ ] useEffectのタイマー処理を移動

### コード変更
```javascript
// WorkoutForm.jsxで削除
- const [feedback, setFeedback] = useState({ message: '', type: '', visible: false });
- const showFeedback = (message, type) => { ... }
- useEffect(() => { ... }, [feedback.visible]);

// WorkoutForm.jsxで追加
+ import useFeedback from '../hooks/useFeedback';
+ const { feedback, showFeedback } = useFeedback();
```

### 動作確認
- [ ] 保存成功メッセージが表示される
- [ ] エラーメッセージが表示される
- [ ] 3秒後に自動的に消える
- [ ] 複数回連続で表示できる

### コミット
- [ ] `git add frontend/src/hooks/useFeedback.js`
- [ ] `git add frontend/src/components/WorkoutForm.jsx`
- [ ] `git commit -m "refactor(WorkoutForm): extract feedback logic to custom hook"`

## 📤 Phase 3: 送信ロジックの分離（1時間）

### 実装
- [ ] `frontend/src/hooks/useWorkoutSubmit.js`作成
- [ ] onSubmit関数のロジックを移動
- [ ] APIコール処理を整理
- [ ] エラーハンドリングを含める

### データフロー確認
- [ ] カーディオデータの変換処理
  - [ ] distance: string → number
  - [ ] duration: 分 → 秒
- [ ] 筋トレデータの変換処理
  - [ ] repsData配列の生成
  - [ ] setNumberの計算

### 動作確認
- [ ] カーディオ運動の保存成功
- [ ] 筋トレの保存成功
- [ ] 空データの場合はAPIコールしない
- [ ] エラー時のフィードバック表示
- [ ] 保存後のフォームリセット

### コミット
- [ ] `git add frontend/src/hooks/useWorkoutSubmit.js`
- [ ] `git add frontend/src/components/WorkoutForm.jsx`
- [ ] `git commit -m "refactor(WorkoutForm): extract submit logic to custom hook"`

## 🎨 Phase 4: UIコンポーネントの分割（2時間）

### ディレクトリ構造
```
frontend/src/components/WorkoutForm/
├── index.jsx                 # 作成
├── WorkoutForm.jsx           # 移動・修正
├── components/               # 作成
│   ├── WorkoutHeader.jsx    # 作成
│   ├── ExerciseCard.jsx     # 作成
│   ├── CardioFields.jsx     # 作成
│   └── StrengthFields.jsx   # 作成
└── constants.js             # 既存
```

### WorkoutHeader.jsx
- [ ] タイトル表示部分を分離
- [ ] 設定中の種目表示を含める
- [ ] 設定ボタンを含める
- [ ] propsで必要なデータを受け取る

### ExerciseCard.jsx
- [ ] 各運動種目のカードコンポーネント
- [ ] 種目タイプ判定ロジック
- [ ] CardioFields/StrengthFieldsの条件分岐
- [ ] propsインターフェース設計

### CardioFields.jsx
- [ ] 距離入力フィールド
- [ ] 時間入力フィールド
- [ ] react-hook-formのController使用
- [ ] エラー表示

### StrengthFields.jsx
- [ ] セット数分の入力フィールド
- [ ] 動的なグリッドレイアウト
- [ ] react-hook-formのController使用
- [ ] エラー表示

### index.jsx（Container）
- [ ] すべてのビジネスロジック
- [ ] カスタムフックの使用
- [ ] 子コンポーネントへのprops配布

### WorkoutForm.jsx（Presentational）
- [ ] 純粋なUIレンダリング
- [ ] propsのみに依存
- [ ] 状態を持たない

### インポートパス更新
- [ ] `frontend/src/pages/WorkoutForm.jsx`のインポート修正
```javascript
// 変更前
import WorkoutForm from '../components/WorkoutForm';
// 変更後（index.jsxが自動的に読まれる）
import WorkoutForm from '../components/WorkoutForm';
```

### 動作確認
- [ ] 画面表示が変わらないこと
- [ ] FormConfigDrawerが開くこと
- [ ] 設定変更が反映されること
- [ ] すべての入力フィールドが動作すること
- [ ] 保存処理が正常に動作すること

### コミット
- [ ] `git add frontend/src/components/WorkoutForm/`
- [ ] `git add frontend/src/pages/WorkoutForm.jsx`
- [ ] `git commit -m "refactor(WorkoutForm): split into smaller components"`

## 🧹 Phase 5: 最終調整とクリーンアップ（30分）

### コード品質
- [ ] ESLintチェック `npm run lint`
- [ ] 不要なconsole.log削除
- [ ] 未使用のインポート削除
- [ ] コメントの整理

### PropTypes/TypeScript（オプション）
- [ ] 主要コンポーネントにPropTypes追加
- [ ] またはTypeScript型定義追加

### パフォーマンス最適化（オプション）
- [ ] React.memoの適用検討
- [ ] useCallbackの適用検討
- [ ] useMemoの適用検討

### ドキュメント
- [ ] READMEの更新（必要に応じて）
- [ ] コンポーネント構造図の更新
- [ ] 実装メモの記録

### 最終確認
- [ ] 全機能の動作確認
  - [ ] 種目選択
  - [ ] データ入力
  - [ ] 保存処理
  - [ ] エラーハンドリング
  - [ ] フィードバック表示
- [ ] ビルド成功 `npm run build`
- [ ] テスト実行（あれば）

### コミット
- [ ] `git add .`
- [ ] `git commit -m "refactor(WorkoutForm): final cleanup and optimizations"`

## 📊 完了確認

### メトリクス確認
- [ ] WorkoutForm.jsx が100行以下になった
- [ ] 各ファイルが単一責任を持っている
- [ ] 重複コードが削除された
- [ ] 再利用可能なフックが作成された

### PR準備
- [ ] ブランチをpush `git push origin refactor/workout-form-single-responsibility`
- [ ] GitHub上でPR作成
- [ ] PR説明文に実装内容を記載
- [ ] レビュアーをアサイン
- [ ] ラベル付け（refactoring, frontend）

### レビュー対応
- [ ] レビューコメント対応
- [ ] 追加の動作確認
- [ ] 必要に応じて修正

## 🎉 完了！

すべてのチェックが完了したら、リファクタリング成功です！

### 次のステップ
- [ ] テストコード作成
- [ ] Storybook追加（オプション）
- [ ] パフォーマンス計測
- [ ] 他のコンポーネントのリファクタリング検討

---
**Note**: 各フェーズは独立してコミット可能なため、問題が発生した場合は該当フェーズのみロールバックできます。