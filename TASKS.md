# Visual Enhancement Roadmap - Roblox Level Designer

**Status:** In Progress
**Current Chapter:** Chapter 11 - Drawing Tools Implementation
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

**❌ Remaining (Priority Order):**
1. 🔧 **11.10** Tile overlap logic - newest tile wins (NEW - HIGH PRIORITY)
2. 🔗 **11.5** Linking tool for interactable objects
3. ✂️ **11.6** Unlinking tool (Properties Panel)
4. 📏 **11.1** Line drawing tool
5. 📐 **11.2** Rectangle drawing tool
6. 🔢 **11.9** Button numbering system
7. 🔄 **11.7** Rotation tool - decision needed

**Future:** Chapter 12 - Documentation (low priority)

---

## Notes & Decisions

_(Add notes here as implementation progresses)_

