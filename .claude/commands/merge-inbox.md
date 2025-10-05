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
   - Find or create chapter
   - Use next number (e.g., 11.12)
   - Format task:
     ```markdown
     #### X.Y Task description
     - **Priority:** 3
     - **Location:** File/component path
     - **Current:** What exists now
     - **Change:** What should change
     - **Implementation:** Steps
     - **Files to modify:** List
     - **Tests:** What to test
     - **Note:** Context
     ```
   - Add to "Remaining Tasks" section
   - Update chapter task count

5. **Clear inbox and report:**
   - Reset TASKS-INBOX.md to template
   - Show summary

## Rules

- **Skip completed chapters** (✅ Completed)
- **Use existing numbering** - find next available
- **Auto-merge** - only ask if conflict
- **Reset inbox** after merge

## Priority Values

- **1** - AI config - skip by /next
- **2** - Bugfix
- **3** - Feature (default)
- **4** - Idea/enhancement
