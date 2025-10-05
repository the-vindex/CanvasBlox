# Visual Enhancement Roadmap - Roblox Level Designer

**Status:** In Progress
**Current Chapter:** Chapter 11 - Drawing Tools Implementation (alternative: Chapter 13 - E2E Test Simplification, **PRIORITY:** Chapter 16 - Bug Fixes)
**Last Updated:** 2025-10-05 (20:15 - Added Chapter 16 Bug Fixes, Chapter 15 Code Quality)

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

**Status:** 🔄 In Progress (Interaction model refactor needed)
**Files:** `client/src/hooks/useCanvas.ts`, `client/src/pages/LevelEditor.tsx`, `client/src/hooks/useLevelEditor.ts`, `client/src/hooks/useSelectionState.ts`, `client/src/components/level-editor/Toolbar.tsx`
**Priority:** High

### Completed Tasks:
✅ **11.0** Pen tool and Drawing Mode Tools interaction pattern - Foundation for drawing tools UX
✅ **11.3** Selection tool - Click to select objects, shows properties
✅ **11.4** Move tool - Drag selected objects with ghost preview
✅ **11.8** Clear brush on tool change - Mutual exclusion between tools/tiles
✅ **11.X** Multi-select tool - Drag box selection (bonus feature)
✅ **11.11** Fix ESC key not cancelling palette tool - Critical bug fixed

---

### 🎨 Drawing Mode Tools Concept

**Industry Pattern** (Photoshop, GIMP, Tiled):
- **Tool first, material second** - Select drawing tool, then choose what to draw with
- Switching materials (tiles) keeps the tool active
- Drawing tools are visually grouped and work together

**Our Drawing Mode Tools:**
```
┌─── Drawing Mode Tools ──────┐  ┌─── Other Tools ─────┐
│ [Pen] [Line] [Rectangle]    │  │ [Select] [Move] ... │
└─────────────────────────────┘  └─────────────────────┘
     ↕ Enable/disable based on tile selection
```

**State Transition Rules:**
```
User Action                    → selectedTool    | selectedTileType
─────────────────────────────────────────────────────────────────
Select tile (no tool active)   → 'pen'           | 'platform-basic'
Select tile (line tool active) → 'line'          | 'platform-basic'  ✅ keeps tool
Select line tool (tile active) → 'line'          | (preserved)        ✅
Select different tile          → 'pen'/'line'    | 'platform-grass'   ✅ keeps tool
Select non-drawing tool        → 'select'        | null               ❌ clears tile
Press ESC                      → null            | null               ❌ clears both
```

**Key Behaviors:**
- Drawing mode tools (`pen`, `line`, `rectangle`) work ONLY when tile selected
- Switching between drawing mode tools preserves tile selection
- Switching tiles preserves active drawing mode tool
- Non-drawing tools (`select`, `move`, `multiselect`, `link`) are mutually exclusive with tiles
- ESC clears both tool and tile

---

### Remaining Tasks:

#### 11.0 Implement Pen tool and refactor interaction model ✅ Complete
- **Status:** ✅ COMPLETE - Commit 4a3ea24 - User tested and approved
- **Location:** `client/src/hooks/useCanvas.ts`, `client/src/hooks/useSelectionState.ts`, `client/src/components/level-editor/Toolbar.tsx`
- **Purpose:** Create explicit "pen" tool and implement Drawing Mode Tools interaction pattern
- **What was implemented:**
  1. ✅ **Added 'pen' tool to EditorState** (`client/src/types/level.ts`)
     - Updated `selectedTool` type to include `'pen'`
     - Auto-selects pen when tile selected
  2. ✅ **Extracted pen tool logic** (`client/src/hooks/useCanvas.ts`)
     - Changed implicit painting → explicit `selectedTool === 'pen'` mode
     - Matches line tool implementation pattern
  3. ✅ **Refactored state transitions** (`client/src/hooks/useSelectionState.ts`)
     - Defined `DRAWING_TOOLS = ['pen', 'line', 'rectangle']`
     - Auto-selects pen when tile selected (no drawing tool active)
     - Preserves active drawing tool when selecting tiles
     - Preserves tile when switching between drawing tools
     - Clears tile when switching to non-drawing tools
  4. ✅ **Visual grouping in toolbar** (`client/src/components/level-editor/Toolbar.tsx`)
     - Grouped pen/line/rectangle tools in dedicated section
     - Green color theme for drawing tools (vs blue for selection tools)
     - Added pen icon SVG matching existing icon style
  5. ✅ **Updated keyboard shortcuts** (`client/src/pages/LevelEditor.tsx`)
     - Added 'B' key for pen tool (Brush)
     - ESC clears both tool and tile
