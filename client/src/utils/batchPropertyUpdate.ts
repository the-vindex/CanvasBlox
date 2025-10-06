import type { InteractableObject, LevelData, SpawnPoint, Tile } from '@/types/level';

/**
 * Type guard to check if an object is a Tile
 */
function _isTile(obj: Tile | InteractableObject | SpawnPoint): obj is Tile {
    return (
        'type' in obj &&
        (obj.type.startsWith('platform-') || obj.type === 'button' || obj.type === 'door' || obj.type === 'lever')
    );
}

/**
 * Type guard to check if an object is an InteractableObject
 */
function _isInteractableObject(obj: Tile | InteractableObject | SpawnPoint): obj is InteractableObject {
    return 'properties' in obj && 'interactable' in obj.properties;
}

/**
 * Type guard to check if an object is a SpawnPoint
 */
function _isSpawnPoint(obj: Tile | InteractableObject | SpawnPoint): obj is SpawnPoint {
    return 'facingDirection' in obj;
}

/**
 * Get all selected objects from level data
 */
export function getSelectedObjects(
    levelData: LevelData,
    selectedObjectIds: string[]
): (Tile | InteractableObject | SpawnPoint)[] {
    const allObjects = [...levelData.tiles, ...levelData.objects, ...levelData.spawnPoints];
    return selectedObjectIds
        .map((id) => allObjects.find((obj) => obj.id === id))
        .filter((obj): obj is Tile | InteractableObject | SpawnPoint => obj !== undefined);
}

/**
 * Analyze object types in selection
 */
export interface SelectionAnalysis {
    count: number;
    types: { type: string; count: number }[];
    allSameType: boolean;
    commonType?: string;
}

export function analyzeSelection(objects: (Tile | InteractableObject | SpawnPoint)[]): SelectionAnalysis {
    const typeCounts = objects.reduce(
        (acc, obj) => {
            acc[obj.type] = (acc[obj.type] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const types = Object.entries(typeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

    const allSameType = types.length === 1;
    const commonType = allSameType ? types[0].type : undefined;

    return {
        count: objects.length,
        types,
        allSameType,
        commonType,
    };
}

/**
 * Get common property value or "Mixed" if values differ
 */
export function getCommonPropertyValue<T>(
    objects: (Tile | InteractableObject | SpawnPoint)[],
    propertyPath: string
): T | 'Mixed' {
    if (objects.length === 0) return 'Mixed';

    const getValue = (obj: any, path: string): any => {
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
            value = value?.[key];
        }
        return value;
    };

    const firstValue = getValue(objects[0], propertyPath);
    const allSame = objects.every((obj) => {
        const value = getValue(obj, propertyPath);
        // Deep equality check for objects
        if (typeof value === 'object' && value !== null && typeof firstValue === 'object' && firstValue !== null) {
            return JSON.stringify(value) === JSON.stringify(firstValue);
        }
        return value === firstValue;
    });

    return allSame ? firstValue : 'Mixed';
}

/**
 * Update property on multiple objects
 */
export function updateBatchProperty(
    levelData: LevelData,
    selectedObjectIds: string[],
    property: string,
    value: string | boolean | number | object
): LevelData {
    const updateObject = (obj: Tile | InteractableObject | SpawnPoint) => {
        if (!selectedObjectIds.includes(obj.id)) return obj;

        if (property.startsWith('properties.')) {
            const propKey = property.replace('properties.', '');
            if ('properties' in obj) {
                return { ...obj, properties: { ...obj.properties, [propKey]: value } };
            }
            return obj;
        }

        return { ...obj, [property]: value };
    };

    return {
        ...levelData,
        tiles: levelData.tiles.map((obj) => updateObject(obj) as Tile),
        objects: levelData.objects.map((obj) => updateObject(obj) as InteractableObject),
        spawnPoints: levelData.spawnPoints.map((obj) => updateObject(obj) as SpawnPoint),
    };
}

/**
 * Format type name for display
 */
export function formatTypeName(type: string): string {
    // Convert "platform-basic" to "Platform - Basic"
    return type
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' - ');
}
