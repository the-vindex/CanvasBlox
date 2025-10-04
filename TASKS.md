# Visual Enhancement Roadmap - Roblox Level Designer

**Status:** In Progress
**Current Chapter:** Chapter 8 - Not Started
**Last Updated:** 2025-10-04

---

## Implementation Strategy

Work through chapters sequentially. After implementing each chapter:
1. User reviews the changes
2. User provides approval or feedback
3. Move to next chapter only after approval
4. Commit changes after each approved chapter

---

## Completed Chapters (1-8)

✅ Chapter 1: Enhanced Header & Branding
✅ Chapter 2: Modern Toolbar
✅ Chapter 3: Enhanced Canvas Experience
✅ Chapter 4: Impressive Tile Palette
❌ Chapter 5: Polished Properties Panel (Skipped)
❌ Chapter 6: Level Tabs Enhancement (Skipped)
✅ Chapter 7: Animations & Micro-interactions
✅ Chapter 8: Color & Theme (Minimized - shadow system only)

---


## Chapter 8: Color & Theme Enhancements

**Status:** ✅ Completed (Minimized)
**Files:** `tailwind.config.ts`, `client/src/components/level-editor/TilePalette.tsx`
**Priority:** High → Low (minimized to avoid visual overload)

### Tasks:

#### 8.1 Gradient accents
- **Status:** ❌ Skipped - Header gradient sufficient

#### 8.2 Glow effects
- **Status:** ❌ Skipped - Existing glows sufficient

#### 8.3 Glassmorphism
- **Status:** ❌ Skipped - Already applied where needed

#### 8.4 Layered shadow system
- **Status:** ✅ Completed - Custom dark-optimized shadows in tailwind.config.ts

#### 8.5 Tile card border fix (bonus)
- **Status:** ✅ Completed - Added border-white/10 for edge clarity

**Dependencies:** None
**Notes:** See git commits 83c9d57 and e4d3dd6 for implementation details

---

## Chapter 9: Context & Feedback

**Status:** ⏸️ Not Started
**Files:** Multiple
**Priority:** Medium

### Tasks:

#### 9.0 Remove line and rectangle tool buttons (not implemented)
- **Location:** `client/src/components/level-editor/Toolbar.tsx`
- **Search for:** Line tool button ('l' key), Rectangle tool button ('r' key)
- **Remove:** Both buttons and their keyboard shortcuts from LevelEditor.tsx
- **Note:** These features are not implemented, so buttons should be removed

#### 9.1 Action history panel (collapsible sidebar)
- **Location:** New component, positioned on right or bottom
- **Data:** Use existing history/historyIndex from useLevelEditor
- **Display:** List of actions with timestamps
- **Features:** Click to jump to that history state
- **Collapsible:** Slide in/out animation

#### 9.2 Quick tips: Contextual help bubbles
- **Location:** Various UI elements
- **Implementation:** Tooltip component or info icons
- **Content:** Brief tips for new users
- **Examples:**
  - "Drag with middle mouse to pan"
  - "Press V for select tool"
  - "Link buttons to doors with K"

#### 9.3 Remove "snap to grid" feature
- **Search for:** "snap", "grid snap", "snapToGrid"
- **Files to check:**
  - EditorState type definition
  - Any grid-related logic
  - UI controls for grid snap
  - Keyboard shortcuts
- **Remove:** All code and UI related to grid snapping

#### 9.4 Fix redo functionality - changes not properly restored
- **Location:** `client/src/hooks/useLevelEditor.ts` - redo function (line ~102-112)
- **Current:** Redo button/shortcut doesn't properly restore the state - changes are not applied
- **Bug:** When redo is triggered, the level state is not visually updated on canvas
- **Investigation needed:**
  - Check if history state is being correctly retrieved
  - Verify levelData is being properly updated in state
  - Ensure canvas re-renders after redo
  - Compare with undo implementation which works correctly
- **Files to check:**
  - `client/src/hooks/useLevelEditor.ts` (redo function)
  - `client/src/pages/LevelEditor.tsx` (redo button handlers)
- **Note:** Bug reported by user - redo doesn't restore changes as expected