- **Tests:**
  - ✅ 18 unit tests passing (useSelectionState)
  - ✅ 4 E2E tests for Drawing Mode Tools pattern
  - ✅ All existing tests updated to reflect new behavior
- **Manual Test:**
  - Select a tile from palette → verify pen tool auto-selects (toolbar shows green)
  - With pen active, press 'L' → verify line tool selected and tile remains selected
  - With line tool active, select different tile → verify line tool stays active
  - Press 'V' (select tool) → verify tile deselects
  - Press ESC → verify both tool and tile clear
  - Press 'B' → verify pen tool selects
- **Note:** Foundation for entire drawing tools UX - 11.1 (line) and 11.2 (rectangle) now properly integrated

#### 11.1 Implement line drawing tool ⚠️ Algorithm Complete, Needs Interaction Model Integration
- **Status:** Partially complete - Algorithm done, needs Task 11.0 refactor
- **Commit:** 2f0247e (algorithm implementation)
- **What's Working:**
  - ✅ Bresenham's line algorithm (`lineDrawing.ts`)
  - ✅ Line preview rendering (`drawPreviewLine()` in canvasRenderer)
  - ✅ Mouse handlers for line drawing
  - ✅ Real-time preview while dragging
  - ✅ Batch tile placement with single undo/redo
  - ✅ ESC cancellation during drag
  - ✅ Tests: 4 E2E + 10 unit (all passing)
- **What Needs Refactoring** (blocked by Task 11.0):
  - ⚠️ Interaction model - currently uses old mutual exclusion logic
  - ⚠️ Should be part of drawing mode tools group
  - ⚠️ Should preserve tile when switching to/from line tool
  - ⚠️ Current `useSelectionState` logic needs updating
- **After Task 11.0 Complete:**
  - Update tests to reflect new interaction model
  - Verify line tool works in drawing mode tools group
  - Mark as complete after manual testing

#### 11.2 Implement rectangle drawing tool ⏸️ Not Started
- **Location:** `client/src/hooks/useCanvas.ts` - mouse event handlers
- **Current:** Rectangle tool button exists in toolbar ('r' key) but does nothing when activated
- **Dependencies:** Requires Task 11.0 (drawing mode tools interaction model) to be complete first
- **Implementation:**
  - Similar to line tool (Task 11.1), but draw rectangle instead of line
  - On mousedown: Record start corner position
  - On mousemove: Show preview rectangle from start to current position
  - On mouseup: Place tiles to form rectangle (outline or filled)
  - Works as part of drawing mode tools group (preserves tile selection)
