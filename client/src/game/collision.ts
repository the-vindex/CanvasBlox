/**
 * AABB (Axis-Aligned Bounding Box) collision detection utilities.
 * Used for detecting collisions between game objects like players, tiles, and enemies.
 */

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
