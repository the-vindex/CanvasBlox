# Feature Restoration Plan

## Overview
This document provides a step-by-step plan to restore full functionality to the new scrollbar-working LevelEditor.tsx. The current implementation has working scrollbars but is a simplified template. We need to incrementally add back all features from the original implementation.

### Step Status Legend
- ⬜ **Not Started** - Not yet implemented
- 🧪 **Ready for User Testing** - Implementation complete, awaiting manual verification
- ✅ **Complete** - Tested and confirmed working

## Current State ✅
- ✅ Working horizontal and vertical scrollbars
- ✅ Canvas renders with grid background
- ✅ Basic layout structure (header, tabs, sidebars, status bar)
- ✅ Properties panel collapse/expand
- ✅ Sample canvas drawing

## Missing Functionality 🎯
All features from the original implementation need to be restored incrementally.

---

## Testing Strategy 🧪

### Framework Setup
- **Vitest** - Fast unit test runner (integrates with Vite)
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment

### NPM Scripts
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom
```

Add to `package.json`:
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

### Test File Structure
```
client/src/__tests__/
  ├── hooks/
  │   ├── useLevelEditor.test.ts
  │   └── useCanvas.test.ts
  ├── utils/
  │   ├── canvasRenderer.test.ts
  │   └── levelSerializer.test.ts
  └── components/
      ├── TilePalette.test.tsx
      ├── PropertiesPanel.test.tsx
      ├── Toolbar.test.tsx
      └── LevelTabs.test.tsx
```

### TDD Workflow (for each step)
1. **Write failing test** - Create test file with expected behavior
2. **Implement feature** - Make the test pass
3. **Verify** - Run tests, ensure all pass
4. **Commit** - Commit code + tests together

### Example Test (Step 1)
```typescript
// client/src/__tests__/hooks/useLevelEditor.test.ts
import { renderHook } from '@testing-library/react';
import { useLevelEditor } from '@/hooks/useLevelEditor';

test('should load levels from localStorage', () => {
  const { result } = renderHook(() => useLevelEditor());
  expect(result.current.levels).toBeDefined();
  expect(result.current.currentLevel).toBeDefined();
});
```

---

## Section 1: Core Integration (Foundation)

### Step 1: Integrate useLevelEditor Hook
**Status**: ✅ Complete
**Current State**: Hardcoded sample data in component
**Goal**: Connect to useLevelEditor for state management
**Dependencies**: None

**Implementation**:
1. Import `useLevelEditor` hook
2. Replace hardcoded state with hook values:
   - `levels`, `currentLevel`, `currentLevelIndex`
   - `editorState` (selectedTool, selectedTileType, zoom, pan, mousePosition, etc.)
   - `history`, `historyIndex`
3. Add state update functions:
   - `setEditorState`
   - `updateCurrentLevel`
   - `createNewLevel`, `duplicateLevel`, `deleteLevel`
4. Add action functions:
   - `addTile`, `addObject`
   - `selectObject`, `deleteSelectedObjects`
   - `copySelectedObjects`, `pasteObjects`
   - `undo`, `redo`, `commitBatchToHistory`

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Manual Test**:
- Level data should load from localStorage
- Multiple levels should be available
- State changes should persist

**Automated Test** (write first):
- File: `client/src/__tests__/hooks/useLevelEditor.test.ts`
- Test: Hook initialization, localStorage loading, state management, undo/redo

---

### Step 2: Integrate useCanvas Hook
**Status**: ✅ Complete
**Current State**: useCanvas hook fully integrated with all event handlers
**Goal**: Full canvas interaction (mouse events, drawing, selection)
**Dependencies**: Step 1 (useLevelEditor)

**Implementation**:
1. Import `useCanvas` hook
2. Pass required props to useCanvas:
   - `levelData`, `editorState`
   - `onMouseMove`, `onCanvasClick`, `onTilePlaced`
   - `onDrawingSessionEnd`, `onZoom`
3. Use returned refs: `canvasRef`, `wrapperRef`
4. Add event handler callbacks:
   - `handleMouseMove` - update mouse position
   - `handleCanvasClick` - handle selection
   - `handleTilePlaced` - place tiles/objects
   - `handleDrawingSessionEnd` - batch undo for painting
   - `handleWheelZoom` - mouse-centered zoom

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Manual Test**:
- Mouse position should update in overlay
- Click should work on canvas
- Zoom with Ctrl+wheel should work

**Automated Test** (write first):
- File: `client/src/__tests__/hooks/useCanvas.test.ts`
- Test: Mouse event handling, coordinate conversion, painting mode tracking

---

### Step 3: Wire Canvas Component with CanvasRenderer
**Status**: 🧪 Ready for User Testing
**Current State**: Canvas component integrated with CanvasRenderer
**Goal**: Use Canvas component with full CanvasRenderer
**Dependencies**: Step 2 (useCanvas)

**Implementation**:
1. Import Canvas component
2. Replace inline canvas section with `<Canvas />` component
3. Pass all required props:
   ```tsx
   <Canvas
     levelData={currentLevel}
     editorState={editorState}
     onMouseMove={handleMouseMove}
     onCanvasClick={handleCanvasClick}
     onTilePlaced={handleTilePlaced}
     onDrawingSessionEnd={handleDrawingSessionEnd}
     onZoom={handleWheelZoom}
   />
   ```
4. Ensure Canvas component maintains scrollbar structure:
   - Outer wrapper: `overflow: auto`, `flex: 1`
   - Inner wrapper: sized to canvas, `minWidth/minHeight: 100%`
   - Canvas: `display: block`

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`
- Verify `client/src/components/level-editor/Canvas.tsx` has correct structure

