import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import type { EditorState, LevelData } from '@/types/level';
import { PropertiesPanel } from './PropertiesPanel';

describe('PropertiesPanel', () => {
    const mockLevelData: LevelData = {
        levelName: 'Test Level',
        metadata: {
            version: '1.0',
            createdAt: new Date().toISOString(),
            author: 'Test Author',
            description: 'Test description',
            dimensions: { width: 1920, height: 960 },
            backgroundColor: '#5C94FC',
        },
        tiles: [],
        objects: [],
        spawnPoints: [],
    };

    const mockEditorState: EditorState = {
        selectedTool: null,
        selectedTileType: 'platform-basic',
        selectedObjects: [],
        clipboard: [],
        showGrid: true,
        isPlayMode: false,
        zoom: 1,
        pan: { x: 0, y: 0 },
        mousePosition: { x: 0, y: 0 },
        deletingObjects: [],
    };

    it('should render level properties', () => {
        const mockOnLevelUpdate = vi.fn();

        render(
            <PropertiesPanel
                levelData={mockLevelData}
                editorState={mockEditorState}
                onLevelUpdate={mockOnLevelUpdate}
            />
        );

        // Check for level name input
        expect(screen.getByTestId('input-level-name')).toHaveValue('Test Level');

        // Check for description textarea
        expect(screen.getByTestId('textarea-level-description')).toHaveValue('Test description');

        // Check for dimensions
        expect(screen.getByTestId('input-level-width')).toHaveValue(1920);
        expect(screen.getByTestId('input-level-height')).toHaveValue(960);

        // Check for background color (case insensitive since browsers normalize hex colors)
        expect(screen.getByTestId('input-background-color')).toHaveValue('#5c94fc');
    });

    it('should call onLevelUpdate when level name changes', async () => {
        const user = userEvent.setup();
        const mockOnLevelUpdate = vi.fn();

        render(
            <PropertiesPanel
                levelData={mockLevelData}
                editorState={mockEditorState}
                onLevelUpdate={mockOnLevelUpdate}
            />
        );

        const nameInput = screen.getByTestId('input-level-name');
        await user.clear(nameInput);
        await user.type(nameInput, 'New Level Name');

        expect(mockOnLevelUpdate).toHaveBeenCalled();
    });

    it('should conditionally render close button based on onClose prop', () => {
        const mockOnLevelUpdate = vi.fn();
        const mockOnClose = vi.fn();

        // Render with onClose - button should be present
        const { rerender } = render(
            <PropertiesPanel
                levelData={mockLevelData}
                editorState={mockEditorState}
                onLevelUpdate={mockOnLevelUpdate}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByRole('button', { name: /close properties panel/i })).toBeInTheDocument();

        // Render without onClose - button should not be present
        rerender(
            <PropertiesPanel
                levelData={mockLevelData}
                editorState={mockEditorState}
                onLevelUpdate={mockOnLevelUpdate}
            />
        );

        expect(screen.queryByRole('button', { name: /close properties panel/i })).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
        const user = userEvent.setup();
        const mockOnLevelUpdate = vi.fn();
        const mockOnClose = vi.fn();

        render(
            <PropertiesPanel
                levelData={mockLevelData}
                editorState={mockEditorState}
                onLevelUpdate={mockOnLevelUpdate}
                onClose={mockOnClose}
            />
        );

        const closeButton = screen.getByRole('button', { name: /close properties panel/i });
        await user.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should display selected object properties when object is selected', () => {
        const levelWithTile: LevelData = {
            ...mockLevelData,
            tiles: [
                {
                    id: 'tile-1',
                    type: 'platform-basic',
                    position: { x: 100, y: 200 },
                    dimensions: { width: 64, height: 32 },
                    rotation: 0,
                    layer: 0,
                    properties: {
                        collidable: true,
                        visible: true,
                    },
                },
            ],
        };

        const editorStateWithSelection: EditorState = {
            ...mockEditorState,
            selectedObjects: ['tile-1'],
        };

        render(
            <PropertiesPanel levelData={levelWithTile} editorState={editorStateWithSelection} onLevelUpdate={vi.fn()} />
        );

        // Check for object properties section
        expect(screen.getByText('Selected Object')).toBeInTheDocument();
        expect(screen.getByTestId('input-object-x')).toHaveValue(100);
        expect(screen.getByTestId('input-object-y')).toHaveValue(200);
        expect(screen.getByTestId('input-object-width')).toHaveValue(64);
        expect(screen.getByTestId('input-object-height')).toHaveValue(32);
    });
});
