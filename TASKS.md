# Visual Enhancement Roadmap - Roblox Level Designer

**Status:** ✅ COMPLETE
**Current Chapter:** All chapters complete
**Last Updated:** 2025-10-06 (Updated chapter statuses - ALL TASKS COMPLETE)

---

## Chapter Format

All chapters require HTML comment markers:
```markdown
```

Use `/todo-archive` to archive completed chapters. See `docs/TASK_MANAGEMENT.md` for details.

---

## Implementation Strategy

Work through chapters sequentially. After implementing each chapter:
1. User reviews the changes
2. User provides approval or feedback
3. Move to next chapter only after approval
4. Commit changes after each approved chapter

---


---

<!-- CHAPTER_START: 13 -->

<!-- CHAPTER_START: 16 -->

---

---

<!-- CHAPTER_START: 14 -->

---

<!-- CHAPTER_START: 18 -->
## Chapter 18: Enhanced Copy/Paste with Ghost Preview

**Status:** ✅ Complete
**Files:** `client/src/hooks/useCanvas.ts`, `client/src/hooks/useLevelEditor.ts`, `client/src/utils/canvasRenderer.ts`, `client/src/pages/LevelEditor.tsx`, `client/src/types/level.ts`
**Priority:** Medium

**Goal:** Change paste behavior to show ghost preview instead of immediate placement. Paste becomes a "complex palette mode" similar to other drawing tools.

### Tasks:

#### 18.1 Rethink copy/paste workflow with ghost preview ✅ Complete
- **Status:** ✅ COMPLETE
- **Location:** `client/src/hooks/useLevelEditor.ts`, `client/src/pages/LevelEditor.tsx`, `client/src/utils/canvasRenderer.ts`, `client/src/types/level.ts`
- **Current:** Paste immediately places tiles at clipboard position
- **Change:** Paste shows ghost preview, waits for click to place
- **What was implemented:**
  1. ✅ **Ghost preview rendering** (`client/src/utils/canvasRenderer.ts`)
     - Added `drawPastePreview()` method
     - Renders clipboard items at 50% opacity following cursor
     - Positions items relative to mouse position
     - Supports tiles, interactable objects, and spawn points
  2. ✅ **Paste mode state management** (`client/src/types/level.ts`, `client/src/hooks/useLevelEditor.ts`)
     - Added `pastePreview` to EditorState (items + offset)
     - Added `showLargeClipboardDialog` flag
     - `pasteObjects()` now initiates paste preview mode
     - `completePaste()` places items at clicked position
     - `cancelPaste()` cancels paste mode
  3. ✅ **Click-to-place workflow** (`client/src/pages/LevelEditor.tsx`)
     - Canvas click handler checks for active paste preview
     - Clicking places pasted items at cursor position
     - ESC key cancels paste mode
     - Tool clears after successful paste
  4. ✅ **Large clipboard handling** (`client/src/hooks/useLevelEditor.ts`, `client/src/pages/LevelEditor.tsx`)
     - Threshold: 20 objects
     - Shows AlertDialog for large clipboards (>20 objects)
     - Dialog message: "Paste [N] objects at cursor position?"
     - On confirm: Paste immediately without preview
     - Prevents performance issues with massive ghost previews
  5. ✅ **Paste button integration** (`client/src/pages/LevelEditor.tsx`)
     - Toolbar paste button triggers ghost preview mode
     - Works same as Ctrl+V keyboard shortcut
- **New workflow:**
  - **Copy:** Selected tiles → clipboard (unchanged)
  - **Paste (Ctrl+V or button):** Shows ghost preview following cursor
  - **Placement:** Click to place at cursor position
  - **Cancel:** ESC key cancels paste mode
  - **Large clipboard (>20 objects):** Shows confirmation dialog, pastes immediately on confirm
