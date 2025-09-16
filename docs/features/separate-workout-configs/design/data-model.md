# ワークアウト設定分離機能 - データモデル設計書

**文書番号**: DMD-WS-001
**バージョン**: 1.0.0
**作成日**: 2025-01-16
**ステータス**: Draft

## 1. データモデル概要

### 1.1 設計方針
- LocalStorageを使用したクライアントサイドデータ管理
- JSONスキーマによる型安全性の確保
- バージョニングによる将来的な拡張性
- 既存データとの互換性維持

## 2. データスキーマ定義

### 2.1 FormConfig (フォーム設定)

```typescript
interface FormConfig {
  version: string;                    // スキーマバージョン
  exercises: string[];                 // 選択された種目リスト
  maxSets: number;                    // 最大セット数 (1-10)
  defaultIntensity: Intensity;        // デフォルト強度
  quickInputMode: boolean;            // クイック入力モード
  autoFocus: boolean;                 // 自動フォーカス設定
  showTimer: boolean;                 // タイマー表示設定
  metadata: {
    createdAt: string;                // ISO 8601形式
    updatedAt: string;                // ISO 8601形式
    lastSyncedAt?: string;            // 最終同期日時
  };
}

type Intensity = 'light' | 'medium' | 'heavy';
```

**JSONスキーマ**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "exercises", "maxSets", "defaultIntensity", "metadata"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "exercises": {
      "type": "array",
      "minItems": 1,
      "maxItems": 10,
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      }
    },
    "maxSets": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10
    },
    "defaultIntensity": {
      "type": "string",
      "enum": ["light", "medium", "heavy"]
    },
    "quickInputMode": {
      "type": "boolean"
    },
    "autoFocus": {
      "type": "boolean"
    },
    "showTimer": {
      "type": "boolean"
    },
    "metadata": {
      "type": "object",
      "required": ["createdAt", "updatedAt"],
      "properties": {
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        },
        "lastSyncedAt": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  }
}
```

### 2.2 HistoryConfig (履歴設定)

```typescript
interface HistoryConfig {
  version: string;                     // スキーマバージョン
  exercises: string[];                 // 表示する種目リスト
  maxSets: number;                    // 表示する最大セット数
  displayColumns: DisplayColumn[];    // 表示カラム設定
  sortOrder: SortOrder;               // ソート順
  dateRange: DateRange;               // 表示期間
  groupBy: GroupBy;                   // グループ化設定
  showStatistics: boolean;            // 統計表示
  chartType: ChartType;               // グラフタイプ
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastSyncedAt?: string;
  };
}

type DisplayColumn =
  | 'date'
  | 'exercise'
  | 'totalReps'
  | 'totalSets'
  | 'totalTime'
  | 'intensity'
  | 'notes';

type SortOrder = 'asc' | 'desc';

type DateRange =
  | 'all'
  | 'today'
  | 'week'
  | 'month'
  | 'year'
  | { start: string; end: string };  // カスタム期間

type GroupBy = 'none' | 'date' | 'exercise' | 'week' | 'month';

type ChartType = 'line' | 'bar' | 'area' | 'scatter';
```

### 2.3 LegacyConfig (既存設定 - 移行元)

```typescript
interface LegacyConfig {
  exercises: string[];
  maxSets: number;
  displayColumns?: string[];
}
```

### 2.4 PresetConfig (プリセット設定)

```typescript
interface PresetConfig {
  id: string;
  name: string;
  description?: string;
  type: 'form' | 'history' | 'both';
  config: {
    exercises: string[];
    maxSets: number;
    additionalSettings?: Record<string, any>;
  };
  tags?: string[];
  isDefault?: boolean;
  isCustom?: boolean;
}
```

## 3. データ保存構造

### 3.1 LocalStorage キー設計

```javascript
// メイン設定
localStorage['fittrack.config.form']      // FormConfig
localStorage['fittrack.config.history']   // HistoryConfig

// プリセット
localStorage['fittrack.presets.form']     // PresetConfig[]
localStorage['fittrack.presets.history']  // PresetConfig[]

// バックアップ
localStorage['fittrack.backup.form']      // FormConfig (自動バックアップ)
localStorage['fittrack.backup.history']   // HistoryConfig (自動バックアップ)

// 移行フラグ
localStorage['fittrack.migration.completed'] // boolean

