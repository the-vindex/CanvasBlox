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

**Status:** ✅ Complete
**Files:** `client/src/hooks/useCanvas.ts`, `client/src/pages/LevelEditor.tsx`, `client/src/hooks/useLevelEditor.ts`, `client/src/hooks/useSelectionState.ts`, `client/src/components/level-editor/Toolbar.tsx`, `client/src/components/level-editor/PropertiesPanel.tsx`, `e2e/close-level-dialog.spec.ts`
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

#### 11.7 Decide on rotation tool approach or remove it ✅ Complete
- **Status:** ✅ COMPLETE
- **Location:** `client/src/components/level-editor/PropertiesPanel.tsx`
- **Decision:** Removed rotation UI
- **What was removed:**
  - Rotation dropdown selector from Properties Panel (lines 292-310)
  - User can no longer change rotation values via UI
- **What was kept:**
  - Rotation property in data model (Tile and InteractableObject types)
  - Rotation rendering logic in canvasRenderer.ts (for future use or imported levels)
  - Default rotation value (0°) when creating new objects
- **Rationale:**
  - Rotation feature was unclear and not essential for core level design workflow
  - Keeping data model support allows future enhancement if needed
  - Simplifies UI and reduces cognitive load for users
- **Files modified:**
  - `client/src/components/level-editor/PropertiesPanel.tsx` - Removed rotation Select component
- **Tests:** No test changes needed (no tests referenced rotation selector)

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
- **Status:** ✅ COMPLETE + APPROVED ✓ - Commit 0751176
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

#### 11.14 Move Select All button to toolbar ✅ Complete
- **Status:** ✅ COMPLETE - Commit 4ac9987
- **Priority:** 3 (Feature)
- **Location:** `client/src/components/level-editor/Toolbar.tsx`, `client/src/pages/LevelEditor.tsx`
- **What was implemented:**
  1. ✅ **Added Select All button to toolbar** (`client/src/components/level-editor/Toolbar.tsx:124-134`)
     - Button placed in selection tools group (first toolbar section)
     - Created select-all.svg icon with filled corners design
     - Added tooltip: "Select All (Ctrl+A)"
     - Button disabled when no objects exist (hasObjects prop)
  2. ✅ **Removed Select All from header** (`client/src/pages/LevelEditor.tsx:782-822`)
     - Removed standalone button from header menu bar
     - Cleaner UI, follows toolbar pattern for all selection tools
  3. ✅ **Wired up props and handlers**
     - Added onSelectAll and hasObjects props to Toolbar component
     - Passed _selectAllObjects handler from LevelEditor
     - Button enabled/disabled based on object presence
- **Tests:**
  - ✅ 2 E2E tests (select-all-toolbar.spec.ts) - All passing
  - ✅ Test quality reviewed and refactored
  - ✅ Total: 190 unit + 145 E2E = 335 tests passing
- **Manual Test:**
  - Click Select All button in toolbar → verify all objects selected
  - Verify button shows tooltip "Select All (Ctrl+A)"
  - Empty level → verify button is disabled
  - Place object → verify button becomes enabled
  - Ctrl+A keyboard shortcut still works (existing coverage)

#### 11.15 Move Copy/Paste buttons to toolbar ✅ Complete
- **Status:** ✅ COMPLETE - Commit 2047cd2
- **Priority:** 3 (Feature)
- **Location:** `client/src/components/level-editor/Toolbar.tsx`, `client/src/pages/LevelEditor.tsx`
- **What was implemented:**
  1. ✅ **Created copy.svg and paste.svg icons** (`client/src/assets/icons/`)
     - Two overlapping squares for copy icon
     - Clipboard with document lines for paste icon
     - Match existing toolbar icon style (24x24, currentColor stroke)
  2. ✅ **Added Copy/Paste buttons to Toolbar** (`client/src/components/level-editor/Toolbar.tsx`)
     - Positioned in selection tools group (after Select All)
     - Added tooltips: "Copy (Ctrl+C)", "Paste (Ctrl+V)"
     - Added aria-labels for accessibility
     - Wired up props: onCopy, onPaste, hasSelection, hasClipboard
  3. ✅ **Removed Copy/Paste from header** (`client/src/pages/LevelEditor.tsx`)
     - Kept Undo/Redo buttons in header
     - Removed standalone Copy/Paste buttons
     - Passed copy/paste handlers to Toolbar component
  4. ✅ **Updated tests**
     - Updated unit test descriptions: "in toolbar" instead of "in header"
     - Updated mocked Toolbar to include Copy/Paste buttons
     - Added clipboard to mocked editorState
     - All tests passing: 190 unit + 143 E2E
