# Open Questions from Auto-Implementation

This file contains questions, assumptions, and decisions made during automatic implementation.
Review this file after the auto-implementation is complete.

---

## Step 12: Undo/Redo System

**Question:** What is the exact visual design for the undo/redo flash animation?
**Assumption/Decision:** Will use a semi-transparent overlay that fades in/out over 400ms, similar to common UI feedback patterns. Will position it over the canvas area.
**Reasoning:** Standard UX pattern provides clear feedback without being intrusive.

**Question:** Should undo/redo buttons be disabled when at history boundaries?
**Assumption/Decision:** Yes, undo disabled when historyIndex === 0, redo disabled when historyIndex === history.length - 1
**Reasoning:** Prevents confusion and follows standard behavior in most editors.

**Question:** Should keyboard shortcuts work when typing in input fields?
**Assumption/Decision:** No, shortcuts should be blocked when focused on input/textarea elements (already handled in Step 8)
**Reasoning:** Prevents conflicts with normal text editing operations.

**Question:** Should the history display format be "current/total" or show other information?
**Assumption/Decision:** Using "historyIndex + 1 / history.length" format (e.g., "3/10")
**Reasoning:** This matches the plan specification and is more intuitive for users to understand their position in the undo stack.

**Question:** The plan mentions keyboard shortcuts in Step 8 which is already complete. Should I verify they're working or just wire the UI buttons?
**Assumption/Decision:** Will verify keyboard shortcuts are working and wire the UI buttons to call the same undo/redo functions
**Reasoning:** Step 8 is marked complete, so shortcuts should exist. I'll verify they work and ensure consistency between keyboard and UI interactions.

**Question:** E2E tests are failing because "fresh level" still has data from previous tests. Should I fix the tests or the implementation?
**Assumption/Decision:** The issue is that localStorage persists between tests, causing "fresh level" clicks to create a new level that still gets counted as index 1 instead of having a clean slate. The tests need to be more resilient to this state, OR we need to ensure localStorage is cleared before these specific tests.
**Reasoning:** Looking at error context, tests show history as "1/1" and objects count as "12" when expecting "0". The implementation is correct - it's the test isolation that needs fixing. The tests are making assumptions about initial state that aren't guaranteed in E2E environment.

---

