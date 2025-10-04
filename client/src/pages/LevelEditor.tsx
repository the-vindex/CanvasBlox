import { useRef, useEffect, useState, useCallback } from 'react';
import { useLevelEditor } from '@/hooks/useLevelEditor';
import { Canvas } from '@/components/level-editor/Canvas';
import { TilePalette } from '@/components/level-editor/TilePalette';
import { PropertiesPanel } from '@/components/level-editor/PropertiesPanel';
import { Position } from '@/types/level';

export default function LevelEditor() {
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

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
    selectObject,
    deleteSelectedObjects,
    copySelectedObjects,
    pasteObjects,
    undo,
    redo,
    commitBatchToHistory
  } = useLevelEditor();

  // Handler callbacks for useCanvas
  const handleMouseMove = useCallback((position: Position) => {
    setEditorState(prev => ({ ...prev, mousePosition: position }));
  }, [setEditorState]);

  const handleCanvasClick = useCallback((position: Position, event: MouseEvent) => {
    if (editorState.selectedTool === 'select') {
      // Clear selection when clicking empty space with select tool
      setEditorState(prev => ({ ...prev, selectedObjects: [] }));
    }
  }, [editorState.selectedTool, setEditorState]);

  const drawingSessionTileCount = useRef(0);

  const handleTilePlaced = useCallback((position: Position, tileType: string, isDrawing = false) => {
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
  }, [addTile, addObject]);

  const handleDrawingSessionEnd = useCallback(() => {
    if (drawingSessionTileCount.current > 0) {
      const count = drawingSessionTileCount.current;
      commitBatchToHistory(`Placed ${count} tile${count > 1 ? 's' : ''}`);
      drawingSessionTileCount.current = 0;
    }
  }, [commitBatchToHistory]);

  const handleWheelZoom = useCallback((delta: number, mouseX: number, mouseY: number) => {
    setEditorState(prev => {
      const newZoom = Math.min(Math.max(prev.zoom + delta, 0.1), 5);

      // Calculate pan adjustment to zoom at mouse position
      const zoomRatio = newZoom / prev.zoom;
      const newPan = {
        x: prev.pan.x + (mouseX - mouseX * zoomRatio),
        y: prev.pan.y + (mouseY - mouseY * zoomRatio)
      };

      return {
        ...prev,
        zoom: newZoom,
        pan: newPan
      };
    });
  }, [setEditorState]);

  const handleTileSelect = useCallback((tileType: string) => {
    setEditorState(prev => ({
      ...prev,
      selectedTileType: tileType,
      selectedTool: null
    }));
  }, [setEditorState]);

  // Don't render until we have a current level
  if (!currentLevel) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#fff' }}>Loading...</div>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '56px 40px 1fr 32px',
        height: '100vh',
        width: '100vw',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 'bold', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <span>🎮</span>
          <span>Roblox Level Designer</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', backdropFilter: 'blur(10px)' }}>New Level</button>
          <button style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', backdropFilter: 'blur(10px)' }}>Import</button>
          <button style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', backdropFilter: 'blur(10px)' }}>Export</button>
          <button style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', backdropFilter: 'blur(10px)' }}>Save</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'white', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71' }}></div>
            <span>Saved</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '4px' }}>
            <span>42 Objects</span>
          </div>
        </div>
      </header>

      {/* LEVEL TABS BAR */}
      <div
        style={{
          background: '#252525',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          overflowY: 'hidden',
          borderBottom: '1px solid #333',
          padding: '0 8px',
          gap: '4px',
        }}
      >
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#1a1a1a', borderRadius: '6px 6px 0 0', fontSize: '13px', whiteSpace: 'nowrap', border: '1px solid #555', borderBottom: 'none', color: '#fff', cursor: 'pointer' }}>
          <span>Level 1</span>
          <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', fontSize: '16px', lineHeight: 1 }}>×</span>
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#2a2a2a', borderRadius: '6px 6px 0 0', fontSize: '13px', whiteSpace: 'nowrap', border: '1px solid transparent', borderBottom: 'none', cursor: 'pointer', color: '#e0e0e0' }}>
          <span>Level 2</span>
          <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', fontSize: '16px', lineHeight: 1 }}>×</span>
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#2a2a2a', borderRadius: '6px 6px 0 0', fontSize: '13px', whiteSpace: 'nowrap', border: '1px solid transparent', borderBottom: 'none', cursor: 'pointer', color: '#e0e0e0' }}>
          <span>Test Arena</span>
          <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', fontSize: '16px', lineHeight: 1 }}>×</span>
        </button>
        <button style={{ padding: '8px 16px', color: '#888', fontSize: '13px', cursor: 'pointer', border: 'none', background: 'none', flexShrink: 0 }}>+ New Level</button>
      </div>

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
        <TilePalette
          selectedTileType={editorState.selectedTileType}
          onTileSelect={handleTileSelect}
        />

        {/* CENTER: Canvas Area */}
        <main style={{ display: 'flex', flexDirection: 'column', background: '#1a1a1a', overflow: 'hidden' }}>
          {/* Canvas Toolbar */}
          <div style={{ height: '48px', background: '#252525', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '4px', padding: '0 8px', borderRight: '1px solid #333' }}>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3498db', borderRadius: '4px', fontSize: '16px', border: '1px solid #2980b9', cursor: 'pointer', color: '#e0e0e0' }}>⬜</button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>✥</button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>∕</button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>■</button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>🔗</button>
            </div>

            <div style={{ display: 'flex', gap: '4px', padding: '0 8px', borderRight: '1px solid #333' }}>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>⬛</button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>☰</button>
            </div>

            <div style={{ display: 'flex', gap: '4px', padding: '0 8px', borderRight: '1px solid #333', alignItems: 'center' }}>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>-</button>
              <div data-testid="toolbar-zoom-display" style={{ padding: '0 12px', fontSize: '13px', color: '#aaa', minWidth: '60px', textAlign: 'center' }}>{Math.round(editorState.zoom * 100)}%</div>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>+</button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>↺</button>
            </div>

            <div style={{ display: 'flex', gap: '4px', padding: '0 8px' }}>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>↶</button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: '4px', fontSize: '16px', border: '1px solid transparent', cursor: 'pointer', color: '#e0e0e0' }}>↷</button>
            </div>
          </div>

          {/* Canvas Component with CanvasRenderer */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Canvas
              levelData={currentLevel}
              editorState={editorState}
              onMouseMove={handleMouseMove}
              onCanvasClick={handleCanvasClick}
              onTilePlaced={handleTilePlaced}
              onDrawingSessionEnd={handleDrawingSessionEnd}
              onZoom={handleWheelZoom}
            />
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
      <footer style={{ background: '#252525', borderTop: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: '12px', color: '#aaa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#666' }}>Objects:</span>
            <span style={{ color: '#e0e0e0', fontWeight: 500 }}>42</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#666' }}>Tiles:</span>
            <span style={{ color: '#e0e0e0', fontWeight: 500 }}>156</span>
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
            <span data-testid="statusbar-zoom-display" style={{ color: '#e0e0e0', fontWeight: 500 }}>{Math.round(editorState.zoom * 100)}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#666' }}>History:</span>
            <span data-testid="statusbar-history-display" style={{ color: '#e0e0e0', fontWeight: 500 }}>{historyIndex + 1}/{history.length}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
