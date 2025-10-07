# Visual Enhancement Roadmap - Roblox Level Designer

**Status:** ✅ COMPLETE
**Current Chapter:** All chapters complete
**Last Updated:** 2025-10-06 (Updated chapter statuses - ALL TASKS COMPLETE)

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

**Status:** ⏸️ Not Started
**Files:** `client/src/components/play-mode/`, `client/src/game/`, `client/src/types/game.ts`
**Priority:** High (P1 - Core Feature)

**Goal:** Implement playable game mode where users can test their levels with player movement, physics, enemies, and win/lose conditions. Build as vertical slices - each slice fully functional before moving to next.

### Architecture Decisions:
- **Play Mode Integration:** Separate route `/play/:levelId` OR overlay mode on editor (TBD in 24.1)
- **Physics Engine:** Custom lightweight AABB collision (~100 LOC)
- **Rendering:** Reuse `CanvasRenderer` with game object extensions
- **State Management:** New `usePlayMode` hook with game loop (requestAnimationFrame)

---

### Slice 1: Basic Player Movement

#### 24.1.1 Write unit test for Player class ✅ COMPLETE
- **Location:** `client/src/game/Player.test.ts`
- **Test:** Player class with position (x, y), dimensions (width, height), velocity (vx, vy)
- **Verify:** Constructor initializes properties, getters return correct values

#### 24.1.2 Implement Player class with basic properties ✅ COMPLETE
- **Location:** `client/src/game/Player.ts`
- **Implementation:** Player entity class with position, dimensions, velocity properties
- **Properties:** `x`, `y`, `width`, `height`, `vx`, `vy`

#### 24.1.3 Write unit test for keyboard input handler ✅ COMPLETE
- **Location:** `client/src/game/InputHandler.test.ts`
- **Test:** Keyboard input captures ArrowLeft/ArrowRight/A/D keys
- **Verify:** Key down sets direction, key up clears direction

#### 24.1.4 Implement keyboard input handler ✅ COMPLETE
- **Location:** `client/src/game/InputHandler.ts`
- **Implementation:** Event listeners for keyboard input, state tracking for active keys

#### 24.1.5 Write unit test for horizontal movement with velocity ✅ COMPLETE
- **Location:** `client/src/game/Player.test.ts`
- **Test:** Player moves left/right based on input, velocity applies correctly

#### 24.1.6 Implement horizontal movement logic ✅ COMPLETE
- **Location:** `client/src/game/Player.ts`
- **Implementation:** `update()` method applies velocity to position

#### 24.1.7 Write unit test for AABB collision detection with tiles ✅ COMPLETE
- **Location:** `client/src/game/collision.test.ts`
- **Test:** AABB collision detection between rectangles (player vs tile)
- **Verify:** Detects overlaps, returns collision info

#### 24.1.8 Implement AABB collision detection utility ✅ COMPLETE
- **Location:** `client/src/game/collision.ts`
- **Implementation:** AABB collision functions for rectangles

#### 24.1.9 Write unit test for player not falling through platforms ✅ COMPLETE
- **Location:** `client/src/game/Player.test.ts`
- **Test:** Player collides with platform tiles, doesn't fall through

#### 24.1.10 Implement platform collision logic ✅ COMPLETE
- **Location:** `client/src/game/Player.ts`
- **Implementation:** Collision resolution with tiles, position correction

#### 24.1.11 Write E2E test for play mode toggle button ⏸️ Not Started
- **Location:** `e2e/play-mode/play-mode-toggle.spec.ts`
- **Test:** Toggle between edit and play mode, verify UI changes

#### 24.1.12 Implement PlayMode component with edit/play toggle ⏸️ Not Started
- **Location:** `client/src/components/play-mode/PlayMode.tsx`
- **Implementation:** Component with game canvas, play/edit toggle button
- **Decision:** Determine if separate route or overlay mode

#### 24.1.13 Write E2E test for player keyboard controls ⏸️ Not Started
- **Location:** `e2e/play-mode/player-movement.spec.ts`
- **Test:** Enter play mode, press arrow keys, verify player moves

#### 24.1.14 Integrate Player rendering into PlayMode canvas ⏸️ Not Started
- **Location:** `client/src/components/play-mode/PlayMode.tsx`, `client/src/utils/canvasRenderer.ts`
- **Implementation:** Game loop with requestAnimationFrame, player rendering

#### 24.1.15 Run full test suite and lint for Slice 1 ⏸️ Not Started
- **Commands:** `npm test && npm run test:e2e && npm run lint:fix`
- **Verify:** All tests pass, no lint errors, player movement works

---

### Slice 2: Jumping & Gravity

#### 24.2.1 Write unit test for gravity constant and falling ⏸️ Not Started
- **Location:** `client/src/game/physics.test.ts`
- **Test:** Gravity constant applies downward acceleration

#### 24.2.2 Implement gravity system with velocity accumulation ⏸️ Not Started
- **Location:** `client/src/game/physics.ts`, `client/src/game/Player.ts`
- **Implementation:** Gravity constant, velocity accumulation in update loop

