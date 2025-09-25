# FitStart 健康意思決定支援システム 設計ドキュメント

## 📁 ドキュメント構成

本ディレクトリには、FitStartを「運動記録アプリ」から「健康意思決定支援プラットフォーム」へと進化させるための設計・実装ドキュメントが含まれています。

### 📊 分析・戦略
- [差分分析](./01-gap-analysis.md) - 現状と目標のギャップ分析
- [戦略とポジショニング](./strategy/02-positioning.md) - 市場ポジショニングと競合差別化戦略
- [競合分析](./strategy/03-competitive-analysis.md) - 競合サービスとの詳細比較

### 🗓️ 実装計画
- [実装ロードマップ](./implementation/04-roadmap.md) - 週次リリース計画とマイルストーン
- [実装タスクリスト](./implementation/05-implementation-tasks.md) - GitHub Issue形式のタスク一覧

### 🛠️ 技術仕様
- [Small Wins Engine仕様](./technical/06-small-wins-specification.md) - 健康翻訳エンジンの詳細設計
- [API仕様書](./technical/07-api-specification.md) - バックエンドAPI設計
- [データベース設計](./technical/08-database-schema.md) - スキーマとマイグレーション
- [Webhook実装ガイド](./technical/09-webhook-implementation.md) - Strava Webhook統合

### 🎨 UI/UXデザイン
- [UIコンポーネント仕様](./technical/10-ui-components.md) - フロントエンドコンポーネント設計
- [デモシナリオ](./11-demo-scenarios.md) - 就活向けデモンストレーション計画

### 🔒 プライバシー・コンプライアンス
- [プライバシーポリシー](./privacy/12-privacy-policy.md) - データ管理とユーザー権利
- [医療免責事項](./privacy/13-medical-disclaimer.md) - Non-medical声明とSaMD回避

### 📈 成果測定
- [パフォーマンス指標](./14-performance-metrics.md) - KPIと測定方法

## 🎯 プロジェクト目標

1. **健康翻訳層の実装** - 運動データをWHO基準の健康指標に変換
2. **データ透明性の確保** - Consent Centerによる同意管理
3. **医療連携の実現** - PDF/CSVエクスポートによる医療機関との連携
4. **リアルタイム同期** - Webhookによる即時データ更新

## 🚀 クイックスタート

1. [差分分析](./01-gap-analysis.md)で現状を把握
2. [実装ロードマップ](./implementation/04-roadmap.md)で週次計画を確認
3. [実装タスクリスト](./implementation/05-implementation-tasks.md)からタスクを選択
4. 各技術仕様書を参照しながら実装

## 📝 ドキュメント更新履歴

- 2025-09-26: 初版作成
- Tech Lead & 実装PM による包括的な設計ドキュメント

---

**作成者**: FitStart Tech Lead & 実装PM
**最終更新**: 2025年9月26日