- **Rectangle Fill Options:**
  - **Default:** Outline only (consistent with line tool)
  - **Optional:** Shift key to toggle filled mode
  - **Future:** Add toggle button to toolbar for persistent fill preference
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` (add rectangle drawing logic)
  - `client/src/utils/canvasRenderer.ts` (add drawPreviewRectangle method)
  - `client/src/utils/rectangleDrawing.ts` (new file - rectangle calculation utility)
- **Tests to add:**
  - E2E: Draw outline rectangle
  - E2E: Draw filled rectangle (if implemented)
  - E2E: Rectangle with different tile types
  - Unit: Rectangle position calculation
- **Note:** Part of drawing mode tools group - must follow same interaction patterns as pen and line tools

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

### Phase 2: Consolidate Interaction Tests (Medium Priority) ✅ COMPLETE

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

**Phase 2 Progress (7/7 complete):** -5 tests, -185 lines

#### 13.5 Merge copy keyboard and button tests ✅ COMPLETE
- **Status:** ✅ COMPLETE
- **Location:** Lines 1613-1650 (consolidated test)
- **What was done:**
  - Consolidated two separate copy tests into one test that checks both Ctrl+C and button
  - Deleted old "should copy button click work" test
  - New test verifies both input methods produce same outcome (toast notification)
  - Follows pattern from redo consolidation (commit 6d9a118)
- **Files modified:**
  - `e2e/level-editor.spec.ts` - Consolidated test at line 1613
- **Impact:** -1 test, -25 lines
- **Commit:** 38864db

#### 13.6 Merge paste keyboard and button tests ✅ COMPLETE
- **Status:** ✅ COMPLETE
- **Location:** Lines 1652 (consolidated test)
- **What was done:**
  - Consolidated 3 separate paste tests into one test that checks both Ctrl+V and paste button
  - Deleted redundant tests: "should paste button click work", "pasted objects should be offset from originals"
  - New test verifies both input methods produce same outcome (count increases + toast notification)
  - Follows pattern from redo/copy consolidation
  - Added comment explaining paste operation verification vs offset testing (separate concern)
- **Files modified:**
  - `e2e/level-editor.spec.ts` - Consolidated test at line 1652
- **Impact:** -2 tests, -69 lines
- **Commit:** ec4adb9

#### 13.7 Fix or remove redundant offset tests ✅ COMPLETE
- **Status:** ✅ COMPLETE
- **Location:** Lines 1652, 1786 (and potentially line 1806)
- **Resolution:** Redundant offset tests were already removed during consolidation in tasks 13.5 and 13.6
- **Current state:** Only remaining "offset" reference is a clarifying comment at line 1668 explaining offset is tested separately
- **Files checked:** `e2e/level-editor.spec.ts`
- **Impact:** Task already complete from previous consolidation work

#### 13.8 Evaluate and refactor multi-select copy test ✅ COMPLETE
- **Status:** ✅ COMPLETE
- **Location:** Line 1717 - "should copy multiple selected objects"
- **Resolution:** Test already skipped (`.skip`) because copy/paste functionality is being reworked in Chapter 15
- **Decision:** Leave test skipped until paste rework is complete
- **Files checked:** `e2e/level-editor.spec.ts`
- **Impact:** No action needed - will be addressed during Chapter 15 paste rework

#### 13.9 Document E2E consolidation pattern ✅ COMPLETE
- **Status:** ✅ COMPLETE
- **Location:** `docs/E2E_TESTING.md`
- **What was done:**
  - Added "Test Consolidation Pattern" section to E2E_TESTING.md
  - Documented pattern for testing keyboard shortcuts + UI buttons together
  - Included benefits, examples, and real test code showing the pattern
  - Skipped paste-related tests (paste functionality being reworked per user request)
- **Files modified:**
  - `docs/E2E_TESTING.md` - Added consolidation pattern section
  - `e2e/level-editor.spec.ts` - Skipped 3 paste tests (will be reworked)
- **Impact:** Improved documentation, clearer testing patterns for future development
- **Commit:** 739ec9b

### Phase 3: Extract Helper Functions (Low Priority)

#### 13.10 Create E2E test helper utilities file ✅ Complete
- **Status:** ✅ COMPLETE - Commit 1540d84
- **Location:** `e2e/helpers.ts` (created)
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
- **What was implemented:**
  - ✅ Created `e2e/helpers.ts` with 6 utility functions
  - ✅ Refactored 3 passing tests as proof of concept:
    - "Step 10: should place single platform tile with click" (line 869)
    - "Step 9: should enforce minimum zoom of 10%" (line 740)
    - "Step 10: should place spawn point object" (line 920)
  - ✅ All 113 passing E2E tests still pass (verified)
  - ✅ Reduced boilerplate by ~40 lines in 3 refactored tests
- **Helper functions implemented:**
  - `clickCanvas(page, x, y)` - Click at canvas coordinates
  - `getCanvasBounds(page)` - Get canvas bounding box with error handling
  - `placeTile(page, tileTestId, x, y)` - Select tile + click canvas + wait
  - `selectTool(page, tool)` - Select tool by name
  - `getZoomValue(page, source?)` - Extract zoom percentage
  - `getObjectCount(page)` - Extract object count from status bar
- **Files created:** `e2e/helpers.ts`
- **Files modified:** `e2e/level-editor.spec.ts` (3 tests refactored)
- **Impact:** -40 lines in 3 tests, demonstrates pattern for Task 13.11 (~200 total lines saved when all tests refactored)
- **Manual Test:**
  - Run `npm run test:e2e` - verify all 113 passing tests still pass
  - Verify refactored tests are more readable (less boilerplate)

#### 13.11 Refactor existing tests to use helper functions
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

#### 13.12 Add error handling and edge case tests
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

## Chapter 16: Bug Fixes

**Status:** ⏸️ Not Started
**Files:** Various
**Priority:** High (P2 - Bugfix)

**Goal:** Fix critical bugs discovered through E2E test failures and improve application reliability.

### Tasks:

#### 16.1 Fix Import JSON not updating level name
- **Priority:** 2 (Bugfix)
- **Location:** Import modal logic, `client/src/hooks/useLevelEditor.ts`, `client/src/pages/LevelEditor.tsx`
- **Current:** When importing JSON via File → Import JSON, the level name field shows "New Level" instead of the imported level's name
- **Issue:** Level state appears to not update properly after import, or the import modal doesn't apply the levelName from the JSON
- **Affected E2E tests:**
  - "Step 14: should import valid JSON level data" - expects level name to be "Imported Level"
  - "Step 14: should validate single player spawn on import" - expects level name to be "Invalid Level"
- **Expected behavior:** After importing JSON with `levelName: "Imported Level"`, the level name input field should display "Imported Level"
- **Files to investigate:**
  - Import modal component/logic
  - `useLevelEditor` hook - check if `importLevel` function updates level name
  - Level state update mechanism
- **Implementation:**
  - Debug import flow to identify where level name update is lost
  - Ensure imported JSON's `levelName` property is applied to current level
  - Verify Properties Panel reflects imported level name
  - Add state update or force re-render if needed
- **Tests:**
  - Verify E2E tests pass after fix
  - Manual test: Import JSON with custom level name, verify it displays correctly
- **Note:** This is blocking 2 E2E tests from passing

#### 16.2 Fix Export PNG download not triggering
- **Priority:** 2 (Bugfix)
- **Location:** `client/src/pages/LevelEditor.tsx` - `handleExportPNG` function
- **Current:** Clicking File → Export PNG doesn't trigger a browser download event
- **Issue:** The `handleExportPNG` function may not be properly creating/triggering the download, or the canvas-to-blob conversion is failing
- **Affected E2E tests:**
  - "Step 14: should export PNG when export PNG clicked" - waits for download event that never fires
- **Expected behavior:** Clicking "Export PNG" should trigger browser download with .png file containing canvas screenshot
- **Files to investigate:**
  - `client/src/pages/LevelEditor.tsx` - `handleExportPNG` function (around line 300-350)
  - `client/src/utils/levelSerializer.ts` - `exportToPNG` function if it exists
  - Canvas rendering state at export time
- **Implementation:**
  - Check if `handleExportPNG` is being called (add console.log or debugger)
  - Verify canvas.toBlob() or canvas.toDataURL() is working
  - Ensure download link is created and clicked programmatically
  - Check for any async/timing issues
- **Tests:**
  - Verify E2E test passes after fix
  - Manual test: Export PNG and verify file downloads with correct content
- **Note:** This is blocking 1 E2E test from passing

#### 16.3 Fix Invalid JSON toast selector ambiguity
- **Priority:** 3 (Test improvement)
- **Location:** `e2e/level-editor.spec.ts` - "Step 14: should show error for invalid JSON"
- **Current:** Test selector `getByText(/Invalid JSON/i)` matches 3 elements: toast notification, textarea content, and aria-live status
- **Issue:** Selector is too broad and causes Playwright strict mode violation
- **Affected E2E tests:**
  - "Step 14: should show error for invalid JSON" - fails with "resolved to 3 elements" error
- **Expected behavior:** Test should target only the toast notification element
- **Implementation:**
  - Update test to use more specific selector:
    - Option 1: `page.locator('[role="status"]').filter({ hasText: /Invalid JSON/i })`
    - Option 2: Target toast container by test ID or class
    - Option 3: Use `page.getByRole('alert')` if toast has alert role
  - Verify only one element matches
- **Files to modify:**
  - `e2e/level-editor.spec.ts` - Update selector in invalid JSON test
- **Tests:**
  - Verify E2E test passes with new selector
  - Ensure no other tests break from selector change
- **Note:** This is a test fix, not an app bug - low priority

**Dependencies:** None
**Notes:** P2 bugs are critical for E2E test suite health. Fix these before continuing with feature work.

---

## Chapter 15: Code Quality & Refactoring

**Status:** ⏸️ Not Started
**Files:** Various
**Priority:** Medium

### Tasks:

#### 15.1 Fix all linter issues
- **Priority:** 3 (Feature)
- **Location:** Multiple files across codebase
- **Current:** Biome linter reports warnings for excessive cognitive complexity and other issues
- **Known issues:**
  - `client/src/hooks/useCanvas.ts` - 3 functions with excessive complexity (26, 17, 38)
    - `handleMouseMove` - complexity 26 (max 15)
    - `handleMouseDown` - complexity 17 (max 15)
    - `handleMouseUp` - complexity 38 (max 15)
  - `client/src/pages/LevelEditor.tsx` - `LevelEditor` function complexity 23 (max 15)
- **Change:** Refactor complex functions to reduce cognitive complexity below threshold (15)
- **Implementation approach:**
  - Extract helper functions from complex handlers
  - Break down conditional logic into smaller, named functions
  - Consider state machine pattern for tool/mode handling
  - Use early returns to reduce nesting
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` - Refactor mouse handlers
  - `client/src/pages/LevelEditor.tsx` - Refactor LevelEditor component
  - Any other files with linter warnings