#### 9.5 Group consecutive tile placements as single undo/redo action
- **Location:** `client/src/hooks/useLevelEditor.ts` - addTile function and history management
- **Current:** Each tile placed adds a separate history entry, making undo/redo tedious when drawing multiple tiles
- **Change:** When user drags to place multiple tiles in one continuous action, group them as a single history entry
- **Implementation:**
  - Track "drawing session" - starts on mousedown, ends on mouseup
  - Buffer tile additions during drawing session
  - Add single history entry when session ends with all tiles added
  - Apply same logic to addObject function for consistency
- **Files to check:**
  - `client/src/hooks/useLevelEditor.ts` (addTile, addObject, addToHistory)
  - `client/src/hooks/useCanvas.ts` (mouse event handlers)
  - `client/src/pages/LevelEditor.tsx` (handleTilePlaced)
- **Note:** User improvement request - better UX for drawing multiple tiles

#### 9.6 Auto-increment level names to avoid duplicates
- **Location:** `client/src/hooks/useLevelEditor.ts` - addNewLevel function
- **Current:** Adding new level always creates "New Level" - duplicates cause confusion
- **Change:** Check if "New Level" exists, if so create "New Level 2", "New Level 3", etc.
- **Implementation:**
  - In addNewLevel function, check existing level names
  - Search for pattern "New Level", "New Level 2", "New Level 3", etc.
  - Find highest number and increment by 1
  - If no "New Level" exists, use "New Level" (no number)
- **Logic:**
  ```typescript
  const existingNames = levels.map(l => l.levelName);
  let counter = 0;
  let newName = "New Level";
  while (existingNames.includes(newName)) {
    counter++;
    newName = `New Level ${counter}`;
  }
  ```
- **Files to modify:**
  - `client/src/hooks/useLevelEditor.ts` (addNewLevel function)
- **Note:** User improvement request - prevents duplicate level names

#### 9.7 Add close/collapse functionality to Properties Panel
- **Location:** `client/src/components/level-editor/PropertiesPanel.tsx`
- **Current:** Properties panel is always visible and takes up right sidebar space
- **Change:** Add close/collapse button to properties panel header, allow users to hide it for more canvas space
- **Implementation options:**
  1. **Full close:** Hide panel completely, show small ">" button to reopen
  2. **Collapse:** Minimize to thin vertical bar with icon, click to expand
  3. **Toggle button in header:** X button in panel header to close, reopen from toolbar or keyboard shortcut
- **Recommended approach:** Option 3 (toggle button)
- **Implementation:**
  - Add state to track panel visibility: `const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);`
  - Add X/close button to PropertiesPanel header
  - Conditionally render panel based on state
  - Add reopen button in main toolbar or use keyboard shortcut (e.g., 'P' key)
  - Persist preference in localStorage (optional)
- **Files to modify:**
  - `client/src/components/level-editor/PropertiesPanel.tsx` (add close button)
  - `client/src/pages/LevelEditor.tsx` (manage panel visibility state)
- **Note:** User improvement request - more canvas space when properties not needed

#### 9.8 Bug: Deactivate tool when choosing tile for placement
- **Location:** `client/src/pages/LevelEditor.tsx` - handleTileSelect function
- **Current:** When user selects a tile from the palette, any active tool (select, move, link, etc.) remains active
- **Bug:** This causes confusion - user expects to enter "placement mode" but tool is still active
- **Expected behavior:** Selecting a tile from palette should automatically switch to placement mode and deactivate any active tool
- **Implementation:**
  - In handleTileSelect function, clear selectedTool by setting it to null or a default state
  - Alternatively, set selectedTool to a dedicated 'place' tool mode
  - Ensure tool buttons visually deselect when tile is chosen
- **Files to modify:**
  - `client/src/pages/LevelEditor.tsx` (handleTileSelect function around line 63-65)
  - May need to update `client/src/types/level.ts` if adding a 'place' tool type
- **Note:** User reported bug - improves UX consistency

**Dependencies:** 9.3 should be done first
**Notes:** Make editor more discoverable for new users

---

## Chapter 10: Special Effects

**Status:** ⏸️ Not Started
**Files:** `client/src/index.css`, `client/src/components/level-editor/Canvas.tsx`, `client/src/hooks/useCanvas.ts`
**Priority:** Low