#### 24.2.3 Write unit test for jump input (spacebar) ⏸️ Not Started
- **Location:** `client/src/game/InputHandler.test.ts`
- **Test:** Spacebar triggers jump action

#### 24.2.4 Implement jump mechanics with upward velocity ⏸️ Not Started
- **Location:** `client/src/game/Player.ts`
- **Implementation:** Jump applies negative velocity when on ground

#### 24.2.5 Write unit test for vertical collision (ceiling/floor) ⏸️ Not Started
- **Location:** `client/src/game/collision.test.ts`
- **Test:** Detect collision from above/below

#### 24.2.6 Implement vertical collision detection ⏸️ Not Started
- **Location:** `client/src/game/collision.ts`
- **Implementation:** Vertical collision resolution

#### 24.2.7 Write unit test for jump arc physics ⏸️ Not Started
- **Location:** `client/src/game/Player.test.ts`
- **Test:** Jump creates realistic arc with gravity

#### 24.2.8 Tune jump velocity and gravity constants ⏸️ Not Started
- **Location:** `client/src/game/physics.ts`
- **Implementation:** Adjust constants for good game feel

#### 24.2.9 Write E2E test for jumping over gaps ⏸️ Not Started
- **Location:** `e2e/play-mode/player-jump.spec.ts`
- **Test:** Player jumps, clears gaps, lands on platforms

#### 24.2.10 Wire up spacebar jump input to game loop ⏸️ Not Started
- **Location:** `client/src/components/play-mode/PlayMode.tsx`
- **Implementation:** Connect input handler to player jump

#### 24.2.11 Run full test suite and lint for Slice 2 ⏸️ Not Started
- **Commands:** `npm test && npm run test:e2e && npm run lint:fix`
- **Verify:** Jump and gravity work correctly

---

### Slice 3: Death & Respawn

#### 24.3.1 Write unit test for health state (3 hearts) ⏸️ Not Started
- **Location:** `client/src/game/Player.test.ts`
- **Test:** Player has health property (max 3), can take damage

#### 24.3.2 Implement health system in Player class ⏸️ Not Started
- **Location:** `client/src/game/Player.ts`
- **Implementation:** Health property, takeDamage(), isDead() methods

#### 24.3.3 Write unit test for lava tile collision detection ⏸️ Not Started
- **Location:** `client/src/game/collision.test.ts`
- **Test:** Detect when player touches lava tile

#### 24.3.4 Implement lava detection in collision system ⏸️ Not Started
- **Location:** `client/src/game/collision.ts`
- **Implementation:** Check tile material type, return lava collision

#### 24.3.5 Write unit test for death state and respawn ⏸️ Not Started
- **Location:** `client/src/game/Player.test.ts`
- **Test:** Death sets state, respawn resets position and health

#### 24.3.6 Implement death logic and respawn at spawn point ⏸️ Not Started
- **Location:** `client/src/game/Player.ts`
- **Implementation:** Death state, respawn() method

#### 24.3.7 Write unit test for Hearts UI component ⏸️ Not Started
- **Location:** `client/src/components/play-mode/Hearts.test.tsx`
- **Test:** Renders 3 hearts, shows filled/empty based on health

#### 24.3.8 Implement Hearts UI component (3 hearts display) ⏸️ Not Started
- **Location:** `client/src/components/play-mode/Hearts.tsx`
- **Implementation:** React component showing heart icons

#### 24.3.9 Write E2E test for lava death and respawn ⏸️ Not Started
- **Location:** `e2e/play-mode/death-respawn.spec.ts`
- **Test:** Player touches lava, dies, respawns at spawn point

#### 24.3.10 Integrate health UI into PlayMode overlay ⏸️ Not Started
- **Location:** `client/src/components/play-mode/PlayMode.tsx`
- **Implementation:** Render Hearts component on top of canvas

#### 24.3.11 Run full test suite and lint for Slice 3 ⏸️ Not Started
- **Commands:** `npm test && npm run test:e2e && npm run lint:fix`
- **Verify:** Death, respawn, and health UI work

---

### Slice 4: Enemy Collision

#### 24.4.1 Write unit test for player-enemy AABB collision ⏸️ Not Started
- **Location:** `client/src/game/collision.test.ts`
- **Test:** Detect collision between player and enemy rectangles

#### 24.4.2 Implement player-enemy collision detection ⏸️ Not Started
- **Location:** `client/src/game/collision.ts`
- **Implementation:** AABB check for player-enemy overlap

#### 24.4.3 Write unit test for directional collision (top vs side) ⏸️ Not Started
- **Location:** `client/src/game/collision.test.ts`
- **Test:** Determine if collision from top (stomp) or side (damage)

#### 24.4.4 Implement directional collision logic ⏸️ Not Started
- **Location:** `client/src/game/collision.ts`
- **Implementation:** Compare velocities/positions to determine direction

