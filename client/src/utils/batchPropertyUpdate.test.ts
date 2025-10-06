import { describe, expect, it } from 'vitest';
import type { InteractableObject, LevelData, Tile } from '@/types/level';
import {
    analyzeSelection,
    formatTypeName,
    getCommonPropertyValue,
    getSelectedObjects,
    updateBatchProperty,
} from './batchPropertyUpdate';

describe('batchPropertyUpdate', () => {
    describe('getSelectedObjects', () => {
        it('should return selected objects from level data', () => {
            const levelData: LevelData = {
                levelName: 'Test',
                tiles: [
                    {
                        id: 't1',
                        type: 'platform-basic',
                        position: { x: 0, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 0,
                        rotation: 0,
                        properties: { collidable: true },
                    },
                    {
                        id: 't2',
                        type: 'platform-grass',
                        position: { x: 32, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 0,
                        rotation: 0,
                        properties: { collidable: true },
                    },
                ],
                objects: [],
                spawnPoints: [],
                metadata: { description: '', dimensions: { width: 1920, height: 1080 }, backgroundColor: '#1a1a2e' },
            };

            const selected = getSelectedObjects(levelData, ['t1', 't2']);
            expect(selected).toHaveLength(2);
            expect(selected[0].id).toBe('t1');
            expect(selected[1].id).toBe('t2');
        });

        it('should filter out non-existent IDs', () => {
            const levelData: LevelData = {
                levelName: 'Test',
                tiles: [
                    {
                        id: 't1',
                        type: 'platform-basic',
                        position: { x: 0, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 0,
                        rotation: 0,
                        properties: { collidable: true },
                    },
                ],
                objects: [],
                spawnPoints: [],
                metadata: { description: '', dimensions: { width: 1920, height: 1080 }, backgroundColor: '#1a1a2e' },
            };

            const selected = getSelectedObjects(levelData, ['t1', 'nonexistent']);
            expect(selected).toHaveLength(1);
            expect(selected[0].id).toBe('t1');
        });
    });

    describe('analyzeSelection', () => {
        it('should analyze selection with same types', () => {
            const objects: Tile[] = [
                {
                    id: 't1',
                    type: 'platform-basic',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 32, height: 32 },
                    layer: 0,
                    rotation: 0,
                    properties: { collidable: true },
                },
                {
                    id: 't2',
                    type: 'platform-basic',
                    position: { x: 32, y: 0 },
                    dimensions: { width: 32, height: 32 },
                    layer: 0,
                    rotation: 0,
                    properties: { collidable: true },
                },
            ];

            const analysis = analyzeSelection(objects);
            expect(analysis.count).toBe(2);
            expect(analysis.allSameType).toBe(true);
            expect(analysis.commonType).toBe('platform-basic');
            expect(analysis.types).toEqual([{ type: 'platform-basic', count: 2 }]);
        });

        it('should analyze selection with mixed types', () => {
            const objects = [
                {
                    id: 't1',
                    type: 'platform-basic',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 32, height: 32 },
                    layer: 0,
                    rotation: 0,
                    properties: { collidable: true },
                } as Tile,
                {
                    id: 'b1',
                    type: 'button',
                    position: { x: 32, y: 0 },
                    dimensions: { width: 32, height: 32 },
                    layer: 0,
                    rotation: 0,
                    properties: {
                        collidable: true,
                        interactable: true,
                        actionType: 'toggle',
                        delay: 0,
                        linkedObjects: [],
                    },
                } as InteractableObject,
                {
                    id: 'b2',
                    type: 'button',
                    position: { x: 64, y: 0 },
                    dimensions: { width: 32, height: 32 },
                    layer: 0,
                    rotation: 0,
                    properties: {
                        collidable: true,
                        interactable: true,
                        actionType: 'toggle',
                        delay: 0,
                        linkedObjects: [],
                    },
                } as InteractableObject,
            ];

            const analysis = analyzeSelection(objects);
            expect(analysis.count).toBe(3);
            expect(analysis.allSameType).toBe(false);
            expect(analysis.commonType).toBeUndefined();
            expect(analysis.types).toHaveLength(2);
            expect(analysis.types[0]).toEqual({ type: 'button', count: 2 });
            expect(analysis.types[1]).toEqual({ type: 'platform-basic', count: 1 });
        });
    });

    describe('getCommonPropertyValue', () => {
        it('should return common value when all objects have same value', () => {
            const objects: Tile[] = [
                {
                    id: 't1',
                    type: 'platform-basic',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 32, height: 32 },
                    layer: 0,
                    rotation: 0,
                    properties: { collidable: true },
                },
                {
                    id: 't2',
                    type: 'platform-basic',
                    position: { x: 32, y: 0 },
                    dimensions: { width: 32, height: 32 },
                    layer: 0,
                    rotation: 0,
                    properties: { collidable: true },
                },
            ];

            expect(getCommonPropertyValue(objects, 'layer')).toBe(0);
            expect(getCommonPropertyValue(objects, 'dimensions.width')).toBe(32);
            expect(getCommonPropertyValue(objects, 'properties.collidable')).toBe(true);
        });

        it('should return "Mixed" when values differ', () => {
            const objects: Tile[] = [
                {
                    id: 't1',
                    type: 'platform-basic',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 32, height: 32 },
                    layer: 0,
                    rotation: 0,
                    properties: { collidable: true },
                },
                {
                    id: 't2',
                    type: 'platform-basic',
                    position: { x: 32, y: 0 },
                    dimensions: { width: 64, height: 32 },
                    layer: 1,
                    rotation: 0,
                    properties: { collidable: false },
                },
            ];

            expect(getCommonPropertyValue(objects, 'layer')).toBe('Mixed');
            expect(getCommonPropertyValue(objects, 'dimensions.width')).toBe('Mixed');
            expect(getCommonPropertyValue(objects, 'properties.collidable')).toBe('Mixed');
        });

        it('should return "Mixed" for empty selection', () => {
            expect(getCommonPropertyValue([], 'layer')).toBe('Mixed');
        });

        it('should handle nested objects', () => {
            const objects: Tile[] = [
                {
                    id: 't1',
                    type: 'platform-basic',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 32, height: 32 },
                    layer: 0,
                    rotation: 0,
                    properties: { collidable: true },
                },
                {
                    id: 't2',
                    type: 'platform-basic',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 32, height: 32 },
                    layer: 0,
                    rotation: 0,
                    properties: { collidable: true },
                },
            ];

            const position = getCommonPropertyValue(objects, 'position');
            expect(position).toEqual({ x: 0, y: 0 });
        });
    });

    describe('updateBatchProperty', () => {
        it('should update simple property on selected objects', () => {
            const levelData: LevelData = {
                levelName: 'Test',
                tiles: [
                    {
                        id: 't1',
                        type: 'platform-basic',
                        position: { x: 0, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 0,
                        rotation: 0,
                        properties: { collidable: true },
                    },
                    {
                        id: 't2',
                        type: 'platform-grass',
                        position: { x: 32, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 0,
                        rotation: 0,
                        properties: { collidable: true },
                    },
                ],
                objects: [],
                spawnPoints: [],
                metadata: { description: '', dimensions: { width: 1920, height: 1080 }, backgroundColor: '#1a1a2e' },
            };

            const updated = updateBatchProperty(levelData, ['t1', 't2'], 'layer', 5);
            expect(updated.tiles[0].layer).toBe(5);
            expect(updated.tiles[1].layer).toBe(5);
        });

        it('should update nested properties', () => {
            const levelData: LevelData = {
                levelName: 'Test',
                tiles: [
                    {
                        id: 't1',
                        type: 'platform-basic',
                        position: { x: 0, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 0,
                        rotation: 0,
                        properties: { collidable: true },
                    },
                    {
                        id: 't2',
                        type: 'platform-grass',
                        position: { x: 32, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 0,
                        rotation: 0,
                        properties: { collidable: true },
                    },
                ],
                objects: [],
                spawnPoints: [],
                metadata: { description: '', dimensions: { width: 1920, height: 1080 }, backgroundColor: '#1a1a2e' },
            };

            const updated = updateBatchProperty(levelData, ['t1', 't2'], 'properties.collidable', false);
            expect(updated.tiles[0].properties.collidable).toBe(false);
            expect(updated.tiles[1].properties.collidable).toBe(false);
        });

        it('should not update unselected objects', () => {
            const levelData: LevelData = {
                levelName: 'Test',
                tiles: [
                    {
                        id: 't1',
                        type: 'platform-basic',
                        position: { x: 0, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 0,
                        rotation: 0,
                        properties: { collidable: true },
                    },
                    {
                        id: 't2',
                        type: 'platform-grass',
                        position: { x: 32, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 5,
                        rotation: 0,
                        properties: { collidable: true },
                    },
                ],
                objects: [],
                spawnPoints: [],
                metadata: { description: '', dimensions: { width: 1920, height: 1080 }, backgroundColor: '#1a1a2e' },
            };

            const updated = updateBatchProperty(levelData, ['t1'], 'layer', 10);
            expect(updated.tiles[0].layer).toBe(10);
            expect(updated.tiles[1].layer).toBe(5); // unchanged
        });

        it('should handle objects from different arrays', () => {
            const levelData: LevelData = {
                levelName: 'Test',
                tiles: [
                    {
                        id: 't1',
                        type: 'platform-basic',
                        position: { x: 0, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 0,
                        rotation: 0,
                        properties: { collidable: true },
                    },
                ],
                objects: [
                    {
                        id: 'b1',
                        type: 'button',
                        position: { x: 32, y: 0 },
                        dimensions: { width: 32, height: 32 },
                        layer: 0,
                        rotation: 0,
                        properties: {
                            collidable: true,
                            interactable: true,
                            actionType: 'toggle',
                            delay: 0,
                            linkedObjects: [],
                        },
                    },
                ],
                spawnPoints: [],
                metadata: { description: '', dimensions: { width: 1920, height: 1080 }, backgroundColor: '#1a1a2e' },
            };

            const updated = updateBatchProperty(levelData, ['t1', 'b1'], 'layer', 3);
            expect(updated.tiles[0].layer).toBe(3);
            expect(updated.objects[0].layer).toBe(3);
        });
    });

    describe('formatTypeName', () => {
        it('should format type names correctly', () => {
            expect(formatTypeName('platform-basic')).toBe('Platform - Basic');
            expect(formatTypeName('platform-grass')).toBe('Platform - Grass');
            expect(formatTypeName('button')).toBe('Button');
            expect(formatTypeName('door')).toBe('Door');
        });
    });
});
