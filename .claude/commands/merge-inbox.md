# /merge-inbox

Merge tasks from TASKS-INBOX.md into TASKS.md.

## Usage

```
/merge-inbox
```

## When to Use

Run this command when:
- You've finished working with `/next` and TASKS.md is no longer being modified
- Tasks have accumulated in TASKS-INBOX.md
- You want to consolidate the inbox into the main roadmap

## Instructions

When this command is invoked:

1. **Read both files:**
   - Read TASKS-INBOX.md to see queued tasks
   - Read TASKS.md to understand current chapters and structure

2. **Check if inbox is empty:**
   - If TASKS-INBOX.md has no tasks (only template text), inform user and exit
   - If inbox has tasks, continue

3. **Auto-merge each task:**
   - Look at "Suggested chapter" hint from the inbox entry
   - Review current chapters in TASKS.md (their status and topics)
   - **Automatically determine** the best chapter based on:
     - Task description keywords (e.g., "test" → Chapter 13, "drawing tool" → Chapter 11)
     - Chapter topics and current focus
     - Suggested chapter from inbox entry
     - Whether chapter is completed (❌ NEVER add to completed chapters)
   - **If no clear chapter match:**
     - Create a new chapter with appropriate name and scope
     - Add as first task (X.1) in that new chapter
     - Set status to ⏸️ Not Started
   - **Only ask user if there's a serious conflict** (corrupted data, duplicate task, etc.)

4. **Add task to TASKS.md:**
   - Find or create the appropriate chapter section
   - Use the existing task numbering format (e.g., 11.11, 11.12, etc.)
   - Format the task following TASKS.md conventions:
     ```markdown
     #### X.Y Task description
     - **Location:** File/component path (if known)
     - **Current:** What exists now (if applicable)
     - **Change:** What should change
     - **Note:** Any additional context
     ```
   - Add to "Remaining Tasks" or "Tasks" section of that chapter
   - Update chapter's task count if shown in header

5. **Clear the inbox and report:**
   - After all tasks are merged, reset TASKS-INBOX.md to template state
   - Show summary:
     ```
     ✅ Merged X tasks from inbox:
     - Task 1 → Chapter 11.11
     - Task 2 → Chapter 13.10
     - Task 3 → Chapter 14.1 (new chapter created)
     ```

## Important Notes

- **Never add tasks to completed chapters** (marked with ✅ Completed)
- **Preserve existing task numbering** - find the next available number
- **Ask before merging** - don't assume chapter placement
- **Keep inbox clean** - reset to template after successful merge
- If user cancels mid-merge, leave remaining tasks in inbox

## Example Flow

```
User: /merge-inbox

Assistant reads inbox, finds 2 tasks:

Task 1: "Add undo animation"
- Suggested chapter: 11
- I suggest: Chapter 11 (Drawing Tools) - fits with UI improvements
- User confirms or corrects
- Task added as 11.11

Task 2: "Write E2E test for copy/paste"
- Suggested chapter: 13
- I suggest: Chapter 13 (E2E Test Simplification)
- User confirms or corrects
- Task added as 13.10

Inbox cleared. Summary shown.
```
