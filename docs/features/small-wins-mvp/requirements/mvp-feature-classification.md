# Small Wins Engine MVP - 機能分類と優先順位

**文書番号**: FRD-SW-001
**バージョン**: 1.0.0
**作成日**: 2025-01-25
**ステータス**: MVP Planning

## 1. 機能分類（Must/Better/Unnecessary）

### 🔴 MUST - MVP必須機能

#### 1.1 データモデル
- **insights テーブル新規作成** ✅
  - 理由: 健康スコア履歴は医療連携の基盤データ
  - 計算結果のキャッシュによりパフォーマンス確保
  - 過去データとの比較分析に必須

#### 1.2 スコア計算エンジン
- **WHO基準の有酸素運動スコア（週150分）**
  - 心疾患リスク30%減のエビデンス表示
- **WHO基準の筋力トレーニングスコア（週2日）**
  - 総死亡リスク40%減のエビデンス表示
- **週次集計と日次更新**
  - リアルタイムフィードバック

#### 1.3 API エンドポイント
```
GET /api/insights/current - 現在のスコア取得
GET /api/insights/weekly - 週次サマリー
POST /api/insights/calculate - 手動再計算
```

#### 1.4 UI コンポーネント
- **HealthScoreCard** - メインダッシュボード表示
- **WHOComplianceBadge** - 達成状況の可視化

### 🟡 BETTER - MVP推奨機能

#### 2.1 データ拡張
- **workouts テーブルへのカラム追加**
  ```sql
  -- MVP: JSONBで柔軟に対応
  ALTER TABLE workouts ADD COLUMN IF NOT EXISTS
    exercise_metadata JSONB DEFAULT '{}';
  -- 内容: {"muscleGroups": [], "intensity": "moderate", "type": "strength"}
  ```

#### 2.2 キャッシング層
- **メモリキャッシュ実装**（Redis不要）
  ```javascript
  // シンプルなインメモリキャッシュ
  const cache = new Map();
  const CACHE_TTL = 3600000; // 1時間
  ```

#### 2.3 バッチ処理
- **夜間バッチでの事前計算**
  - Node-cronでのシンプル実装
  - 翌日分のスコア事前生成

#### 2.4 推奨メッセージ
- **3段階の改善提案**
  - 未達成者向け
  - 部分達成者向け
  - 完全達成者向け

### ⚪ UNNECESSARY - MVP非対象

#### 3.1 将来拡張機能
- ❌ AI個別推奨
- ❌ 睡眠データ統合
- ❌ 栄養データ連携
- ❌ グループ比較機能
- ❌ 予測モデル
- ❌ 医師コメント機能

#### 3.2 高度な分析
- ❌ Zone別心拍数分析
- ❌ VO2max推定
- ❌ 疲労度スコア
- ❌ トレーニング負荷管理

## 2. MVP実装アプローチ

### Phase 1: 基盤構築（Week 1-2）
```javascript
// 1. insights テーブル作成
CREATE TABLE insights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  score INTEGER,
  aerobic_score INTEGER,
  strength_score INTEGER,
  rationale JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

// 2. 基本計算エンジン
class SmallWinsEngine {
  calculateScore(userId, date) {
    // MUST機能のみ実装
    const aerobic = this.calculateAerobicScore(userId);
    const strength = this.calculateStrengthScore(userId);
    return {
      total: aerobic * 0.6 + strength * 0.4,
      aerobic,
      strength
    };
  }
}
```

### Phase 2: API実装（Week 3）
```javascript
// シンプルなエンドポイント
router.get('/insights/current', async (req, res) => {
  const userId = req.user.id;
  const today = new Date();

  // キャッシュチェック
  const cached = cache.get(`${userId}-${today}`);
  if (cached) return res.json(cached);

  // 計算実行
  const score = await engine.calculateScore(userId, today);

  // DB保存
  await Insight.upsert({ userId, date: today, ...score });

  // キャッシュ保存
  cache.set(`${userId}-${today}`, score);

  res.json(score);
});
```

### Phase 3: UI実装（Week 4）
```jsx
// 最小限のUIコンポーネント
const HealthScoreCard = () => {
  const { data: score } = useQuery('/api/insights/current');

  return (
    <Card>
      <Typography variant="h4">
        健康スコア: {score?.total || 0}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={score?.total || 0}
      />
      {score?.aerobic >= 100 && (
        <Chip label="WHO有酸素達成" color="success" />
      )}
      {score?.strength >= 100 && (
        <Chip label="WHO筋力達成" color="success" />
      )}
    </Card>
  );
};
```

## 3. パフォーマンス改善ロードマップ

### MVP（現在）
- 応答時間: < 500ms
- 同時接続: ~100ユーザー
- キャッシュ: インメモリ

### Phase 2（3ヶ月後）
- 応答時間: < 200ms
- 同時接続: ~1000ユーザー
- キャッシュ: Redis導入
- DB: インデックス最適化

### Phase 3（6ヶ月後）
- 応答時間: < 100ms
- 同時接続: ~10000ユーザー
- キャッシュ: Redis + CDN
- DB: パーティショニング
- 計算: ワーカープロセス分離

## 4. データモデル判断

### insights テーブルは必須である理由：

1. **監査証跡**: 医療連携時の履歴証明
2. **トレンド分析**: 改善傾向の可視化
3. **パフォーマンス**: 再計算回避
4. **データ整合性**: スコアの一貫性保証

### 代替案の検討結果：
- ❌ 毎回計算: レスポンス遅延、負荷増大
- ❌ workoutsテーブルに追加: 正規化違反、クエリ複雑化
- ✅ **専用テーブル作成**: 拡張性、保守性、性能のバランス最適

## 5. 成功指標（MVP）

- [ ] WHO基準スコアの正確な計算
- [ ] 日次更新の自動実行
- [ ] 応答時間 < 500ms（P95）
- [ ] エラー率 < 0.1%
- [ ] ユーザー理解度 > 80%（UIテスト）

---

**次のステップ**:
1. insights テーブルのマイグレーション作成
2. SmallWinsEngine クラスの実装
3. API エンドポイントの開発
4. UIコンポーネントの実装