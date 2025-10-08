import type { Tile } from '../types/level';
import { checkAABBCollision, resolveVerticalCollision } from './collision';
import { applyGravity } from './physics';

export interface EnemyConfig {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Patrol speed constant (pixels per second)
 */
const PATROL_SPEED = 60;

/**
 * Distance below enemy's feet to check for ground (pixels)
 */
const EDGE_CHECK_DEPTH = 8;

export class Enemy {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    isAlive: boolean;
    direction: 'left' | 'right';

    constructor(config: EnemyConfig) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.vx = 0;
        this.vy = 0;
        this.isAlive = true;
        this.direction = 'left'; // Default patrol direction
    }

    /**
     * Kill the enemy (e.g., when player stomps on it)
     */
    kill(): void {
        this.isAlive = false;
    }

    /**
     * Reverse patrol direction
     */
    reverseDirection(): void {
        this.direction = this.direction === 'left' ? 'right' : 'left';
    }

    /**
     * Check if there is ground below a point
     * @param checkX - X coordinate to check
     * @param checkY - Y coordinate to start checking from
     * @param tiles - Level tiles
     * @returns True if ground exists below the point
     */
    private hasGroundBelow(checkX: number, checkY: number, tiles: Tile[]): boolean {
        // Create small AABB for edge lookahead point
        const lookaheadAABB = {
            x: checkX,
            y: checkY,
            width: 1,
            height: EDGE_CHECK_DEPTH,
        };

        // Check for any collidable tiles below the lookahead point
        for (const tile of tiles) {
            if (!tile.properties.collidable) continue;

            const tileAABB = {
                x: tile.position.x,
                y: tile.position.y,
                width: tile.dimensions.width,
                height: tile.dimensions.height,
            };

            const collision = checkAABBCollision(lookaheadAABB, tileAABB);
            if (collision.isColliding) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if there is a wall ahead in the direction of movement
     * @param tiles - Level tiles
     * @returns True if wall exists ahead
     */
    private hasWallAhead(tiles: Tile[]): boolean {
        // Calculate lookahead position based on direction
        const lookaheadDistance = 2; // Small distance to check ahead
        const checkX = this.direction === 'left' ? this.x - lookaheadDistance : this.x + this.width + lookaheadDistance;

        // Create AABB for wall check (vertical slice ahead of enemy)
        const lookaheadAABB = {
            x: this.direction === 'left' ? checkX - 1 : checkX,
            y: this.y,
            width: 1,
            height: this.height,
        };

        // Check for any collidable tiles ahead
        for (const tile of tiles) {
            if (!tile.properties.collidable) continue;

            const tileAABB = {
                x: tile.position.x,
                y: tile.position.y,
                width: tile.dimensions.width,
                height: tile.dimensions.height,
            };

            const collision = checkAABBCollision(lookaheadAABB, tileAABB);
            if (collision.isColliding) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check for platform edge ahead of enemy
     * @param tiles - Level tiles
     * @returns True if edge detected
     */
    private detectEdge(tiles: Tile[]): boolean {
        // Only check for edges if enemy is on ground (not falling)
        // This prevents false positives when enemy is in mid-air
        if (Math.abs(this.vy) > 1) {
            return false;
        }

        // Calculate lookahead position based on direction
        // Check at the front edge of enemy, slightly ahead
        const lookaheadX =
            this.direction === 'left'
                ? this.x - 2 // Small distance ahead when moving left
                : this.x + this.width + 2; // Small distance ahead when moving right

        // Check from bottom of enemy (feet position), slightly below
        const feetY = this.y + this.height + 1;

        // If no ground below lookahead point, edge detected
        return !this.hasGroundBelow(lookaheadX, feetY, tiles);
    }

    /**
     * Apply platform collision to enemy
     * @param tiles - Level tiles
     */
    private applyPlatformCollision(tiles: Tile[]): void {
        for (const tile of tiles) {
            if (!tile.properties.collidable) continue;

            const enemyAABB = {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
            };

            const tileAABB = {
                x: tile.position.x,
                y: tile.position.y,
                width: tile.dimensions.width,
                height: tile.dimensions.height,
            };

            const verticalCollision = resolveVerticalCollision(enemyAABB, tileAABB, { x: this.vx, y: this.vy });

            if (verticalCollision.side === 'bottom') {
                // Landing on platform
                this.y = verticalCollision.correctedY;
                this.vy = 0;
            } else if (verticalCollision.side === 'top') {
                // Hitting ceiling
                this.y = verticalCollision.correctedY;
                this.vy = 0;
            }
        }
    }

    /**
     * Update enemy state with patrol AI
     * @param deltaTime - Time elapsed since last frame (seconds)
     * @param tiles - Level tiles for collision detection
     */
    update(deltaTime: number, tiles: Tile[]): void {
        // Don't update if dead
        if (!this.isAlive) {
            return;
        }

        // Apply horizontal velocity based on patrol direction
        this.vx = this.direction === 'left' ? -PATROL_SPEED : PATROL_SPEED;

        // Apply gravity
        this.vy = applyGravity(this.vy, deltaTime);

        // Update position based on velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Apply platform collision
        this.applyPlatformCollision(tiles);

        // Check for wall ahead
        if (this.hasWallAhead(tiles)) {
            this.reverseDirection();
        }

        // Check for platform edge ahead
        if (this.detectEdge(tiles)) {
            this.reverseDirection();
        }
    }
}
