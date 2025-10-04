# TDD Principles

## The Red-Green-Refactor Cycle

### 1. Red - Write a Failing Test
- Write test FIRST, before any implementation code
- Test should fail (red) because feature doesn't exist yet
- Proves the test can actually fail

### 2. Green - Make it Pass
- Write minimal code to make the test pass
- Don't add extra features or "nice-to-haves"
- Test should now pass (green)

### 3. Refactor - Clean Up
- Improve code quality while keeping tests green
- Remove duplication, improve names, simplify logic
- Tests ensure refactoring doesn't break functionality

## Key Rules

### Always Test-First
```
❌ Wrong: Code → Test
✅ Right: Test → Code
```

### Test What You're Building
- Only write tests for features in the current step/requirement
- Don't test existing unrelated functionality
- Don't test future features not yet specified

### Verify Tests Can Fail
- Every test must fail at least once
- If a test passes immediately, it might not be testing anything
- Change code to break test, verify it fails, then fix it

### Adding Features
1. Write test that expects the new feature (fails ❌)
2. Implement feature (test passes ✅)
3. Refactor if needed (test stays green ✅)

### Removing Features
1. Write test that expects feature NOT to exist (fails ❌)
2. Remove feature from code (test passes ✅)
3. Delete the test (it served its purpose)

### Changing Features
1. Modify test to expect new behavior (fails ❌)
2. Change code to match new expectation (test passes ✅)
3. Refactor if needed (test stays green ✅)

## Anti-Patterns to Avoid

### ❌ Testing After Implementation
Writing tests for code that already exists doesn't drive design and misses the point of TDD.

### ❌ Testing Out-of-Scope Features
If Step 3 is "Wire Canvas Component", don't add tests for header UI or other unrelated features.

### ❌ Skipping the Red Phase
Always see the test fail first. If it passes immediately, something is wrong.

### ❌ Keeping Temporary Tests
Tests written to drive removal/changes should be deleted after they serve their purpose.

### ❌ Adding Features Without Tests
Every feature should have a test written first. No exceptions.

## Example: Step 3 Canvas Integration

### ✅ Correct Approach
```typescript
// 1. RED: Write failing test
test('Canvas should use CanvasRenderer', async ({ page }) => {
  const hasRenderedContent = await checkCanvasHasContent(page);
  expect(hasRenderedContent).toBe(true);
});
// Test fails ❌ - Canvas not using renderer yet

// 2. GREEN: Implement feature
// Replace inline canvas with Canvas component that uses CanvasRenderer
// Test passes ✅

// 3. REFACTOR: Clean up code
// Improve Canvas component structure, tests stay green ✅
```

### ❌ Wrong Approach
```typescript
// Implement Canvas component first, then write tests
// Tests pass immediately - didn't drive the implementation
```

## TDD Benefits

1. **Design**: Tests force you to think about API/interface first
2. **Confidence**: Know exactly when you're done (all tests green)
3. **Documentation**: Tests show how code is meant to be used
4. **Regression**: Changes that break features immediately caught
5. **Scope Control**: Only build what's needed to pass tests

## Remember

> "Write the test you wish you had, then make it pass."

The test is a specification. The code is an implementation of that specification.