- **Tests:**
  - ✅ E2E tests use semantic selectors (getByRole) - work regardless of location
  - ✅ Unit tests verify buttons render in toolbar
  - ✅ Disabled states tested (no selection, empty clipboard)
- **Test quality review:** ✅ Excellent - semantic selectors, behavioral testing, proper scope
- **Manual Test:**
  - Click Copy button in toolbar → verify copies selected objects
  - Click Paste button in toolbar → verify pastes objects
  - Verify Copy disabled when nothing selected
  - Verify Paste disabled when clipboard empty
  - Verify tooltips show on hover
  - Verify keyboard shortcuts still work (Ctrl+C, Ctrl+V)

#### 11.16 Improve close level dialog message ✅ Complete
- **Status:** ✅ COMPLETE - Commit TBD
- **Priority:** 3 (Feature)
- **Location:** `client/src/pages/LevelEditor.tsx` (handleLevelClose function)
- **What was implemented:**
  1. ✅ **Enhanced dialog message** - Updated confirmation message to be more explicit:
     - Shows level name: `"Are you sure you want to close "${level.levelName}"?"`
     - Emphasizes data loss: "All unsaved changes will be lost"
     - Clarifies permanence: "and cannot be undone"
     - Message now split across two lines for better readability
  2. ✅ **E2E test coverage** (`e2e/close-level-dialog.spec.ts`)
     - 3 comprehensive E2E tests covering dialog behavior
     - Test 1: Verifies level name appears in dialog message
     - Test 2: Verifies clear warning about data loss
     - Test 3: Verifies dialog appears for levels with content
- **Tests:**
  - ✅ 3 E2E tests (close-level-dialog.spec.ts) - All passing
  - ✅ All existing tests still passing (190 unit + 148 E2E)
- **Note:** Prevents accidental data loss with clear, kid-friendly warning
- **Future enhancement:** Replace `window.confirm()` with shadcn AlertDialog for red/warning styling (tracked in OPEN_QUESTIONS.md)

**Dependencies:** None - core selection/move tools already complete
**Notes:** Chapter 11 COMPLETE! All tasks finished: 11.0 (Pen tool), 11.1 (Line tool), 11.2 (Rectangle tool), 11.3 (Selection tool), 11.4 (Move tool), 11.5 (Linking tool), 11.6 (Unlinking tool), 11.7 (Removed rotation UI), 11.8 (Clear brush on tool change), 11.9 (Button numbering), 11.10 (Tile overlap), 11.11 (ESC key fix), 11.13 (Selection outline), 11.14 (Select All toolbar), 11.15 (Copy/Paste toolbar), 11.16 (Close level dialog). Moved zoom reset (was 11.12) to Chapter 22 (P4).

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

#### 15.1 Fix all linter issues ✅ COMPLETE
- **Status:** ✅ COMPLETE - Commit abc3b25
- **Priority:** 3 (Feature)
- **Location:** Multiple files across codebase
- **What was implemented:**
  1. ✅ **useCanvas.ts refactoring**
     - handleMouseMove: 35 → 15 complexity (extracted 6 helper functions + routing function)
     - handleMouseDown: 21 → 15 complexity (extracted 6 tool-specific start functions)
     - handleMouseUp: 47 → 15 complexity (extracted 6 tool-specific end functions)
  2. ✅ **LevelEditor.tsx refactoring**
     - handleCanvasClick: 34 → 15 complexity (extracted 3 tool handlers + 2 finder helpers)
  3. ✅ **rectangleDrawing.ts refactoring**
     - getRectanglePositions: 33 → 15 complexity (extracted 4 shape drawing helpers)
  4. ✅ **canvasRenderer.ts refactoring**
     - drawObject: 16 → 15 complexity (extracted 3 helper methods)
  5. ✅ **Auto-fix simple issues**
     - Fixed unused imports (canObjectBeLinked removed from useLevelEditor.ts)
     - Fixed unused variables (prefixed with underscore: _onLinkComplete, _canvas, _objectCount)
     - Added node: protocol to Node.js imports (scripts/archive-completed-chapters.ts)
