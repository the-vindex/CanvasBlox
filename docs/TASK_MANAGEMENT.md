# Task Management & Development Workflow

**📖 When to read this document:**
- ✅ **When implementing tasks** - Use this as your detailed playbook
- ✅ **During feature development** - Reference testing strategy and quality checklists
- ❌ **When creating/writing tasks** - Task creation doesn't need this level of detail

This document defines the detailed workflow, implementation strategy, and testing approach for the CanvasBlox project. These principles were extracted from FEATURE_RESTORATION_PLAN.md and serve as our complete process rulebook.

---

## Task Status Legend

- ⬜ **Not Started** - Not yet implemented
- 🧪 **Ready for User Testing** - Implementation complete, awaiting manual verification
- ✅ **Complete** - Tested and confirmed working

---

## Chapter Format

### Required Structure

```markdown
<!-- CHAPTER_START: N -->
## Chapter N: Title

**Status:** ✅ Complete | 🔄 In Progress | ⏸️ Not Started
**Files:** Primary files affected
**Priority:** P3 (Feature)
**Goal:** Brief objective

### Tasks:

#### N.1 Task Title
- **Status:** ✅ COMPLETE | 🔄 In Progress | ⏸️ Not Started
- **Priority:** 3
- **Location:** File paths
- **Implementation:** Details
- **Tests:** Test descriptions

**Dependencies:** None
**Notes:** Context

<!-- CHAPTER_END: N -->
```

**Priority System (P1-P4):**
- **P1** - AI config (slash commands, permissions, MCP)
- **P2** - Bugfix
- **P3** - Feature (default)
- **P4** - Idea/enhancement

### Adding Chapters

1. Use next sequential number
2. Add `<!-- CHAPTER_START/END -->` markers
3. Follow structure above
4. Update Progress Tracking table

### Archiving

Use `/todo-archive` to move completed chapters to `docs/archive/TASKS-COMPLETED.md`.

---

## Testing Strategy

### Framework & Tools

**Unit & Integration Testing:**
- **Vitest** - Fast unit test runner (integrates with Vite)
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment

**E2E Testing:**
- **Playwright** - End-to-end browser testing
- **Visual regression** - Screenshot comparison

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom
```

**NPM Scripts:**
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

### Test File Organization

Tests live **next to the code** they test:

```
client/src/
  ├── hooks/
  │   ├── useLevelEditor.ts
  │   └── useLevelEditor.test.ts        # ← Test next to source
  ├── utils/
  │   ├── canvasRenderer.ts
  │   └── canvasRenderer.test.ts        # ← Test next to source
  └── components/
      ├── TilePalette.tsx
      └── TilePalette.test.tsx          # ← Test next to source

e2e/
  └── level-editor.spec.ts              # E2E tests
```

### Test Types

1. **Unit Tests** - Hooks, utilities, pure functions
   - File: `client/src/hooks/useLevelEditor.test.ts`
   - Focus: State management, data transformations, edge cases

2. **Component Tests** - UI components, user interactions
   - File: `client/src/components/TilePalette.test.tsx`
   - Focus: Rendering, props, callbacks, accessibility

3. **Integration Tests** - Multiple components working together
   - File: `client/src/__tests__/integration/keyboardShortcuts.test.tsx`
   - Focus: Workflows, keyboard shortcuts, state coordination

4. **E2E Tests** - Full user workflows in real browser
   - File: `e2e/level-editor.spec.ts`
   - Focus: Complete features, visual regression, cross-browser

### E2E Testing Selector Priority

When writing Playwright tests, follow this selector priority:
1. `getByRole()` - Buttons, headings, interactive elements
2. `getByLabel()` - Form inputs
3. `getByTestId()` - Dynamic content, custom components
4. Avoid CSS/XPath selectors

**Adding test IDs to components:**
- ✅ ADD `data-testid` FOR: Dynamic values (zoom %, coordinates), status displays, custom components
- ❌ DON'T ADD FOR: Buttons with text, headings, labeled inputs
- Naming: Use kebab-case with semantic names: `data-testid="statusbar-zoom-display"`

**Common patterns:**
```typescript
// Dynamic content
const zoom = page.getByTestId('statusbar-zoom-display');
await expect(zoom).toHaveText('100%');

// Buttons (use role, not testid)
await page.getByRole('button', { name: 'Save' }).click();

// Canvas interaction
const canvas = page.getByTestId('level-canvas');
const box = await canvas.boundingBox();
await page.mouse.move(box.x + 100, box.y + 100);
```

For more examples: `docs/E2E_TESTING.md`

---

## TDD Workflow (Test-Driven Development)

### For Each Task/Feature

1. **Write failing test** - Create test file with expected behavior
2. **Implement feature** - Make the test pass
3. **Verify all tests pass** - Run `npm test && npm run test:e2e`
4. **Manual test** - Verify in browser
5. **Commit** - Commit code + tests together

**Example Test (before implementation):**
```typescript
// client/src/hooks/useLevelEditor.test.ts
import { renderHook } from '@testing-library/react';
import { useLevelEditor } from '@/hooks/useLevelEditor';

