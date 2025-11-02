# Tasks: 新規登録後のナビゲーション問題修正

**入力**: `/specs/004-post-registration-navigation-fix/` からの設計ドキュメント
**前提条件**: plan.md（必須）、spec.md（ユーザーストーリー用に必須）、research.md、quickstart.md

**テスト**: このプロジェクトは Constitution の Testing Requirements（80%カバレッジ目標）に従い、テストタスクを含みます。

**組織**: タスクはユーザーストーリー別にグループ化され、各ストーリーの独立した実装とテストを可能にします。

## フォーマット: `[ID] [P?] [Story] 説明`
- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（例：US1、US2、US3）
- 説明には正確なファイルパスを含む

## パス規則
- **Web アプリ**: `frontend/src/`, `backend/src/`（このプロジェクトで使用）
- このプロジェクトはフロントエンドのみの変更（バックエンド変更なし）

---

## Phase 1: Setup（共有インフラ）

**目的**: プロジェクト初期化と基本構造の確認

- [ ] T001 開発環境の確認: Node.js v18+、npm v9+がインストールされていることを確認
- [ ] T002 依存関係のインストール: `cd frontend && npm install` を実行し、すべての依存関係が最新であることを確認
- [ ] T003 開発サーバーの起動テスト: `npm run dev` でフロントエンドが正常に起動することを確認

---

## Phase 2: Foundational（ブロッキング前提条件）

**目的**: ユーザーストーリーの実装前に完了する必要がある基盤

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの作業を開始できません

- [ ] T004 既存コードの理解: `frontend/src/components/Register.jsx` を読み、現在のナビゲーションロジック（Line 46付近）を確認
- [ ] T005 [P] 既存コードの理解: `frontend/src/components/Login.jsx` を読み、現在のメッセージ処理パターンを確認
- [ ] T006 [P] 既存テストの確認: `frontend/src/components/__tests__/Register.test.tsx` を読み、現在のテストカバレッジを確認
- [ ] T007 [P] 既存テストの確認: `frontend/src/components/__tests__/Login.test.tsx` を読み、現在のテストパターンを確認

**Checkpoint**: 基盤完了 - ユーザーストーリーの実装を並列で開始可能

---

## Phase 3: User Story 1 - 登録成功時のナビゲーション (優先度: P1) 🎯 MVP

**目標**: 登録成功後にユーザーを `/login` にリダイレクトし、成功メッセージを location.state で保持する

**独立したテスト**: 新しいアカウントを登録し、ログインページに到着し、成功メッセージが表示されることを確認し、新しい認証情報でログインできることを検証

### Tests for User Story 1

**NOTE: これらのテストを最初に書き、実装前に失敗することを確認してください（TDD）**

- [ ] T008 [US1] Register コンポーネントのナビゲーションテストを作成: `frontend/src/components/__tests__/Register.test.tsx` に以下を追加:
  - 登録成功時に `navigate` が `/login` で呼ばれることをテスト（`/dashboard` ではない）
  - `navigate` の第2引数として `state` オブジェクトが渡されることをテスト
  - `state.message` が適切な成功メッセージを含むことをテスト
  - テストを実行し、**失敗することを確認**（実装前）

### Implementation for User Story 1

- [ ] T009 [US1] Register.jsx のナビゲーション先を変更: `frontend/src/components/Register.jsx` の Line 46付近を修正:
  - 変更前: `navigate('/dashboard', { state: { message: ... } })`
  - 変更後: `navigate('/login', { state: { message: 'アカウント作成が完了しました。ログインしてください。', type: 'success' } })`
  - 既存のエラー処理は変更しない（Line 51-88）

- [ ] T010 [US1] テストの実行と検証: `npm run test Register.test` を実行し、T008 で作成したテストが**合格**することを確認

- [ ] T011 [US1] 手動テストの実行:
  - `npm run dev` で開発サーバーを起動
  - `http://localhost:5173/signup` で新規アカウントを作成
  - 登録成功後に `/login` にリダイレクトされることを確認（`/dashboard` ではない）
  - ブラウザの開発者ツールで React DevTools を使用し、Login コンポーネントの `location.state` に message が含まれることを確認

**Checkpoint**: この時点で、User Story 1 は完全に機能し、独立してテスト可能であるべきです

---

## Phase 4: User Story 2 - 成功メッセージの可視性 (優先度: P2)

