# Task Inbox

**Purpose:** Queue for new tasks added while another Claude instance is working on TASKS.md

**Usage:** Use `/todo-inbox` to add tasks here. Use `/merge-inbox` to move tasks into TASKS.md.

---

## How This Works

When one Claude instance is running `/next` (actively working on tasks), it reads and modifies TASKS.md. To avoid conflicts, use this inbox to queue new tasks:

1. **Add tasks:** `/todo-inbox "Task description"`
2. **Merge later:** When the working instance finishes, run `/merge-inbox` to consolidate

---

## Inbox Queue

_(Tasks added via /todo-inbox will appear below)_

### [2025-10-05 14:30] Split e2e tests into multiple files by functionality
- **Added by:** User request
- **Suggested chapter:** New Chapter (Test Organization)
- **Notes:** Split monolithic level-editor.spec.ts (2814 lines) into focused test files organized by feature area. Each file should cover specific functionality with clear behavioral documentation. Must handle Playwright parallel execution properly. All tests passing before and after split - this is purely a refactoring/reorganization task.
- **Proposed structure:**
  - `basic-ui.spec.ts` - Initial load, tile palette, level tabs, properties panel
  - `toolbar.spec.ts` - Toolbar buttons, tool selection, toggles
  - `keyboard-shortcuts.spec.ts` - All keyboard shortcuts (V/M/H/L/R/K/P/Escape)
  - `zoom-pan.spec.ts` - Zoom controls, pan with middle mouse, viewport interactions
  - `tile-placement.spec.ts` - Single click, painting mode, spawn points, interactables
  - `selection.spec.ts` - Select tool, multi-select, move tool, ghost preview
  - `undo-redo.spec.ts` - Undo/redo operations, history display, button states
  - `copy-paste.spec.ts` - Copy/paste operations, clipboard management
  - `import-export.spec.ts` - JSON import/export, PNG export, validation
  - `auto-save.spec.ts` - Auto-save timing, save indicators, unsaved state
  - `visual-effects.spec.ts` - Scanlines, grid toggle, selection feedback, delete animations
  - `parallax-zoom.spec.ts` - Initial zoom calculation, parallax background
  - `menus.spec.ts` - File dropdown, menu actions

### [2025-10-05 14:32] Rethink copy/paste workflow with ghost preview
- **Added by:** User request
- **Suggested chapter:** New Chapter (Enhanced Copy/Paste)
- **Notes:** Change paste behavior to show ghost preview instead of immediate placement:
  - **Copy:** Selected tiles → clipboard (unchanged)
  - **Paste:** Show ghost image of tiles, wait for click to place
  - **Placement:** Clicking places tiles at cursor position
  - **Overwrite:** Pasted tiles overwrite overlapping tiles (connects to queued task)
  - **Cancel:** ESC key or selecting other tool/palette cancels paste mode
  - **Ghost reuse:** Investigate consolidating ghost rendering logic (currently used in move tool, paste will add another use case - opportunity for deduplication)
  - Paste essentially becomes a "complex palette mode" similar to other drawing tools

### [2025-10-05 14:33] Critical bug - ESC doesn't cancel palette tool anymore
- **Added by:** User request
- **Suggested chapter:** Bug Fix (HIGH PRIORITY)
- **Notes:** ESC key should deselect the currently active palette tool, but this functionality is broken. This is a regression that needs immediate attention.
