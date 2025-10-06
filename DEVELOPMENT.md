# Development Guide

This guide covers the development workflow, tools, and best practices for contributing to CanvasBlox.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)
- [Code Quality](#code-quality)
- [Git Workflow](#git-workflow)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- Modern browser for testing

### Initial Setup

```bash
# Clone and install
git clone <repository-url>
cd CanvasBlox
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` - the app should load with HMR (Hot Module Replacement) enabled.

---

## Development Workflow

### Development Server

The development server runs on port 3000 (configurable via `PORT` env variable):

```bash
npm run dev          # Start dev server with HMR
```

**Architecture:**
- Vite runs in middleware mode alongside Express
- TypeScript compilation with `tsx` for server-side code
- Client changes hot reload automatically
- Server changes require manual restart

### Available Commands

#### Build Commands

```bash
npm run build        # Build client + server for production
npm start            # Run production build
npm run check        # Type check with TypeScript (no emit)
```

#### Testing Commands

```bash
# Unit Tests (Vitest)
npm test             # Run unit tests (dot reporter: minimal output)
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report

# E2E Tests (Playwright)
npm run test:e2e     # Run E2E tests (dot reporter: minimal output)
npm run test:e2e:ui  # Run E2E tests with UI
npm run test:e2e:debug # Debug E2E tests
```

**Test Output Optimization:**
Both test frameworks use 'dot' reporter by default for minimal console output. This reduces AI agent token consumption by ~90% while preserving failure details.

For verbose output during debugging:
```bash
npm test -- --reporter=default        # Verbose unit test output
npx playwright test --reporter=list   # Verbose E2E output
```

#### Code Quality Commands

```bash
# Linting & Formatting (Biome)
npm run lint         # Check code for lint errors
npm run lint:fix     # Fix lint errors automatically
npm run format       # Format code with Biome
npm run format:check # Check if code is formatted

# Database (Drizzle)
npm run db:push      # Push database schema changes
```

---

## Testing Strategy

### Test-Driven Development (TDD)

We follow TDD for all features:

1. **Red** - Write failing test first
2. **Green** - Implement minimal code to pass
3. **Refactor** - Clean up while keeping tests green
4. **Commit** - Save code + tests together

See [docs/TDD_PRINCIPLES.md](docs/TDD_PRINCIPLES.md) for detailed TDD workflow.

### Test Organization

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
  └── level-editor.spec.ts
```

### Testing Frameworks

**Unit/Integration Tests:**
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment

**E2E Tests:**
- **Playwright** - Browser automation
- See [docs/E2E_TESTING.md](docs/E2E_TESTING.md) for patterns

### Running Tests

#### During Development

```bash
# Watch mode (recommended during development)
npm test             # Runs unit tests, watches for changes

# Run all tests before commit
npm test && npm run test:e2e
```

#### Before Committing

**Required checks:**

```bash
npm test             # All unit tests must pass
npm run test:e2e     # All E2E tests must pass
npm run lint:fix     # Auto-fix linting issues
npm run check        # Type check must pass
```

---

## Code Quality

### TypeScript Standards

- **Strict mode** enabled
- **No `any`** - Use specific types or `unknown`
- **Explicit types** for props, state, function returns
- **Type imports** - Use `import type` when importing only types

### Code Style

**Formatter:** Biome (runs automatically)
- 4-space indentation
- IntelliJ style
- Semicolons required
- Single quotes preferred

**Linter:** Biome
- Checks code quality
- Enforces complexity limits
- Removes unused imports
- Auto-fixable issues: `npm run lint:fix`

### Best Practices

**React:**
- Functional components only (no class components)
- Custom hooks for reusable logic
- Proper dependency arrays in `useEffect`
- See [docs/REACT_BEST_PRACTICES.md](docs/REACT_BEST_PRACTICES.md)

**Performance:**
- Minimize canvas redraws
- Use `transform` and `opacity` for animations
- Debounce/throttle expensive operations
- GPU acceleration with `will-change`

**Naming Conventions:**
- Components: `PascalCase`
- Hooks: `useCamelCase`
- Utilities: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case`

---

## Git Workflow

### Commit Strategy

**After each completed task:**

1. Write tests (if applicable)
2. Implement feature
3. Run all tests: `npm test && npm run test:e2e`
4. Run linter: `npm run lint:fix`
5. Type check: `npm run check`
6. Manual test in browser
7. Commit with clear message

### Commit Message Format

```bash
# Good commit messages
feat: implement paste ghost preview workflow
fix: correct undo/redo history bug in drawing tools
refactor: extract helper functions to reduce complexity
test: add E2E tests for button numbering system
docs: update ARCHITECTURE.md with button numbering

# Pattern: <type>: <description>
# Types: feat, fix, refactor, test, docs, style, chore
```

### What to Include in Commits

- Implementation files
- Test files
- Updated documentation (if applicable)
- No commented-out code
- No console.log statements
- No temporary files

---

## Troubleshooting

### Common Issues

#### Tests Failing

```bash
# Clear test cache
npm test -- --clearCache

# Run single test file
npm test -- useLevelEditor.test.ts

# Debug with UI
npm run test:ui
```

#### Type Errors

```bash
# Check all type errors
npm run check

# Common fixes:
# - Add missing type imports
# - Fix incorrect prop types
# - Add return type annotations
```

#### Lint Errors

```bash
# Auto-fix most issues
npm run lint:fix

# Manual fixes needed for:
# - Complexity issues (extract functions)
# - Logic errors (requires refactoring)
```

#### Dev Server Issues

```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev

# Check port conflicts
lsof -i :3000
```

### Getting Help

1. Check existing documentation in `docs/`
2. Search for similar issues in commit history
3. Ask in team chat or create GitHub issue

---

## Project Structure

### Key Directories

```
client/src/
  ├── components/          # React components
  │   ├── ui/             # shadcn/ui components
  │   └── level-editor/   # Editor-specific components
  ├── hooks/              # Custom React hooks
  ├── pages/              # Page components
  ├── utils/              # Utilities and helpers
  ├── types/              # TypeScript type definitions
  └── assets/             # Static assets (icons, images)

server/
  ├── routes.ts           # API route definitions
  ├── storage.ts          # Storage abstraction
  └── index.ts            # Server entry point

e2e/                      # Playwright E2E tests
docs/                     # Documentation
shared/                   # Shared types/schemas
```

### Important Files

- `client/src/pages/LevelEditor.tsx` - Main editor page
- `client/src/hooks/useLevelEditor.ts` - Core state management
- `client/src/hooks/useCanvas.ts` - Canvas interaction logic
- `client/src/utils/canvasRenderer.ts` - Canvas rendering
- `client/src/types/level.ts` - Type definitions

---

## Development Principles

### Core Values

1. **Tests first** - Write tests before implementation
2. **Small steps** - Incremental changes, frequent commits
3. **Code locality** - Tests live next to source
4. **Type safety** - Strict TypeScript, no `any`
5. **Quality ownership** - Fix issues, don't ignore them

### Avoid These Pitfalls

- ❌ Writing code before tests
- ❌ Skipping test runs before commit
- ❌ Committing with lint/type errors
- ❌ Breaking existing features
- ❌ Pushing without running E2E tests
- ❌ Adding features without tests

---

## Performance Guidelines

### Canvas Optimization

- Minimize redraws
- Use `requestAnimationFrame` for animations
- Batch canvas operations
- Clear only dirty regions when possible

### React Optimization

- Use `React.memo` for expensive components
- `useMemo` for expensive calculations
- `useCallback` for stable function references
- Avoid inline object/array creation in JSX

---

## Additional Resources

### Internal Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Technical architecture
- [TASK_MANAGEMENT.md](docs/TASK_MANAGEMENT.md) - Task workflow
- [TDD_PRINCIPLES.md](docs/TDD_PRINCIPLES.md) - TDD methodology
- [E2E_TESTING.md](docs/E2E_TESTING.md) - E2E testing patterns
- [REACT_BEST_PRACTICES.md](docs/REACT_BEST_PRACTICES.md) - React guidelines
- [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) - Visual design system

### External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Happy coding!** 🚀
