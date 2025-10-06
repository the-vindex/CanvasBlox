import type { InteractableObject, SpawnPoint, Tile } from '@/types/level';

export function canObjectBeLinked(obj: Tile | InteractableObject | SpawnPoint): boolean {
    return 'properties' in obj && 'interactable' in obj.properties && obj.properties.interactable;
}

export function canLinkObjects(
    source: InteractableObject,
    target: InteractableObject
): {
    valid: boolean;
    reason?: string;
} {
    // Cannot link object to itself
    if (source.id === target.id) {
        return { valid: false, reason: 'Cannot link object to itself' };
    }

    // Check if link already exists
    if (source.properties.linkedObjects?.includes(target.id)) {
        return { valid: false, reason: 'Link already exists' };
    }

    return { valid: true };
}

export function createLink(
    source: InteractableObject,
    target: InteractableObject
): { source: InteractableObject; target: InteractableObject } {
    const updatedSource = {
        ...source,
        properties: {
            ...source.properties,
            linkedObjects: [...(source.properties.linkedObjects || []), target.id],
        },
    };

    const updatedTarget = {
        ...target,
        properties: {
            ...target.properties,
            linkedFrom: [...(target.properties.linkedFrom || []), source.id],
        },
    };

    return { source: updatedSource, target: updatedTarget };
}