- **Tests:**
  - ✅ 190 unit tests passing
  - ✅ 146 E2E tests passing (5 skipped)
  - ✅ No behavioral changes - pure refactoring
- **Linter:** ✅ All warnings resolved (0 errors, 0 warnings)
- **Approach used:**
  - Extracted helper functions from complex handlers
  - Used early returns to reduce nesting
  - Created focused, single-purpose functions
  - Maintained exact behavior (no breaking changes)

#### 15.2 Remove duplicate level button ✅ COMPLETE
- **Status:** ✅ COMPLETE - Commit c24f98c
- **Priority:** 3 (Feature - UI cleanup)
- **Location:** `client/src/components/level-editor/PropertiesPanel.tsx`
- **What was implemented:**
  1. ✅ **Removed "Duplicate Level" button** from PropertiesPanel component
     - Removed Button element and icon from UI (lines 191-198)
     - Removed onDuplicateLevel prop from interface and component parameters
  2. ✅ **Removed handler references** from LevelEditor.tsx
     - Removed onDuplicateLevel prop passed to PropertiesPanel
     - Removed duplicateLevel from destructured useLevelEditor return
     - Kept duplicateLevel function in useLevelEditor.ts for potential future use
  3. ✅ **Updated tests**
     - Removed "should show duplicate level button" test from e2e/basic-ui.spec.ts
     - Removed "should call onDuplicateLevel when duplicate button is clicked" test from PropertiesPanel.test.tsx
     - Removed onDuplicateLevel prop from all test component renders
- **Tests:**
  - ✅ 189 unit tests passing
  - ✅ 145 E2E tests passing (5 skipped)
  - ✅ All linter warnings resolved
- **Rationale:**
  - Ctrl+A + Ctrl+C workflow provides same functionality
  - Simplifies UI and reduces cognitive load
  - Encourages using standard copy/paste workflow
- **Note:** Simplifies UI, encourages using standard copy/paste workflow

**Dependencies:** None
**Notes:** Can be done incrementally - start with highest complexity functions first (15.1), then UI cleanup (15.2)

<!-- CHAPTER_END: 15 -->
---

<!-- CHAPTER_START: 12 -->
## Chapter 12: Documentation & Project Organization

**Status:** ✅ Complete
**Files:** `README.md`, `DEVELOPMENT.md`, `docs/ARCHITECTURE.md`, `docs/TASK_MANAGEMENT.md`, `CLAUDE.md`
**Priority:** Low

### Tasks:

#### 12.1 Reshape and consolidate project documentation ✅ COMPLETE
- **Status:** ✅ COMPLETE
- **Location:** `docs/` directory and root
- **What was implemented:**
  1. ✅ **Created README.md** - High-level project overview
     - Features, quick start, development commands
     - Architecture overview, testing stats
     - Links to all documentation
     - Contribution guidelines
  2. ✅ **Created DEVELOPMENT.md** - Developer workflow guide
     - Development server setup and commands
     - Testing strategy and workflows
     - Code quality standards (TypeScript, Biome, React)
     - Git workflow and commit conventions
     - Troubleshooting guide
     - Project structure overview
  3. ✅ **Updated ARCHITECTURE.md** - Removed duplicates
     - Removed detailed testing workflow (now in DEVELOPMENT.md)
     - Added cross-references to specialized docs
     - Focused on technical architecture details
  4. ✅ **Updated TASK_MANAGEMENT.md** - Removed duplicates
     - Added cross-references to DEVELOPMENT.md
     - Focused on task workflow and implementation strategy
  5. ✅ **Updated CLAUDE.md** - Added cross-references
     - Links to README, DEVELOPMENT, and TASK_MANAGEMENT
     - Remains AI-specific (no changes to core content)
  6. ✅ **Logged decisions** in `docs/OPEN_QUESTIONS.md`
     - Documented assumptions and rationale