- **Tests:**
  - Ensure all unit tests still pass after refactoring
  - Ensure all E2E tests still pass
  - No behavioral changes - pure refactoring
- **Note:** This improves code maintainability and makes future changes easier

**Dependencies:** None
**Notes:** Can be done incrementally - start with highest complexity functions first

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

## Chapter 14: E2E Test Organization & Splitting

**Status:** ⏸️ Not Started
**Files:** `e2e/level-editor.spec.ts` (2814 lines → split into ~12 files)
**Priority:** Medium

**Goal:** Split monolithic level-editor.spec.ts into focused test files organized by feature area. Each file should cover specific functionality with clear behavioral documentation. Must handle Playwright parallel execution properly. All tests passing before and after split - this is purely a refactoring/reorganization task.

### Tasks:

#### 14.1 Split E2E tests into focused files by functionality
- **Location:** `e2e/level-editor.spec.ts` (2814 lines)
- **Current:** Single monolithic test file with all tests
- **Change:** Split into multiple focused test files organized by feature area
- **Proposed structure:**
  - `e2e/basic-ui.spec.ts` - Initial load, tile palette, level tabs, properties panel
  - `e2e/toolbar.spec.ts` - Toolbar buttons, tool selection, toggles
  - `e2e/keyboard-shortcuts.spec.ts` - All keyboard shortcuts (V/M/H/L/R/K/P/Escape)
  - `e2e/zoom-pan.spec.ts` - Zoom controls, pan with middle mouse, viewport interactions
  - `e2e/tile-placement.spec.ts` - Single click, painting mode, spawn points, interactables
  - `e2e/selection.spec.ts` - Select tool, multi-select, move tool, ghost preview
  - `e2e/undo-redo.spec.ts` - Undo/redo operations, history display, button states
  - `e2e/copy-paste.spec.ts` - Copy/paste operations, clipboard management
  - `e2e/import-export.spec.ts` - JSON import/export, PNG export, validation
  - `e2e/auto-save.spec.ts` - Auto-save timing, save indicators, unsaved state
  - `e2e/visual-effects.spec.ts` - Scanlines, grid toggle, selection feedback, delete animations
  - `e2e/parallax-zoom.spec.ts` - Initial zoom calculation, parallax background
  - `e2e/menus.spec.ts` - File dropdown, menu actions
