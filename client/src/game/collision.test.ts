import { describe, expect, it } from 'vitest';
import { type AABB, checkAABBCollision } from './collision';

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
            // Player rect overlapping tile from the right
            const rect1: AABB = { x: 16, y: 0, width: 32, height: 32 };
            const rect2: AABB = { x: 0, y: 0, width: 32, height: 32 };

            const result = checkAABBCollision(rect1, rect2);

            expect(result.isColliding).toBe(true);
            expect(result.overlapX).toBeGreaterThan(0);
            expect(result.overlapY).toBeGreaterThan(0);
        });

        it('should detect collision between player and platform tile', () => {
            // Simulating player standing on platform
            const player: AABB = { x: 100, y: 150, width: 32, height: 32 };
            const tile: AABB = { x: 64, y: 160, width: 128, height: 32 };

            const result = checkAABBCollision(player, tile);

            expect(result.isColliding).toBe(true);
        });

        it('should not detect collision when player is above platform with gap', () => {
            // Player is above platform with a gap
            const player: AABB = { x: 100, y: 100, width: 32, height: 32 };
            const tile: AABB = { x: 64, y: 160, width: 128, height: 32 };

            const result = checkAABBCollision(player, tile);

            expect(result.isColliding).toBe(false);
        });

        it('should handle zero-sized rectangles gracefully', () => {
            const rect1: AABB = { x: 0, y: 0, width: 0, height: 0 };
            const rect2: AABB = { x: 0, y: 0, width: 32, height: 32 };

            const result = checkAABBCollision(rect1, rect2);

            expect(result.isColliding).toBe(false);
        });
    });
});
