import type { Position } from '@/types/level';

/**
 * Calculate all positions along a rectangle outline (or filled)
 * Draws clockwise starting from top-left: top edge → right edge → bottom edge → left edge
 *
 * @param start - Starting corner position (grid coordinates)
 * @param end - Opposite corner position (grid coordinates)
 * @param filled - If true, fills the rectangle; if false (default), draws outline only
 * @returns Array of all positions in the rectangle
 */
export function getRectanglePositions(start: Position, end: Position, filled = false): Position[] {
    const positions: Position[] = [];

    // Normalize coordinates to get min/max bounds
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    if (filled) {
        // Fill entire rectangle area
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                positions.push({ x, y });
            }
        }
    } else {
        // Draw outline only
        if (minX === maxX && minY === maxY) {
            // Single point
            positions.push({ x: minX, y: minY });
        } else if (minX === maxX) {
            // Vertical line
            for (let y = minY; y <= maxY; y++) {
                positions.push({ x: minX, y });
            }
        } else if (minY === maxY) {
            // Horizontal line
            for (let x = minX; x <= maxX; x++) {
                positions.push({ x, y: minY });
            }
        } else {
            // Proper rectangle - draw outline clockwise
            // Top edge (left to right)
            for (let x = minX; x <= maxX; x++) {
                positions.push({ x, y: minY });
            }

            // Right edge (top to bottom, excluding top corner already drawn)
            for (let y = minY + 1; y <= maxY; y++) {
                positions.push({ x: maxX, y });
            }

            // Bottom edge (right to left, excluding right corner already drawn)
            for (let x = maxX - 1; x >= minX; x--) {
                positions.push({ x, y: maxY });
            }

            // Left edge (bottom to top, excluding both corners)
            for (let y = maxY - 1; y > minY; y--) {
                positions.push({ x: minX, y });
            }
        }
    }

    return positions;
}
