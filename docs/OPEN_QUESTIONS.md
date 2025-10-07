# Open Questions from Auto-Implementation

This file contains questions, assumptions, and decisions made during automatic implementation.
Review this file after the auto-implementation is complete.

---

## Task 23.1: Remove scanline feature

**Question:** Should I write a test first to verify scanlines are removed, or just remove the code and update existing tests?

**Assumption/Decision:** Following TDD principles, I'll remove the code directly since the task is to REMOVE a feature (not add one). The existing tests that verify scanline functionality will fail after removal, which is the expected "red" state. Then I'll update those tests to verify the feature is gone (green state). This is a valid TDD approach for feature removal.

**Files affected:**
- `client/src/types/level.ts` - Remove `showScanlines` from EditorState (line 84)
- `client/src/components/level-editor/Toolbar.tsx` - Remove toggle switch and state (lines 103, 263-274)
- `client/src/components/level-editor/Canvas.tsx` - Remove overlay rendering (lines 101-114)
- `client/src/index.css` - Remove `.scanlines-overlay` CSS and `@keyframes scanlines` (lines 350-376)
- `client/src/components/level-editor/Canvas.test.tsx` - Remove/update 3 tests (lines 51-87)
- `e2e/visual-effects.spec.ts` - Remove 2 E2E tests (lines 9-46)
- `client/src/hooks/useLevelEditor.ts` - Remove initial state value
- `client/src/hooks/useLevelEditor.test.ts` - Update tests that check initial state

---

