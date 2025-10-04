import { useRef, useEffect, useCallback } from 'react';
import { CanvasRenderer } from '@/utils/canvasRenderer';
import { LevelData, EditorState, Position } from '@/types/level';

interface UseCanvasProps {
  levelData: LevelData;
  editorState: EditorState;
  onMouseMove: (position: Position) => void;
  onCanvasClick: (position: Position, event: MouseEvent) => void;
  onCanvasDrop: (position: Position, tileType: string) => void;
}

export function useCanvas({
  levelData,
  editorState,
  onMouseMove,
  onCanvasClick,
  onCanvasDrop
}: UseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Convert to world coordinates
    const worldPos = {
      x: Math.floor((canvasPos.x - editorState.pan.x) / editorState.zoom),
      y: Math.floor((canvasPos.y - editorState.pan.y) / editorState.zoom)
    };

    onMouseMove(worldPos);
  }, [editorState.pan, editorState.zoom, onMouseMove]);

  const handleClick = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Convert to world coordinates
    const worldPos = {
      x: Math.floor((canvasPos.x - editorState.pan.x) / editorState.zoom),
      y: Math.floor((canvasPos.y - editorState.pan.y) / editorState.zoom)
    };

    onCanvasClick(worldPos, e);
  }, [editorState.pan, editorState.zoom, onCanvasClick]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tileType = e.dataTransfer?.getData('tile-type');
    if (!tileType) return;

    const rect = canvas.getBoundingClientRect();
    const canvasPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Convert to world coordinates
    const worldPos = {
      x: Math.floor((canvasPos.x - editorState.pan.x) / editorState.zoom),
      y: Math.floor((canvasPos.y - editorState.pan.y) / editorState.zoom)
    };

    onCanvasDrop(worldPos, tileType);
  }, [editorState.pan, editorState.zoom, onCanvasDrop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('dragover', (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('drop', handleDrop);
      canvas.removeEventListener('dragover', (e) => e.preventDefault());
    };
  }, [handleMouseMove, handleClick, handleDrop]);

  return { canvasRef, renderer: rendererRef.current };
}
