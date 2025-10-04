import { useState, useCallback, useEffect } from 'react';
import { LevelData, EditorState, HistoryEntry, Position, Tile, InteractableObject, SpawnPoint } from '@/types/level';
import { LevelSerializer } from '@/utils/levelSerializer';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'levelEditor_levels';
const AUTOSAVE_KEY = 'levelEditor_autosave';
const AUTOSAVE_INTERVAL = 5000; // 5 seconds

export function useLevelEditor() {
  const { toast } = useToast();

  const [levels, setLevels] = useState<LevelData[]>([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [editorState, setEditorState] = useState<EditorState>({
    selectedTool: 'select',
    selectedObjects: [],
    clipboard: [],
    selectedTileType: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    showGrid: true,
    mousePosition: { x: 0, y: 0 },
    deletingObjects: []
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const currentLevel = levels[currentLevelIndex];

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
        setLevels([LevelSerializer.createDefaultLevel()]);
      }
    } else {
      setLevels([LevelSerializer.createDefaultLevel()]);
    }
  }, []);

  const addToHistory = useCallback((action: string) => {
    if (!currentLevel) return;

    const entry: HistoryEntry = {
      timestamp: Date.now(),
      levelData: JSON.parse(JSON.stringify(currentLevel)),
      action
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(entry);
      return newHistory.slice(-100); // Keep last 100 entries
    });
    setHistoryIndex(prev => prev + 1);
  }, [currentLevel, historyIndex]);

  const updateCurrentLevel = useCallback((updater: (level: LevelData) => LevelData, action: string = 'Level updated') => {
    setLevels(prev => {
      const newLevels = [...prev];
      newLevels[currentLevelIndex] = updater(newLevels[currentLevelIndex]);
      return newLevels;
    });
    addToHistory(action);
  }, [currentLevelIndex, addToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0 && history[historyIndex - 1]) {
      const prevState = history[historyIndex - 1];
      setLevels(prev => {
        const newLevels = [...prev];
        newLevels[currentLevelIndex] = JSON.parse(JSON.stringify(prevState.levelData));
        return newLevels;
      });
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex, currentLevelIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1 && history[historyIndex + 1]) {
      const nextState = history[historyIndex + 1];
      setLevels(prev => {
        const newLevels = [...prev];
        newLevels[currentLevelIndex] = JSON.parse(JSON.stringify(nextState.levelData));
        return newLevels;
      });
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex, currentLevelIndex]);

  const createNewLevel = useCallback((name?: string) => {
    const newLevel = LevelSerializer.createDefaultLevel(name);
    setLevels(prev => [...prev, newLevel]);
    setCurrentLevelIndex(levels.length);
  }, [levels.length]);

  const duplicateLevel = useCallback((index?: number) => {
    const sourceIndex = index ?? currentLevelIndex;
    const sourceLevel = levels[sourceIndex];
    if (!sourceLevel) return;

    const duplicatedLevel = JSON.parse(JSON.stringify(sourceLevel));
    duplicatedLevel.levelName = `${sourceLevel.levelName} Copy`;
    duplicatedLevel.metadata.createdAt = new Date().toISOString();
    
    setLevels(prev => [...prev, duplicatedLevel]);
    setCurrentLevelIndex(levels.length);
  }, [levels, currentLevelIndex]);

  const deleteLevel = useCallback((index: number) => {
    if (levels.length <= 1) return;

    setLevels(prev => prev.filter((_, i) => i !== index));
    if (currentLevelIndex >= index) {
      setCurrentLevelIndex(Math.max(0, currentLevelIndex - 1));
    }
  }, [levels.length, currentLevelIndex]);

  const addTile = useCallback((position: Position, tileType: string) => {
    const newTile: Tile = {
      id: `tile_${Date.now()}_${Math.random()}`,
      type: tileType,
      position,
      dimensions: { width: 1, height: 1 }, // Dimensions in tiles
      rotation: 0,
      layer: 0,
      properties: { collidable: true }
    };

    updateCurrentLevel(level => ({
      ...level,
      tiles: [...level.tiles, newTile]
    }), `Added ${tileType} tile`);
  }, [updateCurrentLevel]);

  const addObject = useCallback((position: Position, objectType: string) => {
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
        properties: { spawnId: `spawn_${Date.now()}` }
      } as SpawnPoint;

      updateCurrentLevel(level => {
        // For player spawn points, ensure only one exists by removing any existing player spawn
        let updatedSpawnPoints = level.spawnPoints;
        if (objectType === 'spawn-player') {
          updatedSpawnPoints = level.spawnPoints.filter(spawn => spawn.type !== 'player');
        }

        return {
          ...level,
          spawnPoints: [...updatedSpawnPoints, newObject as SpawnPoint]
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
        properties: { interactable: true }
      } as InteractableObject;

      updateCurrentLevel(level => ({
        ...level,
        objects: [...level.objects, newObject as InteractableObject]
      }), `Added ${objectType}`);
    }
  }, [updateCurrentLevel]);

  const selectObject = useCallback((objectId: string, multiSelect = false) => {
    setEditorState(prev => ({
      ...prev,
      selectedObjects: multiSelect 
        ? prev.selectedObjects.includes(objectId)
          ? prev.selectedObjects.filter(id => id !== objectId)
          : [...prev.selectedObjects, objectId]
        : [objectId]
    }));
  }, []);

  const deleteSelectedObjects = useCallback(() => {
    if (editorState.selectedObjects.length === 0) return;

    // Mark objects as deleting for animation
    setEditorState(prev => ({
      ...prev,
      deletingObjects: [...editorState.selectedObjects]
    }));

    // After animation completes (250ms), actually delete the objects
    setTimeout(() => {
      updateCurrentLevel(level => ({
        ...level,
        tiles: level.tiles.filter(tile => !editorState.selectedObjects.includes(tile.id)),
        objects: level.objects.filter(obj => !editorState.selectedObjects.includes(obj.id)),
        spawnPoints: level.spawnPoints.filter(spawn => !editorState.selectedObjects.includes(spawn.id))
      }), `Deleted ${editorState.selectedObjects.length} objects`);

      setEditorState(prev => ({
        ...prev,
        selectedObjects: [],
        deletingObjects: []
      }));
    }, 250);
  }, [editorState.selectedObjects, updateCurrentLevel]);

  const copySelectedObjects = useCallback(() => {
    if (!currentLevel || editorState.selectedObjects.length === 0) return;

    const selectedItems = [
      ...currentLevel.tiles.filter(tile => editorState.selectedObjects.includes(tile.id)),
      ...currentLevel.objects.filter(obj => editorState.selectedObjects.includes(obj.id)),
      ...currentLevel.spawnPoints.filter(spawn => editorState.selectedObjects.includes(spawn.id))
    ];

    setEditorState(prev => ({ ...prev, clipboard: selectedItems }));
    toast({
      title: "Copied",
      description: `Copied ${selectedItems.length} items to clipboard.`
    });
  }, [currentLevel, editorState.selectedObjects, toast]);

  const pasteObjects = useCallback(() => {
    if (editorState.clipboard.length === 0) return;

    const pastedItems = editorState.clipboard.map(item => ({
      ...JSON.parse(JSON.stringify(item)),
      id: `${item.id}_copy_${Date.now()}`,
      position: {
        x: item.position.x + 50,
        y: item.position.y + 50
      }
    }));

    updateCurrentLevel(level => {
      const newLevel = { ...level };

      // Check if we're pasting a player spawn point
      const hasPlayerSpawn = pastedItems.some(item =>
        'facingDirection' in item && (item as SpawnPoint).type === 'player'
      );

      // If pasting a player spawn, remove existing player spawn
      if (hasPlayerSpawn) {
        newLevel.spawnPoints = newLevel.spawnPoints.filter(spawn => spawn.type !== 'player');
      }

      pastedItems.forEach(item => {
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
      title: "Pasted",
      description: `Pasted ${pastedItems.length} items.`
    });
  }, [editorState.clipboard, updateCurrentLevel, toast]);

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
    undo,
    redo
  };
}
