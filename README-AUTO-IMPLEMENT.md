# Auto-Implementation Script

This script automatically implements remaining features from `FEATURE_RESTORATION_PLAN.md` using Claude Code in full autonomous mode.

## How It Works

1. **Runs in a loop** (max 20 iterations)
2. **Each iteration:**
   - Starts fresh Claude Code session (context reset)
   - Runs `/next` command to get next incomplete step
   - Implements the step autonomously (TDD: tests first, then implementation)
   - Logs questions/assumptions to `OPEN_QUESTIONS.md`
   - Commits changes
   - Exits (context cleared for next iteration)

3. **Stops when:**
   - All steps marked as complete
   - Max iterations reached (20)
   - Error encountered

## Usage

```bash
./auto-implement.sh
```

## What Claude Does Automatically

- ✅ Writes tests FIRST (TDD)
- ✅ Implements features
- ✅ Runs all tests (unit + e2e)
- ✅ Fixes test failures
- ✅ Makes implementation decisions
- ✅ Commits with descriptive messages
- ✅ Logs all assumptions to `OPEN_QUESTIONS.md`

## What You Review After

1. **`OPEN_QUESTIONS.md`** - Questions, assumptions, and decisions made
2. **Git commits** - Review each step's implementation
3. **`FEATURE_RESTORATION_PLAN.md`** - Steps marked as "✅ Complete (auto-accepted)"
4. **Tests** - All tests should be passing

## Safety Features

- **Dangerous flags used:** `--dangerously-skip-permissions`, `--dangerously-skip-confirmations`
- **Context reset:** Each iteration starts fresh (prevents context pollution)
- **Max iterations:** Limited to 20 to prevent infinite loops
- **Question logging:** All assumptions documented for review
- **Git commits:** Each step committed separately for easy rollback

## Monitoring Progress

Watch the script output:
```bash
./auto-implement.sh | tee auto-implement.log
```

Check open questions during run:
```bash
tail -f OPEN_QUESTIONS.md
```

Check feature plan progress:
```bash
grep "✅ Complete" FEATURE_RESTORATION_PLAN.md | wc -l
```

## Rollback a Step

```bash
git log --oneline  # Find the commit
git revert <commit-hash>
```

## Stop Early

Press `Ctrl+C` to stop between iterations (safe - waits for current iteration to complete).

## Expected Runtime

- Each step: ~2-5 minutes
- Total (12 remaining steps): ~30-60 minutes

## Output Files

- `OPEN_QUESTIONS.md` - Questions and assumptions (review this!)
- `auto-implement.log` - Full execution log (if using `tee`)
- Git commits - One per completed step
- Updated `FEATURE_RESTORATION_PLAN.md` - Steps marked complete
