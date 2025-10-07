import { describe, expect, it } from 'vitest';
import { Player } from './Player';

describe('Player', () => {
    describe('constructor and basic properties', () => {
        it('should initialize with correct position', () => {
            const player = new Player(100, 200);

            expect(player.x).toBe(100);
            expect(player.y).toBe(200);
        });

        it('should initialize with default dimensions', () => {
            const player = new Player(0, 0);

            expect(player.width).toBe(32);
            expect(player.height).toBe(32);
        });

        it('should initialize with zero velocity', () => {
            const player = new Player(0, 0);

            expect(player.vx).toBe(0);
            expect(player.vy).toBe(0);
        });

        it('should allow custom dimensions', () => {
            const player = new Player(0, 0, 64, 48);

            expect(player.width).toBe(64);
            expect(player.height).toBe(48);
        });
    });

    describe('getters', () => {
        it('should return correct position values', () => {
            const player = new Player(150, 250);

            expect(player.x).toBe(150);
            expect(player.y).toBe(250);
        });

        it('should return correct velocity values', () => {
            const player = new Player(0, 0);
            player.vx = 5;
            player.vy = -10;

            expect(player.vx).toBe(5);
            expect(player.vy).toBe(-10);
        });
    });

    describe('horizontal movement', () => {
        it('should move right when positive velocity is applied', () => {
            const player = new Player(100, 100);
            player.vx = 5;

            player.update(1);

            expect(player.x).toBe(105);
        });

        it('should move left when negative velocity is applied', () => {
            const player = new Player(100, 100);
            player.vx = -5;

            player.update(1);

            expect(player.x).toBe(95);
        });

        it('should not move horizontally when velocity is zero', () => {
            const player = new Player(100, 100);
            player.vx = 0;

            player.update(1);

            expect(player.x).toBe(100);
        });

        it('should apply velocity proportional to delta time', () => {
            const player = new Player(100, 100);
            player.vx = 10;

            player.update(0.5);

            expect(player.x).toBe(105);
        });

        it('should accumulate position over multiple updates', () => {
            const player = new Player(100, 100);
            player.vx = 3;

            player.update(1);
            player.update(1);
            player.update(1);

            expect(player.x).toBe(109);
        });
    });

    describe('platform collision', () => {
        it('should not fall through a platform below', () => {
            const player = new Player(100, 50, 32, 32);
            player.vy = 20;

            const platform = {
                x: 80,
                y: 100,
                width: 64,
                height: 32,
            };

            player.update(1, [platform]);

            expect(player.y).toBe(68);
            expect(player.vy).toBe(0);
        });

        it('should stop at platform edge when colliding', () => {
            const player = new Player(100, 70);
            player.vy = 5;

            const platform = {
                x: 80,
                y: 100,
                width: 64,
                height: 32,
            };

            player.update(1, [platform]);

            expect(player.y).toBe(68);
            expect(player.vy).toBe(0);
        });

        it('should handle collision with multiple platforms', () => {
            const player = new Player(100, 50);
            player.vy = 20;

            const platforms = [
                { x: 0, y: 200, width: 64, height: 32 },
                { x: 80, y: 100, width: 64, height: 32 },
                { x: 160, y: 150, width: 64, height: 32 },
            ];

            player.update(1, platforms);

            expect(player.y).toBe(68);
            expect(player.vy).toBe(0);
        });

        it('should not collide when player is above platform', () => {
            const player = new Player(100, 50);
            player.vy = 2;

            const platform = {
                x: 80,
                y: 150,
                width: 64,
                height: 32,
            };

            player.update(1, [platform]);

            expect(player.y).toBe(52);
            expect(player.vy).toBe(2);
        });

        it('should not collide when player is horizontally outside platform', () => {
            const player = new Player(20, 50);
            player.vy = 10;

            const platform = {
                x: 100,
                y: 80,
                width: 64,
                height: 32,
            };

            player.update(1, [platform]);

            expect(player.y).toBe(60);
            expect(player.vy).toBe(10);
        });

        it('should handle update without platforms', () => {
            const player = new Player(100, 50);
            player.vy = 5;

            player.update(1);

            expect(player.y).toBe(55);
            expect(player.vy).toBe(5);
        });
    });
});
