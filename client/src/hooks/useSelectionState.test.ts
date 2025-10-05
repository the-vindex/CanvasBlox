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
        it('should return state that sets tile and clears tool', () => {
            const { result } = renderHook(() => useSelectionState());
            const state = result.current.selectTile('platform-grass');

            expect(state).toEqual({
                selectedTileType: 'platform-grass',
                selectedTool: null,
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
            });
        });

        it('should work with different tool types', () => {
            const { result } = renderHook(() => useSelectionState());

            expect(result.current.selectTool('multiselect')).toEqual({
                selectedTool: 'multiselect',
                selectedTileType: null,
            });

            expect(result.current.selectTool('move')).toEqual({
                selectedTool: 'move',
                selectedTileType: null,
            });

            expect(result.current.selectTool('line')).toEqual({
                selectedTool: 'line',
                selectedTileType: null,
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
        it('should ensure tile selection clears tool', () => {
            const { result } = renderHook(() => useSelectionState());
            const tileState = result.current.selectTile('platform-grass');

            expect(tileState.selectedTool).toBeNull();
            expect(tileState.selectedTileType).toBe('platform-grass');
        });

        it('should ensure tool selection clears tile', () => {
            const { result } = renderHook(() => useSelectionState());
            const toolState = result.current.selectTool('select');

            expect(toolState.selectedTileType).toBeNull();
            expect(toolState.selectedTool).toBe('select');
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
});
