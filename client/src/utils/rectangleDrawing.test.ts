import { describe, expect, it } from 'vitest';
import { getRectanglePositions } from './rectangleDrawing';

describe('rectangleDrawing', () => {
    describe('getRectanglePositions', () => {
        it('should return single position for same start and end', () => {
            const result = getRectanglePositions({ x: 5, y: 5 }, { x: 5, y: 5 });
            expect(result).toEqual([{ x: 5, y: 5 }]);
        });

        it('should draw horizontal line for height of 0', () => {
            const result = getRectanglePositions({ x: 0, y: 5 }, { x: 5, y: 5 });
            expect(result).toEqual([
                { x: 0, y: 5 },
                { x: 1, y: 5 },
                { x: 2, y: 5 },
                { x: 3, y: 5 },
                { x: 4, y: 5 },
                { x: 5, y: 5 },
            ]);
        });

        it('should draw vertical line for width of 0', () => {
            const result = getRectanglePositions({ x: 5, y: 0 }, { x: 5, y: 5 });
            expect(result).toEqual([
                { x: 5, y: 0 },
                { x: 5, y: 1 },
                { x: 5, y: 2 },
                { x: 5, y: 3 },
                { x: 5, y: 4 },
                { x: 5, y: 5 },
            ]);
        });

        it('should draw rectangle outline from top-left to bottom-right', () => {
            const result = getRectanglePositions({ x: 0, y: 0 }, { x: 3, y: 2 });
            expect(result).toEqual([
                // Top edge (left to right)
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 },
                // Right edge (top to bottom, excluding corners already drawn)
                { x: 3, y: 1 },
                { x: 3, y: 2 },
                // Bottom edge (right to left, excluding right corner)
                { x: 2, y: 2 },
                { x: 1, y: 2 },
                { x: 0, y: 2 },
                // Left edge (bottom to top, excluding corners)
                { x: 0, y: 1 },
            ]);
        });

        it('should draw rectangle outline from bottom-right to top-left', () => {
            const result = getRectanglePositions({ x: 3, y: 2 }, { x: 0, y: 0 });
            // Should produce same outline, order might differ but all positions should be present
            expect(result).toHaveLength(10); // 4+3+3 for 4x3 rectangle outline
            expect(result).toContainEqual({ x: 0, y: 0 });
            expect(result).toContainEqual({ x: 3, y: 2 });
            expect(result).toContainEqual({ x: 0, y: 2 });
            expect(result).toContainEqual({ x: 3, y: 0 });
        });

        it('should draw small 2x2 rectangle', () => {
            const result = getRectanglePositions({ x: 0, y: 0 }, { x: 1, y: 1 });
            expect(result).toHaveLength(4);
            expect(result).toContainEqual({ x: 0, y: 0 });
            expect(result).toContainEqual({ x: 1, y: 0 });
            expect(result).toContainEqual({ x: 0, y: 1 });
            expect(result).toContainEqual({ x: 1, y: 1 });
        });

        it('should handle negative coordinates', () => {
            const result = getRectanglePositions({ x: -2, y: -2 }, { x: 2, y: 2 });
            expect(result.length).toBeGreaterThan(0);
            expect(result).toContainEqual({ x: -2, y: -2 });
            expect(result).toContainEqual({ x: 2, y: 2 });
            expect(result).toContainEqual({ x: -2, y: 2 });
            expect(result).toContainEqual({ x: 2, y: -2 });
        });

        it('should draw rectangle with swapped start and end corners', () => {
            // Start at bottom-left, end at top-right
            const result = getRectanglePositions({ x: 0, y: 3 }, { x: 3, y: 0 });
            expect(result.length).toBeGreaterThan(0);
            // All four corners should be present
            expect(result).toContainEqual({ x: 0, y: 0 });
            expect(result).toContainEqual({ x: 3, y: 0 });
            expect(result).toContainEqual({ x: 0, y: 3 });
            expect(result).toContainEqual({ x: 3, y: 3 });
        });

        it('should not have duplicate positions in outline', () => {
            const result = getRectanglePositions({ x: 0, y: 0 }, { x: 5, y: 5 });
            const uniquePositions = new Set(result.map((p) => `${p.x},${p.y}`));
            expect(uniquePositions.size).toBe(result.length);
        });

        describe('filled rectangles', () => {
            it('should draw filled rectangle when filled=true', () => {
                const result = getRectanglePositions({ x: 0, y: 0 }, { x: 2, y: 2 }, true);
                expect(result).toHaveLength(9); // 3x3 = 9 positions
                // Check all positions are present
                for (let x = 0; x <= 2; x++) {
                    for (let y = 0; y <= 2; y++) {
                        expect(result).toContainEqual({ x, y });
                    }
                }
            });

            it('should draw filled rectangle with negative coordinates', () => {
                const result = getRectanglePositions({ x: -1, y: -1 }, { x: 1, y: 1 }, true);
                expect(result).toHaveLength(9); // 3x3 = 9 positions
                // Check corners and center
                expect(result).toContainEqual({ x: -1, y: -1 });
                expect(result).toContainEqual({ x: 0, y: 0 });
                expect(result).toContainEqual({ x: 1, y: 1 });
            });

            it('should handle filled=false as default (outline)', () => {
                const outline = getRectanglePositions({ x: 0, y: 0 }, { x: 3, y: 3 });
                const outlineExplicit = getRectanglePositions({ x: 0, y: 0 }, { x: 3, y: 3 }, false);
                expect(outline).toEqual(outlineExplicit);
                expect(outline.length).toBeLessThan(16); // Should be outline, not filled 4x4
            });
        });
    });
});