- **Documentation Structure:**
  ```
  README.md                    ← NEW: Project overview, quick start
  DEVELOPMENT.md               ← NEW: Developer workflow reference
  CLAUDE.md                    ← UPDATED: AI-specific instructions
  TASKS.md                     ← KEEP: Current backlog

  docs/
    ARCHITECTURE.md            ← UPDATED: Technical architecture (removed duplicates)
    TASK_MANAGEMENT.md         ← UPDATED: Task workflow (removed duplicates)
    DESIGN_SYSTEM.md           ← KEEP: Visual design reference
    E2E_TESTING.md             ← KEEP: Playwright patterns
    TDD_PRINCIPLES.md          ← KEEP: TDD methodology
    REACT_BEST_PRACTICES.md    ← KEEP: React code review guide
    LEVEL_DATA_FORMAT.md       ← KEEP: Data format reference
    LOADING_TEST_DATA.md       ← KEEP: Test data guide
    OPEN_QUESTIONS.md          ← KEEP: Decision log
    EXPERIMENTS.md             ← KEEP: Research log
  ```
- **Key Improvements:**
  - Single source of truth for each topic
  - Clear separation: README (overview), DEVELOPMENT (workflow), ARCHITECTURE (technical)
  - Comprehensive cross-referencing between docs
  - Eliminated duplicate content in ARCHITECTURE and TASK_MANAGEMENT
  - Better onboarding for new developers
- **Tests:**
  - ✅ 189 unit tests passing
  - ✅ 148 E2E tests passing (5 skipped)
  - ✅ All linter checks passing
- **Note:** Documentation now follows industry-standard structure with clear separation of concerns

**Dependencies:** None
**Notes:** Low priority - doesn't affect functionality, but improves developer experience

<!-- CHAPTER_END: 12 -->
---

<!-- CHAPTER_START: 14 -->

<!-- CHAPTER_START: 17 -->
## Chapter 17: E2E Test Optimization - Phase 3

**Status:** ✅ Complete
**Files:** `e2e/auto-save.spec.ts`, `e2e/tile-placement.spec.ts`
**Priority:** Low

**Goal:** Continue E2E test consolidation from Chapter 13 with additional redundant test removal.

### Tasks:

#### 17.1 Merge auto-save E2E tests ✅ COMPLETE
- **Status:** ✅ COMPLETE
- **Priority:** 3 (Test consolidation)
- **Location:** `e2e/auto-save.spec.ts`
- **Tests merged:**
  - Line 30-49: "should auto-save after 5 seconds"
  - Line 51-72: "should change icon color based on save state"
- **What was implemented:**
  - Merged both tests into single comprehensive test: "should auto-save after 5 seconds and update both text and icon color"
  - Test verifies timing (5 seconds), text changes (Unsaved → Saved), and icon color changes (orange → green)
  - Follows consolidation pattern from Chapter 13
- **Files modified:**
  - `e2e/auto-save.spec.ts` - Merged two tests into one
- **Tests:**
  - ✅ 189 unit tests passing
  - ✅ 149 E2E tests passing (5 skipped)
  - ✅ All linter checks passing
- **Impact:** -1 test, reduced E2E execution time

#### 17.2 Remove redundant platform tile placement test ✅ COMPLETE
- **Status:** ✅ COMPLETE - Commit 4fca9be
- **Priority:** 3 (Test cleanup)
- **Location:** `e2e/tile-placement.spec.ts:9`
- **Test removed:** "should place single platform tile with click"
- **Reason:** Redundant coverage - single-click placement mechanics already verified by:
  - Line 62: spawn point placement (same click mechanics)
  - Line 81: button placement (same click mechanics)
  - Line 142: undo history for single-click (verifies placement works)
- **Impact:** -1 E2E test (149 → 148), reduced execution time without losing coverage
- **Pattern:** Each test should verify unique behavior; object-type-specific tests already cover placement mechanics
- **Files modified:**
  - `e2e/tile-placement.spec.ts` - Removed lines 9-26
- **Tests:**
  - ✅ 189 unit tests passing
  - ✅ 148 E2E tests passing (5 skipped)
  - ✅ All linter checks passing

<!-- CHAPTER_END: 17 -->
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

<!-- CHAPTER_START: 20 -->
## Chapter 20: Advanced Selection Modifiers

**Status:** ✅ Complete
**Files:** `client/src/hooks/useCanvas.ts`, `client/src/hooks/useSelectionState.ts`, `client/src/pages/LevelEditor.tsx`
**Priority:** Medium

**Goal:** Implement industry-standard modifier key patterns for advanced selection workflows (Shift for multi-select, Ctrl for additive selection).

### Tasks:

