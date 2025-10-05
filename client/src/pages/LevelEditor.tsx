import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@/components/level-editor/Canvas';
import { LevelTabs } from '@/components/level-editor/LevelTabs';
import { PropertiesPanel } from '@/components/level-editor/PropertiesPanel';
import { TilePalette } from '@/components/level-editor/TilePalette';
import { Toolbar } from '@/components/level-editor/Toolbar';
import { useLevelEditor } from '@/hooks/useLevelEditor';
import type { EditorState, Position } from '@/types/level';

export default function LevelEditor() {
    const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
    const [showUndoRedoFlash, setShowUndoRedoFlash] = useState(false);

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
        duplicateLevel,
        deleteLevel,
        addTile,
        addObject,
        selectObject: _selectObject,
        deleteSelectedObjects: _deleteSelectedObjects,
        copySelectedObjects: _copySelectedObjects,
        pasteObjects: _pasteObjects,
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

    const handleCanvasClick = useCallback(
        (_position: Position, _event: MouseEvent) => {
            if (editorState.selectedTool === 'select') {
                // Clear selection when clicking empty space with select tool
                setEditorState((prev) => ({ ...prev, selectedObjects: [] }));
            }
        },
        [editorState.selectedTool, setEditorState]
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

    const handleTileSelect = useCallback(
        (tileType: string) => {
            setEditorState((prev) => ({
                ...prev,
                selectedTileType: tileType,
                selectedTool: null,
            }));
        },
        [setEditorState]
    );

    // Toolbar handlers
    const handleToolChange = useCallback(
        (tool: EditorState['selectedTool']) => {
            setEditorState((prev) => ({
                ...prev,
                selectedTool: tool,
                selectedTileType: null,
            }));
        },
        [setEditorState]
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
                        `Are you sure you want to close "${level.levelName}"? Any unsaved changes will be lost.`
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
                l: 'line',
                r: 'rectangle',
                k: 'link',
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
                setEditorState((prev) => ({
                    ...prev,
                    selectedTool: null,
                    selectedObjects: [],
                }));
                return true;
            }
            if (key === 'delete') {
                _deleteSelectedObjects();
                return true;
            }
            return false;
        },
        [_deleteSelectedObjects]
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
            return false;
        },
        [_undo, _redo, _copySelectedObjects, _pasteObjects, triggerUndoRedoFlash]
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
                    <button
                        type="button"
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            border: 'none',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        New Level
                    </button>
                    <button
                        type="button"
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            border: 'none',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        Import
                    </button>
                    <button
                        type="button"
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            border: 'none',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        Export
                    </button>
                    <button
                        type="button"
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            border: 'none',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        Save
                    </button>
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
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71' }}></div>
                        <span>Saved</span>
                    </div>
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
                        />

                        {/* Undo/Redo Flash Overlay */}
                        {showUndoRedoFlash && (
                            <div
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
                        onDuplicateLevel={() => duplicateLevel()}
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
                        <span style={{ color: '#e0e0e0', fontWeight: 500 }}>
                            {currentLevel.objects.length + currentLevel.spawnPoints.length}
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
                        <span style={{ color: '#e0e0e0', fontWeight: 500 }}>1920 × 960 px</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#666' }}>Grid:</span>
                        <span style={{ color: '#e0e0e0', fontWeight: 500 }}>60 × 30 tiles</span>
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
                        <span data-testid="statusbar-history-display" style={{ color: '#e0e0e0', fontWeight: 500 }}>
                            {historyIndex + 1}/{history.length}
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
