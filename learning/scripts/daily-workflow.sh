#!/bin/bash

# 日次学習ワークフロー自動化スクリプト
# Usage: ./daily-workflow.sh

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TODAY=$(date +%Y-%m-%d)
TIME=$(date +%H%M)

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  📚 Daily Learning Workflow - $TODAY"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. 今日の学習ログディレクトリを作成
PUBLIC_DIR="learning/public/daily/$TODAY"
PRIVATE_DIR="learning/private/daily/$TODAY"

mkdir -p "$PUBLIC_DIR"
mkdir -p "$PRIVATE_DIR"

echo -e "${GREEN}✅ Created today's directories${NC}"

# 2. 学習ログテンプレートを作成
create_learning_log() {
    local TYPE=$1
    local TOPIC=$2
    local DIR=$3
    local FILENAME="${TIME}-${TOPIC}.md"
    local FILEPATH="$DIR/$FILENAME"

    cat > "$FILEPATH" << 'EOF'
# 学習ログ: [トピック名]

## 📅 基本情報
- **日時**: YYYY-MM-DD HH:MM
- **カテゴリ**: [technical/debugging/pattern/architecture]
- **タグ**: #tag1 #tag2
- **公開可否**: [public/private]

## 🎯 学習の目的
<!-- なぜこれを学ぶ必要があったか -->

## 📝 学習内容

### 概要
<!-- 3行で要約 -->

### 詳細

#### 1. 背景・課題
<!-- 何が問題だったか -->

#### 2. 調査・試行
<!-- どのように調査したか -->

```javascript
// コード例
```

#### 3. 解決・理解
<!-- 何が分かったか -->

```javascript
// 解決コード
```

## 💡 学んだこと

### 技術的な気づき
-

### ベストプラクティス
-

### アンチパターン
-

## 🔗 関連リソース
- [公式ドキュメント]()
- [参考記事]()

## 📊 次のアクション
- [ ]
- [ ]

## 🏷️ メタ情報
- 実装ファイル:
- 関連Issue:
- 所要時間:
EOF

    # 基本情報を置換
    sed -i '' "s/YYYY-MM-DD HH:MM/$TODAY $(date +%H:%M)/" "$FILEPATH"
    sed -i '' "s/\[トピック名\]/$TOPIC/" "$FILEPATH"
    sed -i '' "s/\[public\/private\]/$TYPE/" "$FILEPATH"

    echo -e "${GREEN}  ✅ Created: $FILEPATH${NC}"
}

# 3. 学習ログの種類を選択
echo ""
echo -e "${YELLOW}📝 What type of learning log?${NC}"
echo "1) Technical (public)"
echo "2) Debugging (public)"
echo "3) Personal reflection (private)"
echo "4) Career related (private)"
echo "5) Skip log creation"
read -p "Select (1-5): " LOG_TYPE

if [ "$LOG_TYPE" != "5" ]; then
    read -p "Topic name (e.g., react-hooks, cors-error): " TOPIC_NAME

    case $LOG_TYPE in
        1|2)
            create_learning_log "public" "$TOPIC_NAME" "$PUBLIC_DIR"
            CREATED_LOG="$PUBLIC_DIR/${TIME}-${TOPIC_NAME}.md"
            ;;
        3|4)
            create_learning_log "private" "$TOPIC_NAME" "$PRIVATE_DIR"
            CREATED_LOG="$PRIVATE_DIR/${TIME}-${TOPIC_NAME}.md"
            ;;
    esac
fi

# 4. 記事化の確認
echo ""
echo -e "${YELLOW}📰 Convert to article?${NC}"
echo "1) Qiita article"
echo "2) Zenn article"
echo "3) Both"
echo "4) Skip"
read -p "Select (1-4): " ARTICLE_TYPE

if [ "$ARTICLE_TYPE" != "4" ] && [ -n "$CREATED_LOG" ]; then
    if [[ "$ARTICLE_TYPE" == "1" || "$ARTICLE_TYPE" == "3" ]]; then
        ./learning/scripts/log-to-article.sh qiita "$CREATED_LOG"
    fi
    if [[ "$ARTICLE_TYPE" == "2" || "$ARTICLE_TYPE" == "3" ]]; then
        ./learning/scripts/log-to-article.sh zenn "$CREATED_LOG"
    fi
fi

# 5. 週次レビューのチェック
DAY_OF_WEEK=$(date +%u)
if [ "$DAY_OF_WEEK" = "7" ]; then
    echo ""
    echo -e "${BLUE}📊 It's Sunday! Time for weekly review${NC}"
    echo "Run: ./learning/scripts/weekly-review.sh"
fi

# 6. Git操作の確認
echo ""
echo -e "${YELLOW}💾 Commit changes?${NC}"
echo "1) Commit public logs only"
echo "2) Check status only"
echo "3) Skip"
read -p "Select (1-3): " GIT_ACTION

case $GIT_ACTION in
    1)
        git add learning/public/
        git add learning/templates/
        git add learning/scripts/
        git status
        echo ""
        read -p "Commit message: " COMMIT_MSG
        git commit -m "📚 learning: $COMMIT_MSG"
        echo -e "${GREEN}✅ Changes committed${NC}"
        ;;
    2)
        git status
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ✨ Daily workflow completed!"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"