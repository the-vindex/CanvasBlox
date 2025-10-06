import { DEFAULT_GRASS_Y } from '@/constants/editor';
import type { LevelData, Tile } from '@/types/level';

export function serialize(levelData: LevelData): string {
    return JSON.stringify(levelData, null, 2);
}

/**
 * Remove overlapping tiles from a tiles array (newest tile wins)
 * Exception: Keep door if button is placed on top (puzzle mechanic)
 */
export function removeOverlappingTiles(tiles: Tile[]): Tile[] {
    const result: Tile[] = [];
    const positionMap = new Map<string, Tile[]>();

    // Group tiles by position
    for (const tile of tiles) {
        const key = `${tile.position.x},${tile.position.y}`;
        if (!positionMap.has(key)) {
            positionMap.set(key, []);
        }
        positionMap.get(key)!.push(tile);
    }

    // For each position, keep only the newest tile (or both if button + door)
    for (const tilesAtPosition of positionMap.values()) {
        if (tilesAtPosition.length === 1) {
            result.push(tilesAtPosition[0]);
        } else {
            // Multiple tiles at same position - newest wins
            const latestTile = tilesAtPosition[tilesAtPosition.length - 1];

            // Exception: Keep door if placing button on top
            if (latestTile.type === 'button') {
                const doorTile = tilesAtPosition.find((t) => t.type === 'door');
                if (doorTile) {
                    result.push(doorTile);
                }
            }

            result.push(latestTile);
        }
    }

    return result;
}

export function deserialize(jsonString: string): LevelData {
    try {
        const data = JSON.parse(jsonString);

        // Validate basic structure
        if (!data.levelName || !data.metadata || !data.tiles || !data.objects || !data.spawnPoints) {
            throw new Error('Invalid level format: missing required fields');
        }

        // Validate metadata
        if (!data.metadata.version || !data.metadata.dimensions) {
            throw new Error('Invalid metadata format');
        }

        // Clean up overlapping tiles (newest wins)
        const cleanedTiles = removeOverlappingTiles(data.tiles);

        return {
            ...data,
            tiles: cleanedTiles,
        } as LevelData;
    } catch (error) {
        throw new Error(`Failed to parse level data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export function createDefaultLevel(name: string = 'New Level'): LevelData {
    const now = new Date().toISOString();

    // Create default grass platform (10 blocks from bottom)
    const tiles = [];

    // Create grass platform spanning full width (60 tiles)
    for (let x = 0; x < 60; x += 6) {
        tiles.push({
            id: `tile-ground-${x}`,
            type: 'platform-grass',
            position: { x, y: DEFAULT_GRASS_Y },
            dimensions: { width: 6, height: 1 },
            rotation: 0 as 0,
            layer: 0,
            properties: {
                collidable: true,
                material: 'grass',
            },
        });
    }

    return {
        levelName: name,
        metadata: {
            version: '1.0',
            createdAt: now,
            author: 'Level Editor',
            description: '',
            dimensions: { width: 60, height: 30 }, // Level size in tiles
            backgroundColor: 'transparent',
        },
        tiles,
        objects: [],
        spawnPoints: [],
    };
}

export function exportToPNG(canvas: HTMLCanvasElement, filename: string = 'level.png') {
    try {
        // Use toDataURL for better compatibility
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Failed to export PNG:', error);
    }
}

export function downloadJSON(levelData: LevelData, filename?: string) {
    const jsonString = serialize(levelData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${levelData.levelName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();

    URL.revokeObjectURL(url);
}
