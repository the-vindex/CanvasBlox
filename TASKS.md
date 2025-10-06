# Visual Enhancement Roadmap - Roblox Level Designer

**Status:** In Progress
**Current Chapter:** Chapter 11 - Drawing Tools Implementation (alternative: Chapter 13 - E2E Test Simplification, **PRIORITY:** Chapter 16 - Bug Fixes)
**Last Updated:** 2025-10-05 (20:15 - Added Chapter 16 Bug Fixes, Chapter 15 Code Quality)

---

## Chapter Format

All chapters require HTML comment markers:
```markdown
<!-- CHAPTER_START: 11 -->
## Chapter 11: Title

**Status:** ✅ Complete
**Files:** ...
**Goal:** ...

### Tasks:
#### 11.1 Task title
- **Priority:** P3
...
<!-- CHAPTER_END: 11 -->
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


<!-- CHAPTER_START: 11 -->
## Chapter 11: Drawing Tools Implementation

**Status:** 🔄 In Progress (Interaction model refactor needed)
**Files:** `client/src/hooks/useCanvas.ts`, `client/src/pages/LevelEditor.tsx`, `client/src/hooks/useLevelEditor.ts`, `client/src/hooks/useSelectionState.ts`, `client/src/components/level-editor/Toolbar.tsx`
**Priority:** High

### Completed Tasks:
✅ **11.0** Pen tool and Drawing Mode Tools interaction pattern - Foundation for drawing tools UX
✅ **11.3** Selection tool - Click to select objects, shows properties
✅ **11.4** Move tool - Drag selected objects with ghost preview
✅ **11.8** Clear brush on tool change - Mutual exclusion between tools/tiles
✅ **11.9** Button numbering system - Auto-numbered badges on buttons and doors with adaptive contrast
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

#### 11.1 Implement line drawing tool ✅ Complete
- **Status:** ✅ Complete - Commits: 2f0247e (algorithm), ca6e7c5 (overlap fix)
- **What was implemented:**
  - ✅ Bresenham's line algorithm (`lineDrawing.ts`)
  - ✅ Line preview rendering (`drawPreviewLine()` in canvasRenderer)
  - ✅ Mouse handlers for line drawing (drag to draw)
  - ✅ Real-time preview while dragging
  - ✅ Batch tile placement with single undo/redo
  - ✅ ESC cancellation during drag
  - ✅ Interaction model integrated (Task 11.0 complete)
  - ✅ Drawing mode tools group (preserves tile selection with pen/rectangle)
  - ✅ Tile overlap detection (newest tile wins)
  - ✅ Button-on-door exception support
- **Tests:**
  - ✅ 5 E2E tests (drawing-tools.spec.ts) - All passing
  - ✅ 10 unit tests (lineDrawing.test.ts) - All passing
- **Manual Test:** ✅ User confirmed working

#### 11.2 Implement rectangle drawing tool ✅ Complete
- **Status:** ✅ COMPLETE + TESTED - Commits: 593549d (feat), dec24e8 (refactor), fb5b9f5 (bugfix), ca6e7c5 (overlap fix)
- **Location:** `client/src/hooks/useCanvas.ts`, `client/src/utils/rectangleDrawing.ts`, `client/src/utils/canvasRenderer.ts`
- **What was implemented:**
  1. ✅ **Rectangle drawing algorithm** (`client/src/utils/rectangleDrawing.ts`)
     - `getRectanglePositions()` function with filled/outline support
     - Handles all rectangle orientations (any two corners)
     - 12 unit tests covering all cases
  2. ✅ **Mouse handlers in useCanvas** (`client/src/hooks/useCanvas.ts`)
     - Similar pattern to line tool (drag to draw)
     - Preview while dragging with `rectanglePreview` state
     - ESC cancellation support
     - Refs cleared when tool changes
  3. ✅ **Preview rendering** (`client/src/utils/canvasRenderer.ts`)
     - `drawPreviewRectangle()` method
     - 50% opacity ghost preview during drag
  4. ✅ **Integration with LevelEditor** (`client/src/pages/LevelEditor.tsx`, `client/src/components/level-editor/Canvas.tsx`)
     - `handleRectangleComplete()` handler
     - Batch tile placement with single undo entry
     - Wired through Canvas component props
  5. ✅ **EditorState updates** (`client/src/types/level.ts`)
     - Added `rectanglePreview` field matching line tool pattern
- **Implementation decision:** **Filled rectangles by default** (not outline)
  - User requested filled rectangles
  - `getRectanglePositions(start, end, true)` with `filled=true`
  - Can toggle to outline in future if needed
- **Refactoring (commit dec24e8):**
  - ✅ Generalized preview rendering with `drawPreviewShape()` method
  - ✅ Extracted `handleDrawingToolComplete()` generic handler
  - ✅ Removed 4 redundant E2E tests (from 8 to 4 tests, same coverage)
  - ✅ 67% code reduction in preview rendering
- **Bugfix (commit fb5b9f5):**
  - ✅ Fixed critical undo/redo history bug (affected both line and rectangle tools)
  - ✅ Root cause: Race condition between async state updates and history capture
  - ✅ Solution: Atomic single-operation update via `updateCurrentLevel()`
- **Bugfix (commit ca6e7c5):**
  - ✅ Added tile overlap detection to drawing tools
  - ✅ `handleDrawingToolComplete()` now uses `removeOverlappingTiles()`
  - ✅ Newest tile wins, button-on-door exception preserved
  - ✅ Fixes issue where crossing lines/rectangles created duplicate tiles
- **Tests:**
  - ✅ 12 unit tests (rectangleDrawing.test.ts) - All passing
  - ✅ 4 E2E tests (e2e/drawing-tools.spec.ts) - All passing
  - ✅ Total: 155 unit + 126 E2E = 281 tests passing
- **Manual Test:** ✅ TESTED & VERIFIED by user
  - ✅ Rectangle drawing works correctly
  - ✅ Preview shows during drag
  - ✅ ESC cancels drawing
  - ✅ Undo/redo works correctly (bugfix verified)
- **Note:** Works as part of drawing mode tools group following same patterns as pen and line tools

#### 11.5 Implement linking tool for interactable objects ✅ Complete
- **Status:** ✅ COMPLETE - Commit 4a74244
- **Location:** `client/src/utils/linkingLogic.ts`, `client/src/hooks/useLevelEditor.ts`, `client/src/pages/LevelEditor.tsx`
- **What was implemented:**
  1. ✅ **Linking logic utilities** (`client/src/utils/linkingLogic.ts`)
     - `canObjectBeLinked()` - validates object type (interactables only)
     - `canLinkObjects()` - validates linking rules (no self-link, no duplicates)
     - `createLink()` - creates bidirectional link (linkedObjects + linkedFrom)
  2. ✅ **linkObjects function** (`client/src/hooks/useLevelEditor.ts`)
     - Validates source and target objects exist
     - Calls validation logic from linkingLogic.ts
     - Updates level state with linked objects
     - Shows toast notifications for success/errors
     - Integrates with undo/redo history
  3. ✅ **Click-based linking workflow** (`client/src/pages/LevelEditor.tsx`)
     - First click sets linkSourceId (source object)
     - Second click creates link to target
     - linkSourceId cleared after link creation
     - ESC key clears link mode (via useSelectionState)
     - Only interactable objects can be clicked in link mode
  4. ✅ **EditorState updates** (`client/src/types/level.ts`)
     - Added `linkSourceId?: string | null` to track link source
     - Cleared when changing tools (useSelectionState)
  5. ✅ **Properties panel integration** (`client/src/components/level-editor/PropertiesPanel.tsx`)
     - Shows "Linked Objects" section when object has links
     - Displays linked object type and position
- **Tests:**
  - ✅ 6 E2E tests (linking-tool.spec.ts) - All passing
  - ✅ 11 unit tests (linkingLogic.test.ts) - All passing
  - ✅ Test quality review completed, weak tests removed
  - ✅ Total: 166 unit + 132 E2E = 298 tests passing
- **Manual Test:** ✅ User testing COMPLETE - Verified working
  - ✅ Link creation (button → door) works correctly
  - ✅ Visual selection feedback shows selected source
  - ✅ Link lines visible (bright yellow with black outline)
  - ✅ Properties Panel shows linked objects
  - ✅ Duplicate link prevention works
  - ✅ ESC key deactivates tool
- **Bug fixes applied:**
  - Fixed link visibility (yellow with black outline)
  - Fixed double toast issue (100ms debounce)
  - Added visual selection feedback for link source
  - Removed implementation-coupled tests
- **Final commits:** 4a74244 (initial), 47e3a58, 96180c9, 38e65f7, 67bd960, 960eb0b, 1ee3e7d, b7571a8

#### 11.6 Implement unlinking tool for removing object links ✅ Complete
- **Status:** ✅ User Testing COMPLETE - Commits: 003f07b, 1689708, 3810911, f92c5ed, 90e1eb7, 6aa5855
- **Location:** `client/src/hooks/useLevelEditor.ts`, `client/src/components/level-editor/Toolbar.tsx`, `client/src/pages/LevelEditor.tsx`
- **Chosen approach:** Dedicated unlink tool (option 2) - better discoverability than properties panel
- **What was implemented:**
  1. ✅ **Dedicated unlink tool** (`client/src/components/level-editor/Toolbar.tsx`)
     - Added unlink tool button to toolbar (purple group with link tool)
     - Created broken link icon (unlink.svg) to visually distinguish from link tool
     - Tool shows active state when selected
  2. ✅ **Click-based workflow** (`client/src/pages/LevelEditor.tsx`)
     - Press 'U' key or click unlink tool button
     - Click source object (shows selection feedback)
     - Click linked target object to remove link
     - ESC key cancels unlink mode
  3. ✅ **Bidirectional link removal** (`client/src/utils/linkingLogic.ts`, `client/src/hooks/useLevelEditor.ts`)
     - `removeLink()` utility function removes link from both objects
     - `unlinkObjects()` checks both link directions - order doesn't matter when clicking
     - Toast notifications for success/errors
     - Undo/redo support
  4. ✅ **State management** (`client/src/types/level.ts`, `client/src/hooks/useSelectionState.ts`)
     - Added `unlinkSourceId` to track selected source in unlink mode
     - Auto-clears when switching tools
- **Tests:**
  - ✅ 5 unit tests (removeLink utility with immutability checks)
  - ✅ 4 E2E tests (unlink workflow, keyboard shortcut)
  - ✅ Test quality: Removed 7 implementation-coupled tests, fixed 3 weak assertions
  - ⏸️ 1 E2E test skipped (undo/redo timing issue - follow-up needed)
- **Manual Test:** ✅ User testing COMPLETE
  - ✅ Unlink workflow works in both directions (order doesn't matter)
  - ✅ Icon design: Separated chain pieces with visible gap (broken link appearance)
  - ✅ Toast notifications working correctly
  - ✅ ESC key cancels unlink mode
  - ✅ Undo/redo functionality confirmed
- **Bug fixes applied:**
  - Fixed bidirectional unlinking (checks both link directions)
  - Icon design iterations: 4 versions → final uses separated chain pieces
  - Parameters renamed to firstId/secondId to clarify bidirectionality

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

#### 11.9 Implement button numbering system ✅ Complete
- **Status:** ✅ Complete - Commits: c5e1e37, 501fba0, 77809c6, eafcbc2, d4e593f, 44855e0
- **Location:** `client/src/utils/canvasRenderer.ts`, `client/src/types/level.ts`, `client/src/components/level-editor/PropertiesPanel.tsx`
- **Current:** Buttons have no visual identification system - hard to track which button links to which door
- **Purpose:** Add auto-numbered badges to buttons and doors so users can visually identify puzzle connections
- **Dependencies:** Should be implemented after Task 11.5 (linking tool) for coherent UX

**Design Decisions (User-Approved):**
- ✅ Auto-numbering with user editing capability (1-99 range)
- ✅ Only buttons get numbered (not levers/pressure plates)
- ✅ Badge displayed at top-center of sprite
- ✅ Constant screen size (does not scale with zoom)
- ✅ Adaptive contrast: Two color schemes based on background luminance
- ✅ Always visible
- ✅ Doors show linked button number (single) or "×N" for multiple buttons
- ✅ Allow duplicate numbers with yellow warning in Properties Panel

**Subtasks:**

**11.9.1 Data model and auto-numbering**
- Add `buttonNumber?: number` property to InteractableObject (only for type: 'button')
- Implement auto-numbering in `useLevelEditor.addObject`: find max existing number, assign max + 1
- Persist button numbers in localStorage
- Update level import/export to preserve button numbers

**11.9.2 Adaptive contrast color scheme**
- Implement luminance calculation: `0.299*R + 0.587*G + 0.114*B`
- Create two schemes:
  - Light scheme (dark bg): White text, black background (70% opacity)
  - Dark scheme (light bg): Black text, white background (80% opacity)
- Switch scheme based on background luminance > 0.5

**11.9.3 Render button badges**
- Draw number badge in `canvasRenderer.drawButton()`
- Badge style: circular background, bold number centered
- Position: top-center of button sprite
- Constant screen size regardless of zoom level
- Use adaptive color scheme

**11.9.4 Render door badges**
- Single button linked: Show button's number in matching badge
- Multiple buttons linked: Show "×N" where N = count (e.g., "×3")
- Helper function to find buttons linking to door (via `linkedFrom` array)
- Same badge style and positioning as buttons

**11.9.5 Properties Panel integration**
- Add "Button Number" input field when button selected
- Number input type, range 1-99, validation
- Detect duplicates: If number exists on another button, show yellow warning
- Allow duplicates (don't prevent, just warn)
- Update button properties on change

**11.9.6 Documentation**
- Create `docs/BUTTON_NUMBERING_SYSTEM.md` with:
  - Overview and features
  - Auto-numbering behavior
  - Adaptive contrast system
  - Usage workflow for level designers
  - Technical details (data model, rendering)
  - Design rationale
- Update `docs/ARCHITECTURE.md` to reference button numbering system

**Files to modify:**
- `client/src/types/level.ts` - Add buttonNumber property
- `client/src/hooks/useLevelEditor.ts` - Auto-numbering logic
- `client/src/utils/canvasRenderer.ts` - Badge rendering (buttons + doors)
- `client/src/components/level-editor/PropertiesPanel.tsx` - Button number editing
- `docs/BUTTON_NUMBERING_SYSTEM.md` - New documentation file
- `docs/ARCHITECTURE.md` - Reference new system

**Tests:**
- Unit tests (`client/src/utils/buttonNumbering.test.ts`):
  - Auto-numbering logic (max + 1, reset to 1)
  - Luminance calculation
  - Color scheme selection
  - Number validation (1-99 range)
- E2E tests (`e2e/button-numbering.spec.ts`):
  - Button shows auto-assigned number after placement
  - Number editable in Properties Panel
  - Duplicate number shows warning
  - Door shows single button's number
  - Door shows "×N" for multiple linked buttons
  - Badge uses correct contrast on light/dark backgrounds
  - Badge maintains constant size at different zoom levels

**Visual Reference:** Clear, bold badges like Mario Maker - immediately visible and readable

**What was implemented:**
1. ✅ **Data model and auto-numbering** (`client/src/types/level.ts`, `client/src/hooks/useLevelEditor.ts`)
   - Added `buttonNumber?: number` property to InteractableObject
   - Auto-numbering: assignButtonNumber() finds max + 1
   - Integrated into addObject() function
2. ✅ **Adaptive contrast system** (`client/src/utils/buttonNumbering.ts`)
   - Luminance calculation: 0.299*R + 0.587*G + 0.114*B
   - Light scheme (dark bg): White text, black bg, 70% opacity
   - Dark scheme (light bg): Black text, white bg, 80% opacity
3. ✅ **Button badge rendering** (`client/src/utils/canvasRenderer.ts`)
   - Circular badges at top-center of buttons
   - Constant screen size (24px diameter) regardless of zoom
   - Screen-space rendering with transform calculations
4. ✅ **Door badge rendering** (`client/src/utils/canvasRenderer.ts`)
   - Shows single button number or "×N" for multiple buttons
   - getButtonsLinkingToDoor() helper function
   - Same badge style as buttons
5. ✅ **Properties Panel integration** (`client/src/components/level-editor/PropertiesPanel.tsx`)
   - "Button Number" input field for buttons
   - 1-99 range validation
   - Duplicate detection with yellow warning
   - Allows duplicates (warns but doesn't prevent)
6. ⏸️ **Documentation** - Not implemented (optional, defer to Chapter 12)

**Tests:**
- ✅ 27 unit tests (buttonNumbering.test.ts) - All passing
- ✅ 5 E2E tests (button-numbering.spec.ts) - All passing
- ✅ Test review completed, weak tests removed
- ✅ Total: 190 unit + 140 E2E tests passing

**Manual Test:**
Please test the following scenarios:
1. Place a button → verify badge shows "1"
2. Place another button → verify badge shows "2"
3. Select a button → verify Properties Panel shows "Button Number" field
4. Edit button number to 5 → verify badge updates
5. Create duplicate number → verify yellow warning appears
6. Link button to door → verify door shows button's number
7. Link multiple buttons to door → verify door shows "×N"
8. Zoom in/out → verify badge stays constant size
9. Place button on different backgrounds → verify badge has good contrast

#### 11.10 Implement tile overlap logic - newest tile wins ✅ Complete
- **Status:** ✅ Complete - Commit: 0e8c6dc
- **Location:** `client/src/hooks/useLevelEditor.ts` - addTile function, `client/src/utils/levelSerializer.ts` - deserialize/import functions
- **What was implemented:**
  1. ✅ **Overlap detection in addTile** (`client/src/hooks/useLevelEditor.ts:227-296`)
     - Filter out tiles at same position before adding new tile
     - Works in both skipHistory and normal modes
     - Exception: Keep door when button is placed on top
  2. ✅ **Overlap cleanup utility** (`client/src/utils/levelSerializer.ts:12-46`)
     - `removeOverlappingTiles()` function for cleaning tile arrays
     - Groups tiles by position, keeps newest (last in array)
     - Handles button-on-door exception
  3. ✅ **JSON import cleanup** (`client/src/utils/levelSerializer.ts:48-72`)
     - Deserialize function cleans up overlaps on import
     - Ensures imported levels don't have stacked tiles
  4. ✅ **LocalStorage load cleanup** (`client/src/hooks/useLevelEditor.ts:70-89`)
     - Maps over loaded levels to clean up overlapping tiles
     - Applies to all levels on initial load
- **Tests:**
  - ✅ 3 unit tests added (useLevelEditor.test.ts:331-400)
    - Test: Remove old tile when new tile placed at same position
    - Test: Keep both tiles when button placed on door
    - Test: Handle multiple overlapping tiles at same position
  - ✅ Total: 167 unit + 134 E2E = 301 tests passing
- **Manual Test:** Ready for testing
  - Place tile → place another tile at same position → verify old tile removed
  - Place door → place button on top → verify both tiles exist
  - Import JSON with overlapping tiles → verify cleaned up
  - Reload page → verify localStorage tiles cleaned up

#### 11.13 Improve selection outline visibility on blue backgrounds ✅ Complete
- **Status:** ✅ COMPLETE - Commit 0751176
- **Location:** `client/src/utils/canvasRenderer.ts` - selection rendering
- **What was implemented:**
  1. ✅ **High-contrast selection outline** (`client/src/utils/canvasRenderer.ts:1123-1147`)
     - Added `drawHighContrastSelection()` helper method
     - White inner stroke (2px) with glow for visibility on dark backgrounds
     - Black outer stroke (4px) for visibility on light backgrounds
     - Dual-stroke approach ensures visibility on any background color
  2. ✅ **Improved pulsing animation**
     - Oscillates between 0.7 and 1.0 opacity (was 0.6-1.0)
     - Faster cycle (2x speed) for more noticeable feedback
     - Starts at high visibility (no delay)
  3. ✅ **Applied to all object types**
     - Tiles (platform-basic, platform-grass, etc.)
     - Interactable objects (buttons, doors, levers, etc.)
     - Spawn points (player, enemy)
- **Tests:**
  - ✅ Selection already tested in `selection.spec.ts:98` (visual highlight verification)
  - ✅ All existing tests pass (190 unit + 144 E2E)
  - Note: No new E2E tests added - review determined visual tests should be unit tests or visual regression tests, and existing selection tests already cover functionality
- **Manual Test:** ✅ User confirmed - "animation is nice and visible"
- **Note:** Selection outline now clearly visible on blue default background and all other colors

#### 11.14 Move Select All button to toolbar
- **Priority:** 3 (Feature)
- **Location:** `client/src/components/level-editor/Toolbar.tsx`, `client/src/pages/LevelEditor.tsx`
- **Current:** "Select All" is in Edit menu, requires menu navigation
- **Change:** Move "Select All" button to toolbar near other selection tools (Select, Multi-select)
- **Implementation:**
  - Remove "Select All" from Edit menu dropdown
  - Add button to toolbar in selection tools group
  - Create icon for Select All button (e.g., dotted box with all corners highlighted)
  - Keep Ctrl+A keyboard shortcut working
  - Add tooltip: "Select All (Ctrl+A)"
- **Files to modify:**
  - `client/src/components/level-editor/Toolbar.tsx` - Add Select All button
  - `client/src/pages/LevelEditor.tsx` - Remove from Edit menu
- **Tests:**
  - E2E test: Click Select All button → verify all objects selected
  - E2E test: Ctrl+A still works
- **Note:** User requirement - no discussion needed

#### 11.15 Move Copy/Paste buttons to toolbar
- **Priority:** 3 (Feature)
- **Location:** `client/src/components/level-editor/Toolbar.tsx`, `client/src/pages/LevelEditor.tsx`
- **Current:** Copy and Paste buttons are in Edit menu
- **Change:** Move Copy and Paste buttons to toolbar as new group near selection tools
- **Implementation:**
  - Remove Copy and Paste from Edit menu dropdown
  - Add new toolbar group for clipboard operations
  - Position near selection tools (after Select All)
  - Add icons for both buttons (standard copy/paste icons)
  - Keep keyboard shortcuts working (Ctrl+C, Ctrl+V)
  - Add tooltips: "Copy (Ctrl+C)", "Paste (Ctrl+V)"
  - Maintain disabled state when no selection (Copy) or empty clipboard (Paste)
- **Files to modify:**
  - `client/src/components/level-editor/Toolbar.tsx` - Add Copy/Paste buttons
  - `client/src/pages/LevelEditor.tsx` - Remove from Edit menu
- **Tests:**
  - E2E test: Copy/Paste buttons work same as keyboard shortcuts
  - E2E test: Buttons show correct disabled state
- **Note:** Improves discoverability and workflow efficiency

#### 11.16 Improve close level dialog message
- **Priority:** 3 (Feature)
- **Location:** Close level confirmation dialog component
- **Current:** Close level dialog message is generic or unclear about data loss
- **Change:** Dialog should clearly state: "Are you sure you want to close 'New Level 3'? Any unsaved changes will be lost."
- **Implementation:**
  - Include level name in dialog message
  - Emphasize data loss and that undo is not possible
  - Make message clear and user-friendly for kids
  - Consider red/warning styling for destructive action
- **Files to modify:**
  - Level close confirmation dialog component (likely in `client/src/components/level-editor/` or `LevelEditor.tsx`)
- **Tests:**
  - E2E test: Close level → verify dialog shows level name
  - E2E test: Verify warning message is clear
- **Note:** Prevents accidental data loss

**Dependencies:** None - core selection/move tools already complete
**Notes:** 5 tasks remaining: Rotation decision (11.7), UI improvements (11.14-11.16). Completed 11.13 (selection outline), moved zoom reset (was 11.12) to Chapter 22 (P4).

<!-- CHAPTER_END: 11 -->
---

<!-- CHAPTER_START: 13 -->

<!-- CHAPTER_START: 16 -->

<!-- CHAPTER_START: 15 -->
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

#### 15.2 Remove duplicate level button
- **Priority:** 3 (Feature - UI cleanup)
- **Location:** `client/src/components/level-editor/PropertiesPanel.tsx` or wherever duplicate level button exists
- **Current:** "Duplicate Level" button exists in UI
- **Change:** Remove the button - redundant with Ctrl+A + Ctrl+C workflow
- **Rationale:**
  - Ctrl+A selects all objects in level
  - Ctrl+C copies them to clipboard
  - After Chapter 18 (paste rework), paste will be even more intuitive
  - Button is redundant and clutters UI
- **Implementation:**
  - Remove "Duplicate Level" button from UI
  - Remove associated handler function
  - Update any tests that reference the button
- **Files to modify:**
  - Properties Panel or wherever button is located
  - Remove handler function
  - Update E2E tests if they reference this button
- **Tests:**
  - Verify button is removed from UI
  - Verify Ctrl+A + Ctrl+C workflow still works for duplicating level content
- **Note:** Simplifies UI, encourages using standard copy/paste workflow

**Dependencies:** None
**Notes:** Can be done incrementally - start with highest complexity functions first (15.1), then UI cleanup (15.2)

<!-- CHAPTER_END: 15 -->
---

<!-- CHAPTER_START: 12 -->
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

<!-- CHAPTER_END: 12 -->
---

<!-- CHAPTER_START: 14 -->

<!-- CHAPTER_START: 17 -->
## Chapter 17: E2E Test Optimization - Phase 3

**Status:** ⏸️ Not Started
**Files:** `e2e/auto-save.spec.ts`, `e2e/tile-placement.spec.ts`
**Priority:** Low

**Goal:** Continue E2E test consolidation from Chapter 13 with additional redundant test removal.

### Tasks:

#### 17.1 Merge auto-save E2E tests
- **Status:** ⏸️ Not Started
- **Priority:** 3 (Test consolidation)
- **Location:** `e2e/auto-save.spec.ts`
- **Tests to merge:**
  - Line 32: "should auto-save after 5 seconds"
  - Line 56: "should change icon color based on save state"
- **Reason:** Both tests verify auto-save behavior, can be consolidated into single comprehensive test
- **Pattern:** Follow consolidation pattern from Chapter 13 (undo/redo/copy/paste merges)
- **Implementation:**
  - Merge both tests into single test that verifies timing AND icon state changes
  - Place tiles → wait 5 seconds → verify save occurred + icon state
  - Delete tests → verify icon shows unsaved state
- **Files to modify:**
  - `e2e/auto-save.spec.ts`
- **Impact:** -1 test, reduces E2E execution time

#### 17.2 Remove redundant platform tile placement test
- **Status:** ⏸️ Not Started
- **Priority:** 3 (Test cleanup)
- **Location:** `e2e/tile-placement.spec.ts:9`
- **Test to remove:** "should place single platform tile with click"
- **Reason:** Redundant coverage - single-click placement mechanics already verified by:
  - Line 62: spawn point placement (same click mechanics)
  - Line 81: button placement (same click mechanics)
  - Line 142: undo history for single-click (verifies placement works)
- **Impact:** Reduces E2E execution time without losing coverage
- **Pattern:** Each test should verify unique behavior; object-type-specific tests already cover placement mechanics
- **Files to modify:**
  - `e2e/tile-placement.spec.ts`

<!-- CHAPTER_END: 17 -->
---

<!-- CHAPTER_START: 18 -->
## Chapter 18: Enhanced Copy/Paste with Ghost Preview

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
- **Edge cases to consider:**
  - Copy/paste with 0 objects selected (should show appropriate feedback)
  - Copy from one level, paste to another (should work seamlessly)
  - Undo/redo state preservation during paste mode
  - Paste cancellation (ESC key, tool change, level switch)
  - **CRITICAL: Ctrl+A, Ctrl+C, Ctrl+V whole level scenario:**
    - User selects all objects (potentially 100+ objects)
    - Copies entire level to clipboard
    - Presses Ctrl+V to paste
    - **Problem:** Ghost preview of 100+ objects following cursor
    - **Performance:** Rendering hundreds of ghost objects every frame
    - **UX:** Massive ghost preview covering entire canvas - confusing
    - **Solution options:**
      1. **Limit ghost preview:** Show max 10-20 objects in ghost, display count badge "×127 objects"
      2. **Bounding box preview:** Show just an outline box indicating total size of pasted content
      3. **Smart detection:** If clipboard has >50 objects, show warning "Paste large selection? (127 objects)" → confirm → paste immediately at center or offset
      4. **Disable ghost for large pastes:** Fallback to immediate paste with offset for >X objects
    - **Recommended approach:** Option 3 (smart detection with confirmation)
      - Threshold: 20-30 objects (configurable)
      - Show modal: "Paste 127 objects at center of viewport?" [Cancel] [Paste]
      - On confirm: Paste immediately at calculated position
      - Avoids performance issues and unclear UX
    - **Alternative for power users:** If user holds Shift while pasting large selection, bypass confirmation and paste immediately
- **Files to modify:**
  - `client/src/hooks/useLevelEditor.ts` (add pasteMode state)
  - `client/src/hooks/useCanvas.ts` (paste interaction logic)
  - `client/src/utils/canvasRenderer.ts` (ghost preview rendering)
- **Note:** Paste essentially becomes a "complex palette mode" similar to other drawing tools

**Dependencies:** Task 11.10 (tile overlap logic) should be completed first for consistent overwrite behavior
**Notes:** More intuitive paste workflow. User has control over where pasted content goes.

<!-- CHAPTER_END: 18 -->
---

---

<!-- CHAPTER_START: 20 -->
## Chapter 20: Advanced Selection Modifiers

**Status:** ⏸️ Not Started
**Files:** `client/src/hooks/useCanvas.ts`, `client/src/hooks/useSelectionState.ts`, `client/src/pages/LevelEditor.tsx`
**Priority:** Medium

**Goal:** Implement industry-standard modifier key patterns for advanced selection workflows (Shift for multi-select, Ctrl for additive selection).

### Tasks:

#### 20.1 Research industry patterns for modifier-based selection
- **Priority:** 3 (Feature - Research phase)
- **Location:** Research document or design doc
- **Current:** No modifier key support for selection
- **Change:** Research how industry tools handle modifier keys (Photoshop, Figma, Illustrator, Tiled)
- **Research areas:**
  - Shift key behavior (typically multi-select/box selection)
  - Ctrl/Cmd key behavior (typically additive selection)
  - Temporary tool override patterns
  - Visual feedback for modifier states
  - Interaction with active tools (especially Move tool)
- **Deliverable:** Design document with recommendations for CanvasBlox
- **Note:** Research-heavy task - foundation for 20.2-20.5

#### 20.2 Implement Shift+Drag for temporary multi-select
- **Priority:** 3 (Feature)
- **Location:** `client/src/hooks/useCanvas.ts`, `client/src/hooks/useSelectionState.ts`
- **Current:** Multi-select requires selecting Multi-select tool from toolbar
- **Change:** Holding Shift temporarily engages multi-select tool (box selection)
- **Behavior:**
  - Press and hold Shift key
  - Drag to create selection box
  - Release mouse - objects in box are selected (replaces current selection, non-additive)
  - Release Shift - return to previous tool
- **Implementation:**
  - Track Shift key state in useCanvas
  - On Shift down: Store current tool, temporarily activate multi-select
  - On Shift up: Restore previous tool
  - Visual feedback: Cursor changes, status bar shows "Multi-select (Shift)"
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` - Shift key handling
  - `client/src/hooks/useSelectionState.ts` - Temporary tool state
