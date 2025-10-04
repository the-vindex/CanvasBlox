# Visual Enhancement Roadmap - Roblox Level Designer

**Status:** In Progress
**Current Chapter:** Chapter 7 - Completed & Approved
**Last Updated:** 2025-10-04

---

## Implementation Strategy

Work through chapters sequentially. After implementing each chapter:
1. User reviews the changes
2. User provides approval or feedback
3. Move to next chapter only after approval
4. Commit changes after each approved chapter

---

## Chapter 1: Enhanced Header & Branding

**Status:** ✅ Completed - Reviewed ✓
**Files:** `client/src/pages/LevelEditor.tsx`, `client/src/index.css`
**Priority:** High

### Tasks:

#### 1.1 Add gradient background to header with Roblox-inspired colors
- **Location:** `client/src/pages/LevelEditor.tsx` - Header element (line ~184)
- **Current:** `className="bg-card border-b border-border..."`
- **Change:** Add gradient background using Roblox red (#E4261F) to blue
- **CSS:** Add custom gradient class in `index.css`
- **Example:** `bg-gradient-to-r from-red-600 via-purple-600 to-blue-600`

#### 1.2 Larger, more prominent logo/title with icon animation on hover
- **Location:** `client/src/pages/LevelEditor.tsx` - h1 element (line ~186-189)
- **Current:** `text-xl font-bold text-primary`
- **Change:** Increase to `text-2xl` or `text-3xl`, add hover animation to icon
- **CSS:** Add icon rotation/scale animation on hover

#### 1.3 Reorganize file operations with dropdown menus
- **Location:** File operations section (line ~192-233)
- **Current:** All buttons visible inline
- **Change:** Group into dropdown menu component
- **Component:** May need to create or use shadcn DropdownMenu

#### 1.4 Add subtle glow effects around active elements
- **CSS:** Add box-shadow with primary color glow
- **Example:** `box-shadow: 0 0 20px rgba(59, 130, 246, 0.3)`

#### 1.5 Status bar showing save status, object counts, performance metrics
- **Location:** Add new section in header (right side)
- **Data needed:**
  - Auto-save status from localStorage
  - Object counts from `currentLevel.tiles.length + currentLevel.objects.length + currentLevel.spawnPoints.length`
- **Design:** Small badges/pills with icons

**Dependencies:** None
**Notes:** Focus on making header visually striking while maintaining functionality

---

## Chapter 2: Modern Toolbar

**Status:** ✅ Completed - Reviewed ✓
**Files:** `client/src/components/level-editor/Toolbar.tsx`, `client/src/index.css`
**Priority:** High

### Tasks:

#### 2.1 Group tools with visual separators and labels (non-collapsible)
- **Location:** `Toolbar.tsx` - Current dividers at lines 62, 69, 103
- **Current:** Simple `<div className="w-px h-6 bg-border"></div>` separators
- **Change:** Add labeled sections above each tool group
- **Example:** "Selection Tools", "Drawing Tools", "Object Tools"
- **Design:** Small uppercase labels with muted color

#### 2.2 Animated tool selection with smooth transitions
- **Location:** ToolButton component (line ~28-52)
- **Current:** Basic transition on className change
- **Add:** Scale animation, smooth color transition
- **CSS:** `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

#### 2.3 Glassmorphism effect for toolbar background
- **Location:** Main toolbar div (line ~55)
- **Current:** `bg-card`
- **Change:** Semi-transparent background with backdrop blur
- **CSS:** `bg-card/80 backdrop-blur-md`

#### 2.4 Color-coded tool groups
- **Selection tools:** Blue (`bg-blue-600`)
- **Drawing tools:** Green (`bg-green-600`)
- **Linking tools:** Purple (`bg-purple-600`)
- **Apply to:** Active state background color

#### 2.5 Active tool gets accent glow and border animation
- **CSS:** Add box-shadow glow matching tool group color
- **Animation:** Pulsing glow or subtle scale

**Dependencies:** None
**Notes:** Toolbar should feel modern and provide clear visual feedback

---

## Chapter 3: Enhanced Canvas Experience

**Status:** ✅ Completed - Reviewed ✓
**Files:** `client/src/components/level-editor/Canvas.tsx`, `client/src/index.css`, `client/src/utils/levelSerializer.ts`, `client/src/utils/canvasRenderer.ts`
**Priority:** High

### Tasks:

#### 3.1 Nice default background (Mario-style or familiar game aesthetic)
- **Location:** Canvas wrapper background (currently in `.canvas-wrapper` CSS)
- **Current:** Grid pattern with dark background
- **Options:**
  - Sky blue gradient with clouds
  - Classic platformer sky (light blue top, darker bottom)
  - Pixel art style background
- **User preference:** "Mario style or something common non-gamer user would appreciate"
- **Implementation:** CSS gradient or repeating pattern

#### 3.2 Drop shadow under canvas for depth
- **Location:** Canvas element styling
- **CSS:** `box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3)`

#### 3.3 Corner vignette to focus attention on center
- **Location:** Canvas wrapper overlay
- **CSS:** Add pseudo-element with radial gradient
- **Example:** `radial-gradient(circle, transparent 60%, rgba(0,0,0,0.4) 100%)`

**Dependencies:** None
**Notes:** Background should be inviting and familiar, not intimidating

---

## Chapter 4: Impressive Tile Palette

**Status:** ✅ Completed - Reviewed ✓
**Files:** `client/src/components/level-editor/TilePalette.tsx`, `client/src/utils/canvasRenderer.ts`
**Priority:** Medium

### Tasks:

#### 4.1 Color-coded categories with accent strips
- **Location:** TileCategory component (line ~39-47)
- **Current:** Simple title with border-t
- **Add:** Left border accent strip with category-specific color
- **Colors:**
  - Platforms: Gray/Stone (`border-l-4 border-gray-500`)
  - Interactables: Purple (`border-l-4 border-purple-500`)
  - Decorations: Green (`border-l-4 border-green-500`)
  - Spawn Points: Blue (`border-l-4 border-blue-500`)

#### 4.2 Glassmorphism cards for each tile with subtle shadows
- **Location:** TileItem component (line ~19-40)
- **Current:** `bg-secondary`
- **Change:** Semi-transparent with blur and shadow
- **CSS:** `bg-secondary/60 backdrop-blur-sm shadow-lg`

#### 4.3 Semi-transparent cursor preview of object being placed
- **Location:** `client/src/hooks/useCanvas.ts` - Mouse move handler
- **Current:** No preview cursor
- **Implementation:**
  - When tile type selected, change cursor to custom
  - Draw semi-transparent preview at cursor position
  - Use `cursor: none` and draw on canvas, or use CSS custom cursor
- **Opacity:** 0.5 or 0.6 for preview

**Dependencies:** May need to modify useCanvas hook
**Notes:** Make tile selection feel premium and informative

---

## Chapter 5: Polished Properties Panel

**Status:** ❌ Skipped - Not Implementing
**Files:** `client/src/components/level-editor/PropertiesPanel.tsx`, `client/src/index.css`
**Priority:** Low

### Tasks:

#### 5.1 Mini preview of selected object at top of panel
- **Location:** Add new section at top of panel (after header, before properties)
- **Implementation:**
  - Create small canvas (100x100px) showing selected object
  - Use same rendering logic from CanvasRenderer
  - Show object type name and ID
- **When:** Only when `selectedObject` exists
- **Design:** Centered preview with dark background, subtle border

**Dependencies:** Will need to import and use CanvasRenderer
**Notes:** Quick visual confirmation of what's selected - **SKIPPED by user decision**

---

## Chapter 6: Level Tabs Enhancement

**Status:** ❌ Skipped - Not Implementing
**Files:** `client/src/components/level-editor/LevelTabs.tsx`, `client/src/index.css`
**Priority:** Medium

### Tasks:

#### 6.1 Chrome-style tabs with rounded tops and shadows
- **Location:** Tab div styling (line ~24-34)
- **Current:** Flat tabs with border-b indicator
- **Change:**
  - Rounded top corners (`rounded-t-lg`)
  - Shadow beneath active tab
  - Slightly raised appearance for active tab
  - Background gradient or lighter color for active
- **CSS Example:** Active tab: `rounded-t-lg shadow-lg -mb-px bg-gradient-to-b from-secondary to-card`

#### 6.2 Add button with + icon that rotates on hover
- **Location:** New level button (line ~52-60)
- **Current:** Static plus icon
- **Add:** Rotation animation on hover
- **CSS:** `hover:rotate-90 transition-transform duration-300`

**Dependencies:** None
**Notes:** Make tabs feel like browser tabs - familiar and polished - **SKIPPED by user decision**

---

## Chapter 7: Animations & Micro-interactions

**Status:** ✅ Completed - Approved ✓
**Files:** `client/src/index.css`, `client/src/pages/LevelEditor.tsx`, `client/src/hooks/useLevelEditor.ts`, `client/src/types/level.ts`, `client/src/utils/canvasRenderer.ts`
**Priority:** Medium

### Tasks:

#### 7.1 Page transitions: Smooth fade-in on load
- **Status:** ❌ Skipped - Not implementing
- **Location:** Main LevelEditor component
- **CSS:** Add fade-in animation to root div
- **Keyframe:** `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`

#### 7.2 Tool selection: Scale + glow animation
- **Location:** Toolbar ToolButton component
- **CSS:** Active state: `transform: scale(1.05); box-shadow: 0 0 15px currentColor;`

#### 7.3 Delete action: Fade-out with scale-down
- **Location:** `useLevelEditor.ts` - deleteSelectedObjects function
- **Implementation:** CSS animation class added before removal
- **Duration:** 200-300ms

#### 7.4 Undo/Redo: Brief flash highlighting changed area
- **Location:** Canvas after undo/redo action
- **Implementation:** Overlay flash effect
- **CSS:** Brief white/blue flash that fades out

#### 7.5 Save indicator: Checkmark animation in header
- **Status:** ❌ Skipped - Merged into 7.6 (checkmark animation too intrusive)
- **Location:** Header status bar (from Chapter 1)
- **Trigger:** After updateCurrentLevel calls
- **Animation:** Checkmark slides in, holds, fades out

#### 7.6 Subtle color-coded save indicator (replaces 7.5)
- **Location:** `client/src/pages/LevelEditor.tsx` - Header status bar and auto-save logic
- **Current:** Toast notifications appear on auto-save + static "Auto-saved" badge
- **Change:**
  - Replace "Auto-saved" badge with single save icon
  - Orange icon when unsaved changes exist
  - Green icon when saved
  - Smooth color transitions only (no animations, no glow, no scale)
  - Remove all toast notifications
- **Implementation:**
  - Track "hasUnsavedChanges" state (set to true on edits, false after save)
  - Remove toast trigger from auto-save logic
  - Apply conditional color classes to save icon: `text-orange-500` (unsaved) / `text-green-500` (saved)
- **CSS:** `transition-colors duration-300` for smooth color changes
- **Note:** Purely informative, minimal intrusion, glanceable only - does not try to catch attention

#### 7.7 Loading states: Skeleton screens
- **Status:** ❌ Skipped - App loads very quickly, not needed
- **Location:** Initial render of LevelEditor
- **Current:** "Loading..." text
- **Change:** Animated skeleton layout matching UI structure

**Dependencies:** Tasks 7.5 and 7.6 depend on Chapter 1 status bar
**Notes:** Animations should feel snappy, not slow (200-400ms max)

---

## Chapter 8: Color & Theme Enhancements

**Status:** ⏸️ Not Started
**Files:** `client/src/index.css`
**Priority:** High

### Tasks:

#### 8.1 Gradient accents: Use Roblox red (#E4261F) to blue gradients
- **Location:** CSS variables and utility classes
- **Add custom gradients:**
  - `.bg-roblox-gradient { background: linear-gradient(135deg, #E4261F, #3B82F6); }`
  - Use in header, buttons, accents

#### 8.2 Glow effects: Subtle box-shadow glows on interactive elements
- **Elements:** Buttons, active tools, selected tiles
- **CSS:** `box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);`
- **Hover states:** Increase glow intensity

#### 8.3 Glassmorphism: Semi-transparent panels with backdrop blur
- **Elements:** Toolbar, panels, overlays, modals
- **CSS:** `bg-card/80 backdrop-blur-md border border-white/10`
- **Note:** Already added to some chapters, consolidate here

#### 8.4 Depth through shadows: Layered shadow system
- **Define shadow levels:**
  - `shadow-sm`: Subtle elements
  - `shadow-md`: Cards, tiles
  - `shadow-lg`: Panels, modals
  - `shadow-xl`: Floating elements
- **Customize in tailwind config or CSS variables**

**Dependencies:** None
**Notes:** Create cohesive visual language across all UI elements

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

**Dependencies:** Task 11.3 (selection) should be implemented first if keeping rotation for selected objects
**Notes:** All tools exist in UI but have no implementation - high priority for usability

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
| 1. Header & Branding | ✅ Completed | ✓ Approved | Gradient header, dropdown menus, status badges, glow effects |
| 2. Modern Toolbar | ✅ Completed | ✓ Approved | Labeled tool groups, glassmorphism, color-coded tools, animations |
| 3. Canvas Experience | ✅ Completed | ✓ Approved | Solid Mario sky blue, canvas drop shadow, transparent canvas, default grass platform, custom scrollbars |
| 4. Tile Palette | ✅ Completed | ✓ Approved | Color-coded category accents, glassmorphism cards, semi-transparent cursor preview |
| 5. Properties Panel | ❌ Skipped | N/A | User decision - not implementing |
| 6. Level Tabs | ❌ Skipped | N/A | User decision - not implementing |
| 7. Animations | ✅ Completed | ✓ Approved | Tool animations, delete fade-out, undo/redo flash, color-coded save indicator |
| 8. Color & Theme | ⏸️ Not Started | ❌ | |
| 9. Context & Feedback | ⏸️ Not Started | ❌ | |
| 10. Special Effects | ⏸️ Not Started | ❌ | |
| 11. Drawing Tools | ⏸️ Not Started | ❌ | Line and rectangle tools need implementation |

**Legend:**
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Completed
- ✓ Approved

---

## Next Steps

1. ✅ Chapter 1: Enhanced Header & Branding - Completed & Approved
2. ✅ Chapter 2: Modern Toolbar - Completed & Approved
3. ✅ Chapter 3: Enhanced Canvas Experience - Completed & Approved
   - Solid Mario sky blue background (#5C94FC)
   - Canvas drop shadow for depth
   - Transparent canvas background
   - Default grass platform (10 blocks from bottom)
   - Custom styled scrollbars
4. ✅ Chapter 4: Impressive Tile Palette - Completed & Approved
   - Color-coded category accent strips (gray/purple/green/blue)
   - Glassmorphism cards with shadows
   - Semi-transparent cursor preview (50% opacity)
5. ❌ Chapter 5: Polished Properties Panel - Skipped (user decision)
6. ❌ Chapter 6: Level Tabs Enhancement - Skipped (user decision)
7. **Next:** Chapter 7: Animations & Micro-interactions
8. Continue through remaining chapters sequentially

---

## Notes & Decisions

_(Add notes here as implementation progresses)_

