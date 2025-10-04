# Canvas Scrollbar Fix - Migration Plan

## Problem Statement
The current React implementation has an absolutely positioned canvas that prevents native scrollbars from appearing. Users cannot scroll with mouse or see scrollbars, making the app unusable with traditional mouse navigation.

## Working Solution
Agent created two HTML demos that work flawlessly:
1. `canvas-scroll-demo.html` - Simple proof of concept
2. `level-editor-complete.html` - Complete layout with all features

## Key Differences: Working Demo vs Current React App

### Working Demo Pattern (from level-editor-complete.html)

```html
<!-- Outer scrollable container -->
<div class="canvas-wrapper" style="overflow: auto; flex: 1;">
  <!-- Inner wrapper - sized to canvas dimensions -->
  <div class="canvas-inner" style="width: 1920px; height: 960px; display: inline-block; min-width: 100%; min-height: 100%; padding: 20px;">
    <!-- Canvas - NOT absolutely positioned -->
    <canvas id="level-canvas" width="1920" height="960" style="display: block; width: 1920px; height: 1920px;">
    </canvas>

    <!-- Absolutely positioned overlays (relative to canvas-inner) -->
    <div style="position: absolute; top: 20px; left: 20px; pointer-events: none;">
      Info overlay
    </div>
  </div>
</div>
```

**Critical CSS:**
```css
.canvas-wrapper {
  flex: 1;
  overflow: auto; /* NATIVE SCROLLING */
  position: relative;
}

.canvas-inner {
  width: 1920px;
  height: 960px;
  padding: 20px;
  display: inline-block;
  min-width: 100%;  /* Ensures fills container when smaller */
  min-height: 100%; /* Ensures fills container when smaller */
}

#level-canvas {
  display: block;  /* NOT absolute */
  width: 1920px;
  height: 960px;
}
```

### Current Broken React Pattern

```tsx
<div className="flex-1 relative overflow-auto" style={{ minHeight: canvasHeight }}>
  <canvas className="absolute top-0 left-0" width={canvasWidth} height={canvasHeight} />
</div>
```

**Why it's broken:**
- Canvas is `absolute top-0 left-0` - doesn't create scroll overflow
- Wrapper has `minHeight` but canvas doesn't push boundaries
- No inner wrapper to create proper scrollable content

## Migration Strategy

### Phase 1: Document Current Features (COMPLETE THIS FIRST)

**Current React App Features to Preserve:**
1. ✅ Canvas rendering with CanvasRenderer class
2. ✅ Tile placement and drawing
3. ✅ Object placement (buttons, doors, spawn points, etc.)
4. ✅ Selection with multi-select
5. ✅ Undo/Redo history (batched for tile painting)
6. ✅ Copy/Paste
7. ✅ Delete with animation
8. ✅ Zoom (Ctrl+wheel) anchored to mouse position
9. ✅ Pan adjustment on zoom
10. ✅ Keyboard shortcuts (Ctrl+Z/Y, Ctrl+C/V, Delete, etc.)
11. ✅ Properties panel (collapsible)
12. ✅ Multiple levels with tabs
13. ✅ Auto-save to localStorage
14. ✅ Import/Export JSON
15. ✅ Export PNG
16. ✅ Scanlines toggle
17. ✅ Grid toggle
18. ✅ Parallax background on pan
19. ✅ Pulsing selection glow
20. ✅ Tool selection (select, move, line, rectangle, link)
21. ✅ Tile palette with tile type selection

**Current File Structure:**
```
client/src/
├── components/level-editor/
│   ├── Canvas.tsx              - Canvas component (NEEDS REWRITE)
│   ├── Toolbar.tsx             - Tools and zoom controls
│   ├── TilePalette.tsx         - Left sidebar tile picker
│   ├── PropertiesPanel.tsx     - Right sidebar properties
│   └── LevelTabs.tsx           - Top level tabs
├── hooks/
│   ├── useLevelEditor.ts       - Main state management
│   ├── useCanvas.ts            - Canvas interaction handlers
│   └── use-toast.ts            - Toast notifications
├── utils/
│   ├── canvasRenderer.ts       - Canvas drawing logic
│   └── levelSerializer.ts      - Import/export logic
├── types/
│   └── level.ts                - TypeScript types
└── pages/
    └── LevelEditor.tsx         - Main page layout (NEEDS UPDATE)
```

### Phase 2: Apply Working Pattern to React

**Files to Modify:**

