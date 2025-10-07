export interface Position {
    x: number;
    y: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface LevelMetadata {
    version: string;
    createdAt: string;
    author: string;
    description: string;
    dimensions: Dimensions;
    backgroundColor: string;
}

export interface TileProperties {
    collidable: boolean;
    material?: string;
    [key: string]: any;
}

export interface ObjectProperties {
    interactable: boolean;
    linkedObjects?: string[];
    linkedFrom?: string[];
    actionType?: 'toggle' | 'one-time' | 'delayed' | 'continuous';
    delay?: number;
    state?: string;
    buttonNumber?: number; // Auto-assigned number for buttons (1-99)
    [key: string]: any;
}

export interface SpawnProperties {
    spawnId: string;
    enemyType?: string;
    patrolPath?: string[];
    [key: string]: any;
}

export interface BaseLevelObject {
    id: string;
    type: string;
    position: Position;
    dimensions: Dimensions;
    rotation: 0 | 90 | 180 | 270;
    layer: number;
}

export interface Tile extends BaseLevelObject {
    properties: TileProperties;
}

export interface InteractableObject extends BaseLevelObject {
    properties: ObjectProperties;
}

export interface SpawnPoint extends BaseLevelObject {
    type: 'player' | 'enemy';
    facingDirection: 'left' | 'right' | 'up' | 'down';
    isDefault: boolean;
    properties: SpawnProperties;
}

export interface LevelData {
    levelName: string;
    metadata: LevelMetadata;
    tiles: Tile[];
    objects: InteractableObject[];
    spawnPoints: SpawnPoint[];
}

export interface EditorState {
    selectedTool: 'select' | 'move' | 'pen' | 'line' | 'rectangle' | 'link' | 'unlink' | null;
    selectedObjects: string[];
    clipboard: (Tile | InteractableObject | SpawnPoint)[];
    selectedTileType: string | null;
    zoom: number;
    pan: Position;
    showGrid: boolean;
    mousePosition: Position;
    deletingObjects: string[];
    deletionStartTimes?: Map<string, number>; // Object ID -> deletion start timestamp
    linkSourceId?: string | null; // ID of object selected as link source
    unlinkSourceId?: string | null; // ID of object selected for unlinking
    selectionBox?: {
        start: Position;
        end: Position;
    };
    moveDelta?: Position;
    linePreview?: {
        start: Position;
        end: Position;
        tileType: string;
    };
    rectanglePreview?: {
        start: Position;
        end: Position;
        tileType: string;
    };
    pastePreview?: {
        items: (Tile | InteractableObject | SpawnPoint)[]; // Items already normalized (top-left at 0,0)
    };
    showLargeClipboardDialog?: boolean;
}

export interface HistoryEntry {
    timestamp: number;
    levelData: LevelData;
    action: string;
}

export type TileType =
    | 'platform-basic'
    | 'platform-stone'
    | 'platform-grass'
    | 'platform-ice'
    | 'platform-lava'
    | 'platform-metal';

export type ObjectType = 'button' | 'door' | 'lever' | 'teleport' | 'tree' | 'rock' | 'coin' | 'checkpoint';

export type SpawnType = 'spawn-player' | 'spawn-enemy';
