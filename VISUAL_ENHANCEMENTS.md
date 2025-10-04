# Visual Enhancement Roadmap - Roblox Level Designer

**Status:** In Progress
**Current Chapter:** Chapter 4 - Completed, Reviewed ✓
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

**Status:** ⏸️ Not Started
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
**Notes:** Quick visual confirmation of what's selected

---

## Chapter 6: Level Tabs Enhancement

**Status:** ⏸️ Not Started
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
**Notes:** Make tabs feel like browser tabs - familiar and polished

---

## Chapter 7: Animations & Micro-interactions

**Status:** ⏸️ Not Started
**Files:** `client/src/index.css`, various component files
**Priority:** Medium

### Tasks:

#### 7.1 Page transitions: Smooth fade-in on load
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
- **Location:** Header status bar (from Chapter 1)
- **Trigger:** After updateCurrentLevel calls
- **Animation:** Checkmark slides in, holds, fades out

#### 7.6 Remove auto-save toast notifications and use color-coded save icon
- **Location:** `client/src/pages/LevelEditor.tsx` - Header status bar and auto-save logic
- **Current:** Toast notifications appear on auto-save
- **Change:**
  - Remove toast notifications for auto-save events
  - Save icon in status bar shows orange when there are unsaved changes
  - Save icon turns green after successful save
  - Use smooth color transitions for visual feedback
- **Implementation:**
  - Track "hasUnsavedChanges" state (set to true on edits, false after save)
  - Remove toast trigger from auto-save logic
  - Apply conditional color classes to save icon: `text-orange-500` (unsaved) / `text-green-500` (saved)
- **CSS:** `transition-colors duration-300` for smooth color changes
- **Note:** More subtle, less intrusive feedback than toast notifications

#### 7.7 Loading states: Skeleton screens
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
| 5. Properties Panel | ⏸️ Not Started | ❌ | |
| 6. Level Tabs | ⏸️ Not Started | ❌ | |
| 7. Animations | ⏸️ Not Started | ❌ | |
| 8. Color & Theme | ⏸️ Not Started | ❌ | |
| 9. Context & Feedback | ⏸️ Not Started | ❌ | |
| 10. Special Effects | ⏸️ Not Started | ❌ | |

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
5. **Next:** Chapter 5: Polished Properties Panel
6. Continue through remaining chapters sequentially

---

## Notes & Decisions

_(Add notes here as implementation progresses)_

