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
                    dimensions: { width: 60, height: 30 }, // Level size in tiles
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
                dimensions: { width: 60, height: 30 }, // Level size in tiles
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
            clipboard: [],
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
    Toolbar: ({
        onToolChange,
        onZoomIn,
        onZoomOut,
        onZoomReset,
        onTogglePropertiesPanel,
        onCopy,
        onPaste,
        hasSelection,
        hasClipboard,
        editorState,
    }: any) => (
        <div data-testid="toolbar">
            <button type="button" data-testid="tool-select" onClick={() => onToolChange('select')}>
                Select
            </button>
            <button type="button" data-testid="tool-multiselect" onClick={() => onToolChange('multiselect')}>
                Multi-select
            </button>
            <button type="button" data-testid="tool-move" onClick={() => onToolChange('move')}>
                Move
            </button>
            <button type="button" data-testid="tool-line" onClick={() => onToolChange('line')}>
                Line
            </button>
            <button type="button" data-testid="tool-rectangle" onClick={() => onToolChange('rectangle')}>
                Rectangle
            </button>
            <button type="button" data-testid="tool-link" onClick={() => onToolChange('link')}>
                Link
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
            <button type="button" aria-label="Copy" onClick={onCopy} disabled={!hasSelection} data-testid="button-copy">
                Copy
            </button>
            <button
                type="button"
                aria-label="Paste"
                onClick={onPaste}
                disabled={!hasClipboard}
                data-testid="button-paste"
            >
                Paste
            </button>
            <span data-testid="zoom-level">{Math.round(editorState.zoom * 100)}%</span>
        </div>
    ),
}));

vi.mock('@/components/level-editor/LevelTabs', () => ({
    LevelTabs: () => <div data-testid="level-tabs">Level Tabs</div>,
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

describe('LevelEditor - Step 13: Copy/Paste', () => {
    it('should render copy button in toolbar', () => {
        render(<LevelEditor />);
        const copyButton = screen.getByRole('button', { name: /Copy/i });
        expect(copyButton).toBeInTheDocument();
    });

    it('should render paste button in toolbar', () => {
        render(<LevelEditor />);
        const pasteButton = screen.getByRole('button', { name: /Paste/i });
        expect(pasteButton).toBeInTheDocument();
    });

    it('should disable copy button when no objects are selected', () => {
        render(<LevelEditor />);
        const copyButton = screen.getByRole('button', { name: /Copy/i });
        expect(copyButton).toBeDisabled();
    });

    it('should disable paste button when clipboard is empty', () => {
        render(<LevelEditor />);
        const pasteButton = screen.getByRole('button', { name: /Paste/i });
        expect(pasteButton).toBeDisabled();
    });
});

describe('LevelEditor - Step 15: Auto-Save and Unsaved Changes Indicator', () => {
    it('should render save indicator', () => {
        render(<LevelEditor />);
        const saveIndicator = screen.getByTestId('save-indicator');
        expect(saveIndicator).toBeInTheDocument();
    });

    it('should initially show "Saved" state', () => {
        render(<LevelEditor />);
        const saveIndicator = screen.getByTestId('save-indicator');
        expect(saveIndicator).toHaveTextContent('Saved');
    });

    it('should show green save icon when saved', () => {
        render(<LevelEditor />);
        const saveIcon = screen.getByTestId('save-indicator').querySelector('i.fa-save');
        expect(saveIcon).toHaveClass('text-green-500');
    });
});

describe('LevelEditor - Step 23: Update Status Bar with Live Data', () => {
    it('should display live canvas dimensions from currentLevel', () => {
        render(<LevelEditor />);
        const canvasDimensions = screen.getByTestId('statusbar-canvas-dimensions');
        // 60 tiles × 32px = 1920px, 30 tiles × 32px = 960px
        expect(canvasDimensions).toHaveTextContent('1920 × 960 px');
    });

    it('should display calculated grid dimensions', () => {
        render(<LevelEditor />);
        const gridDimensions = screen.getByTestId('statusbar-grid-dimensions');
        // Grid dimensions are stored in tiles in metadata
        expect(gridDimensions).toHaveTextContent('60 × 30 tiles');
    });

    it('should display live object count', () => {
        render(<LevelEditor />);
        const objectCount = screen.getByTestId('statusbar-object-count');
        // Mock has 0 tiles, 0 objects, 0 spawn points = 0 total
        expect(objectCount).toHaveTextContent('0');
    });

    it('should display live zoom percentage', () => {
        render(<LevelEditor />);
        const zoomDisplay = screen.getByTestId('statusbar-zoom-display');
        // Mock has zoom: 1 = 100%
        expect(zoomDisplay).toHaveTextContent('100%');
    });

    it('should display live history position', () => {
        render(<LevelEditor />);
        const historyDisplay = screen.getByTestId('statusbar-history');
        // Mock has history: [{ levels: [], description: 'Initial state' }] and historyIndex: 0, so should show 1/1
        expect(historyDisplay).toHaveTextContent('1/1');
    });
});
