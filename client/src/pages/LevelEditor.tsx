import { useState, useCallback, useEffect } from 'react';
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

export default function LevelEditor() {
  const { toast } = useToast();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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
    redo
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
    setEditorState(prev => ({ ...prev, selectedTileType: tileType }));
  }, [setEditorState]);

  const handleTilePlaced = useCallback((position: Position, tileType: string) => {
    if (tileType.startsWith('spawn-')) {
      addObject(position, tileType);
    } else if (tileType.includes('platform')) {
      addTile(position, tileType);
    } else {
      addObject(position, tileType);
    }
  }, [addTile, addObject]);

  const handleToolChange = useCallback((tool: typeof editorState.selectedTool) => {
    setEditorState(prev => ({ ...prev, selectedTool: tool }));
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
      deleteLevel(index);
    }
  }, [levels.length, deleteLevel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
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
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copySelectedObjects, pasteObjects, deleteSelectedObjects, handleToolChange, setEditorState]);

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
              onClick={undo}
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
              onClick={redo}
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
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-white font-medium">Auto-saved</span>
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
          />
          
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
            />
          </div>
        </main>

        {/* Right Sidebar - Properties Panel */}
        <PropertiesPanel
          levelData={currentLevel}
          editorState={editorState}
          onLevelUpdate={updateCurrentLevel}
          onDuplicateLevel={() => duplicateLevel()}
        />
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