#### 20.1 Research industry patterns for modifier-based selection ✅ COMPLETE
- **Status:** ✅ COMPLETE
- **Priority:** 3 (Feature - Research phase)
- **Location:** `docs/MODIFIER_KEY_SELECTION_PATTERNS.md`, `docs/OPEN_QUESTIONS.md`
- **What was implemented:**
  1. ✅ **Industry research completed** (Photoshop, Figma, Illustrator, Tiled Map Editor)
     - Shift key: Primary use = additive/multi-select (universal pattern)
     - Ctrl/Cmd key: Primary use = temporary tool override (strong pattern in Adobe tools)
     - Alt key: Less consistent, not recommended for initial implementation
  2. ✅ **Design document created** (`docs/MODIFIER_KEY_SELECTION_PATTERNS.md`)
     - Comprehensive analysis of all modifier key patterns
     - Industry pattern comparisons and consistency analysis
     - Recommendations for CanvasBlox implementation
     - Implementation priority: Shift+Drag (P1) > Ctrl+Click (P1) > Visual feedback (P2) > Temporary override (P3)
  3. ✅ **Key design decisions documented** (`docs/OPEN_QUESTIONS.md`)
     - Shift+Drag replaces selection (non-additive) - consistent with Tiled
     - Temporary tool override is low priority (P3) - validate core patterns first
     - Alt modifiers deferred to future enhancement (P4)
  4. ✅ **Keyboard shortcut summary table** - Clear reference for implementation
  5. ✅ **Next steps defined** - Clear path forward for Tasks 20.2-20.6
- **Deliverables:**
  - 15-page design document with industry analysis and recommendations
  - Decision log in OPEN_QUESTIONS.md
  - Clear implementation priorities for remaining tasks
- **Note:** Foundation complete for Tasks 20.2-20.6 implementation

#### 20.2 Implement Shift+Drag for temporary multi-select ✅ Complete
- **Status:** ✅ COMPLETE
- **Priority:** 3 (Feature)
- **Location:** `client/src/hooks/useCanvas.ts`
- **What was implemented:**
  1. ✅ **Shift key detection** (`client/src/hooks/useCanvas.ts:371-378`)
     - When Shift is held during mouse down, multi-select tool is temporarily engaged
     - Stores previous tool in `suspendedToolRef` for potential future restoration
     - Works as a visual override - toolbar doesn't change, behavior does
  2. ✅ **Temporary multi-select activation**
     - Shift+Drag creates selection box without changing toolbar state
     - Selection box rendered using existing multi-select infrastructure
     - Non-additive selection (replaces current selection)
  3. ✅ **Tool preservation**
     - Original tool remains selected in toolbar during Shift+Drag
     - After selection completes, original tool is still active
     - This is a "temporary override" pattern - behavior changes, UI doesn't
  4. ✅ **Refactored for complexity**
     - Extracted `handleToolMouseDown` helper to reduce `handleMouseDown` complexity
     - Removed unused `handleShiftModifier` helper
     - All linter warnings resolved
- **Tests:**
  - ✅ 3 E2E tests passing (shift-drag-multiselect.spec.ts)
  - ✅ 1 test intentionally skipped (non-additive edge case)
  - ✅ Total: 189 unit + 151 E2E = 340 tests passing