- **Implementation:**
  - Extract tests into respective files
  - Ensure each file has proper test setup/teardown
  - Handle Playwright parallel execution (each file runs independently)
  - Verify all tests pass after split
  - Update test scripts if needed (npm run test:e2e should run all files)
- **Files to create:** 12+ new test files in `e2e/` directory
- **Files to modify/delete:** `e2e/level-editor.spec.ts` (will be removed after split)
- **Note:** This is purely a refactoring task - all tests must pass before and after. No behavioral changes.

**Dependencies:** None
**Notes:** Improves test maintainability and parallel execution. Each file becomes focused and easier to navigate.

---

## Chapter 15: Enhanced Copy/Paste with Ghost Preview

**Status:** ⏸️ Not Started
**Files:** `client/src/hooks/useCanvas.ts`, `client/src/hooks/useLevelEditor.ts`, `client/src/utils/canvasRenderer.ts`
**Priority:** Medium

**Goal:** Change paste behavior to show ghost preview instead of immediate placement. Paste becomes a "complex palette mode" similar to other drawing tools.

### Tasks:

#### 15.1 Rethink copy/paste workflow with ghost preview
- **Location:** `client/src/hooks/useCanvas.ts`, `client/src/hooks/useLevelEditor.ts`
- **Current:** Paste immediately places tiles at clipboard position
- **Change:** Paste shows ghost preview, waits for click to place
- **New workflow:**
  - **Copy:** Selected tiles → clipboard (unchanged)
  - **Paste:** Show ghost image of tiles, wait for click to place
  - **Placement:** Clicking places tiles at cursor position
  - **Overwrite:** Pasted tiles overwrite overlapping tiles (connects to Task 11.10)
  - **Cancel:** ESC key or selecting other tool/palette cancels paste mode
