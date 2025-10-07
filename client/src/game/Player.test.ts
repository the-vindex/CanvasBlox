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
});
