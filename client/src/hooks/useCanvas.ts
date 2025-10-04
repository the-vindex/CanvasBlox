import { useRef, useEffect, useCallback } from 'react';
import { CanvasRenderer } from '@/utils/canvasRenderer';
import { LevelData, EditorState, Position } from '@/types/level';

interface UseCanvasProps {
  levelData: LevelData;
  editorState: EditorState;
  onMouseMove: (position: Position) => void;
  onCanvasClick: (position: Position, event: MouseEvent) => void;
  onTilePlaced: (position: Position, tileType: string) => void;
}

export function useCanvas({
  levelData,
  editorState,
  onMouseMove,
  onCanvasClick,
  onTilePlaced
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

    return {
      x: Math.floor((canvasPos.x - editorState.pan.x) / editorState.zoom),
      y: Math.floor((canvasPos.y - editorState.pan.y) / editorState.zoom)
    };
  }, [editorState.pan, editorState.zoom]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const worldPos = getWorldPosition(e);
    onMouseMove(worldPos);

    if (isPaintingRef.current && editorState.selectedTileType) {
      onTilePlaced(worldPos, editorState.selectedTileType);
    }
  }, [getWorldPosition, onMouseMove, onTilePlaced, editorState.selectedTileType]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const worldPos = getWorldPosition(e);

    if (editorState.selectedTileType) {
      isPaintingRef.current = true;
      onTilePlaced(worldPos, editorState.selectedTileType);
    } else {
      onCanvasClick(worldPos, e);
    }
  }, [getWorldPosition, onCanvasClick, onTilePlaced, editorState.selectedTileType]);

  const handleMouseUp = useCallback(() => {
    isPaintingRef.current = false;
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    const worldPos = getWorldPosition(e);
    
    if (!editorState.selectedTileType) {
      onCanvasClick(worldPos, e);
    }
  }, [getWorldPosition, onCanvasClick, editorState.selectedTileType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleClick]);

  return { canvasRef, renderer: rendererRef.current };
}
