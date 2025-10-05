import { describe, expect, it } from 'vitest';
import { getLinePositions } from './lineDrawing';

describe('lineDrawing', () => {
    describe('getLinePositions', () => {
        it('should return single position for same start and end', () => {
            const result = getLinePositions({ x: 5, y: 5 }, { x: 5, y: 5 });
            expect(result).toEqual([{ x: 5, y: 5 }]);
        });

        it('should draw horizontal line from left to right', () => {
            const result = getLinePositions({ x: 0, y: 0 }, { x: 5, y: 0 });
            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 },
                { x: 4, y: 0 },
                { x: 5, y: 0 },
            ]);
        });

        it('should draw horizontal line from right to left', () => {
            const result = getLinePositions({ x: 5, y: 0 }, { x: 0, y: 0 });
            expect(result).toEqual([
                { x: 5, y: 0 },
                { x: 4, y: 0 },
                { x: 3, y: 0 },
                { x: 2, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: 0 },
            ]);
        });

        it('should draw vertical line from top to bottom', () => {
            const result = getLinePositions({ x: 0, y: 0 }, { x: 0, y: 5 });
            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: 2 },
                { x: 0, y: 3 },
                { x: 0, y: 4 },
                { x: 0, y: 5 },
            ]);
        });

        it('should draw vertical line from bottom to top', () => {
            const result = getLinePositions({ x: 0, y: 5 }, { x: 0, y: 0 });
            expect(result).toEqual([
                { x: 0, y: 5 },
                { x: 0, y: 4 },
                { x: 0, y: 3 },
                { x: 0, y: 2 },
                { x: 0, y: 1 },
                { x: 0, y: 0 },
            ]);
        });

        it('should draw diagonal line at 45 degrees', () => {
            const result = getLinePositions({ x: 0, y: 0 }, { x: 3, y: 3 });
            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 3 },
            ]);
        });

        it('should draw shallow diagonal line', () => {
            const result = getLinePositions({ x: 0, y: 0 }, { x: 10, y: 3 });
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual({ x: 0, y: 0 });
            expect(result[result.length - 1]).toEqual({ x: 10, y: 3 });

            // Verify line is continuous (each step differs by at most 1 in each dimension)
            for (let i = 1; i < result.length; i++) {
                const dx = Math.abs(result[i].x - result[i - 1].x);
                const dy = Math.abs(result[i].y - result[i - 1].y);
                expect(dx).toBeLessThanOrEqual(1);
                expect(dy).toBeLessThanOrEqual(1);
                expect(dx + dy).toBeGreaterThan(0); // Must move at least one step
            }
        });

        it('should draw steep diagonal line', () => {
            const result = getLinePositions({ x: 0, y: 0 }, { x: 3, y: 10 });
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual({ x: 0, y: 0 });
            expect(result[result.length - 1]).toEqual({ x: 3, y: 10 });

            // Verify line is continuous (each step differs by at most 1 in each dimension)
            for (let i = 1; i < result.length; i++) {
                const dx = Math.abs(result[i].x - result[i - 1].x);
                const dy = Math.abs(result[i].y - result[i - 1].y);
                expect(dx).toBeLessThanOrEqual(1);
                expect(dy).toBeLessThanOrEqual(1);
                expect(dx + dy).toBeGreaterThan(0); // Must move at least one step
            }
        });

        it('should handle negative coordinates', () => {
            const result = getLinePositions({ x: -5, y: -5 }, { x: 5, y: 5 });
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual({ x: -5, y: -5 });
            expect(result[result.length - 1]).toEqual({ x: 5, y: 5 });
        });

        it('should produce continuous line without gaps', () => {
            const result = getLinePositions({ x: 0, y: 0 }, { x: 10, y: 7 });
            // Check that consecutive points are adjacent (manhattan distance <= 1 for grid)
            for (let i = 1; i < result.length; i++) {
                const dx = Math.abs(result[i].x - result[i - 1].x);
                const dy = Math.abs(result[i].y - result[i - 1].y);
                // Either one step in x, y, or diagonal
                expect(dx + dy).toBeGreaterThan(0);
                expect(dx).toBeLessThanOrEqual(1);
                expect(dy).toBeLessThanOrEqual(1);
            }
        });
    });
});
