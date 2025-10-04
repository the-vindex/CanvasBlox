import { useRef, useEffect, useState, useCallback } from 'react';
import { useLevelEditor } from '@/hooks/useLevelEditor';
import { useCanvas } from '@/hooks/useCanvas';
import { Position } from '@/types/level';

export default function LevelEditor() {
  const [propertiesPanelCollapsed, setPropertiesPanelCollapsed] = useState(false);

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

  // Integrate useCanvas hook (only if currentLevel is available)
  const { canvasRef, wrapperRef } = useCanvas({
    levelData: currentLevel,
    editorState,
    onMouseMove: handleMouseMove,
    onCanvasClick: handleCanvasClick,
    onTilePlaced: handleTilePlaced,
    onDrawingSessionEnd: handleDrawingSessionEnd,
    onZoom: handleWheelZoom
  });

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
          {currentLevel && (
            <span style={{ fontSize: '14px', opacity: 0.8, fontWeight: 'normal' }}>
              - {currentLevel.levelName}
            </span>
          )}
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
          gridTemplateColumns: propertiesPanelCollapsed ? '250px 1fr 0px' : '250px 1fr 300px',
          overflow: 'hidden',
          background: '#1a1a1a',
        }}
      >
        {/* LEFT SIDEBAR: Tile Palette */}
        <aside style={{ background: '#222', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#2a2a2a', borderBottom: '1px solid #333', fontWeight: 600, fontSize: '14px' }}>Tile Palette</div>
          <div
            style={{
              overflowY: 'auto',
              padding: '12px',
              flex: 1,
            }}
          >
            {/* Platforms Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Platforms</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ aspectRatio: '1', background: '#2c3e50', border: '2px solid #3498db', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>⬜</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Basic</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🧱</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Stone</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🌿</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Grass</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>❄</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Ice</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔥</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Lava</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔩</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Metal</div>
                </div>
              </div>
            </div>

            {/* Objects Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Objects</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔘</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Button</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🚪</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Door</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎛</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Lever</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🌀</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Teleport</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🌲</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Tree</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🪨</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Rock</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🪙</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Coin</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🏁</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Checkpoint</div>
                </div>
              </div>
            </div>

            {/* Spawn Points Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Spawn Points</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>👤</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Player</div>
                </div>
                <div style={{ aspectRatio: '1', background: '#2a2a2a', border: '2px solid #333', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>👾</div>
                  <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center' }}>Enemy</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

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

          {/* SCROLLABLE Canvas Wrapper - CRITICAL FOR SCROLLING */}
          <div
            ref={wrapperRef}
            className="scrollbar-custom"
            style={{
              flex: 1,
              overflow: 'auto',
              background: '#1a1a1a',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '1920px',
                height: '960px',
                padding: '20px',
                display: 'inline-block',
                minWidth: '100%',
                minHeight: '100%',
              }}
            >
              <canvas
                data-testid="level-canvas"
                ref={canvasRef}
                width={1920}
                height={960}
                style={{
                  display: 'block',
                  width: '1920px',
                  height: '960px',
                  background: '#5C94FC',
                  border: '2px solid #333',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
            </div>

            {/* Canvas Overlay Info Panel */}
            <div
              data-testid="canvas-overlay"
              style={{
                position: 'absolute',
                top: '68px',
                left: '20px',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '12px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: '"Courier New", monospace',
                color: '#0f0',
                pointerEvents: 'none',
                backdropFilter: 'blur(4px)',
              }}
            >
              <div data-testid="mouse-position" style={{ marginBottom: '4px' }}>
                Mouse: ({editorState.mousePosition.x}, {editorState.mousePosition.y}) | Grid: ({editorState.mousePosition.x}, {editorState.mousePosition.y})
              </div>
              <div data-testid="selection-count" style={{ marginBottom: '4px' }}>Selected: {editorState.selectedObjects.length} objects</div>
              <div data-testid="current-tool" style={{ marginBottom: '4px' }}>Tool: {editorState.selectedTool || editorState.selectedTileType || 'None'}</div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Properties Panel (Collapsible) */}
        {!propertiesPanelCollapsed && (
          <aside style={{ background: '#222', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.3s ease' }}>
            <div style={{ padding: '12px 16px', background: '#2a2a2a', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, fontSize: '14px' }}>
              <span>Properties</span>
              <button
                onClick={() => setPropertiesPanelCollapsed(true)}
                style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer', border: 'none', background: 'none', color: '#e0e0e0' }}
              >
                ▶
              </button>
            </div>

            <div
              style={{
                overflowY: 'auto',
                padding: '16px',
                flex: 1,
              }}
            >
              {/* Level Properties */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Level Settings</div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', display: 'block' }}>Level Name</label>
                  <input type="text" defaultValue="Level 1" style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '4px', color: '#e0e0e0', fontSize: '13px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', display: 'block' }}>Background Color</label>
                  <input type="color" defaultValue="#5C94FC" style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '4px', color: '#e0e0e0', fontSize: '13px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', display: 'block' }}>Grid Size</label>
                  <input type="number" defaultValue="32" style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '4px', color: '#e0e0e0', fontSize: '13px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                  <input type="checkbox" id="show-grid" defaultChecked style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="show-grid" style={{ color: '#aaa', fontSize: '13px' }}>Show Grid</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                  <input type="checkbox" id="snap-to-grid" defaultChecked style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="snap-to-grid" style={{ color: '#aaa', fontSize: '13px' }}>Snap to Grid</label>
                </div>
              </div>

              {/* Object Properties */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Selected Object</div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', display: 'block' }}>Type</label>
                  <input type="text" defaultValue="Platform" readOnly style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '4px', color: '#e0e0e0', fontSize: '13px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', display: 'block' }}>Position X</label>
                  <input type="number" defaultValue="320" style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '4px', color: '#e0e0e0', fontSize: '13px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', display: 'block' }}>Position Y</label>
                  <input type="number" defaultValue="480" style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '4px', color: '#e0e0e0', fontSize: '13px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', display: 'block' }}>Width</label>
                  <input type="number" defaultValue="256" style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '4px', color: '#e0e0e0', fontSize: '13px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', display: 'block' }}>Height</label>
                  <input type="number" defaultValue="32" style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '4px', color: '#e0e0e0', fontSize: '13px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                  <input type="checkbox" id="has-collision" defaultChecked style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="has-collision" style={{ color: '#aaa', fontSize: '13px' }}>Has Collision</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                  <input type="checkbox" id="is-visible" defaultChecked style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="is-visible" style={{ color: '#aaa', fontSize: '13px' }}>Visible</label>
                </div>
              </div>

              {/* Platform-Specific Properties */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Platform Properties</div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', display: 'block' }}>Material</label>
                  <select style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '4px', color: '#e0e0e0', fontSize: '13px', fontFamily: 'inherit' }}>
                    <option>Basic</option>
                    <option>Stone</option>
                    <option>Grass</option>
                    <option>Ice</option>
                    <option>Lava</option>
                    <option>Metal</option>
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', display: 'block' }}>Friction</label>
                  <input type="range" min="0" max="100" defaultValue="50" style={{ width: '100%', padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '4px', color: '#e0e0e0', fontSize: '13px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                  <input type="checkbox" id="is-one-way" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="is-one-way" style={{ color: '#aaa', fontSize: '13px' }}>One-Way Platform</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                  <input type="checkbox" id="is-breakable" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="is-breakable" style={{ color: '#aaa', fontSize: '13px' }}>Breakable</label>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Collapse toggle button (when properties panel is collapsed) */}
      {propertiesPanelCollapsed && (
        <button
          onClick={() => setPropertiesPanelCollapsed(false)}
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
