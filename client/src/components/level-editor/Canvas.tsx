import { useCanvas } from '@/hooks/useCanvas';
import { LevelData, EditorState, Position } from '@/types/level';
import { cn } from '@/lib/utils';

interface CanvasProps {
  levelData: LevelData;
  editorState: EditorState;
  onMouseMove: (position: Position) => void;
  onCanvasClick: (position: Position, event: MouseEvent) => void;
  onTilePlaced: (position: Position, tileType: string) => void;
  className?: string;
}

export function Canvas({
  levelData,
  editorState,
  onMouseMove,
  onCanvasClick,
  onTilePlaced,
  className
}: CanvasProps) {
  const { canvasRef } = useCanvas({
    levelData,
    editorState,
    onMouseMove,
    onCanvasClick,
    onTilePlaced
  });

  return (
    <div className={cn("flex-1 relative overflow-hidden", className)}>
      <canvas
        id="levelCanvas"
        ref={canvasRef}
        width={1920}
        height={1080}
        className="absolute top-0 left-0 cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
        data-testid="level-canvas"
      />
      
      {/* Canvas Info Overlay */}
      <div className="absolute top-4 left-4 bg-card/90 border border-border rounded px-3 py-2 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Mouse:</span>
          <span data-testid="mouse-position">
            X: {editorState.mousePosition.x}, Y: {editorState.mousePosition.y}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Selected:</span>
          <span data-testid="selected-count">
            {editorState.selectedObjects.length} objects
          </span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <button 
          className="px-3 py-2 rounded hover:bg-secondary transition-all duration-150"
          data-testid="button-zoom-in"
        >
          <i className="fas fa-plus"></i>
        </button>
        <div className="text-center text-sm text-muted-foreground" data-testid="zoom-level">
          {Math.round(editorState.zoom * 100)}%
        </div>
        <button 
          className="px-3 py-2 rounded hover:bg-secondary transition-all duration-150"
          data-testid="button-zoom-out"
        >
          <i className="fas fa-minus"></i>
        </button>
        <div className="w-full h-px bg-border my-1"></div>
        <button 
          className="px-3 py-2 rounded hover:bg-secondary transition-all duration-150"
          title="Reset Zoom (0)"
          data-testid="button-reset-zoom"
        >
          <i className="fas fa-compress"></i>
        </button>
      </div>
    </div>
  );
}
