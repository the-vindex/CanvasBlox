import { describe, expect, it } from 'vitest';
import { applyGravity, GRAVITY } from './physics';

describe('Physics System', () => {
    describe('Gravity', () => {
        it('should have a positive gravity constant', () => {
            expect(GRAVITY).toBeGreaterThan(0);
        });

        it('should apply downward acceleration to velocity', () => {
            const initialVelocityY = 0;
            const deltaTime = 1 / 60; // 60 FPS
            const newVelocityY = applyGravity(initialVelocityY, deltaTime);

            // Gravity should increase downward velocity (positive direction)
            expect(newVelocityY).toBeGreaterThan(initialVelocityY);
        });

        it('should accumulate velocity over multiple frames', () => {
            const deltaTime = 1 / 60; // 60 FPS
            let velocityY = 0;

            // Apply gravity for 3 frames
            velocityY = applyGravity(velocityY, deltaTime);
            const velocityAfterFrame1 = velocityY;

            velocityY = applyGravity(velocityY, deltaTime);
            const velocityAfterFrame2 = velocityY;

            velocityY = applyGravity(velocityY, deltaTime);
            const velocityAfterFrame3 = velocityY;

            // Each frame should increase velocity further
            expect(velocityAfterFrame2).toBeGreaterThan(velocityAfterFrame1);
            expect(velocityAfterFrame3).toBeGreaterThan(velocityAfterFrame2);
        });

        it('should apply gravity even when moving upward', () => {
            const initialVelocityY = -100; // Moving upward (strong jump)
            const deltaTime = 1 / 60;
            const newVelocityY = applyGravity(initialVelocityY, deltaTime);

            // Upward velocity should be reduced by gravity
            expect(newVelocityY).toBeGreaterThan(initialVelocityY);
            expect(newVelocityY).toBeLessThan(0); // Still moving up, but slower
        });

        it('should handle variable delta time', () => {
            const initialVelocityY = 0;
            const smallDelta = 1 / 120; // 120 FPS
            const largeDelta = 1 / 30; // 30 FPS

            const velocitySmallDelta = applyGravity(initialVelocityY, smallDelta);
            const velocityLargeDelta = applyGravity(initialVelocityY, largeDelta);

            // Larger delta time should result in larger velocity change
            expect(velocityLargeDelta).toBeGreaterThan(velocitySmallDelta);
        });
    });
});
