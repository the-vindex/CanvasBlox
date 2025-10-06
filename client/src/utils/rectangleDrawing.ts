import type { Position } from '@/types/level';

/**
 * Fill entire rectangle area with positions
 */
function fillRectangle(minX: number, maxX: number, minY: number, maxY: number): Position[] {
    const positions: Position[] = [];
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            positions.push({ x, y });
        }
    }
    return positions;
}

/**
 * Draw vertical line
 */
function drawVerticalLine(x: number, minY: number, maxY: number): Position[] {
    const positions: Position[] = [];
    for (let y = minY; y <= maxY; y++) {
        positions.push({ x, y });
    }
    return positions;
}

/**
 * Draw horizontal line
 */
function drawHorizontalLine(y: number, minX: number, maxX: number): Position[] {
    const positions: Position[] = [];
    for (let x = minX; x <= maxX; x++) {
        positions.push({ x, y });
    }
    return positions;
}

/**
 * Draw rectangle outline clockwise
 */
function drawRectangleOutline(minX: number, maxX: number, minY: number, maxY: number): Position[] {
    const positions: Position[] = [];

    // Top edge (left to right)
    for (let x = minX; x <= maxX; x++) {
        positions.push({ x, y: minY });
    }

    // Right edge (top to bottom, excluding top corner)
    for (let y = minY + 1; y <= maxY; y++) {
        positions.push({ x: maxX, y });
    }

    // Bottom edge (right to left, excluding right corner)
    for (let x = maxX - 1; x >= minX; x--) {
        positions.push({ x, y: maxY });
    }

    // Left edge (bottom to top, excluding both corners)
    for (let y = maxY - 1; y > minY; y--) {
        positions.push({ x: minX, y });
    }

    return positions;
}

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
    // Normalize coordinates to get min/max bounds
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    if (filled) {
        return fillRectangle(minX, maxX, minY, maxY);
    }

    // Draw outline only - handle special cases
    if (minX === maxX && minY === maxY) {
        return [{ x: minX, y: minY }]; // Single point
    }

    if (minX === maxX) {
        return drawVerticalLine(minX, minY, maxY);
    }

    if (minY === maxY) {
        return drawHorizontalLine(minY, minX, maxX);
    }

    return drawRectangleOutline(minX, maxX, minY, maxY);
}
