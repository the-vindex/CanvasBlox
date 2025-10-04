# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Replit-Managed Application

This is a Replit-managed application. For detailed architecture and system design, see `replit.md`.

## Development Commands

```bash
npm run dev          # Start development server (runs tsx server/index.ts)
npm run build        # Build for production (client + server)
npm start            # Run production build
npm run check        # Type check with TypeScript
npm run db:push      # Push database schema changes with Drizzle
```

**Replit Environment:**
- Run button executes `npm run dev`
- Development server runs on port 5000 (exposed as port 80 externally)
- See `.replit` for Replit-specific configuration

## Project Architecture

**Monorepo Structure:**
- `client/` - React frontend with Vite
- `server/` - Express backend
- `shared/` - Shared types and schemas

**Key Technical Patterns:**

1. **State Management** - Custom hooks pattern (`useLevelEditor` in `client/src/hooks/useLevelEditor.ts`) manages complex editor state including undo/redo history, multi-level support, and clipboard operations

2. **Canvas Rendering** - `CanvasRenderer` class (`client/src/utils/canvasRenderer.ts`) separates rendering logic from React components. Coordinate system uses grid-based positioning with zoom/pan support

3. **Data Persistence** - LocalStorage with 5-second auto-save. JSON import/export via `LevelSerializer` utility. Database schema exists (PostgreSQL/Drizzle) but not yet wired to routes

4. **Level Data Model** (see `client/src/types/level.ts`):
   - `Tile` - Grid-based platforms with collision properties
   - `InteractableObject` - Buttons, doors, levers with linking system
   - `SpawnPoint` - Player/enemy spawn locations with AI config

5. **Development Server** - Vite runs in middleware mode alongside Express for unified dev experience with HMR

## Code Organization

- `client/src/components/level-editor/` - Editor UI components (Canvas, Toolbar, TilePalette, PropertiesPanel)
- `client/src/components/ui/` - shadcn/ui components (Radix UI primitives)
- `server/routes.ts` - API route registration
- `server/storage.ts` - Storage abstraction (currently in-memory)

## Database

PostgreSQL via Neon Database with Drizzle ORM. Schema defined but storage layer not connected to routes yet.