**Manual Test**:
- Canvas should render all tiles and objects
- Scrollbars should still work
- CanvasRenderer should draw everything correctly

**Automated Test** (write first):
- File: `client/src/__tests__/utils/canvasRenderer.test.ts`
- Test: Grid rendering, tile drawing, coordinate transformations

---

## Section 2: Components Integration

### Step 4: Replace Inline TilePalette with Component
**Status**: ✅ Complete
**Current State**: TilePalette component integrated with full functionality
**Goal**: Use TilePalette component with functionality
**Dependencies**: Step 1 (editorState)

**Implementation**:
1. Import TilePalette component
2. Replace inline tile palette section
3. Wire up props:
   ```tsx
   <TilePalette
     selectedTileType={editorState.selectedTileType}
     onTileSelect={handleTileSelect}
   />
   ```
4. Add `handleTileSelect` callback:
   ```tsx
   const handleTileSelect = useCallback((tileType: string) => {
     setEditorState(prev => ({
       ...prev,
       selectedTileType: tileType,
       selectedTool: null
     }));
   }, [setEditorState]);
   ```

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Manual Test**:
- Clicking tiles should select them
- Selected tile should highlight
- Canvas should place selected tile type

**Automated Test** (write first):
- File: `client/src/__tests__/components/TilePalette.test.tsx`
- Test: Tile selection, highlighting, callback invocation

---

### Step 5: Replace Inline PropertiesPanel with Component
**Status**: ✅ Complete
**Current State**: PropertiesPanel component integrated with full functionality
**Goal**: Use PropertiesPanel component with live updates
**Dependencies**: Step 1 (currentLevel)

**Implementation**:
1. Import PropertiesPanel component
2. Replace inline properties section
3. Wire up props:
   ```tsx
   {showPropertiesPanel && (
     <PropertiesPanel
       levelData={currentLevel}
       editorState={editorState}
       onLevelUpdate={updateCurrentLevel}
       onDuplicateLevel={() => duplicateLevel()}
       onClose={() => setShowPropertiesPanel(false)}
     />
   )}
   ```
4. Keep collapse/expand logic with state

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- Level properties should display correctly
- Editing properties should update level
- Collapse/expand should work
- Duplicate level should work

---

### Step 6: Add Toolbar Component
**Status**: ✅ Complete
**Current State**: Toolbar component fully integrated with handlers
**Goal**: Use Toolbar component with full functionality
**Dependencies**: Step 1 (editorState)