- **Tests:**
  - E2E: Shift+Drag creates selection box
  - E2E: Release Shift returns to previous tool
  - E2E: Selection replaces current selection (non-additive)

#### 20.3 Implement Ctrl+Click for additive selection
- **Priority:** 3 (Feature)
- **Location:** `client/src/hooks/useCanvas.ts`
- **Current:** Clicking object replaces current selection
- **Change:** Ctrl+Click adds individual objects to selection (additive)
- **Behavior:**
  - Hold Ctrl key
  - Click object - adds to selection if not selected, removes if already selected (toggle)
  - Click empty space - does nothing (preserves selection)
- **Implementation:**
  - Track Ctrl key state in useCanvas
  - On Ctrl+Click object: Toggle object in selection array
  - Visual feedback: Cursor shows "+" icon, status bar shows "Add to selection (Ctrl)"
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` - Ctrl key handling, click logic
  - `client/src/hooks/useLevelEditor.ts` - toggleObjectSelection function
- **Tests:**
  - E2E: Ctrl+Click adds object to selection
  - E2E: Ctrl+Click selected object removes it from selection
  - E2E: Ctrl+Click empty space preserves selection

#### 20.4 Implement temporary tool override for Move tool
- **Priority:** 3 (Feature)
- **Location:** `client/src/hooks/useCanvas.ts`, `client/src/hooks/useSelectionState.ts`
- **Current:** Modifier keys disengage Move tool
- **Change:** When Move tool active, Shift/Ctrl temporarily override without disengaging Move
- **Behavior:**
  - User has Move tool selected
  - Press Shift - Move tool becomes inactive, multi-select engaged
  - Release Shift - Move tool re-activates
  - Same for Ctrl - temporary additive selection mode
- **Special case:** This is an exception to normal tool behavior - requires careful state management
- **Implementation:**
  - Add "suspended tool" state (tool that will resume after modifier release)
  - When modifier pressed with Move active: Suspend Move, activate selection mode
  - When modifier released: Restore Move tool
  - Visual feedback: Toolbar shows both Move (dimmed) and current modifier mode
- **Files to modify:**
  - `client/src/hooks/useSelectionState.ts` - Suspended tool state
  - `client/src/components/level-editor/Toolbar.tsx` - Visual feedback for suspended state
- **Tests:**
  - E2E: Move tool + Shift → multi-select works, release → Move resumes
  - E2E: Move tool + Ctrl → additive selection works, release → Move resumes

#### 20.5 Visual feedback for modifier states
- **Priority:** 3 (Feature)
- **Location:** `client/src/utils/canvasRenderer.ts`, `client/src/components/level-editor/Toolbar.tsx`, status bar
- **Current:** No visual indication when modifier keys are held
- **Change:** Clear visual feedback for all modifier states
- **Visual indicators:**
  - **Cursor changes:**
    - Shift held: Box selection cursor (crosshair or dotted box)
    - Ctrl held: Plus (+) cursor for additive selection
  - **Status bar:**
    - "Multi-select (Shift)" when Shift held
    - "Add to selection (Ctrl)" when Ctrl held
  - **Toolbar:**
    - Active tool highlighted
    - Suspended tool shown dimmed/grayed
    - Modifier mode indicator badge
- **Implementation:**
  - Custom cursor CSS for each modifier state
  - Status bar component updates based on modifier state
  - Toolbar component shows suspended state
- **Files to modify:**
  - `client/src/utils/canvasRenderer.ts` - Cursor rendering
  - `client/src/components/level-editor/Toolbar.tsx` - Suspended tool UI
  - Status bar component - Modifier state display
  - `client/src/index.css` - Cursor styles
- **Tests:**
  - E2E: Shift held → cursor changes, status bar updates
  - E2E: Ctrl held → cursor changes, status bar updates
  - E2E: Move suspended → toolbar shows dimmed Move + active modifier

#### 20.6 Rethink selection tool buttons (if needed)
- **Priority:** 4 (Idea/enhancement)
- **Location:** `client/src/components/level-editor/Toolbar.tsx`
- **Current:** Separate Select and Multi-select tool buttons
- **Change:** Potentially consolidate or rethink based on modifier key implementation
- **Questions:**
  - With Shift+Drag for multi-select, do we still need Multi-select button?
  - Should Select button be default tool, or just use modifier keys?
  - Keep buttons for discoverability, or remove for cleaner UI?
- **Decision:** Defer until 20.2-20.5 implemented, then evaluate based on UX testing
- **Note:** Low priority - might not be needed

**Dependencies:**
- 20.1 (research) should be completed before implementing 20.2-20.5
- 20.2-20.4 can be implemented independently after research
- 20.5 (visual feedback) should be last, after behavior is working

**Notes:**
- High implementation complexity - requires state machine refactoring
- Extensive testing needed for all modifier combinations
- User research needed after initial implementation

<!-- CHAPTER_END: 20 -->
---

<!-- CHAPTER_START: 21 -->
## Chapter 21: Multi-Select Properties Panel

**Status:** ⏸️ Not Started
**Files:** `client/src/components/level-editor/PropertiesPanel.tsx`
**Priority:** Low (P4 - Idea/enhancement)

**Goal:** Redesign Properties Panel to handle multiple selected objects gracefully.

### Tasks:

#### 21.1 Rethink Properties Panel for multi-select
- **Priority:** 4 (Idea/enhancement)
- **Location:** `client/src/components/level-editor/PropertiesPanel.tsx`
- **Current:** Properties Panel doesn't work well when multiple objects are selected
- **Change:** Redesign to handle batch editing and property differences
- **Requirements:**
  - Show count of selected objects (e.g., "3 objects selected")
  - Display common properties across all selected objects
  - Indicate when properties differ (e.g., "Mixed" for position, "—" for different values)
  - Enable batch editing (change one property, applies to all selected)
  - Show object type mix if different types selected (e.g., "2 buttons, 1 door")
- **Design patterns to research:**
  - Figma's properties panel (shows "Mixed" for different values)
  - Photoshop's layers panel (batch property editing)
  - Unity's Inspector (multi-object editing)
- **Implementation:**
  - Detect when multiple objects selected
  - Calculate common properties and differences
  - Render appropriate UI for batch editing
  - Apply changes to all selected objects
  - Add undo/redo support for batch edits
- **Files to modify:**
  - `client/src/components/level-editor/PropertiesPanel.tsx` - Complete redesign
  - `client/src/hooks/useLevelEditor.ts` - Batch property update functions
- **Tests:**
  - E2E: Select 3 objects → Properties Panel shows "3 objects selected"
  - E2E: Common property edited → all selected objects updated
  - E2E: Property with different values shows "Mixed"
  - E2E: Batch edit can be undone in one step
- **Note:** Low priority - current behavior is acceptable for now, but this would be a nice UX improvement

**Dependencies:** None - standalone enhancement
**Notes:** Consider implementing after Chapter 20 (Advanced Selection Modifiers) is complete, as better selection UX will make multi-select more common

<!-- CHAPTER_END: 21 -->
---

<!-- CHAPTER_START: 22 -->
## Chapter 22: Future Enhancements (P4 - Ideas)

**Status:** ⏸️ Not Started
**Files:** Various
**Priority:** Low (P4 - Ideas)

### Tasks:

#### 22.1 Enhance zoom reset to fit all content
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
| 11. Drawing Tools | 🔄 In Progress | ❌ | 12/17 complete, 5 tasks remaining (UI improvements) |
| 15. Code Quality | ⏸️ Not Started | ❌ | Refactor complex functions, UI cleanup (2 tasks) |
| 17. E2E Test Optimization | ⏸️ Not Started | ❌ | Phase 3 continuation - auto-save test merge |
| 18. Enhanced Copy/Paste | ⏸️ Not Started | ❌ | Ghost preview paste workflow |
| 20. Advanced Selection Modifiers | ⏸️ Not Started | ❌ | Shift/Ctrl modifier keys, temporary tool override (6 tasks) |
| 21. Multi-Select Properties Panel | ⏸️ Not Started | ❌ | Batch editing, property differences UI (1 task, P4) |
| 22. Future Enhancements | ⏸️ Not Started | ❌ | P4 ideas - zoom fit-to-view (1 task) |
| 12. Documentation | ⏸️ Not Started | ❌ | Consolidate and organize project documentation |

**Legend:**
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Completed
- ✓ Approved

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

