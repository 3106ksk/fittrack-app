# 月次目標機能 - ドキュメントコミットメッセージ集

## 要件定義・設計書作成のコミットメッセージ

### 初回の要件定義と設計書作成

```bash
docs(monthly-goals): add comprehensive requirements and design documentation

Add complete documentation suite for monthly goals feature including:
- Functional requirements with user stories and acceptance criteria
- Database design with goals table schema and migration strategy
- API specification in OpenAPI 3.1 format
- UI component architecture for GoalProgressCard
- Critical areas documentation with official reference links

Key design decisions:
- Daily achievement counting (multiple workouts per day = 1 count)
- Reward system with claim functionality
- Period overlap prevention with database triggers
- Timezone-aware date handling with PostgreSQL DATE_TRUNC

Technical specifications:
- JWT-based authentication for goal ownership
- Optimistic locking for reward claim operations
- Transaction management for data consistency
- 90%+ test coverage requirement for critical areas

Refs: #[issue-number]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### 要件更新（日次達成ベース追加）

```bash
docs(monthly-goals): update requirements for daily achievement-based counting

Refactor goal tracking from session/duration to daily achievement model:
- Change from targetSessions/targetDurationMin to targetCount
- Implement daily achievement logic (1 day = 1 count)
- Add reward system with title, note, and claim functionality
- Support for monthly and custom period types

Breaking changes:
- Table renamed from monthly_goals to goals
- New columns: reward_title, reward_note, reward_claimed
- API endpoints moved from /api/goals/monthly to /api/v1/goals

Documentation updates:
- Update functional requirements to v2.0.0
- Create new database design document (database-design-v2.md)
- Add OpenAPI v2 specification with reward endpoints
- Include timezone handling documentation

Refs: #[issue-number]
```

### API仕様書作成

```bash
docs(api): add OpenAPI 3.1 specification for goals endpoints

Create comprehensive API documentation:
- Define all CRUD operations for goals
- Document progress calculation endpoint
- Add reward claim endpoint specification
- Include error response schemas

Security considerations:
- JWT Bearer token authentication
- User isolation (can only access own goals)
- 409 Conflict for period overlap
- 422 Unprocessable for incomplete goal claim

Response examples and schemas included for:
- Goal creation with period validation
- Progress calculation with daily counts
- Reward claim with achievement validation

Refs: #[issue-number]
```

### データベース設計ドキュメント

```bash
docs(database): add goals table design with migration strategy

Document database architecture for goals feature:
- Table schema with constraints and indexes
- Period overlap prevention trigger
- Timezone-aware query patterns
- Migration and rollback procedures

Key design elements:
- UNIQUE constraint on (user_id, start_date, end_date) WHERE is_active
- CHECK constraints for positive integers
- Partial indexes for active goal queries
- TIMESTAMPTZ for timezone handling

Performance optimizations:
- Index on (user_id, start_date, end_date)
- Partial index WHERE is_active = true
- DATE_TRUNC with timezone for efficient counting

Refs: #[issue-number]
```

### クリティカル領域ドキュメント

```bash
docs(security): add critical implementation reference guide

Document security-critical implementation areas:
- Official documentation URLs and specific sections
- Implementation checkpoints with warnings
- Risk assessment matrix
- Decision flowchart for documentation needs

Critical areas identified:
- JWT authentication extension
- PostgreSQL DATE_TRUNC with AT TIME ZONE
- Transaction isolation levels
- OVERLAPS operator for period checking

Each area includes:
- Direct links to official documentation
- Specific code warnings (⚠️ STOP points)
- Implementation examples
- Common pitfall warnings

Refs: #[issue-number]
```

### 実装アプローチガイド作成

```bash
docs(guide): add implementation approach guide with learning strategy

Create structured implementation guide:
- Phase-based implementation plan
- Documentation requirements per phase
- LLM vs documentation decision matrix
- Test-driven development approach

Learning approach:
- Critical areas require documentation deep-dive
- UI/utilities suitable for LLM suggestions
- Hybrid approach for business logic
- Clear STOP points for documentation checks

Includes:
- Risk-based verification strategy
- Performance optimization checklist
- Security review requirements
- Coverage targets by component type

Refs: #[issue-number]
```

### ドキュメント構造の整理

```bash
docs(structure): reorganize documentation with professional standards

Restructure documentation following enterprise patterns:
- Feature-based directory organization
- Document type classification (requirements/design/api-spec)
- Version control with document numbers
- Status tracking (Draft/Review/Approved)

New structure:
```
docs/features/monthly-goals/
├── requirements/
├── design/
├── api-spec/
└── research/
```

Document standards:
- Document number format: XXX-YY-NNN
- Semantic versioning for documents
- Revision history tracking
- Template consistency

Refs: #[issue-number]
```

### Claude Commands作成

```bash
chore(dx): add Claude commands for automated feature development workflow

Create command suite for standardized development:
- feature_requirements: Requirements and design generation
- feature_research: Critical area identification
- feature_implement: Implementation with doc warnings
- feature_test: Test creation and execution
- feature_commit: Standardized commit process

Automation features:
- Automatic critical area detection
- Official documentation URL injection
- Coverage requirement enforcement
- Semantic commit message generation

Benefits:
- Consistent development process
- Quality gates at each phase
- Reduced human error
- Faster onboarding

Refs: #[issue-number]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

## コミットのベストプラクティス

### 良いコミットメッセージの要素

1. **明確な変更内容の要約**（50文字以内）
2. **詳細な説明**（必要に応じて）
3. **変更の理由と影響**
4. **関連するIssue番号**
5. **Breaking changesの明記**（該当する場合）

### ドキュメントコミットの種類

| Type | 用途 | 例 |
|------|------|-----|
| `docs` | 純粋なドキュメント追加/更新 | README更新、設計書作成 |
| `chore` | ツール/設定関連 | Claude commands追加 |
| `feat` | 機能実装を伴うドキュメント | API仕様と実装 |

### コミット順序の推奨

1. 要件定義・設計書
2. API仕様
3. データベース設計
4. 実装ガイド
5. テスト仕様
6. デプロイメント手順