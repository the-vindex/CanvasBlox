import type { EditorState } from '@/types/level';

/**
 * Drawing Mode Tools - tools that work with tile selection
 * These tools preserve tile selection when switched between
 */
const DRAWING_TOOLS: EditorState['selectedTool'][] = ['pen', 'line', 'rectangle'];

/**
 * Custom hook for managing selection state transitions
 *
 * This hook provides consistent helpers for managing the three selection-related
 * state variables: selectedTool, selectedTileType, and selectedObjects.
 *
 * Design principles:
 * - Drawing Mode Tools (pen, line, rectangle) work WITH tiles - they preserve each other
 * - Other tools (select, move, link) are mutually exclusive with tiles
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
     * Drawing Mode Tools: Auto-selects pen if no drawing tool active, preserves active drawing tool
     * @param tileType - The tile type to select
     * @param currentTool - The currently active tool (optional)
     * @returns Partial EditorState for tile selection
     */
    const selectTile = (tileType: string, currentTool?: EditorState['selectedTool']): Partial<EditorState> => {
        // If a drawing tool is already active, keep it
        if (currentTool && DRAWING_TOOLS.includes(currentTool)) {
            return {
                selectedTileType: tileType,
                selectedTool: currentTool, // Preserve drawing tool
            };
        }

        // Otherwise, auto-select pen tool
        return {
            selectedTileType: tileType,
            selectedTool: 'pen', // Auto-select pen for drawing
        };
    };

    /**
     * Select a tool from the toolbar
     * Drawing Mode Tools: Preserve tile selection when switching between drawing tools
     * @param tool - The tool to select
     * @returns Partial EditorState for tool selection
     */
    const selectTool = (tool: EditorState['selectedTool']): Partial<EditorState> => {
        // Drawing tools (pen, line, rectangle) preserve tile selection
        const isDrawingTool = tool && DRAWING_TOOLS.includes(tool);

        return {
            selectedTool: tool,
            ...(isDrawingTool ? {} : { selectedTileType: null }), // Only clear tile for non-drawing tools
            linkSourceId: null, // Clear link source when changing tools
            unlinkSourceId: null, // Clear unlink source when changing tools
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
