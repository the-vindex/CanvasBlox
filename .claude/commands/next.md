# /next

Implement the next task from the TASKS.md roadmap.

mode: plan

## Usage

```
/next
```

## Instructions

When this command is invoked:

1. **Check inbox (if exists):**
   - Read `TASKS-INBOX.md` if it exists
   - If inbox contains tasks (not just template), notify user:
     - "📥 Note: TASKS-INBOX.md has queued tasks. Consider running `/merge-inbox` after this session to consolidate them."
   - Continue to next step (don't block on inbox)

2. **Read** `TASKS.md`
3. **Find** the first task with status: ⏸️ Not Started or similar incomplete status
   - **Priority order:** Skip P1 (AI config), then P2 (bugfix) → P3 (feature) → P4 (idea)
   - **P1 tasks are skipped** - they require user to modify .claude/, permissions, or MCP
   - Within same priority, use document order (top to bottom)
   - If no priority specified, assume P3
4. **Implement** that step following the **TDD workflow from CLAUDE.md**:
   - ✅ Write failing tests first (BOTH unit AND e2e)
   - ✅ Implement feature to make tests pass
   - ✅ Verify all tests pass: `npm test && npm run test:e2e`
   - ✅ **Run `/review-tests [scope]`** to check test quality
   - ✅ **Automatically refactor tests** based on review feedback (don't ask, just do it)
   - ✅ Run tests again to verify refactoring
   - ✅ **Run linter**: `npm run lint:fix` to fix code style issues
   - ✅ Commit code + tests together
   - ✅ Push to remote: `git push`
5. **Update** the task's status to: 🧪 Ready for User Testing (or appropriate status)
6. **Report** to the user:
   - Which step was implemented
   - What files were changed
   - What they need to manually test (from the "Manual Test" section)
   - Reminder to run `/next` again after testing to continue

## When User Confirms Testing

When the user tells you the step is tested/working:
- Update that step's status from 🧪 to ✅ Complete
- Acknowledge completion
- Ask if they want to continue with `/next`

## Notes

- **CRITICAL**: Follow the complete TDD workflow from CLAUDE.md (see step 3 above)
- **CRITICAL**: Always run `/review-tests [scope]` BEFORE committing
- Follow all implementation details from the step
- Preserve scrollbar functionality
- Check and respect step dependencies
- Run BOTH unit tests AND e2e tests every time (never skip either one)
