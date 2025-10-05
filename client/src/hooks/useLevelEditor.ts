import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type {
    EditorState,
    HistoryEntry,
    InteractableObject,
    LevelData,
    Position,
    SpawnPoint,
    Tile,
} from '@/types/level';
import { createDefaultLevel } from '@/utils/levelSerializer';

const STORAGE_KEY = 'levelEditor_levels';
const AUTOSAVE_KEY = 'levelEditor_autosave';
const AUTOSAVE_INTERVAL = 5000; // 5 seconds

export function useLevelEditor() {
    const { toast } = useToast();
    const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [levels, setLevels] = useState<LevelData[]>([]);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [editorState, setEditorState] = useState<EditorState>({
        selectedTool: null,
        selectedObjects: [],
        clipboard: [],
        selectedTileType: null,
        zoom: 1,
        pan: { x: 0, y: 0 },
        showGrid: true,
        showScanlines: false,
        mousePosition: { x: 0, y: 0 },
        deletingObjects: [],
    });
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const currentLevel = levels[currentLevelIndex];

    // Initialize history with current level state when level first loads (only once)
    useEffect(() => {
        if (currentLevel && history.length === 0) {
            const initialEntry: HistoryEntry = {
                timestamp: Date.now(),
                levelData: JSON.parse(JSON.stringify(currentLevel)),
                action: 'Initial state',
            };
            setHistory([initialEntry]);
            setHistoryIndex(0);
        }
    }, [currentLevel, history.length]);

    // Auto-save functionality
    useEffect(() => {
        const interval = setInterval(() => {
            if (levels.length > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
                localStorage.setItem(AUTOSAVE_KEY, new Date().toISOString());
            }
        }, AUTOSAVE_INTERVAL);

        return () => clearInterval(interval);
    }, [levels]);

    // Load saved levels on init
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const savedLevels = JSON.parse(saved);
                setLevels(savedLevels);
            } catch (error) {
                console.error('Failed to load saved levels:', error);
                // Create default level
                setLevels([createDefaultLevel()]);
            }
        } else {
            setLevels([createDefaultLevel()]);
        }
    }, []);

    const addToHistory = useCallback(
        (action: string, levelData?: LevelData) => {
            const dataToSave = levelData || currentLevel;
            if (!dataToSave) return;

            const entry: HistoryEntry = {
                timestamp: Date.now(),
                levelData: JSON.parse(JSON.stringify(dataToSave)),
                action,
            };

            setHistory((prev) => {
                // If history is empty (shouldn't happen now), create initial entry
                if (prev.length === 0) {
                    setHistoryIndex(0);
                    return [entry];
                }

                // Remove any history after current index and add new entry
                const newHistory = prev.slice(0, historyIndex + 1);
                newHistory.push(entry);
                const trimmedHistory = newHistory.slice(-100); // Keep last 100 entries

                // Adjust history index if history was trimmed
                if (trimmedHistory.length < newHistory.length) {
                    setHistoryIndex(trimmedHistory.length - 1);
                    return trimmedHistory;
                }

                setHistoryIndex((prev) => prev + 1);
                return trimmedHistory;
            });
        },
        [currentLevel, historyIndex]
    );

    const updateCurrentLevel = useCallback(
        (updater: (level: LevelData) => LevelData, action: string = 'Level updated') => {
            let updatedLevel!: LevelData;

            // Update the levels state and capture the updated level
            setLevels((prev) => {
                const newLevels = [...prev];
                updatedLevel = updater(newLevels[currentLevelIndex]);
                newLevels[currentLevelIndex] = updatedLevel;
                return newLevels;
            });

            // Add to history with the updated level data (updatedLevel is captured synchronously in the setter above)
            addToHistory(action, updatedLevel);
        },
        [currentLevelIndex, addToHistory]
    );

    const undo = useCallback(() => {
        if (historyIndex > 0 && history[historyIndex - 1]) {
            const prevState = history[historyIndex - 1];
            setLevels((prev) => {
                const newLevels = [...prev];
                newLevels[currentLevelIndex] = JSON.parse(JSON.stringify(prevState.levelData));
                return newLevels;
            });
            setHistoryIndex((prev) => prev - 1);
        }
    }, [history, historyIndex, currentLevelIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1 && history[historyIndex + 1]) {
            const nextState = history[historyIndex + 1];
            setLevels((prev) => {
                const newLevels = [...prev];
                newLevels[currentLevelIndex] = JSON.parse(JSON.stringify(nextState.levelData));
                return newLevels;
            });
            setHistoryIndex((prev) => prev + 1);
        }
    }, [history, historyIndex, currentLevelIndex]);

    const createNewLevel = useCallback(
        (name?: string) => {
            // Auto-increment level names to avoid duplicates
            let finalName = name;
            if (!name) {
                const existingNames = levels.map((l) => l.levelName);
                let counter = 0;
                let newName = 'New Level';
                while (existingNames.includes(newName)) {
                    counter++;
                    newName = `New Level ${counter}`;
                }
                finalName = newName;
            }

            const newLevel = createDefaultLevel(finalName);
            setLevels((prev) => [...prev, newLevel]);
            setCurrentLevelIndex(levels.length);
        },
        [levels]
    );

    const duplicateLevel = useCallback(
        (index?: number) => {
            const sourceIndex = index ?? currentLevelIndex;
            const sourceLevel = levels[sourceIndex];
            if (!sourceLevel) return;

            const duplicatedLevel = JSON.parse(JSON.stringify(sourceLevel));
            duplicatedLevel.levelName = `${sourceLevel.levelName} Copy`;
            duplicatedLevel.metadata.createdAt = new Date().toISOString();

            setLevels((prev) => [...prev, duplicatedLevel]);
            setCurrentLevelIndex(levels.length);
        },
        [levels, currentLevelIndex]
    );

    const deleteLevel = useCallback(
        (index: number) => {
            if (levels.length <= 1) return;

            setLevels((prev) => prev.filter((_, i) => i !== index));
            if (currentLevelIndex >= index) {
                setCurrentLevelIndex(Math.max(0, currentLevelIndex - 1));
            }
        },
        [levels.length, currentLevelIndex]
    );

    const addTile = useCallback(
        (position: Position, tileType: string, skipHistory = false) => {
            const newTile: Tile = {
                id: `tile_${Date.now()}_${Math.random()}`,
                type: tileType,
                position,
                dimensions: { width: 1, height: 1 }, // Dimensions in tiles
                rotation: 0,
                layer: 0,
                properties: { collidable: true },
            };

            if (skipHistory) {
                // Update level without adding to history (for batched operations)
                setLevels((prev) => {
                    const newLevels = [...prev];
                    newLevels[currentLevelIndex] = {
                        ...newLevels[currentLevelIndex],
                        tiles: [...newLevels[currentLevelIndex].tiles, newTile],
                    };
                    return newLevels;
                });
            } else {
                updateCurrentLevel(
                    (level) => ({
                        ...level,
                        tiles: [...level.tiles, newTile],
                    }),
                    `Added ${tileType} tile`
                );
            }
        },
        [updateCurrentLevel, currentLevelIndex]
    );

    const addObject = useCallback(
        (position: Position, objectType: string) => {
            let newObject: InteractableObject | SpawnPoint;

            if (objectType.startsWith('spawn-')) {
                newObject = {
                    id: `spawn_${Date.now()}_${Math.random()}`,
                    type: objectType === 'spawn-player' ? 'player' : 'enemy',
                    position,
                    dimensions: { width: 1, height: 1 }, // Dimensions in tiles
                    rotation: 0,
                    layer: 1,
                    facingDirection: 'right',
                    isDefault: objectType === 'spawn-player',
                    properties: { spawnId: `spawn_${Date.now()}` },
                } as SpawnPoint;

                updateCurrentLevel((level) => {
                    // For player spawn points, ensure only one exists by removing any existing player spawn
                    let updatedSpawnPoints = level.spawnPoints;
                    if (objectType === 'spawn-player') {
                        updatedSpawnPoints = level.spawnPoints.filter((spawn) => spawn.type !== 'player');
                    }

                    return {
                        ...level,
                        spawnPoints: [...updatedSpawnPoints, newObject as SpawnPoint],
                    };
                }, `Added ${objectType}`);
            } else {
                newObject = {
                    id: `obj_${Date.now()}_${Math.random()}`,
                    type: objectType,
                    position,
                    dimensions: { width: 1, height: 1 }, // Dimensions in tiles
                    rotation: 0,
                    layer: 1,
                    properties: { interactable: true },
                } as InteractableObject;

                updateCurrentLevel(
                    (level) => ({
                        ...level,
                        objects: [...level.objects, newObject as InteractableObject],
                    }),
                    `Added ${objectType}`
                );
            }
        },
        [updateCurrentLevel]
    );

    const selectObject = useCallback((objectId: string, multiSelect = false) => {
        setEditorState((prev) => ({
            ...prev,
            selectedObjects: multiSelect
                ? prev.selectedObjects.includes(objectId)
                    ? prev.selectedObjects.filter((id) => id !== objectId)
                    : [...prev.selectedObjects, objectId]
                : [objectId],
        }));
    }, []);

    const deleteSelectedObjects = useCallback(() => {
        if (editorState.selectedObjects.length === 0) return;

        const objectsToDelete = [...editorState.selectedObjects];
        const deletionTime = Date.now();

        // Clear any existing timeout
        if (deleteTimeoutRef.current) {
            clearTimeout(deleteTimeoutRef.current);
        }

        // Mark objects as deleting for animation and track start times
        const deletionStartTimes = new Map<string, number>();
        objectsToDelete.forEach((id) => {
            deletionStartTimes.set(id, deletionTime);
        });

        setEditorState((prev) => ({
            ...prev,
            deletingObjects: objectsToDelete,
            deletionStartTimes,
        }));

        // After animation completes (250ms), actually delete the objects
        deleteTimeoutRef.current = setTimeout(() => {
            updateCurrentLevel(
                (level) => ({
                    ...level,
                    tiles: level.tiles.filter((tile) => !objectsToDelete.includes(tile.id)),
                    objects: level.objects.filter((obj) => !objectsToDelete.includes(obj.id)),
                    spawnPoints: level.spawnPoints.filter((spawn) => !objectsToDelete.includes(spawn.id)),
                }),
                `Deleted ${objectsToDelete.length} objects`
            );

            setEditorState((prev) => ({
                ...prev,
                selectedObjects: [],
                deletingObjects: [],
                deletionStartTimes: undefined,
            }));
            deleteTimeoutRef.current = null;
        }, 250);
    }, [editorState.selectedObjects, updateCurrentLevel]);

    const copySelectedObjects = useCallback(() => {
        if (!currentLevel || editorState.selectedObjects.length === 0) return;

        const selectedItems = [
            ...currentLevel.tiles.filter((tile) => editorState.selectedObjects.includes(tile.id)),
            ...currentLevel.objects.filter((obj) => editorState.selectedObjects.includes(obj.id)),
            ...currentLevel.spawnPoints.filter((spawn) => editorState.selectedObjects.includes(spawn.id)),
        ];

        setEditorState((prev) => ({ ...prev, clipboard: selectedItems }));
        toast({
            title: 'Copied',
            description: `Copied ${selectedItems.length} items to clipboard.`,
        });
    }, [currentLevel, editorState.selectedObjects, toast]);

    const pasteObjects = useCallback(() => {
        if (editorState.clipboard.length === 0) return;

        const pastedItems = editorState.clipboard.map((item) => ({
            ...JSON.parse(JSON.stringify(item)),
            id: `${item.id}_copy_${Date.now()}`,
            position: {
                x: item.position.x + 50,
                y: item.position.y + 50,
            },
        }));

        updateCurrentLevel((level) => {
            const newLevel = { ...level };

            // Check if we're pasting a player spawn point
            const hasPlayerSpawn = pastedItems.some(
                (item) => 'facingDirection' in item && (item as SpawnPoint).type === 'player'
            );

            // If pasting a player spawn, remove existing player spawn
            if (hasPlayerSpawn) {
                newLevel.spawnPoints = newLevel.spawnPoints.filter((spawn) => spawn.type !== 'player');
            }

            pastedItems.forEach((item) => {
                if ('properties' in item && 'collidable' in item.properties) {
                    // It's a tile
                    newLevel.tiles.push(item as Tile);
                } else if ('facingDirection' in item) {
                    // It's a spawn point
                    newLevel.spawnPoints.push(item as SpawnPoint);
                } else {
                    // It's an object
                    newLevel.objects.push(item as InteractableObject);
                }
            });

            return newLevel;
        }, `Pasted ${pastedItems.length} objects`);

        toast({
            title: 'Pasted',
            description: `Pasted ${pastedItems.length} items.`,
        });
    }, [editorState.clipboard, updateCurrentLevel, toast]);

    const moveSelectedObjects = useCallback(
        (delta: Position) => {
            if (editorState.selectedObjects.length === 0) return;

            updateCurrentLevel(
                (level) => {
                    // Update tiles
                    const updatedTiles = level.tiles.map((tile) =>
                        editorState.selectedObjects.includes(tile.id)
                            ? { ...tile, position: { x: tile.position.x + delta.x, y: tile.position.y + delta.y } }
                            : tile
                    );

                    // Update objects
                    const updatedObjects = level.objects.map((obj) =>
                        editorState.selectedObjects.includes(obj.id)
                            ? { ...obj, position: { x: obj.position.x + delta.x, y: obj.position.y + delta.y } }
                            : obj
                    );

                    // Update spawn points
                    const updatedSpawnPoints = level.spawnPoints.map((spawn) =>
                        editorState.selectedObjects.includes(spawn.id)
                            ? { ...spawn, position: { x: spawn.position.x + delta.x, y: spawn.position.y + delta.y } }
                            : spawn
                    );

                    return {
                        ...level,
                        tiles: updatedTiles,
                        objects: updatedObjects,
                        spawnPoints: updatedSpawnPoints,
                    };
                },
                `Moved ${editorState.selectedObjects.length} object${editorState.selectedObjects.length > 1 ? 's' : ''}`
            );
        },
        [editorState.selectedObjects, updateCurrentLevel]
    );

    const commitBatchToHistory = useCallback(
        (action: string) => {
            // Create a history entry for the current state (after batched changes)
            addToHistory(action);
        },
        [addToHistory]
    );

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (deleteTimeoutRef.current) {
                clearTimeout(deleteTimeoutRef.current);
            }
        };
    }, []);

    return {
        levels,
        currentLevel,
        currentLevelIndex,
        editorState,
        history,
        historyIndex,
        setCurrentLevelIndex,
        setEditorState,
        updateCurrentLevel,
        createNewLevel,
        duplicateLevel,
        deleteLevel,
        addTile,
        addObject,
        selectObject,
        deleteSelectedObjects,
        copySelectedObjects,
        pasteObjects,
        moveSelectedObjects,
        undo,
        redo,
        commitBatchToHistory,
    };
}
