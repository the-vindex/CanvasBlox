import { describe, expect, it } from 'vitest';
import { Enemy } from './Enemy';

describe('Enemy', () => {
    describe('creation', () => {
        it('should create enemy with initial position and dimensions', () => {
            const enemy = new Enemy({ x: 100, y: 200, width: 32, height: 32 });

            expect(enemy.x).toBe(100);
            expect(enemy.y).toBe(200);
            expect(enemy.width).toBe(32);
            expect(enemy.height).toBe(32);
        });

        it('should start alive', () => {
            const enemy = new Enemy({ x: 0, y: 0, width: 32, height: 32 });

            expect(enemy.isAlive).toBe(true);
        });

        it('should have initial velocity of zero', () => {
            const enemy = new Enemy({ x: 0, y: 0, width: 32, height: 32 });

            expect(enemy.vx).toBe(0);
            expect(enemy.vy).toBe(0);
        });
    });

    describe('death', () => {
        it('should kill enemy when kill() is called', () => {
            const enemy = new Enemy({ x: 0, y: 0, width: 32, height: 32 });
            expect(enemy.isAlive).toBe(true);

            enemy.kill();

            expect(enemy.isAlive).toBe(false);
        });

        it('should remain dead after being killed', () => {
            const enemy = new Enemy({ x: 0, y: 0, width: 32, height: 32 });

            enemy.kill();
            expect(enemy.isAlive).toBe(false);

            // Call kill again
            enemy.kill();
            expect(enemy.isAlive).toBe(false);
        });
    });

    describe('update', () => {
        it('should have update method for future AI implementation', () => {
            const enemy = new Enemy({ x: 0, y: 0, width: 32, height: 32 });

            // Update method exists and can be called
            expect(() => enemy.update(0.016)).not.toThrow();
        });

        it('should not throw when updating dead enemy', () => {
            const enemy = new Enemy({ x: 0, y: 0, width: 32, height: 32 });
            enemy.kill();

            // Should not throw even when dead
            expect(() => enemy.update(0.016)).not.toThrow();
        });
    });
});
