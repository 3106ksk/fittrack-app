# MonthNavigation コンポーネント仕様書

## 概要
月単位でのナビゲーション機能を提供するUIコンポーネント。Googleカレンダーのような直感的な月切り替えインターフェースを実装する。

## 目的
- ワークアウト履歴を月別に表示する際のナビゲーション機能
- ユーザーが過去・未来の月を簡単に切り替えられるUI提供
- 現在表示中の月を明確に表示

## コンポーネント仕様

### Props
| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|------------|------|
| currentDate | Date | ✓ | - | 現在表示中の年月 |
| onDateChange | (date: Date) => void | ✓ | - | 月変更時のコールバック関数 |

### 表示要素
1. **前月ボタン (`<`)**
   - MUI ChevronLeft アイコン使用
   - クリックで1ヶ月前に移動
   - ホバー効果あり

2. **現在月表示**
   - 形式：「2025年8月」（ja-JP locale）
   - フォントウェイト：bold
   - 中央揃え
   - 最小幅：140px

3. **次月ボタン (`>`)**
   - MUI ChevronRight アイコン使用
   - クリックで1ヶ月後に移動
   - ホバー効果あり

### スタイリング
```jsx
{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
  py: 2,
  borderBottom: `1px solid ${theme.palette.divider}`,
  bgcolor: theme.palette.background.paper,
}
```

## 機能要件

### 基本機能
- **月切り替え**: 前月・次月ボタンによる月単位の移動
- **月表示**: 選択中の年月を日本語形式で表示
- **レスポンシブ**: 画面サイズに応じた適切な表示

### 制約・制限
- 年の制限なし（過去・未来どちらも移動可能）
- 月単位での移動のみ（日・年単位の移動は非対応）

## 使用例

### 基本的な使用方法
```jsx
import MonthNavigation from './MonthNavigation';

const [currentMonth, setCurrentMonth] = useState(new Date());

<MonthNavigation 
  currentDate={currentMonth}
  onDateChange={setCurrentMonth}
/>
```

### ワークアウト履歴での使用例
```jsx
const WorkoutHistory = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);

  // 月変更時のフィルタリング処理
  const filteredWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.dateForSort);
    return workoutDate.getFullYear() === currentMonth.getFullYear() &&
           workoutDate.getMonth() === currentMonth.getMonth();
  });

  return (
    <div>
      <MonthNavigation 
        currentDate={currentMonth}
        onDateChange={setCurrentMonth}
      />
      <WorkoutTable workouts={filteredWorkouts} />
    </div>
  );
};
```

## 技術要件

### 依存関係
- React 18+
- Material-UI (MUI) 5+
- Material-UI Icons

### 必要なインポート
```jsx
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';
```

## アクセシビリティ
- キーボードナビゲーション対応（Tabキーでフォーカス移動）
- ボタンのホバー・フォーカス状態の視覚的フィードバック
- 明確なクリック領域の提供

## 拡張可能性
- 年単位の切り替え機能追加
- カスタムフォーマット対応
- 最小・最大日付制限機能
- ショートカットキー対応（矢印キー等）

## 注意事項
- `currentDate`は必ずDateオブジェクトで渡すこと
- `onDateChange`は新しいDateオブジェクトを受け取る関数として実装すること
- MUIテーマとの整合性を保つため、カスタムスタイルは最小限に抑制

## ファイル構成
```
src/
  components/
    MonthNavigation.jsx  # メインコンポーネント
  docs/
    components/
      MonthNavigation.md  # この仕様書
```