**目標**: ログインページで登録成功メッセージを Material-UI Alert コンポーネント（severity="success"）を使用して表示する

**独立したテスト**: 登録を完了し、ログインページで成功メッセージが成功スタイリング（緑色、成功アイコン）で目立って表示されることを検証

### Tests for User Story 2

- [ ] T012 [US2] Login コンポーネントの成功メッセージ表示テストを作成: `frontend/src/components/__tests__/Login.test.tsx` に以下を追加:
  - `location.state.message` が存在する場合、Alert コンポーネントが表示されることをテスト
  - Alert の `severity` が "success" であることをテスト
  - Alert のテキストが `location.state.message` と一致することをテスト
  - `location.state` がない場合、成功メッセージが表示されないことをテスト
  - テストを実行し、**失敗することを確認**（実装前）

### Implementation for User Story 2

- [ ] T013 [US2] Login.jsx に成功メッセージ表示機能を追加: `frontend/src/components/Login.jsx` を修正:
  - `useLocation` hook をインポート: `import { useLocation } from 'react-router-dom';`
  - コンポーネント内で location を取得: `const location = useLocation();`
  - `location.state?.message` から成功メッセージを読み取る: `const successMessage = location.state?.message;`
  - エラーメッセージの上に成功メッセージ用の Alert を追加（Line 113付近）:
    ```jsx
    {successMessage && (
      <Alert severity="success" sx={{ mb: 2 }}>
        {successMessage}
      </Alert>
    )}
    ```

- [ ] T014 [US2] Login.jsx でログイン送信時に location.state をクリア: `onSubmit` 関数内（Line 33-70）を修正:
  - ログイン試行前に location.state をクリア:
    ```javascript
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
    ```
  - これにより、ログイン後に成功メッセージが再表示されないようにする

- [ ] T015 [US2] テストの実行と検証: `npm run test Login.test` を実行し、T012 で作成したテストが**合格**することを確認

- [ ] T016 [US2] 手動テストの実行:
  - 登録からログインまでの完全なフローをテスト
  - ログインページで成功メッセージが表示されることを確認
  - メッセージが緑色の Alert コンポーネントで表示されることを確認
  - メッセージがログインフォームの上に配置されていることを確認
  - ログインフォームに入力中もメッセージが表示され続けることを確認

**Checkpoint**: この時点で、User Stories 1 と 2 は両方とも独立して機能するべきです

---

## Phase 5: User Story 3 - 登録エラー処理の一貫性 (優先度: P3)

**目標**: 登録失敗時のエラー処理が新しい成功フローと一貫性があることを確認する

**独立したテスト**: 無効なデータ（重複メール、短いパスワード）で登録を試み、エラーメッセージが正しく表示され、フォームデータが保持されることを検証

### Tests for User Story 3

- [ ] T017 [US3] Register コンポーネントのエラー処理テストを作成/更新: `frontend/src/components/__tests__/Register.test.tsx` に以下を追加/確認:
  - 登録失敗時（409, 422エラー）に `/signup` ページに留まることをテスト
  - エラーメッセージが表示されることをテスト
  - フォーム入力値が保持されることをテスト（パスワードを除く）
  - エラー修正後の再送信で成功メッセージがクリアされることをテスト
  - 既存のエラー処理テストが存在する場合、新しいナビゲーションと互換性があることを確認

### Implementation for User Story 3

- [ ] T018 [US3] 既存のエラー処理の検証: `frontend/src/components/Register.jsx` の catch ブロック（Line 51-88）を確認:
  - エラー時にナビゲーションが発生しないことを確認（既存の実装が正しいはず）
  - エラーメッセージが `setErrorMessage(errorMessage)` で設定されることを確認
  - react-hook-form によりフォーム入力が自動的に保持されることを確認

- [ ] T019 [US3] テストの実行と検証: `npm run test Register.test` を実行し、すべてのテスト（T008、T017）が合格することを確認

- [ ] T020 [US3] 手動テストの実行:
  - **テスト 3-1**: 既存のメールアドレスで登録を試みる
    - エラーメッセージが表示されることを確認
    - `/signup` ページに留まることを確認
    - ユーザー名とメールが保持されることを確認
  - **テスト 3-2**: 短いパスワード（6文字未満）で登録を試みる
    - エラーメッセージが表示されることを確認
  - **テスト 3-3**: エラーを修正して再送信
    - 成功メッセージが表示されることを確認
    - エラーメッセージがクリアされることを確認

