import { useId } from 'react';
import { TILE_SIZE } from '@/constants/editor';
import { useCanvas } from '@/hooks/useCanvas';
import type { EditorState, LevelData, Position } from '@/types/level';

interface CanvasProps {
    levelData: LevelData;
    editorState: EditorState;
    onMouseMove: (position: Position) => void;
    onCanvasClick: (position: Position, event: MouseEvent) => void;
    onTilePlaced: (position: Position, tileType: string, isDrawing?: boolean) => void;
    onDrawingSessionEnd?: () => void;
    onZoom?: (delta: number, mouseX: number, mouseY: number) => void;
    onMultiSelectComplete?: (start: Position, end: Position) => void;
    onMoveObjectsComplete?: (delta: Position) => void;
}

export function Canvas({
    levelData,
    editorState,
    onMouseMove,
    onCanvasClick,
    onTilePlaced,
    onDrawingSessionEnd,
    onZoom,
    onMultiSelectComplete,
    onMoveObjectsComplete,
}: CanvasProps) {
    const canvasId = useId();
    const { canvasRef, wrapperRef } = useCanvas({
        levelData,
        editorState,
        onMouseMove,
        onCanvasClick,
        onTilePlaced,
        onDrawingSessionEnd,
        onZoom,
        onMultiSelectComplete,
        onMoveObjectsComplete,
    });

    // Calculate canvas pixel size from tile dimensions
    const canvasWidth = levelData.metadata.dimensions.width * TILE_SIZE;
    const canvasHeight = levelData.metadata.dimensions.height * TILE_SIZE;

    return (
        <div
            ref={wrapperRef}
            className="scrollbar-custom overflow-auto"
            style={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                background: '#1a1a1a',
                position: 'relative',
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
                    minHeight: '100%',
                }}
            >
                <canvas
                    id={canvasId}
                    data-testid="level-canvas"
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
                        imageRendering: 'pixelated',
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
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* Info Overlay - absolutely positioned relative to wrapper */}
                <div
                    data-testid="canvas-overlay"
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
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <div data-testid="mouse-position" style={{ marginBottom: '4px' }}>
                        Mouse: ({editorState.mousePosition.x}, {editorState.mousePosition.y})
                    </div>
                    <div data-testid="selection-count">Selected: {editorState.selectedObjects.length} object(s)</div>
                </div>
            </div>
        </div>
    );
}