### Tasks:

#### 10.1 Parallax effect on background grid when panning
- **Location:** useCanvas hook - pan handler
- **Implementation:** Background moves slower than canvas content
- **Math:** Background offset = pan offset * 0.5 (or other factor)
- **Apply to:** Canvas wrapper background-position

#### 10.2 Glow pulse on selected objects
- **Location:** Canvas rendering - selected objects
- **Implementation:** CSS animation or canvas-based glow
- **Effect:** Subtle pulsing glow around selection
- **Keyframe:** Opacity oscillates between 0.6 and 1.0

#### 10.3 Trail effect when dragging objects
- **Location:** Canvas during drag operation
- **Implementation:** Draw semi-transparent copies along drag path
- **Effect:** Motion blur / trail effect
- **Clear:** Trail fades out on drop

#### 10.4 Scanline effect for retro/tech aesthetic (optional toggle)
- **Location:** Canvas overlay
- **Implementation:** CSS pseudo-element with repeating gradient
- **Toggle:** State variable in EditorState
- **UI:** Checkbox in settings or view menu
- **Effect:** Subtle horizontal lines moving slowly

**Dependencies:** None
**Notes:** These are polish effects - keep subtle and performant

---

## Chapter 11: Drawing Tools Implementation

**Status:** ⏸️ Not Started
**Files:** `client/src/hooks/useCanvas.ts`, `client/src/pages/LevelEditor.tsx`, `client/src/hooks/useLevelEditor.ts`
**Priority:** High

### Tasks:

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
- **Note:** Tool button already exists but functionality is missing

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
- **Note:** Tool button already exists but functionality is missing

#### 11.3 Implement selection tool (single select)
- **Location:** `client/src/hooks/useCanvas.ts` - mouse event handlers
- **Current:** Selection tool button exists in toolbar ('v' key) but does nothing when activated
- **Implementation:**
  - On click: Detect which object (tile/interactable/spawn) is at click position
  - Select the clicked object and highlight it with selection outline
  - Deselect previous selection if no modifier key pressed
  - Update editorState.selectedObjects array
  - Show selected object properties in PropertiesPanel
- **Hit detection needed:**
  - Check tiles array for position match
  - Check objects array for position match
  - Check spawnPoints array for position match
  - Consider object layer/z-index for overlapping objects
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` (add click detection logic)
  - `client/src/hooks/useLevelEditor.ts` (selectObject function may need updates)
  - `client/src/utils/canvasRenderer.ts` (selection outline already exists)
- **Note:** Tool button already exists but functionality is missing - critical for basic editor usage

#### 11.4 Implement move tool and rethink selection/move interaction UX
- **Location:** `client/src/hooks/useCanvas.ts` - mouse event handlers
- **Current:** Move tool button exists in toolbar ('h' key) but does nothing when activated
- **UX Design needed - consider these interaction patterns:**
  1. **Separate move mode:** Move tool active → click object to grab → drag to move → click to drop
  2. **Drag in selection mode:** Selection tool → click to select → drag selected to move (no separate move tool)
  3. **Modifier key:** Selection tool → hold modifier (Alt/Shift) + drag to move selected
- **Issues to resolve:**
  - When should selection be cancelled? (Click empty space? Press Escape? Switch tools?)
  - How to distinguish between click-to-select vs drag-to-move?
  - Should moving update selection or maintain it?
  - Multi-select move: move all selected objects together with relative positions preserved
- **Implementation considerations:**
  - Track drag start position and current drag offset
  - Show ghost/preview of objects at new position during drag
  - Snap to grid during move (optional)
  - Update object positions on drag end
  - Add to undo/redo history as single action
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` (add move/drag logic)
  - `client/src/hooks/useLevelEditor.ts` (add moveObjects function)
  - `client/src/utils/canvasRenderer.ts` (may need drag preview rendering)
- **Note:** Needs UX design decision before implementation - critical for editor usability

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

