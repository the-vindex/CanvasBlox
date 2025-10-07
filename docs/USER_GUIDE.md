# CanvasBlox User Guide

## Selection and Multi-Selection

CanvasBlox offers multiple ways to select and manipulate objects in your level.

### Selection Methods

#### Single Selection
- **Left-click** on any object to select it
- The selected object will have a white glowing outline
- Click on empty space to deselect all objects

#### Multi-Selection (Additive)
You can add multiple objects to your selection in two ways:

1. **Shift+Click**: Hold Shift and click on objects to add them to the selection
   - Click on an already-selected object with Shift to deselect it
   - Works from any tool (not just Select tool)

2. **Ctrl+Click** (or Cmd+Click on Mac): Hold Ctrl/Cmd and click on objects to add them to the selection
   - Same behavior as Shift+Click
   - Works from any tool (not just Select tool)

#### Box Selection (Shift+Drag)
- **Shift+Drag**: Hold Shift and drag a selection box to select multiple objects at once
- All objects within the box will be selected
- This replaces the current selection (not additive)
- Works from any tool as a temporary override

### Moving Selected Objects

Once you have objects selected, you can move them:

1. **Move Tool (H)**: Activate the Move tool and drag selected objects
   - Selected objects will show as semi-transparent at their original position
   - Ghost preview shows where objects will be placed
   - Release to finalize the move

2. **Alt+Drag**: Hold Alt and drag to temporarily engage the move tool
   - Works from any tool (temporary override)
   - Automatically returns to previous tool after releasing Alt
   - Objects must be selected first

### Tool Keyboard Shortcuts

- **V**: Select Tool
- **H**: Move Tool
- **B**: Pen Tool (draw)
- **L**: Line Tool
- **R**: Rectangle Tool
- **K**: Link Tool
- **U**: Unlink Tool
- **P**: Toggle Properties Panel
- **Escape**: Clear selection and cancel current operation

### Copy/Paste

- **Ctrl+C** (Cmd+C on Mac): Copy selected objects
- **Ctrl+V** (Cmd+V on Mac): Paste copied objects
  - Ghost preview shows where objects will be placed
  - Move mouse to position, then click to place
  - Large clipboard (>20 objects) shows a confirmation dialog

### Undo/Redo

- **Ctrl+Z** (Cmd+Z on Mac): Undo last action
- **Ctrl+Shift+Z** (Cmd+Shift+Z on Mac): Redo last undone action
- Each level has its own independent undo/redo history
- History is preserved when switching between levels

### Zoom and Pan

- **Ctrl+Scroll** (Cmd+Scroll on Mac): Zoom in/out
- **Middle Mouse Button + Drag**: Pan the canvas
- Zoom is centered on mouse cursor position

## Tips and Tricks

- **Shift is your multi-select friend**: Use Shift+Click for individual items or Shift+Drag for box selection
- **Alt for quick moves**: No need to switch to Move tool - just hold Alt and drag
- **Ctrl for additive selection**: Add items one by one without losing your current selection
- All modifier keys (Shift, Ctrl, Alt) work as temporary overrides from any tool
