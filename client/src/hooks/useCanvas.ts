import { useCallback, useEffect, useRef } from 'react';
import { TILE_SIZE } from '@/constants/editor';
import type { EditorState, LevelData, Position } from '@/types/level';
import { CanvasRenderer } from '@/utils/canvasRenderer';
import { getLinePositions } from '@/utils/lineDrawing';

interface UseCanvasProps {
    levelData: LevelData;
    editorState: EditorState;
    onMouseMove: (position: Position) => void;
    onCanvasClick: (position: Position, event: MouseEvent) => void;
    onTilePlaced: (position: Position, tileType: string, isDrawing?: boolean) => void;
    onDrawingSessionEnd?: () => void;
    onZoom?: (delta: number, mouseX: number, mouseY: number) => void;
    onMultiSelectComplete?: (start: Position, end: Position) => void;
    onMoveObjectsComplete?: (delta: Position) => void;
    onLineComplete?: (positions: Position[], tileType: string) => void;
}

export function useCanvas({
    levelData,
    editorState,
    onMouseMove,
    onCanvasClick,
    onTilePlaced,
    onDrawingSessionEnd,
    onZoom,
    onMultiSelectComplete,
    onMoveObjectsComplete,
    onLineComplete,
}: UseCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);
    const isPaintingRef = useRef(false);
    const isPanningRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const scrollStartRef = useRef({ left: 0, top: 0 });
    const isDraggingSelectionRef = useRef(false);
    const selectionStartRef = useRef<Position | null>(null);
    const selectionEndRef = useRef<Position | null>(null);
    const isMovingObjectsRef = useRef(false);
    const moveStartPositionRef = useRef<Position | null>(null);
    const moveDeltaRef = useRef<Position>({ x: 0, y: 0 });
    const isDrawingLineRef = useRef(false);
    const lineStartRef = useRef<Position | null>(null);
    const lineEndRef = useRef<Position | null>(null);

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

    const getWorldPosition = useCallback(
        (e: MouseEvent): Position => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };

            const rect = canvas.getBoundingClientRect();
            const canvasPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };

            // Convert pixel position to world pixel coordinates, then to tile indices
            const worldPixelX = (canvasPos.x - editorState.pan.x) / editorState.zoom;
            const worldPixelY = (canvasPos.y - editorState.pan.y) / editorState.zoom;

            return {
                x: Math.floor(worldPixelX / TILE_SIZE),
                y: Math.floor(worldPixelY / TILE_SIZE),
            };
        },
        [editorState.pan, editorState.zoom]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            // Handle middle mouse panning
            if (isPanningRef.current) {
                const wrapper = wrapperRef.current;
                if (!wrapper) return;

                const deltaX = e.clientX - panStartRef.current.x;
                const deltaY = e.clientY - panStartRef.current.y;

                wrapper.scrollLeft = scrollStartRef.current.left - deltaX;
                wrapper.scrollTop = scrollStartRef.current.top - deltaY;
                return;
            }

            const worldPos = getWorldPosition(e);
            onMouseMove(worldPos);

            // Handle line tool preview
            if (
                isDrawingLineRef.current &&
                editorState.selectedTool === 'line' &&
                lineStartRef.current &&
                editorState.selectedTileType
            ) {
                lineEndRef.current = worldPos;
                // Re-render to show line preview
                if (rendererRef.current) {
                    rendererRef.current.render(levelData, {
                        ...editorState,
                        linePreview: {
                            start: lineStartRef.current,
                            end: worldPos,
                            tileType: editorState.selectedTileType,
                        },
                    });
                }
                return;
            }

            // Handle move tool dragging
            if (isMovingObjectsRef.current && editorState.selectedTool === 'move' && moveStartPositionRef.current) {
                const delta = {
                    x: worldPos.x - moveStartPositionRef.current.x,
                    y: worldPos.y - moveStartPositionRef.current.y,
                };
                moveDeltaRef.current = delta;
                // Re-render to show ghost preview
                if (rendererRef.current) {
                    rendererRef.current.render(levelData, {
                        ...editorState,
                        moveDelta: delta,
                    });
                }
                return;
            }

            // Handle multi-select drag box
            if (isDraggingSelectionRef.current && editorState.selectedTool === 'multiselect') {
                selectionEndRef.current = worldPos;
                // Force re-render to show drag box
                if (rendererRef.current) {
                    rendererRef.current.render(levelData, {
                        ...editorState,
                        selectionBox: {
                            start: selectionStartRef.current!,
                            end: worldPos,
                        },
                    });
                }
                return;
            }

            if (isPaintingRef.current && editorState.selectedTileType) {
                onTilePlaced(worldPos, editorState.selectedTileType, true); // Pass isDrawing=true
            }
        },
        [getWorldPosition, onMouseMove, onTilePlaced, editorState, levelData]
    );

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            // Middle mouse button (button === 1) for panning
            if (e.button === 1) {
                e.preventDefault();
                const wrapper = wrapperRef.current;
                if (!wrapper) return;

                isPanningRef.current = true;
                panStartRef.current = { x: e.clientX, y: e.clientY };
                scrollStartRef.current = {
                    left: wrapper.scrollLeft,
                    top: wrapper.scrollTop,
                };
                // Change cursor to grabbing
                wrapper.style.cursor = 'grabbing';
                return;
            }

            // Left mouse button for drawing/clicking
            const worldPos = getWorldPosition(e);

            // Handle line tool - start drawing line
            if (editorState.selectedTool === 'line' && editorState.selectedTileType) {
                isDrawingLineRef.current = true;
                lineStartRef.current = worldPos;
                lineEndRef.current = worldPos;
                return;
            }

            // Handle move tool - start dragging selected objects
            if (editorState.selectedTool === 'move' && editorState.selectedObjects.length > 0) {
                isMovingObjectsRef.current = true;
                moveStartPositionRef.current = worldPos;
                moveDeltaRef.current = { x: 0, y: 0 };
                return;
            }

            // Handle multi-select tool
            if (editorState.selectedTool === 'multiselect') {
                isDraggingSelectionRef.current = true;
                selectionStartRef.current = worldPos;
                selectionEndRef.current = worldPos;
                return;
            }

            if (editorState.selectedTileType) {
                isPaintingRef.current = true;
                onTilePlaced(worldPos, editorState.selectedTileType, true); // Pass isDrawing=true
            } else {
                onCanvasClick(worldPos, e);
            }
        },
        [getWorldPosition, onCanvasClick, onTilePlaced, editorState.selectedTileType, editorState.selectedTool]
    );

    const handleMouseUp = useCallback(() => {
        const wrapper = wrapperRef.current;

        // End panning
        if (isPanningRef.current) {
            isPanningRef.current = false;
            if (wrapper) {
                wrapper.style.cursor = '';
            }
        }

        // End line drawing
        if (isDrawingLineRef.current && lineStartRef.current && lineEndRef.current && editorState.selectedTileType) {
            isDrawingLineRef.current = false;
            const positions = getLinePositions(lineStartRef.current, lineEndRef.current);
            if (onLineComplete) {
                onLineComplete(positions, editorState.selectedTileType);
            }
            lineStartRef.current = null;
            lineEndRef.current = null;
            // Re-render without preview
            if (rendererRef.current) {
                rendererRef.current.render(levelData, editorState);
            }
        }

        // End move drag
        if (isMovingObjectsRef.current) {
            isMovingObjectsRef.current = false;
            if (onMoveObjectsComplete && (moveDeltaRef.current.x !== 0 || moveDeltaRef.current.y !== 0)) {
                onMoveObjectsComplete(moveDeltaRef.current);
            }
            moveStartPositionRef.current = null;
            moveDeltaRef.current = { x: 0, y: 0 };
            // Re-render
            if (rendererRef.current) {
                rendererRef.current.render(levelData, editorState);
            }
        }

        // End multi-select drag
        if (isDraggingSelectionRef.current && selectionStartRef.current && selectionEndRef.current) {
            isDraggingSelectionRef.current = false;
            if (onMultiSelectComplete) {
                onMultiSelectComplete(selectionStartRef.current, selectionEndRef.current);
            }
            selectionStartRef.current = null;
            selectionEndRef.current = null;
            // Re-render without selection box
            if (rendererRef.current) {
                rendererRef.current.render(levelData, editorState);
            }
        }

        // End painting
        if (isPaintingRef.current) {
            isPaintingRef.current = false;
            // End the drawing session
            if (onDrawingSessionEnd) {
                onDrawingSessionEnd();
            }
        }
    }, [onDrawingSessionEnd, onMultiSelectComplete, onMoveObjectsComplete, onLineComplete, levelData, editorState]);

    const handleClick = useCallback(
        (e: MouseEvent) => {
            const worldPos = getWorldPosition(e);

            if (!editorState.selectedTileType) {
                onCanvasClick(worldPos, e);
            }
        },
        [getWorldPosition, onCanvasClick, editorState.selectedTileType]
    );

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            // Check for Ctrl/Cmd key for zoom
            if (e.ctrlKey || e.metaKey) {
                // Only prevent default when zooming
                e.preventDefault();

                if (!onZoom) return;

                const wrapper = wrapperRef.current;
                if (!wrapper) return;

                const rect = wrapper.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Negative deltaY = scroll up = zoom in
                // Positive deltaY = scroll down = zoom out
                const delta = -Math.sign(e.deltaY) * 0.1;

                onZoom(delta, mouseX, mouseY);
            }
            // If no Ctrl/Cmd, allow normal scroll behavior (no preventDefault)
        },
        [onZoom]
    );

    const handleContextMenu = useCallback((e: MouseEvent) => {
        // Prevent context menu when middle mouse button is used for panning
        if (isPanningRef.current) {
            e.preventDefault();
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('contextmenu', handleContextMenu);

        // Also attach mouse events to wrapper for middle button panning
        wrapper.addEventListener('mousedown', handleMouseDown);
        wrapper.addEventListener('mousemove', handleMouseMove);
        wrapper.addEventListener('mouseup', handleMouseUp);

        // Attach wheel event to wrapper div instead of canvas
        wrapper.addEventListener('wheel', handleWheel as any, { passive: false });

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('contextmenu', handleContextMenu);

            wrapper.removeEventListener('mousedown', handleMouseDown);
            wrapper.removeEventListener('mousemove', handleMouseMove);
            wrapper.removeEventListener('mouseup', handleMouseUp);
            wrapper.removeEventListener('wheel', handleWheel as any);
        };
    }, [handleMouseMove, handleMouseDown, handleMouseUp, handleClick, handleWheel, handleContextMenu]);

    return { canvasRef, wrapperRef, renderer: rendererRef.current };
}
