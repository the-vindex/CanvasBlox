import type { EditorState } from '@/types/level';

/**
 * Custom hook for managing selection state transitions
 *
 * This hook provides consistent helpers for managing the three selection-related
 * state variables: selectedTool, selectedTileType, and selectedObjects.
 *
 * Design principles:
 * - selectedTool and selectedTileType are mutually exclusive (can't have both)
 * - selectedObjects is preserved during tool/tile switches to support multi-step workflows
 *   (e.g., multi-select → move tool, or select objects → switch to different tool)
 * - Only ESC key or explicit clear operations should clear all three
 */
export function useSelectionState() {
    /**
     * Clear all selection state (used by ESC key)
     * @returns Partial EditorState with all selections cleared
     */
    const clearAll = (): Partial<EditorState> => ({
        selectedTool: null,
        selectedTileType: null,
        selectedObjects: [],
    });

    /**
     * Select a tile from the palette
     * Clears tool selection (mutual exclusion) but preserves object selection
     * @param tileType - The tile type to select
     * @returns Partial EditorState for tile selection
     */
    const selectTile = (tileType: string): Partial<EditorState> => ({
        selectedTileType: tileType,
        selectedTool: null, // Clear tool (mutually exclusive)
        // selectedObjects preserved for multi-step workflows
    });

    /**
     * Select a tool from the toolbar
     * - Line and rectangle tools preserve tile selection (they need both tool + tile)
     * - Other tools clear tile selection (mutual exclusion)
     * - Object selection is always preserved for multi-step workflows
     * @param tool - The tool to select
     * @returns Partial EditorState for tool selection
     */
    const selectTool = (tool: EditorState['selectedTool']): Partial<EditorState> => {
        // Line and rectangle tools need tile selection to know what to draw
        const preserveTileSelection = tool === 'line' || tool === 'rectangle';

        return {
            selectedTool: tool,
            ...(preserveTileSelection ? {} : { selectedTileType: null }), // Only clear tile for other tools
            // selectedObjects preserved for multi-step workflows
        };
    };

    /**
     * Clear only object selection (used when clicking empty space)
     * @returns Partial EditorState with objects cleared
     */
    const clearObjects = (): Partial<EditorState> => ({
        selectedObjects: [],
    });

    return {
        clearAll,
        selectTile,
        selectTool,
        clearObjects,
    };
}
