#!/bin/bash

# 学習ログから記事への変換スクリプト
# Usage: ./log-to-article.sh [qiita|zenn] [log-file-path]

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 引数チェック
if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 [qiita|zenn] [log-file-path]${NC}"
    exit 1
fi

PLATFORM=$1
LOG_FILE=$2
TODAY=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%H%M)

# プラットフォームチェック
if [[ "$PLATFORM" != "qiita" && "$PLATFORM" != "zenn" ]]; then
    echo -e "${RED}Error: Platform must be 'qiita' or 'zenn'${NC}"
    exit 1
fi

# ファイル存在チェック
if [ ! -f "$LOG_FILE" ]; then
    echo -e "${RED}Error: Log file not found: $LOG_FILE${NC}"
    exit 1
fi

# ファイル名から情報を抽出
LOG_FILENAME=$(basename "$LOG_FILE" .md)
DRAFT_DIR="learning/drafts/$PLATFORM"
DRAFT_FILE="$DRAFT_DIR/${TODAY}_${TIMESTAMP}_${LOG_FILENAME}.md"

echo -e "${GREEN}📝 Converting learning log to $PLATFORM article...${NC}"

# テンプレートを選択
if [ "$PLATFORM" = "qiita" ]; then
    TEMPLATE="learning/templates/article/qiita-template.md"
else
    TEMPLATE="learning/templates/article/zenn-template.md"
fi

# テンプレートをコピー
cp "$TEMPLATE" "$DRAFT_FILE"

# 学習ログの内容を抽出して記事に変換
echo -e "${YELLOW}Extracting content from log...${NC}"

# タイトルを抽出（最初の#行）
TITLE=$(grep -m1 "^#" "$LOG_FILE" | sed 's/^#\+ *//')

# 概要を抽出
SUMMARY=$(grep -A2 "## 概要" "$LOG_FILE" 2>/dev/null | tail -n2 | head -n1 || echo "")

# エラーメッセージを抽出
ERROR_MSG=$(sed -n '/```/,/```/p' "$LOG_FILE" | head -n20 || echo "")

# 解決方法を抽出
SOLUTION=$(sed -n '/## 解決方法/,/## /p' "$LOG_FILE" || echo "")

# プラットフォーム別の処理
if [ "$PLATFORM" = "qiita" ]; then
    # Qiita用の置換
    sed -i '' "s/\[自動生成\] タイトルをここに記入/$TITLE/" "$DRAFT_FILE"
    sed -i '' "s/YYYY-MM-DD/$TODAY/" "$DRAFT_FILE"
    sed -i '' "s|learning/public/daily/YYYY-MM-DD/xxx.md|$LOG_FILE|" "$DRAFT_FILE"
else
    # Zenn用の置換
    sed -i '' "s/title: \"\"/title: \"$TITLE\"/" "$DRAFT_FILE"
    sed -i '' "s/YYYY-MM-DD/$TODAY/" "$DRAFT_FILE"
    sed -i '' "s|learning/public/daily/YYYY-MM-DD/xxx.md|$LOG_FILE|" "$DRAFT_FILE"
fi

echo -e "${GREEN}✅ Draft created: $DRAFT_FILE${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Review and edit the draft: $DRAFT_FILE"
echo "2. Add specific code examples and explanations"
echo "3. Remove any sensitive information"
echo "4. Run: ./publish-article.sh $PLATFORM $DRAFT_FILE"
echo ""
echo -e "${GREEN}💡 Tip: Use 'code $DRAFT_FILE' to open in VS Code${NC}"