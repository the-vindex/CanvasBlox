import { useCanvas } from '@/hooks/useCanvas';
import { LevelData, EditorState } from '@/types/level';
import { TILE_SIZE } from '@/constants/editor';

interface CanvasProps {
  levelData: LevelData;
  editorState: EditorState;
  onMouseMove: (position: any) => void;
  onCanvasClick: (position: any, event: MouseEvent) => void;
  onTilePlaced: (position: any, tileType: string, isDrawing?: boolean) => void;
  onDrawingSessionEnd?: () => void;
  onZoom?: (delta: number, mouseX: number, mouseY: number) => void;
  className?: string;
}

export function Canvas({
  levelData,
  editorState,
  onMouseMove,
  onCanvasClick,
  onTilePlaced,
  onDrawingSessionEnd,
  onZoom,
  className
}: CanvasProps) {
  const { canvasRef, wrapperRef } = useCanvas({
    levelData,
    editorState,
    onMouseMove,
    onCanvasClick,
    onTilePlaced,
    onDrawingSessionEnd,
    onZoom
  });

  // Calculate canvas pixel size from tile dimensions
  const canvasWidth = levelData.metadata.dimensions.width * TILE_SIZE;
  const canvasHeight = levelData.metadata.dimensions.height * TILE_SIZE;

  return (
    <div
      ref={wrapperRef}
      className="scrollbar-custom"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: '#1a1a1a',
        position: 'relative'
      }}
    >
      {/* Inner wrapper - sized to canvas dimensions, creates scrollable content */}
      <div
        style={{
          width: canvasWidth,
          height: canvasHeight,
          padding: '20px',
          display: 'inline-block',
          minWidth: '100%',
          minHeight: '100%'
        }}
      >
        <canvas
          id="levelCanvas"
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            display: 'block',
            width: canvasWidth,
            height: canvasHeight,
            background: '#5C94FC',
            border: '2px solid #333',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            imageRendering: 'pixelated'
          }}
        />

        {/* Scanlines Overlay - absolutely positioned relative to wrapper */}
        {editorState.showScanlines && (
          <div
            className="scanlines-overlay"
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Info Overlay - absolutely positioned relative to wrapper */}
        <div
          style={{
            position: 'absolute',
            top: '36px',
            left: '36px',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: "'Courier New', monospace",
            color: '#0f0',
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div style={{ marginBottom: '4px' }}>
            Mouse: X: {editorState.mousePosition.x}, Y: {editorState.mousePosition.y}
          </div>
          <div>Selected: {editorState.selectedObjects.length} objects</div>
        </div>
      </div>
    </div>
  );
}