test('should load levels from localStorage', () => {
  const { result } = renderHook(() => useLevelEditor());
  expect(result.current.levels).toBeDefined();
  expect(result.current.currentLevel).toBeDefined();
});
```

**TDD Reminder:** Always write the test first, watch it fail, then implement the feature to make it pass.

---

## Implementation Strategy

### Incremental Approach

- **Small steps** - Each task should be small, testable, and incremental
- **Clear dependencies** - Track what depends on what, don't skip steps
- **Section-based** - Group related tasks into logical sections
- **One feature at a time** - Focus on completing one thing well before moving on

### Task Structure

Each task should define:

1. **Status** - Current state (⬜/🧪/✅)
2. **Priority** - 1 (AI config), 2 (bugfix), 3 (feature - default), 4 (idea)
3. **Current State** - What exists now
4. **Goal** - What we're building
5. **Dependencies** - Prerequisites (other tasks that must complete first)
6. **Implementation** - Step-by-step approach with code examples
7. **Files to modify** - Specific file paths
8. **Manual Test** - How to verify manually
9. **Automated Test** - What to test and where

### Example Task Template

```markdown
### Task X: Feature Name
**Status**: ⬜ Not Started
**Priority**: 3
**Current State**: Description of current implementation
**Goal**: What this task achieves
**Dependencies**: Task Y (prerequisite)

**Implementation**:
1. Import required components/hooks
2. Implement specific functionality
3. Wire up event handlers
4. Add visual feedback

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`
- `client/src/hooks/useCanvas.ts`

**Manual Test**:
- Action should produce expected result
- Visual feedback should appear
- No console errors

**Automated Test** (write first):
- File: `client/src/hooks/useCanvas.test.ts`
- Test: Specific behavior, edge cases, integration
```

### Dependency Management

- **Track explicit dependencies** - Each task lists prerequisites
- **Complete in order** - Don't skip tasks, dependencies matter
- **Section organization** - Group tasks by logical area:
  - Section 1: Core Integration (Foundation)
  - Section 2: Components Integration
  - Section 3: Functionality Restoration
  - Section 4: Visual Features
  - Section 5: Final Polish

---

## Git Workflow

### Commit Strategy

**After each completed task:**
1. Write automated tests (if applicable)
2. Implement feature to make tests pass
3. Run all tests - `npm test && npm run test:e2e`
4. Run linter - `npm run lint:fix`
5. Manual test features in browser
6. Commit with descriptive message (include test files)

**Example Commit Messages:**
```
Step 1: Integrate useLevelEditor hook with tests
Step 2: Integrate useCanvas hook with tests
Section 1 Complete: Core integration finished
Fix: Redo functionality - history index management
Feature: Group consecutive tile placements for undo/redo
```

**Commit Content:**
- Include both implementation AND test files in same commit
- Ensure all tests pass before committing
- Keep commits focused on single task/feature
- Write clear commit messages describing what changed and why

---

## Quality Assurance

### Before Committing

- [ ] All unit tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Linter passes (`npm run lint:fix`)
- [ ] Type check passes (`npm run check`)
- [ ] Manual testing completed
- [ ] No console errors/warnings
- [ ] Feature works as expected

### Testing Checklist

After completing a section or major feature:

1. **Functionality** - Does it work as designed?
2. **Edge cases** - What about unusual inputs?
3. **Error handling** - What happens when things fail?
4. **Performance** - Is it responsive and smooth?
5. **Accessibility** - Can it be used with keyboard?
6. **Visual feedback** - Is user feedback clear?
7. **Regression** - Did we break existing features?

### Test Coverage Goals

- **Unit tests**: >85% coverage for hooks and utils
- **Component tests**: All interactive components tested
- **Integration tests**: Key workflows covered
- **E2E tests**: Critical user paths tested

---

## Development Principles

### Maintain Core Functionality

- **Preserve working features** - Don't break what already works (e.g., scrollbars)
- **Test after each step** - Verify core functionality remains intact
- **Revert if broken** - If something breaks, revert and analyze what changed
- **Proven patterns** - Stick to patterns that work

### Code Quality

- **Type safety** - Use TypeScript strictly, avoid `any`
- **Clean code** - Clear naming, small functions, single responsibility
- **No dead code** - Remove unused imports, variables, functions
- **Consistent style** - Follow Biome formatter (4-space indentation)

### Performance Considerations

- **Canvas optimization** - Minimize redraws, use RAF for animations
- **GPU acceleration** - Use `transform` and `opacity` for animations
- **Debounce/throttle** - Expensive operations (resize, scroll)
- **will-change** - For frequently animated elements

---

## Task Prioritization

### Priority Levels

1. **Critical** - Core functionality, blocking other work
2. **High** - Important features, user-facing
3. **Medium** - Nice-to-have features, polish
4. **Low** - Optional enhancements, future work

### Dependency-First Approach

Complete tasks in dependency order:
- Core integration before components
- Components before functionality
- Functionality before visual polish
- Foundation before features

---

## Troubleshooting

### When Tests Fail

1. **Read the error** - Understand what's actually failing
2. **Check test validity** - Is the test correct?
3. **Isolate the issue** - Run single test, add console.logs
4. **Fix root cause** - Don't just make test pass
5. **Verify fix** - Run all tests again

### When Features Break

1. **Identify scope** - What broke? When?
2. **Check git history** - What changed recently?
3. **Revert if needed** - Get back to working state
4. **Analyze change** - What caused the break?
5. **Fix properly** - Address root cause
6. **Add test** - Prevent regression

---

## Notes

- **Small steps** - Each step should be small, testable, and incremental
- **Don't skip steps** - Dependencies matter
- **TDD always** - Write automated tests before implementation for rapid feedback and regression prevention
- **Run tests frequently** - `npm test` during development to catch issues early
- **Commit often** - Small, focused commits with clear messages
- **Document decisions** - Add notes to task files for context

---

## See Also

- `docs/TDD_PRINCIPLES.md` - Detailed TDD guidelines
- `docs/E2E_TESTING.md` - Playwright testing patterns
- `docs/ARCHITECTURE.md` - System architecture
- `CLAUDE.md` - Development commands and setup