// レガシー (移行後削除予定)
localStorage['workoutConfig']             // LegacyConfig
```

### 3.2 データサイズ制限

| データタイプ | 最大サイズ | 備考 |
|------------|-----------|------|
| FormConfig | 5KB | 通常は1KB以下 |
| HistoryConfig | 10KB | 統計データ含む |
| PresetConfig | 2KB/プリセット | 最大10プリセット |
| 合計使用量 | 50KB | LocalStorage制限の1% |

## 4. データ操作仕様

### 4.1 CRUD操作

#### Create (初期作成)
```typescript
function createInitialConfig(): {
  form: FormConfig;
  history: HistoryConfig;
} {
  const now = new Date().toISOString();

  return {
    form: {
      version: '1.0.0',
      exercises: DEFAULT_FORM_EXERCISES,
      maxSets: 3,
      defaultIntensity: 'medium',
      quickInputMode: false,
      autoFocus: true,
      showTimer: false,
      metadata: {
        createdAt: now,
        updatedAt: now
      }
    },
    history: {
      version: '1.0.0',
      exercises: DEFAULT_HISTORY_EXERCISES,
      maxSets: 5,
      displayColumns: ['date', 'exercise', 'totalReps', 'totalTime'],
      sortOrder: 'desc',
      dateRange: 'month',
      groupBy: 'none',
      showStatistics: true,
      chartType: 'line',
      metadata: {
        createdAt: now,
        updatedAt: now
      }
    }
  };
}
```

#### Read (読み取り)
```typescript
function readConfig<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const config = JSON.parse(data);
    // バリデーション
    if (!validateConfig(config)) {
      throw new Error('Invalid config format');
    }

    return config;
  } catch (error) {
    console.error(`Failed to read config: ${key}`, error);
    return null;
  }
}
```

#### Update (更新)
```typescript
function updateConfig<T extends BaseConfig>(
  key: string,
  updates: Partial<T>
): boolean {
  try {
    const current = readConfig<T>(key);
    if (!current) return false;

    const updated = {
      ...current,
      ...updates,
      metadata: {
        ...current.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    // バックアップ作成
    createBackup(key, current);

    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error(`Failed to update config: ${key}`, error);
    return false;
  }
}
```

#### Delete (削除)
```typescript
function deleteConfig(key: string): boolean {
  try {
    // バックアップ作成
    const current = readConfig(key);
    if (current) {
      createBackup(key, current);
    }

    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to delete config: ${key}`, error);
    return false;
  }
}
```

### 4.2 データ移行

#### 移行フロー
```typescript
async function migrateFromLegacyConfig(): Promise<void> {
  // 移行済みチェック
  if (localStorage.getItem('fittrack.migration.completed')) {
    return;
  }

  const legacy = readConfig<LegacyConfig>('workoutConfig');
  if (!legacy) {
    // レガシーデータなし、新規作成
    const initial = createInitialConfig();
    saveConfig('fittrack.config.form', initial.form);
    saveConfig('fittrack.config.history', initial.history);
  } else {
    // レガシーデータから移行
    const migrated = transformLegacyConfig(legacy);
    saveConfig('fittrack.config.form', migrated.form);
    saveConfig('fittrack.config.history', migrated.history);

    // レガシーデータをバックアップ
    localStorage.setItem('workoutConfig.backup',
      JSON.stringify(legacy));
  }

  // 移行完了フラグ
  localStorage.setItem('fittrack.migration.completed', 'true');
}
```

### 4.3 データ同期

#### フォーム→履歴同期
```typescript
function syncFormToHistory(): void {
  const formConfig = readConfig<FormConfig>('fittrack.config.form');
  const historyConfig = readConfig<HistoryConfig>('fittrack.config.history');

  if (!formConfig || !historyConfig) return;

  const syncedHistory: HistoryConfig = {
    ...historyConfig,
    exercises: formConfig.exercises,
    maxSets: formConfig.maxSets,
    metadata: {
      ...historyConfig.metadata,
      updatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString()
    }
  };

  saveConfig('fittrack.config.history', syncedHistory);
}
```

## 5. バリデーション仕様

### 5.1 バリデーションルール

```typescript
interface ValidationRule {
  field: string;
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  };
  message: string;
}

const FORM_CONFIG_RULES: ValidationRule[] = [
  {
    field: 'exercises',
    rules: {
      required: true,
      minLength: 1,
      maxLength: 10,
      custom: (exercises) =>
        exercises.every(e => typeof e === 'string' && e.length > 0)
    },
    message: '1〜10個の種目を選択してください'
  },
  {
    field: 'maxSets',
    rules: {
      required: true,
      min: 1,
      max: 10
    },
    message: 'セット数は1〜10の範囲で設定してください'
  }
];
```

## 6. エラーハンドリング

### 6.1 エラータイプ定義

```typescript
enum DataErrorType {
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  INVALID_DATA_FORMAT = 'INVALID_DATA_FORMAT',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  BACKUP_FAILED = 'BACKUP_FAILED'
}

interface DataError {
  type: DataErrorType;
  message: string;
  timestamp: string;
  context?: {
    operation: string;
    data?: any;
  };
}
```

### 6.2 エラー回復戦略

| エラータイプ | 回復戦略 |
|------------|---------|
| STORAGE_QUOTA_EXCEEDED | 古いバックアップを削除 |
| INVALID_DATA_FORMAT | デフォルト値で初期化 |
| MIGRATION_FAILED | レガシーデータを維持 |
| SYNC_CONFLICT | ユーザーに選択を促す |
| BACKUP_FAILED | メモリ内バックアップ |

## 7. パフォーマンス考慮事項

### 7.1 キャッシング戦略
```typescript
class ConfigCache {
  private static cache = new Map<string, any>();
  private static timestamps = new Map<string, number>();
  private static TTL = 5 * 60 * 1000; // 5分

  static get<T>(key: string): T | null {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() - timestamp > this.TTL) {
      return null;
    }
    return this.cache.get(key) || null;
  }

  static set<T>(key: string, value: T): void {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
  }

  static invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.timestamps.delete(key);
    } else {
      this.cache.clear();
      this.timestamps.clear();
    }
  }
}
```

### 7.2 データ圧縮
大量のプリセットデータを保存する場合の圧縮:
```typescript
function compressData(data: any): string {
  // LZ-string などの圧縮ライブラリを使用
  return LZString.compress(JSON.stringify(data));
}

function decompressData(compressed: string): any {
  return JSON.parse(LZString.decompress(compressed));
}
```

## 8. セキュリティ考慮事項

### 8.1 データサニタイゼーション
```typescript
function sanitizeExerciseName(name: string): string {
  // HTMLタグやスクリプトを除去
  return name
    .replace(/<[^>]*>/g, '')
    .replace(/[<>\"']/g, '')
    .trim()
    .substring(0, 100);
}
```

### 8.2 データ暗号化（将来的な実装）
```typescript
interface EncryptedConfig {
  iv: string;
  data: string;
  checksum: string;
}

// 機密データの暗号化（実装例）
async function encryptConfig(config: any): Promise<EncryptedConfig> {
  // Web Crypto API を使用した暗号化
  // 実装は省略
}
```