- **Implementation:**
  - In `useLevelEditor`: Add `pasteMode` state (boolean)
  - In `useCanvas`: On paste, set `pasteMode = true`, store clipboard data in temp state
  - In `canvasRenderer`: Render ghost preview of clipboard tiles at cursor position
  - In `useCanvas`: On click, place tiles from clipboard at clicked position
  - In `useCanvas`: On ESC or tool change, clear `pasteMode`
- **Ghost reuse opportunity:**
  - Currently ghost rendering used in move tool
  - Paste will add another use case
  - Investigate consolidating ghost rendering logic (DRY principle)
  - Possible shared helper: `drawGhostObjects(objects, offset, alpha)`
- **Files to modify:**
  - `client/src/hooks/useLevelEditor.ts` (add pasteMode state)
  - `client/src/hooks/useCanvas.ts` (paste interaction logic)
  - `client/src/utils/canvasRenderer.ts` (ghost preview rendering)
- **Note:** Paste essentially becomes a "complex palette mode" similar to other drawing tools

**Dependencies:** Task 11.10 (tile overlap logic) should be completed first for consistent overwrite behavior
**Notes:** More intuitive paste workflow. User has control over where pasted content goes.

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
| 11. Drawing Tools | 🔄 In Progress | ❌ | 5/12 complete, 7 tasks remaining |
| 13. E2E Test Simplification | 🔄 In Progress | ❌ | Phase 2: 4/7 complete (-5 tests, -185 lines) |
| 16. Bug Fixes | ⏸️ Not Started | ❌ | **HIGH PRIORITY** - 3 tasks (2x P2 bugs, 1x P3 test fix) |
| 15. Code Quality | ⏸️ Not Started | ❌ | Refactor complex functions, reduce linter warnings |
| 12. Documentation | ⏸️ Not Started | ❌ | Consolidate and organize project documentation |
| 14. E2E Test Organization | ⏸️ Not Started | ❌ | Split monolithic test file into 12+ focused files |
| 15. Enhanced Copy/Paste | ⏸️ Not Started | ❌ | Ghost preview paste workflow |

