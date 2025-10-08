/**
 * AABB (Axis-Aligned Bounding Box) collision detection utilities.
 * Used for detecting collisions between game objects like players, tiles, and enemies.
 */

import type { Tile } from '../types/level';
import type { Enemy } from './Enemy';

/**
 * Axis-Aligned Bounding Box representation.
 */
export interface AABB {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Information about a collision between two AABBs.
 */
export interface CollisionInfo {
    isColliding: boolean;
    overlapX: number;
    overlapY: number;
}

/**
 * Velocity vector for moving objects.
 */
export interface Velocity {
    x: number;
    y: number;
}

/**
 * Result of resolving a vertical collision.
 */
export interface VerticalCollisionResult {
    side: 'top' | 'bottom' | null;
    correctedY: number;
    shouldStopVerticalVelocity: boolean;
}

/**
 * Result of checking collision between player and enemy.
 */
export interface EnemyCollisionResult {
    collided: boolean;
    fromTop: boolean;
}

/**
 * Check if two axis-aligned bounding boxes are colliding.
 * Uses AABB collision detection algorithm.
 *
 * @param a - First bounding box
 * @param b - Second bounding box
 * @returns Collision information including whether collision occurred and overlap amounts
 */
export function checkAABBCollision(a: AABB, b: AABB): CollisionInfo {
    // Handle zero-sized rectangles
    if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) {
        return {
            isColliding: false,
            overlapX: 0,
            overlapY: 0,
        };
    }

    // Calculate the edges of each rectangle
    const aLeft = a.x;
    const aRight = a.x + a.width;
    const aTop = a.y;
    const aBottom = a.y + a.height;

    const bLeft = b.x;
    const bRight = b.x + b.width;
    const bTop = b.y;
    const bBottom = b.y + b.height;

    // Check for collision using AABB algorithm
    // Rectangles collide if they overlap on both axes
    const isColliding = aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;

    if (!isColliding) {
        return {
            isColliding: false,
            overlapX: 0,
            overlapY: 0,
        };
    }

    // Calculate overlap amounts (useful for collision resolution)
    const overlapX = Math.min(aRight, bRight) - Math.max(aLeft, bLeft);
    const overlapY = Math.min(aBottom, bBottom) - Math.max(aTop, bTop);

    return {
        isColliding: true,
        overlapX,
        overlapY,
    };
}

/**
 * Resolve vertical collision between a moving object and a static object.
 * Determines which side of the collision occurred (top or bottom) and calculates
 * the corrected Y position to prevent overlap.
 *
 * @param moving - The moving object's bounding box
 * @param stationary - The static object's bounding box
 * @param velocity - The moving object's velocity vector
 * @returns Collision resolution information
 */
export function resolveVerticalCollision(moving: AABB, stationary: AABB, velocity: Velocity): VerticalCollisionResult {
    const collision = checkAABBCollision(moving, stationary);

    // No collision detected
    if (!collision.isColliding) {
        return {
            side: null,
            correctedY: moving.y,
            shouldStopVerticalVelocity: false,
        };
    }

    // Determine collision side based on velocity direction
    // If velocity is zero, use overlap to determine direction
    let side: 'top' | 'bottom';
    let correctedY: number;

    if (velocity.y === 0) {
        // No vertical velocity - determine based on overlap
        // If moving object's center is above stationary object's center, it's a bottom collision
        const movingCenterY = moving.y + moving.height / 2;
        const stationaryCenterY = stationary.y + stationary.height / 2;

        if (movingCenterY < stationaryCenterY) {
            // Moving object is above - bottom collision
            side = 'bottom';
            correctedY = stationary.y - moving.height;
        } else {
            // Moving object is below - top collision
            side = 'top';
            correctedY = stationary.y + stationary.height;
        }
    } else if (velocity.y > 0) {
        // Moving downward - bottom of moving object hit top of stationary object
        side = 'bottom';
        correctedY = stationary.y - moving.height;
    } else {
        // Moving upward - top of moving object hit bottom of stationary object
        side = 'top';
        correctedY = stationary.y + stationary.height;
    }

    return {
        side,
        correctedY,
        shouldStopVerticalVelocity: true,
    };
}

/**
 * Check if player is colliding with any lava tiles.
 * Lava tiles are identified by the 'lava' material property.
 *
 * @param player - Player bounding box
 * @param tiles - Array of tiles to check against
 * @returns True if player is touching lava, false otherwise
 */
export function checkLavaCollision(player: AABB, tiles: Tile[]): boolean {
    for (const tile of tiles) {
        // Check if tile has lava material
        if (tile.properties.material !== 'lava') {
            continue;
        }

        // Convert tile to AABB
        const tileAABB: AABB = {
            x: tile.position.x,
            y: tile.position.y,
            width: tile.dimensions.width,
            height: tile.dimensions.height,
        };

        // Check collision
        const collision = checkAABBCollision(player, tileAABB);
        if (collision.isColliding) {
            return true;
        }
    }

    return false;
}

/**
 * Check collision between player and enemy, determining if it's a stomp (from top) or side collision.
 * A stomp occurs when:
 * 1. Player is falling (vy > 0)
 * 2. Player's bottom edge is near enemy's top edge (within threshold)
 *
 * @param player - Player bounding box
 * @param enemy - Enemy object
 * @param playerVy - Player's vertical velocity (defaults to 0)
 * @returns Collision result with collision state and direction
 */
export function checkEnemyCollision(player: AABB, enemy: Enemy, playerVy = 0): EnemyCollisionResult {
    // Convert enemy to AABB
    const enemyAABB: AABB = {
        x: enemy.x,
        y: enemy.y,
        width: enemy.width,
        height: enemy.height,
    };

    // Check basic AABB collision
    const collision = checkAABBCollision(player, enemyAABB);

    if (!collision.isColliding) {
        return {
            collided: false,
            fromTop: false,
        };
    }

    // Determine if collision is from top (stomp) or side (damage)
    // Stomp conditions:
    // 1. Player is falling (vy > 0)
    // 2. Player's bottom is near enemy's top (within threshold)
    const STOMP_THRESHOLD = 15; // pixels
    const playerBottom = player.y + player.height;
    const enemyTop = enemy.y;
    const distanceToTop = Math.abs(playerBottom - enemyTop);

    const isFromTop = playerVy > 0 && distanceToTop <= STOMP_THRESHOLD;

    return {
        collided: true,
        fromTop: isFromTop,
    };
}
