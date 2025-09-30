# 📋 Project Management

FitTrack プロジェクトの課題管理、開発計画、バグトラッキングを統合管理するディレクトリです。

## 📁 ディレクトリ構造

```
project-management/
├── README.md              # このファイル（ナビゲーションガイド）
├── TODO/                 # 優先度別タスク管理
│   ├── README.md        # TODOインデックス
│   ├── priority-high-bugs.md          # 🔴 高優先度バグ
│   ├── priority-medium-improvements.md # 🟡 中優先度改善
│   ├── priority-low-features.md       # 🟢 低優先度機能
│   └── learning-research.md           # 📚 学習項目
├── ROADMAP.md            # 長期開発計画・マイルストーン
├── bugs/                 # アクティブなバグ報告
│   └── [4件のバグファイル]
├── resolved-bugs/        # 解決済みバグのアーカイブ
│   ├── INDEX.md         # 解決済みバグの一覧と統計
│   └── TEMPLATE.md      # 解決済みバグ文書のテンプレート
├── features/             # 機能仕様・設計書
│   ├── README.md        # 機能ドキュメント一覧
│   ├── health-score/    # 健康スコア機能
│   ├── monthly-goals/   # 月次目標機能
│   ├── strava-error-handling/ # Strava連携エラー処理
│   └── [その他の機能仕様...]
└── technical-docs/       # 技術文書
    ├── README.md        # 技術文書インデックス
    ├── security/        # セキュリティ関連
    └── refactoring/     # リファクタリング計画
```

## 🗺 クイックナビゲーション

### 主要ドキュメント

| ドキュメント | 説明 | 用途 |
|------------|------|------|
| [TODO/](./TODO/README.md) | 📝 課題管理 | 優先度別に分類されたタスク管理 |
| [ROADMAP.md](./ROADMAP.md) | 🗓 開発計画 | 四半期ごとのフェーズ計画とマイルストーン |
| [features/](./features/README.md) | 🎯 機能仕様 | 実装済み・予定の機能設計書 |
| [technical-docs/](./technical-docs/README.md) | 🔧 技術文書 | セキュリティ、リファクタリング等の技術資料 |
| [resolved-bugs/](./resolved-bugs/INDEX.md) | 📚 解決済みアーカイブ | 過去の問題と解決策の記録 |

### バグレポート

| バグ | 優先度 | ステータス | 詳細 |
|-----|-------|-----------|------|
| 新規登録後のリダイレクト | 🔴 高 | 未修正 | [詳細](./bugs/registration-navigation-redirect.md) |
| ワークアウトフォームリセット | 🔴 高 | 部分修正 | [詳細](./bugs/workout-form-submit-reset-not-working.md) |
| 複数ワークアウト重複 | 🟡 中 | 調査中 | [詳細](./bugs/multiple-workouts-duplicate-issue.md) |
| Strava連携エラー | 🟡 中 | 未着手 | [詳細](./bugs/strava-sync-connection-failed.md) |

## 📊 現在の状況サマリー

### 進行状況
- **✅ 解決済み**: 0件 ([アーカイブ](./resolved-bugs/INDEX.md))
- **🔄 対応中**: 2件
- **📋 未着手**: 2件
- **⏸ 保留中**: 0件

### 優先度別
- 🔴 **高優先度**: 2件
- 🟡 **中優先度**: 2件
- 🟢 **低優先度**: 0件

### 解決率
- **今月**: 0/0 (-%）
- **四半期**: 0/4 (0%)
- **累計**: 0/4 (0%)

## 🔄 ワークフロー

### 新しいバグを報告する

1. `TODO/priority-high-bugs.md`に追加（緊急の場合）
2. 詳細が必要な場合は`bugs/`ディレクトリに個別ファイルを作成
3. テンプレート:
   ```markdown
   # [バグタイトル]

   ## 概要
   ## 発生条件
   ## 技術的詳細
   ## 影響範囲
   ## 解決策
   ## テストケース
   ## ステータス
   ```

### バグを解決した時

1. 解決内容を元のバグファイルに記録
2. `resolved-bugs/TEMPLATE.md`をコピーして詳細な解決レポートを作成
3. ファイル名: `YYYY-MM-DD-bug-title.md`
4. 元のバグファイルを`bugs/`から`resolved-bugs/`に移動
5. `resolved-bugs/INDEX.md`を更新
6. `TODO/`内の該当ファイルのステータスを更新

### 新機能を提案する

1. `ROADMAP.md`で適切なフェーズを確認
2. `TODO.md`の適切な優先度セクションに追加
3. 必要に応じて`docs/features/`に詳細仕様を作成

### 進捗を更新する

1. 該当するファイルのステータスを更新
2. 更新日時と変更内容を記録
3. 完了したタスクは取り消し線で表示（削除しない）

## 💡 ベストプラクティス

### ドキュメント管理
- ✅ 変更時は必ず更新履歴を記載
- ✅ ファイルパスは相対パスで記載
- ✅ ステータスは定期的に更新
- ✅ 関連するコードへの参照を含める（例: `frontend/src/components/Register.jsx:46`）

### コミュニケーション
- 💬 大きな変更前にはissueで議論
- 💬 解決策を実装する前に`TODO.md`で方針を明確化
- 💬 テストケースは実装前に定義

## 📈 メトリクス

定期的に以下の指標を確認:
- バグ解決率
- 平均解決時間
- 新規バグ発生率
- テストカバレッジ

## 🔗 関連リンク

### プロジェクト内ドキュメント
- [機能仕様書一覧](./features/README.md)
- [技術文書一覧](./technical-docs/README.md)
- [セキュリティ分析](./technical-docs/security/)
- [リファクタリング計画](./technical-docs/refactoring/)

### その他のドキュメント
- [プロジェクトREADME](../../README.md)
- [API仕様](../specifications/)
- [テスト計画](../testing/)

---

最終更新: 2025-01-30