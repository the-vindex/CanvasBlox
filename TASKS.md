# Visual Enhancement Roadmap - Roblox Level Designer

**Status:** In Progress
**Current Chapter:** Chapter 11 - Drawing Tools Implementation (alternative: Chapter 13 - E2E Test Simplification)
**Last Updated:** 2025-10-05

---

## Implementation Strategy

Work through chapters sequentially. After implementing each chapter:
1. User reviews the changes
2. User provides approval or feedback
3. Move to next chapter only after approval
4. Commit changes after each approved chapter

---



---

## Chapter 11: Drawing Tools Implementation

**Status:** 🔄 In Progress (4/11 tasks complete, 7 remaining)
**Files:** `client/src/hooks/useCanvas.ts`, `client/src/pages/LevelEditor.tsx`, `client/src/hooks/useLevelEditor.ts`
**Priority:** High

### Completed Tasks:
✅ **11.3** Selection tool - Click to select objects, shows properties
✅ **11.4** Move tool - Drag selected objects with ghost preview
✅ **11.8** Clear brush on tool change - Mutual exclusion between tools/tiles
✅ **11.X** Multi-select tool - Drag box selection (bonus feature)

### Remaining Tasks:

#### 11.1 Implement line drawing tool
- **Location:** `client/src/hooks/useCanvas.ts` - mouse event handlers
- **Current:** Line tool button exists in toolbar ('l' key) but does nothing when activated
- **Implementation:**
  - On mousedown: Record start position
  - On mousemove: Show preview line from start to current position
  - On mouseup: Place tiles along the line path using Bresenham's line algorithm
  - Clear preview and return to normal mode
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` (add line drawing logic)
  - `client/src/utils/canvasRenderer.ts` (add drawPreviewLine method)
  - `client/src/hooks/useLevelEditor.ts` (may need batch tile placement method)

#### 11.2 Implement rectangle drawing tool
- **Location:** `client/src/hooks/useCanvas.ts` - mouse event handlers
- **Current:** Rectangle tool button exists in toolbar ('r' key) but does nothing when activated
- **Implementation:**
  - On mousedown: Record start corner position
  - On mousemove: Show preview rectangle from start to current position
  - On mouseup: Place tiles to form rectangle outline or filled area (user preference?)
  - Clear preview and return to normal mode
- **Options to consider:**
  - Outline only vs filled rectangle
  - Could add modifier key (Shift) to toggle fill mode
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` (add rectangle drawing logic)
  - `client/src/utils/canvasRenderer.ts` (add drawPreviewRectangle method)
  - `client/src/hooks/useLevelEditor.ts` (may need batch tile placement method)

#### 11.5 Implement linking tool for interactable objects
- **Location:** `client/src/hooks/useCanvas.ts` - mouse event handlers
- **Current:** Link tool button exists in toolbar ('k' key) but does nothing when activated
- **Purpose:** Link interactable objects (buttons → doors, levers → doors, etc.) to create cause-effect relationships
- **Implementation:**
  - Click first object (source): Mark as link source, highlight visually
  - Click second object (target): Create link from source to target
  - Store link in source object's `properties.linkedObjects` array
  - Store reverse link in target object's `properties.linkedFrom` array (for bidirectional tracking)
  - Draw visual connection line between linked objects (already exists in canvasRenderer.ts:829-855)
  - Exit link mode or allow chaining multiple links
- **Validation needed:**
  - Only interactable objects can be linked (not tiles or spawn points)
  - Prevent linking object to itself
  - Prevent duplicate links
  - Visual feedback for valid/invalid link targets
