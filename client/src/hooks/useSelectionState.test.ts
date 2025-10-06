import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSelectionState } from './useSelectionState';

describe('useSelectionState', () => {
    describe('clearAll', () => {
        it('should return state that clears all three selection variables', () => {
            const { result } = renderHook(() => useSelectionState());
            const cleared = result.current.clearAll();

            expect(cleared).toEqual({
                selectedTool: null,
                selectedTileType: null,
                selectedObjects: [],
            });
        });
    });

    describe('selectTile', () => {
        it('should return state that sets tile and auto-selects pen tool', () => {
            const { result } = renderHook(() => useSelectionState());
            const state = result.current.selectTile('platform-grass');

            expect(state).toEqual({
                selectedTileType: 'platform-grass',
                selectedTool: 'pen', // Auto-select pen tool
            });
        });

        it('should not include selectedObjects in returned state (preserved)', () => {
            const { result } = renderHook(() => useSelectionState());
            const state = result.current.selectTile('platform-stone');

            expect(state).not.toHaveProperty('selectedObjects');
        });
    });

    describe('selectTool', () => {
        it('should return state that sets tool and clears tile', () => {
            const { result } = renderHook(() => useSelectionState());
            const state = result.current.selectTool('select');

            expect(state).toEqual({
                selectedTool: 'select',
                selectedTileType: null,
                linkSourceId: null,
            });
        });

        it('should work with different tool types', () => {
            const { result } = renderHook(() => useSelectionState());

            expect(result.current.selectTool('multiselect')).toEqual({
                selectedTool: 'multiselect',
                selectedTileType: null,
                linkSourceId: null,
            });

            expect(result.current.selectTool('move')).toEqual({
                selectedTool: 'move',
                selectedTileType: null,
                linkSourceId: null,
            });
        });

        it('should preserve tile selection for line and rectangle tools', () => {
            const { result } = renderHook(() => useSelectionState());

            // Line tool should NOT clear tile (it needs both)
            expect(result.current.selectTool('line')).toEqual({
                selectedTool: 'line',
                linkSourceId: null,
            });

            // Rectangle tool should NOT clear tile (it needs both)
            expect(result.current.selectTool('rectangle')).toEqual({
                selectedTool: 'rectangle',
                linkSourceId: null,
            });
        });

        it('should not include selectedObjects in returned state (preserved)', () => {
            const { result } = renderHook(() => useSelectionState());
            const state = result.current.selectTool('move');

            expect(state).not.toHaveProperty('selectedObjects');
        });

        it('should handle null tool (deselect)', () => {
            const { result } = renderHook(() => useSelectionState());
            const state = result.current.selectTool(null);

            expect(state).toEqual({
                selectedTool: null,
                selectedTileType: null,
                linkSourceId: null,
            });
        });
    });

    describe('clearObjects', () => {
        it('should return state that clears only selectedObjects', () => {
            const { result } = renderHook(() => useSelectionState());
            const state = result.current.clearObjects();

            expect(state).toEqual({
                selectedObjects: [],
            });
        });

        it('should not include tool or tile in returned state', () => {
            const { result } = renderHook(() => useSelectionState());
            const state = result.current.clearObjects();

            expect(state).not.toHaveProperty('selectedTool');
            expect(state).not.toHaveProperty('selectedTileType');
        });
    });

    describe('mutual exclusion behavior', () => {
        it('should ensure tile selection auto-selects pen tool', () => {
            const { result } = renderHook(() => useSelectionState());
            const tileState = result.current.selectTile('platform-grass');

            expect(tileState.selectedTool).toBe('pen'); // Auto-select pen
            expect(tileState.selectedTileType).toBe('platform-grass');
        });

        it('should ensure most tool selections clear tile', () => {
            const { result } = renderHook(() => useSelectionState());
            const toolState = result.current.selectTool('select');

            expect(toolState.selectedTileType).toBeNull();
            expect(toolState.selectedTool).toBe('select');
        });

        it('should preserve tile for line and rectangle tools', () => {
            const { result } = renderHook(() => useSelectionState());

            const lineState = result.current.selectTool('line');
            expect(lineState.selectedTool).toBe('line');
            expect(lineState).not.toHaveProperty('selectedTileType'); // Not cleared, preserved

            const rectState = result.current.selectTool('rectangle');
            expect(rectState.selectedTool).toBe('rectangle');
            expect(rectState).not.toHaveProperty('selectedTileType'); // Not cleared, preserved
        });
    });

    describe('object preservation behavior', () => {
        it('should preserve objects when switching tools (multi-step workflow)', () => {
            const { result } = renderHook(() => useSelectionState());

            // Simulate: multi-select tool → select objects → switch to move tool
            const toolState = result.current.selectTool('move');

            // selectedObjects should not be in the returned state (meaning it's preserved)
            expect(toolState).not.toHaveProperty('selectedObjects');
        });

        it('should preserve objects when switching tiles', () => {
            const { result } = renderHook(() => useSelectionState());

            // Simulate: select objects → switch to palette tile
            const tileState = result.current.selectTile('platform-stone');

            // selectedObjects should not be in the returned state (meaning it's preserved)
            expect(tileState).not.toHaveProperty('selectedObjects');
        });
    });

    describe('Drawing Mode Tools interaction pattern', () => {
        it('should preserve active drawing tool (line) when selecting different tile', () => {
            const { result } = renderHook(() => useSelectionState());

            // When line tool is active, selecting a tile should preserve it
            const stateWithLine = result.current.selectTile('platform-grass', 'line');
            expect(stateWithLine.selectedTileType).toBe('platform-grass');
            expect(stateWithLine.selectedTool).toBe('line');
        });

        it('should switch to pen when selecting tile with non-drawing tool active', () => {
            const { result } = renderHook(() => useSelectionState());

            // When select tool is active, selecting a tile should auto-select pen
            const stateFromSelect = result.current.selectTile('platform-grass', 'select');
            expect(stateFromSelect.selectedTileType).toBe('platform-grass');
            expect(stateFromSelect.selectedTool).toBe('pen');
        });

        it('should preserve tile when switching between drawing tools', () => {
            const { result } = renderHook(() => useSelectionState());

            // Line to rectangle (proves the pattern)
            const lineToRect = result.current.selectTool('rectangle');
            expect(lineToRect.selectedTool).toBe('rectangle');
            expect(lineToRect).not.toHaveProperty('selectedTileType'); // Preserved
        });
    });
});