#### 11.8 Fix: Switching to selection tool should clear active brush/placement tool
- **Location:** `client/src/pages/LevelEditor.tsx` - handleToolChange function
- **Current:** When user has a tile type selected (brush mode) and switches to selection tool, the brush remains active
- **Bug:** Clicking to select an object may instead place the active brush tile
- **Expected behavior:** Switching to any non-placement tool (select, multiselect, move, link) should immediately clear `editorState.selectedTileType`
- **Implementation:**
  - In handleToolChange function, check if new tool is 'select', 'multiselect', 'move', or 'link'
  - If so, also call `setEditorState(prev => ({ ...prev, selectedTileType: null }))`
  - This ensures brush preview disappears and selection/move modes work as expected
- **Files to modify:**
  - `client/src/pages/LevelEditor.tsx` (handleToolChange function)
  - May also need updates in `client/src/components/level-editor/TilePalette.tsx` to deselect tile visually
- **Note:** Bug reported by user - affects basic workflow when switching between placing and selecting

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

**Dependencies:** Task 11.3 (selection) should be implemented first if keeping rotation for selected objects
**Notes:** All tools exist in UI but have no implementation - high priority for usability

---

## Chapter 12: Documentation & Project Organization

**Status:** ⏸️ Not Started
**Files:** `replit.md`, `CLAUDE.md`, `DESIGN_SYSTEM.md`, various `.md` files
**Priority:** Low

### Tasks:

#### 12.1 Reshape and consolidate project documentation
- **Location:** Root directory - `replit.md`, `CLAUDE.md`, `DESIGN_SYSTEM.md`, and other .md files
- **Current:** Multiple documentation files with overlapping content:
  - `replit.md` - Original Replit-generated architecture docs
  - `CLAUDE.md` - Development guidelines for Claude Code
  - `DESIGN_SYSTEM.md` - Design system and visual decisions
  - `VISUAL_ENHANCEMENTS.md` - Task roadmap
- **Goal:** Organize into coherent, well-structured documentation
- **Proposed structure:**
  - `README.md` - Project overview, quick start, high-level architecture
  - `ARCHITECTURE.md` - Technical architecture, data flow, key patterns
  - `DESIGN_SYSTEM.md` - Visual design system (already exists, may need updates)
  - `DEVELOPMENT.md` - Development workflow, commands, conventions
  - `CLAUDE.md` - Keep for Claude Code specific instructions
  - Archive or merge `replit.md` content as appropriate
- **Tasks:**
  - Audit all existing .md files for content overlap
  - Extract duplicate/conflicting information
  - Reorganize into logical sections
  - Ensure single source of truth for each topic
  - Update cross-references between docs
- **Files to review:**
  - `replit.md`, `CLAUDE.md`, `DESIGN_SYSTEM.md`, `VISUAL_ENHANCEMENTS.md`
  - Any other .md files in root
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
| 8. Color & Theme | ✅ Completed | ✓ Minimized | Shadow system only - skipped decoration for performance/clarity |
| 9. Context & Feedback | ⏸️ Not Started | ❌ | History panel, tooltips, bug fixes, UX improvements |
| 10. Special Effects | ⏸️ Not Started | ❌ | Parallax, glow pulse, trail effects, scanlines |
| 11. Drawing Tools | ⏸️ Not Started | ❌ | Line, rectangle, selection, move, linking tools implementation |
| 12. Documentation | ⏸️ Not Started | ❌ | Consolidate and organize project documentation |

**Legend:**
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Completed
- ✓ Approved

---

## Next Steps

**Current:** Chapter 9 - Context & Feedback (RECOMMENDED NEXT)
- 🐛 Fix redo functionality bug
- 🎯 Group consecutive tile placements for better undo/redo
- 📝 Auto-increment level names to avoid duplicates
- 🧹 Remove unimplemented tool buttons (line/rectangle)
- 🎨 Add close/collapse to Properties Panel
- 📚 Action history panel (optional)
- 💡 Quick tips/tooltips (optional)

**Alternative:** Chapter 11 - Drawing Tools Implementation (CRITICAL FUNCTIONALITY)
- Implement selection tool (currently broken!)
- Implement move tool (currently broken!)
- Implement linking tool (currently broken!)
- Fix: Clear brush when switching to selection tool

**May Skip:** Chapter 10 - Special Effects (low priority polish)

---

## Notes & Decisions

_(Add notes here as implementation progresses)_

