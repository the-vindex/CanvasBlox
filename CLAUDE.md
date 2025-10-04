# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CanvasBlox - Level Editor for Young Game Designers

A fun, browser-based level editor to help kids design their game levels before implementing them in Roblox. Vibe coded with best engineering practices - tests, types, and clean code structure. For detailed architecture and system design, see `replit.md`.

## Development Commands

```bash
npm run dev          # Start development server (runs tsx server/index.ts)
npm run build        # Build for production (client + server)
npm start            # Run production build
npm run check        # Type check with TypeScript

# Unit Tests (Vitest)
npm test             # Run unit tests with Vitest
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report

# E2E Tests (Playwright)
npm run test:e2e     # Run end-to-end tests
npm run test:e2e:ui  # Run E2E tests with UI
npm run test:e2e:debug # Debug E2E tests

npm run db:push      # Push database schema changes with Drizzle
```

**Development Server:**
- Development server runs on port 5000 (configurable via PORT env variable)
- Hot Module Replacement (HMR) enabled via Vite
- TypeScript compilation with tsx for server-side code

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

## Testing

**Unit & Integration Testing:**
- **Vitest** - Fast unit test runner with Vite integration
- **React Testing Library** - Component testing with user-centric queries
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment for Node.js

**E2E Testing:**
- **Playwright** - End-to-end browser testing
- Tests full user workflows in real browser
- Visual regression testing capabilities

**Test Organization:**
Tests live **next to the code** they test (modern convention):
```
client/src/
  ├── hooks/
  │   ├── useLevelEditor.ts
  │   └── useLevelEditor.test.ts        # ← Test next to source
  ├── utils/
  │   ├── canvasRenderer.ts
  │   └── canvasRenderer.test.ts        # ← Test next to source
  └── components/
      ├── TilePalette.tsx
      └── TilePalette.test.tsx          # ← Test next to source

e2e/                                    # End-to-end tests
  └── level-editor.spec.ts              # Main editor workflows
```

**TDD Workflow:**
1. Write failing test first
2. Implement feature to make test pass
3. Verify all tests pass
4. Commit code + tests together

## Database

PostgreSQL via Neon Database with Drizzle ORM. Schema defined but storage layer not connected to routes yet. Currently using LocalStorage for persistence.

## Engineering Practices

This app is vibe coded - built for fun and creativity - but still follows best practices:

- **Test-Driven Development (TDD)** - Tests written before implementation
- **Automated Testing** - Good test coverage with Vitest
- **Type Safety** - TypeScript for catching bugs early
- **Modular Architecture** - Clean code organization with hooks and utilities
- **Code Quality** - Type checking with `npm run check`

## Key Learnings

**Playwright Setup:**
- Exclude from Vite bundling: Add to `vite.config.ts` → `optimizeDeps.exclude`
- Don't serve HTML reports automatically - use `reporter: 'list'`
- Always verify actual port (was 3000, not 5000)

**Test Organization:**
- Colocate tests with source (modern): `file.ts` + `file.test.ts` in same folder
- NOT in separate `__tests__/` folders (outdated pattern)
- Configure Vitest to exclude e2e: `exclude: ['**/e2e/**']`

**Vibing with Best Practices:**
- You're the one who reads test screenshots and fixes issues
- Verify localStorage integration with temporary E2E tests (mark for deletion)
- App name matters: "Roblox Level Designer" not generic "Level Editor"
