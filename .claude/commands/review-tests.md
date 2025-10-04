# /review-tests

Review test quality against TDD principles and best practices.

## Usage

```
/review-tests [scope]
```

**Arguments:**
- `scope` (optional) - Specific scope to review (e.g., "Step 3", "useLevelEditor", "Canvas component")
  - If not provided, reviews tests based on git changes (modified/added test files)

## Examples

```
/review-tests Step 3
/review-tests Canvas component
/review-tests
```

## Instructions

When this command is invoked:

1. **Determine scope:**
   - If scope provided: Use that scope
   - If no scope: Run `git diff --name-only` and `git status --short` to find changed test files (*.test.ts, *.spec.ts), extract the feature being tested from those files

2. **Launch general-purpose agent with this prompt:**

```
You are a senior developer reviewing tests written by a junior developer.

**Context:**
- Project: CanvasBlox - Level editor for young game designers
- Review scope: [INSERT SCOPE HERE]

**Your task:**
1. Read TDD principles: docs/TDD_PRINCIPLES.md
2. Read the test files for [SCOPE]:
   - Find *.test.ts and *.spec.ts files related to [SCOPE]
   - Use Glob and Read tools to find relevant test files
3. Evaluate each test against:
   - **Scope**: Does it test the specified feature's actual scope?
   - **Behavior vs Implementation**: Is it testing what it does or how it does it?
   - **Best Practices**: Does it follow proper testing patterns (selectors, assertions)?
   - **TDD Anti-patterns**: Are there issues from TDD_PRINCIPLES.md?
   - **Redundancy**: Is the test necessary or duplicating coverage?
   - **Brittleness**: Is it too coupled to implementation details?

**Provide feedback in this format:**
```
## Test Review: [SCOPE]

### Tests that are good ✅
[List tests that properly test the scope]
- Test name (file:line)
- Why it's good: [brief explanation]

### Tests that need improvement ⚠️
[List tests with issues]
- **Test name** (file:line)
  - Issue: [what's wrong]
  - Why: [explain the problem]
  - Fix: [how to improve it]

### Tests that should be removed ❌
[List tests that are out of scope or redundant]
- **Test name** (file:line)
  - Reason: [why it should be removed]

### Missing test coverage 📝
[List functionality that should have tests but doesn't]
- [Missing test description]
- Why needed: [explanation]

### Overall Assessment
[Brief summary and key recommendations]

### Action Items
[Prioritized list of specific actions to take]
1. [Most important action]
2. [Next priority]
...
```

**Key principles to check:**
1. **Test-First Mindset**: Were tests written before implementation? (Look for test file creation dates vs implementation dates)
2. **Scope Adherence**: Tests should ONLY test the specified feature, not related/future features
3. **Red-Green-Refactor**: Can the test fail? Is it testing real functionality?
4. **No Implementation Coupling**: Tests shouldn't break when refactoring internal implementation
5. **Behavioral Testing**: Tests should verify outcomes, not method calls or internal state

Be direct and honest. The goal is to help improve test quality and TDD practices.
```

3. **After agent completes:**
   - Present the review to the user
   - Ask: "Would you like me to refactor the tests based on this review?"
   - If yes, implement the recommended changes
   - Run tests to verify refactoring

## Notes

- This command helps maintain high test quality across the codebase
- Use it after implementing new features or when test suite feels cluttered
- The agent will use Glob and Read to find relevant test files automatically
- Review can cover both E2E and unit tests simultaneously
- When no scope provided, uses git changes to determine what to review
