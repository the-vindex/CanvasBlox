import { type AABB, checkAABBCollision } from './collision';

/**
 * Jump velocity constant (pixels per second, negative = upward)
 */
const JUMP_VELOCITY = -400;

/**
 * Invulnerability duration in seconds after taking damage
 */
const INVULNERABILITY_DURATION = 1.5;

/**
 * Player entity for the game mode.
 * Handles player position, dimensions, velocity, and health.
 */
export class Player {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public vx: number;
    public vy: number;
    public health: number;
    public readonly maxHealth: number = 3;
    public isDying: boolean;
    public isInvulnerable: boolean;
    public invulnerabilityTimer: number;
    private grounded: boolean;

    constructor(x: number, y: number, width: number = 32, height: number = 32) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.health = 3;
        this.isDying = false;
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        this.grounded = false;
    }

    /**
     * Check if player is currently on the ground.
     */
    isGrounded(): boolean {
        return this.grounded;
    }

    /**
     * Make the player jump (only if grounded).
     */
    jump(): void {
        if (this.grounded) {
            this.vy = JUMP_VELOCITY;
            this.grounded = false;
        }
    }

    /**
     * Reduce player health by the specified amount.
     * Health cannot go below 0.
     * If player is invulnerable, no damage is taken.
     * @param amount - Amount of damage to take
     */
    takeDamage(amount: number): void {
        // If invulnerable, don't take damage
        if (this.isInvulnerable) {
            return;
        }

        this.health = Math.max(0, this.health - amount);

        // Activate invulnerability after taking damage
        this.isInvulnerable = true;
        this.invulnerabilityTimer = INVULNERABILITY_DURATION;
    }

    /**
     * Check if player is dead (health <= 0).
     */
    isDead(): boolean {
        return this.health <= 0;
    }

    /**
     * Trigger death state.
     * Sets isDying flag to true (for animation or death handling).
     */
    die(): void {
        this.isDying = true;
    }

    /**
     * Respawn the player at a spawn point.
     * Resets position, health, velocity, death state, and invulnerability.
     * @param spawnPoint - Position to respawn at
     */
    respawn(spawnPoint: { x: number; y: number }): void {
        this.x = spawnPoint.x;
        this.y = spawnPoint.y;
        this.health = 3;
        this.isDying = false;
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        this.vx = 0;
        this.vy = 0;
    }

    /**
     * Update player position based on velocity and delta time.
     * Applies collision detection and resolution with platforms.
     * Updates invulnerability timer.
     * @param deltaTime - Time elapsed since last update in seconds
     * @param platforms - Optional array of platform AABBs to check collision against
     */
    update(deltaTime: number, platforms?: AABB[]): void {
        // Update invulnerability timer
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= deltaTime;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
                this.invulnerabilityTimer = 0;
            }
        }

        // Apply velocity to position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Assume not grounded until proven otherwise by collision
        this.grounded = false;

        // If no platforms provided, skip collision detection
        if (!platforms || platforms.length === 0) {
            return;
        }

        // Check collision with each platform
        for (const platform of platforms) {
            const collision = checkAABBCollision(
                { x: this.x, y: this.y, width: this.width, height: this.height },
                platform
            );

            if (collision.isColliding) {
                // Resolve collision by moving player out of platform
                // If vertical overlap is smaller, resolve vertically (more common for platforms)
                if (collision.overlapY < collision.overlapX) {
                    // Player is colliding from top or bottom
                    const playerBottom = this.y + this.height;
                    const platformTop = platform.y;
                    const platformBottom = platform.y + platform.height;

                    if (playerBottom > platformTop && this.y < platform.y) {
                        // Player is landing on top of platform (falling down)
                        this.y = platform.y - this.height;
                        this.vy = 0;
                        this.grounded = true;
                    } else if (this.y < platformBottom && this.y + this.height > platform.y) {
                        // Player is hitting ceiling (jumping up into platform from below)
                        this.y = platformBottom;
                        this.vy = 0; // Stop upward movement
                    }
                } else {
                    // Horizontal collision (side of platform)
                    // For now, just resolve horizontally
                    if (this.x < platform.x) {
                        // Player is hitting from left
                        this.x = platform.x - this.width;
                    } else {
                        // Player is hitting from right
                        this.x = platform.x + platform.width;
                    }
                    this.vx = 0;
                }
            }
        }
    }
}