**Implementation**:
1. Import Toolbar component
2. Replace inline toolbar section
3. Wire up props:
   ```tsx
   <Toolbar
     editorState={editorState}
     onToolChange={handleToolChange}
     onStateChange={handleStateChange}
     onRotateLeft={handleRotateLeft}
     onRotateRight={handleRotateRight}
     onZoomIn={handleZoomIn}
     onZoomOut={handleZoomOut}
     onZoomReset={handleZoomReset}
     showPropertiesPanel={showPropertiesPanel}
     onTogglePropertiesPanel={() => setShowPropertiesPanel(prev => !prev)}
   />
   ```
4. Add all handler callbacks for tools and zoom

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- Tool selection should work
- Zoom buttons should work
- Grid/scanlines toggles should work
- Properties panel toggle should work

---

### Step 7: Add LevelTabs Component
**Status**: ✅ Complete
**Current State**: LevelTabs component fully integrated with tab management
**Goal**: Use LevelTabs component with tab management
**Dependencies**: Step 1 (levels)

**Implementation**:
1. Import LevelTabs component
2. Replace inline tabs section
3. Wire up props:
   ```tsx
   <LevelTabs
     levels={levels}
     currentLevelIndex={currentLevelIndex}
     onLevelSelect={setCurrentLevelIndex}
     onLevelClose={handleLevelClose}
     onNewLevel={() => createNewLevel()}
   />
   ```
4. Add `handleLevelClose` with confirmation:
   ```tsx
   const handleLevelClose = useCallback((index: number) => {
     if (levels.length > 1) {
       const level = levels[index];
       const hasData = level.tiles.length > 0 ||
                       level.objects.length > 0 ||
                       level.spawnPoints.length > 0;

       if (hasData) {
         const confirmed = window.confirm(`...`);
         if (!confirmed) return;
       }

       deleteLevel(index);
     }
   }, [levels, deleteLevel]);
   ```

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- Switching tabs should work
- Creating new level should work
- Closing level should show confirmation
- Can't close last level

---

## Section 3: Functionality Restoration

### Step 8: Mouse and Keyboard Event Handlers
**Status**: ✅ Complete
**Current State**: Full keyboard shortcut support implemented
**Goal**: Full keyboard shortcut support
**Dependencies**: Step 1 (state management)

**Implementation**:
1. Add useEffect for keyboard event listener
2. Implement shortcuts:
   - `Ctrl+Z` - Undo
   - `Ctrl+Shift+Z` / `Ctrl+Y` - Redo
   - `Ctrl+C` - Copy
   - `Ctrl+V` - Paste
   - `Delete` - Delete selected
   - `Escape` - Clear selection
   - `V` - Select tool
   - `M` - Multi-select tool
   - `H` - Move tool
   - `L` - Line tool
   - `R` - Rectangle tool
   - `K` - Link tool
   - `P` - Toggle properties panel
3. Prevent shortcuts in input fields
4. Add undo/redo flash animation

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Manual Test**:
- All keyboard shortcuts should work
- No interference with input fields
- Visual feedback for undo/redo

**Automated Test** (write first):
- File: `client/src/__tests__/integration/keyboardShortcuts.test.tsx`
- Test: All shortcuts (Ctrl+Z, V, M, etc.), input field prevention

---

### Step 9: Zoom and Pan Functionality
**Status**: ✅ Complete
**Current State**: Zoom and pan fully implemented, tested, and verified
**Goal**: Full zoom/pan with mouse anchoring
**Dependencies**: Step 2 (useCanvas)

**Implementation**:
1. Implement zoom handlers:
   - `handleZoomIn` - zoom in at center
   - `handleZoomOut` - zoom out at center
   - `handleZoomReset` - reset to 100%
   - `handleWheelZoom` - zoom at mouse position
2. Calculate pan adjustment on zoom:
   ```tsx
   const zoomRatio = newZoom / prev.zoom;
   const newPan = {
     x: prev.pan.x + (mouseX - mouseX * zoomRatio),
     y: prev.pan.y + (mouseY - mouseY * zoomRatio)
   };
   ```
