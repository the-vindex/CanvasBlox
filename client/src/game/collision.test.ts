import { describe, expect, it } from 'vitest';
import { type AABB, checkAABBCollision, resolveVerticalCollision } from './collision';

describe('AABB Collision Detection', () => {
    describe('checkAABBCollision', () => {
        it('should detect collision when rectangles overlap', () => {
            const rect1: AABB = { x: 0, y: 0, width: 32, height: 32 };
            const rect2: AABB = { x: 16, y: 16, width: 32, height: 32 };

            const result = checkAABBCollision(rect1, rect2);

            expect(result.isColliding).toBe(true);
        });

        it('should not detect collision when rectangles do not overlap', () => {
            const rect1: AABB = { x: 0, y: 0, width: 32, height: 32 };
            const rect2: AABB = { x: 64, y: 64, width: 32, height: 32 };

            const result = checkAABBCollision(rect1, rect2);

            expect(result.isColliding).toBe(false);
        });

        it('should not detect collision when rectangles only touch edges', () => {
            const rect1: AABB = { x: 0, y: 0, width: 32, height: 32 };
            const rect2: AABB = { x: 32, y: 0, width: 32, height: 32 };

            const result = checkAABBCollision(rect1, rect2);

            // Edge touching (no overlap) should not be considered a collision
            expect(result.isColliding).toBe(false);
        });

        it('should detect collision when one rectangle is inside another', () => {
            const rect1: AABB = { x: 0, y: 0, width: 100, height: 100 };
            const rect2: AABB = { x: 25, y: 25, width: 20, height: 20 };

            const result = checkAABBCollision(rect1, rect2);

            expect(result.isColliding).toBe(true);
        });

        it('should return collision info with overlap distances', () => {
            // Rect1 overlapping rect2 from the right - 16px horizontal overlap, full vertical overlap
            const rect1: AABB = { x: 16, y: 0, width: 32, height: 32 };
            const rect2: AABB = { x: 0, y: 0, width: 32, height: 32 };

            const result = checkAABBCollision(rect1, rect2);

            expect(result.isColliding).toBe(true);
            expect(result.overlapX).toBe(16); // rect2 right edge (32) - rect1 left edge (16)
            expect(result.overlapY).toBe(32); // Full vertical overlap
        });

        it('should handle zero-sized rectangles gracefully', () => {
            const rect1: AABB = { x: 0, y: 0, width: 0, height: 0 };
            const rect2: AABB = { x: 0, y: 0, width: 32, height: 32 };

            const result = checkAABBCollision(rect1, rect2);

            expect(result.isColliding).toBe(false);
        });
    });

    describe('resolveVerticalCollision', () => {
        it('should detect collision from below (ceiling hit)', () => {
            // Player jumping up and hitting ceiling - player overlapping with ceiling
            const player: AABB = { x: 100, y: 20, width: 32, height: 32 }; // Player at y=20, extends to y=52
            const ceiling: AABB = { x: 64, y: 0, width: 128, height: 32 }; // Ceiling at y=0, extends to y=32
            const velocity = { x: 0, y: -5 }; // Moving upward

            const collision = checkAABBCollision(player, ceiling);
            expect(collision.isColliding).toBe(true);

            // When collision is from below, overlapY should be smaller than overlapX
            // and player should be pushed down (positive Y direction)
            const result = resolveVerticalCollision(player, ceiling, velocity);

            expect(result.side).toBe('top'); // Hit from below (top of player hit ceiling)
            expect(result.correctedY).toBe(ceiling.y + ceiling.height); // Player pushed down to y=32
            expect(result.shouldStopVerticalVelocity).toBe(true);
        });

        it('should detect collision from above (floor/platform)', () => {
            // Player falling and landing on platform
            const player: AABB = { x: 100, y: 150, width: 32, height: 32 };
            const platform: AABB = { x: 64, y: 160, width: 128, height: 32 };
            const velocity = { x: 0, y: 5 }; // Moving downward

            const collision = checkAABBCollision(player, platform);
            expect(collision.isColliding).toBe(true);

            const result = resolveVerticalCollision(player, platform, velocity);

            expect(result.side).toBe('bottom'); // Hit from above (bottom of player hit platform)
            expect(result.correctedY).toBe(platform.y - player.height); // Player pushed up to sit on platform
            expect(result.shouldStopVerticalVelocity).toBe(true);
        });

        it('should return no collision when objects are not overlapping', () => {
            const player: AABB = { x: 100, y: 50, width: 32, height: 32 };
            const platform: AABB = { x: 64, y: 160, width: 128, height: 32 };
            const velocity = { x: 0, y: 5 };

            const result = resolveVerticalCollision(player, platform, velocity);

            expect(result.side).toBeNull();
            expect(result.correctedY).toBe(player.y);
            expect(result.shouldStopVerticalVelocity).toBe(false);
        });

        it('should resolve vertical collision when both vertical and horizontal overlap exist', () => {
            // Object colliding with corner (both vertical and horizontal overlap)
            const moving: AABB = { x: 90, y: 150, width: 32, height: 32 };
            const stationary: AABB = { x: 100, y: 160, width: 128, height: 32 };
            const velocity = { x: 2, y: 5 }; // Moving down and right

            const result = resolveVerticalCollision(moving, stationary, velocity);

            // Should resolve vertically (function's purpose)
            expect(result.side).toBe('bottom');
            expect(result.correctedY).toBe(128); // 160 - 32 = 128
        });

        it('should handle velocity of zero', () => {
            // Object already overlapping but not moving - uses center positions to determine side
            const moving: AABB = { x: 100, y: 150, width: 32, height: 32 }; // Center at y=166
            const stationary: AABB = { x: 64, y: 160, width: 128, height: 32 }; // Center at y=176
            const velocity = { x: 0, y: 0 };

            const result = resolveVerticalCollision(moving, stationary, velocity);

            // Moving object center (166) above stationary center (176) = bottom collision
            expect(result.side).toBe('bottom');
            expect(result.correctedY).toBe(128); // 160 - 32 = 128
            expect(result.shouldStopVerticalVelocity).toBe(true);
        });

        it('should correctly determine collision side based on velocity direction', () => {
            // Same position, different velocities should give different results
            const player: AABB = { x: 100, y: 100, width: 32, height: 32 };
            const tile: AABB = { x: 90, y: 110, width: 64, height: 32 };

            // Moving down
            const resultDown = resolveVerticalCollision(player, tile, { x: 0, y: 5 });
            expect(resultDown.side).toBe('bottom');

            // Moving up
            const resultUp = resolveVerticalCollision(player, tile, { x: 0, y: -5 });
            expect(resultUp.side).toBe('top');
        });
    });
});