**Legend:**
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Completed
- ✓ Approved

---

## Next Steps

**Current:** Chapter 11 - Drawing Tools Implementation (5/12 complete, 7 remaining)

**✅ Completed (5):**
- ✅ Selection tool (single select)
- ✅ Move tool (ghost preview)
- ✅ Multi-select tool (drag box)
- ✅ Clear brush on tool change
- ✅ ESC key bug fix - Now cancels palette selection

**❌ Chapter 11 Remaining (Priority Order):**
1. 🔧 **11.10** Tile overlap logic - newest tile wins (HIGH PRIORITY)
2. 🔗 **11.5** Linking tool for interactable objects
3. ✂️ **11.6** Unlinking tool (Properties Panel)
4. 📏 **11.1** Line drawing tool
5. 📐 **11.2** Rectangle drawing tool
6. 🔢 **11.9** Button numbering system
7. 🔄 **11.7** Rotation tool - decision needed

**Alternative Focus:** Chapter 13 - E2E Test Simplification (Phase 2 COMPLETE)
- **Phase 1 (Complete):** ✅ Deleted 4 redundant zoom tests (-92 lines)
- **Phase 2 (Complete - 7/7 done):**
  - ✅ 13.3: Merge undo tests (consolidated + fixed bug)
  - ✅ 13.4: Merge redo tests (-2 tests, -60 lines)
  - ✅ 13.5: Merge copy tests (-1 test, -25 lines)
  - ✅ 13.6: Merge paste tests (-2 tests, -69 lines)
  - ✅ 13.7: Fix/remove redundant offset tests (already complete from 13.5/13.6)
  - ✅ 13.8: Refactor multi-select copy test (skipped - paste rework in Ch 15)
  - ✅ 13.9: Document consolidation pattern
- **Phase 3 (Not Started):** Extract helper functions (-200 lines)
- **Phase 4 (Not Started):** Add error/edge case coverage

**New Chapters (Queued):**
- **Chapter 16:** Bug Fixes - **HIGH PRIORITY** - Fix import/export bugs blocking E2E tests
- **Chapter 15:** Code Quality & Refactoring - Reduce linter warnings, refactor complex functions
- **Chapter 14:** E2E Test Organization - Split monolithic test file
- **Chapter 15:** Enhanced Copy/Paste - Ghost preview workflow (renumber to Ch 17)

**Future:** Chapter 12 - Documentation (low priority)

**Recommended Next:** `/next chapter 16` - Fix critical P2 bugs discovered in E2E test session

---

## Notes & Decisions

_(Add notes here as implementation progresses)_

