# 📚 学習ログ → 技術記事 変換ワークフロー

## 🎯 目的
日々の学習記録を体系的に管理し、価値ある技術記事として発信するためのワークフロー

## 📂 ディレクトリ構造

```
learning/
├── public/          # Gitで管理（公開可能な技術情報）
│   ├── daily/       # 日次の技術学習ログ
│   ├── weekly/      # 週次のまとめ
│   ├── articles/    # 公開記事の元原稿
│   ├── debugging/   # デバッグ記録
│   └── technical/   # 技術メモ
├── private/         # .gitignoreで除外（個人情報）
│   ├── daily/       # 個人的な振り返り
│   ├── sensitive/   # APIキー等の情報
│   ├── career/      # 転職活動記録
│   └── personal/    # 個人的なメモ
├── drafts/          # 記事の下書き（一時的）
│   ├── qiita/       # Qiita用下書き
│   └── zenn/        # Zenn用下書き
├── published/       # 公開済み記事のアーカイブ
│   ├── qiita/       # Qiita公開済み
│   └── zenn/        # Zenn公開済み
├── templates/       # 各種テンプレート
│   ├── log/         # 学習ログテンプレート
│   └── article/     # 記事テンプレート
└── scripts/         # 自動化スクリプト
```

## 🔄 日次ワークフロー

### 1️⃣ 学習開始時（朝・開発開始時）
```bash
# 日次ワークフローを開始
./learning/scripts/daily-workflow.sh
```

このスクリプトが自動で：
- 今日の日付でディレクトリを作成
- 学習ログテンプレートを生成
- 公開/非公開を選択可能

### 2️⃣ 学習中（随時）
```bash
# 手動で学習ログを作成する場合
cp learning/templates/log/basic-template.md \
   learning/public/daily/$(date +%Y-%m-%d)/$(date +%H%M)-topic.md
```

**記録すべき内容**：
- 🐛 エラーと解決方法
- 💡 新しく学んだ概念
- 🔧 実装した機能
- 📚 参考にした資料

### 3️⃣ 学習終了時（夜・1日の終わり）
```bash
# 学習ログを記事に変換
./learning/scripts/log-to-article.sh [qiita|zenn] [ログファイルパス]

# 例：
./learning/scripts/log-to-article.sh qiita \
   learning/public/daily/2025-09-14/1200-react-hooks.md
```

### 4️⃣ 記事の編集
生成された下書きを編集：
```bash
# VS Codeで開く
code learning/drafts/qiita/2025-09-14_1200_react-hooks.md
```

**編集のポイント**：
- 🔒 センシティブ情報の削除
- 📝 読者視点での説明追加
- 🎨 コードの整形
- 🔗 参考リンクの追加

### 5️⃣ 記事の公開
```bash
# レビュー後、publishedフォルダに移動
mv learning/drafts/qiita/article.md \
   learning/published/qiita/$(date +%Y-%m-%d)-article.md

# Gitにコミット（publicのみ）
git add learning/public/ learning/published/
git commit -m "📚 learning: Add React hooks article"
```

## 📊 週次ワークフロー

### 日曜日：週次レビュー
```bash
# 週次レビュースクリプト（作成予定）
./learning/scripts/weekly-review.sh
```

**レビュー内容**：
- 今週学んだことの総括
- 来週の学習計画
- 記事化できるトピックの選定

## 🚀 クイックコマンド

```bash
# エイリアス設定（.zshrc または .bashrc に追加）
alias learn="cd ~/Documents/fittrack-app && ./learning/scripts/daily-workflow.sh"
alias learn-log="cd ~/Documents/fittrack-app/learning/public/daily/$(date +%Y-%m-%d)"
alias learn-article="cd ~/Documents/fittrack-app && ./learning/scripts/log-to-article.sh"
```

## 📝 テンプレートの使い方

### 学習ログテンプレート
- `ACQUIRE_TEMPLATE.md`: 新技術習得用
- `DEBUG_TEMPLATE.md`: デバッグ記録用
- `PATTERN_TEMPLATE.md`: デザインパターン学習用

### 記事テンプレート
- `qiita-template.md`: Qiita投稿用
- `zenn-template.md`: Zenn投稿用

## 🔐 プライバシー管理

### 公開可能（public/）
✅ 技術的な解決方法
✅ 一般的なエラーパターン
✅ ベストプラクティス
✅ 学習の過程

### 非公開（private/）
❌ APIキー、トークン
❌ 個人情報、企業情報
❌ 転職活動の詳細
❌ 個人的な感想・愚痴

## 💡 ベストプラクティス

1. **毎日記録する**
   - 小さな学びでも記録
   - 後で見返せるように

2. **構造化して書く**
   - テンプレートを活用
   - 見出しを明確に

3. **コードを含める**
   - 実際のコードを記載
   - Before/Afterを明示

4. **定期的に記事化**
   - 週1本を目標に
   - 学びを定着させる

5. **バックアップ**
   - privateフォルダは別途バックアップ
   - 重要な学習記録は複数箇所に保存

## 🎯 月間目標

- 学習ログ: 20本以上
- Qiita記事: 4本以上
- Zenn記事: 2本以上

## 📅 スケジュール例

| 時間 | アクション |
|------|-----------|
| 09:00 | daily-workflow.sh 実行 |
| 10:00-18:00 | 開発・学習（随時ログ記録） |
| 18:00 | 学習ログの整理 |
| 19:00 | 記事化の検討 |
| 20:00 | 下書き作成・編集 |
| 21:00 | Gitコミット |
| 日曜 20:00 | 週次レビュー・記事公開 |

## 🔧 トラブルシューティング

### Q: privateフォルダが誤ってコミットされた
```bash
git rm -r --cached learning/private/
git commit -m "Remove private folder from tracking"
```

### Q: 記事テンプレートが見つからない
```bash
ls -la learning/templates/article/
# なければ再作成
```

### Q: スクリプトが実行できない
```bash
chmod +x learning/scripts/*.sh
```

## 📚 関連ドキュメント

- [Qiita Markdown記法](https://qiita.com/Qiita/items/c686397e4a0f4f11683d)
- [Zenn Markdown記法](https://zenn.dev/zenn/articles/markdown-guide)

---

## 🎉 セットアップ完了！

これで学習ログから技術記事への変換ワークフローが整いました。
毎日の学習を記録し、価値ある技術記事として発信していきましょう！

```bash
# 今すぐ始める
./learning/scripts/daily-workflow.sh
```