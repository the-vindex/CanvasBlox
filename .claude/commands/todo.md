# /todo

Add a todo item to @VISUAL_ENHANCEMENTS.md without implementing it.

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

1. Read the VISUAL_ENHANCEMENTS.md file
2. Find the appropriate chapter for the todo item (ask the user if unclear)
3. Add the todo as a new task under that chapter
4. Use the existing task numbering format (e.g., 9.4, 9.5, etc.)
5. Include relevant location hints, file references, and notes
6. Do NOT implement the todo - only add it to the documentation
7. Confirm which chapter and task number it was added to

The todo should follow this format:

```markdown
#### X.Y Task description
- **Location:** File/component path
- **Current:** What exists now (if applicable)
- **Change:** What should change
- **Note:** Any additional context
```
