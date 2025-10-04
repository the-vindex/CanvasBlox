import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LevelEditor from './LevelEditor';

// Mock the hooks and components
vi.mock('@/hooks/useLevelEditor', () => ({
    useLevelEditor: () => ({
        levels: [
            {
                levelName: 'Test Level',
                metadata: {
                    version: '1.0',
                    createdAt: new Date().toISOString(),
                    author: 'Test',
                    description: 'Test level',
                    dimensions: { width: 60, height: 30 },
                    backgroundColor: '#87CEEB',
                },
                tiles: [],
                objects: [],
                spawnPoints: [],
            },
        ],
        currentLevel: {
            levelName: 'Test Level',
            metadata: {
                version: '1.0',
                createdAt: new Date().toISOString(),
                author: 'Test',
                description: 'Test level',
                dimensions: { width: 60, height: 30 },
                backgroundColor: '#87CEEB',
            },
            tiles: [],
            objects: [],
            spawnPoints: [],
        },
        currentLevelIndex: 0,
        editorState: {
            selectedTool: null,
            selectedTileType: 'platform-grass',
            zoom: 1,
            pan: { x: 0, y: 0 },
            mousePosition: { x: 0, y: 0 },
            selectedObjects: [],
            linkingMode: {
                active: false,
                sourceObject: null,
            },
            showGrid: true,
            showScanlines: false,
        },
        history: [{ levels: [], description: 'Initial state' }],
        historyIndex: 0,
        setCurrentLevelIndex: vi.fn(),
        setEditorState: vi.fn(),
        updateCurrentLevel: vi.fn(),
        createNewLevel: vi.fn(),
        duplicateLevel: vi.fn(),
        deleteLevel: vi.fn(),
        addTile: vi.fn(),
        addObject: vi.fn(),
        selectObject: vi.fn(),
        deleteSelectedObjects: vi.fn(),
        copySelectedObjects: vi.fn(),
        pasteObjects: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
        commitBatchToHistory: vi.fn(),
    }),
}));

vi.mock('@/components/level-editor/Canvas', () => ({
    Canvas: () => <canvas data-testid="level-canvas" />,
}));

vi.mock('@/components/level-editor/TilePalette', () => ({
    TilePalette: () => <div data-testid="tile-palette">Tile Palette</div>,
}));

vi.mock('@/components/level-editor/PropertiesPanel', () => ({
    PropertiesPanel: () => <div data-testid="properties-panel">Properties Panel</div>,
}));

vi.mock('@/components/level-editor/Toolbar', () => ({
    Toolbar: ({ onToolChange, onZoomIn, onZoomOut, onZoomReset, onTogglePropertiesPanel, editorState }: any) => (
        <div data-testid="toolbar">
            <button type="button" data-testid="tool-select" onClick={() => onToolChange('select')}>
                Select
            </button>
            <button type="button" data-testid="button-zoom-in" onClick={onZoomIn}>
                Zoom In
            </button>
            <button type="button" data-testid="button-zoom-out" onClick={onZoomOut}>
                Zoom Out
            </button>
            <button type="button" data-testid="button-reset-zoom" onClick={onZoomReset}>
                Reset Zoom
            </button>
            <button type="button" data-testid="button-toggle-properties" onClick={onTogglePropertiesPanel}>
                Toggle Properties
            </button>
            <span data-testid="zoom-level">{Math.round(editorState.zoom * 100)}%</span>
        </div>
    ),
}));

describe('LevelEditor - Step 6: Toolbar Integration', () => {
    it('should render Toolbar component', () => {
        render(<LevelEditor />);
        expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    });

    it('should toggle properties panel when toggle button is clicked', () => {
        render(<LevelEditor />);

        const propertiesPanel = screen.getByTestId('properties-panel');
        expect(propertiesPanel).toBeInTheDocument();

        const toggleButton = screen.getByTestId('button-toggle-properties');
        fireEvent.click(toggleButton);

        // Properties panel should be hidden
        expect(screen.queryByTestId('properties-panel')).not.toBeInTheDocument();
    });
});
