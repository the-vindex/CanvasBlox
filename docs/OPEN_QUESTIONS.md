# Open Questions from Auto-Implementation

This file contains questions, assumptions, and decisions made during automatic implementation.
Review this file after the auto-implementation is complete.

---

## Task 15.1: Fix all linter issues

**Question:** What refactoring approach should I use for complex functions (handleMouseMove, handleMouseDown, handleMouseUp, handleCanvasClick, getRectanglePositions)?

**Assumption/Decision:**
- Extract helper functions from complex handlers to reduce cognitive complexity
- Use early returns to reduce nesting
- Group related conditional logic into smaller, named functions
- Focus on maintaining exact behavior (no breaking changes)
- Auto-fix simple issues (unused imports, unused variables with underscore prefix, node: protocol)
- Priority order: Auto-fixable issues first, then complex function refactoring

---

## Task 15.2: Remove duplicate level button

**Question:** Should the duplicateLevel function be removed from useLevelEditor.ts as well, or just the UI button?

**Assumption/Decision:**
- Remove only the UI button and the onDuplicateLevel prop
- Keep the duplicateLevel function in useLevelEditor.ts - it may be useful programmatically or for future features
- The rationale from TASKS.md is valid: Ctrl+A + Ctrl+C workflow makes the button redundant
- Update E2E test to remove the duplicate level button visibility test

---

