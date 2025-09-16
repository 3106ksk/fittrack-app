# ワークアウト設定分離機能 - 技術スタック分析

**文書番号**: TSA-WS-001
**バージョン**: 1.0.0
**作成日**: 2025-01-16
**ステータス**: Draft

## 1. 現在の技術スタック

### 1.1 フロントエンド技術

| 技術 | バージョン | 用途 | 関連性 |
|------|-----------|------|--------|
| React | 18.2.0 | UIフレームワーク | 高 |
| React Router | 6.26.1 | ルーティング | 低 |
| Material-UI | 5.15.4 | UIコンポーネント | 高 |
| React Hook Form | 7.54.2 | フォーム管理 | 高 |
| Yup | 0.32.11 | バリデーション | 中 |
| Axios | 1.7.9 | HTTP通信 | 低 |
| Vite | - | ビルドツール | 低 |
| TypeScript | 対応 | 型安全性 | 中 |

### 1.2 状態管理

| 技術 | 現状 | 影響範囲 |
|------|------|---------|
| useState/useEffect | 使用中 | Custom Hooks実装 |
| Context API | 未使用 | グローバル状態管理候補 |
| LocalStorage | 使用中 | 設定永続化の主要手段 |

### 1.3 テスト環境

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Vitest | 3.2.4 | 単体テスト |
| Testing Library | 16.3.0 | コンポーネントテスト |
| MSW | 2.10.4 | APIモック |

## 2. 技術的考慮事項

### 2.1 LocalStorage制限

**仕様と制限**:
- 容量制限: 通常5-10MB（ブラウザ依存）
- 同期API: メインスレッドをブロック
- 文字列のみ保存可能
- Same-Origin Policy適用

**実装への影響**:
```javascript
// ⚠️ 注意: LocalStorageは同期的
// 大量データの読み書きはパフォーマンスに影響
const config = JSON.parse(localStorage.getItem('config')); // ブロッキング

// 推奨: 非同期ラッパーの使用
async function getConfigAsync(key) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localStorage.getItem(key);
      resolve(data ? JSON.parse(data) : null);
    }, 0);
  });
}
```

### 2.2 React 18の考慮事項

**Concurrent Features**:
```javascript
// ⚠️ React 18のAutomatic Batchingに注意
// 複数のstate更新が自動的にバッチ処理される

const updateConfig = (newConfig) => {
  setConfig(newConfig);          // これらは
  setIsLoading(false);           // 自動的に
  setLastUpdated(Date.now());    // バッチ処理される
};

// 必要に応じてflushSyncを使用
import { flushSync } from 'react-dom';

const urgentUpdate = (newConfig) => {
  flushSync(() => {
    setConfig(newConfig);  // 即座に反映
  });
  // ここでDOMが更新されている
};
```

**Strict Mode**:
```javascript
// ⚠️ 開発環境でuseEffectが2回実行される
useEffect(() => {
  // Strict Modeでは2回実行される可能性
  // クリーンアップ関数で適切に処理
  const subscription = subscribeToConfig();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 2.3 Material-UI v5統合

**Theme統合**:
```javascript
// MUIのテーマシステムとの統合
const theme = createTheme({
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 400,  // カスタマイゼーションドロワーの幅
        }
      }
    }
  }
});
```

**パフォーマンス最適化**:
```javascript
// ⚠️ 重いコンポーネントの遅延読み込み
const CustomizationDrawer = lazy(() =>
  import('./CustomizationDrawer')
);

// Suspenseでラップ
<Suspense fallback={<CircularProgress />}>
  <CustomizationDrawer />
