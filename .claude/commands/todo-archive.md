# /todo-archive

Archive completed and approved chapters from TASKS.md to docs/archive/TASKS-COMPLETED.md.

## Usage

```
/todo-archive
```

## When to Use

Use this command when:
- One or more chapters are marked "✅ Complete" in TASKS.md
- Those chapters have "✓ Approved" in the Progress Tracking table
- You want to clean up TASKS.md by moving completed work to the archive

## What It Does

1. **Scans TASKS.md** - Finds chapters with both:
   - Chapter Status: `✅ Complete`
   - Progress Tracking: `✓ Approved`

2. **Extracts chapters** - Uses HTML comment markers:
   - `<!-- CHAPTER_START: N -->`
   - `<!-- CHAPTER_END: N -->`

3. **Archives** - Appends to `docs/archive/TASKS-COMPLETED.md` with:
   - Timestamp (YYYY-MM-DD)
   - Full chapter content preserved
   - Separator markers included

4. **Updates TASKS.md** - Removes archived chapters and updates Progress Tracking table

## Instructions

1. Run the archiving script: `npx tsx scripts/archive-completed-chapters.ts`
2. Review the output showing which chapters were archived
3. Verify TASKS.md now has fewer chapters
4. Check docs/archive/TASKS-COMPLETED.md for archived content
5. Confirm the changes look correct

## Output Example

```
🔍 Scanning TASKS.md for completed chapters...

Found 11 chapters with separators

📦 Found 4 chapters ready to archive:

   - Chapter 13: E2E Test Simplification & Refactoring
   - Chapter 16: Bug Fixes
   - Chapter 14: E2E Test Organization & Splitting
   - Chapter 19: Undo/Redo History Preservation

✅ Appended 4 chapters to docs/archive/TASKS-COMPLETED.md

✅ Updated TASKS.md (removed 4 chapters)

🎉 Archive complete!
```

## Notes

- Only chapters meeting BOTH criteria are archived (Complete + Approved)
- Original chapter content is preserved with full history
- Archive is append-only - old entries are never modified
- Script handles multiple chapters in a single run
- Safe to run multiple times - won't duplicate archives

## Archive Location

`docs/archive/TASKS-COMPLETED.md`

## Related Commands

- `/todo` - Add new task to TASKS.md
- `/todo-inbox` - Add task when TASKS.md is in use
- `/merge-inbox` - Move tasks from inbox to TASKS.md