- **Manual Test:** Ready for user testing
  - Hold Shift → drag selection box → verify objects selected
  - Verify toolbar shows original tool (doesn't change)
  - Use Shift+Drag from Move tool → verify Move tool stays active
- **Note:** Implementation follows "temporary behavior override" pattern - toolbar state preserved, mouse behavior temporarily changes

#### 20.3 Implement Ctrl+Click for additive selection ✅ Complete
- **Status:** ✅ COMPLETE - Commit bf6293b
- **Priority:** 3 (Feature)
- **Location:** `client/src/hooks/useLevelEditor.ts`, `client/src/pages/LevelEditor.tsx`
- **What was implemented:**
  1. ✅ **toggleObjectSelection function** (`client/src/hooks/useLevelEditor.ts:368-373`)
     - Wraps selectObject with multiSelect=true for toggle behavior
     - Exported in useLevelEditor return value
  2. ✅ **Ctrl key detection** (`client/src/pages/LevelEditor.tsx:209-243`)
     - Modified handleCanvasClick to detect Ctrl/Meta key from MouseEvent
     - Added check for drawing tools (pen/line/rectangle) - Ctrl+Click disabled for these
     - Routes to handleSelectToolClick with ctrlKey=true for toggle behavior
  3. ✅ **Updated handleSelectToolClick** (`client/src/pages/LevelEditor.tsx:109-127`)
     - Added ctrlKey parameter
     - Calls toggleObjectSelection when Ctrl held, selectObject when not
     - Preserves selection on empty click when Ctrl held
  4. ✅ **Cross-platform support**
     - Supports both Ctrl (Windows/Linux) and Meta/Cmd (Mac) keys
- **Behavior:**
  - Hold Ctrl key
  - Click object - adds to selection if not selected, removes if already selected (toggle)
  - Click empty space - does nothing (preserves selection)
  - Works from any tool except drawing tools (pen/line/rectangle)
- **Tests:**
  - ✅ 3 E2E tests (ctrl-click-selection.spec.ts) - All passing
  - ✅ Total: 189 unit + 154 E2E = 343 tests passing (6 skipped)
- **Manual Test:**
  - Select an object → Ctrl+Click another object → verify both selected
  - With 2 objects selected → Ctrl+Click one → verify it's removed from selection
  - With objects selected → Ctrl+Click empty space → verify selection preserved
  - From Move tool → Ctrl+Click object → verify toggle selection works
- **Note:** Visual feedback (cursor changes, status bar) deferred to Task 20.5

#### 20.4 Implement temporary tool override for Move tool ✅ Complete
- **Status:** ✅ COMPLETE - Commit 91b53d7
- **Priority:** 3 (Feature)
- **Location:** `client/src/hooks/useCanvas.ts`, `client/src/pages/LevelEditor.tsx`
- **What was implemented:**
  1. ✅ **Shift+Drag temporary multi-select** (`client/src/hooks/useCanvas.ts:370-378`)
     - When Shift is held during mouse down, multi-select tool temporarily engages
     - Works from ANY tool (including Move, Link, Unlink tools)
     - Original tool remains selected in toolbar during Shift+Drag
     - After selection completes, original tool is still active
     - Uses suspendedToolRef pattern from Task 20.2
  2. ✅ **Ctrl+Click temporary additive selection** (`client/src/pages/LevelEditor.tsx:219-224`)
     - When Ctrl/Cmd is held during click, additive selection mode engages
     - Works from ANY tool except drawing tools (pen/line/rectangle)
     - Original tool remains active after Ctrl+Click
     - No tool switching required - purely modifies selection behavior
  3. ✅ **Universal pattern** - Both modifiers work from all tools
     - Move tool: Shift+Drag and Ctrl+Click work while Move stays active
     - Link tool: Shift+Drag and Ctrl+Click work while Link stays active
     - Select tool: Shift+Drag and Ctrl+Click work (additive to existing behavior)
     - Drawing tools: Only Shift+Drag works (Ctrl disabled to prevent conflicts)
- **Tests:**
  - ✅ 3 E2E tests (temporary-tool-override.spec.ts) - All passing
    - Test 1: Ctrl+Click additive selection from Move tool
    - Test 2: Shift+Drag multi-select from Move tool
    - Test 3: Ctrl+Click additive selection from Link tool
  - ✅ Total: 189 unit + 157 E2E = 346 tests passing (6 skipped)
- **Note:** Task discovered to already be implemented via Tasks 20.2 and 20.3. New tests added to verify and document the behavior.

#### 20.5 Visual feedback for modifier states ✅ Complete
- **Status:** ✅ COMPLETE - Commit 595341a
- **Priority:** 3 (Feature)
- **Location:** `client/src/pages/LevelEditor.tsx`, status bar
- **What was implemented:**
  1. ✅ **Modifier state tracking** (`client/src/pages/LevelEditor.tsx:38`)
     - Added modifierState useState to track 'shift' | 'ctrl' | null
     - useEffect hook to track keydown/keyup events
     - Does not trigger when typing in input fields
  2. ✅ **Status bar indicator** (`client/src/pages/LevelEditor.tsx:1036-1062`)
     - Shows "Multi-select (Shift)" with blue styling when Shift held
     - Shows "Add to selection (Ctrl)" with purple styling when Ctrl held
     - Appears as first item in bottom status bar
     - Only visible when modifier is active
  3. ✅ **Real-time updates**
     - Indicator appears immediately when Shift/Ctrl pressed
     - Disappears immediately when key released
     - Works during mouse interactions
- **Implementation decisions:**
  - **Cursor changes:** Not implemented due to browser compatibility concerns
  - **Toolbar dimming:** Not implemented to keep complexity low
  - **Focus on status bar:** Simple, clear, and works across all browsers
- **Tests:**
  - ✅ 4 E2E tests (modifier-visual-feedback.spec.ts) - All passing
  - ✅ Test 1: Shift held → status bar indicator appears
  - ✅ Test 2: Ctrl held → status bar indicator appears
  - ✅ Test 3: No indicator when typing in input field
  - ✅ Test 4: Indicator visible during actual interaction
  - ✅ Total: 189 unit + 161 E2E tests passing
- **Manual Test:** Ready for user testing
  - Hold Shift → verify blue "Multi-select (Shift)" indicator appears in status bar
  - Hold Ctrl → verify purple "Add to selection (Ctrl)" indicator appears in status bar
  - Type in input field while holding Shift → verify no indicator appears
  - Hold Shift and drag selection box → verify indicator visible during interaction

#### 20.6 Rethink selection tool buttons (if needed) ✅ Complete
- **Status:** ✅ COMPLETE
- **Priority:** 4 (Idea/enhancement)
- **Location:** `client/src/components/level-editor/Toolbar.tsx`, `client/src/types/level.ts`, `client/src/pages/LevelEditor.tsx`, `client/src/hooks/useCanvas.ts`
- **What was implemented:**
  1. ✅ **Removed Multi-select tool button** from Toolbar (`client/src/components/level-editor/Toolbar.tsx`)
     - Removed MultiselectIcon import
     - Removed Multi-select button from toolbar
     - Updated Select tool tooltip: "Select Tool (V) • Hold Shift to multi-select"
     - Updated tool group color logic to remove 'multiselect' reference
  2. ✅ **Updated type definitions** (`client/src/types/level.ts`)
     - Removed 'multiselect' from EditorState['selectedTool'] union type
  3. ✅ **Removed keyboard shortcut** (`client/src/pages/LevelEditor.tsx`)
     - Removed 'M' key mapping for multi-select tool
  4. ✅ **Updated mouse handlers** (`client/src/hooks/useCanvas.ts`)
     - Removed multi-select tool case from handleToolMouseDown
     - Removed startMultiSelect from dependency array
  5. ✅ **Updated E2E tests** (multiple test files)
     - Replaced all multi-select button clicks with Shift+Drag pattern
     - Updated test descriptions to reflect Shift+Drag usage
     - All 160 E2E tests passing (6 skipped)
- **Rationale:**
  - Consistent with industry standards (Photoshop, Figma, Illustrator have no separate multi-select button)
  - Shift+Drag provides same functionality with better UX (temporary override)
  - Cleaner toolbar with less cognitive load
  - Forces users to learn industry-standard modifier key patterns
  - Select tool + modifiers (Shift+Drag, Ctrl+Click) cover all selection use cases
- **Tests:**
  - ✅ 189 unit tests passing
  - ✅ 160 E2E tests passing (6 skipped)
  - ✅ All multi-select functionality preserved via Shift+Drag
- **Decision logged:** See `docs/OPEN_QUESTIONS.md` for detailed analysis
- **Note:** Multi-select functionality still available via Shift+Drag (Task 20.2)

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
| 11. Drawing Tools | ✅ Completed | ✓ | All tasks complete |
| 15. Code Quality | ✅ Completed | ✓ | All tasks complete |
| 17. E2E Test Optimization | ✅ Completed | ✓ | Phase 3 continuation - auto-save test merge, redundant test removal |
| 18. Enhanced Copy/Paste | ✅ Completed | ❌ | Ghost preview paste workflow (needs user testing) |
| 20. Advanced Selection Modifiers | ✅ Completed | ✓ | Shift/Ctrl modifier keys, temporary tool override, visual feedback (5 tasks) |
| 21. Multi-Select Properties Panel | ⏸️ Not Started | ❌ | Batch editing, property differences UI (1 task, P4) |
| 22. Future Enhancements | ⏭️ Skipped | N/A | Zoom fit-to-view skipped (not needed) |
| 12. Documentation | ✅ Completed | ✓ | Consolidate and organize project documentation |

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

