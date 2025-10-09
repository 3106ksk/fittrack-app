# Phase 3: 監査ログ + コンプライアンス - 要件定義書（簡略版）

**作成日**: 2025-10-09
**期間**: 2025年12月（Month 3）
**工数**: 26時間
**前提**: [Phase 2](../phase2-authentication-security/) 完了後

---

## 目的

> **「完全な監査証跡」で医療データ拡張に必要なコンプライアンス基盤を確立**

---

## 主要機能要件

### FR-1: Audit Log テーブル実装

- ✅ audit_logs テーブル作成
- ✅ Audit Middleware 実装
- ✅ ログ保持期間設定（7年）

**受け入れ基準**:
- [ ] 全ての POST/PUT/DELETE がログに記録される
- [ ] 変更前後のデータが記録される (JSON diff)
- [ ] userID, action, ipAddress, timestamp が含まれる

---

### FR-2: データ保持ポリシー

- ✅ 論理削除 (Soft Delete) 実装
- ✅ GDPR対応: データエクスポート機能
- ✅ 完全削除オプション

**受け入れ基準**:
- [ ] 削除されたデータは deletedAt フラグで管理される
- [ ] ユーザーが自分のデータをCSV/JSONでエクスポートできる
- [ ] GDPR「データポータビリティ権」に準拠

---

### FR-3: RBAC（Role-Based Access Control）準備

- ✅ Role テーブル作成 (user, admin, doctor)
- ✅ Permission テーブル作成
- ✅ Authorization Middleware

**受け入れ基準**:
- [ ] ユーザーにロールが割り当てられる
- [ ] リソースアクセスがロールで制御される
- [ ] 将来の医師役割に対応できる設計

---

### FR-4: コンプライアンスドキュメント

- ✅ HIPAA準拠チェックリスト作成
- ✅ プライバシーポリシー作成
- ✅ 利用規約作成

---

## 技術スタック

- **監査ログ**: PostgreSQL (audit_logs table)
- **データ管理**: Sequelize (Soft Delete hooks)
- **アクセス制御**: Custom middleware

---

## 医療準備度目標

**80%達成**: 監査・コンプライアンス完了

---

**詳細設計**: Phase 2 完了後に作成予定