1. **client/src/components/level-editor/Canvas.tsx**
   - Remove absolute positioning from canvas
   - Add proper wrapper structure matching HTML demo
   - Keep all existing props and functionality
   - Ensure overlays use pointer-events-none

2. **client/src/pages/LevelEditor.tsx**
   - May need layout adjustments to ensure canvas container has proper flex

3. **client/src/index.css**
   - Already has improved scrollbar styling (completed)

**Exact Implementation Pattern:**

```tsx
// Canvas.tsx - NEW STRUCTURE
export function Canvas({ levelData, editorState, ... }: CanvasProps) {
  const { canvasRef, wrapperRef } = useCanvas({ ... });

  const canvasWidth = levelData.metadata.dimensions.width * TILE_SIZE;
  const canvasHeight = levelData.metadata.dimensions.height * TILE_SIZE;

  const parallaxX = editorState.pan.x * 0.5;
  const parallaxY = editorState.pan.y * 0.5;

  return (
    <div
      ref={wrapperRef}
      className="flex-1 overflow-auto canvas-wrapper scrollbar-custom"
      style={{ backgroundPosition: `${parallaxX}px ${parallaxY}px` }}
    >
      {/* Inner wrapper - creates scrollable content */}
      <div
        className="inline-block p-5"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          minWidth: '100%',
          minHeight: '100%'
        }}
      >
        {/* Positioning context for overlays */}
        <div className="relative inline-block">
          <canvas
            id="levelCanvas"
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="block cursor-crosshair border-2 border-primary/30"
            style={{
              imageRendering: 'pixelated',
              width: canvasWidth,
              height: canvasHeight
            }}
          />

          {/* Scanlines Overlay */}
          {editorState.showScanlines && (
            <div className="absolute inset-0 scanlines-overlay pointer-events-none" />
          )}

          {/* Info Overlay */}
          <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm border border-white/20 rounded px-3 py-2 text-xs z-10 text-white pointer-events-none">
            <div>Mouse: X: {editorState.mousePosition.x}, Y: {editorState.mousePosition.y}</div>
            <div>Selected: {editorState.selectedObjects.length} objects</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Phase 3: Testing Checklist

**After implementation, verify:**

1. ✅ Visible scrollbars (both horizontal and vertical when zoomed in)
2. ✅ Touchpad scrolling works
3. ✅ Mouse wheel scrolling works
4. ✅ Scrollbar drag works
5. ✅ Tile placement still works
6. ✅ Object placement still works
7. ✅ Selection still works
8. ✅ Undo/Redo still works
9. ✅ Copy/Paste still works
10. ✅ Delete animation still works
11. ✅ Zoom with Ctrl+wheel still works
12. ✅ Zoom anchoring to mouse position works
13. ✅ Pan adjustment on zoom works
14. ✅ Keyboard shortcuts work
15. ✅ Properties panel visible and functional
16. ✅ Multi-level tabs work
17. ✅ Import/Export works
18. ✅ Grid toggle works
19. ✅ Scanlines toggle works
20. ✅ Parallax background works

### Phase 4: Fallback Plan

If migration fails, we can:
1. Keep current panning functionality
2. Accept no visible scrollbars
3. Document limitation in README
4. Add keyboard shortcuts for panning (arrow keys)

## Important Notes for Context Reset

**When continuing after context reset:**

1. Read this file first: `MIGRATION_PLAN.md`
2. Reference working demos: `level-editor-complete.html` and `canvas-scroll-demo.html`
3. The HTML demos work perfectly - use them as the source of truth
4. Current broken code: `client/src/components/level-editor/Canvas.tsx`
5. Already completed: Improved scrollbar CSS in `client/src/index.css`

**Key Insight:**
The ONLY way to get visible scrollbars is to have the canvas in normal document flow (not absolutely positioned) within a sized wrapper that creates scroll overflow.

**Working Pattern Summary:**
```
Scrollable Container (overflow: auto)
└── Sized Wrapper (width/height = canvas size, inline-block, min-width/height 100%)
    └── Positioning Context (relative, inline-block)
        ├── Canvas (display: block, NOT absolute)
        └── Overlays (absolute, pointer-events-none)
```

## Current Status

- ✅ HTML demos created and verified working
- ✅ Scrollbar CSS improved
- ❌ React implementation still broken
- ⏳ Need to apply working pattern to React app

## Next Steps

1. Complete Phase 2: Apply working pattern to Canvas.tsx
2. Test all features from checklist
3. Debug any issues
4. Commit working solution
5. Update TASKS.md to mark Chapter 10 zoom/pan work as complete
