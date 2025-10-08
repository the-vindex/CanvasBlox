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

    describe('jump mechanics', () => {
        it('should apply upward velocity when jump is called while grounded', () => {
            const player = new Player(100, 50);
            player.vy = 20;
            const platform = { x: 80, y: 100, width: 64, height: 32 };

            // Make player grounded by landing on platform
            player.update(1, [platform]);
            expect(player.isGrounded()).toBe(true);

            player.jump();

            expect(player.vy).toBeLessThan(0); // Negative velocity means upward movement
        });

        it('should only allow jump when on ground', () => {
            const player = new Player(100, 50);
            player.vy = 20;
            const platform = { x: 80, y: 100, width: 64, height: 32 };

            // Make player grounded
            player.update(1, [platform]);
            expect(player.isGrounded()).toBe(true);

            player.jump();
            const firstJumpVelocity = player.vy;

            // Try to jump again while in air
            player.jump();

            expect(player.vy).toBe(firstJumpVelocity); // Velocity should not change
        });

        it('should set grounded state to false when jumping', () => {
            const player = new Player(100, 50);
            player.vy = 20;
            const platform = { x: 80, y: 100, width: 64, height: 32 };

            // Make player grounded
            player.update(1, [platform]);
            expect(player.isGrounded()).toBe(true);

            player.jump();

            expect(player.isGrounded()).toBe(false);
        });

        it('should not jump when already in air', () => {
            const player = new Player(100, 100);
            player.vy = -10; // Already moving upward

            expect(player.isGrounded()).toBe(false);
            const beforeJumpVelocity = player.vy;
            player.jump();

            expect(player.vy).toBe(beforeJumpVelocity); // Should not change
        });

        it('should become grounded when landing on platform', () => {
            const player = new Player(100, 50);
            player.vy = 20;
            const platform = { x: 80, y: 100, width: 64, height: 32 };

            expect(player.isGrounded()).toBe(false);

            player.update(1, [platform]);

            expect(player.isGrounded()).toBe(true);
        });

        it('should not be grounded when in air', () => {
            const player = new Player(100, 50);
            player.vy = 5;

            player.update(1);

            expect(player.isGrounded()).toBe(false);
        });

        it('should create realistic jump arc with gravity', () => {
            // Setup: Player standing on a platform
            const player = new Player(100, 68, 32, 32);
            const platform = { x: 80, y: 100, width: 64, height: 32 };

            // Make player grounded
            player.vy = 1;
            player.update(0.016, [platform]);
            expect(player.isGrounded()).toBe(true);

            // Execute jump and verify upward velocity
            player.jump();
            expect(player.vy).toBeLessThan(0); // Negative velocity = upward
            expect(player.isGrounded()).toBe(false);

            const jumpStartY = player.y;

            // After update, player should move upward
            player.update(0.016, [platform]);
            expect(player.y).toBeLessThan(jumpStartY);

            // Velocity should still be negative (moving upward)
            expect(player.vy).toBeLessThan(0);
        });
    });

    describe('health system', () => {
        it('should initialize with 3 health points', () => {
            const player = new Player(100, 100);

            expect(player.health).toBe(3);
        });

        it('should have maximum health of 3', () => {
            const player = new Player(100, 100);

            expect(player.maxHealth).toBe(3);
        });

        it('should reduce health when taking damage', () => {
            const player = new Player(100, 100);

            player.takeDamage(1);

            expect(player.health).toBe(2);
        });

        it('should allow multiple damage hits when invulnerability expires', () => {
            const player = new Player(100, 100);

            player.takeDamage(1);
            expect(player.health).toBe(2);

            // Wait for invulnerability to expire
            player.update(2);

            player.takeDamage(1);

            expect(player.health).toBe(1);
        });

        it('should not allow health to go below 0', () => {
            const player = new Player(100, 100);

            player.takeDamage(5);

            expect(player.health).toBe(0);
        });

        it('should return true for isDead when health is 0', () => {
            const player = new Player(100, 100);

            player.takeDamage(3);

            expect(player.isDead()).toBe(true);
        });

        it('should return false for isDead when health is above 0', () => {
            const player = new Player(100, 100);

            player.takeDamage(1);

            expect(player.isDead()).toBe(false);
        });

        it('should set isDying state when die is called', () => {
            const player = new Player(100, 100);

            player.die();

            expect(player.isDying).toBe(true);
        });
    });

    describe('death and respawn', () => {
        it('should respawn at spawn point position', () => {
            const player = new Player(100, 100);
            player.takeDamage(3);

            player.respawn({ x: 50, y: 75 });

            expect(player.x).toBe(50);
            expect(player.y).toBe(75);
        });

        it('should restore health to 3 on respawn', () => {
            const player = new Player(100, 100);
            player.takeDamage(3);

            player.respawn({ x: 50, y: 75 });

            expect(player.health).toBe(3);
        });

        it('should clear isDying state on respawn', () => {
            const player = new Player(100, 100);
            player.die();

            player.respawn({ x: 50, y: 75 });

            expect(player.isDying).toBe(false);
        });

        it('should reset velocity on respawn', () => {
            const player = new Player(100, 100);
            player.vx = 100;
            player.vy = -50;
            player.die();

            player.respawn({ x: 50, y: 75 });

            expect(player.vx).toBe(0);
            expect(player.vy).toBe(0);
        });
    });

    describe('invulnerability system', () => {
        it('should not be invulnerable initially', () => {
            const player = new Player(100, 100);

            expect(player.isInvulnerable).toBe(false);
        });

        it('should become invulnerable after taking damage', () => {
            const player = new Player(100, 100);

            player.takeDamage(1);

            expect(player.isInvulnerable).toBe(true);
        });

        it('should not take damage while invulnerable', () => {
            const player = new Player(100, 100);

            player.takeDamage(1);
            expect(player.health).toBe(2);
            expect(player.isInvulnerable).toBe(true);

            player.takeDamage(1);

            expect(player.health).toBe(2); // Health should not decrease
        });

        it('should set invulnerability timer when taking damage', () => {
            const player = new Player(100, 100);

            player.takeDamage(1);

            expect(player.invulnerabilityTimer).toBeGreaterThan(0);
        });

        it('should decrement invulnerability timer during update', () => {
            const player = new Player(100, 100);

            player.takeDamage(1);
            const initialTimer = player.invulnerabilityTimer;

            player.update(0.5);

            expect(player.invulnerabilityTimer).toBeLessThan(initialTimer);
        });

        it('should expire invulnerability after timer runs out', () => {
            const player = new Player(100, 100);

            player.takeDamage(1);
            expect(player.isInvulnerable).toBe(true);

            // Update with time greater than invulnerability duration (1.5 seconds)
            player.update(2);

            expect(player.isInvulnerable).toBe(false);
            expect(player.invulnerabilityTimer).toBe(0);
        });

        it('should allow damage again after invulnerability expires', () => {
            const player = new Player(100, 100);

            player.takeDamage(1);
            expect(player.health).toBe(2);

            // Wait for invulnerability to expire
            player.update(2);
            expect(player.isInvulnerable).toBe(false);

            player.takeDamage(1);

            expect(player.health).toBe(1);
        });

        it('should reset invulnerability on respawn', () => {
            const player = new Player(100, 100);

            player.takeDamage(1);
            expect(player.isInvulnerable).toBe(true);

            player.respawn({ x: 50, y: 50 });

            expect(player.isInvulnerable).toBe(false);
            expect(player.invulnerabilityTimer).toBe(0);
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
