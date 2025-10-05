# /todo-inbox

Add a todo item to TASKS-INBOX.md when another Claude instance is working on TASKS.md.

## Usage

```
/todo-inbox <description>
```

## Example

```
/todo-inbox Add hover effect to save button
```

## When to Use

Use this command when:
- Another Claude instance is running `/next` (actively working on TASKS.md)
- You want to add a task without creating merge conflicts
- You're adding tasks while work is in progress

Use regular `/todo` when:
- No other instance is working on TASKS.md
- You want to add directly to the main roadmap

## Instructions

1. Read TASKS-INBOX.md
2. Append task with timestamp
3. Suggest chapter and priority
4. Confirm added to inbox

## Inbox Format

```markdown
### [YYYY-MM-DD HH:MM] Task description
- **Priority:** 3
- **Suggested chapter:** Chapter 11
- **Notes:** Additional context
```

## Priority Values

- **1** - AI config (slash commands, permissions, MCP)
- **2** - Bugfix
- **3** - Feature (default)
- **4** - Idea/enhancement

## Notes

- Use `/merge-inbox` later to consolidate into TASKS.md
- Inbox tasks NOT processed by `/next`