**Checkpoint**: すべてのユーザーストーリーが独立して機能するべきです

---

## Phase 6: Polish & Cross-Cutting Concerns

**目的**: 複数のユーザーストーリーに影響する改善

- [ ] T021 [P] エッジケースのテスト: ブラウザの戻るボタン動作を手動テスト
  - 登録成功後、ログインページからブラウザの戻るボタンをクリック
  - `/signup` ページに戻ることを確認
  - 成功メッセージが登録ページに表示されないことを確認

- [ ] T022 [P] エッジケースのテスト: ページリロード動作を手動テスト
  - 登録成功後、ログインページで成功メッセージを表示
  - ページをリロード（F5 または Cmd+R）
  - 成功メッセージが消えることを確認
  - エラーが発生しないことを確認

- [ ] T023 [P] エッジケースのテスト: ダブルサブミット防止を手動テスト
  - 登録フォームに有効なデータを入力
  - 「アカウント作成」ボタンを素早く連続クリック
  - ボタンが無効化されることを確認（既存の実装）
  - 「登録中...」というテキストが表示されることを確認

- [ ] T024 テストカバレッジの確認: `npm run test:coverage` を実行
  - Register.jsx: 80%以上のカバレッジを確認
  - Login.jsx: 80%以上のカバレッジを確認
  - カバレッジが不足している場合、追加のテストを作成

- [ ] T025 [P] ドキュメントの更新: 変更内容を記録
  - `specs/004-post-registration-navigation-fix/` ディレクトリに CHANGELOG.md を作成（オプション）
  - 変更されたコンポーネントとその理由を記録

- [ ] T026 quickstart.md の検証: `specs/004-post-registration-navigation-fix/quickstart.md` のすべてのシナリオを実行
  - シナリオ 1: 正常な登録フロー
  - シナリオ 2: 成功メッセージの可視性
  - シナリオ 3: 登録エラー処理の一貫性
  - すべてのシナリオが期待通りに動作することを確認

- [ ] T027 Constitution Check の最終確認: すべての憲章原則への準拠を確認
  - ✅ Security-First: location stateは一時的、機密情報を含まない
  - ✅ Rapid Development: 新しい依存関係なし
  - ✅ Mobile-First: Material-UI Alert はレスポンシブ
  - ✅ Performance: 追加のAPI呼び出しなし
  - ✅ Testing: 80%カバレッジ達成

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし - 即座に開始可能
- **Foundational (Phase 2)**: Setup 完了に依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-5)**: すべて Foundational フェーズ完了に依存
  - ユーザーストーリーは並列で進行可能（スタッフがいる場合）
  - または優先度順に順次進行（P1 → P2 → P3）
- **Polish (Final Phase)**: すべての望まれるユーザーストーリーが完了していることに依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational (Phase 2) 後に開始可能 - 他のストーリーへの依存なし
- **User Story 2 (P2)**: Foundational (Phase 2) 後に開始可能 - US1 と統合するが、独立してテスト可能
- **User Story 3 (P3)**: Foundational (Phase 2) 後に開始可能 - US1/US2 と統合するが、独立してテスト可能

### Within Each User Story

- テストを最初に書き、実装前に失敗することを確認（TDD）
- コア実装の前に統合
- 次の優先度に移る前にストーリーを完了

### Parallel Opportunities

- Phase 1 の T002-T003 は並列実行可能
- Phase 2 の T005-T007 は並列実行可能
- Foundational フェーズ完了後、すべてのユーザーストーリーを並列で開始可能（チーム容量が許す場合）
- Phase 6 の T021-T023、T025 は並列実行可能

---

## Parallel Example: User Story 1

```bash
# User Story 1 のテストを並列で開始:
# （この機能では単一のテストファイルなので、実際には並列の機会は限定的）
Task: "Register コンポーネントのナビゲーションテストを作成"

# User Story 1 の実装タスク:
# （Register.jsx の単一ファイル変更なので、順次実行）
Task: "Register.jsx のナビゲーション先を変更"
Task: "テストの実行と検証"
Task: "手動テストの実行"
```

---

## Parallel Example: Across User Stories

