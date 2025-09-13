# 月次目標機能 - 実装アプローチガイド

**文書番号**: IAG-MG-001
**バージョン**: 1.0.0
**作成日**: 2025-09-13
**ステータス**: Active

## 1. 実装順序と学習アプローチ

### Phase 1: バックエンド基盤（ドキュメント深掘り必要）

#### 1.1 Goalsモデルとマイグレーション
**学習方法**: Sequelize公式ドキュメント参照
```javascript
// 検証ポイント
- DATE型とTIMESTAMPTZ型の選択
- インデックス戦略（部分インデックス）
- CHECK制約の実装方法
```

**参照すべきドキュメント**:
- [Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)
- [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [PostgreSQL Overlaps](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-OVERLAPS)

#### 1.2 期間重複チェック実装
**学習方法**: トランザクション分離レベルの理解
```sql
-- 重複チェッククエリ
SELECT 1 FROM goals
WHERE user_id = $1
  AND is_active = true
  AND ($2, $3) OVERLAPS (start_date, end_date);
```

**深掘りポイント**:
- READ COMMITTED vs SERIALIZABLE
- 楽観的ロック vs 悲観的ロック
- Sequelize hooks vs DB triggers

### Phase 2: APIエンドポイント（混合アプローチ）

#### 2.1 認証・認可（ドキュメント深掘り）
**学習方法**: 既存のcheckJWT.jsを理解
```javascript
// backend/middleware/checkJWT.js の活用
router.post('/api/v1/goals', authMiddleware, async (req, res) => {
  const userId = req.user.id; // JWT検証済みユーザー
  // ...
});
```

**参照ポイント**:
- JWTペイロードの構造
- エラーハンドリングパターン
- Rate limiting設定

#### 2.2 ビジネスロジック（LLM提案活用可）
**学習方法**: 単体テストで検証
```javascript
// 日次達成カウント（LLM生成 + PostgreSQL仕様確認）
const calculateDailyAchievements = async (userId, startDate, endDate) => {
  const query = `
    SELECT COUNT(DISTINCT DATE_TRUNC('day', started_at AT TIME ZONE :tz))
    FROM workouts
    WHERE user_id = :userId
      AND started_at BETWEEN :startDate AND :endDate
  `;
  // タイムゾーン処理の検証必要
};
```

### Phase 3: フロントエンド実装（主にLLM提案活用）

#### 3.1 GoalProgressCard（LLM提案で迅速実装）
**学習方法**: Material-UIコンポーネント組み合わせ
```tsx
// LLM生成コードを局所的に検証
<LinearProgress
  variant="determinate"
  value={progress}
  sx={{ /* スタイリング */ }}
/>
```

**検証方法**:
- Storybookでコンポーネント単体確認
- レスポンシブデザインのブラウザ確認
- アクセシビリティチェック

#### 3.2 状態管理（LLM提案 + パターン確認）
**学習方法**: 既存のフック実装パターンを踏襲
```typescript
// 既存のuseAuth()パターンを参考に
const useGoals = () => {
  // LLM生成のカスタムフック
  // 既存パターンとの整合性確認
};
```

## 2. リスクベースの検証戦略

### 高リスク項目（必ずドキュメント確認）
| 項目 | リスク | 対策 |
|-----|--------|------|
| タイムゾーン処理 | 日次カウントのズレ | PostgreSQL仕様書確認 |
| 期間重複チェック | データ不整合 | トランザクション仕様理解 |
| リワードclaim | 二重claim | 楽観的ロック実装 |

### 低リスク項目（LLM提案で迅速対応）
| 項目 | 理由 | 検証方法 |
|-----|------|---------|
| UIコンポーネント | 視覚的確認可能 | ブラウザ確認 |
| フォーマット処理 | 入出力明確 | 単体テスト |
| バリデーション | 影響範囲限定 | テストケース |

## 3. テスト駆動の実装フロー

```javascript
// 1. テストケース先行作成（仕様の明確化）
describe('Goal Progress Calculation', () => {
  it('should count multiple workouts on same day as 1', async () => {
    // 同日2ワークアウト → count = 1
  });

  it('should handle timezone boundary correctly', async () => {
    // 23:30 JST と 00:30 JST の判定
  });
});

// 2. 実装（LLM提案 or ドキュメント参照）
const implementation = () => {
  // テストをパスする実装
};

// 3. リファクタリング
const optimized = () => {
  // パフォーマンス最適化
};
```

## 4. ドキュメント参照チェックリスト

### 必須参照（クリティカル領域）
- [ ] Sequelize Transaction docs
- [ ] PostgreSQL DATE_TRUNC function
- [ ] Express-JWT middleware usage
- [ ] CORS configuration for /api/v1

### 任意参照（補助的理解）
- [ ] Material-UI Progress components
- [ ] React Hook Form validation
- [ ] Jest/Supertest patterns

## 5. 実装時の判断フローチャート

```
新機能実装
    ↓
セキュリティ/データ整合性に関わる？
    ├─ YES → ドキュメント深掘り
    │   ├─ 公式ドキュメント参照
    │   ├─ 実装パターン検証
    │   └─ セキュリティレビュー
    │
    └─ NO → 影響範囲は？
        ├─ 局所的 → LLM提案採用
        │   ├─ コード生成
        │   ├─ 単体テスト
        │   └─ 視覚確認
        │
        └─ 広範囲 → ハイブリッド
            ├─ コアロジック: ドキュメント
            └─ UI/ユーティリティ: LLM
```

## 6. 実装優先順位マトリクス

| 優先度 | ドキュメント深掘り | LLM活用 |
|-------|------------------|---------|
| **高** | JWT認証拡張<br/>期間重複チェック | - |
| **中** | 日次達成SQL<br/>トランザクション | GoalProgressCard<br/>フォームバリデーション |
| **低** | - | フォーマッター<br/>定数定義 |

## まとめ

月次目標機能の実装では：

1. **データ層とセキュリティ**: ドキュメント徹底確認
2. **ビジネスロジック**: ハイブリッドアプローチ
3. **UI層**: LLM提案で迅速実装

この戦略により、**開発速度**と**品質保証**のバランスを実現します。