#### 24.4.5 Write unit test for damage system (lose 1 heart) ⏸️ Not Started
- **Location:** `client/src/game/Player.test.ts`
- **Test:** Side collision with enemy reduces health by 1

#### 24.4.6 Implement damage on side collision ⏸️ Not Started
- **Location:** `client/src/game/Player.ts`
- **Implementation:** takeDamage() called on side collision

#### 24.4.7 Write unit test for enemy death from top collision ⏸️ Not Started
- **Location:** `client/src/game/Enemy.test.ts`
- **Test:** Top collision (stomp) kills enemy

#### 24.4.8 Implement enemy death on stomp ⏸️ Not Started
- **Location:** `client/src/game/Enemy.ts`
- **Implementation:** Enemy class with death state, kill() method

#### 24.4.9 Write unit test for invulnerability frames ⏸️ Not Started
- **Location:** `client/src/game/Player.test.ts`
- **Test:** After taking damage, player is invulnerable briefly

#### 24.4.10 Implement invulnerability system (brief immunity) ⏸️ Not Started
- **Location:** `client/src/game/Player.ts`
- **Implementation:** Invulnerability timer, visual feedback (flashing)

#### 24.4.11 Write E2E test for enemy collision interactions ⏸️ Not Started
- **Location:** `e2e/play-mode/enemy-collision.spec.ts`
- **Test:** Walk into zombie (lose heart), jump on zombie (kill it)

#### 24.4.12 Wire up enemy collision checks in game loop ⏸️ Not Started
- **Location:** `client/src/components/play-mode/PlayMode.tsx`
- **Implementation:** Check collisions each frame, apply effects

#### 24.4.13 Run full test suite and lint for Slice 4 ⏸️ Not Started
- **Commands:** `npm test && npm run test:e2e && npm run lint:fix`
- **Verify:** Enemy collision mechanics work correctly

---

### Slice 5: Enemy AI Movement

#### 24.5.1 Write unit test for enemy horizontal movement ⏸️ Not Started
- **Location:** `client/src/game/Enemy.test.ts`
- **Test:** Enemy moves left/right with velocity

#### 24.5.2 Implement basic enemy movement (left/right) ⏸️ Not Started
- **Location:** `client/src/game/Enemy.ts`
- **Implementation:** Enemy update() moves in current direction

#### 24.5.3 Write unit test for enemy gravity application ⏸️ Not Started
- **Location:** `client/src/game/Enemy.test.ts`
- **Test:** Gravity affects enemies like player

#### 24.5.4 Apply gravity physics to enemies ⏸️ Not Started
- **Location:** `client/src/game/Enemy.ts`
- **Implementation:** Enemy affected by gravity in update()

#### 24.5.5 Write unit test for edge detection and turn around ⏸️ Not Started
- **Location:** `client/src/game/Enemy.test.ts`
- **Test:** Enemy detects platform edge, reverses direction

#### 24.5.6 Implement turn around at platform edges ⏸️ Not Started
- **Location:** `client/src/game/Enemy.ts`
- **Implementation:** Raycast or lookahead check for edges

#### 24.5.7 Write unit test for wall collision turn around ⏸️ Not Started
- **Location:** `client/src/game/Enemy.test.ts`
- **Test:** Enemy hits wall, reverses direction

#### 24.5.8 Implement turn around at walls ⏸️ Not Started
- **Location:** `client/src/game/Enemy.ts`
- **Implementation:** Tile collision reverses direction

#### 24.5.9 Write unit test for patrol state machine ⏸️ Not Started
- **Location:** `client/src/game/Enemy.test.ts`
- **Test:** Enemy state (patrolLeft, patrolRight) controls behavior

#### 24.5.10 Implement patrol behavior with direction state ⏸️ Not Started
- **Location:** `client/src/game/Enemy.ts`
- **Implementation:** State machine for patrol direction

#### 24.5.11 Write E2E test for enemy AI patrol ⏸️ Not Started
- **Location:** `e2e/play-mode/enemy-ai.spec.ts`
- **Test:** Enemy patrols platform, turns at edges and walls

#### 24.5.12 Integrate enemy AI updates into game loop ⏸️ Not Started
- **Location:** `client/src/components/play-mode/PlayMode.tsx`
- **Implementation:** Update all enemies each frame

#### 24.5.13 Run full test suite and lint for Slice 5 ⏸️ Not Started
- **Commands:** `npm test && npm run test:e2e && npm run lint:fix`
- **Verify:** Enemy AI works, full playable level complete

---

**Notes:**
- Each slice is fully functional before moving to next
- TDD approach: Write test first, then implement
- Run both unit tests (`npm test`) and E2E tests (`npm run test:e2e`) after each slice
- Start with simple colored rectangles for sprites, add art later
- Physics tuning (jump height, gravity) happens iteratively

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
| 24. Playable Levels | ⏸️ Not Started | N/A | Game mode with player movement, physics, enemies (63 tasks across 5 slices) |

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

