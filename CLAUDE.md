# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CanvasBlox - Level Editor for Young Game Designers

A fun, browser-based level editor to help kids design their game levels before implementing them in Roblox. Vibe coded with best engineering practices - tests, types, and clean code structure. For detailed architecture and system design, see `docs/ARCHITECTURE.md`.

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
1. Write failing test first (BOTH unit AND e2e)
2. Implement feature to make test pass
3. Verify all tests pass (`npm test && npm run test:e2e`)
4. **Review code quality:** Run `/review-react [scope]` (see Code Review Commands section)
5. **Review test quality:** Run `/review-tests [scope]` (see Code Review Commands section)
6. Refactor code and tests based on review feedback
7. Run linter: `npm run lint:fix` before committing
8. Commit code + tests together

**⚠️ IMPORTANT:** When implementing features, write E2E tests as you build, not after!

**TDD Principles:**
See `docs/TDD_PRINCIPLES.md` for detailed TDD guidelines including:
- Red-Green-Refactor cycle
- How to add, remove, and change features with tests
- Common anti-patterns to avoid
- Practical examples

**E2E Testing Quick Reference:**

When writing Playwright tests, follow this selector priority:
1. `getByRole()` - Buttons, headings, interactive elements
2. `getByLabel()` - Form inputs
3. `getByTestId()` - Dynamic content, custom components
4. Avoid CSS/XPath selectors

Adding test IDs to components:
- ✅ ADD `data-testid` FOR: Dynamic values (zoom %, coordinates), status displays, custom components
- ❌ DON'T ADD FOR: Buttons with text, headings, labeled inputs
- Naming: Use kebab-case with semantic names: `data-testid="statusbar-zoom-display"`

Common patterns:
```typescript
// Dynamic content
const zoom = page.getByTestId('statusbar-zoom-display');
await expect(zoom).toHaveText('100%');

// Buttons (use role, not testid)
await page.getByRole('button', { name: 'Save' }).click();

// Canvas interaction
const canvas = page.getByTestId('level-canvas');
const box = await canvas.boundingBox();
await page.mouse.move(box.x + 100, box.y + 100);
```

For more examples and patterns: `docs/E2E_TESTING.md`

## Code Review Commands

Slash commands for automated code quality review during development:

### `/review-react [scope]`
Reviews React code quality against modern best practices.

**When to use:**
- After implementing new React components or features
- After major refactoring
- When you want to ensure code follows React best practices
- Before creating a pull request

**What it checks:**
- Component design (functional components, composition, separation of concerns)
- Hooks usage (rules of hooks, dependencies, custom hooks)
- TypeScript (explicit types, no `any`, proper event handlers)
- Performance (useMemo/useCallback, stable references, list keys)
- Anti-patterns (components in components, mutations, unstable dependencies)
- Accessibility (ARIA attributes, semantic HTML, keyboard navigation)

**Examples:**
```bash
/review-react LevelEditor    # Review LevelEditor component
/review-react hooks          # Review all custom hooks
/review-react                # Review changed React files (uses git diff)
```

**Output:** Detailed report with issues prioritized by severity (Critical/High/Medium/Low), specific fixes with code examples, and actionable next steps.

### `/review-tests [scope]`
Reviews test quality and coverage.

**When to use:**
- After writing new tests
- When tests feel brittle or too coupled to implementation
- To identify redundant or missing test coverage

**What it checks:**
- Tests outside the feature's scope
- Implementation coupling vs behavior testing
- Redundant or duplicate coverage
- Missing test scenarios

**Examples:**
```bash
/review-tests LevelEditor    # Review LevelEditor tests
/review-tests hooks          # Review hook tests
```

**Workflow Integration:**
Both commands are integrated into the TDD workflow (see step 4-5 above) to ensure quality before committing.

## Database

PostgreSQL via Neon Database with Drizzle ORM. Schema defined but storage layer not connected to routes yet. Currently using LocalStorage for persistence.

## Engineering Practices

This app is vibe coded - built for fun and creativity - but still follows best practices:

- **Test-Driven Development (TDD)** - Tests written before implementation
- **Automated Testing** - Good test coverage with Vitest
- **Type Safety** - TypeScript for catching bugs early
- **Modular Architecture** - Clean code organization with hooks and utilities
- **Code Quality** - Type checking with `npm run check` and linting with `npm run lint`
- **Code Formatting** - Consistent style with Biome formatter (4-space indentation, IntelliJ style)

## Linting & Formatting Workflow

**When to run linting:**
1. **Before committing** - Always run `npm run lint:fix` before creating a commit
2. **After major refactoring** - Check for unused imports, variables, or other issues
3. **When tests fail mysteriously** - Sometimes lint errors cause runtime issues
4. **Periodically during development** - Run `npm run lint` to catch issues early

**What Biome checks that TypeScript doesn't:**
- Code style and formatting (indentation, quotes, spacing)
- Unused variables and imports (warnings)
- Code complexity and best practices
- Import organization and sorting
- Potential bugs that aren't type errors

**What TypeScript checks (not Biome):**
- Type correctness and inference
- Interface implementations
- Generics and type parameters
- Module resolution

**Workflow:**
```bash
# During development - check for issues
npm run lint

# Before commit - fix auto-fixable issues
npm run lint:fix

# Verify formatting
npm run format:check

# Fix formatting
npm run format

# Always run type check separately
npm run check
```

## Development Principles

**Test Infrastructure as Product:**
- Testing tools are part of the stack - configure them properly from day one
- Automation should run silently; humans review failures, not successes
- Test output must be actionable (screenshots > logs)

**Code Locality:**
- Keep related things together - tests live next to source
- Modern patterns over legacy conventions
- Make the codebase easy to navigate

**Quality Ownership:**
- Claude owns test quality - reads failures, analyzes screenshots, fixes issues
- Temporary tests are acceptable when they prove integration (mark for cleanup)
- User-facing details matter: correct app names, real data display
