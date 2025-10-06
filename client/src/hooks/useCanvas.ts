import { useCallback, useEffect, useRef } from 'react';
import { TILE_SIZE } from '@/constants/editor';
import type { EditorState, LevelData, Position } from '@/types/level';
import { CanvasRenderer } from '@/utils/canvasRenderer';
import { getLinePositions } from '@/utils/lineDrawing';
import { getRectanglePositions } from '@/utils/rectangleDrawing';

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
    onRectangleComplete?: (positions: Position[], tileType: string) => void;
    onLinkComplete?: (sourceId: string, targetId: string) => void;
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
    onRectangleComplete,
    _onLinkComplete,
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
    const isDrawingRectangleRef = useRef(false);
    const rectangleStartRef = useRef<Position | null>(null);
    const rectangleEndRef = useRef<Position | null>(null);
    const suspendedToolRef = useRef<EditorState['selectedTool']>(null);

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

    // Clear drawing refs when tool changes (e.g., ESC key pressed)
    useEffect(() => {
        if (editorState.selectedTool !== 'line') {
            isDrawingLineRef.current = false;
            lineStartRef.current = null;
            lineEndRef.current = null;
        }
        if (editorState.selectedTool !== 'rectangle') {
            isDrawingRectangleRef.current = false;
            rectangleStartRef.current = null;
            rectangleEndRef.current = null;
        }
    }, [editorState.selectedTool]);

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

    // Helper: Handle middle mouse panning during mouse move
    const handlePanningMove = useCallback((e: MouseEvent) => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return false;

        const deltaX = e.clientX - panStartRef.current.x;
        const deltaY = e.clientY - panStartRef.current.y;

        wrapper.scrollLeft = scrollStartRef.current.left - deltaX;
        wrapper.scrollTop = scrollStartRef.current.top - deltaY;
        return true;
    }, []);

    // Helper: Handle line tool preview during mouse move
    const handleLinePreview = useCallback(
        (worldPos: Position) => {
            if (!lineStartRef.current || !rendererRef.current || !editorState.selectedTileType) {
                return false;
            }

            lineEndRef.current = worldPos;
            rendererRef.current.render(levelData, {
                ...editorState,
                linePreview: {
                    start: lineStartRef.current,
                    end: worldPos,
                    tileType: editorState.selectedTileType,
                },
            });
            return true;
        },
        [levelData, editorState]
    );

    // Helper: Handle rectangle tool preview during mouse move
    const handleRectanglePreview = useCallback(
        (worldPos: Position) => {
            if (!rectangleStartRef.current || !rendererRef.current || !editorState.selectedTileType) {
                return false;
            }

            rectangleEndRef.current = worldPos;
            rendererRef.current.render(levelData, {
                ...editorState,
                rectanglePreview: {
                    start: rectangleStartRef.current,
                    end: worldPos,
                    tileType: editorState.selectedTileType,
                },
            });
            return true;
        },
        [levelData, editorState]
    );

    // Helper: Handle move tool dragging during mouse move
    const handleMovePreview = useCallback(
        (worldPos: Position) => {
            if (!moveStartPositionRef.current || !rendererRef.current) {
                return false;
            }

            const delta = {
                x: worldPos.x - moveStartPositionRef.current.x,
                y: worldPos.y - moveStartPositionRef.current.y,
            };
            moveDeltaRef.current = delta;
            rendererRef.current.render(levelData, {
                ...editorState,
                moveDelta: delta,
            });
            return true;
        },
        [levelData, editorState]
    );

    // Helper: Handle multi-select drag box during mouse move
    const handleMultiSelectPreview = useCallback(
        (worldPos: Position) => {
            if (!selectionStartRef.current || !rendererRef.current) {
                return false;
            }

            selectionEndRef.current = worldPos;
            rendererRef.current.render(levelData, {
                ...editorState,
                selectionBox: {
                    start: selectionStartRef.current,
                    end: worldPos,
                },
            });
            return true;
        },
        [levelData, editorState]
    );

    // Helper: Handle pen tool continuous painting
    const handlePenPainting = useCallback(
        (worldPos: Position) => {
            if (!editorState.selectedTileType) {
                return false;
            }

            const isPlatform = editorState.selectedTileType.includes('platform');
            if (isPlatform) {
                onTilePlaced(worldPos, editorState.selectedTileType, true);
            }
            return true;
        },
        [editorState.selectedTileType, onTilePlaced]
    );

    // Helper: Route mouse move to appropriate tool handler
    const handleToolPreview = useCallback(
        (worldPos: Position) => {
            // Try each preview handler - each returns true if it handled the event
            if (isDrawingLineRef.current && handleLinePreview(worldPos)) return;
            if (isDrawingRectangleRef.current && handleRectanglePreview(worldPos)) return;
            if (isMovingObjectsRef.current && handleMovePreview(worldPos)) return;
            if (isDraggingSelectionRef.current && handleMultiSelectPreview(worldPos)) return;
            if (isPaintingRef.current) handlePenPainting(worldPos);
        },
        [handleLinePreview, handleRectanglePreview, handleMovePreview, handleMultiSelectPreview, handlePenPainting]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            // Handle middle mouse panning (early return)
            if (isPanningRef.current) {
                handlePanningMove(e);
                return;
            }

            const worldPos = getWorldPosition(e);
            onMouseMove(worldPos);
            handleToolPreview(worldPos);
        },
        [getWorldPosition, onMouseMove, handlePanningMove, handleToolPreview]
    );

    // Helper: Start middle mouse panning
    const startPanning = useCallback((e: MouseEvent) => {
        e.preventDefault();
        const wrapper = wrapperRef.current;
        if (!wrapper) return false;

        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        scrollStartRef.current = {
            left: wrapper.scrollLeft,
            top: wrapper.scrollTop,
        };
        wrapper.style.cursor = 'grabbing';
        return true;
    }, []);

    // Helper: Start drawing with line tool
    const startLineDrawing = useCallback(
        (worldPos: Position) => {
            if (!editorState.selectedTileType) return false;

            isDrawingLineRef.current = true;
            lineStartRef.current = worldPos;
            lineEndRef.current = worldPos;
            return true;
        },
        [editorState.selectedTileType]
    );

    // Helper: Start drawing with rectangle tool
    const startRectangleDrawing = useCallback(
        (worldPos: Position) => {
            if (!editorState.selectedTileType) return false;

            isDrawingRectangleRef.current = true;
            rectangleStartRef.current = worldPos;
            rectangleEndRef.current = worldPos;
            return true;
        },
        [editorState.selectedTileType]
    );

    // Helper: Start moving selected objects
    const startMoving = useCallback(
        (worldPos: Position) => {
            if (editorState.selectedObjects.length === 0) return false;

            isMovingObjectsRef.current = true;
            moveStartPositionRef.current = worldPos;
            moveDeltaRef.current = { x: 0, y: 0 };
            return true;
        },
        [editorState.selectedObjects.length]
    );

    // Helper: Start multi-select drag box
    const startMultiSelect = useCallback((worldPos: Position) => {
        isDraggingSelectionRef.current = true;
        selectionStartRef.current = worldPos;
        selectionEndRef.current = worldPos;
        return true;
    }, []);

    // Helper: Start painting with pen tool
    const startPenPainting = useCallback(
        (worldPos: Position) => {
            if (!editorState.selectedTileType) return false;

            isPaintingRef.current = true;
            onTilePlaced(worldPos, editorState.selectedTileType, true);
            return true;
        },
        [editorState.selectedTileType, onTilePlaced]
    );

    // Helper: Route mouse down to appropriate tool handler
    const handleToolMouseDown = useCallback(
        (worldPos: Position) => {
            // Handle each tool type
            if (editorState.selectedTool === 'line') {
                startLineDrawing(worldPos);
            } else if (editorState.selectedTool === 'rectangle') {
                startRectangleDrawing(worldPos);
            } else if (editorState.selectedTool === 'move') {
                startMoving(worldPos);
            } else if (editorState.selectedTool === 'multiselect') {
                startMultiSelect(worldPos);
            } else if (editorState.selectedTool === 'pen') {
                startPenPainting(worldPos);
            }
            // Note: onCanvasClick is handled by the 'click' event, not mousedown
        },
        [
            editorState.selectedTool,
            startLineDrawing,
            startRectangleDrawing,
            startMoving,
            startMultiSelect,
            startPenPainting,
        ]
    );

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            // Prevent event from bubbling to wrapper to avoid duplicate handling
            const canvas = canvasRef.current;
            if (e.currentTarget === canvas) {
                e.stopPropagation();
            }

            // Middle mouse button (button === 1) for panning
            if (e.button === 1) {
                startPanning(e);
                return;
            }

            // Left mouse button for drawing/clicking
            const worldPos = getWorldPosition(e);

            // Shift key modifier: temporarily engage multi-select (replaces current tool)
            if (e.shiftKey) {
                // Store current tool so we can restore it later
                if (!suspendedToolRef.current) {
                    suspendedToolRef.current = editorState.selectedTool;
                }
                startMultiSelect(worldPos);
                return;
            }

            handleToolMouseDown(worldPos);
        },
        [getWorldPosition, editorState.selectedTool, startPanning, startMultiSelect, handleToolMouseDown]
    );

    // Helper: End panning
    const endPanning = useCallback(() => {
        if (!isPanningRef.current) return;

        isPanningRef.current = false;
        const wrapper = wrapperRef.current;
        if (wrapper) {
            wrapper.style.cursor = '';
        }
    }, []);

    // Helper: End line drawing and finalize
    const endLineDrawing = useCallback(() => {
        if (
            !isDrawingLineRef.current ||
            !lineStartRef.current ||
            !lineEndRef.current ||
            !editorState.selectedTileType
        ) {
            return;
        }

        isDrawingLineRef.current = false;
        const positions = getLinePositions(lineStartRef.current, lineEndRef.current);
        if (onLineComplete) {
            onLineComplete(positions, editorState.selectedTileType);
        }
        lineStartRef.current = null;
        lineEndRef.current = null;

        if (rendererRef.current) {
            rendererRef.current.render(levelData, editorState);
        }
    }, [onLineComplete, editorState, levelData]);

    // Helper: End rectangle drawing and finalize
    const endRectangleDrawing = useCallback(() => {
        if (
            !isDrawingRectangleRef.current ||
            !rectangleStartRef.current ||
            !rectangleEndRef.current ||
            !editorState.selectedTileType
        ) {
            return;
        }

        isDrawingRectangleRef.current = false;
        const positions = getRectanglePositions(rectangleStartRef.current, rectangleEndRef.current, true);
        if (onRectangleComplete) {
            onRectangleComplete(positions, editorState.selectedTileType);
        }
        rectangleStartRef.current = null;
        rectangleEndRef.current = null;

        if (rendererRef.current) {
            rendererRef.current.render(levelData, editorState);
        }
    }, [onRectangleComplete, editorState, levelData]);

    // Helper: End move drag and finalize
    const endMoving = useCallback(() => {
        if (!isMovingObjectsRef.current) return;

        isMovingObjectsRef.current = false;
        if (onMoveObjectsComplete && (moveDeltaRef.current.x !== 0 || moveDeltaRef.current.y !== 0)) {
            onMoveObjectsComplete(moveDeltaRef.current);
        }
        moveStartPositionRef.current = null;
        moveDeltaRef.current = { x: 0, y: 0 };

        if (rendererRef.current) {
            rendererRef.current.render(levelData, editorState);
        }
    }, [onMoveObjectsComplete, levelData, editorState]);

    // Helper: End multi-select drag and finalize
    const endMultiSelect = useCallback(() => {
        if (!isDraggingSelectionRef.current || !selectionStartRef.current || !selectionEndRef.current) {
            return;
        }

        isDraggingSelectionRef.current = false;
        if (onMultiSelectComplete) {
            onMultiSelectComplete(selectionStartRef.current, selectionEndRef.current);
        }
        selectionStartRef.current = null;
        selectionEndRef.current = null;

        if (rendererRef.current) {
            rendererRef.current.render(levelData, editorState);
        }
    }, [onMultiSelectComplete, levelData, editorState]);

    // Helper: End pen painting
    const endPenPainting = useCallback(() => {
        if (!isPaintingRef.current) return;

        isPaintingRef.current = false;
        if (onDrawingSessionEnd) {
            onDrawingSessionEnd();
        }
    }, [onDrawingSessionEnd]);

    const handleMouseUp = useCallback(() => {
        endPanning();
        endLineDrawing();
        endRectangleDrawing();
        endMoving();
        endMultiSelect();
        endPenPainting();
    }, [endPanning, endLineDrawing, endRectangleDrawing, endMoving, endMultiSelect, endPenPainting]);

    const handleClick = useCallback(
        (e: MouseEvent) => {
            const worldPos = getWorldPosition(e);

            // Only skip canvas click if pen tool is active with a tile
            const isPenToolActive = editorState.selectedTool === 'pen' && editorState.selectedTileType;
            if (!isPenToolActive) {
                onCanvasClick(worldPos, e);
            }
        },
        [getWorldPosition, onCanvasClick, editorState.selectedTool, editorState.selectedTileType]
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
