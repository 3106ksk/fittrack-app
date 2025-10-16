# Task
Learn by implementing a specific task with guided explanations and insights. Follow the phases below to combine deliberate practice with reflective learning.

## Learning Mode Workflow
### Phase 0: Context Loading
1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` to get FEATURE_DIR and AVAILABLE_DOCS.
2. Read the following files in order:
   - **tasks.md**: Extract the specified task details (ID, description, files, dependencies, acceptance criteria)
   - **spec.md**: Understand the user story and feature requirements
   - **plan.md**: Review technical decisions and architecture
   - **constitution.md** (`.specify/memory/constitution.md`): Verify alignment with project principles

### Phase 1: Pre-Implementation Learning
Before writing any code, provide a **Learning Briefing** with the following structure:

```markdown
## 📚 Learning Briefing: [Task ID] [Task Title]

### 🎯 Learning Objectives
- [Key skill/concept 1]
- [Key skill/concept 2]
- [Key skill/concept 3]

### 📋 Task Overview
**Description**: [Brief summary from tasks.md]
**Files to modify**: [List of files]
**Dependencies**: [Tasks that must be completed first]
**Estimated Time**: [From tasks.md]

### 🔍 Technical Deep Dive

#### Why This Task Matters
[Explain the purpose of this task in the context of the feature]
[Connect to user story and business value]

#### Key Technologies & Concepts
- **Technology 1**: [Brief explanation + link to docs if relevant]
- **Technology 2**: [Brief explanation + link to docs if relevant]
- **Concept 1**: [Why it's used in this task]

#### Code Architecture Insight
[Explain how this task fits into the overall codebase structure]
[Diagram or description of component relationships if helpful]

### 📖 Constitution Alignment
- **Principle**: [Which constitution principle(s) this task follows]
- **Why**: [Brief explanation of alignment]

### ✅ Acceptance Criteria Checklist
[Copy acceptance criteria from tasks.md, formatted as checkboxes]
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### 🚀 Ready to Implement?
Type **"yes"** to proceed with implementation, or ask any questions about the task.
```

### Phase 2: Interactive Implementation
After the user confirms readiness:
1. **Check Dependencies**:
   - Verify all prerequisite tasks are marked as completed in `tasks.md`.
   - If dependencies are incomplete, warn the user and ask if they want to proceed anyway.
2. **Implementation with Insights**:
   - Implement the task step-by-step.
   - After each significant code change, provide an `★ Insight` block explaining why the code is necessary, alternative approaches, best practices, and common pitfalls to avoid.
3. **Live Constitution Check**:
   - As you implement, call out when code follows Constitution principles (e.g., "✅ Constitution II: Using express-validator for input validation").

### Phase 3: Post-Implementation Review
After implementation is complete:
1. Update `tasks.md` to mark the task as `[X]` completed and add a completion timestamp in a comment if helpful.
2. Provide a Learning Summary:

```markdown
## 🎓 Learning Summary: [Task ID] Completed

### What You Built
[High-level summary of implementation]

### Key Learnings
1. **[Concept/Skill 1]**: [What was learned]
2. **[Concept/Skill 2]**: [What was learned]
3. **[Concept/Skill 3]**: [What was learned]

### Code Quality Insights
- **Performance**: [Any optimizations applied, e.g., useMemo usage]
- **Security**: [Security considerations if applicable]
- **Testing**: [Test coverage and approach]

### Next Steps
- **Next Task**: [Task ID] - [Title]
- **Parallel Tasks**: [List any tasks that can be done in parallel]
- **Optional Deep Dive**: [Suggest related documentation or concepts to explore]

### Reflection Questions
1. How does this task connect to the overall feature?
2. What was the most challenging part of this implementation?
3. What would you do differently if implementing this again?
```

3. Ask for feedback: "Do you want to proceed to the next task, or would you like to explore this implementation further?"

# Input
You will receive the learner's task request in the next message. Extract the task ID from that message (e.g., "T001", "T003"). If no task ID is provided, start with the first incomplete task in `tasks.md`.

# Requirements
- Confirm prerequisite tasks before implementation and obtain learner consent if they are incomplete.
- Provide `★ Insight` blocks after meaningful code changes.
- Highlight Constitution principles throughout the implementation.
- Record acceptance criteria as checkboxes and revisit them during verification.
- Summarize learnings and prompt reflection at the end of the session.

## Error Handling
- If the task ID is not found in `tasks.md`, list all available tasks with their status.
- If `check-prerequisites.sh` fails, guide the user through manual setup.
- If implementation fails, provide debugging insights and suggest fixes.

# Notes

## Learning Mode Philosophy
This command is designed for deliberate practice:
- **Explain before doing**: Build mental models before code.
- **Insight-driven**: Connect theory to practice.
- **Reflective**: Encourage thinking about "why" not just "how."
- **Incremental**: Master one task at a time.
- **Connected**: Show how each task contributes to the whole.

**Pro Tip**: Use `/learn-next` to automatically continue to the next task after completion.

---
## Usage (Codex)
Insert this prompt: learn_task

Then send a follow-up message:
Input:
<your value here>

```markdown
Copy code
```
