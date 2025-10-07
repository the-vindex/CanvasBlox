import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { EditorState, LevelData } from '@/types/level';
import { Canvas } from './Canvas';

// Mock useCanvas hook
vi.mock('@/hooks/useCanvas', () => ({
    useCanvas: () => ({
        canvasRef: { current: null },
        wrapperRef: { current: null },
    }),
}));

describe('Canvas Component - Scanlines Toggle', () => {
    const mockLevelData: LevelData = {
        id: 'test-level',
        levelName: 'Test Level',
        tiles: [],
        objects: [],
        spawnPoints: [],
        metadata: {
            dimensions: { width: 100, height: 60 },
            backgroundColor: '#5C94FC',
            gridColor: '#ffffff',
        },
    };

    const mockEditorState: EditorState = {
        selectedTool: null,
        selectedTileType: null,
        selectedObjects: [],
        zoom: 1,
        pan: { x: 0, y: 0 },
        mousePosition: { x: 0, y: 0 },
        showGrid: true,
        clipboard: [],
        isPainting: false,
        multiSelectStart: null,
        moveStartPosition: null,
    };

    const mockProps = {
        levelData: mockLevelData,
        editorState: mockEditorState,
        onMouseMove: vi.fn(),
        onCanvasClick: vi.fn(),
        onTilePlaced: vi.fn(),
    };

    it('should render canvas overlay info', () => {
        render(<Canvas {...mockProps} />);
        expect(screen.getByTestId('canvas-overlay')).toBeInTheDocument();
    });
});