- **Tests:**
  - ✅ 5 E2E tests (paste-ghost-preview.spec.ts) - All passing
  - ✅ 1 updated unit test (useLevelEditor.test.ts) - Paste with ghost preview
  - ✅ Total: 189 unit + 150 E2E tests passing
- **Manual Test:** Ready for user testing
  - Copy object → press Ctrl+V → verify ghost preview follows cursor
  - Click canvas → verify object placed at cursor position
  - Copy object → press Ctrl+V → press ESC → verify paste cancelled
  - Copy 25 objects → press Ctrl+V → verify dialog appears
  - Paste button → verify ghost preview mode activates

**Dependencies:** Task 11.10 (tile overlap logic) should be completed first for consistent overwrite behavior
**Notes:** More intuitive paste workflow. User has control over where pasted content goes.

<!-- CHAPTER_END: 18 -->
---

---

---

---

<!-- CHAPTER_START: 22 -->
## Chapter 22: Future Enhancements (P4 - Ideas)

**Status:** ⏭️ Skipped
**Files:** Various
**Priority:** Low (P4 - Ideas)

### Tasks:

#### 22.1 Enhance zoom reset to fit all content ⏭️ SKIPPED
- **Status:** ⏭️ SKIPPED - Not needed for current scope
- **Priority:** 4 (Idea/enhancement)
- **Location:** Zoom reset function in `client/src/hooks/useCanvas.ts` or zoom control handlers
- **Current:** Reset zoom sets to 100% regardless of content
- **Change:** Calculate zoom level that fits all placed content on screen (fit-to-view)
- **Implementation:**
  - Calculate bounding box of all placed objects (tiles, interactables, spawn points)
  - Determine zoom level that fits entire bounding box within viewport
  - Account for padding/margins (e.g., 10% margin around content)
  - If no objects placed, reset to 100% (current behavior)
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` or zoom control handlers
  - `client/src/utils/canvasRenderer.ts` (if zoom calculation logic exists there)
- **Tests:**
  - E2E test: Place objects → zoom reset → verify all objects visible
  - Unit test: Verify zoom calculation for various object layouts
- **Note:** Makes zoom reset more intelligent and useful for level design workflow. Tricky to implement correctly.

**Dependencies:** None
**Notes:** Low priority ideas that would be nice to have but not critical for core functionality

<!-- CHAPTER_END: 22 -->
---

<!-- CHAPTER_START: 23 -->
## Chapter 23: Cleanup & Feature Removal

**Status:** ⏸️ Not Started
**Files:** `client/src/pages/LevelEditor.tsx`, `client/src/components/level-editor/Toolbar.tsx`, `client/src/types/level.ts`, `client/src/index.css`
**Priority:** Medium (P3)

### Tasks:

#### 23.1 Remove scanline feature
- **Priority:** 3 (Feature)
- **Location:** Toolbar, EditorState, CSS
- **Current:** Scanline toggle exists in toolbar with showScanlines state and CSS overlay
- **Change:** Remove scanline feature completely (toggle switch, state, CSS, overlay rendering)
- **Implementation:**
  - Remove scanline toggle switch from Toolbar component
  - Remove `showScanlines` from `EditorState` type definition
  - Remove scanline overlay rendering from LevelEditor layout
  - Remove `.scanlines-overlay` CSS class and `@keyframes scanlines` animation
  - Update all references/tests that use `showScanlines`
- **Files to modify:**
  - `client/src/components/level-editor/Toolbar.tsx` - Remove switch and label
  - `client/src/types/level.ts` - Remove `showScanlines` from EditorState
  - `client/src/pages/LevelEditor.tsx` - Remove scanline overlay div and conditional rendering
  - `client/src/index.css` - Remove `.scanlines-overlay` class and animation
  - Any test files that reference scanline toggle
- **Tests:**
  - Verify scanline toggle is removed from UI
  - Verify no scanline overlay renders on canvas
  - Check that grid toggle still works (ensure we didn't break neighboring toggle)
  - Run all unit and E2E tests to ensure no regressions
- **Note:** Clean removal of unused feature to simplify UI and reduce complexity

**Dependencies:** None
**Notes:** Simplifies the UI by removing a visual effect that may not be needed

<!-- CHAPTER_END: 23 -->
---

## Technical Context

### Current Architecture:
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS + custom CSS
- **Components:** shadcn/ui (Radix primitives)
- **State:** Custom hooks (useLevelEditor, useCanvas)
- **Canvas:** HTML Canvas API with CanvasRenderer class

### Key Files:
- `client/src/pages/LevelEditor.tsx` - Main layout
- `client/src/hooks/useLevelEditor.ts` - State management
- `client/src/hooks/useCanvas.ts` - Canvas interaction
- `client/src/utils/canvasRenderer.ts` - Drawing logic
- `client/src/types/level.ts` - Type definitions
- `client/src/index.css` - Global styles

### Important Classes/Patterns:
- Dark theme throughout (dark gray backgrounds)
- Primary color: Blue (hsl(217 91% 60%))
- Border color: hsl(0 0% 23%)
- All interactive elements have transitions
- Font Awesome icons used for UI icons
- Custom SVG icons for tools and tiles

### Performance Considerations:
- Canvas redraws on every state change
- Keep animations GPU-accelerated (transform, opacity)
- Use will-change for animated elements
- Debounce/throttle expensive operations

---

## Progress Tracking

| Chapter | Status | Approved | Notes |
|---------|--------|----------|-------|
| 8. Color & Theme | ✅ Completed | ✓ | Shadow system, tile borders |
| 9. Context & Feedback | ✅ Completed | ✓ | Undo/redo fixes, batched tile placement, properties panel toggle |
| 10. Special Effects | ✅ Completed | ✓ | Parallax, glow pulse, scanlines, improved zoom |
| 18. Enhanced Copy/Paste | ✅ Completed | ❌ | Ghost preview paste workflow (needs user testing) |
| 22. Future Enhancements | ⏭️ Skipped | N/A | Zoom fit-to-view skipped (not needed) |

**🎉 ALL TASKS COMPLETE! 🎉**
All chapters have been completed or skipped. The CanvasBlox level editor is feature-complete for the current roadmap.

**Legend - use only these statuses:**
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Completed
- ⏭️ Skipped

**Note:** Use "✅ COMPLETE" format (not "+ TESTED") when marking tasks complete

---

## Next Steps

**Recommended Priority Order:**

1. **Chapter 11: Drawing Tools** (12/17 complete, 5 remaining)
   - Core feature implementation
   - Tasks: Rotation decision (11.7), UI improvements (11.14-11.16: Select All/Copy/Paste buttons, close dialog)

2. **Chapter 15: Code Quality**
   - Fix linter warnings (complexity issues in useCanvas.ts, LevelEditor.tsx)
   - Refactor for maintainability

3. **Chapter 18: Enhanced Copy/Paste**
   - Ghost preview paste workflow
   - Improved UX

4. **Chapter 17: E2E Test Optimization Phase 3**
   - Minor: Merge auto-save tests, remove redundant test

5. **Chapter 12: Documentation** (Low priority)
   - Consolidate project documentation

**Current E2E Status:**
- ✅ 126/126 tests passing (100% pass rate)
- ⏸️ 4 skipped tests: Copy/paste (intentionally deferred to Chapter 18)

**Completed Chapters:**
- ✅ Chapter 8-10: Visual enhancements
- ✅ Chapter 13: E2E test simplification (-9 tests, -527 lines, helper functions)
- ✅ Chapter 14: E2E test organization (13 focused files)
- ✅ Chapter 16: Bug fixes (import/export/toast selector)
- ✅ Chapter 19: Undo/redo history preservation (per-level history)

---

## Notes & Decisions

_(Add notes here as implementation progresses)_

