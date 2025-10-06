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

### [2025-10-06 14:30] Improve close level dialog message
- **Priority:** 3
- **Suggested chapter:** Minor enhancements
- **Notes:** Dialog should clearly state: "Are you sure you want to close 'New Level 3'? Any unsaved changes will be lost." (emphasize data loss, no undo possible)

### [2025-10-06 15:45] Make selection outline more visible on blue backgrounds
- **Priority:** 3
- **Suggested chapter:** Chapter 11 - Drawing Tools (visual feedback)
- **Notes:** Selection outline around tiles not visible when background is blue (default). Need higher contrast selection indicator - consider white outline with dark border, or adaptive color based on background

### [2025-10-06 15:46] Move Select All to toolbar with icon
- **Priority:** 3
- **Suggested chapter:** Chapter 11 - Drawing Tools
- **Notes:** Move "Select All" from Edit menu to toolbar near other selection tools (Select, Multi-select). Add icon for the button. No discussion needed - user requirement.

### [2025-10-06 15:47] Move Copy/Paste buttons to toolbar
- **Priority:** 3
- **Suggested chapter:** Chapter 11 - Drawing Tools
- **Notes:** Move Copy and Paste buttons from Edit menu to toolbar as new group near selection tools. Add icons for both buttons.

### [2025-10-06 15:48] Advanced selection keyboard shortcuts with modifier keys
- **Priority:** 3
- **Suggested chapter:** New Chapter 20 - Advanced Selection Modifiers (complex multi-task feature)
- **Notes:** Research-heavy feature requiring industry pattern analysis (Photoshop, Figma, Tiled, etc.)
- **Requirements:**
  - **Shift + Drag:** Engage multi-select tool temporarily (box selection), non-additive (replaces current selection)
  - **Ctrl + Click:** Add individual tiles to selection (additive selection)
  - **Special case:** When Move tool is active, Shift/Ctrl should temporarily enable selection without disengaging Move tool
    - Move tool becomes inactive while modifier held
    - Move tool re-activates when modifier released
    - Need clear visual feedback for this temporary state
  - **Visual feedback:** Research and design clear indicators for:
    - Additive selection mode (Ctrl held)
    - Temporary tool override (Shift/Ctrl while Move active)
    - Current selection state
  - **Research needed:**
    - Industry standard modifier key patterns (Photoshop, Figma, Illustrator, Tiled)
    - Best practices for temporary tool switching
    - Visual feedback patterns for modifier states
  - **May require:** Rethinking current selection tool buttons and interaction model
- **Implementation complexity:** High - requires state machine refactoring, visual feedback system, extensive testing

### [2025-10-06 15:49] Rethink Properties Panel for multi-select
- **Priority:** 4
- **Suggested chapter:** UI/UX improvements
- **Notes:** Current Properties Panel doesn't work well when multiple objects are selected. Needs redesign to handle:
  - Show common properties across selected objects
  - Indicate when properties differ across selection
  - Batch editing capabilities
  - Clear indication of how many objects selected

### [2025-10-06 15:50] Remove duplicate level button
- **Priority:** 3
- **Suggested chapter:** UI cleanup
- **Notes:** Delete "Duplicate Level" button - redundant with Ctrl+A, Ctrl+C workflow (especially after paste is reworked in Chapter 18)
