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

When this command is invoked:

1. Read the TASKS-INBOX.md file
2. Generate a timestamp for the entry
3. Append the task to the inbox with this format:
   ```markdown
   ### [YYYY-MM-DD HH:MM] Task description
   - **Added by:** User request
   - **Suggested chapter:** [Auto-suggest based on task description, or "TBD"]
   - **Notes:** [Any additional context provided]
   ```
4. Confirm the task was added to inbox
5. Remind user to run `/merge-inbox` later to consolidate into TASKS.md

## Notes

- Tasks in the inbox are NOT automatically processed by `/next`
- Use `/merge-inbox` to move tasks from inbox → TASKS.md
- The inbox is a simple append-only queue - no conflicts possible
