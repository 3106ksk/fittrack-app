# 月別統計機能 - クリティカル領域の公式ドキュメント参照ガイド

**文書番号**: CDR-MS-001
**バージョン**: 1.0.0
**作成日**: 2025-01-18
**ステータス**: Active

## ⚠️ 実装前必須確認事項

### 1. JavaScript Date API - タイムゾーン処理
**公式ドキュメント**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
**必須参照セクション**:
- [Date.prototype.getMonth()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth)
- [Date.prototype.getFullYear()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getFullYear)
- [タイムゾーンの扱い](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date)

**実装チェックポイント**:
```javascript
// ⚠️ STOP: 月境界の判定実装前に確認
// 1. getMonth() は 0-11 を返す（0 = 1月）
// 2. タイムゾーンによる日付のずれに注意
// 3. new Date(dateString) のパース挙動を理解

// 正しい実装例
const date = new Date('2025-01-15T00:00:00Z');
const month = date.getMonth(); // 0 (1月)
const year = date.getFullYear(); // 2025

// ⚠️ 注意: ローカルタイムゾーンでの扱い
const localDate = new Date(workout.date);
// JST(+9)の場合、UTCの日付と異なる可能性
```

### 2. React パフォーマンス最適化
**公式ドキュメント**: https://react.dev/reference/react
**必須参照セクション**:
- [useMemo](https://react.dev/reference/react/useMemo)
- [useCallback](https://react.dev/reference/react/useCallback)
- [React.memo](https://react.dev/reference/react/memo)

**実装チェックポイント**:
```javascript
// ⚠️ STOP: 大量データ処理前に確認
// 1. 高コストな計算は useMemo でメモ化
// 2. 依存配列の正確な設定
// 3. 過度な最適化を避ける

const monthlyStats = useMemo(
  () => calculateMonthlyStats(workouts, selectedMonth),
  [workouts, selectedMonth] // 依存配列を正確に
);
```

### 3. Material-UI v5 - コンポーネント互換性
**公式ドキュメント**: https://mui.com/material-ui/getting-started/
**必須参照セクション**:
- [Migration from v4](https://mui.com/material-ui/migration/migration-v4/)
- [Theming](https://mui.com/material-ui/customization/theming/)
- [Responsive UI](https://mui.com/material-ui/customization/breakpoints/)

**実装チェックポイント**:
```javascript
// ⚠️ STOP: MUIコンポーネント使用前に確認
// 1. sx prop の使用（makeStyles は非推奨）
// 2. Grid2 の使用を検討（Grid は将来非推奨）
// 3. テーマのブレークポイント活用
```

## 実装時の判断基準

### 🔴 実装を中断してドキュメント参照が必要
- 日付の月境界判定ロジック実装時
- タイムゾーン変換が必要な場合
- パフォーマンス問題が発生した場合
- MUIコンポーネントの予期しない動作

### 🟡 実装を続行しつつ後で確認
- useMemo/useCallbackの最適化
- MUIのスタイリング調整
- レスポンシブ対応の細部

### 🟢 ドキュメント参照不要（低リスク）
- 単純な状態管理（useState）
- 基本的なMUIコンポーネント使用
- CSSスタイリング
- 定数定義

## クリティカル実装パターン

### 1. 月別フィルタリングの正しい実装
```javascript
// ✅ 推奨パターン
const filterWorkoutsByMonth = (workouts, targetDate) => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  return workouts.filter(workout => {
    // ISO文字列を適切にパース
    const workoutDate = new Date(workout.date);

    // ローカルタイムゾーンで比較
    return workoutDate.getFullYear() === year &&
           workoutDate.getMonth() === month;
  });
};

// ❌ アンチパターン
const filterWorkoutsByMonth = (workouts, month) => {
  // 月番号の直接比較は危険
  return workouts.filter(w => w.date.includes(`-${month}-`));
};
```

### 2. 前月計算の正しい実装
```javascript
// ✅ 推奨パターン
const getPreviousMonth = (date) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - 1);

  // 月末日の調整（1/31 → 2月は2/28 or 2/29）
  if (newDate.getMonth() !== ((date.getMonth() - 1 + 12) % 12)) {
    newDate.setDate(0); // 前月の最終日
  }

  return newDate;
};

// ❌ アンチパターン
const getPreviousMonth = (date) => {
  // 単純な月減算は月末で問題発生
  return new Date(date.getFullYear(), date.getMonth() - 1);
};
```

### 3. パフォーマンス最適化パターン
```javascript
// ✅ 推奨パターン
const WorkoutStatistics = ({ workouts }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // 重い計算はメモ化
  const monthlyWorkouts = useMemo(
    () => filterWorkoutsByMonth(workouts, selectedMonth),
    [workouts, selectedMonth]
  );

  const stats = useMemo(
    () => calculateStats(monthlyWorkouts),
    [monthlyWorkouts]
  );

  // コールバックもメモ化
  const handleMonthChange = useCallback(
    (newMonth) => setSelectedMonth(newMonth),
    []
  );

  return (/* ... */);
};
```

## トラブルシューティングガイド

### 問題: 月の境界で統計がずれる
**原因**: タイムゾーンの考慮不足
**解決策**:
```javascript
// UTCで統一するか、ローカルタイムゾーンで統一
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  // ローカル日付の00:00:00に正規化
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};
```

### 問題: 大量データで画面がフリーズ
**原因**: 再レンダリングごとの再計算
**解決策**: useMemoの適切な使用と仮想スクロール検討

### 問題: 2月の月末処理が不正
**原因**: JavaScript Dateの自動調整
**解決策**: 明示的な月末日チェック

## 参考リソース

### 必須参照
1. [MDN - Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
2. [React - Performance](https://react.dev/learn/render-and-commit)
3. [MUI - Migration Guide](https://mui.com/material-ui/migration/migration-v4/)

### 推奨ライブラリ（将来検討）
1. [Day.js](https://day.js.org/) - 軽量な日付処理ライブラリ
2. [date-fns](https://date-fns.org/) - モジュラーな日付ユーティリティ

## チェックリスト

実装前:
- [ ] JavaScript Date APIの月番号（0-11）を理解
- [ ] タイムゾーン処理方針を決定
- [ ] パフォーマンス目標を設定（< 100ms）

実装中:
- [ ] 月境界のテストケース作成
- [ ] useMemoの依存配列を正確に設定
- [ ] MUI v5のベストプラクティスに従う

実装後:
- [ ] 異なるタイムゾーンでテスト
- [ ] 1000件以上のデータでパフォーマンステスト
- [ ] メモリリークのチェック