/**
 * Physics constants and utilities for the game
 */

/**
 * Gravity constant (pixels per second squared)
 * Positive value means downward acceleration
 */
export const GRAVITY = 800;

/**
 * Apply gravity to velocity for one frame
 * @param velocityY - Current vertical velocity (positive = downward)
 * @param deltaTime - Time elapsed since last frame (in seconds)
 * @returns New vertical velocity after applying gravity
 */
export function applyGravity(velocityY: number, deltaTime: number): number {
    return velocityY + GRAVITY * deltaTime;
}