```bash
# Foundational フェーズ完了後、チームで並列作業:
Developer A: Phase 3 - User Story 1（T008-T011）
Developer B: Phase 4 - User Story 2（T012-T016）
Developer C: Phase 5 - User Story 3（T017-T020）

# 各開発者は独立してストーリーを完了し、統合できます
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 を完了: Setup
2. Phase 2 を完了: Foundational（CRITICAL - すべてのストーリーをブロック）
3. Phase 3 を完了: User Story 1
4. **STOP and VALIDATE**: User Story 1 を独立してテスト
5. 準備ができていればデプロイ/デモ

### Incremental Delivery

1. Setup + Foundational を完了 → 基盤完了
2. User Story 1 を追加 → 独立してテスト → デプロイ/デモ（MVP！）
3. User Story 2 を追加 → 独立してテスト → デプロイ/デモ
4. User Story 3 を追加 → 独立してテスト → デプロイ/デモ
5. 各ストーリーは以前のストーリーを壊すことなく価値を追加

### Parallel Team Strategy

複数の開発者がいる場合:

1. チームで Setup + Foundational を一緒に完了
2. Foundational が完了したら:
   - Developer A: User Story 1（T008-T011）
   - Developer B: User Story 2（T012-T016）
   - Developer C: User Story 3（T017-T020）
3. ストーリーは独立して完了し、統合されます

---

## Task Summary

### Total Tasks: 27

- **Phase 1 (Setup)**: 3 タスク
- **Phase 2 (Foundational)**: 4 タスク
- **Phase 3 (User Story 1 - P1)**: 4 タスク（1テスト + 3実装）
- **Phase 4 (User Story 2 - P2)**: 5 タスク（1テスト + 4実装）
- **Phase 5 (User Story 3 - P3)**: 4 タスク（1テスト + 3実装）
- **Phase 6 (Polish)**: 7 タスク

### Task Count per User Story

- **User Story 1**: 4 タスク（登録成功時のナビゲーション）
- **User Story 2**: 5 タスク（成功メッセージの可視性）
- **User Story 3**: 4 タスク（登録エラー処理の一貫性）

### Parallel Opportunities

- **Setup フェーズ**: 0 タスク（T001は順次）
- **Foundational フェーズ**: 3 タスク（T005-T007）
- **User Stories**: 3 ストーリーが並列で進行可能（Foundational 後）
- **Polish フェーズ**: 3 タスク（T021-T023、T025）
- **合計**: 最大 6 タスクが並列実行可能

### Independent Test Criteria

#### User Story 1
- 新規アカウントを登録
- `/login` にリダイレクトされることを確認
- React DevTools で location.state に message が含まれることを確認
- ✅ Pass: `/dashboard` にリダイレクトされず、location.state が正しい

#### User Story 2
- 登録を完了し、ログインページに移動
- 成功メッセージが緑色の Alert で表示されることを確認
- ログインフォームに入力中もメッセージが表示され続けることを確認
- ✅ Pass: メッセージが severity="success" で表示され、適切に配置されている

#### User Story 3
- 重複メールまたは短いパスワードで登録を試みる
- エラーメッセージが表示され、`/signup` ページに留まることを確認
- フォーム入力が保持されることを確認
- ✅ Pass: エラー処理が新しいフローと一貫性がある

### Suggested MVP Scope

**MVP = User Story 1 のみ**（Phase 1 + Phase 2 + Phase 3）

これにより、核心的な問題（ `/dashboard` → `/login` のリダイレクト問題）が修正され、ユーザーが混乱せずに登録フローを完了できるようになります。

User Story 2 と 3 は UX の改善とエラー処理の検証ですが、MVP には必須ではありません。

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルはタスクを特定のユーザーストーリーにマッピング（トレーサビリティのため）
- 各ユーザーストーリーは独立して完了およびテスト可能であるべき
- 実装前にテストが失敗することを確認（TDD）
- 各タスクまたは論理グループの後にコミット
- 任意のチェックポイントで停止し、ストーリーを独立して検証
- 避けるべきこと: 曖昧なタスク、同じファイルの競合、独立性を壊すストーリー間の依存関係

---

## Estimated Time

- **Setup (Phase 1)**: 15分
- **Foundational (Phase 2)**: 30分
- **User Story 1 (Phase 3)**: 1時間
- **User Story 2 (Phase 4)**: 1.5時間
- **User Story 3 (Phase 5)**: 1時間
- **Polish (Phase 6)**: 1時間
- **合計**: 約5-6時間（1人の開発者の場合）

複数の開発者が並列で作業する場合: 約2-3時間

---

**次のステップ**: `/speckit.implement` コマンドを実行して、これらのタスクの実装を開始します。
