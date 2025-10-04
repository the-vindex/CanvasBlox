import { useCanvas } from '@/hooks/useCanvas';
import { LevelData, EditorState, Position } from '@/types/level';
import { cn } from '@/lib/utils';
import { TILE_SIZE } from '@/constants/editor';

interface CanvasProps {
  levelData: LevelData;
  editorState: EditorState;
  onMouseMove: (position: Position) => void;
  onCanvasClick: (position: Position, event: MouseEvent) => void;
  onTilePlaced: (position: Position, tileType: string, isDrawing?: boolean) => void;
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
  const { canvasRef } = useCanvas({
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

  // Calculate parallax background position (moves at 50% speed of pan)
  const parallaxX = editorState.pan.x * 0.5;
  const parallaxY = editorState.pan.y * 0.5;

  return (
    <div
      className={cn("flex-1 relative overflow-auto canvas-wrapper scrollbar-custom", className)}
      style={{
        minHeight: canvasHeight,
        backgroundPosition: `${parallaxX}px ${parallaxY}px`
      }}
    >
      <canvas
        id="levelCanvas"
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="absolute top-0 left-0 cursor-crosshair border-2 border-primary/30"
        style={{ imageRendering: 'pixelated' }}
        data-testid="level-canvas"
      />

      {/* Scanlines Overlay */}
      {editorState.showScanlines && (
        <div className="scanlines-overlay" />
      )}

      {/* Canvas Info Overlay */}
      <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm border border-white/20 rounded px-3 py-2 text-xs space-y-1 z-10 text-white">
        <div className="flex items-center gap-2">
          <span className="text-white/70">Mouse:</span>
          <span data-testid="mouse-position">
            X: {editorState.mousePosition.x}, Y: {editorState.mousePosition.y}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/70">Selected:</span>
          <span data-testid="selected-count">
            {editorState.selectedObjects.length} objects
          </span>
        </div>
      </div>
    </div>
  );
}
