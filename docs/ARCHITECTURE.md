# CanvasBlox - Level Editor for Young Game Designers

## Overview

CanvasBlox is a fun, creative level editor designed to help kids plan out their game levels before building them in Roblox. It's a browser-based visual canvas tool where young game designers can place tiles, objects, and spawn points, then export their designs.

Vibe coded with good engineering practices - we use tests, TypeScript, and clean architecture because even fun projects deserve quality code!

**Key Features:**
- Tile-based visual editor (drag, place, design!)
- Interactive objects (buttons, doors, levers) that can link together
- Spawn points for players and enemies
- Multiple levels with tabs (design your whole game!)
- Undo/redo (mistakes happen, no worries!)
- Auto-save to localStorage (won't lose your work)
- Export to JSON (take your designs to Roblox!)
- Properties panel to customize everything

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- **React 18** with TypeScript for the UI layer
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** for server state management and API communication

**UI Component System**
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for styling with CSS variables for theming
- Dark theme by default with customizable color schemes
- Component library includes comprehensive form controls, dialogs, tooltips, and layout primitives

**State Management Pattern**
- Custom hooks pattern for complex state logic (e.g., `useLevelEditor` hook)
- Local state with React hooks for UI state
- LocalStorage for persistence and auto-save functionality
- No global state management library - relies on React Context and prop drilling

**Canvas Rendering**
- Custom `CanvasRenderer` class for 2D canvas drawing
- Separate rendering logic from React component tree
- Grid-based coordinate system with zoom and pan support
- Pixel-perfect rendering with `imageRendering: 'pixelated'`

### Backend Architecture

**Server Framework**
- **Express.js** as the HTTP server
- Middleware-based request processing
- Custom logging middleware for API request tracking
- Vite middleware integration for development hot module replacement

**API Design**
- RESTful API pattern with `/api` prefix for all routes
- Minimal backend implementation - primarily serves as a static file server
- Storage abstraction through `IStorage` interface with in-memory implementation
- Routes are registered through a modular `registerRoutes` function

**Development Setup**
- Vite dev server runs in middleware mode alongside Express
- Custom error overlay plugin for development
- Separate build output for client (dist/public) and server (dist)
- Vitest for unit and integration testing
- TypeScript strict mode for maximum type safety

### Data Storage Solutions

**Database Schema**
- **PostgreSQL** with Drizzle ORM
- Neon Database serverless driver for connection
- Single `levels` table with JSONB column for flexible level data storage
- Schema-first approach with Zod validation through `drizzle-zod`

**Level Data Structure**
```typescript
{
  id: UUID (auto-generated)
  name: string
  description: string
  data: JSONB (contains full level structure)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Client-Side Storage**
- LocalStorage for level persistence
- Auto-save every 5 seconds
- Import/Export functionality for JSON level files
- Serialization/deserialization through `LevelSerializer` utility class

**Level Data Model**
- Metadata: version, author, dimensions, backgroundColor
- Tiles: grid-based positioning with properties (collidable, material)
- Objects: interactive elements with linking capabilities
- Spawn Points: enemy/entity spawn locations with AI behavior config

### External Dependencies

**UI & Styling**
- **Radix UI** - Headless UI primitives for accessibility
- **Tailwind CSS** - Utility-first CSS framework
- **class-variance-authority** - Component variant management
- **Lucide React** - Icon library

**Data & Forms**
- **React Hook Form** with Zod resolvers for form validation
- **Drizzle ORM** - TypeScript ORM for PostgreSQL
- **Zod** - Schema validation

**Development Tools**
- **TypeScript** - Type safety across stack
- **Vite** - Build tool with HMR and fast builds
- **tsx** - TypeScript execution for development server
- **esbuild** - Fast bundler for production server build
- **Vitest** - Fast unit test runner with Vite integration
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end browser testing framework

**Database**
- **Neon Database** - Serverless PostgreSQL
- **@neondatabase/serverless** - Database driver
- **connect-pg-simple** - PostgreSQL session store (currently unused)

**Canvas & Rendering**
- **HTML5 Canvas API** - Core rendering technology
- **embla-carousel-react** - Carousel functionality (included but usage unclear)
- **date-fns** - Date manipulation utilities

## Key Design Decisions

**Why Canvas Instead of DOM/SVG?**
- Canvas chosen for performance with large level sizes
- Pixel-perfect control for grid-based editor
- Better suited for game-like rendering requirements

**Why In-Memory Storage with Database Schema?**
- Database schema prepared for future server-side persistence
- Currently uses LocalStorage for quick prototyping
- Easy migration path to full database implementation

**Why Vite in Middleware Mode?**
- Single-server development experience
- HMR works seamlessly with Express backend
- Simplified local development and deployment

**Why Minimal Backend?**
- Focus on client-side editor functionality
- Storage abstraction allows easy backend expansion
- Database ready but not yet connected to routes

## Testing Strategy

**Why Tests for a Fun Project?**
Because even vibe-coded apps benefit from good practices! Tests help us:
- Catch bugs before kids find them
- Refactor with confidence
- Document how things work

**Test-Driven Development (TDD)**
- Write tests first, then make them pass
- Red-Green-Refactor cycle
- Focus on critical features (undo/redo, save/load, etc.)

**Test Organization**
Tests live next to the code they test (modern convention):
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

**Testing Tools**
- **Vitest** - Unit test runner
- **React Testing Library** - Component testing
- **Playwright** - E2E browser testing
- **jsdom** - DOM environment for unit tests
- **Vi mocking** - Mock utilities for localStorage, etc.