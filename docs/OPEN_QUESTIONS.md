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

## Task 18.1: Rethink copy/paste workflow with ghost preview

**Question:** How should large clipboard pastes be handled (e.g., 100+ objects from Ctrl+A, Ctrl+C)?

**Assumption/Decision:**
- Implement ghost preview for normal paste operations
- For large clipboards (>20 objects), show confirmation dialog instead of ghost preview
- Threshold: 20 objects (reasonable for ghost preview performance)
- Dialog: "Paste [N] objects at cursor position?" with Cancel/Paste buttons
- On confirm: Paste immediately at cursor position (no ghost)
- This prevents performance issues and unclear UX from hundreds of ghost objects
- Ghost preview will be rendered similar to move tool (50% opacity)

**Question:** Should paste keep the tool active after placing, or clear to null?

**Assumption/Decision:**
- After successful paste (click to place), clear selectedTool to null
- This matches the behavior of other one-shot tools and prevents accidental multiple pastes
- User can press Ctrl+V again to paste another copy if needed

**Question:** How should paste interact with tile overlap logic (Task 11.10)?

**Assumption/Decision:**
- Pasted tiles should follow same overlap rules as drawing tools
- Use removeOverlappingTiles() when pasting
- Newest tile wins, button-on-door exception applies
- This provides consistent behavior across all placement methods

---

## Task 12.1: Reshape and consolidate project documentation

**Question:** Should we create a README.md file for the project, or is the lack of one intentional?

**Assumption/Decision:** Will create a comprehensive README.md as part of documentation consolidation. This is standard practice for all projects and provides essential onboarding for new developers.

**Question:** How much technical detail should go in README.md vs ARCHITECTURE.md?

**Assumption/Decision:** README.md will be high-level (overview, quick start, basic architecture), while ARCHITECTURE.md will contain deep technical details. This follows industry standard separation of concerns.

**Question:** Should we keep CLAUDE.md separate or merge it into a general DEVELOPMENT.md?

**Assumption/Decision:** Keep CLAUDE.md separate as it contains AI-specific instructions. Create new DEVELOPMENT.md for general development workflow (commands, testing, linting) that applies to all developers.

**Question:** What to do with specialized docs (E2E_TESTING.md, TDD_PRINCIPLES.md, REACT_BEST_PRACTICES.md)?

**Assumption/Decision:** Keep these as standalone reference docs in docs/ folder. They serve specific purposes and are appropriately scoped. Will ensure they're properly linked from README and DEVELOPMENT.md.

---

