# Scripts

Automation scripts for the CanvasBlox project.

## Task Management

### archive-completed-chapters.ts

Archives completed and approved chapters from TASKS.md to the archive.

**Usage:**
```bash
npx tsx scripts/archive-completed-chapters.ts

# Or use slash command
/todo-archive
```

**What it does:**
- Scans TASKS.md for chapters marked "✅ Complete" AND "✓ Approved"
- Extracts using HTML comment markers (`<!-- CHAPTER_START/END -->`)
- Appends to `docs/archive/TASKS-COMPLETED.md` with timestamp
- Removes from TASKS.md
- Updates Progress Tracking table

**Requirements:**
- Chapters must have separator markers
- Chapter Status: `✅ Complete`
- Progress Tracking: `✓ Approved`

### add-chapter-separators.py

Helper script to add HTML comment separators to all chapters in TASKS.md.

**Usage:**
```bash
python3 scripts/add-chapter-separators.py
```

**When to use:**
- When adding multiple new chapters without separators
- After manually editing TASKS.md structure
- One-time setup for archiving system

**Note:** Usually not needed - new chapters should include separators from the start.

## Chapter Format

All chapters in TASKS.md require separator markers:

```markdown
<!-- CHAPTER_START: 11 -->
## Chapter 11: Chapter Title

[Chapter content...]

<!-- CHAPTER_END: 11 -->
```

See `docs/TASK_MANAGEMENT.md` for complete chapter format documentation.