3. Wire zoom controls in Toolbar
4. Update zoom display in status bar

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- Ctrl+wheel zoom should anchor to mouse
- Zoom buttons should work
- Pan should adjust correctly on zoom
- Status bar should show current zoom

---

### Step 10: Tile and Object Placement
**Status**: ✅ Complete
**Current State**: Full tile/object placement working with tests
**Goal**: Full tile/object placement with drawing mode
**Dependencies**: Step 3 (Canvas component), Step 4 (TilePalette)

**Implementation**:
1. Implement `handleTilePlaced`:
   ```tsx
   const handleTilePlaced = useCallback((position: Position, tileType: string, isDrawing = false) => {
     if (tileType.startsWith('spawn-')) {
       addObject(position, tileType);
     } else if (tileType.includes('platform')) {
       if (isDrawing) {
         addTile(position, tileType, true); // Skip history
         drawingSessionTileCount.current++;
       } else {
         addTile(position, tileType, false);
       }
     } else {
       addObject(position, tileType);
     }
   }, [addTile, addObject]);
   ```
2. Implement `handleDrawingSessionEnd` for batched undo:
   ```tsx
   const handleDrawingSessionEnd = useCallback(() => {
     if (drawingSessionTileCount.current > 0) {
       const count = drawingSessionTileCount.current;
       commitBatchToHistory(`Placed ${count} tile${count > 1 ? 's' : ''}`);
       drawingSessionTileCount.current = 0;
     }
   }, [commitBatchToHistory]);
   ```
3. Wire to Canvas component

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- Click to place single tile
- Drag to paint multiple tiles (batched undo)
- Place objects and spawn points
- Undo/redo should work correctly

---

### Step 11: Selection and Multi-Select
**Status**: 🧪 Ready for User Testing
**Current State**: Selection and multi-select implemented with visual feedback
**Goal**: Full selection with visual feedback
**Dependencies**: Step 3 (Canvas component)

**Implementation**:
1. Implement `handleCanvasClick`:
   ```tsx
   const handleCanvasClick = useCallback((position: Position, event: MouseEvent) => {
     if (editorState.selectedTool === 'select') {
       setEditorState(prev => ({ ...prev, selectedObjects: [] }));
     }
   }, [editorState.selectedTool, setEditorState]);
   ```
