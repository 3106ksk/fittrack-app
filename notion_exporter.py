#!/usr/bin/env python3
"""
Claude 4 プロンプト例をNotionページにエクスポートするスクリプト
"""

import requests
import json
import os
from datetime import datetime
from typing import Dict, List, Any

# 環境変数のサポートを追加
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("注意: python-dotenvがインストールされていません。環境変数を.envファイルから読み込めません。")

class NotionExporter:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        self.base_url = "https://api.notion.com/v1"
    
    def create_text_block(self, text: str, block_type: str = "paragraph") -> Dict[str, Any]:
        """テキストブロックを作成"""
        return {
            "object": "block",
            "type": block_type,
            block_type: {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": text
                        }
                    }
                ]
            }
        }
    
    def create_heading_block(self, text: str, level: int = 1) -> Dict[str, Any]:
        """見出しブロックを作成"""
        heading_type = f"heading_{level}"
        return {
            "object": "block",
            "type": heading_type,
            heading_type: {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": text
                        }
                    }
                ]
            }
        }
    
    def create_code_block(self, code: str, language: str = "plain text") -> Dict[str, Any]:
        """コードブロックを作成"""
        return {
            "object": "block",
            "type": "code",
            "code": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": code
                        }
                    }
                ],
                "language": language
            }
        }
    
    def create_callout_block(self, text: str, emoji: str = "💡") -> Dict[str, Any]:
        """コールアウトブロックを作成"""
        return {
            "object": "block",
            "type": "callout",
            "callout": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": text
                        }
                    }
                ],
                "icon": {
                    "type": "emoji",
                    "emoji": emoji
                }
            }
        }
    
    def export_claude_prompts_to_notion(self, page_id: str) -> bool:
        """Claude 4プロンプト例をNotionページに追加"""
        
        try:
            # プロンプトデータを構造化
            prompts_data = self._get_prompts_data()
            
            # Notionブロックに変換
            blocks = self._convert_to_notion_blocks(prompts_data)
            
            print(f"📝 {len(blocks)}個のブロックを準備しました")
            
            # Notionページに追加
            url = f"{self.base_url}/blocks/{page_id}/children"
            
            # ブロックを分割して送信（APIの制限対策）
            chunk_size = 100
            total_chunks = (len(blocks) + chunk_size - 1) // chunk_size
            
            for i in range(0, len(blocks), chunk_size):
                chunk = blocks[i:i + chunk_size]
                payload = {"children": chunk}
                
                current_chunk = (i // chunk_size) + 1
                print(f"📤 チャンク {current_chunk}/{total_chunks} を送信中...")
                
                response = requests.patch(url, headers=self.headers, json=payload)
                
                if response.status_code != 200:
                    print(f"❌ エラー: {response.status_code}")
                    print(f"エラー詳細: {response.text}")
                    return False
                
                print(f"✅ チャンク {current_chunk}/{total_chunks} が正常に追加されました")
            
            print("🎉 すべてのプロンプトをNotionページに追加しました！")
            return True
            
        except Exception as e:
            print(f"❌ 予期しないエラーが発生しました: {str(e)}")
            return False
    
    def _get_prompts_data(self) -> Dict[str, Any]:
        """プロンプトデータを定義"""
        return {
            "title": "Claude-4 Sonnet コーディング最適化プロンプト集",
            "timestamp": datetime.now().strftime("%Y年%m月%d日 %H:%M"),
            "learning_prompts": [
                {
                    "title": "1. コンテキスト豊富な技術解説プロンプト",
                    "content": """このReactコンポーネントの実装について、以下の構造で詳細に説明してください：

<technical_analysis>
1. 使用されている技術とその選択理由
2. アーキテクチャパターンとその効果
3. パフォーマンス最適化の観点
4. 保守性・拡張性への配慮
5. 潜在的な改善点と代替アプローチ
</technical_analysis>

単なる機能説明ではなく、なぜこの実装が効果的なのか、他の選択肢と比較してどのような利点があるのかを、具体例とともに解説してください。現実のプロジェクトでこのパターンが有効になる場面も含めて教えてください。""",
                    "reason": "Claude 4の「コンテキストを追加してパフォーマンスを向上させる」原則を活用。XML形式で構造化し、背景理由の説明を明示的に要求することで、表面的でない深い理解を促進します。"
                },
                {
                    "title": "2. 並列思考による多角的分析プロンプト",
                    "content": """以下のコードベースを複数の観点から同時に分析してください。各観点で独立して詳細な評価を行い、最後に統合的な見解を提示してください：

並列で以下を実行：
- セキュリティ観点での脆弱性分析
- パフォーマンス観点でのボトルネック特定
- 可読性・保守性の評価
- スケーラビリティの検証
- テスタビリティの確認

各分析で具体的な改善提案と、その改善がビジネス価値にどう貢献するかも含めて説明してください。分析結果を受け取った後、品質を慎重に検討し、最適な優先順位付けを行ってください。""",
                    "reason": "並列ツール呼び出しの最適化原則と思考能力の活用を組み合わせ。複数観点での同時分析により、包括的な理解を効率的に得られます。"
                },
                {
                    "title": "3. 実践的な問題解決フロープロンプト",
                    "content": """このエラーやバグを以下のステップで段階的に解決し、各段階での学習ポイントを明確にしてください：

<problem_solving_flow>
1. **問題の本質特定**: 表面的な症状ではなく根本原因を探る
2. **デバッグ戦略立案**: 効率的な調査アプローチとツール選択
3. **解決策の複数案検討**: トレードオフを含めた比較評価
4. **実装とテスト**: 段階的な実装とバリデーション
5. **予防策の検討**: 同様の問題を未然に防ぐ仕組み
</problem_solving_flow>

各段階で「なぜこのアプローチを選んだのか」「他の選択肢と比べてどう優れているか」を具体的に説明し、将来同様の問題に遭遇した際の判断基準も教えてください。""",
                    "reason": "明確で具体的な指示の原則を活用し、構造化された学習プロセスを提供。問題解決の思考過程を可視化することで、応用可能なスキルの習得を促進します。"
                },
                {
                    "title": "4. アーキテクチャ設計思考プロンプト",
                    "content": """以下の要件に対して、遠慮せずに全力でアーキテクチャ設計を行ってください。基本を超えて、プロダクションレディな完全な設計を作成してください：

<architecture_design_context>
要件: [具体的な要件を記載]
制約: [技術的・ビジネス的制約]
目標: [パフォーマンス、スケーラビリティ等の目標]
</architecture_design_context>

以下を含む包括的な設計を提示してください：
- アーキテクチャパターンの選択理由と代替案比較
- データフロー設計とその効率性の根拠
- 拡張性・保守性を考慮した構造設計
- セキュリティ・パフォーマンス要件への対応
- 技術選定の判断基準と将来性の考慮

設計判断の背景にある原理原則も詳しく解説し、チーム開発での合意形成に使える論理的根拠も提供してください。""",
                    "reason": "「遠慮しないで全力を尽くす」というフロントエンド強化の原則をアーキテクチャ設計に応用。コンテキストと動機を明確にし、包括的な設計思考を促進します。"
                },
                {
                    "title": "5. コードレビュー学習プロンプト",
                    "content": """以下のコードに対して、シニアエンジニアの視点でコードレビューを実施してください。レビューは教育的観点を重視し、以下の形式で構造化してください：

<code_review_format>
【良い点の具体的評価】
- 優れた実装とその理由
- 採用されているベストプラクティス

【改善提案（優先度付き）】
- 高: セキュリティ・パフォーマンスに関わる重要な改善
- 中: 保守性・可読性の向上
- 低: より良い代替手法の提案

【学習ポイント】
- このコードから学べる設計原則
- 類似状況での応用方法
- 避けるべきアンチパターン
</code_review_format>

各提案について「なぜこの改善が重要なのか」「どのような利益をもたらすか」を具体例とともに説明し、コードの品質向上だけでなく、レビューを受ける開発者のスキル向上にも貢献する内容にしてください。""",
                    "reason": "XML形式インジケータを使用し、教育的価値を最大化。コードレビューを単なる指摘ではなく、学習機会として活用する構造を提供します。"
                }
            ],
            "specific_prompts": [
                {
                    "title": "コードの理解度をチェックするためのプロンプト",
                    "content": """私のコード理解度を段階的に評価してください。以下の質問に答えた後、理解度をチェックしてください：

<understanding_check>
1. **表面的理解**: このコードは何をしているか簡潔に説明してください
2. **構造理解**: 使用されているパターンやアーキテクチャを特定してください
3. **深層理解**: なぜこの実装方法が選ばれたのか、背景を推察してください
4. **応用理解**: 類似の問題に対してこの知識をどう応用しますか
5. **批判的思考**: この実装の限界や改善点をどう見つけますか
</understanding_check>

私の回答を受け取った後、各レベルでの理解度を評価し、不足している観点や誤解している部分を具体的に指摘してください。さらに理解を深めるための具体的な学習ステップも提案してください。"""
                },
                {
                    "title": "ファイル構造のベストプラクティスについてのプロンプト",
                    "content": """現在のプロジェクトのファイル構造について、以下の観点から包括的に分析し、ベストプラクティスとの比較評価を行ってください：

<file_structure_analysis>
1. **スケーラビリティ**: チームサイズや機能拡張への対応力
2. **保守性**: コードの発見可能性と変更の影響範囲の制御
3. **開発効率**: 開発者の認知負荷とワークフロー効率
4. **技術的合理性**: 使用技術のコンベンションとの整合性
5. **チーム協働**: 複数人開発での競合やマージ容易性
</file_structure_analysis>

各項目で具体的な改善提案を行い、「なぜその構造が推奨されるのか」の根拠を、実際のプロジェクト運用での具体例とともに説明してください。段階的なリファクタリング計画も含めて、実践的な移行戦略も提示してください。"""
                },
                {
                    "title": "ファイルのアーキテクチャについて質問するときのプロンプト",
                    "content": """以下のアーキテクチャについて、設計思想と実装の妥当性を多角的に検証してください。思考過程を可視化し、段階的に分析を深めてください：

<architecture_inquiry_context>
対象: [具体的なファイル・モジュール・システム名]
目的: [解決したい課題や疑問]
現状認識: [現在の理解レベルと疑問点]
</architecture_inquiry_context>

以下の順序で分析してください：
1. **アーキテクチャパターンの特定**: 採用されている設計パターンとその意図
2. **依存関係の分析**: モジュール間の結合度と凝集度の評価
3. **責務分散の検証**: 単一責任原則やレイヤー分離の適切性
4. **拡張性の評価**: 新機能追加や変更要求への対応力
5. **代替設計の検討**: 他のアプローチとの比較とトレードオフ

各分析で判断根拠を明確にし、「なぜこの設計が適切（または不適切）なのか」を、ソフトウェア工学の原則と実践的な運用観点の両方から説明してください。改善が必要な場合は、具体的なリファクタリングの手順も提示してください。"""
                }
            ]
        }
    
    def _convert_to_notion_blocks(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """プロンプトデータをNotionブロックに変換"""
        blocks = []
        
        # タイトル
        blocks.append(self.create_heading_block(data["title"], 1))
        blocks.append(self.create_text_block(f"作成日時: {data['timestamp']}"))
        blocks.append(self.create_text_block(""))
        
        # 概要
        blocks.append(self.create_callout_block(
            "このプロンプト集は、Claude-4 Sonnetでコーディング時に最大のパフォーマンスを得るために設計されています。各プロンプトには効果的な理由と背景が含まれています。",
            "🚀"
        ))
        blocks.append(self.create_text_block(""))
        
        # 学習プロンプト
        blocks.append(self.create_heading_block("学習の理解を最大限深めるためのプロンプト例", 2))
        
        for i, prompt in enumerate(data["learning_prompts"], 1):
            blocks.append(self.create_heading_block(prompt["title"], 3))
            blocks.append(self.create_code_block(prompt["content"]))
            blocks.append(self.create_callout_block(f"効果的な理由: {prompt['reason']}", "💡"))
            blocks.append(self.create_text_block(""))
        
        # 特定場面プロンプト
        blocks.append(self.create_heading_block("特定場面でのプロンプト例", 2))
        
        for prompt in data["specific_prompts"]:
            blocks.append(self.create_heading_block(prompt["title"], 3))
            blocks.append(self.create_code_block(prompt["content"]))
            blocks.append(self.create_text_block(""))
        
        # 使用上の注意点
        blocks.append(self.create_heading_block("使用上の注意点", 2))
        blocks.append(self.create_heading_block("プロンプト最適化のポイント", 3))
        
        optimization_points = [
            "明確性: 曖昧な表現を避け、具体的な指示を心がける",
            "構造化: XML形式やマークダウンで情報を整理する", 
            "コンテキスト: 背景情報と目的を明確に伝える",
            "段階的: 複雑な作業は段階に分けて指示する",
            "反復改善: レスポンスを受けて更なる詳細化を図る"
        ]
        
        for point in optimization_points:
            blocks.append(self.create_text_block(f"• {point}"))
        
        blocks.append(self.create_text_block(""))
        blocks.append(self.create_heading_block("効果測定の方法", 3))
        
        measurement_methods = [
            "理解度テスト: プロンプト使用前後での理解レベルの比較",
            "コード品質: 生成されるコードの保守性・可読性の評価", 
            "学習効率: 同じ概念の習得にかかる時間の短縮度",
            "応用力: 学んだ知識を異なる文脈で活用できるかの確認"
        ]
        
        for method in measurement_methods:
            blocks.append(self.create_text_block(f"• {method}"))
        
        return blocks

def extract_page_id_from_url(url: str) -> str:
    """NotionのURLからページIDを抽出"""
    # URLから最後の部分を取得
    if "?" in url:
        url = url.split("?")[0]  # クエリパラメータを除去
    
    # URLの最後の部分がページID
    page_id = url.split("/")[-1]
    
    # ハイフンを除去（NotionのAPIではハイフンなしのIDを使用）
    page_id = page_id.replace("-", "")
    
    return page_id

def main():
    """メイン実行関数"""
    print("🚀 Claude-4 Sonnet プロンプト集のNotionエクスポートを開始します")
    print("=" * 60)
    
    # 環境変数またはハードコードから設定を取得
    API_KEY = "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"  # ここに直接APIキーを貼り付け
    PAGE_URL = "https://www.notion.so/1fbd5c5438fd8034928ec1d36495c564?pvs=4"
    
    # URLからページIDを抽出
    PAGE_ID = extract_page_id_from_url(PAGE_URL)
    
    print(f"📍 対象ページID: {PAGE_ID}")
    print(f"📍 対象ページURL: {PAGE_URL}")
    
    if not API_KEY:
        print("❌ NOTION_API_KEYが設定されていません")
        print("以下のいずれかの方法でAPIキーを設定してください：")
        print("1. .envファイルに NOTION_API_KEY=your_api_key_here を記載")
        print("2. 環境変数として export NOTION_API_KEY=your_api_key_here を実行")
        print("3. スクリプト内のAPI_KEYを直接設定")
        return
    
    print(f"🔑 APIキー: {'設定済み' if API_KEY else '未設定'}")
    print("=" * 60)
    
    # エクスポート実行
    exporter = NotionExporter(API_KEY)
    success = exporter.export_claude_prompts_to_notion(PAGE_ID)
    
    print("=" * 60)
    if success:
        print("✅ プロンプト集のエクスポートが完了しました！")
        print(f"📱 Notionページを確認してください: {PAGE_URL}")
    else:
        print("❌ エクスポート中にエラーが発生しました")
        print("詳細については上記のエラーメッセージを確認してください")

if __name__ == "__main__":
    main() 