</Suspense>
```

## 3. 依存関係の互換性

### 3.1 必要な追加パッケージ

| パッケージ | 用途 | 必要性 | 代替案 |
|-----------|------|--------|--------|
| lodash.debounce | デバウンス処理 | 中 | 自前実装可能 |
| immer | 不変性管理 | 低 | スプレッド演算子で対応 |
| js-cookie | Cookie管理 | 低 | LocalStorage使用 |

### 3.2 バージョン互換性マトリクス

```javascript
// package.json 依存関係
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "@mui/material": "^5.15.0",  // React 18対応済み
    "react-hook-form": "^7.0.0"  // React 18対応済み
  }
}
```

## 4. パフォーマンス考慮事項

### 4.1 レンダリング最適化

```javascript
// ⚠️ 不要な再レンダリングを防ぐ
const WorkoutConfigContext = createContext();

// メモ化による最適化
const configValue = useMemo(() => ({
  config,
  updateConfig
}), [config]);

// React.memoでコンポーネントをメモ化
const ExerciseItem = memo(({ exercise, onToggle }) => {
  // レンダリング最適化
});
```

### 4.2 バンドルサイズ影響

```javascript
// Tree Shaking可能な実装
export { useFormWorkoutConfig } from './useFormWorkoutConfig';
export { useHistoryWorkoutConfig } from './useHistoryWorkoutConfig';

// ❌ 避けるべき: 全体インポート
import * as configs from './configs';

// ✅ 推奨: 名前付きインポート
import { useFormWorkoutConfig } from './configs';
```

## 5. セキュリティ考慮事項

### 5.1 XSS対策

```javascript
// ⚠️ LocalStorageへの保存時のサニタイゼーション
const sanitizeConfig = (config) => {
  return {
    ...config,
    exercises: config.exercises.map(e =>
      e.replace(/<[^>]*>/g, '') // HTMLタグ除去
    )
  };
};
```

### 5.2 データ検証

```javascript
// Yupスキーマによる厳密な検証
const configSchema = yup.object({
  exercises: yup.array()
    .of(yup.string().max(100))
    .min(1)
    .max(10),
  maxSets: yup.number()
    .min(1)
    .max(10)
    .required()
});
```

## 6. ブラウザ互換性

### 6.1 サポート対象

| ブラウザ | 最小バージョン | 注意事項 |
|---------|--------------|----------|
| Chrome | 90+ | 完全サポート |
| Firefox | 88+ | 完全サポート |
| Safari | 14+ | 完全サポート |
| Edge | 90+ | 完全サポート |

### 6.2 Polyfill要件

```javascript
// 必要なPolyfill
// - なし（React 18とMUI v5で対応済み）

// オプション: プライベートブラウジング対策
const storage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      // メモリフォールバック
      return memoryStorage[key];
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // メモリフォールバック
      memoryStorage[key] = value;
    }
  }
};
```

## 7. 開発ツール統合

### 7.1 TypeScript設定

```typescript
// tsconfig.json 推奨設定
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### 7.2 ESLint設定

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

## 8. 監視とデバッグ

### 8.1 React DevTools統合

```javascript
// 開発環境でのデバッグ支援
if (process.env.NODE_ENV === 'development') {
  window.__WORKOUT_CONFIG_DEBUG__ = {
    getFormConfig: () => ConfigService.getFormConfig(),
    getHistoryConfig: () => ConfigService.getHistoryConfig(),
    clearAll: () => {
      localStorage.removeItem('fittrack.config.form');
      localStorage.removeItem('fittrack.config.history');
    }
  };
}
```

### 8.2 パフォーマンスプロファイリング

```javascript
// React Profilerの活用
import { Profiler } from 'react';

<Profiler id="ConfigDrawer" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}}>
  <CustomizationDrawer />
</Profiler>
```

## 9. 推奨事項

### 9.1 実装優先度

1. **高優先度**: LocalStorage操作の抽象化層
2. **中優先度**: エラーバウンダリの実装
3. **低優先度**: パフォーマンスモニタリング

### 9.2 リスク軽減策

- LocalStorageの容量チェック実装
- 設定のバージョン管理システム
- 自動バックアップメカニズム
- グレースフルデグレデーション