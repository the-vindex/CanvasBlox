import type { Position } from '@/types/level';

/**
 * Calculate all positions along a line using Bresenham's line algorithm
 * This algorithm ensures a continuous line without gaps between grid positions
 *
 * @param start - Starting position (grid coordinates)
 * @param end - Ending position (grid coordinates)
 * @returns Array of all positions along the line from start to end
 */
export function getLinePositions(start: Position, end: Position): Position[] {
    const positions: Position[] = [];

    let x0 = start.x;
    let y0 = start.y;
    const x1 = end.x;
    const y1 = end.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);

    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;

    let err = dx - dy;

    while (true) {
        // Add current position
        positions.push({ x: x0, y: y0 });

        // Check if we've reached the end
        if (x0 === x1 && y0 === y1) {
            break;
        }

        const e2 = 2 * err;

        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }

        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }

    return positions;
}
