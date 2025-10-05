# /next

Implement the next task from the TASKS.md roadmap.

mode: plan

## Usage

```
/next
```

## Instructions

When this command is invoked:

1. **Read** `TASKS.md`
2. **Find** the first task with status: ⏸️ Not Started or similar incomplete status
3. **Implement** that step following the **TDD workflow from CLAUDE.md**:
   - ✅ Write failing tests first (BOTH unit AND e2e)
   - ✅ Implement feature to make tests pass
   - ✅ Verify all tests pass: `npm test && npm run test:e2e`
   - ✅ **Run `/review-tests [scope]`** to check test quality
   - ✅ **Automatically refactor tests** based on review feedback (don't ask, just do it)
   - ✅ Run tests again to verify refactoring
   - ✅ **Run linter**: `npm run lint:fix` to fix code style issues
   - ✅ Commit code + tests together
   - ✅ Push to remote: `git push`
4. **Update** the task's status to: 🧪 Ready for User Testing (or appropriate status)
5. **Report** to the user:
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
