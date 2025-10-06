# CanvasBlox

**A fun, browser-based level editor for young game designers**

CanvasBlox helps kids design their game levels before implementing them in Roblox. It's a creative visual canvas tool where young designers can place tiles, objects, and spawn points, then export their designs.

Vibe coded with good engineering practices - we use tests, TypeScript, and clean architecture because even fun projects deserve quality code!

---

## ✨ Features

- **Tile-based visual editor** - Drag, place, and design with intuitive tools
- **Drawing tools** - Pen, line, and rectangle tools for quick level creation
- **Interactive objects** - Buttons, doors, and levers that link together
- **Spawn points** - Configure player and enemy starting positions
- **Multiple levels** - Design your whole game with tabbed level management
- **Undo/redo** - Mistakes happen, no worries!
- **Auto-save** - Won't lose your work (saves to localStorage every 5 seconds)
- **Import/Export** - Save as JSON and take your designs anywhere
- **Properties panel** - Customize everything with detailed controls

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd CanvasBlox

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to start designing!

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run check        # Type check with TypeScript

# Testing
npm test             # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:ui      # Run tests with UI

# Code Quality
npm run lint         # Check code for lint errors
npm run lint:fix     # Fix lint errors automatically
npm run format       # Format code with Biome
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development workflow and guidelines.

---

## 📚 Documentation

### For Developers

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development workflow, testing, and tooling
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and technical design
- **[docs/TASK_MANAGEMENT.md](docs/TASK_MANAGEMENT.md)** - Task workflow and implementation strategy
- **[CLAUDE.md](CLAUDE.md)** - Claude Code (AI assistant) instructions

### For Testing

- **[docs/TDD_PRINCIPLES.md](docs/TDD_PRINCIPLES.md)** - Test-Driven Development methodology
- **[docs/E2E_TESTING.md](docs/E2E_TESTING.md)** - Playwright E2E testing patterns
- **[docs/REACT_BEST_PRACTICES.md](docs/REACT_BEST_PRACTICES.md)** - React code quality guidelines

### For Design

- **[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** - Visual design system and patterns
- **[docs/LEVEL_DATA_FORMAT.md](docs/LEVEL_DATA_FORMAT.md)** - Level JSON format reference

### Project Management

- **[TASKS.md](TASKS.md)** - Current task backlog and roadmap
- **[docs/OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md)** - Implementation decisions log
- **[docs/EXPERIMENTS.md](docs/EXPERIMENTS.md)** - Research and experiments log

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- HTML5 Canvas for rendering

**Backend:**
- Express.js
- PostgreSQL + Drizzle ORM (schema ready, not yet connected)

**Testing:**
- Vitest (unit tests)
- Playwright (E2E tests)
- React Testing Library

### Project Structure

```
client/               # React frontend
  src/
    components/       # UI components
    hooks/           # Custom React hooks
    pages/           # Page components
    utils/           # Utilities and helpers
    types/           # TypeScript types

server/              # Express backend
  routes.ts          # API routes
  index.ts           # Server entry point

e2e/                 # End-to-end tests
docs/                # Documentation
shared/              # Shared types and schemas
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical architecture.

---

## 🧪 Testing

We follow **Test-Driven Development (TDD)**:

1. Write failing test first
2. Implement to make it pass
3. Run all tests: `npm test && npm run test:e2e`
4. Refactor if needed

Tests live **next to the code** they test:

```
client/src/hooks/useLevelEditor.ts
client/src/hooks/useLevelEditor.test.ts  ← Test next to source
```

**Current Test Stats:**
- 189 unit tests
- 148 E2E tests
- Total: 337 tests passing

See [docs/TDD_PRINCIPLES.md](docs/TDD_PRINCIPLES.md) for TDD methodology.

---

## 🎨 Design Philosophy

**Minimalist and functional** - We focus on value over decoration:

- Dark theme optimized for long editing sessions
- Color-coded tools (blue for selection, green for drawing, purple for linking)
- Fast animations (200-400ms max)
- Pixel-perfect grid-based rendering
- Mario-inspired sky blue canvas background

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for complete design system.

---

## 🤝 Contributing

### Development Workflow

1. Pick a task from [TASKS.md](TASKS.md)
2. Write tests first (TDD)
3. Implement feature
4. Run `npm test && npm run test:e2e`
5. Run `npm run lint:fix`
6. Commit with clear message

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed contribution guidelines.

### Code Quality Standards

- **TypeScript** - Strict mode, avoid `any`
- **Testing** - 85%+ unit test coverage
- **Linting** - Biome (4-space indentation, IntelliJ style)
- **Formatting** - Auto-formatted on commit

---

## 📄 License

[Add license information here]

---

## 🙏 Acknowledgments

Built with love for young game designers who dream big! 🎮

Special thanks to:
- shadcn/ui for beautiful components
- Radix UI for accessible primitives
- The React and TypeScript communities

---

**Happy level designing!** 🚀
