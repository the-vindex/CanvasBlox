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
        showScanlines: false,
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

    it('should not render scanlines overlay when showScanlines is false', () => {
        render(<Canvas {...mockProps} />);

        const scanlinesOverlay = document.querySelector('.scanlines-overlay');
        expect(scanlinesOverlay).toBeNull();
    });

    it('should render scanlines overlay when showScanlines is true', () => {
        const propsWithScanlines = {
            ...mockProps,
            editorState: {
                ...mockEditorState,
                showScanlines: true,
            },
        };

        render(<Canvas {...propsWithScanlines} />);

        const scanlinesOverlay = document.querySelector('.scanlines-overlay');
        expect(scanlinesOverlay).not.toBeNull();
    });

    it('should have pointer-events: none on scanlines overlay', () => {
        const propsWithScanlines = {
            ...mockProps,
            editorState: {
                ...mockEditorState,
                showScanlines: true,
            },
        };

        render(<Canvas {...propsWithScanlines} />);

        const scanlinesOverlay = document.querySelector('.scanlines-overlay') as HTMLElement;
        expect(scanlinesOverlay).not.toBeNull();
        expect(scanlinesOverlay.style.pointerEvents).toBe('none');
    });

    it('should render canvas overlay info regardless of scanlines state', () => {
        // Test with scanlines off
        const { rerender } = render(<Canvas {...mockProps} />);
        expect(screen.getByTestId('canvas-overlay')).toBeInTheDocument();

        // Test with scanlines on
        rerender(
            <Canvas
                {...mockProps}
                editorState={{
                    ...mockEditorState,
                    showScanlines: true,
                }}
            />
        );
        expect(screen.getByTestId('canvas-overlay')).toBeInTheDocument();
    });
});
