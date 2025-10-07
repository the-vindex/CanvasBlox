# Open Questions from Auto-Implementation

This file contains questions, assumptions, and decisions made during automatic implementation.
Review this file after the auto-implementation is complete.

---

## Task 23.1: Remove scanline feature

**Question:** Should I write a test first to verify scanlines are removed, or just remove the code and update existing tests?

**Assumption/Decision:** Following TDD principles, I'll remove the code directly since the task is to REMOVE a feature (not add one). The existing tests that verify scanline functionality will fail after removal, which is the expected "red" state. Then I'll update those tests to verify the feature is gone (green state). This is a valid TDD approach for feature removal.

**Files affected:**
- `client/src/types/level.ts` - Remove `showScanlines` from EditorState (line 84)
- `client/src/components/level-editor/Toolbar.tsx` - Remove toggle switch and state (lines 103, 263-274)
- `client/src/components/level-editor/Canvas.tsx` - Remove overlay rendering (lines 101-114)
- `client/src/index.css` - Remove `.scanlines-overlay` CSS and `@keyframes scanlines` (lines 350-376)
- `client/src/components/level-editor/Canvas.test.tsx` - Remove/update 3 tests (lines 51-87)
- `e2e/visual-effects.spec.ts` - Remove 2 E2E tests (lines 9-46)
- `client/src/hooks/useLevelEditor.ts` - Remove initial state value
- `client/src/hooks/useLevelEditor.test.ts` - Update tests that check initial state

---

## Task 24.1.5: Write unit test for horizontal movement with velocity

**Question:** Should the update method take delta time in seconds or milliseconds? What should be the movement speed constant?

**Assumption/Decision:** Using delta time in seconds (common in game engines). The velocity (vx, vy) will be in pixels per second. This allows for frame-rate independent movement. Update method signature: `update(deltaTime: number)` where deltaTime is in seconds (e.g., 0.016 for 60fps).

**Files affected:**
- `client/src/game/Player.ts` - Add `update(deltaTime: number)` method
- `client/src/game/Player.test.ts` - Tests verify velocity * deltaTime = position change

---

## Task 24.1.7: Write unit test for AABB collision detection

**Question:** Should edge-touching rectangles (where edges are exactly aligned but not overlapping) be considered a collision?

**Assumption/Decision:** Edge-touching should NOT be considered a collision in the AABB system. In physics engines, touching but not overlapping typically means no collision. The AABB check uses `<` and `>` operators (not `<=` and `>=`), which is standard for AABB collision detection. This prevents false positives when objects are perfectly adjacent. For gameplay, this means a player standing exactly at a tile's edge won't register as colliding, which is the correct behavior for platform games.

**Files affected:**
- `client/src/game/collision.ts` - AABB implementation using strict inequality
- `client/src/game/collision.test.ts` - Updated test expectations

---

## Task 24.1.9: Write unit test for player not falling through platforms

**Question:** The test expects player at y=50 with vy=10 to end up at y=68 (just above platform at y=100) after 1 second. But mathematically, 50 + 10*1 = 60, which is still above the platform. Should the test have different values, or should we change the collision detection approach?

**Assumption/Decision:** The test values need adjustment. For a player to collide with a platform, the player's bottom (y + height) must reach or pass the platform's top (y). With player at y=50, height=32, the bottom is at 82. After moving with vy=10 for 1 second, the player is at y=60 (bottom at 92), which is still 8 pixels above the platform at y=100. The test should either: (1) start the player closer to the platform (e.g., y=70), (2) increase velocity to vy=20, or (3) start the player already penetrating the platform. I'll adjust the test to use vy=20 so the player penetrates the platform (60+20=80, bottom at 112, which penetrates platform at 100). Expected result: player stops at y=68 (bottom at 100, just touching platform top).

**Files affected:**
- `client/src/game/Player.test.ts` - Adjust test velocity values
- `client/src/game/Player.ts` - Implement collision detection and resolution

---

## Task 24.1.11-24.1.12: Play mode toggle and PlayMode component

**Question:** Should play mode be a separate route (`/play/:levelId`) or an overlay mode within the editor?

**Assumption/Decision:** Using overlay mode within the editor (not a separate route). Reasons:
1. **Simpler UX**: Users can toggle play/edit instantly without navigation
2. **State preservation**: Editor state (level data, zoom, pan) is already loaded
3. **Faster testing**: Quick iteration between editing and playing
4. **Less complexity**: No routing, URL params, or level loading logic needed
5. **Better for kids**: One-click "Test Your Level" button is more intuitive than navigating to a different page

Architecture:
- Add `isPlayMode: boolean` to EditorState
- Toggle button in Toolbar (similar to grid toggle)
- When `isPlayMode === true`, show PlayMode component overlay that covers the editor canvas
- PlayMode component has its own game canvas with game loop (requestAnimationFrame)
- Easy to switch back to edit mode with same toggle button

Test structure:
- E2E test location: `e2e/play-mode-toggle.spec.ts` (not in subdirectory, following existing pattern)
- Test IDs: `button-play-mode` (toggle button), `play-mode-container` (overlay), `play-mode-canvas` (game canvas)

**Files affected:**
- `client/src/types/level.ts` - Add `isPlayMode` to EditorState
- `client/src/components/level-editor/Toolbar.tsx` - Add play mode toggle button
- `client/src/components/play-mode/PlayMode.tsx` - New PlayMode component
- `client/src/pages/LevelEditor.tsx` - Conditionally render PlayMode overlay
- `e2e/play-mode-toggle.spec.ts` - E2E test for toggle functionality

---

## Task 24.1.12: PlayMode component implementation - Z-index and accessibility

**Question:** How should the PlayMode overlay be positioned to ensure the toolbar Play/Edit button remains clickable?

**Assumption/Decision:** The PlayMode overlay should NOT cover the toolbar. Current implementation has issues:
1. PlayMode has `z-50` and `position: fixed` starting at `top: '96px'`
2. Even with `pointerEvents: 'none'` on the container, the toolbar's Play button is hard to click
3. The E2E tests show that clicking with `force: true` isn't properly toggling the state

Solution: Ensure the Toolbar has explicit z-index higher than PlayMode overlay (z-100). Also verify that the onClick handler is working correctly.

**Files to check/modify:**
- `client/src/components/level-editor/Toolbar.tsx` - Add z-index to toolbar container
- `client/src/components/play-mode/PlayMode.tsx` - Verify pointerEvents and positioning

---

