# /next

Implement the next step from the Feature Restoration Plan.

## Usage

```
/next
```

## Instructions

When this command is invoked:

1. **Read** `FEATURE_RESTORATION_PLAN.md`
2. **Find** the first step with status: ⬜ Not Started
3. **Implement** that step following the TDD workflow and principles described in the plan
4. **Update** the step's status to: 🧪 Ready for User Testing
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

- Follow the TDD workflow from the plan: write tests first, then implement
- Follow all implementation details from the step
- Preserve scrollbar functionality
- Check and respect step dependencies
