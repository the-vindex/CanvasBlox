# CLAUDE.md

This file provides quick-reference guidance to Claude Code (claude.ai/code) when working with code in this repository.

**📋 For detailed implementation workflow, testing strategy, and task structure:** See `docs/TASK_MANAGEMENT.md`

## CanvasBlox - Level Editor for Young Game Designers

A fun, browser-based level editor to help kids design their game levels before implementing them in Roblox. Vibe coded with best engineering practices - tests, types, and clean code structure. For detailed architecture and system design, see `docs/ARCHITECTURE.md`.

## Development Commands

```bash
npm run dev          # Start development server (runs tsx server/index.ts)
npm run build        # Build for production (client + server)
npm start            # Run production build
npm run check        # Type check with TypeScript

# Unit Tests (Vitest)
npm test             # Run unit tests (dot reporter: minimal output)
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report

# E2E Tests (Playwright)
npm run test:e2e     # Run E2E tests (dot reporter: minimal output)
npm run test:e2e:ui  # Run E2E tests with UI
npm run test:e2e:debug # Debug E2E tests

# Test Output Optimization
# Both test frameworks use 'dot' reporter by default for minimal console output
# This reduces AI agent token consumption by ~90% while preserving failure details
# For verbose output during debugging: npm test -- --reporter=default
# For verbose E2E output: npx playwright test --reporter=list

# Linting & Formatting (Biome)
npm run lint         # Check code for lint errors
npm run lint:fix     # Fix lint errors automatically
npm run format       # Format code with Biome
npm run format:check # Check if code is formatted

npm run db:push      # Push database schema changes with Drizzle
```

**Development Server:**
- Development server runs on port 3000 (configurable via PORT env variable)
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

**Frameworks:**
- **Vitest** - Unit/integration tests (`npm test`)
- **Playwright** - E2E tests (`npm run test:e2e`)
- **React Testing Library** - Component testing

**Test Organization:**
Tests live **next to the code** they test:
```
client/src/hooks/useLevelEditor.ts
client/src/hooks/useLevelEditor.test.ts  # ← Test next to source
```

**TDD Workflow (Critical - Don't Forget!):**
1. ✅ Write failing test FIRST (unit + e2e)
2. ✅ Implement to make it pass
3. ✅ Run all tests: `npm test && npm run test:e2e`
4. ✅ Run linter: `npm run lint:fix`
5. ✅ Commit code + tests together

**During long sessions, remember:**
- Write tests BEFORE implementation, not after
- Run BOTH unit and e2e tests before committing
- Don't skip linting

**Detailed guides:**
- `docs/TASK_MANAGEMENT.md` - Full TDD workflow and task structure
- `docs/TDD_PRINCIPLES.md` - Red-Green-Refactor cycle
- `docs/E2E_TESTING.md` - Playwright patterns and selectors

## Code Review Commands

**Available slash commands:**
- `/review-react [scope]` - Review React code quality (components, hooks, performance, a11y)
- `/review-tests [scope]` - Review test quality and coverage

**When to use:**
- After implementing features
- Before committing major changes
- When code feels complex or brittle

See `.claude/commands/` for full documentation of each command.

## Database

PostgreSQL via Neon Database with Drizzle ORM. Schema defined but storage layer not connected to routes yet. Currently using LocalStorage for persistence.

## Engineering Practices

This app is vibe coded - built for fun and creativity - but follows best practices:

- **Test-Driven Development (TDD)** - Write tests before implementation
- **Type Safety** - TypeScript with strict mode, avoid `any`
- **Code Quality** - Run `npm run lint:fix` and `npm run check` before commits
- **Code Formatting** - Biome (4-space indentation, IntelliJ style)

## Linting & Formatting Workflow

**Before every commit:**
```bash
npm run lint:fix    # Fix auto-fixable issues
npm run check       # Type check (TypeScript)
```

**Biome checks:** Code style, unused imports, complexity
**TypeScript checks:** Type correctness, interfaces, generics

Run `npm run lint` during development to catch issues early.

## Development Principles (Don't Forget!)

**Critical reminders for long sessions:**
- **Tests first** - Write tests before implementation, always
- **Run all tests** - Both unit (`npm test`) and e2e (`npm run test:e2e`) before commits
- **Code locality** - Tests live next to source files
- **Type safety** - No `any`, explicit types, strict mode
- **Small commits** - Focused changes with clear messages
- **Quality ownership** - Claude owns test quality, reads failures, fixes issues
- **Preserve working features** - Don't break what works (e.g., scrollbars)

**See also:** `docs/TASK_MANAGEMENT.md` for detailed workflow and implementation strategy
