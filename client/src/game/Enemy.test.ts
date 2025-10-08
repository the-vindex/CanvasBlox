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

    describe('patrol AI', () => {
        describe('direction and movement', () => {
            it('should start with default patrol direction (left)', () => {
                const enemy = new Enemy({ x: 100, y: 200, width: 32, height: 32 });

                expect(enemy.direction).toBe('left');
            });

            it('should move left when direction is left', () => {
                const enemy = new Enemy({ x: 100, y: 200, width: 32, height: 32 });
                const deltaTime = 0.016; // ~60fps
                const tiles: any[] = []; // No tiles for this test

                enemy.update(deltaTime, tiles);

                // Enemy should move left (negative x velocity)
                expect(enemy.x).toBeLessThan(100);
            });

            it('should move right when direction is right', () => {
                const enemy = new Enemy({ x: 100, y: 200, width: 32, height: 32 });
                enemy.direction = 'right';
                const deltaTime = 0.016;
                const tiles: any[] = [];

                enemy.update(deltaTime, tiles);

                // Enemy should move right (positive x velocity)
                expect(enemy.x).toBeGreaterThan(100);
            });

            it('should apply patrol speed as horizontal velocity', () => {
                const enemy = new Enemy({ x: 100, y: 200, width: 32, height: 32 });
                const deltaTime = 1.0; // 1 second for easier calculation
                const tiles: any[] = [];

                // Moving left should apply negative velocity
                enemy.direction = 'left';
                enemy.update(deltaTime, tiles);
                const leftDistance = Math.abs(enemy.x - 100);

                // Moving right should apply positive velocity
                const enemy2 = new Enemy({ x: 100, y: 200, width: 32, height: 32 });
                enemy2.direction = 'right';
                enemy2.update(deltaTime, tiles);
                const rightDistance = Math.abs(enemy2.x - 100);

                // Both should move same distance
                expect(leftDistance).toBeCloseTo(rightDistance, 1);
            });
        });

        describe('gravity', () => {
            it('should apply gravity to vertical velocity', () => {
                const enemy = new Enemy({ x: 100, y: 100, width: 32, height: 32 });
                const deltaTime = 0.016;
                const tiles: any[] = [];

                const initialVy = enemy.vy;
                enemy.update(deltaTime, tiles);

                // Vertical velocity should increase (downward)
                expect(enemy.vy).toBeGreaterThan(initialVy);
            });

            it('should fall downward when no platforms below', () => {
                const enemy = new Enemy({ x: 100, y: 100, width: 32, height: 32 });
                const deltaTime = 0.016;
                const tiles: any[] = []; // No platforms

                enemy.update(deltaTime, tiles);

                // Enemy should move down (y increases)
                expect(enemy.y).toBeGreaterThan(100);
            });

            it('should accumulate gravity over multiple frames', () => {
                const enemy = new Enemy({ x: 100, y: 100, width: 32, height: 32 });
                const deltaTime = 0.016;
                const tiles: any[] = [];

                // Update multiple times
                enemy.update(deltaTime, tiles);
                const firstY = enemy.y;
                enemy.update(deltaTime, tiles);
                const secondY = enemy.y;

                // Should fall faster on second frame due to accumulated gravity
                const firstDelta = firstY - 100;
                const secondDelta = secondY - firstY;
                expect(secondDelta).toBeGreaterThan(firstDelta);
            });
        });

        describe('platform collision', () => {
            it('should stop falling when landing on platform', () => {
                const enemy = new Enemy({ x: 100, y: 100, width: 32, height: 32 });
                const deltaTime = 0.016; // Normal frame time
                const tiles = [
                    {
                        position: { x: 80, y: 150 },
                        dimensions: { width: 100, height: 32 },
                        properties: { collidable: true },
                    },
                ];

                // Fall onto platform (update multiple times)
                for (let i = 0; i < 30; i++) {
                    enemy.update(deltaTime, tiles);
                }

                // Enemy should land on top of platform (or very close due to physics)
                expect(enemy.y).toBeCloseTo(150 - 32, 0); // Platform top minus enemy height
                expect(enemy.vy).toBe(0); // Vertical velocity should stop
            });

            it('should not fall through collidable platforms', () => {
                const enemy = new Enemy({ x: 100, y: 100, width: 32, height: 32 });
                const deltaTime = 0.016;
                const tiles = [
                    {
                        position: { x: 80, y: 140 },
                        dimensions: { width: 100, height: 32 },
                        properties: { collidable: true },
                    },
                ];

                // Update multiple times
                for (let i = 0; i < 10; i++) {
                    enemy.update(deltaTime, tiles);
                }

                // Enemy should stay on or above platform, never below it
                expect(enemy.y).toBeLessThanOrEqual(140 - 32);
            });
        });

        describe('edge detection', () => {
            it('should detect platform edge and reverse direction', () => {
                // Enemy on platform with edge ahead
                const enemy = new Enemy({ x: 150, y: 118, width: 32, height: 32 });
                enemy.direction = 'right';
                const deltaTime = 0.016;

                // Platform that enemy is standing on (ends at x=200)
                const tiles = [
                    {
                        position: { x: 100, y: 150 },
                        dimensions: { width: 100, height: 32 }, // Ends at x=200
                        properties: { collidable: true },
                    },
                ];

                const initialDirection = enemy.direction;

                // Move enemy toward edge
                for (let i = 0; i < 60; i++) {
                    enemy.update(deltaTime, tiles);
                }

                // Enemy should have reversed direction at the edge
                expect(enemy.direction).not.toBe(initialDirection);
            });

            it('should not reverse direction when on solid ground', () => {
                const enemy = new Enemy({ x: 120, y: 118, width: 32, height: 32 });
                enemy.direction = 'right';
                const deltaTime = 0.016;

                // Wide platform - no edges nearby
                const tiles = [
                    {
                        position: { x: 0, y: 150 },
                        dimensions: { width: 500, height: 32 },
                        properties: { collidable: true },
                    },
                ];

                // Move a few frames
                for (let i = 0; i < 10; i++) {
                    enemy.update(deltaTime, tiles);
                }

                // Direction should stay the same (no edge detected)
                expect(enemy.direction).toBe('right');
            });

            it('should check for edge in front, not behind', () => {
                const enemy = new Enemy({ x: 220, y: 118, width: 32, height: 32 });
                enemy.direction = 'left'; // Moving left
                const deltaTime = 0.016;

                // Platform with edge on the right (behind enemy)
                const tiles = [
                    {
                        position: { x: 100, y: 150 },
                        dimensions: { width: 120, height: 32 }, // Ends at x=220
                        properties: { collidable: true },
                    },
                ];

                // Move left - should not reverse because edge is behind
                for (let i = 0; i < 10; i++) {
                    enemy.update(deltaTime, tiles);
                }

                // Should continue moving left (no edge in front)
                expect(enemy.direction).toBe('left');
            });
        });

        describe('wall collision', () => {
            it('should detect wall and reverse direction', () => {
                const enemy = new Enemy({ x: 100, y: 118, width: 32, height: 32 });
                enemy.direction = 'right';
                const deltaTime = 0.016;

                // Platform below and wall ahead
                const tiles = [
                    {
                        position: { x: 80, y: 150 },
                        dimensions: { width: 200, height: 32 },
                        properties: { collidable: true },
                    },
                    {
                        position: { x: 160, y: 100 }, // Wall ahead
                        dimensions: { width: 32, height: 50 },
                        properties: { collidable: true },
                    },
                ];

                // Move toward wall
                for (let i = 0; i < 60; i++) {
                    enemy.update(deltaTime, tiles);
                }

                // Enemy should have reversed direction when hitting wall
                expect(enemy.direction).toBe('left');
            });

            it('should reverse when moving left into wall', () => {
                const enemy = new Enemy({ x: 200, y: 118, width: 32, height: 32 });
                enemy.direction = 'left';
                const deltaTime = 0.016;

                // Platform below and wall to the left
                const tiles = [
                    {
                        position: { x: 80, y: 150 },
                        dimensions: { width: 200, height: 32 },
                        properties: { collidable: true },
                    },
                    {
                        position: { x: 140, y: 100 }, // Wall to left
                        dimensions: { width: 32, height: 50 },
                        properties: { collidable: true },
                    },
                ];

                // Move toward wall
                for (let i = 0; i < 60; i++) {
                    enemy.update(deltaTime, tiles);
                }

                // Enemy should have reversed direction
                expect(enemy.direction).toBe('right');
            });

            it('should not reverse when no wall ahead', () => {
                const enemy = new Enemy({ x: 100, y: 118, width: 32, height: 32 });
                enemy.direction = 'right';
                const deltaTime = 0.016;

                // Just platform, no walls
                const tiles = [
                    {
                        position: { x: 0, y: 150 },
                        dimensions: { width: 500, height: 32 },
                        properties: { collidable: true },
                    },
                ];

                // Move several frames
                for (let i = 0; i < 10; i++) {
                    enemy.update(deltaTime, tiles);
                }

                // Should keep moving right
                expect(enemy.direction).toBe('right');
            });
        });

        describe('reverseDirection', () => {
            it('should toggle direction from left to right', () => {
                const enemy = new Enemy({ x: 100, y: 200, width: 32, height: 32 });
                enemy.direction = 'left';

                enemy.reverseDirection();

                expect(enemy.direction).toBe('right');
            });

            it('should toggle direction from right to left', () => {
                const enemy = new Enemy({ x: 100, y: 200, width: 32, height: 32 });
                enemy.direction = 'right';

                enemy.reverseDirection();

                expect(enemy.direction).toBe('left');
            });
        });

        describe('dead enemy behavior', () => {
            it('should not move when dead', () => {
                const enemy = new Enemy({ x: 100, y: 100, width: 32, height: 32 });
                enemy.kill();

                const tiles: any[] = [];
                const initialX = enemy.x;
                const initialY = enemy.y;

                enemy.update(0.016, tiles);

                expect(enemy.x).toBe(initialX);
                expect(enemy.y).toBe(initialY);
            });

            it('should not apply gravity when dead', () => {
                const enemy = new Enemy({ x: 100, y: 100, width: 32, height: 32 });
                enemy.kill();

                const tiles: any[] = [];
                const initialVy = enemy.vy;

                enemy.update(0.016, tiles);

                expect(enemy.vy).toBe(initialVy);
            });
        });
    });
});
