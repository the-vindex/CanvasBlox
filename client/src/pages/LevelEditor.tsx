import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@/components/level-editor/Canvas';
import { ExportModal } from '@/components/level-editor/ExportModal';
import { ImportModal } from '@/components/level-editor/ImportModal';
import { LevelTabs } from '@/components/level-editor/LevelTabs';
import { PropertiesPanel } from '@/components/level-editor/PropertiesPanel';
import { TilePalette } from '@/components/level-editor/TilePalette';
import { Toolbar } from '@/components/level-editor/Toolbar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useLevelEditor } from '@/hooks/useLevelEditor';
import { useSelectionState } from '@/hooks/useSelectionState';
import type { EditorState, InteractableObject, LevelData, Position, Tile } from '@/types/level';
import { exportToPNG, removeOverlappingTiles } from '@/utils/levelSerializer';

export default function LevelEditor() {
    const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
    const [showUndoRedoFlash, setShowUndoRedoFlash] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const lastLinkToastRef = useRef<number>(0);

    const { toast } = useToast();
    const selectionState = useSelectionState();

    // Integrate useLevelEditor hook
    const {
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
        deleteLevel,
        addTile,
        addObject,
        selectObject: _selectObject,
        toggleObjectSelection: _toggleObjectSelection,
        selectAllObjects: _selectAllObjects,
        deleteSelectedObjects: _deleteSelectedObjects,
        copySelectedObjects: _copySelectedObjects,
        pasteObjects: _pasteObjects,
        completePaste,
        cancelPaste,
        confirmLargeClipboardPaste,
        moveSelectedObjects: _moveSelectedObjects,
        linkObjects,
        unlinkObjects,
        undo: _undo,
        redo: _redo,
        commitBatchToHistory,
    } = useLevelEditor();

    // Handler callbacks for useCanvas
    const handleMouseMove = useCallback(
        (position: Position) => {
            setEditorState((prev) => ({ ...prev, mousePosition: position }));
        },
        [setEditorState]
    );

    // Helper: Find any item (tile, object, or spawn point) at position
    const findItemAtPosition = useCallback(
        (position: Position) => {
            if (!currentLevel) return null;

            return (
                currentLevel.tiles.find((tile) => tile.position.x === position.x && tile.position.y === position.y) ||
                currentLevel.objects.find((obj) => obj.position.x === position.x && obj.position.y === position.y) ||
                currentLevel.spawnPoints.find(
                    (spawn) => spawn.position.x === position.x && spawn.position.y === position.y
                )
            );
        },
        [currentLevel]
    );

    // Helper: Find interactable object at position
    const findObjectAtPosition = useCallback(
        (position: Position) => {
            if (!currentLevel) return null;
            return currentLevel.objects.find((obj) => obj.position.x === position.x && obj.position.y === position.y);
        },
        [currentLevel]
    );

    // Helper: Handle select tool click
    const handleSelectToolClick = useCallback(
        (position: Position, ctrlKey: boolean) => {
            const clickedItem = findItemAtPosition(position);

            if (clickedItem) {
                if (ctrlKey) {
                    _toggleObjectSelection(clickedItem.id);
                } else {
                    _selectObject(clickedItem.id);
                }
            } else {
                // Only clear selection on empty click if Ctrl is not held
                if (!ctrlKey) {
                    setEditorState((prev) => ({ ...prev, ...selectionState.clearObjects() }));
                }
            }
        },
        [findItemAtPosition, _selectObject, _toggleObjectSelection, setEditorState, selectionState]
    );

    // Helper: Handle link tool click
    const handleLinkToolClick = useCallback(
        (position: Position) => {
            const clickedObj = findObjectAtPosition(position);
            if (!clickedObj) return;

            if (!editorState.linkSourceId) {
                // First click - set as link source
                setEditorState((prev) => ({
                    ...prev,
                    linkSourceId: clickedObj.id,
                    selectedObjects: [clickedObj.id],
                }));

                const now = Date.now();
                if (now - lastLinkToastRef.current > 100) {
                    lastLinkToastRef.current = now;
                    toast({
                        title: 'Link Source Selected',
                        description: `Click another object to link it with this ${clickedObj.type}`,
                    });
                }
            } else if (editorState.linkSourceId === clickedObj.id) {
                // Clicked same object - deselect
                setEditorState((prev) => ({
                    ...prev,
                    linkSourceId: null,
                    selectedObjects: [],
                }));
            } else {
                // Second click - create link
                linkObjects(editorState.linkSourceId, clickedObj.id);
                setEditorState((prev) => ({
                    ...prev,
                    linkSourceId: null,
                    selectedObjects: [],
                }));
            }
        },
        [findObjectAtPosition, editorState.linkSourceId, setEditorState, linkObjects, toast]
    );

    // Helper: Handle unlink tool click
    const handleUnlinkToolClick = useCallback(
        (position: Position) => {
            const clickedObj = findObjectAtPosition(position);
            if (!clickedObj) return;

            if (!editorState.unlinkSourceId) {
                // First click - set as unlink source
                setEditorState((prev) => ({
                    ...prev,
                    unlinkSourceId: clickedObj.id,
                    selectedObjects: [clickedObj.id],
                }));

                toast({
                    title: 'Unlink Source Selected',
                    description: `Click a linked object to remove the link`,
                });
            } else if (editorState.unlinkSourceId === clickedObj.id) {
                // Clicked same object - deselect
                setEditorState((prev) => ({
                    ...prev,
                    unlinkSourceId: null,
                    selectedObjects: [],
                }));
            } else {
                // Second click - remove link
                unlinkObjects(editorState.unlinkSourceId, clickedObj.id);
                setEditorState((prev) => ({
                    ...prev,
                    unlinkSourceId: null,
                    selectedObjects: [],
                }));
            }
        },
        [findObjectAtPosition, editorState.unlinkSourceId, setEditorState, unlinkObjects, toast]
    );

    const handleCanvasClick = useCallback(
        (position: Position, event: MouseEvent) => {
            if (!currentLevel) return;

            // Handle paste preview click-to-place
            if (editorState.pastePreview) {
                completePaste(position);
                return;
            }

            // Ctrl+Click for additive selection works from any tool (except drawing tools)
            const isDrawingTool = ['pen', 'line', 'rectangle'].includes(editorState.selectedTool || '');
            if ((event.ctrlKey || event.metaKey) && !isDrawingTool) {
                handleSelectToolClick(position, true);
                return;
            }

            if (editorState.selectedTool === 'select') {
                handleSelectToolClick(position, false);
            } else if (editorState.selectedTool === 'link') {
                handleLinkToolClick(position);
            } else if (editorState.selectedTool === 'unlink') {
                handleUnlinkToolClick(position);
            }
        },
        [
            currentLevel,
            editorState.selectedTool,
            editorState.pastePreview,
            completePaste,
            handleSelectToolClick,
            handleLinkToolClick,
            handleUnlinkToolClick,
        ]
    );

    const drawingSessionTileCount = useRef(0);

    const handleTilePlaced = useCallback(
        (position: Position, tileType: string, isDrawing = false) => {
            if (tileType.startsWith('spawn-')) {
                addObject(position, tileType);
            } else if (tileType.includes('platform')) {
                if (isDrawing) {
                    addTile(position, tileType, true); // Skip history
                    drawingSessionTileCount.current++;
                } else {
                    addTile(position, tileType, false);
                }
            } else {
                addObject(position, tileType);
            }
        },
        [addTile, addObject]
    );

    const handleDrawingSessionEnd = useCallback(() => {
        if (drawingSessionTileCount.current > 0) {
            const count = drawingSessionTileCount.current;
            commitBatchToHistory(`Placed ${count} tile${count > 1 ? 's' : ''}`);
            drawingSessionTileCount.current = 0;
        }
    }, [commitBatchToHistory]);

    /**
     * Generic handler for drawing tool completion (line, rectangle, etc.)
     * Places tiles/objects at calculated positions and commits as single history entry
     */
    const handleDrawingToolComplete = useCallback(
        (positions: Position[], tileType: string, toolName: string) => {
            // Build all new tiles/objects first
            const newTiles: Tile[] = [];
            const newObjects: InteractableObject[] = [];

            for (const position of positions) {
                if (tileType.includes('platform')) {
                    newTiles.push({
                        id: `tile_${Date.now()}_${Math.random()}`,
                        type: tileType,
                        position,
                        dimensions: { width: 1, height: 1 },
                        rotation: 0,
                        layer: 0,
                        properties: { collidable: true },
                    });
                } else {
                    // Handle objects (buttons, doors, etc.)
                    newObjects.push({
                        id: `obj_${Date.now()}_${Math.random()}`,
                        type: tileType,
                        position,
                        dimensions: { width: 1, height: 1 },
                        rotation: 0,
                        layer: 1,
                        properties: {},
                    });
                }
            }

            // Update level with all tiles/objects in a single operation
            // This ensures history is added with the correct state
            updateCurrentLevel(
                (level) => {
                    // Combine existing tiles with new tiles, then remove overlaps
                    const allTiles = [...level.tiles, ...newTiles];
                    const cleanedTiles = removeOverlappingTiles(allTiles);

                    return {
                        ...level,
                        tiles: cleanedTiles,
                        objects: [...level.objects, ...newObjects],
                    };
                },
                `Drew ${toolName} with ${positions.length} tile${positions.length > 1 ? 's' : ''}`
            );
        },
        [updateCurrentLevel]
    );

    const handleLineComplete = useCallback(
        (positions: Position[], tileType: string) => {
            handleDrawingToolComplete(positions, tileType, 'line');
        },
        [handleDrawingToolComplete]
    );

    const handleRectangleComplete = useCallback(
        (positions: Position[], tileType: string) => {
            handleDrawingToolComplete(positions, tileType, 'filled rectangle');
        },
        [handleDrawingToolComplete]
    );

    const handleWheelZoom = useCallback(
        (delta: number, _mouseX: number, _mouseY: number) => {
            setEditorState((prev) => {
                const newZoom = Math.min(Math.max(prev.zoom + delta, 0.1), 5);

                // Note: In scrollbar-based mode, we don't adjust pan here
                // The scrollbars provide the panning functionality
                // Pan adjustment would conflict with scrollbar position

                return {
                    ...prev,
                    zoom: newZoom,
                    // Keep pan at {x:0, y:0} to work with scrollbars
                    pan: { x: 0, y: 0 },
                };
            });
        },
        [setEditorState]
    );

    const handleMultiSelectComplete = useCallback(
        (start: Position, end: Position) => {
            if (!currentLevel) return;

            // Calculate the bounding box
            const minX = Math.min(start.x, end.x);
            const maxX = Math.max(start.x, end.x);
            const minY = Math.min(start.y, end.y);
            const maxY = Math.max(start.y, end.y);

            // Find all objects within the selection box
            const selectedIds: string[] = [];

            // Select tiles
            currentLevel.tiles.forEach((tile) => {
                if (
                    tile.position.x >= minX &&
                    tile.position.x <= maxX &&
                    tile.position.y >= minY &&
                    tile.position.y <= maxY
                ) {
                    selectedIds.push(tile.id);
                }
            });

            // Select objects
            currentLevel.objects.forEach((obj) => {
                if (
                    obj.position.x >= minX &&
                    obj.position.x <= maxX &&
                    obj.position.y >= minY &&
                    obj.position.y <= maxY
                ) {
                    selectedIds.push(obj.id);
                }
            });

            // Select spawn points
            currentLevel.spawnPoints.forEach((spawn) => {
                if (
                    spawn.position.x >= minX &&
                    spawn.position.x <= maxX &&
                    spawn.position.y >= minY &&
                    spawn.position.y <= maxY
                ) {
                    selectedIds.push(spawn.id);
                }
            });

            // Update selection
            setEditorState((prev) => ({ ...prev, selectedObjects: selectedIds }));
        },
        [currentLevel, setEditorState]
    );

    const handleMoveObjectsComplete = useCallback(
        (delta: Position) => {
            _moveSelectedObjects(delta);
        },
        [_moveSelectedObjects]
    );

    const handleTileSelect = useCallback(
        (tileType: string) => {
            setEditorState((prev) => ({
                ...prev,
                ...selectionState.selectTile(tileType, prev.selectedTool),
            }));
        },
        [setEditorState, selectionState]
    );

    // Toolbar handlers
    const handleToolChange = useCallback(
        (tool: EditorState['selectedTool']) => {
            setEditorState((prev) => ({
                ...prev,
                ...selectionState.selectTool(tool),
            }));
        },
        [setEditorState, selectionState]
    );

    const handleStateChange = useCallback(
        (updates: Partial<EditorState>) => {
            setEditorState((prev) => ({ ...prev, ...updates }));
        },
        [setEditorState]
    );

    const handleZoomIn = useCallback(() => {
        setEditorState((prev) => ({
            ...prev,
            zoom: Math.min(prev.zoom + 0.1, 5),
        }));
    }, [setEditorState]);

    const handleZoomOut = useCallback(() => {
        setEditorState((prev) => ({
            ...prev,
            zoom: Math.max(prev.zoom - 0.1, 0.1),
        }));
    }, [setEditorState]);

    const handleZoomReset = useCallback(() => {
        setEditorState((prev) => ({
            ...prev,
            zoom: 1.0,
            pan: { x: 0, y: 0 },
        }));
    }, [setEditorState]);

    const handleLevelClose = useCallback(
        (index: number) => {
            if (levels.length > 1) {
                const level = levels[index];
                const hasData = level.tiles.length > 0 || level.objects.length > 0 || level.spawnPoints.length > 0;

                if (hasData) {
                    const confirmed = window.confirm(
                        `Are you sure you want to close "${level.levelName}"?\n\nAll unsaved changes will be lost and cannot be undone.`
                    );
                    if (!confirmed) return;
                }

                deleteLevel(index);
            }
        },
        [levels, deleteLevel]
    );

    // Undo/redo flash animation trigger
    const triggerUndoRedoFlash = useCallback(() => {
        setShowUndoRedoFlash(true);
        setTimeout(() => setShowUndoRedoFlash(false), 400);
    }, []);

    // Import/Export handlers
    const handleImportLevel = useCallback(
        (levelData: LevelData, mode: 'new' | 'overwrite') => {
            // Validate single player spawn
            const playerSpawns = levelData.spawnPoints.filter((spawn) => spawn.type === 'player');
            const otherSpawns = levelData.spawnPoints.filter((spawn) => spawn.type !== 'player');

            const validatedSpawnPoints = playerSpawns.length > 0 ? [playerSpawns[0], ...otherSpawns] : otherSpawns;

            const validatedLevelData = {
                ...levelData,
                spawnPoints: validatedSpawnPoints,
            };

            if (mode === 'new') {
                // Create new level with imported data
                createNewLevel(validatedLevelData);
            } else {
                // Overwrite current level
                updateCurrentLevel(() => validatedLevelData);
            }
        },
        [createNewLevel, updateCurrentLevel]
    );

    const handleExportPNG = useCallback(() => {
        const canvas = document.querySelector('[data-testid="level-canvas"]') as HTMLCanvasElement;
        if (canvas && currentLevel) {
            exportToPNG(canvas, `${currentLevel.levelName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`);
            toast({ title: 'Exported', description: 'Level exported as PNG!' });
        }
    }, [currentLevel, toast]);

    // Helper: Check if target is an input element
    const isInputElement = useCallback((target: HTMLElement) => {
        return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    }, []);

    // Helper: Handle tool shortcuts
    const handleToolShortcut = useCallback(
        (key: string) => {
            const toolMap: Record<string, EditorState['selectedTool']> = {
                v: 'select',
                m: 'multiselect',
                h: 'move',
                b: 'pen',
                l: 'line',
                r: 'rectangle',
                k: 'link',
                u: 'unlink',
            };
            if (toolMap[key]) {
                handleToolChange(toolMap[key]);
                return true;
            }
            return false;
        },
        [handleToolChange]
    );

    // Helper: Handle editor shortcuts
    const handleEditorShortcut = useCallback(
        (key: string) => {
            if (key === 'p') {
                setShowPropertiesPanel((prev) => !prev);
                return true;
            }
            if (key === 'escape') {
                // Cancel paste mode if active
                if (editorState.pastePreview) {
                    cancelPaste();
                }
                setEditorState((prev) => ({
                    ...prev,
                    ...selectionState.clearAll(),
                }));
                return true;
            }
            if (key === 'delete') {
                _deleteSelectedObjects();
                return true;
            }
            return false;
        },
        [_deleteSelectedObjects, selectionState, setEditorState, editorState.pastePreview, cancelPaste]
    );

    // Helper: Handle Ctrl/Cmd shortcuts
    const handleModifierShortcut = useCallback(
        (key: string, shiftKey: boolean) => {
            if (key === 'z') {
                if (shiftKey) {
                    _redo();
                } else {
                    _undo();
                }
                triggerUndoRedoFlash();
                return true;
            }
            if (key === 'y') {
                _redo();
                triggerUndoRedoFlash();
                return true;
            }
            if (key === 'c') {
                _copySelectedObjects();
                return true;
            }
            if (key === 'v') {
                _pasteObjects();
                return true;
            }
            if (key === 'a') {
                _selectAllObjects();
                return true;
            }
            return false;
        },
        [_undo, _redo, _copySelectedObjects, _pasteObjects, _selectAllObjects, triggerUndoRedoFlash]
    );

    // Keyboard shortcut handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (isInputElement(target)) return;

            const key = e.key.toLowerCase();
            const hasModifiers = e.ctrlKey || e.metaKey;
            const noModifiers = !hasModifiers && !e.shiftKey && !e.altKey;

            const handled =
                (noModifiers && (handleToolShortcut(key) || handleEditorShortcut(key))) ||
                (hasModifiers && handleModifierShortcut(key, e.shiftKey));

            if (handled) {
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isInputElement, handleToolShortcut, handleEditorShortcut, handleModifierShortcut]);

    // Track changes to mark as unsaved (skip initial render)
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setHasUnsavedChanges(true);
    }, [levels]);

    // Auto-save every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (hasUnsavedChanges) {
                setHasUnsavedChanges(false);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [hasUnsavedChanges]);

    // Calculate initial zoom to show grass layer
    useEffect(() => {
        if (!currentLevel) return;

        // Only calculate zoom on first load (when zoom is still at default 1.0)
        if (editorState.zoom !== 1) return;

        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
            const header = document.querySelector('header');
            const levelTabs = document.querySelector('[data-testid="level-tabs"]');
            const toolbar = document.querySelector('[data-testid="toolbar"]');
            const footer = document.querySelector('footer');

            const headerHeight = header?.clientHeight || 56;
            const tabsHeight = levelTabs?.clientHeight || 40;
            const toolbarHeight = toolbar?.clientHeight || 60;
            const footerHeight = footer?.clientHeight || 32;

            const viewportHeight = window.innerHeight - headerHeight - tabsHeight - toolbarHeight - footerHeight;

            if (viewportHeight <= 0) return;

            // TILE_SIZE is 32px, DEFAULT_GRASS_Y is 20
            const TILE_SIZE = 32;
            const DEFAULT_GRASS_Y = 20;

            const currentlyVisibleTiles = viewportHeight / TILE_SIZE;
            const targetVisibleTiles = DEFAULT_GRASS_Y + 5; // Show grass + 5 tiles above
            const calculatedZoom = currentlyVisibleTiles / targetVisibleTiles;
            const initialZoom = Math.min(Math.max(calculatedZoom, 0.1), 1);

            setEditorState((prev) => {
                // Double-check zoom hasn't changed
                if (prev.zoom === 1) {
                    return { ...prev, zoom: initialZoom };
                }
                return prev;
            });
        });
    }, [currentLevel, editorState.zoom, setEditorState]);

    // Don't render until we have a current level
    if (!currentLevel) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    color: '#fff',
                }}
            >
                Loading...
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: '56px 40px 1fr 32px',
                height: '100vh',
                width: '100vw',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
                background: '#1a1a1a',
                color: '#e0e0e0',
                overflow: 'hidden',
            }}
        >
            {/* HEADER BAR */}
            <header
                style={{
                    background: 'linear-gradient(90deg, #e74c3c 0%, #8e44ad 50%, #3498db 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    zIndex: 100,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <span>🎮</span>
                    <span>Roblox Level Designer</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <i className="fas fa-file mr-2"></i>
                                File
                                <i className="fas fa-chevron-down ml-2 text-xs"></i>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => createNewLevel()}>
                                <i className="fas fa-file w-4 mr-2"></i>
                                New Level
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowImportModal(true)}>
                                <i className="fas fa-file-import w-4 mr-2"></i>
                                Import JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowExportModal(true)}>
                                <i className="fas fa-file-export w-4 mr-2"></i>
                                Export JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportPNG}>
                                <i className="fas fa-image w-4 mr-2"></i>
                                Export PNG
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                        type="button"
                        onClick={() => {
                            _undo();
                            triggerUndoRedoFlash();
                        }}
                        disabled={historyIndex === 0}
                        style={{
                            padding: '8px 16px',
                            background: historyIndex === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: historyIndex === 0 ? 'rgba(255, 255, 255, 0.4)' : 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: historyIndex === 0 ? 'not-allowed' : 'pointer',
                            border: 'none',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        Undo
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            _redo();
                            triggerUndoRedoFlash();
                        }}
                        disabled={historyIndex === history.length - 1}
                        style={{
                            padding: '8px 16px',
                            background:
                                historyIndex === history.length - 1
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: historyIndex === history.length - 1 ? 'rgba(255, 255, 255, 0.4)' : 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: historyIndex === history.length - 1 ? 'not-allowed' : 'pointer',
                            border: 'none',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        Redo
                    </button>
                    <div
                        data-testid="save-indicator"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '4px',
                        }}
                    >
                        <i className={`fas fa-save ${hasUnsavedChanges ? 'text-orange-500' : 'text-green-500'}`}></i>
                        <span>{hasUnsavedChanges ? 'Unsaved' : 'Saved'}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'white', fontSize: '13px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '4px',
                        }}
                    >
                        <span>{currentLevel.objects.length + currentLevel.spawnPoints.length} Objects</span>
                    </div>
                </div>
            </header>

            {/* LEVEL TABS BAR */}
            <LevelTabs
                levels={levels}
                currentLevelIndex={currentLevelIndex}
                onLevelSelect={setCurrentLevelIndex}
                onLevelClose={handleLevelClose}
                onNewLevel={() => createNewLevel()}
            />

            {/* MAIN CONTENT AREA (3 columns) */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: showPropertiesPanel ? '250px 1fr 300px' : '250px 1fr 0px',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                }}
            >
                {/* LEFT SIDEBAR: Tile Palette */}
                <TilePalette selectedTileType={editorState.selectedTileType} onTileSelect={handleTileSelect} />

                {/* CENTER: Canvas Area */}
                <main style={{ display: 'flex', flexDirection: 'column', background: '#1a1a1a', overflow: 'hidden' }}>
                    {/* Toolbar Component */}
                    <Toolbar
                        editorState={editorState}
                        onToolChange={handleToolChange}
                        onStateChange={handleStateChange}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onZoomReset={handleZoomReset}
                        showPropertiesPanel={showPropertiesPanel}
                        onTogglePropertiesPanel={() => setShowPropertiesPanel((prev) => !prev)}
                        onSelectAll={_selectAllObjects}
                        hasObjects={
                            currentLevel.tiles.length > 0 ||
                            currentLevel.objects.length > 0 ||
                            currentLevel.spawnPoints.length > 0
                        }
                        onCopy={_copySelectedObjects}
                        onPaste={_pasteObjects}
                        hasSelection={editorState.selectedObjects.length > 0}
                        hasClipboard={(editorState.clipboard?.length ?? 0) > 0}
                    />

                    {/* Canvas Component with CanvasRenderer */}
                    <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                        <Canvas
                            levelData={currentLevel}
                            editorState={editorState}
                            onMouseMove={handleMouseMove}
                            onCanvasClick={handleCanvasClick}
                            onTilePlaced={handleTilePlaced}
                            onDrawingSessionEnd={handleDrawingSessionEnd}
                            onZoom={handleWheelZoom}
                            onMultiSelectComplete={handleMultiSelectComplete}
                            onMoveObjectsComplete={handleMoveObjectsComplete}
                            onLineComplete={handleLineComplete}
                            onRectangleComplete={handleRectangleComplete}
                            onLinkComplete={linkObjects}
                        />

                        {/* Undo/Redo Flash Overlay */}
                        {showUndoRedoFlash && (
                            <div
                                className="undo-redo-flash"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    pointerEvents: 'none',
                                    animation: 'flash 0.4s ease-out',
                                }}
                            />
                        )}
                    </div>
                </main>

                {/* RIGHT SIDEBAR: Properties Panel (Collapsible) */}
                {showPropertiesPanel && (
                    <PropertiesPanel
                        levelData={currentLevel}
                        editorState={editorState}
                        onLevelUpdate={updateCurrentLevel}
                        onClose={() => setShowPropertiesPanel(false)}
                    />
                )}
            </div>

            {/* Collapse toggle button (when properties panel is collapsed) */}
            {!showPropertiesPanel && (
                <button
                    type="button"
                    onClick={() => setShowPropertiesPanel(true)}
                    style={{
                        position: 'fixed',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '32px',
                        height: '64px',
                        background: '#2a2a2a',
                        border: '1px solid #333',
                        borderRight: 'none',
                        borderRadius: '6px 0 0 6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 50,
                        color: '#e0e0e0',
                    }}
                >
                    ◀
                </button>
            )}

            {/* BOTTOM STATUS BAR */}
            <footer
                style={{
                    background: '#252525',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    fontSize: '12px',
                    color: '#aaa',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#666' }}>Objects:</span>
                        <span data-testid="statusbar-object-count" style={{ color: '#e0e0e0', fontWeight: 500 }}>
                            {currentLevel.tiles.length + currentLevel.objects.length + currentLevel.spawnPoints.length}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#666' }}>Tiles:</span>
                        <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{currentLevel.tiles.length}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#666' }}>Canvas:</span>
                        <span data-testid="statusbar-canvas-dimensions" style={{ color: '#e0e0e0', fontWeight: 500 }}>
                            {currentLevel.metadata.dimensions.width * 32} ×{' '}
                            {currentLevel.metadata.dimensions.height * 32} px
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#666' }}>Grid:</span>
                        <span data-testid="statusbar-grid-dimensions" style={{ color: '#e0e0e0', fontWeight: 500 }}>
                            {currentLevel.metadata.dimensions.width} × {currentLevel.metadata.dimensions.height} tiles
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#666' }}>Zoom:</span>
                        <span data-testid="statusbar-zoom-display" style={{ color: '#e0e0e0', fontWeight: 500 }}>
                            {Math.round(editorState.zoom * 100)}%
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#666' }}>History:</span>
                        <span data-testid="statusbar-history" style={{ color: '#e0e0e0', fontWeight: 500 }}>
                            {historyIndex + 1}/{history.length}
                        </span>
                    </div>
                </div>
            </footer>

            {/* Import/Export Modals */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImportLevel}
            />
            <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} levelData={currentLevel} />

            {/* Large Clipboard Paste Confirmation Dialog */}
            <AlertDialog
                open={editorState.showLargeClipboardDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        cancelPaste();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Paste {editorState.clipboard.length} objects?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to paste {editorState.clipboard.length} objects at the cursor position. This
                            is a large clipboard and will be pasted immediately without preview.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                confirmLargeClipboardPaste(editorState.mousePosition);
                            }}
                        >
                            Paste
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
