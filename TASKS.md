# Visual Enhancement Roadmap - Roblox Level Designer

**Status:** ✅ COMPLETE
**Current Chapter:** All chapters complete
**Last Updated:** 2025-10-08 (Completed Chapter 24: Playable Levels - ALL TASKS COMPLETE)

---

## Chapter Format

All chapters require HTML comment markers:
```markdown
```

Use `/todo-archive` to archive completed chapters. See `docs/TASK_MANAGEMENT.md` for details.

---

## Implementation Strategy

Work through chapters sequentially. After implementing each chapter:
1. User reviews the changes
2. User provides approval or feedback
3. Move to next chapter only after approval
4. Commit changes after each approved chapter

---


---

---

---

---

---

<!-- CHAPTER_START: 22 -->
## Chapter 22: Future Enhancements (P4 - Ideas)

**Status:** ⏭️ Skipped
**Files:** Various
**Priority:** Low (P4 - Ideas)

### Tasks:

#### 22.1 Enhance zoom reset to fit all content ⏭️ SKIPPED
- **Status:** ⏭️ SKIPPED - Not needed for current scope
- **Priority:** 4 (Idea/enhancement)
- **Location:** Zoom reset function in `client/src/hooks/useCanvas.ts` or zoom control handlers
- **Current:** Reset zoom sets to 100% regardless of content
- **Change:** Calculate zoom level that fits all placed content on screen (fit-to-view)
- **Implementation:**
  - Calculate bounding box of all placed objects (tiles, interactables, spawn points)
  - Determine zoom level that fits entire bounding box within viewport
  - Account for padding/margins (e.g., 10% margin around content)
  - If no objects placed, reset to 100% (current behavior)
- **Files to modify:**
  - `client/src/hooks/useCanvas.ts` or zoom control handlers
  - `client/src/utils/canvasRenderer.ts` (if zoom calculation logic exists there)
- **Tests:**
  - E2E test: Place objects → zoom reset → verify all objects visible
  - Unit test: Verify zoom calculation for various object layouts
- **Note:** Makes zoom reset more intelligent and useful for level design workflow. Tricky to implement correctly.

**Dependencies:** None
**Notes:** Low priority ideas that would be nice to have but not critical for core functionality

<!-- CHAPTER_END: 22 -->
---

<!-- CHAPTER_START: 23 -->
## Chapter 23: Cleanup & Feature Removal

**Status:** ✅ COMPLETE
**Files:** `client/src/pages/LevelEditor.tsx`, `client/src/components/level-editor/Toolbar.tsx`, `client/src/types/level.ts`, `client/src/index.css`
**Priority:** Medium (P3)

### Tasks:

#### 23.1 Remove scanline feature ✅ COMPLETE
- **Priority:** 3 (Feature)
- **Location:** Toolbar, EditorState, CSS
- **Current:** Scanline toggle exists in toolbar with showScanlines state and CSS overlay
- **Change:** Remove scanline feature completely (toggle switch, state, CSS, overlay rendering)
- **Implementation:**
  - Remove scanline toggle switch from Toolbar component
  - Remove `showScanlines` from `EditorState` type definition
  - Remove scanline overlay rendering from LevelEditor layout
  - Remove `.scanlines-overlay` CSS class and `@keyframes scanlines` animation
  - Update all references/tests that use `showScanlines`
- **Files to modify:**
  - `client/src/components/level-editor/Toolbar.tsx` - Remove switch and label
  - `client/src/types/level.ts` - Remove `showScanlines` from EditorState
  - `client/src/pages/LevelEditor.tsx` - Remove scanline overlay div and conditional rendering
  - `client/src/index.css` - Remove `.scanlines-overlay` class and animation
  - Any test files that reference scanline toggle
