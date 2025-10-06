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
- **Priority:** 3 (Feature)
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

#### 11.9 Implement button numbering system ⏸️ Not Started
- **Location:** `client/src/utils/canvasRenderer.ts`, `client/src/types/level.ts`, `client/src/components/level-editor/PropertiesPanel.tsx`
- **Current:** Buttons have no visual identification system - hard to track which button links to which door
- **Purpose:** Add auto-numbered badges to buttons and doors so users can visually identify puzzle connections
- **Status:** ⏸️ Not Started
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

#### 11.12 Enhance zoom reset to fit all content
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
- **Note:** Makes zoom reset more intelligent and useful for level design workflow

#### 11.13 Improve selection outline visibility on blue backgrounds
- **Priority:** 3 (Feature)
- **Location:** `client/src/utils/canvasRenderer.ts` - selection rendering
- **Current:** Selection outline around tiles not visible when background is blue (default background color)
- **Change:** Implement higher contrast selection indicator that works on any background color
- **Implementation:**
  - Consider white outline with dark border/stroke for maximum contrast
  - Or implement adaptive color based on background (similar to button numbering system Task 11.9.2)
  - Make selection outline thicker/bolder for better visibility
  - Test on various background colors (blue, red, black, white)
- **Files to modify:**
  - `client/src/utils/canvasRenderer.ts` - Update selection rendering logic
- **Tests:**
  - E2E test: Select object on blue background → verify outline visible
  - E2E test: Select object on various backgrounds → verify contrast
- **Note:** Critical for usability - users need to see what's selected

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
**Notes:** 13 tasks remaining (was 8, added 5 from inbox). Priority: Tile overlap (11.10), Link/Unlink tools (11.5-11.6), Drawing tools (11.1-11.2), Button numbering (11.9), Rotation decision (11.7), Zoom fit-to-view (11.12), UI improvements (11.13-11.16)

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
| 11. Drawing Tools | 🔄 In Progress | ❌ | 5/17 complete, 12 tasks remaining (added 5 UI tasks from inbox) |
| 15. Code Quality | ⏸️ Not Started | ❌ | Refactor complex functions, UI cleanup (2 tasks) |
| 17. E2E Test Optimization | ⏸️ Not Started | ❌ | Phase 3 continuation - auto-save test merge |
| 18. Enhanced Copy/Paste | ⏸️ Not Started | ❌ | Ghost preview paste workflow |
| 20. Advanced Selection Modifiers | ⏸️ Not Started | ❌ | Shift/Ctrl modifier keys, temporary tool override (6 tasks) |
| 21. Multi-Select Properties Panel | ⏸️ Not Started | ❌ | Batch editing, property differences UI (1 task, P4) |
| 12. Documentation | ⏸️ Not Started | ❌ | Consolidate and organize project documentation |

**Legend:**
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Completed
- ✓ Approved

---

## Next Steps

**Recommended Priority Order:**

1. **Chapter 11: Drawing Tools** (5/12 complete, 7 remaining)
   - Core feature implementation
   - Tasks: Tile overlap, Link/Unlink, Line/Rectangle, Button numbering, Rotation

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

