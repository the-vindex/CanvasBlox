import { useRef, useEffect, useCallback } from 'react';
import { CanvasRenderer } from '@/utils/canvasRenderer';
import { LevelData, EditorState, Position } from '@/types/level';
import { TILE_SIZE } from '@/constants/editor';

interface UseCanvasProps {
  levelData: LevelData;
  editorState: EditorState;
  onMouseMove: (position: Position) => void;
  onCanvasClick: (position: Position, event: MouseEvent) => void;
  onTilePlaced: (position: Position, tileType: string, isDrawing?: boolean) => void;
  onDrawingSessionEnd?: () => void;
  onZoom?: (delta: number, mouseX: number, mouseY: number) => void;
}

export function useCanvas({
  levelData,
  editorState,
  onMouseMove,
  onCanvasClick,
  onTilePlaced,
  onDrawingSessionEnd,
  onZoom
}: UseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const isPaintingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new CanvasRenderer(ctx);
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.render(levelData, editorState);
    }
  }, [levelData, editorState]);

  const getWorldPosition = useCallback((e: MouseEvent): Position => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const canvasPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Convert pixel position to world pixel coordinates, then to tile indices
    const worldPixelX = (canvasPos.x - editorState.pan.x) / editorState.zoom;
    const worldPixelY = (canvasPos.y - editorState.pan.y) / editorState.zoom;

    return {
      x: Math.floor(worldPixelX / TILE_SIZE),
      y: Math.floor(worldPixelY / TILE_SIZE)
    };
  }, [editorState.pan, editorState.zoom]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const worldPos = getWorldPosition(e);
    onMouseMove(worldPos);

    if (isPaintingRef.current && editorState.selectedTileType) {
      onTilePlaced(worldPos, editorState.selectedTileType, true); // Pass isDrawing=true
    }
  }, [getWorldPosition, onMouseMove, onTilePlaced, editorState.selectedTileType]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const worldPos = getWorldPosition(e);

    if (editorState.selectedTileType) {
      isPaintingRef.current = true;
      onTilePlaced(worldPos, editorState.selectedTileType, true); // Pass isDrawing=true
    } else {
      onCanvasClick(worldPos, e);
    }
  }, [getWorldPosition, onCanvasClick, onTilePlaced, editorState.selectedTileType]);

  const handleMouseUp = useCallback(() => {
    if (isPaintingRef.current) {
      isPaintingRef.current = false;
      // End the drawing session
      if (onDrawingSessionEnd) {
        onDrawingSessionEnd();
      }
    }
  }, [onDrawingSessionEnd]);

  const handleClick = useCallback((e: MouseEvent) => {
    const worldPos = getWorldPosition(e);

    if (!editorState.selectedTileType) {
      onCanvasClick(worldPos, e);
    }
  }, [getWorldPosition, onCanvasClick, editorState.selectedTileType]);

  const handleWheel = useCallback((e: WheelEvent) => {
    // Check for Ctrl/Cmd key for zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      if (!onZoom) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Negative deltaY = scroll up = zoom in
      // Positive deltaY = scroll down = zoom out
      const delta = -Math.sign(e.deltaY) * 0.1;

      onZoom(delta, mouseX, mouseY);
    }
  }, [onZoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel as any, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel as any);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleClick, handleWheel]);

  return { canvasRef, renderer: rendererRef.current };
}
