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
import { assignButtonNumber } from '@/utils/buttonNumbering';
import { createDefaultLevel, removeOverlappingTiles } from '@/utils/levelSerializer';
import { canLinkObjects, createLink, removeLink } from '@/utils/linkingLogic';

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
    // Per-level history: each level has its own undo/redo stack
    const [levelHistories, setLevelHistories] = useState<Map<number, HistoryEntry[]>>(new Map());
    const [levelHistoryIndices, setLevelHistoryIndices] = useState<Map<number, number>>(new Map());

    const currentLevel = levels[currentLevelIndex];

    // Initialize history for current level if it doesn't exist yet
    const hasHistory = levelHistories.has(currentLevelIndex);
    useEffect(() => {
        if (currentLevel && !hasHistory) {
            const initialEntry: HistoryEntry = {
                timestamp: Date.now(),
                levelData: JSON.parse(JSON.stringify(currentLevel)),
                action: 'Initial state',
            };
            setLevelHistories((prev) => new Map(prev).set(currentLevelIndex, [initialEntry]));
            setLevelHistoryIndices((prev) => new Map(prev).set(currentLevelIndex, 0));
        }
    }, [currentLevel, currentLevelIndex, hasHistory]);

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
                // Clean up overlapping tiles in all loaded levels
                const cleanedLevels = savedLevels.map((level: LevelData) => ({
                    ...level,
                    tiles: removeOverlappingTiles(level.tiles),
                }));
                setLevels(cleanedLevels);
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

            const currentHistory = levelHistories.get(currentLevelIndex) || [];
            const currentHistoryIndex = levelHistoryIndices.get(currentLevelIndex) || 0;

            // Remove any history after current index and add new entry
            const newHistory = currentHistory.slice(0, currentHistoryIndex + 1);
            newHistory.push(entry);
            const trimmedHistory = newHistory.slice(-100); // Keep last 100 entries

            // Calculate new history index
            const newHistoryIndex =
                trimmedHistory.length < newHistory.length ? trimmedHistory.length - 1 : currentHistoryIndex + 1;

            // Update both history and history index for this level
            setLevelHistories((prev) => new Map(prev).set(currentLevelIndex, trimmedHistory));
            setLevelHistoryIndices((prev) => new Map(prev).set(currentLevelIndex, newHistoryIndex));
        },
        [currentLevel, currentLevelIndex, levelHistories, levelHistoryIndices]
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
        const currentHistory = levelHistories.get(currentLevelIndex) || [];
        const currentHistoryIndex = levelHistoryIndices.get(currentLevelIndex) || 0;

        if (currentHistoryIndex > 0 && currentHistory[currentHistoryIndex - 1]) {
            const prevState = currentHistory[currentHistoryIndex - 1];
            setLevels((prev) => {
                const newLevels = [...prev];
                newLevels[currentLevelIndex] = JSON.parse(JSON.stringify(prevState.levelData));
                return newLevels;
            });
            setLevelHistoryIndices((prev) => new Map(prev).set(currentLevelIndex, currentHistoryIndex - 1));
        }
    }, [levelHistories, levelHistoryIndices, currentLevelIndex]);

    const redo = useCallback(() => {
        const currentHistory = levelHistories.get(currentLevelIndex) || [];
        const currentHistoryIndex = levelHistoryIndices.get(currentLevelIndex) || 0;

        if (currentHistoryIndex < currentHistory.length - 1 && currentHistory[currentHistoryIndex + 1]) {
            const nextState = currentHistory[currentHistoryIndex + 1];
            setLevels((prev) => {
                const newLevels = [...prev];
                newLevels[currentLevelIndex] = JSON.parse(JSON.stringify(nextState.levelData));
                return newLevels;
            });
            setLevelHistoryIndices((prev) => new Map(prev).set(currentLevelIndex, currentHistoryIndex + 1));
        }
    }, [levelHistories, levelHistoryIndices, currentLevelIndex]);

    const createNewLevel = useCallback(
        (nameOrData?: string | LevelData) => {
            let newLevel: LevelData;

            // Check if we're importing level data or just creating empty level
            if (typeof nameOrData === 'object') {
                // Importing level data - use it directly
                newLevel = nameOrData;
            } else {
                // Creating new empty level with optional name
                const name = nameOrData;
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
                newLevel = createDefaultLevel(finalName);
            }

            setLevels((prev) => {
                const newLevels = [...prev, newLevel];
                // Switch to the new level after adding it
                setCurrentLevelIndex(newLevels.length - 1);
                return newLevels;
            });
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
                    const currentLevel = newLevels[currentLevelIndex];

                    // Remove overlapping tiles (newest tile wins)
                    // Exception: Keep door if placing button on top
                    const filteredTiles = currentLevel.tiles.filter((tile) => {
                        const samePosition = tile.position.x === position.x && tile.position.y === position.y;
                        if (!samePosition) return true;

                        // Keep door if new tile is button (puzzle mechanic exception)
                        if (tileType === 'button' && tile.type === 'door') {
                            return true;
                        }

                        // Remove overlapping tile
                        return false;
                    });

                    newLevels[currentLevelIndex] = {
                        ...currentLevel,
                        tiles: [...filteredTiles, newTile],
                    };
                    return newLevels;
                });
            } else {
                updateCurrentLevel((level) => {
                    // Remove overlapping tiles (newest tile wins)
                    // Exception: Keep door if placing button on top
                    const filteredTiles = level.tiles.filter((tile) => {
                        const samePosition = tile.position.x === position.x && tile.position.y === position.y;
                        if (!samePosition) return true;

                        // Keep door if new tile is button (puzzle mechanic exception)
                        if (tileType === 'button' && tile.type === 'door') {
                            return true;
                        }

                        // Remove overlapping tile
                        return false;
                    });

                    return {
                        ...level,
                        tiles: [...filteredTiles, newTile],
                    };
                }, `Added ${tileType} tile`);
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
                // Build the new object inside the state update to avoid stale closure
                updateCurrentLevel((level) => {
                    // For buttons, auto-assign button number using current level state
                    const properties: any = { interactable: true };
                    if (objectType === 'button') {
                        properties.buttonNumber = assignButtonNumber(level.objects);
                    }

                    const newObject: InteractableObject = {
                        id: `obj_${Date.now()}_${Math.random()}`,
                        type: objectType,
                        position,
                        dimensions: { width: 1, height: 1 }, // Dimensions in tiles
                        rotation: 0,
                        layer: 1,
                        properties,
                    };

                    return {
                        ...level,
                        objects: [...level.objects, newObject],
                    };
                }, `Added ${objectType}`);
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

    const toggleObjectSelection = useCallback(
        (objectId: string) => {
            selectObject(objectId, true);
        },
        [selectObject]
    );

    const selectAllObjects = useCallback(() => {
        const currentLevel = levels[currentLevelIndex];
        if (!currentLevel) return;

        // Collect all object IDs (tiles, interactable objects, and spawn points)
        const allObjectIds = [
            ...currentLevel.tiles.map((tile) => tile.id),
            ...currentLevel.objects.map((obj) => obj.id),
            ...currentLevel.spawnPoints.map((spawn) => spawn.id),
        ];

        setEditorState((prev) => ({
            ...prev,
            selectedObjects: allObjectIds,
        }));
    }, [levels, currentLevelIndex]);

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

        // Normalize coordinates - find min x and y to make top-left item at (0, 0)
        const minX = Math.min(...selectedItems.map((item) => item.position.x));
        const minY = Math.min(...selectedItems.map((item) => item.position.y));

        // Create normalized copies with positions relative to top-left
        const normalizedItems = selectedItems.map((item) => ({
            ...item,
            position: {
                x: item.position.x - minX,
                y: item.position.y - minY,
            },
        }));

        setEditorState((prev) => ({ ...prev, clipboard: normalizedItems }));
        toast({
            title: 'Copied',
            description: `Copied ${selectedItems.length} items to clipboard.`,
        });
    }, [currentLevel, editorState.selectedObjects, toast]);

    const pasteObjects = useCallback(() => {
        if (editorState.clipboard.length === 0) return;

        const LARGE_CLIPBOARD_THRESHOLD = 20;

        // For large clipboards (>20 objects), show confirmation dialog
        if (editorState.clipboard.length > LARGE_CLIPBOARD_THRESHOLD) {
            setEditorState((prev) => ({
                ...prev,
                showLargeClipboardDialog: true,
            }));
            return;
        }

        // For normal clipboards, initiate paste mode with ghost preview
        // Items are already normalized (top-left at 0,0) from copy operation
        setEditorState((prev) => ({
            ...prev,
            pastePreview: {
                items: editorState.clipboard,
            },
        }));
    }, [editorState.clipboard]);

    const completePaste = useCallback(
        (position: Position) => {
            if (!editorState.pastePreview) return;

            // Items are already normalized (top-left at 0,0), just add click position
            const pastedItems = editorState.pastePreview.items.map((item) => ({
                ...JSON.parse(JSON.stringify(item)),
                id: `${item.id}_copy_${Date.now()}`,
                position: {
                    x: position.x + item.position.x,
                    y: position.y + item.position.y,
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
                description: `Pasted ${pastedItems.length} items. Click to paste again or press ESC to cancel.`,
            });

            // Keep paste preview active for multiple placements
            // User can press ESC or change tools to exit paste mode
        },
        [editorState.pastePreview, updateCurrentLevel, toast]
    );

    const cancelPaste = useCallback(() => {
        setEditorState((prev) => ({
            ...prev,
            pastePreview: undefined,
            showLargeClipboardDialog: false,
        }));
    }, []);

    const confirmLargeClipboardPaste = useCallback(
        (position: Position) => {
            if (editorState.clipboard.length === 0) return;

            // Items are already normalized (top-left at 0,0), just add click position
            const pastedItems = editorState.clipboard.map((item) => ({
                ...JSON.parse(JSON.stringify(item)),
                id: `${item.id}_copy_${Date.now()}`,
                position: {
                    x: position.x + item.position.x,
                    y: position.y + item.position.y,
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

            // Close dialog
            setEditorState((prev) => ({
                ...prev,
                showLargeClipboardDialog: false,
            }));
        },
        [editorState.clipboard, updateCurrentLevel, toast]
    );

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

    const updateBatchProperty = useCallback(
        (property: string, value: string | boolean | number | object) => {
            if (editorState.selectedObjects.length === 0) return;

            updateCurrentLevel(
                (level) => {
                    const updateObject = (obj: Tile | InteractableObject | SpawnPoint) => {
                        if (!editorState.selectedObjects.includes(obj.id)) return obj;

                        // Handle nested properties
                        if (property.includes('.')) {
                            const parts = property.split('.');
                            const result = { ...obj };
                            let current: any = result;

                            // Navigate to the parent of the target property
                            for (let i = 0; i < parts.length - 1; i++) {
                                current[parts[i]] = { ...current[parts[i]] };
                                current = current[parts[i]];
                            }

                            // Set the final property value
                            current[parts[parts.length - 1]] = value;
                            return result;
                        }

                        // Simple property update
                        return { ...obj, [property]: value };
                    };

                    return {
                        ...level,
                        tiles: level.tiles.map((obj) => updateObject(obj) as Tile),
                        objects: level.objects.map((obj) => updateObject(obj) as InteractableObject),
                        spawnPoints: level.spawnPoints.map((obj) => updateObject(obj) as SpawnPoint),
                    };
                },
                `Updated ${editorState.selectedObjects.length} object${editorState.selectedObjects.length > 1 ? 's' : ''}`
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

    const linkObjects = useCallback(
        (sourceId: string, targetId: string) => {
            // Silent return if trying to link object to itself (happens on double-click)
            if (sourceId === targetId) {
                return;
            }

            const sourceObj = currentLevel.objects.find((obj) => obj.id === sourceId);
            const targetObj = currentLevel.objects.find((obj) => obj.id === targetId);

            if (!sourceObj || !targetObj) {
                toast({
                    title: 'Link Error',
                    description: 'Source or target object not found',
                    variant: 'destructive',
                });
                return;
            }

            // Validate if objects can be linked
            const validation = canLinkObjects(sourceObj, targetObj);
            if (!validation.valid) {
                toast({
                    title: 'Cannot Link',
                    description: validation.reason,
                    variant: 'destructive',
                });
                return;
            }

            // Create the link
            const { source: updatedSource, target: updatedTarget } = createLink(sourceObj, targetObj);

            // Update the level with the linked objects
            updateCurrentLevel((level) => {
                const updatedObjects = level.objects.map((obj) => {
                    if (obj.id === sourceId) return updatedSource;
                    if (obj.id === targetId) return updatedTarget;
                    return obj;
                });

                return {
                    ...level,
                    objects: updatedObjects,
                };
            }, `Linked ${sourceObj.type} to ${targetObj.type}`);

            toast({
                title: 'Link Created',
                description: `${sourceObj.type} linked to ${targetObj.type}`,
            });
        },
        [currentLevel, updateCurrentLevel, toast]
    );

    const unlinkObjects = useCallback(
        (firstId: string, secondId: string) => {
            const firstObj = currentLevel.objects.find((obj) => obj.id === firstId);
            const secondObj = currentLevel.objects.find((obj) => obj.id === secondId);

            if (!firstObj || !secondObj) {
                toast({
                    title: 'Unlink Error',
                    description: 'Source or target object not found',
                    variant: 'destructive',
                });
                return;
            }

            // Check both directions to find the link (direction shouldn't matter for unlinking)
            const firstLinksToSecond = firstObj.properties.linkedObjects?.includes(secondId);
            const secondLinksToFirst = secondObj.properties.linkedObjects?.includes(firstId);

            if (!firstLinksToSecond && !secondLinksToFirst) {
                toast({
                    title: 'No Link Found',
                    description: 'These objects are not linked',
                    variant: 'destructive',
                });
                return;
            }

            // Determine actual source/target based on which direction the link exists
            const actualSource = firstLinksToSecond ? firstObj : secondObj;
            const actualTarget = firstLinksToSecond ? secondObj : firstObj;

            // Remove the link
            const { source: updatedSource, target: updatedTarget } = removeLink(actualSource, actualTarget);

            // Update the level with the unlinked objects
            updateCurrentLevel((level) => {
                const updatedObjects = level.objects.map((obj) => {
                    if (obj.id === actualSource.id) return updatedSource;
                    if (obj.id === actualTarget.id) return updatedTarget;
                    return obj;
                });

                return {
                    ...level,
                    objects: updatedObjects,
                };
            }, `Unlinked ${actualSource.type} from ${actualTarget.type}`);

            toast({
                title: 'Link Removed',
                description: `${actualSource.type} unlinked from ${actualTarget.type}`,
            });
        },
        [currentLevel, updateCurrentLevel, toast]
    );

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (deleteTimeoutRef.current) {
                clearTimeout(deleteTimeoutRef.current);
            }
        };
    }, []);

    // Get current level's history for export
    const currentHistory = levelHistories.get(currentLevelIndex) || [];
    const currentHistoryIndex = levelHistoryIndices.get(currentLevelIndex) || 0;

    return {
        levels,
        currentLevel,
        currentLevelIndex,
        editorState,
        history: currentHistory,
        historyIndex: currentHistoryIndex,
        setCurrentLevelIndex,
        setEditorState,
        updateCurrentLevel,
        createNewLevel,
        duplicateLevel,
        deleteLevel,
        addTile,
        addObject,
        selectObject,
        toggleObjectSelection,
        selectAllObjects,
        deleteSelectedObjects,
        copySelectedObjects,
        pasteObjects,
        completePaste,
        cancelPaste,
        confirmLargeClipboardPaste,
        moveSelectedObjects,
        updateBatchProperty,
        linkObjects,
        unlinkObjects,
        undo,
        redo,
        commitBatchToHistory,
    };
}