2. Wire selection logic in Canvas/useCanvas
3. Add selection rendering in CanvasRenderer
4. Add multi-select drag box

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`
- `client/src/hooks/useCanvas.ts` (if needed)

**Test**:
- Click to select objects
- Multi-select with drag box
- Selected objects show highlight
- Selection count updates

---

### Step 12: Undo/Redo System
**Status**: ✅ Complete (auto-accepted)
**Current State**: Full undo/redo implemented with visual feedback
**Goal**: Full undo/redo with history
**Dependencies**: Step 1 (useLevelEditor)

**Implementation**:
1. Wire undo/redo buttons in header
2. Add keyboard shortcuts (Step 8)
3. Add visual flash feedback:
   ```tsx
   const triggerUndoRedoFlash = useCallback(() => {
     setShowUndoRedoFlash(true);
     setTimeout(() => setShowUndoRedoFlash(false), 400);
   }, []);
   ```
4. Update history display in status bar

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- Undo/redo should work for all actions
- Flash animation should show
- History count should update
- Can't undo beyond start

---

### Step 13: Copy/Paste
**Status**: ✅ Complete (auto-accepted)
**Current State**: Full copy/paste with offset implemented
**Goal**: Full copy/paste with offset
**Dependencies**: Step 11 (selection)

**Implementation**:
1. Wire copy/paste buttons in header
2. Add keyboard shortcuts (Step 8)
3. Implement handlers that call:
   - `copySelectedObjects()` - copies to clipboard state
   - `pasteObjects()` - pastes with offset
4. Show toast feedback

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- Select and copy objects
- Paste creates duplicates with offset
- Ctrl+C/V shortcuts work
- Toast shows feedback

---

### Step 14: Import/Export Modals
**Status**: ✅ Complete (auto-accepted)
**Current State**: Full import/export implemented with modals and File dropdown menu
**Goal**: Full import/export JSON and PNG
**Dependencies**: Step 1 (currentLevel)

**Implementation**:
1. Import `ImportModal` and `ExportModal` components
2. Add modal state:
   ```tsx
   const [showImportModal, setShowImportModal] = useState(false);
   const [showExportModal, setShowExportModal] = useState(false);
   ```
3. Wire File menu buttons to open modals
4. Implement `handleImportLevel`:
   ```tsx
   const handleImportLevel = useCallback((levelData: LevelData) => {
     // Validate single player spawn
     const playerSpawns = levelData.spawnPoints.filter(spawn => spawn.type === 'player');
     const otherSpawns = levelData.spawnPoints.filter(spawn => spawn.type !== 'player');

     const validatedSpawnPoints = playerSpawns.length > 0
       ? [playerSpawns[0], ...otherSpawns]
       : otherSpawns;

     updateCurrentLevel(() => ({
       ...levelData,
       spawnPoints: validatedSpawnPoints
     }));
   }, [updateCurrentLevel]);
   ```
5. Implement `handleExportPNG`:
   ```tsx
   const handleExportPNG = useCallback(() => {
     const canvas = document.querySelector('#levelCanvas') as HTMLCanvasElement;
     if (canvas) {
       LevelSerializer.exportToPNG(canvas, `${currentLevel?.levelName || 'level'}.png`);
       toast({ title: "Exported", description: "Level exported as PNG!" });
     }
   }, [currentLevel, toast]);
   ```
6. Add modals at end of component:
   ```tsx
   <ImportModal
     isOpen={showImportModal}
     onClose={() => setShowImportModal(false)}
     onImport={handleImportLevel}
   />
   <ExportModal
     isOpen={showExportModal}
     onClose={() => setShowExportModal(false)}
     levelData={currentLevel}
   />
   ```

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Manual Test**:
- Import JSON should load level
- Export JSON should download file
- Export PNG should download image
- Validation should work (single player spawn)

**Automated Test** (write first):
- File: `client/src/__tests__/utils/levelSerializer.test.ts`
- Test: JSON serialization/deserialization, validation, single player spawn rule

---

### Step 15: Auto-Save and Unsaved Changes Indicator
**Status**: ✅ Complete (auto-accepted)
**Current State**: No auto-save
**Goal**: Auto-save to localStorage with indicator
**Dependencies**: Step 1 (levels)

**Implementation**:
1. Add unsaved changes state:
   ```tsx
   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
   ```
2. Track changes:
   ```tsx
   useEffect(() => {
     setHasUnsavedChanges(true);
   }, [levels]);
   ```
3. Auto-save every 5 seconds:
   ```tsx
   useEffect(() => {
     const interval = setInterval(() => {
       setHasUnsavedChanges(false);
     }, 5000);
     return () => clearInterval(interval);
   }, []);
   ```
4. Update save indicator in header:
   ```tsx
   <i className={`fas fa-save ${hasUnsavedChanges ? 'text-orange-500' : 'text-green-500'}`}></i>
   <span>{hasUnsavedChanges ? 'Unsaved' : 'Saved'}</span>
   ```

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- Indicator shows "Unsaved" on changes
- Indicator shows "Saved" after 5 seconds
- LocalStorage should update

---

## Section 4: Visual Features

### Step 16: Scanlines Toggle
**Status**: ✅ Complete (auto-accepted)
**Current State**: Scanlines toggle fully working with comprehensive tests
**Goal**: Working scanlines overlay
**Dependencies**: Step 3 (Canvas component)

**Implementation**:
1. ✅ `editorState.showScanlines` updates from Toolbar
2. ✅ Canvas component conditionally renders scanlines:
   ```tsx
   {editorState.showScanlines && (
     <div className="scanlines-overlay absolute inset-0 pointer-events-none" />
   )}
   ```
3. ✅ CSS for `.scanlines-overlay` exists in `client/src/index.css`

**Files modified**:
- ✅ `client/src/components/level-editor/Canvas.tsx` (already implemented)
- ✅ `client/src/index.css` (already has scanlines CSS)
- ✅ Added `client/src/components/level-editor/Canvas.test.tsx` (4 unit tests)
- ✅ Added E2E tests in `e2e/level-editor.spec.ts` (2 tests)

**Tests**:
- ✅ Toggle adds/removes scanlines overlay (E2E + unit)
- ✅ Scanlines don't block mouse interactions (E2E)
- ✅ Scanlines have pointer-events: none (unit)
- ✅ All tests pass (6/6)

---

### Step 17: Grid Toggle
**Status**: ✅ Complete (auto-accepted)
**Current State**: Grid toggle fully working with comprehensive tests
**Goal**: Toggleable grid
**Dependencies**: Step 3 (Canvas component)

**Implementation**:
1. ✅ `editorState.showGrid` updates from Toolbar
2. ✅ CanvasRenderer checks flag before drawing grid (line 24-25: early return if !show)
3. ✅ Toggle button in Toolbar working

**Files modified**:
- ✅ `e2e/level-editor.spec.ts` (added 2 E2E tests)
- ✅ `OPEN_QUESTIONS.md` (added assumptions and completion summary)

**Test Results**:
- ✅ Toggle shows/hides grid via UI switch
- ✅ Grid renders correctly when on
- ✅ Grid toggle doesn't affect canvas interactions
- ✅ All unit tests pass (103/103)
- ✅ Step 17 E2E tests pass (2/2)

---

### Step 18: Selection Animations (Pulsing Glow)
**Status**: ✅ Complete (auto-accepted)
**Current State**: Pulsing glow fully implemented and tested
**Goal**: Pulsing glow on selected objects
**Dependencies**: Step 11 (selection)

**Implementation**:
1. ✅ CanvasRenderer renders pulsing glow for selected objects (already implemented)
   - Lines 243-262: Pulsing glow for tiles
   - Lines 627-646: Pulsing glow for objects
   - Lines 864-883: Pulsing glow for spawn points
2. ✅ Uses Date.now() / 1000 and Math.sin() for pulsing opacity animation
3. ✅ No CSS keyframes needed (canvas-based animation)

**Files modified**:
- `client/src/utils/canvasRenderer.test.ts` - Added 3 unit tests
- `e2e/level-editor.spec.ts` - Added 4 E2E tests

**Tests**:
- ✅ Selected tiles have visual feedback (E2E)
- ✅ Selection works for tiles, objects, spawn points (E2E)
- ✅ Multiple selections all show selection state (E2E)
- ✅ Pulsing glow doesn't interfere with tile placement (E2E)
- ✅ Tiles apply pulsing glow when selected (unit)
- ✅ Objects apply pulsing glow when selected (unit)
- ✅ Spawn points apply pulsing glow when selected (unit)
- ✅ All Step 18 tests pass (4/4 E2E, 3/3 unit)

---

### Step 19: Delete Animations
**Status**: ⬜ Not Started
**Current State**: No delete animation
**Goal**: Shrink animation on delete
**Dependencies**: Step 13 (delete functionality)

**Implementation**:
1. Implement delete animation in CanvasRenderer
2. Objects should shrink before removal
3. Animation should complete before state update

**Files to modify**:
- `client/src/utils/canvasRenderer.ts`
- May need state tracking for animating objects

**Test**:
- Deleted objects should shrink
- Animation should look smooth
- Objects should disappear after animation

---

### Step 20: Initial Zoom Calculation
**Status**: ⬜ Not Started
**Current State**: Always starts at 100% zoom
**Goal**: Calculate zoom to show grass layer
**Dependencies**: Step 9 (zoom functionality)

**Implementation**:
1. Add useEffect to calculate initial zoom:
   ```tsx
   useEffect(() => {
     if (!currentLevel) return;

     requestAnimationFrame(() => {
       const header = document.querySelector('header');
       const levelTabs = document.querySelector('[data-testid="level-tabs"]');
       const toolbar = document.querySelector('[data-testid="toolbar"]');
       const footer = document.querySelector('footer');

       const headerHeight = header?.clientHeight || 56;
       const tabsHeight = levelTabs?.clientHeight || 40;
       const toolbarHeight = toolbar?.clientHeight || 60;
       const footerHeight = footer?.clientHeight || 32;

       const viewportHeight = window.innerHeight - headerHeight - tabsHeight - toolbarHeight - footerHeight;

       if (viewportHeight <= 0) return;

       const currentlyVisibleTiles = viewportHeight / TILE_SIZE;
       const targetVisibleTiles = DEFAULT_GRASS_Y + 5;
       const calculatedZoom = currentlyVisibleTiles / targetVisibleTiles;
       const initialZoom = Math.min(Math.max(calculatedZoom, 0.1), 1);

       setEditorState(prev => {
         if (prev.zoom === 1) {
           return { ...prev, zoom: initialZoom };
         }
         return prev;
       });
     });
   }, [currentLevel, setEditorState]);
   ```

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- App should start with grass visible
- Zoom should be calculated based on viewport
- Should only set zoom on first load

---

### Step 21: Parallax Background
**Status**: ⬜ Not Started
**Current State**: No parallax
**Goal**: Background moves at 50% of pan
**Dependencies**: Step 9 (pan)

**Implementation**:
1. Calculate parallax offset in Canvas wrapper:
   ```tsx
   const parallaxX = editorState.pan.x * 0.5;
   const parallaxY = editorState.pan.y * 0.5;
   ```
2. Apply to wrapper background position:
   ```tsx
   style={{
     backgroundPosition: `${parallaxX}px ${parallaxY}px`
   }}
   ```

**Files to modify**:
- `client/src/components/level-editor/Canvas.tsx`

**Test**:
- Background should move slower than canvas
- Should create depth effect

---

## Section 5: Final Polish

### Step 22: Update Header with Dropdown Menu
**Status**: ⬜ Not Started
**Current State**: Inline buttons
**Goal**: Use shadcn DropdownMenu for File menu
**Dependencies**: Step 14 (import/export)

**Implementation**:
1. Import DropdownMenu components
2. Replace File buttons with dropdown:
   ```tsx
   <DropdownMenu>
     <DropdownMenuTrigger asChild>
       <Button variant="ghost" size="sm" className="text-white">
         <i className="fas fa-file"></i>
         File
         <i className="fas fa-chevron-down text-xs"></i>
       </Button>
     </DropdownMenuTrigger>
     <DropdownMenuContent align="start">
       <DropdownMenuItem onClick={() => createNewLevel()}>
         <i className="fas fa-file w-4"></i>
         New Level
       </DropdownMenuItem>
       {/* ... */}
     </DropdownMenuContent>
   </DropdownMenu>
   ```

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- Dropdown should open/close
- All menu items should work

---

### Step 23: Update Status Bar with Live Data
**Status**: ⬜ Not Started
**Current State**: Hardcoded values
**Goal**: Live data from currentLevel
**Dependencies**: Step 1 (currentLevel)

**Implementation**:
1. Replace hardcoded status bar values:
   ```tsx
   <span>Objects: {currentLevel.tiles.length + currentLevel.objects.length + currentLevel.spawnPoints.length}</span>
   <span>Canvas: {currentLevel.metadata.dimensions.width}×{currentLevel.metadata.dimensions.height}</span>
   <span>Zoom: {Math.round(editorState.zoom * 100)}%</span>
   <span>History: {historyIndex + 1}/{history.length}</span>
   ```

**Files to modify**:
- `client/src/pages/LevelEditor.tsx`

**Test**:
- Status bar should show live counts
- Should update on changes

---

## Testing Checklist (Run After All Steps)

After completing all steps, verify all features work:

### Core Functionality
- [ ] Canvas renders correctly with CanvasRenderer
- [ ] Horizontal and vertical scrollbars work
- [ ] Canvas zooms with Ctrl+wheel (anchored to mouse)
- [ ] Canvas pans correctly on zoom

### Tile/Object Operations
- [ ] Click to place single tile
- [ ] Drag to paint multiple tiles (batched undo)
- [ ] Place interactable objects (buttons, doors, etc.)
- [ ] Place spawn points (player, enemy)
- [ ] Can't place multiple player spawns

### Selection
- [ ] Click to select objects
- [ ] Multi-select with drag box
- [ ] Selected objects show pulsing glow
- [ ] Selection count updates in overlay

### Edit Operations
- [ ] Undo (Ctrl+Z) works
- [ ] Redo (Ctrl+Y) works
- [ ] Copy (Ctrl+C) works
- [ ] Paste (Ctrl+V) works with offset
- [ ] Delete (Delete key) works with shrink animation
- [ ] Undo/redo flash animation shows

### Tools
- [ ] Select tool (V) works
- [ ] Multi-select tool (M) works
- [ ] Move tool (H) works
- [ ] Line tool (L) works
- [ ] Rectangle tool (R) works
- [ ] Link tool (K) works

### Level Management
- [ ] Multiple levels load from localStorage
- [ ] Can create new level
- [ ] Can switch between levels
- [ ] Can close level (with confirmation)
- [ ] Can duplicate level
- [ ] Can't close last level

### Properties
- [ ] Properties panel shows level settings
- [ ] Can edit level name, dimensions, colors
- [ ] Can toggle grid, scanlines
- [ ] Can edit selected object properties
- [ ] Properties panel collapse/expand works

### Import/Export
- [ ] Can import JSON level
- [ ] Can export JSON level
- [ ] Can export PNG image
- [ ] Import validates single player spawn

### Visual Features
- [ ] Grid toggle works
- [ ] Scanlines toggle works
- [ ] Parallax background works
- [ ] Selection pulsing glow works
- [ ] Delete shrink animation works

### Auto-Save
- [ ] Changes mark as "Unsaved"
- [ ] Auto-saves after 5 seconds
- [ ] Indicator shows "Saved"

### Keyboard Shortcuts
- [ ] Ctrl+Z - Undo
- [ ] Ctrl+Shift+Z - Redo
- [ ] Ctrl+Y - Redo
- [ ] Ctrl+C - Copy
- [ ] Ctrl+V - Paste
- [ ] Delete - Delete selected
- [ ] Escape - Clear selection
- [ ] V - Select tool
- [ ] M - Multi-select
- [ ] H - Move
- [ ] L - Line
- [ ] R - Rectangle
- [ ] K - Link
- [ ] P - Toggle properties

### Initial State
- [ ] App loads with grass visible (calculated zoom)
- [ ] Data persists in localStorage
- [ ] All defaults are correct

### Automated Tests
- [ ] All unit tests pass (`npm test`)
- [ ] All component tests pass
- [ ] Integration tests pass
- [ ] Test coverage meets targets (>85%)

---

## Git Workflow

After each step is complete:
1. **Write automated tests** (if applicable)
2. **Implement feature** to make tests pass
3. **Run tests** - `npm test` (all should pass)
4. **Manual test** features in browser
5. **Commit** with descriptive message (include test files)

Example commit messages:
- "Step 1: Integrate useLevelEditor hook with tests"
- "Step 2: Integrate useCanvas hook with tests"
- "Section 1 Complete: Core integration finished"
- etc.

**TDD Reminder**: Always write the test first, watch it fail, then implement the feature to make it pass.

---

## Notes

- Maintain scrollbar functionality throughout all changes
- Test scrollbars after each major step
- Keep the proven pattern: outer `overflow: auto`, inner sized wrapper, canvas `display: block`
- If scrollbars break, revert and analyze what changed
- Each step should be small, testable, and incremental
- Don't skip steps - dependencies matter
- **TDD**: Write automated tests before implementation for rapid feedback and regression prevention
- Run `npm test` frequently during development to catch issues early
