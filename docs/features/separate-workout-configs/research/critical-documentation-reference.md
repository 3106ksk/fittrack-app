# ワークアウト設定分離機能 - クリティカル領域の公式ドキュメント参照ガイド

**文書番号**: CDR-WS-001
**バージョン**: 1.0.0
**作成日**: 2025-09-16
**ステータス**: Draft

## ⚠️ 実装前必須確認事項

このドキュメントは、実装時に**必ず参照すべき公式ドキュメント**をまとめています。
特に🔴マークの項目は、実装前に必ず確認してください。

## 1. LocalStorage API 🔴

### 公式ドキュメント
**MDN Web Docs**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

### 必須参照セクション
- [Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Using the Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
- [StorageEvent](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent)

### 実装チェックポイント

```javascript
// ⚠️ STOP: LocalStorage実装前に確認
// 1. ストレージ可用性チェック
// 2. 容量制限の確認（5-10MB）
// 3. 同期APIによるブロッキング考慮
// 4. プライベートブラウジング対策

// 🔴 必須実装: ストレージ可用性チェック
function checkStorageAvailability() {
  // MDN推奨の実装パターンを確認
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#feature-detecting_localstorage
}

// 🔴 必須実装: 容量管理
async function checkStorageQuota() {
  // Storage API仕様確認
  // https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate
}
```

## 2. React 18 公式ドキュメント 🟡

### 公式ドキュメント
**React Documentation**: https://react.dev/

### 必須参照セクション
- [StrictMode](https://react.dev/reference/react/StrictMode)
- [useEffect](https://react.dev/reference/react/useEffect)
- [useMemo and useCallback](https://react.dev/reference/react/useMemo)
- [Automatic Batching](https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching)

### 実装チェックポイント

```javascript
// ⚠️ STOP: React 18 Strict Mode考慮事項
// 1. useEffectの二重実行への対処
// 2. クリーンアップ関数の適切な実装
// 3. 自動バッチングの影響

// 🟡 注意: Strict Modeでの副作用
useEffect(() => {
  // 公式ドキュメントのガイドライン確認
  // https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development
}, []);
```

## 3. Material-UI v5 🟢

### 公式ドキュメント
**MUI Documentation**: https://mui.com/material-ui/

### 推奨参照セクション
- [Drawer API](https://mui.com/material-ui/api/drawer/)
- [Theme customization](https://mui.com/material-ui/customization/theming/)
- [Performance](https://mui.com/material-ui/guides/performance/)

### 実装チェックポイント

```javascript
// Material-UIは標準パターンで実装可能
// ただし、パフォーマンス最適化時は公式ドキュメント参照
```

## 4. セキュリティ関連 🔴

### 公式ドキュメント
- **OWASP XSS Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **React Security**: https://legacy.reactjs.org/docs/introducing-jsx.html#jsx-prevents-injection-attacks

### 必須参照セクション
- XSS Prevention Rules
- Input Validation
- Output Encoding

### 実装チェックポイント

```javascript
// ⚠️ STOP: セキュリティ実装前に確認
// 1. 入力値のサニタイゼーション方法
// 2. ReactのデフォルトXSS保護機能
// 3. dangerouslySetInnerHTMLの回避

// 🔴 必須: OWASP推奨のサニタイゼーション確認
function sanitizeUserInput(input) {
  // OWASP XSS Prevention Cheat Sheet参照
  // https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#rule-1-html-encode-before-inserting-untrusted-data-into-html-element-content
}
```

## 5. Web Storage仕様 🔴

### 公式仕様書
**W3C Web Storage**: https://www.w3.org/TR/webstorage/

### 必須参照セクション
- [The localStorage attribute](https://www.w3.org/TR/webstorage/#the-localstorage-attribute)
- [The storage event](https://www.w3.org/TR/webstorage/#the-storage-event)
- [Security](https://www.w3.org/TR/webstorage/#security-localStorage)

## 実装時の判断基準

### 🔴 実装を中断してドキュメント参照が必要

以下の状況では、**必ず公式ドキュメントを確認**してから実装を進めてください：

1. **LocalStorage操作の実装時**
   - 容量制限への対処
   - エラーハンドリング
   - クロスタブ同期

2. **セキュリティ関連の実装時**
   - ユーザー入力の処理
   - データの永続化
   - 外部データの取り込み

3. **ブラウザ互換性が必要な機能**
   - Storage API
   - Navigator API
   - Event Listeners

### 🟡 実装を続行しつつ後で確認

以下は実装を進めながら、必要に応じて参照：

1. **React最適化**
   - パフォーマンスチューニング
   - メモ化戦略
   - レンダリング最適化

2. **状態管理パターン**
   - Context API使用時
   - カスタムフック設計

### 🟢 ドキュメント参照不要

以下は標準的な実装で対応可能：

1. **UIコンポーネント実装**
   - Material-UI標準コンポーネント
   - 基本的なスタイリング

2. **ユーティリティ関数**
   - 配列操作
   - オブジェクト操作
   - 日付フォーマット

## クイックリファレンス

### 最重要ドキュメントTop 5

1. 📕 **MDN LocalStorage**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
2. 📘 **React StrictMode**: https://react.dev/reference/react/StrictMode
3. 📗 **OWASP XSS Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
4. 📙 **Web Storage Spec**: https://www.w3.org/TR/webstorage/
5. 📓 **Storage Quotas**: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria

### 実装前チェックリスト

```markdown
## 実装開始前の確認

### LocalStorage実装
- [ ] MDN Web Storage APIガイド読了
- [ ] 容量制限の理解
- [ ] エラーハンドリング方法確認
- [ ] プライベートブラウジング対策確認

### セキュリティ
- [ ] OWASP XSS Prevention読了
- [ ] 入力サニタイゼーション方法決定
- [ ] Reactのセキュリティ機能理解

### React 18
- [ ] Strict Mode影響理解
- [ ] useEffect二重実行対策確認
- [ ] 自動バッチング理解

### ブラウザ互換性
- [ ] 対象ブラウザの機能サポート確認
- [ ] Polyfill必要性判断
- [ ] フォールバック実装計画
```

## トラブルシューティングリソース

### 問題別参照先

| 問題カテゴリ | 参照ドキュメント | URL |
|------------|---------------|-----|
| LocalStorage エラー | MDN DOMException | https://developer.mozilla.org/en-US/docs/Web/API/DOMException |
| React レンダリング問題 | React DevTools Profiler | https://react.dev/learn/react-developer-tools |
| メモリリーク | Chrome DevTools Memory | https://developer.chrome.com/docs/devtools/memory-problems/ |
| パフォーマンス | Lighthouse | https://developer.chrome.com/docs/lighthouse/overview/ |

## 更新履歴

- 2025-01-16: 初版作成
- 定期的に最新ドキュメントURLを確認し更新予定

---

**重要**: このドキュメントのURLは定期的に確認し、リンク切れがないか検証してください。