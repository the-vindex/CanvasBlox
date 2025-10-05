import { describe, expect, it } from 'vitest';
import type { LevelData } from '@/types/level';
import { createDefaultLevel, deserialize, serialize } from './levelSerializer';

describe('LevelSerializer', () => {
    describe('serialize', () => {
        it('should convert level data to JSON string', () => {
            const levelData: LevelData = {
                levelName: 'Test Level',
                metadata: {
                    version: '1.0',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    author: 'Test Author',
                    description: 'Test Description',
                    dimensions: { width: 60, height: 30 },
                    backgroundColor: '#87CEEB',
                },
                tiles: [],
                objects: [],
                spawnPoints: [],
            };

            const json = serialize(levelData);

            expect(json).toBeTypeOf('string');
            expect(JSON.parse(json)).toEqual(levelData);
        });

        it('should format JSON with indentation', () => {
            const levelData: LevelData = {
                levelName: 'Test',
                metadata: {
                    version: '1.0',
                    createdAt: '2024-01-01',
                    author: 'Test',
                    description: '',
                    dimensions: { width: 60, height: 30 },
                    backgroundColor: 'transparent',
                },
                tiles: [],
                objects: [],
                spawnPoints: [],
            };

            const json = serialize(levelData);

            // Should have newlines (formatted)
            expect(json).toContain('\n');
            expect(json).toContain('  '); // 2-space indentation
        });
    });

    describe('deserialize', () => {
        it('should parse valid JSON level data', () => {
            const validJson = JSON.stringify({
                levelName: 'Valid Level',
                metadata: {
                    version: '1.0',
                    createdAt: '2024-01-01',
                    author: 'Test',
                    description: '',
                    dimensions: { width: 60, height: 30 },
                    backgroundColor: '#87CEEB',
                },
                tiles: [],
                objects: [],
                spawnPoints: [],
            });

            const levelData = deserialize(validJson);

            expect(levelData.levelName).toBe('Valid Level');
            expect(levelData.metadata.version).toBe('1.0');
            expect(levelData.tiles).toEqual([]);
        });

        it('should throw error for invalid JSON', () => {
            const invalidJson = '{ invalid json }';

            expect(() => deserialize(invalidJson)).toThrow('Failed to parse level data');
        });

        it('should throw error for missing levelName', () => {
            const missingLevelName = JSON.stringify({
                metadata: {
                    version: '1.0',
                    createdAt: '2024-01-01',
                    author: 'Test',
                    description: '',
                    dimensions: { width: 60, height: 30 },
                    backgroundColor: 'transparent',
                },
                tiles: [],
                objects: [],
                spawnPoints: [],
            });

            expect(() => deserialize(missingLevelName)).toThrow('missing required fields');
        });

        it('should throw error for missing metadata', () => {
            const missingMetadata = JSON.stringify({
                levelName: 'Test',
                tiles: [],
                objects: [],
                spawnPoints: [],
            });

            expect(() => deserialize(missingMetadata)).toThrow('missing required fields');
        });

        it('should throw error for missing tiles array', () => {
            const missingTiles = JSON.stringify({
                levelName: 'Test',
                metadata: {
                    version: '1.0',
                    createdAt: '2024-01-01',
                    author: 'Test',
                    description: '',
                    dimensions: { width: 60, height: 30 },
                    backgroundColor: 'transparent',
                },
                objects: [],
                spawnPoints: [],
            });

            expect(() => deserialize(missingTiles)).toThrow('missing required fields');
        });

        it('should throw error for invalid metadata (missing version)', () => {
            const invalidMetadata = JSON.stringify({
                levelName: 'Test',
                metadata: {
                    dimensions: { width: 60, height: 30 },
                },
                tiles: [],
                objects: [],
                spawnPoints: [],
            });

            expect(() => deserialize(invalidMetadata)).toThrow('Invalid metadata format');
        });

        it('should throw error for invalid metadata (missing dimensions)', () => {
            const invalidMetadata = JSON.stringify({
                levelName: 'Test',
                metadata: {
                    version: '1.0',
                    createdAt: '2024-01-01',
                    author: 'Test',
                    description: '',
                    backgroundColor: 'transparent',
                },
                tiles: [],
                objects: [],
                spawnPoints: [],
            });

            expect(() => deserialize(invalidMetadata)).toThrow('Invalid metadata format');
        });

        it('should parse level with tiles and objects', () => {
            const levelWithData = JSON.stringify({
                levelName: 'Complex Level',
                metadata: {
                    version: '1.0',
                    createdAt: '2024-01-01',
                    author: 'Test',
                    description: 'Complex test level',
                    dimensions: { width: 60, height: 30 },
                    backgroundColor: '#87CEEB',
                },
                tiles: [
                    {
                        id: 'tile-1',
                        type: 'platform-grass',
                        position: { x: 0, y: 20 },
                        dimensions: { width: 6, height: 1 },
                        rotation: 0,
                        layer: 0,
                        properties: { collidable: true, material: 'grass' },
                    },
                ],
                objects: [
                    {
                        id: 'obj-1',
                        type: 'button',
                        position: { x: 10, y: 10 },
                        dimensions: { width: 1, height: 1 },
                        rotation: 0,
                        layer: 1,
                        properties: { triggerId: 'door-1' },
                    },
                ],
                spawnPoints: [
                    {
                        id: 'spawn-1',
                        type: 'player',
                        position: { x: 5, y: 5 },
                        dimensions: { width: 1, height: 2 },
                        rotation: 0,
                        layer: 1,
                        properties: {},
                    },
                ],
            });

            const levelData = deserialize(levelWithData);

            expect(levelData.tiles).toHaveLength(1);
            expect(levelData.objects).toHaveLength(1);
            expect(levelData.spawnPoints).toHaveLength(1);
            expect(levelData.tiles[0].id).toBe('tile-1');
            expect(levelData.objects[0].type).toBe('button');
            expect(levelData.spawnPoints[0].type).toBe('player');
        });
    });

    describe('createDefaultLevel', () => {
        it('should create a level with default name', () => {
            const level = createDefaultLevel();

            expect(level.levelName).toBe('New Level');
        });

        it('should create a level with custom name', () => {
            const level = createDefaultLevel('My Custom Level');

            expect(level.levelName).toBe('My Custom Level');
        });

        it('should include metadata with version', () => {
            const level = createDefaultLevel();

            expect(level.metadata.version).toBe('1.0');
            expect(level.metadata.author).toBe('Level Editor');
            expect(level.metadata.dimensions).toEqual({ width: 60, height: 30 });
        });

        it('should create grass platform tiles', () => {
            const level = createDefaultLevel();

            expect(level.tiles.length).toBeGreaterThan(0);
            expect(level.tiles[0].type).toBe('platform-grass');
        });

        it('should have empty objects and spawnPoints arrays', () => {
            const level = createDefaultLevel();

            expect(level.objects).toEqual([]);
            expect(level.spawnPoints).toEqual([]);
        });

        it('should create valid level that can be serialized and deserialized', () => {
            const level = createDefaultLevel('Round Trip Test');

            const json = serialize(level);
            const parsed = deserialize(json);

            expect(parsed.levelName).toBe('Round Trip Test');
            expect(parsed.tiles.length).toBe(level.tiles.length);
        });
    });

    describe('round-trip serialization', () => {
        it('should preserve all level data through serialize and deserialize', () => {
            const originalLevel: LevelData = {
                levelName: 'Round Trip Level',
                metadata: {
                    version: '1.0',
                    createdAt: '2024-01-01T12:00:00.000Z',
                    author: 'Test Author',
                    description: 'Test Description',
                    dimensions: { width: 60, height: 30 },
                    backgroundColor: '#87CEEB',
                },
                tiles: [
                    {
                        id: 'tile-1',
                        type: 'platform-grass',
                        position: { x: 0, y: 20 },
                        dimensions: { width: 6, height: 1 },
                        rotation: 0,
                        layer: 0,
                        properties: { collidable: true, material: 'grass' },
                    },
                ],
                objects: [
                    {
                        id: 'obj-1',
                        type: 'door',
                        position: { x: 10, y: 15 },
                        dimensions: { width: 2, height: 3 },
                        rotation: 0,
                        layer: 1,
                        properties: { doorId: 'door-1', color: 'blue' },
                    },
                ],
                spawnPoints: [
                    {
                        id: 'spawn-player',
                        type: 'player',
                        position: { x: 5, y: 18 },
                        dimensions: { width: 1, height: 2 },
                        rotation: 0,
                        layer: 1,
                        properties: {},
                    },
                ],
            };

            const json = serialize(originalLevel);
            const parsedLevel = deserialize(json);

            expect(parsedLevel).toEqual(originalLevel);
        });
    });
});
