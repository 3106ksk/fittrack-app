# Codex Prompts

## Prompt List
- `learn_pair`: Pair programming workflow with Socratic questioning and reflection.
- `learn_task`: Guided implementation flow with briefings, insights, and reviews.

## Common Rules
- Always send the task-specific details in the next message after inserting a prompt.
- Reference the target with a clear label such as `Input:` or `Target:` when providing the follow-up message.
- Re-run prompts directly; they are designed to be idempotent.

## Follow-up Template
```markdown
Input:
Target: <describe the task, requirement, or artifact here>
```
