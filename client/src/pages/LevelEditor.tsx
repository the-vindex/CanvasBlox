import { useState, useCallback, useEffect, useRef } from 'react';
import { useLevelEditor } from '@/hooks/useLevelEditor';
import { Canvas } from '@/components/level-editor/Canvas';
import { TilePalette } from '@/components/level-editor/TilePalette';
import { PropertiesPanel } from '@/components/level-editor/PropertiesPanel';
import { Toolbar } from '@/components/level-editor/Toolbar';
import { LevelTabs } from '@/components/level-editor/LevelTabs';
import { ImportModal, ExportModal } from '@/components/level-editor/ImportExportModals';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Position, LevelData } from '@/types/level';
import { LevelSerializer } from '@/utils/levelSerializer';
import { useToast } from '@/hooks/use-toast';
import { TILE_SIZE, DEFAULT_GRASS_Y } from '@/constants/editor';

export default function LevelEditor() {
  const { toast } = useToast();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUndoRedoFlash, setShowUndoRedoFlash] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [isDrawingSession, setIsDrawingSession] = useState(false);
  const drawingSessionTileCount = useRef(0);

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
    selectObject,
    deleteSelectedObjects,
    copySelectedObjects,
    pasteObjects,
    undo,
    redo,
    commitBatchToHistory
  } = useLevelEditor();

  const handleMouseMove = useCallback((position: Position) => {
    setEditorState(prev => ({ ...prev, mousePosition: position }));
  }, [setEditorState]);

  const handleCanvasClick = useCallback((position: Position, event: MouseEvent) => {
    // Handle object selection logic here
    // For now, just clear selection if clicking empty space
    if (editorState.selectedTool === 'select') {
      setEditorState(prev => ({ ...prev, selectedObjects: [] }));
    }
  }, [editorState.selectedTool, setEditorState]);

  const handleTileSelect = useCallback((tileType: string) => {
    // When selecting a tile, enter placement mode (clear tool selection)
    setEditorState(prev => ({
      ...prev,
      selectedTileType: tileType,
      selectedTool: null
    }));
  }, [setEditorState]);

  const handleTilePlaced = useCallback((position: Position, tileType: string, isDrawing = false) => {
    if (tileType.startsWith('spawn-')) {
      // Spawn points are not batched (usually single placement)
      addObject(position, tileType);
    } else if (tileType.includes('platform')) {
      // For tiles, use batching if in drawing session
      if (isDrawing) {
        addTile(position, tileType, true); // Skip history
        drawingSessionTileCount.current++;
      } else {
        addTile(position, tileType, false); // Normal history
      }
    } else {
      // Other objects are not batched
      addObject(position, tileType);
    }
  }, [addTile, addObject]);

  const handleDrawingSessionEnd = useCallback(() => {
    // When drawing session ends, commit all placed tiles as a single history entry
    if (drawingSessionTileCount.current > 0) {
      const count = drawingSessionTileCount.current;
      commitBatchToHistory(`Placed ${count} tile${count > 1 ? 's' : ''}`);
      drawingSessionTileCount.current = 0;
    }
  }, [commitBatchToHistory]);

  const handleToolChange = useCallback((tool: typeof editorState.selectedTool) => {
    setEditorState(prev => ({
      ...prev,
      selectedTool: tool,
      selectedTileType: null // Clear tile selection when activating a tool
    }));
  }, [setEditorState]);

  const handleStateChange = useCallback((updates: Partial<typeof editorState>) => {
    setEditorState(prev => ({ ...prev, ...updates }));
  }, [setEditorState]);

  const handleRotateLeft = useCallback(() => {
    // Implementation for rotating selected objects left
    toast({ title: "Rotate Left", description: "Feature coming soon!" });
  }, [toast]);

  const handleRotateRight = useCallback(() => {
    // Implementation for rotating selected objects right
    toast({ title: "Rotate Right", description: "Feature coming soon!" });
  }, [toast]);

  const handleZoomIn = useCallback(() => {
    setEditorState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.1, 3) }));
  }, [setEditorState]);

  const handleZoomOut = useCallback(() => {
    const minZoom = 0.1;
    const newZoom = Math.max(editorState.zoom - 0.1, minZoom);

    if (editorState.zoom <= minZoom) {
      toast({
        title: "Maximum Zoom Out",
        description: "Minimum zoom level reached"
      });
      return;
    }

    setEditorState(prev => ({ ...prev, zoom: newZoom }));
  }, [setEditorState, editorState.zoom, toast]);

  const handleZoomReset = useCallback(() => {
    setEditorState(prev => ({ ...prev, zoom: 1 }));
  }, [setEditorState]);

  const handleExportPNG = useCallback(() => {
    const canvas = document.querySelector('#levelCanvas') as HTMLCanvasElement;
    if (canvas) {
      LevelSerializer.exportToPNG(canvas, `${currentLevel?.levelName || 'level'}.png`);
      toast({ title: "Exported", description: "Level exported as PNG!" });
    }
  }, [currentLevel, toast]);

  const handleImportLevel = useCallback((levelData: LevelData) => {
    // Ensure only one player spawn point exists
    const playerSpawns = levelData.spawnPoints.filter(spawn => spawn.type === 'player');
    const otherSpawns = levelData.spawnPoints.filter(spawn => spawn.type !== 'player');

    // Keep only the first player spawn if multiple exist
    const validatedSpawnPoints = playerSpawns.length > 0
      ? [playerSpawns[0], ...otherSpawns]
      : otherSpawns;

    updateCurrentLevel(() => ({
      ...levelData,
      spawnPoints: validatedSpawnPoints
    }));
  }, [updateCurrentLevel]);

  const handleLevelClose = useCallback((index: number) => {
    if (levels.length > 1) {
      const level = levels[index];
      const hasData = level.tiles.length > 0 ||
                      level.objects.length > 0 ||
                      level.spawnPoints.length > 0;

      if (hasData) {
        const confirmed = window.confirm(
          `"${level.levelName}" contains ${level.tiles.length} tiles, ${level.objects.length} objects, and ${level.spawnPoints.length} spawn points.\n\nAre you sure you want to close and delete this level?`
        );
        if (!confirmed) return;
      }

      deleteLevel(index);
    }
  }, [levels, deleteLevel]);

  // Calculate initial zoom to ensure grass is visible on app load
  useEffect(() => {
    // Only set zoom once when levels are first loaded
    if (!currentLevel) return;

    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      // Calculate viewport height from window, subtracting all fixed-height UI elements
      const header = document.querySelector('header');
      const levelTabs = document.querySelector('[data-testid="level-tabs"], .level-tabs');
      const toolbar = document.querySelector('[data-testid="toolbar"]');
      const footer = document.querySelector('footer');

      const headerHeight = header?.clientHeight || 56; // h-14 = 56px
      const tabsHeight = levelTabs?.clientHeight || 40;
      const toolbarHeight = toolbar?.clientHeight || 60;
      const footerHeight = footer?.clientHeight || 32; // h-8 = 32px

      const viewportHeight = window.innerHeight - headerHeight - tabsHeight - toolbarHeight - footerHeight;

      if (viewportHeight <= 0) return; // Container not ready yet

      // Calculate how many tiles are currently visible at 100% zoom
      const currentlyVisibleTiles = viewportHeight / TILE_SIZE;

      // We want to show grass (at DEFAULT_GRASS_Y) + 5 tiles below it
      const targetVisibleTiles = DEFAULT_GRASS_Y + 5;

      // Calculate zoom: if we need to show MORE tiles, zoom OUT (< 1)
      const calculatedZoom = currentlyVisibleTiles / targetVisibleTiles;

      // Clamp between 0.1 and 1 (don't zoom in beyond 100%)
      const initialZoom = Math.min(Math.max(calculatedZoom, 0.1), 1);

      setEditorState(prev => {
        // Only set zoom if it's still at default (1.0)
        if (prev.zoom === 1) {
          return { ...prev, zoom: initialZoom };
        }
        return prev;
      });
    });
  }, [currentLevel, setEditorState]);

  // Track unsaved changes
  useEffect(() => {
    // Mark as unsaved when levels change
    setHasUnsavedChanges(true);
  }, [levels]);

  // Mark as saved every 5 seconds (matching auto-save interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setHasUnsavedChanges(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Trigger flash on undo/redo
  const triggerUndoRedoFlash = useCallback(() => {
    setShowUndoRedoFlash(true);
    setTimeout(() => setShowUndoRedoFlash(false), 400);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
              triggerUndoRedoFlash();
            } else {
              undo();
              triggerUndoRedoFlash();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            triggerUndoRedoFlash();
            break;
          case 'c':
            e.preventDefault();
            copySelectedObjects();
            break;
          case 'v':
            e.preventDefault();
            pasteObjects();
            break;
        }
      } else {
        switch (e.key) {
          case 'Escape':
            setEditorState(prev => ({ ...prev, selectedTileType: null }));
            break;
          case 'Delete':
            e.preventDefault();
            deleteSelectedObjects();
            break;
          case 'v':
            handleToolChange('select');
            break;
          case 'm':
            handleToolChange('multiselect');
            break;
          case 'h':
            handleToolChange('move');
            break;
          case 'l':
            handleToolChange('line');
            break;
          case 'r':
            handleToolChange('rectangle');
            break;
          case 'k':
            handleToolChange('link');
            break;
          case 'p':
            setShowPropertiesPanel(prev => !prev);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copySelectedObjects, pasteObjects, deleteSelectedObjects, handleToolChange, setEditorState, triggerUndoRedoFlash]);

  if (!currentLevel) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top Toolbar */}
      <header className="bg-roblox-gradient border-b border-border flex items-center justify-between px-4 py-2 h-14 shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-cube icon-hover"></i>
            Roblox Level Designer
          </h1>

          {/* File Operations */}
          <div className="flex items-center gap-1 border-l border-white/20 pl-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <i className="fas fa-file"></i>
                  File
                  <i className="fas fa-chevron-down text-xs"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => createNewLevel()} data-testid="button-new-level">
                  <i className="fas fa-file w-4"></i>
                  New Level
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowImportModal(true)} data-testid="button-import-json">
                  <i className="fas fa-folder-open w-4"></i>
                  Import JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowExportModal(true)} data-testid="button-export-json">
                  <i className="fas fa-download w-4"></i>
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPNG} data-testid="button-export-png">
                  <i className="fas fa-image w-4"></i>
                  Export PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-l border-white/20 pl-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                undo();
                triggerUndoRedoFlash();
              }}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
              className="text-white hover:bg-white/10 disabled:opacity-50 disabled:text-white/50"
              data-testid="button-undo"
            >
              <i className="fas fa-undo"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                redo();
                triggerUndoRedoFlash();
              }}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
              className="text-white hover:bg-white/10 disabled:opacity-50 disabled:text-white/50"
              data-testid="button-redo"
            >
              <i className="fas fa-redo"></i>
            </Button>
          </div>

          {/* Edit Tools */}
          <div className="flex items-center gap-1 border-l border-white/20 pl-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={copySelectedObjects}
              title="Copy (Ctrl+C)"
              className="text-white hover:bg-white/10"
              data-testid="button-copy"
            >
              <i className="fas fa-copy"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={pasteObjects}
              title="Paste (Ctrl+V)"
              className="text-white hover:bg-white/10"
              data-testid="button-paste"
            >
              <i className="fas fa-paste"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSelectedObjects}
              title="Delete (Del)"
              className="text-white hover:bg-white/10"
              data-testid="button-delete"
            >
              <i className="fas fa-trash"></i>
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
            <i
              className={`fas fa-save transition-colors duration-300 ${
                hasUnsavedChanges ? 'text-orange-500' : 'text-green-500'
              }`}
            ></i>
            <span className="text-white font-medium">
              {hasUnsavedChanges ? 'Unsaved' : 'Saved'}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
            <i className="fas fa-cubes text-blue-400"></i>
            <span className="text-white">
              {currentLevel.tiles.length + currentLevel.objects.length + currentLevel.spawnPoints.length} objects
            </span>
          </div>
        </div>
      </header>

      {/* Level Tabs */}
      <LevelTabs
        levels={levels}
        currentLevelIndex={currentLevelIndex}
        onLevelSelect={setCurrentLevelIndex}
        onLevelClose={handleLevelClose}
        onNewLevel={() => createNewLevel()}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tile Palette */}
        <TilePalette 
          selectedTileType={editorState.selectedTileType} 
          onTileSelect={handleTileSelect} 
        />

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Toolbar
            editorState={editorState}
            onToolChange={handleToolChange}
            onStateChange={handleStateChange}
            onRotateLeft={handleRotateLeft}
            onRotateRight={handleRotateRight}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            showPropertiesPanel={showPropertiesPanel}
            onTogglePropertiesPanel={() => setShowPropertiesPanel(prev => !prev)}
          />

          <div className="flex-1 flex overflow-hidden">
            <div
              className="flex-1 relative"
              style={{
                background: `
                  repeating-linear-gradient(0deg, transparent, transparent 19px, hsl(0 0% 15%) 19px, hsl(0 0% 15%) 20px),
                  repeating-linear-gradient(90deg, transparent, transparent 19px, hsl(0 0% 15%) 19px, hsl(0 0% 15%) 20px)
                `,
                backgroundSize: '20px 20px'
              }}
            >
              <Canvas
                levelData={currentLevel}
                editorState={editorState}
                onMouseMove={handleMouseMove}
                onCanvasClick={handleCanvasClick}
                onTilePlaced={handleTilePlaced}
                onDrawingSessionEnd={handleDrawingSessionEnd}
              />
              {showUndoRedoFlash && <div className="undo-redo-flash" />}
            </div>

            {/* Properties Panel - below toolbar, right of canvas */}
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
        </main>
      </div>

      {/* Status Bar */}
      <footer className="bg-card border-t border-border px-4 py-2 flex items-center justify-between text-xs h-8">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Objects: <span data-testid="object-count">
            {currentLevel.tiles.length + currentLevel.objects.length + currentLevel.spawnPoints.length}
          </span></span>
          <span>|</span>
          <span>Canvas: <span data-testid="canvas-size">
            {currentLevel.metadata.dimensions.width}×{currentLevel.metadata.dimensions.height}
          </span></span>
          <span>|</span>
          <span>Zoom: <span data-testid="zoom-level">{Math.round(editorState.zoom * 100)}%</span></span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>History: <span data-testid="history-state">{historyIndex + 1}/{history.length}</span></span>
        </div>
      </footer>

      {/* Modals */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportLevel}
      />
      
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        levelData={currentLevel}
      />
    </div>
  );
}
