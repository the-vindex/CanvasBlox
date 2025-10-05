# /todo

Add a todo item to TASKS.md without implementing it.

## Usage

```
/todo <description>
```

## Example

```
/todo Add hover effect to save button
```

## Note: Concurrent Usage

If another Claude instance is running `/next` (actively working on TASKS.md), use `/todo-inbox` instead to avoid conflicts.

## Instructions

1. Read TASKS.md
2. Find appropriate chapter (ask if unclear)
3. **Skip completed chapters** (✅ Completed)
4. Add task using next number (e.g., 11.12, 11.13)
5. Confirm chapter and task number

## Task Format

```markdown
#### X.Y Task description
- **Priority:** 3
- **Location:** File/component path
- **Current:** What exists now
- **Change:** What should change
- **Implementation:** Steps to implement
- **Files to modify:** List of files
- **Tests:** What to test
- **Note:** Additional context
```

## Priority Values

- **1** - AI config (slash commands, permissions, MCP) - skip by /next
- **2** - Bugfix - higher priority
- **3** - Feature (default) - normal work
- **4** - Idea/enhancement - nice-to-have

**Default to P3 if uncertain**
