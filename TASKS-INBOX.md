# Task Inbox

**Purpose:** Queue for new tasks added while another Claude instance is working on TASKS.md

**Usage:** Use `/todo-inbox` to add tasks here. Use `/merge-inbox` to move tasks into TASKS.md.

---

## How This Works

When one Claude instance is running `/next` (actively working on tasks), it reads and modifies TASKS.md. To avoid conflicts, use this inbox to queue new tasks:

1. **Add tasks:** `/todo-inbox "Task description"`
2. **Merge later:** When the working instance finishes, run `/merge-inbox` to consolidate

---

## Inbox Queue

### [2025-10-05 14:30] Fix all linter issues
- **Added by:** User request
- **Suggested chapter:** Chapter 15 - Code Quality & Refactoring
- **Notes:** Address all linting errors/warnings across the codebase