- **Tests:**
  - Verify scanline toggle is removed from UI
  - Verify no scanline overlay renders on canvas
  - Check that grid toggle still works (ensure we didn't break neighboring toggle)
  - Run all unit and E2E tests to ensure no regressions
- **Note:** Clean removal of unused feature to simplify UI and reduce complexity

**Dependencies:** None
**Notes:** Simplifies the UI by removing a visual effect that may not be needed

<!-- CHAPTER_END: 23 -->
---

<!-- CHAPTER_START: 24 -->
## Chapter 24: Playable Levels - Game Mode Implementation

**Status:** ✅ COMPLETE
**Files:** `client/src/components/play-mode/`, `client/src/game/`, `client/src/types/game.ts`
**Priority:** High (P1 - Core Feature)

**Goal:** Implement playable game mode where users can test their levels with player movement, physics, enemies, and win/lose conditions. Build as vertical slices - each slice fully functional before moving to next.

### Architecture Decisions:
- **Play Mode Integration:** Separate route `/play/:levelId` OR overlay mode on editor (TBD in 24.1)
- **Physics Engine:** Custom lightweight AABB collision (~100 LOC)
- **Rendering:** Reuse `CanvasRenderer` with game object extensions
- **State Management:** New `usePlayMode` hook with game loop (requestAnimationFrame)

---

### Slice 1: Basic Player Movement ✅ COMPLETE

**What was delivered:**
- ✅ Player class with position, dimensions, velocity (`client/src/game/Player.ts`)
- ✅ Keyboard input handler for ArrowKeys/WASD (`client/src/game/InputHandler.ts`)
- ✅ Horizontal movement with velocity-based physics
- ✅ AABB collision detection system (`client/src/game/collision.ts`)
- ✅ Platform collision resolution (player doesn't fall through platforms)
- ✅ PlayMode component with edit/play toggle (overlay mode)
- ✅ Game loop with requestAnimationFrame, player rendering, input handling
- ✅ Comprehensive unit tests (Player.test.ts, InputHandler.test.ts, collision.test.ts)
- ✅ E2E tests (play-mode-toggle.spec.ts, player-movement.spec.ts)
- ✅ All tests passing: 235 unit tests, 177 E2E tests

**Key files:**
- `client/src/game/Player.ts` - Player entity
- `client/src/game/InputHandler.ts` - Keyboard handling
- `client/src/game/collision.ts` - AABB collision utilities
- `client/src/components/play-mode/PlayMode.tsx` - Game canvas and loop

**Result:** Player can move left/right with arrow keys, collides with platforms, render as blue square on canvas.

---

### Slice 2: Jumping & Gravity

**Completed Foundation Work:**
- ✅ Gravity physics system (constant, applyGravity function)
- ✅ Jump input handling (spacebar/W key detection)
- ✅ Jump mechanics (upward velocity, grounded state tracking)
- ✅ Vertical collision detection (ceiling/floor resolution)
- ✅ Unit tests for all physics, jump, and collision logic

#### 24.2 Complete Jump & Gravity Integration ✅ COMPLETE
- **Priority:** High (P1 - Core Feature)
- **Locations:**
  - `client/src/game/physics.ts` - Tune constants
  - `client/src/components/play-mode/PlayMode.tsx` - Wire up jump input
  - `e2e/player-jump.spec.ts` - E2E tests
- **Implementation:**
  1. ✅ Wire up spacebar/W jump input to game loop (connect InputHandler to Player.jump())
  2. ✅ Integrate gravity application to player in game loop
  3. ✅ Integrate vertical collision resolution with platforms (ceiling + floor)
  4. ✅ Tune GRAVITY (800 px/s²) and JUMP_VELOCITY (-400 px/s) for good game feel
  5. ✅ Test jumping: Responsive, natural arc, smooth landing
- **E2E Tests:** Created `e2e/player-jump.spec.ts` with 8 tests:
  - ✅ Player can jump with spacebar and W key
  - ✅ Player jumps in realistic arc with gravity
  - ✅ Player lands smoothly on platforms
  - ✅ Player can jump over gaps
  - ✅ Player hits ceiling and falls back down
  - ✅ Player cannot jump while in air (no double jump)
  - ✅ Combined horizontal movement with jumping
- **Verification:**
  - ✅ Run `npm test && npm run test:e2e && npm run lint:fix`
  - ✅ All tests pass (254 unit, 188 E2E)
- **Delivered:** ~330 LOC (game loop integration + ceiling collision + E2E tests)

---

### Slice 3: Death & Respawn

#### 24.3.1 Implement Health & Death System ✅ COMPLETE
- **Priority:** High (P1 - Core Feature)
- **Locations:**
  - `client/src/game/Player.ts` - Health system, death, respawn
  - `client/src/game/collision.ts` - Lava detection
  - `client/src/game/Player.test.ts` - Unit tests for health/death/respawn
  - `client/src/game/collision.test.ts` - Unit tests for lava collision
- **Implementation:**
  1. Add health system to Player class:
     - `health` property (default 3, max 3)
     - `takeDamage(amount)` method - reduces health, triggers death if health <= 0
     - `isDead()` method - returns true if health <= 0
     - `isDying` state - for death animation (optional)
  2. Add death and respawn logic:
     - `die()` method - sets isDying state, stops input
     - `respawn(spawnPoint)` method - resets position to spawn point, restores health to 3
  3. Add lava collision detection:
     - `checkLavaCollision(tiles)` function in collision.ts
     - Checks if player overlaps tile with material type "lava"
     - Returns true if player touches lava
  4. Wire up lava damage in game loop:
     - Check lava collision each frame
     - Call `player.takeDamage(3)` on lava touch (instant death)
     - Call `player.respawn(spawnPoint)` when player dies
- **Unit Tests:**
  - Player.test.ts: Health state (initial 3, max 3), takeDamage reduces health, isDead when health <= 0
  - Player.test.ts: Death state, respawn resets position and health
  - collision.test.ts: Lava detection when player overlaps lava tile
  - collision.test.ts: No lava collision on regular tiles
- **Verification:**
  - Run `npm test && npm run test:e2e && npm run lint:fix`
  - All tests pass (unit + e2e, ensure no regressions)
- **Estimated:** ~150 LOC

#### 24.3.2 Implement Health UI & Integration ✅ COMPLETE
- **Priority:** High (P1 - Core Feature)
- **Locations:**
  - `client/src/components/play-mode/Hearts.tsx` - Hearts component
  - `client/src/components/play-mode/Hearts.test.tsx` - Component unit tests
  - `client/src/components/play-mode/PlayMode.tsx` - Integration
  - `e2e/play-mode/death-respawn.spec.ts` - E2E tests
- **Implementation:**
  1. Create Hearts UI component:
     - Display 3 heart icons in top-left corner
     - Filled hearts for current health (red/pink)
     - Empty hearts for lost health (gray outline)
     - Props: `health` (current), `maxHealth` (default 3)
     - Use Font Awesome heart icons or custom SVG
  2. Integrate Hearts into PlayMode:
     - Render Hearts component on top of canvas
     - Pass player.health as prop
     - Position in top-left with padding (absolute positioning)
  3. Visual polish:
     - Heart animation on damage (shake/pulse)
     - Death screen overlay (optional - "You Died" message)
- **Component Tests (Hearts.test.tsx):**
  - Renders 3 hearts with full health
  - Shows correct filled/empty hearts based on health (3/3, 2/3, 1/3, 0/3)
  - Accepts custom maxHealth prop
- **E2E Tests (death-respawn.spec.ts):**
  - Create level with lava tile and spawn point
  - Enter play mode
  - Verify 3 hearts visible
  - Move player onto lava
  - Verify player dies (health reaches 0)
  - Verify player respawns at spawn point
  - Verify health restored to 3
- **Verification:**
  - Run `npm test && npm run test:e2e && npm run lint:fix`
  - Visual test: Hearts display correctly, update on damage
- **Estimated:** ~100 LOC

---

### Slice 4: Enemy Collision

#### 24.4.1 Implement Enemy Collision Physics ✅ COMPLETE
- **Priority:** High (P1 - Core Feature)
- **Locations:**
  - `client/src/game/Enemy.ts` - Enemy class with death state
  - `client/src/game/collision.ts` - Player-enemy collision detection
  - `client/src/game/Player.ts` - Damage system integration
  - `client/src/game/Enemy.test.ts` - Enemy unit tests
  - `client/src/game/collision.test.ts` - Collision unit tests
  - `client/src/game/Player.test.ts` - Damage tests
- **Implementation:**
  1. ✅ Create Enemy class:
     - Position (x, y), dimensions (width, height), velocity (vx, vy)
     - `isAlive` property (default true)
     - `kill()` method - sets isAlive to false
     - `update(deltaTime)` method - placeholder for AI (Slice 5)
  2. ✅ Add player-enemy collision detection:
     - `checkEnemyCollision(player, enemy, playerVy)` function in collision.ts
     - AABB overlap check between player and enemy rectangles
     - Returns collision info: `{ collided: boolean, fromTop: boolean }`
  3. ✅ Add directional collision logic:
     - Determine if collision from top (stomp) or side (damage)
     - Use player vertical velocity: if `vy > 0` (falling) and player bottom near enemy top → stomp
     - 15px threshold for stomp detection
  4. Damage system ready:
     - Player already has `takeDamage(amount)` from Slice 3
     - Side collision: `player.takeDamage(1)` (lose 1 heart) - will be wired in 24.4.2
  5. Enemy death on stomp ready:
     - Top collision: `enemy.kill()` (sets isAlive to false) - will be wired in 24.4.2
     - Player bounce - will be implemented in 24.4.2
- **Unit Tests:**
  - ✅ Enemy.test.ts: Enemy creation, kill() sets isAlive to false (9 tests)
  - ✅ collision.test.ts: Player-enemy AABB collision detection (10 tests)
  - ✅ collision.test.ts: Directional collision (top vs side) based on velocity and position
  - Player.test.ts: Side collision reduces health by 1 (already tested in Slice 3)
- **Verification:**
  - ✅ Run `npm test && npm run test:e2e && npm run lint:fix`
  - ✅ All tests pass (294 unit, 192 E2E)
- **Delivered:** ~150 LOC (Enemy class + collision detection + 19 unit tests)

#### 24.4.2 Implement Invulnerability & Game Loop Integration ✅ COMPLETE
- **Priority:** High (P1 - Core Feature)
- **Locations:**
  - `client/src/game/Player.ts` - Invulnerability system
  - `client/src/components/play-mode/PlayMode.tsx` - Game loop integration
  - `client/src/game/Player.test.ts` - Invulnerability unit tests
  - `e2e/play-mode/enemy-collision.spec.ts` - E2E tests
- **Implementation:**
  1. Add invulnerability system to Player:
     - `isInvulnerable` property (default false)
     - `invulnerabilityTimer` property (seconds remaining)
     - `INVULNERABILITY_DURATION` constant (e.g., 1.5 seconds)
     - Update `takeDamage(amount)`:
       - If `isInvulnerable`, return early (no damage)
       - Otherwise, reduce health and set `isInvulnerable = true`, `invulnerabilityTimer = INVULNERABILITY_DURATION`
     - Update `update(deltaTime)`:
       - If `isInvulnerable`, decrease `invulnerabilityTimer`
       - If timer reaches 0, set `isInvulnerable = false`
  2. Add visual feedback for invulnerability:
     - In PlayMode rendering, flash player sprite (toggle visibility every 100ms)
     - Use `isInvulnerable` state to determine flashing
  3. Wire up enemy collision in game loop:
     - Load enemies from level data (spawn points with type "enemy")
     - Each frame:
       - Update all enemies (position, AI - placeholder for Slice 5)
       - Check collision between player and each enemy
       - If collision from top: `enemy.kill()`, player bounces
       - If collision from side: `player.takeDamage(1)` (respects invulnerability)
     - Remove dead enemies from game state
  4. Enemy rendering:
     - Render enemies as colored rectangles (e.g., red for zombie)
     - Don't render if `!enemy.isAlive`
- **Unit Tests (Player.test.ts):**
  - After taking damage, player is invulnerable
  - Player cannot take damage while invulnerable
  - Invulnerability expires after duration
  - Invulnerability timer decrements correctly
- **E2E Tests (enemy-collision.spec.ts):**
  - Create level with player spawn, enemy spawn (zombie), and platform
  - Enter play mode
  - Test 1: Walk into enemy from side
    - Verify player loses 1 heart
    - Verify player flashes (invulnerable)
    - Verify player cannot lose another heart immediately
  - Test 2: Jump on top of enemy
    - Verify enemy dies (disappears)
    - Verify player bounces slightly
    - Verify player health unchanged
  - Test 3: Stomp all enemies
    - Verify dead enemies no longer collide
- **Verification:**
  - Run `npm test && npm run test:e2e && npm run lint:fix`
  - Visual test: Player flashes when invulnerable, enemies die on stomp
- **Estimated:** ~150 LOC

---

### Slice 5: Enemy AI Movement ✅ COMPLETE

#### 24.5.1 Implement Enemy Patrol AI ✅ COMPLETE
- **Priority:** High (P1 - Core Feature)
- **Locations:**
  - `client/src/game/Enemy.ts` - Patrol AI logic
  - `client/src/game/Enemy.test.ts` - AI unit tests
- **Implementation:**
  1. ✅ Add movement to Enemy class:
     - `direction` property: "left" | "right" (patrol direction)
     - `PATROL_SPEED` constant (60 px/s)
     - Updated `update(deltaTime, tiles)`:
       - Apply horizontal velocity based on direction
       - Apply gravity (reuse `applyGravity` from physics.ts)
       - Update position based on velocity
  2. ✅ Add platform edge detection:
     - Lookahead check: Check ground below front edge of enemy
     - If no ground detected below → edge detected
     - Reverse direction via `reverseDirection()` method
  3. ✅ Add wall collision detection:
     - Check for tile collision ahead of enemy (horizontal AABB check)
     - If tile detected → wall collision
     - Reverse direction
  4. ✅ Patrol state machine:
     - `reverseDirection()` method - toggles direction left ↔ right
     - Called on edge detection or wall collision
- **Unit Tests (Enemy.test.ts):**
  - ✅ 24 comprehensive tests covering:
    - Direction and movement (4 tests)
    - Gravity physics (3 tests)
    - Platform collision (2 tests)
    - Edge detection (3 tests)
    - Wall collision (3 tests)
    - Direction reversal (2 tests)
    - Dead enemy behavior (2 tests)
- **Verification:**
  - ✅ Run `npm test && npm run test:e2e && npm run lint:fix`
  - ✅ All 319 unit tests pass, 192 E2E tests pass (7 skipped)
- **Delivered:** ~200 LOC (Enemy patrol AI + 24 unit tests)

#### 24.5.2 Integrate Enemy AI & Complete Playable Level ✅ COMPLETE
- **Priority:** High (P1 - Core Feature)
- **Locations:**
  - `client/src/components/play-mode/PlayMode.tsx` - Enemy AI integration
  - `e2e/play-mode/enemy-ai.spec.ts` - E2E tests
- **Implementation:**
  1. ✅ Wire up enemy AI in game loop (PlayMode.tsx):
     - Each frame, call `enemy.update(deltaTime, tiles)` for all living enemies
     - Enemies apply their own physics (gravity, movement)
     - Enemies detect edges and walls, reverse direction
     - Fixed tile coordinate conversion (grid → pixel coordinates)
  2. ✅ Enemy-tile collision integration:
     - Enemies collide with platforms (don't fall through)
     - Platform collision logic handled in Enemy class
  3. ✅ Visual polish:
     - Enemies render with distinct red color (#ef4444)
     - Red outline for visibility (#dc2626)
  4. ✅ Final testing and tuning:
     - PATROL_SPEED is 60 px/s (good game feel)
     - Enemies don't get stuck (edge/wall detection working)
     - Enemies respect level boundaries
- **E2E Tests (enemy-ai.spec.ts):**
  - ✅ 6 comprehensive tests:
    - Enemy patrols on platform
    - Enemy turns at platform edge
    - Enemy turns at wall
    - Multiple enemies patrol independently
    - Player takes damage from patrolling enemy
    - Player can stomp patrolling enemy
- **Final Verification:**
  - ✅ Run `npm test && npm run test:e2e && npm run lint:fix`
  - ✅ Full test suite passes (319 unit tests, 198 E2E tests)
  - ✅ Linter passes (no new warnings)
- **Delivered:** ~120 LOC (tile conversion + 6 E2E tests)

**🎉 Upon completion: Full playable level with physics, enemies, health, and win/lose conditions!**

---

**Notes:**
- Each task delivers a complete, working feature (not micro-steps)
- TDD approach: Write tests and implementation together in same commit
- Run both unit tests (`npm test`) and E2E tests (`npm run test:e2e`) before marking complete
- Start with simple colored rectangles for sprites, add art later
- Physics tuning (jump height, gravity, patrol speed) happens during implementation

**Task Summary:**
- **Slice 1**: Basic Player Movement - ✅ COMPLETE
- **Slice 2**: Jumping & Gravity - ✅ COMPLETE
- **Slice 3**: Death & Respawn - ✅ COMPLETE
- **Slice 4**: Enemy Collision - ✅ COMPLETE
- **Slice 5**: Enemy AI Movement - ✅ COMPLETE

**🎉 All tasks complete!**

**Next task for `/next`**: Chapter 24 is complete!

<!-- CHAPTER_END: 24 -->
---

## Technical Context

### Current Architecture:
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS + custom CSS
- **Components:** shadcn/ui (Radix primitives)
- **State:** Custom hooks (useLevelEditor, useCanvas)
- **Canvas:** HTML Canvas API with CanvasRenderer class

### Key Files:
- `client/src/pages/LevelEditor.tsx` - Main layout
- `client/src/hooks/useLevelEditor.ts` - State management
- `client/src/hooks/useCanvas.ts` - Canvas interaction
- `client/src/utils/canvasRenderer.ts` - Drawing logic
- `client/src/types/level.ts` - Type definitions
- `client/src/index.css` - Global styles

### Important Classes/Patterns:
- Dark theme throughout (dark gray backgrounds)
- Primary color: Blue (hsl(217 91% 60%))
- Border color: hsl(0 0% 23%)
- All interactive elements have transitions
- Font Awesome icons used for UI icons
- Custom SVG icons for tools and tiles

### Performance Considerations:
- Canvas redraws on every state change
- Keep animations GPU-accelerated (transform, opacity)
- Use will-change for animated elements
- Debounce/throttle expensive operations

---

## Progress Tracking

| Chapter | Status | Approved | Notes |
|---------|--------|----------|-------|
| 22. Future Enhancements | ⏭️ Skipped | N/A | Zoom fit-to-view skipped (not needed) |
| 23. Cleanup & Feature Removal | ✅ Completed | N/A | Remove scanline feature |
| 24. Playable Levels | ✅ Completed | N/A | Game mode with player movement, physics, enemies (All 5 slices complete!) |

**Legend - use only these statuses:**
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Completed
- ⏭️ Skipped

**Note:** Use "✅ COMPLETE" format (not "+ TESTED") when marking tasks complete

---

## Next Steps

**Recommended Priority Order:**


**Completed Chapters:**
- ✅ Chapter 8-10: Visual enhancements
- ✅ Chapter 13: E2E test simplification (-9 tests, -527 lines, helper functions)
- ✅ Chapter 14: E2E test organization (13 focused files)
- ✅ Chapter 16: Bug fixes (import/export/toast selector)
- ✅ Chapter 19: Undo/redo history preservation (per-level history)

---

## Notes & Decisions

_(Add notes here as implementation progresses)_

