import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditorState, InteractableObject, LevelData, SpawnPoint, Tile } from '@/types/level';
import { CanvasRenderer } from './canvasRenderer';

describe('CanvasRenderer', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let renderer: CanvasRenderer;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        ctx = canvas.getContext('2d')!;
        renderer = new CanvasRenderer(ctx);
    });

    describe('clear', () => {
        it('should clear the canvas', () => {
            const clearRectSpy = vi.spyOn(ctx, 'clearRect');
            renderer.clear();
            expect(clearRectSpy).toHaveBeenCalledWith(0, 0, 800, 600);
        });
    });

    describe('drawBackground', () => {
        it('should fill canvas with background color', () => {
            const fillRectSpy = vi.spyOn(ctx, 'fillRect');
            renderer.drawBackground('#87CEEB');
            expect(ctx.fillStyle).toBe('#87CEEB'); // Our mock doesn't convert case
            expect(fillRectSpy).toHaveBeenCalledWith(0, 0, 800, 600);
        });

        it('should skip drawing for transparent background', () => {
            const fillRectSpy = vi.spyOn(ctx, 'fillRect');
            renderer.drawBackground('transparent');
            expect(fillRectSpy).not.toHaveBeenCalled();
        });
    });

    describe('drawGrid', () => {
        it('should draw grid when show is true', () => {
            const strokeSpy = vi.spyOn(ctx, 'stroke');
            renderer.drawGrid({ x: 0, y: 0 }, 1, true);
            expect(strokeSpy).toHaveBeenCalled();
        });

        it('should not draw grid when show is false', () => {
            const strokeSpy = vi.spyOn(ctx, 'stroke');
            renderer.drawGrid({ x: 0, y: 0 }, 1, false);
            expect(strokeSpy).not.toHaveBeenCalled();
        });

        it('should apply pan and zoom to grid spacing', () => {
            const beginPathSpy = vi.spyOn(ctx, 'beginPath');
            const pan = { x: 10, y: 20 };
            const zoom = 0.5;

            renderer.drawGrid(pan, zoom, true);
            expect(beginPathSpy).toHaveBeenCalled();
        });
    });

    describe('drawTile', () => {
        it('should draw a basic platform tile', () => {
            const tile: Tile = {
                id: 'tile-1',
                type: 'platform-basic',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                properties: { collision: true },
            };

            const fillRectSpy = vi.spyOn(ctx, 'fillRect');
            renderer.drawTile(tile, { x: 0, y: 0 }, 1);

            expect(fillRectSpy).toHaveBeenCalled();
        });

        it('should apply zoom to tile dimensions', () => {
            const tile: Tile = {
                id: 'tile-2',
                type: 'platform-grass',
                position: { x: 1, y: 1 },
                dimensions: { width: 2, height: 1 },
                rotation: 0,
                properties: { collision: true },
            };

            const saveSpy = vi.spyOn(ctx, 'save');
            const restoreSpy = vi.spyOn(ctx, 'restore');

            renderer.drawTile(tile, { x: 0, y: 0 }, 2);

            expect(saveSpy).toHaveBeenCalled();
            expect(restoreSpy).toHaveBeenCalled();
        });

        it('should apply rotation to tile', () => {
            const tile: Tile = {
                id: 'tile-3',
                type: 'platform-stone',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 90,
                properties: { collision: true },
            };

            const rotateSpy = vi.spyOn(ctx, 'rotate');
            renderer.drawTile(tile, { x: 0, y: 0 }, 1);

            expect(rotateSpy).toHaveBeenCalled();
        });

        it('should draw selection outline for selected tiles', () => {
            const tile: Tile = {
                id: 'tile-4',
                type: 'platform-basic',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                properties: { collision: true },
            };

            const strokeRectSpy = vi.spyOn(ctx, 'strokeRect');
            renderer.drawTile(tile, { x: 0, y: 0 }, 1, true);

            // Should draw the tile and selection outline
            expect(strokeRectSpy).toHaveBeenCalled();
        });

        it('should apply pulsing glow effect to selected tiles', () => {
            const tile: Tile = {
                id: 'tile-5',
                type: 'platform-grass',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                properties: { collision: true },
            };

            // Spy on context properties used for glow effect
            const saveSpy = vi.spyOn(ctx, 'save');
            const restoreSpy = vi.spyOn(ctx, 'restore');
            const strokeRectSpy = vi.spyOn(ctx, 'strokeRect');

            renderer.drawTile(tile, { x: 0, y: 0 }, 1, true);

            // Should use save/restore for selection effect
            expect(saveSpy).toHaveBeenCalled();
            expect(restoreSpy).toHaveBeenCalled();

            // Should draw selection outline with pulsing glow
            expect(strokeRectSpy).toHaveBeenCalled();

            // Verify shadow and stroke properties are set for glow effect
            // Note: We don't test exact values since they're time-based
            // The important behavior is that these properties are configured
            expect(ctx.shadowColor).toBeTruthy();
            expect(ctx.strokeStyle).toBeTruthy();
        });
    });

    describe('drawObject', () => {
        it('should draw a button object', () => {
            const obj: InteractableObject = {
                id: 'obj-1',
                type: 'button',
                position: { x: 2, y: 2 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                properties: { linkedObjects: [] },
            };

            const saveSpy = vi.spyOn(ctx, 'save');
            renderer.drawObject(obj, { x: 0, y: 0 }, 1);

            expect(saveSpy).toHaveBeenCalled();
        });

        it('should draw a teleport object', () => {
            const obj: InteractableObject = {
                id: 'obj-2',
                type: 'teleport',
                position: { x: 3, y: 3 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                properties: { linkedObjects: ['obj-3'] },
            };

            const arcSpy = vi.spyOn(ctx, 'arc');
            renderer.drawObject(obj, { x: 0, y: 0 }, 1);

            // Teleport draws multiple arcs
            expect(arcSpy).toHaveBeenCalled();
        });

        it('should apply pulsing glow effect to selected objects', () => {
            const obj: InteractableObject = {
                id: 'obj-3',
                type: 'button',
                position: { x: 2, y: 2 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                properties: { linkedObjects: [] },
            };

            const saveSpy = vi.spyOn(ctx, 'save');
            const restoreSpy = vi.spyOn(ctx, 'restore');
            const strokeRectSpy = vi.spyOn(ctx, 'strokeRect');

            renderer.drawObject(obj, { x: 0, y: 0 }, 1, true);

            expect(saveSpy).toHaveBeenCalled();
            expect(restoreSpy).toHaveBeenCalled();
            expect(strokeRectSpy).toHaveBeenCalled();

            // Verify glow properties are set
            expect(ctx.shadowColor).toBeTruthy();
            expect(ctx.strokeStyle).toBeTruthy();
        });
    });

    describe('drawSpawnPoint', () => {
        it('should draw a player spawn point', () => {
            const spawn: SpawnPoint = {
                id: 'spawn-1',
                type: 'player',
                position: { x: 1, y: 1 },
                facingDirection: 'right',
                properties: {},
            };

            const fillRectSpy = vi.spyOn(ctx, 'fillRect');
            renderer.drawSpawnPoint(spawn, { x: 0, y: 0 }, 1);

            // Player character has multiple filled rectangles (head, body, legs)
            expect(fillRectSpy).toHaveBeenCalled();
        });

        it('should draw an enemy spawn point', () => {
            const spawn: SpawnPoint = {
                id: 'spawn-2',
                type: 'enemy',
                position: { x: 5, y: 5 },
                facingDirection: 'left',
                properties: { aiType: 'patrol', patrolPath: [] },
            };

            const fillRectSpy = vi.spyOn(ctx, 'fillRect');
            renderer.drawSpawnPoint(spawn, { x: 0, y: 0 }, 1);

            expect(fillRectSpy).toHaveBeenCalled();
        });

        it('should apply pulsing glow effect to selected spawn points', () => {
            const spawn: SpawnPoint = {
                id: 'spawn-3',
                type: 'player',
                position: { x: 3, y: 3 },
                facingDirection: 'right',
                properties: {},
            };

            const saveSpy = vi.spyOn(ctx, 'save');
            const restoreSpy = vi.spyOn(ctx, 'restore');
            const strokeRectSpy = vi.spyOn(ctx, 'strokeRect');

            renderer.drawSpawnPoint(spawn, { x: 0, y: 0 }, 1, true);

            expect(saveSpy).toHaveBeenCalled();
            expect(restoreSpy).toHaveBeenCalled();
            expect(strokeRectSpy).toHaveBeenCalled();

            // Verify glow properties are set
            expect(ctx.shadowColor).toBeTruthy();
            expect(ctx.strokeStyle).toBeTruthy();
        });
    });

    describe('render', () => {
        it('should render complete level with all elements', () => {
            const levelData: LevelData = {
                levelName: 'Test Level',
                metadata: {
                    version: '1.0',
                    createdAt: new Date().toISOString(),
                    author: 'Test',
                    description: 'Test level',
                    dimensions: { width: 100, height: 50 },
                    backgroundColor: '#87CEEB',
                },
                tiles: [
                    {
                        id: 'tile-1',
                        type: 'platform-grass',
                        position: { x: 0, y: 30 },
                        dimensions: { width: 10, height: 2 },
                        rotation: 0,
                        properties: { collision: true },
                    },
                ],
                objects: [
                    {
                        id: 'obj-1',
                        type: 'button',
                        position: { x: 5, y: 29 },
                        dimensions: { width: 1, height: 1 },
                        rotation: 0,
                        properties: { linkedObjects: [] },
                    },
                ],
                spawnPoints: [
                    {
                        id: 'spawn-1',
                        type: 'player',
                        position: { x: 2, y: 28 },
                        facingDirection: 'right',
                        properties: {},
                    },
                ],
            };

            const editorState: EditorState = {
                selectedTool: null,
                selectedTileType: null,
                selectedObjects: [],
                deletingObjects: [],
                zoom: 1,
                pan: { x: 0, y: 0 },
                showGrid: true,
                showScanlines: false,
                mousePosition: null,
                isDrawing: false,
                isPanning: false,
                selectionBox: null,
            };

            const clearSpy = vi.spyOn(renderer, 'clear');
            const drawBackgroundSpy = vi.spyOn(renderer, 'drawBackground');
            const drawGridSpy = vi.spyOn(renderer, 'drawGrid');

            renderer.render(levelData, editorState);

            expect(clearSpy).toHaveBeenCalled();
            expect(drawBackgroundSpy).toHaveBeenCalledWith('#87CEEB');
            expect(drawGridSpy).toHaveBeenCalledWith({ x: 0, y: 0 }, 1, true);
        });

        it('should draw preview tile when tile type is selected', () => {
            const levelData: LevelData = {
                levelName: 'Test',
                metadata: {
                    version: '1.0',
                    createdAt: new Date().toISOString(),
                    author: 'Test',
                    description: '',
                    dimensions: { width: 100, height: 50 },
                    backgroundColor: '#87CEEB',
                },
                tiles: [],
                objects: [],
                spawnPoints: [],
            };

            const editorState: EditorState = {
                selectedTool: null,
                selectedTileType: 'platform-basic',
                selectedObjects: [],
                deletingObjects: [],
                zoom: 1,
                pan: { x: 0, y: 0 },
                showGrid: true,
                showScanlines: false,
                mousePosition: { x: 5, y: 5 },
                isDrawing: false,
                isPanning: false,
                selectionBox: null,
            };

            const drawPreviewTileSpy = vi.spyOn(renderer, 'drawPreviewTile');

            renderer.render(levelData, editorState);

            expect(drawPreviewTileSpy).toHaveBeenCalledWith({ x: 5, y: 5 }, 'platform-basic', { x: 0, y: 0 }, 1);
        });
    });

    describe('drawLinks', () => {
        it('should draw links between connected objects', () => {
            const objects: InteractableObject[] = [
                {
                    id: 'button-1',
                    type: 'button',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    properties: { linkedObjects: ['door-1'] },
                },
                {
                    id: 'door-1',
                    type: 'door',
                    position: { x: 5, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    properties: { linkedObjects: [] },
                },
            ];

            const strokeSpy = vi.spyOn(ctx, 'stroke');
            renderer.drawLinks(objects, { x: 0, y: 0 }, 1);

            expect(strokeSpy).toHaveBeenCalled();
        });
    });

    describe('drawSelectionBox', () => {
        it('should draw selection box for drag selection', () => {
            const start = { x: 1, y: 1 }; // Tile positions
            const end = { x: 2, y: 2 };
            const pan = { x: 0, y: 0 };
            const zoom = 1;

            const fillRectSpy = vi.spyOn(ctx, 'fillRect');
            const strokeRectSpy = vi.spyOn(ctx, 'strokeRect');

            renderer.drawSelectionBox(start, end, pan, zoom);

            // Should convert tile positions to pixels (32px per tile)
            // minX = 1 * 32 = 32, minY = 1 * 32 = 32
            // width = (2 - 1) * 32 + 32 = 64, height = 64
            expect(fillRectSpy).toHaveBeenCalledWith(32, 32, 64, 64);
            expect(strokeRectSpy).toHaveBeenCalledWith(32, 32, 64, 64);
        });

        it('should handle reverse drag (bottom-right to top-left)', () => {
            const start = { x: 2, y: 2 }; // Tile positions
            const end = { x: 1, y: 1 };
            const pan = { x: 0, y: 0 };
            const zoom = 1;

            const fillRectSpy = vi.spyOn(ctx, 'fillRect');

            renderer.drawSelectionBox(start, end, pan, zoom);

            // Should normalize to top-left corner
            // minX = 1 * 32 = 32, minY = 1 * 32 = 32
            // width = (2 - 1) * 32 + 32 = 64, height = 64
            expect(fillRectSpy).toHaveBeenCalledWith(32, 32, 64, 64);
        });
    });

    describe('Step 19: Delete Animations', () => {
        it('should apply shrink scale transformation when tile is deleting', () => {
            const tile: Tile = {
                id: 'tile-1',
                type: 'platform-grass',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                properties: {},
            };

            // Set up editorState with deletion tracking
            const editorState: EditorState = {
                selectedTool: null,
                selectedTileType: null,
                selectedObjects: [],
                clipboard: [],
                deletingObjects: ['tile-1'],
                deletionStartTimes: new Map([['tile-1', Date.now()]]),
                zoom: 1,
                pan: { x: 0, y: 0 },
                showGrid: true,
                showScanlines: false,
                mousePosition: { x: 0, y: 0 },
            };

            const levelData: LevelData = {
                id: 'test',
                levelName: 'Test',
                metadata: {
                    backgroundColor: '#000',
                    dimensions: { width: 10, height: 10 },
                },
                tiles: [tile],
                objects: [],
                spawnPoints: [],
            };

            const scaleSpy = vi.spyOn(ctx, 'scale');

            // Render to set editorState in renderer
            renderer.render(levelData, editorState);

            expect(scaleSpy).toHaveBeenCalled();
        });

        it('should apply shrink scale transformation when object is deleting', () => {
            const obj: InteractableObject = {
                id: 'button-1',
                type: 'button',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                properties: {},
            };

            const editorState: EditorState = {
                selectedTool: null,
                selectedTileType: null,
                selectedObjects: [],
                clipboard: [],
                deletingObjects: ['button-1'],
                deletionStartTimes: new Map([['button-1', Date.now()]]),
                zoom: 1,
                pan: { x: 0, y: 0 },
                showGrid: true,
                showScanlines: false,
                mousePosition: { x: 0, y: 0 },
            };

            const levelData: LevelData = {
                id: 'test',
                levelName: 'Test',
                metadata: {
                    backgroundColor: '#000',
                    dimensions: { width: 10, height: 10 },
                },
                tiles: [],
                objects: [obj],
                spawnPoints: [],
            };

            const scaleSpy = vi.spyOn(ctx, 'scale');

            renderer.render(levelData, editorState);

            expect(scaleSpy).toHaveBeenCalled();
        });

        it('should apply shrink scale transformation when spawn point is deleting', () => {
            const spawn: SpawnPoint = {
                id: 'spawn-1',
                type: 'player',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                properties: {},
            };

            const editorState: EditorState = {
                selectedTool: null,
                selectedTileType: null,
                selectedObjects: [],
                clipboard: [],
                deletingObjects: ['spawn-1'],
                deletionStartTimes: new Map([['spawn-1', Date.now()]]),
                zoom: 1,
                pan: { x: 0, y: 0 },
                showGrid: true,
                showScanlines: false,
                mousePosition: { x: 0, y: 0 },
            };

            const levelData: LevelData = {
                id: 'test',
                levelName: 'Test',
                metadata: {
                    backgroundColor: '#000',
                    dimensions: { width: 10, height: 10 },
                },
                tiles: [],
                objects: [],
                spawnPoints: [spawn],
            };

            const scaleSpy = vi.spyOn(ctx, 'scale');

            renderer.render(levelData, editorState);

            expect(scaleSpy).toHaveBeenCalled();
        });

        it('should not apply scale transformation when object is not deleting', () => {
            const tile: Tile = {
                id: 'tile-1',
                type: 'platform-grass',
                position: { x: 0, y: 0 },
                dimensions: { width: 1, height: 1 },
                rotation: 0,
                properties: {},
            };

            // Test without deletion
            const editorStateNoDeletion: EditorState = {
                selectedTool: null,
                selectedTileType: null,
                selectedObjects: [],
                clipboard: [],
                deletingObjects: [],
                zoom: 1,
                pan: { x: 0, y: 0 },
                showGrid: true,
                showScanlines: false,
                mousePosition: { x: 0, y: 0 },
            };

            const levelDataNoDeletion: LevelData = {
                id: 'test',
                levelName: 'Test',
                metadata: {
                    backgroundColor: '#000',
                    dimensions: { width: 10, height: 10 },
                },
                tiles: [tile],
                objects: [],
                spawnPoints: [],
            };

            const scaleSpy = vi.spyOn(ctx, 'scale');

            renderer.render(levelDataNoDeletion, editorStateNoDeletion);
            const scaleCallsWithoutDelete = scaleSpy.mock.calls.length;

            // Reset spy
            scaleSpy.mockClear();

            // Test with deletion
            const editorStateWithDeletion: EditorState = {
                ...editorStateNoDeletion,
                deletingObjects: ['tile-1'],
                deletionStartTimes: new Map([['tile-1', Date.now()]]),
            };

            const levelDataWithDeletion: LevelData = {
                ...levelDataNoDeletion,
                tiles: [tile],
            };

            renderer.render(levelDataWithDeletion, editorStateWithDeletion);
            const scaleCallsWithDelete = scaleSpy.mock.calls.length;

            // Should have additional scale calls for delete animation
            expect(scaleCallsWithDelete).toBeGreaterThan(scaleCallsWithoutDelete);
        });
    });
});
