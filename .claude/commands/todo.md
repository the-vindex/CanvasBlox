# /todo

Add a todo item to @TASKS.md without implementing it.

## Usage

```
/todo <description>
```

## Example

```
/todo Add hover effect to save button
```

## Instructions

When this command is invoked:

1. Read the TASKS.md file
2. Find the appropriate chapter for the todo item (ask the user if unclear)
3. **IMPORTANT:** Check the chapter's status - DO NOT add tasks to completed chapters (marked with ✅ Completed)
4. If the suggested chapter is completed, find the next appropriate non-completed chapter or ask the user
5. Add the todo as a new task under that chapter
6. Use the existing task numbering format (e.g., 9.4, 9.5, etc.)
7. Include relevant location hints, file references, and notes
8. Do NOT implement the todo - only add it to the documentation
9. Confirm which chapter and task number it was added to

The todo should follow this format:

```markdown
#### X.Y Task description
- **Location:** File/component path
- **Current:** What exists now (if applicable)
- **Change:** What should change
- **Note:** Any additional context
```