- **UI considerations:**
  - Show which object is currently the link source (highlight or indicator)
  - Escape or right-click to cancel linking
  - Visual preview line while selecting target
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` (add link mode logic)
  - `client/src/hooks/useLevelEditor.ts` (add linkObjects function)
  - `client/src/types/level.ts` (ObjectProperties already has linkedObjects/linkedFrom)
- **Note:** Tool button already exists, visual line rendering exists, just needs interaction logic

#### 11.6 Implement unlinking tool for removing object links
- **Location:** `client/src/hooks/useLevelEditor.ts`, `client/src/components/level-editor/PropertiesPanel.tsx`
- **Current:** No UI or functionality exists to remove links between objects
- **Purpose:** Allow users to remove unwanted links between interactable objects
- **Implementation options:**
  1. **Properties Panel approach:** Show list of linked objects in properties panel, add "X" button to remove each link
  2. **Selection-based:** Select linked object → keyboard shortcut (e.g., 'U' for unlink) → click link to remove
  3. **Context menu:** Right-click on object → "Manage Links" → show dialog with checkboxes for each link
- **Recommended approach:** Properties Panel (option 1) - most discoverable
- **Implementation:**
  - In PropertiesPanel, display `properties.linkedObjects` array as clickable list
  - Add delete/remove button next to each linked object ID
  - On click: Remove object ID from `properties.linkedObjects` array
  - Also remove reverse link from target object's `properties.linkedFrom` array
  - Update level state and trigger re-render
  - Add to undo/redo history
- **Files to modify:**
  - `client/src/components/level-editor/PropertiesPanel.tsx` (add links UI section)
  - `client/src/hooks/useLevelEditor.ts` (add unlinkObjects function)
- **Note:** Currently there's no way to remove links once created - important for fixing mistakes

#### 11.7 Decide on rotation tool approach or remove it
- **Location:** `client/src/pages/LevelEditor.tsx` - Rotate left/right buttons in toolbar
- **Current:** Rotate left/right buttons exist in header but unclear how rotation should work
- **Decision needed:**
  1. **Keep rotation - apply to selected objects:** When object(s) selected, rotate buttons rotate them (90° increments)
  2. **Keep rotation - apply to tile being placed:** When placing tile, rotate buttons rotate preview before placement
  3. **Remove rotation:** If rotation doesn't make sense for gameplay, remove buttons entirely
- **Considerations:**
  - Tiles have `rotation` property (0, 90, 180, 270) in level.ts:12
  - Objects have `rotation` property in level.ts:40
  - Rotation rendering already implemented in canvasRenderer.ts (tiles: 206-212, objects: 570-582)
  - Current rotate left/right handlers exist in LevelEditor.tsx
- **If keeping rotation:**
  - Make buttons context-aware (only enabled when object selected or tile type selected)
  - Add visual feedback showing rotation angle
  - Consider keyboard shortcuts ([ and ] keys for rotate left/right)
  - Update PropertiesPanel to show/edit rotation value
- **If removing rotation:**
  - Remove rotate buttons from toolbar
  - Remove handleRotateLeft/handleRotateRight from LevelEditor.tsx
  - Remove rotation keyboard handlers (if any)
  - Keep rotation property in data model for future use
- **Files to modify:**
  - `client/src/pages/LevelEditor.tsx` (rotate button handlers)
  - `client/src/hooks/useLevelEditor.ts` (add rotateObjects function if keeping)
  - `client/src/components/level-editor/PropertiesPanel.tsx` (rotation UI if keeping)
- **Note:** User requested decision on rotation tool - needs clarification on intended use case

#### 11.9 Implement button numbering system (coordinate with linking tool)
- **Location:** `client/src/utils/canvasRenderer.ts` - drawObject method (button rendering), `client/src/types/level.ts`
- **Current:** Buttons are drawn with generic appearance, no visual identification system
- **Purpose:** Add visual numbering to buttons on canvas so users can identify which button links to which door
- **Implementation:**
  - Add optional `buttonNumber` or `label` property to InteractableObject type
  - Auto-assign numbers when buttons are created (e.g., Button 1, Button 2, etc.)
  - Render number/label on button visual in canvasRenderer.ts drawButton method
  - Display as white text or small badge on the button graphic
- **Integration with linking:**
  - When linking button to door, could optionally label door with same number
  - Show button number in Properties Panel when selected
  - Show linked button numbers on linked doors
- **Files to modify:**
  - `client/src/types/level.ts` (add label/number property to InteractableObject)
  - `client/src/utils/canvasRenderer.ts` (drawButton method - add text rendering)
  - `client/src/hooks/useLevelEditor.ts` (addObject - auto-assign button numbers)
  - `client/src/components/level-editor/PropertiesPanel.tsx` (display button number/label)
- **Note:** Should be implemented together with Task 11.5 (linking tool) for coherent UX

#### 11.10 Implement tile overlap logic - newest tile wins
- **Location:** `client/src/hooks/useLevelEditor.ts` - addTile function, `client/src/utils/levelSerializer.ts` - deserialize/import functions
- **Current:** Tiles can be placed on top of each other without removing old tiles, creating overlapping tiles at same position
- **Change:** When a new tile is placed at a position where another tile exists, remove the old tile(s) at that position
- **Exception:** Button placed on top of door should NOT delete the door (special case for puzzle mechanics)
- **Implementation:**
  - In `addTile` function: Before adding new tile, check for existing tiles at same position
  - Remove existing tiles at that position (filter out tiles with matching x,y coordinates)
  - Exception: If new tile is 'button' type and existing tile is 'door' type, keep both
  - Apply same logic when importing JSON levels (`deserialize` function)
  - Apply same logic when loading from localStorage (on initial load)
- **Files to modify:**
  - `client/src/hooks/useLevelEditor.ts` (addTile function - add overlap detection and removal)
  - `client/src/utils/levelSerializer.ts` (deserialize - clean up overlapping tiles on import)
  - `client/src/hooks/useLevelEditor.ts` (useEffect for localStorage load - clean up overlaps)
- **Note:** This prevents unintended tile stacking and keeps the level clean. Button-on-door exception supports puzzle design patterns.

**Dependencies:** None - core selection/move tools already complete
**Notes:** 7 tasks remaining. Priority: Tile overlap (11.10), Link/Unlink tools (11.5-11.6), Drawing tools (11.1-11.2), Button numbering (11.9), Rotation decision (11.7)

---

## Chapter 13: E2E Test Simplification & Refactoring

**Status:** 🔄 In Progress (Phase 1 complete)
**Files:** `e2e/level-editor.spec.ts` (2,974 lines, 122 tests)
**Priority:** Medium

**Current State:**
- 126 E2E tests with significant duplication
- ~300 lines of redundant test code identified
- Repetitive setup patterns in every test
- Missing test coverage for error handling and edge cases

**Goals:**
- Reduce test count by 12 tests (-9.5%)
- Eliminate ~300-500 lines of redundant code (-10-16%)
- Improve test maintainability and clarity
- Add missing coverage for error scenarios

### Phase 1: Quick Wins (High Priority) ✅ COMPLETE

#### 13.1 Delete redundant zoom status bar test ✅
- **Status:** ✅ COMPLETE
- **Location:** `e2e/level-editor.spec.ts:757-787` (deleted)
- **Test Name:** "Step 9: zoom controls should update status bar zoom display"
- **Result:** -1 test, -30 lines

#### 13.2 Merge Step 6 and Step 9 zoom tests ✅
- **Status:** ✅ COMPLETE
- **Location:** Lines 348-406 (Step 6 - deleted), Lines 658-721 (Step 9 - kept)
- **Deleted tests:**
  - "Step 6: should increase zoom when zoom in button clicked"
  - "Step 6: should decrease zoom when zoom out button clicked"
  - "Step 6: should reset zoom when reset button clicked"
- **Kept tests (more comprehensive):**
  - "Step 9: should zoom in at viewport center when zoom in button clicked"
  - "Step 9: should zoom out at viewport center when zoom out button clicked"
  - "Step 9: should reset zoom to 100% when reset button clicked"
- **Result:** -3 tests, -62 lines

**Phase 1 Total:** -4 tests, -92 lines, improved pass rate from 88.1% to 90.2%

### Phase 2: Consolidate Interaction Tests (Medium Priority) - 2/4 Complete

#### 13.3 Merge undo keyboard and button tests ✅ COMPLETE
- **Status:** ✅ COMPLETE
- **Location:** Line 1333 (consolidated test - now passing)
- **What was done:**
  - Consolidated two separate undo tests into one test that checks both Ctrl+Z and button
  - Deleted old "should undo by clicking undo button" test
  - Fixed root cause: History initialization bug
- **Root cause discovered:**
  - History was starting empty (`historyIndex = -1`)
  - First action created `history[0]`, set `historyIndex = 0`
  - Undo logic required `historyIndex > 0` to work, but with only one entry, this was FALSE
  - **Fix:** Initialize history with initial state on load (`history[0] = initial state`, `historyIndex = 0`)
  - Now first action creates `history[1]`, sets `historyIndex = 1`, and undo works (goes back to `history[0]`)
- **Changes made:**
  - Added initial history entry in `useLevelEditor.ts` when level first loads
  - Updated undo button test to expect disabled state initially
  - Test now passes without `.skip`
- **Files modified:**
  - `client/src/hooks/useLevelEditor.ts` - Added history initialization
  - `e2e/level-editor.spec.ts` - Consolidated test (line 1333), updated disabled button test (line 1518)
  - `client/src/hooks/useLevelEditor.test.ts` - Updated unit test expectations
- **Impact:** -1 test, consolidated test passing, undo/redo now works correctly

#### 13.4 Merge redo keyboard shortcuts and button tests ✅ COMPLETE
- **Status:** ✅ COMPLETE
- **Location:** Line 1375 (consolidated test)
- **What was done:**
  - Consolidated 3 separate redo tests into 1 comprehensive test
  - Tests all redo methods: Ctrl+Y, Ctrl+Shift+Z, and button click
  - Simplified structure: place once, undo once, test all methods with resets
  - Added comment explaining all methods call same redo function
- **Files modified:**
  - `e2e/level-editor.spec.ts` - Consolidated test at line 1375
- **Impact:** -2 tests, -60 lines (better than expected -90 due to refactoring)

**Phase 2 Progress (2/4 complete):** -3 tests, -91 lines

#### 13.5 Merge copy keyboard and button tests
- **Location:** Lines 1776-1807 (Ctrl+C) and Lines 1856-1879 (Button)
- **Current:** 2 separate tests for same copy functionality
- **Consolidated test:**
  ```typescript
  test('should copy with Ctrl+C and button', async ({ page }) => {
      // Place and select object
      await placeTile(page, 'tile-platform-grass', 200, 200);
      await page.getByTestId('button-tool-select').click();
      await clickCanvas(page, 200, 200);

      // Test keyboard shortcut
      await page.keyboard.press('Control+c');
      await expect(page.getByText(/Copied 1 items?/)).toBeVisible();

      // Clear clipboard by pasting and deleting
      await page.keyboard.press('Control+v');
      await page.keyboard.press('Delete');

      // Test button
      await clickCanvas(page, 200, 200); // Re-select
      await page.getByTestId('button-copy').click();
      await expect(page.getByText(/Copied 1 items?/)).toBeVisible();
  });
  ```
- **Files to modify:** `e2e/level-editor.spec.ts`
- **Impact:** -1 test, -30 lines

#### 13.6 Merge paste keyboard and button tests
- **Location:** Lines 1809-1854 (Ctrl+V) and Lines 1882-1919 (Button)
- **Current:** 2 separate tests for same paste functionality
- **Consolidated test:**
  ```typescript
  test('should paste with Ctrl+V and button', async ({ page }) => {
      // Copy an object first
      await placeTile(page, 'tile-platform-grass', 200, 200);
      await page.getByTestId('button-tool-select').click();
      await clickCanvas(page, 200, 200);
      await page.keyboard.press('Control+c');

      // Test keyboard shortcut
      await page.keyboard.press('Control+v');
      await expect(page.getByText(/Pasted 1 items?/)).toBeVisible();
      const afterKeyboardPaste = await getObjectCount(page);

      // Test button (clipboard still has the object)
      await page.getByTestId('button-paste').click();
      await expect(page.getByText(/Pasted 1 items?/)).toBeVisible();
      const afterButtonPaste = await getObjectCount(page);

      expect(afterButtonPaste).toBe(afterKeyboardPaste + 1);
  });
  ```
- **Files to modify:** `e2e/level-editor.spec.ts`
- **Impact:** -1 test, -30 lines

### Phase 3: Extract Helper Functions (Medium Priority)

#### 13.7 Create E2E test helper utilities file
- **Location:** Create new file `e2e/helpers.ts`
- **Purpose:** Reduce repetitive boilerplate code across all 126 tests
- **Implementation:**
  ```typescript
  // e2e/helpers.ts
  import type { Page } from '@playwright/test';

  /**
   * Click on canvas at specific coordinates relative to canvas origin
   */
  export async function clickCanvas(page: Page, x: number, y: number) {
      const canvas = page.getByTestId('level-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');
      await page.mouse.click(box.x + x, box.y + y);
  }

  /**
   * Place a tile at specific canvas coordinates
   */
  export async function placeTile(page: Page, tileTestId: string, x: number, y: number) {
      await page.getByTestId(tileTestId).click();
      await clickCanvas(page, x, y);
      await page.waitForTimeout(100); // Wait for render
  }

  /**
   * Get current zoom value from toolbar or status bar
   */
  export async function getZoomValue(page: Page, source: 'toolbar' | 'statusbar' = 'toolbar'): Promise<number> {
      const testId = source === 'toolbar' ? 'zoom-level' : 'statusbar-zoom-display';
      const text = await page.getByTestId(testId).textContent();
      return parseInt(text?.replace('%', '') || '100', 10);
  }

  /**
   * Get total object count from status bar
   */
  export async function getObjectCount(page: Page): Promise<number> {
      const statusText = await page.getByTestId('selection-count').textContent();
      const match = statusText?.match(/(\d+) object/);
      return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Select a tool by test ID
   */
  export async function selectTool(page: Page, tool: 'select' | 'multiselect' | 'move' | 'line' | 'rectangle' | 'link') {
      await page.getByTestId(`button-tool-${tool}`).click();
  }

  /**
   * Select and place an object (tile, interactable, or spawn point)
   */
  export async function placeObject(page: Page, objectType: string, x: number, y: number) {
      await page.getByText(objectType, { exact: true }).click();
      await clickCanvas(page, x, y);
      await page.waitForTimeout(100);
  }

  /**
   * Get canvas bounding box
   */
  export async function getCanvasBounds(page: Page) {
      const canvas = page.getByTestId('level-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');
      return box;
  }
  ```
- **Files to create:** `e2e/helpers.ts`
- **Files to modify:** All tests in `e2e/level-editor.spec.ts` (add import and use helpers)
- **Impact:** -200 lines across all tests

#### 13.8 Refactor existing tests to use helper functions
- **Location:** `e2e/level-editor.spec.ts` (all 126 tests)
- **Current:** Repetitive patterns in every test:
  ```typescript
  // BEFORE (repeated ~100 times):
  const canvas = page.getByTestId('level-canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');
  await page.mouse.click(box.x + 200, box.y + 200);
  ```
- **After refactoring:**
  ```typescript
  // AFTER (using helpers):
  import { clickCanvas, placeTile, getZoomValue } from './helpers';

  await clickCanvas(page, 200, 200);
  ```
- **Action:** Replace repetitive patterns with helper function calls
- **Files to modify:** `e2e/level-editor.spec.ts`
- **Impact:** -200 lines through code reuse

### Phase 4: Add Missing Coverage (Low Priority)

#### 13.9 Add error handling and edge case tests
- **Location:** `e2e/level-editor.spec.ts` (new tests to add)
- **Missing Coverage:**
  1. **Network Errors:**
     - Import JSON with network failure
     - Corrupt localStorage recovery
     - Invalid tile data handling
  2. **Edge Cases:**
     - Copy/paste with 0 objects selected
     - Zoom during active drag operation
     - Pan beyond canvas boundaries
     - Undo/redo across level switches
  3. **Keyboard Shortcuts:**
     - Delete key (only animation tested currently)
     - Ctrl+A (select all) - not implemented or tested
     - Arrow keys for object movement
  4. **Cross-Level Operations:**
     - Copy from one level, paste to another
     - Undo/redo state preservation across level switches
  5. **Performance:**
     - Large canvas with 1000+ objects
     - Rapid tool switching
     - Memory leaks on level close
- **Implementation:** Add 8-12 new targeted tests
- **Files to modify:** `e2e/level-editor.spec.ts`
- **Impact:** +12 tests, +300 lines (but filling critical gaps)

**Dependencies:** Phase 3 (helpers) should be completed before Phase 4 to avoid more boilerplate
**Notes:** Focus on Phase 1 & 2 for immediate maintainability gains. Phase 3 & 4 are optional improvements.

---

## Chapter 12: Documentation & Project Organization

**Status:** ⏸️ Not Started
**Files:** `docs/ARCHITECTURE.md`, `CLAUDE.md`, `docs/DESIGN_SYSTEM.md`, various `.md` files
**Priority:** Low

### Tasks:

#### 12.1 Reshape and consolidate project documentation
- **Location:** `docs/` directory and root
- **Current:** Multiple documentation files with overlapping content:
  - `docs/ARCHITECTURE.md` - System architecture and technical design
  - `CLAUDE.md` - Development guidelines for Claude Code
  - `docs/DESIGN_SYSTEM.md` - Design system and visual decisions
  - Various other docs in `docs/` folder
- **Goal:** Organize into coherent, well-structured documentation
- **Proposed structure:**
  - `README.md` - Project overview, quick start, high-level architecture
  - `docs/ARCHITECTURE.md` - Technical architecture, data flow, key patterns (✅ exists)
  - `docs/DESIGN_SYSTEM.md` - Visual design system (✅ exists)
  - `DEVELOPMENT.md` - Development workflow, commands, conventions
  - `CLAUDE.md` - Keep for Claude Code specific instructions (✅ exists)
- **Tasks:**
  - Audit all existing .md files for content overlap
  - Extract duplicate/conflicting information
  - Reorganize into logical sections
  - Ensure single source of truth for each topic
  - Update cross-references between docs
- **Files to review:**
  - `docs/ARCHITECTURE.md`, `CLAUDE.md`, `docs/DESIGN_SYSTEM.md`
  - All .md files in `docs/` directory
- **Note:** User requested - improve documentation structure and clarity

**Dependencies:** None
**Notes:** Low priority - doesn't affect functionality, but improves developer experience

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
| 11. Drawing Tools | 🔄 In Progress | ❌ | 4/11 complete - Selection/move done, link/draw tools remain |
| 13. E2E Test Simplification | ⏸️ Not Started | ❌ | Reduce duplication, extract helpers, improve coverage |
| 12. Documentation | ⏸️ Not Started | ❌ | Consolidate and organize project documentation |

**Legend:**
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Completed
- ✓ Approved

---

## Next Steps

**Current:** Chapter 11 - Drawing Tools Implementation (4/11 complete, 7 remaining)

**✅ Completed (4):**
- ✅ Selection tool (single select)
- ✅ Move tool (ghost preview)
- ✅ Multi-select tool (drag box)
- ✅ Clear brush on tool change

**❌ Chapter 11 Remaining (Priority Order):**
1. 🔧 **11.10** Tile overlap logic - newest tile wins (NEW - HIGH PRIORITY)
2. 🔗 **11.5** Linking tool for interactable objects
3. ✂️ **11.6** Unlinking tool (Properties Panel)
4. 📏 **11.1** Line drawing tool
5. 📐 **11.2** Rectangle drawing tool
6. 🔢 **11.9** Button numbering system
7. 🔄 **11.7** Rotation tool - decision needed

**Alternative Focus:** Chapter 13 - E2E Test Simplification (medium priority)
- 🧹 Delete 4 redundant zoom tests (-150 lines)
- 🔀 Merge 8 duplicate undo/redo/copy/paste tests (-165 lines)
- 🛠️ Extract helper functions (-200 lines)
- ✅ Add missing error/edge case coverage (+12 tests)

**Future:** Chapter 12 - Documentation (low priority)

---

## Notes & Decisions

_(Add notes here as implementation progresses)_

