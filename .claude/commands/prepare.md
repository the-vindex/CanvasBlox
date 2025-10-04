# /prepare

Prepare for working on the CanvasBlox project by reading all essential files.

## Usage

```
/prepare
```

## Description

This command reads all the key files needed to understand the CanvasBlox project architecture, current implementation status, and codebase structure. Use this at the start of a new session after `/clear` or when opening the project for the first time.

## Instructions

When this command is invoked:

1. **Read project documentation**:
   - `TASKS.md` - Current roadmap and implementation status
   - `CLAUDE.md` - Project architecture and development guidelines
   - `replit.md` - Detailed architecture and system design (Replit-specific)
   - `.replit` - Replit configuration

2. **Read core types and constants**:
   - `client/src/types/level.ts` - Type definitions for Level, EditorState, etc.
   - `client/src/constants/editor.ts` - Constants like TILE_SIZE, DEFAULT_GRASS_Y

3. **Read main page and layout**:
   - `client/src/pages/LevelEditor.tsx` - Main editor page and layout

4. **Read key components**:
   - `client/src/components/level-editor/Toolbar.tsx`
   - `client/src/components/level-editor/Canvas.tsx`
   - `client/src/components/level-editor/TilePalette.tsx`
   - `client/src/components/level-editor/PropertiesPanel.tsx`

5. **Read hooks and utilities**:
   - `client/src/hooks/useLevelEditor.ts` - Main state management hook
   - `client/src/hooks/useCanvas.ts` - Canvas interaction logic
   - `client/src/utils/canvasRenderer.ts` - Canvas rendering implementation
   - `client/src/utils/levelSerializer.ts` - Level serialization/deserialization

6. **Read global styles**:
   - `client/src/index.css` - Global CSS and custom classes

7. **Provide summary**:
   - Current chapter status from TASKS.md
   - Key architectural patterns identified
   - Important constants and configuration values
   - Brief overview of state management flow
   - Development environment (check server output for port)
   - Ready to work message

## Output Format

After reading all files, provide a concise summary:

```
📋 Project Preparation Complete

**Environment:**
- Development: npm run dev (tsx server/index.ts)
- Check terminal for actual port (default: 3000)

**Current Status:**
- Chapter X: [Status] - [Notes]

**Key Architecture:**
- State: useLevelEditor hook with undo/redo history
- Canvas: CanvasRenderer class with HTML Canvas API
- Constants: TILE_SIZE=32px, DEFAULT_GRASS_Y=20
- Styling: Tailwind CSS + custom classes
- Monorepo: client/ (React+Vite) + server/ (Express) + shared/

**Ready to work on:** [Next chapter/task from roadmap]
```

## Notes

- This command should be run at the beginning of each session
- It ensures you have all context needed to work effectively
- Reading order is optimized for understanding (docs → types → implementation)
- All file reads should be done in parallel when possible for speed
- Replit files provide critical environment and deployment context
