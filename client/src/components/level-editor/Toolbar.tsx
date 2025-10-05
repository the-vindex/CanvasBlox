import { useId } from 'react';
import LineIcon from '@/assets/icons/line.svg?react';
import LinkIcon from '@/assets/icons/link.svg?react';
import MoveIcon from '@/assets/icons/move.svg?react';
import MultiselectIcon from '@/assets/icons/multiselect.svg?react';
import PenIcon from '@/assets/icons/pen.svg?react';
import RectangleIcon from '@/assets/icons/rectangle.svg?react';
import SelectIcon from '@/assets/icons/select.svg?react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { EditorState } from '@/types/level';

interface ToolbarProps {
    editorState: EditorState;
    onToolChange: (tool: EditorState['selectedTool']) => void;
    onStateChange: (updates: Partial<EditorState>) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    showPropertiesPanel?: boolean;
    onTogglePropertiesPanel?: () => void;
}

// Define color scheme for tool groups
function getToolGroupColor(tool: EditorState['selectedTool']) {
    if (tool === 'select' || tool === 'multiselect' || tool === 'move') {
        return 'blue'; // Selection tools
    }
    if (tool === 'pen' || tool === 'line' || tool === 'rectangle') {
        return 'green'; // Drawing tools
    }
    if (tool === 'link') {
        return 'purple'; // Linking tools
    }
    return 'blue';
}

function getActiveColor(color: string) {
    const colors = {
        blue: 'bg-blue-600 hover:bg-blue-700',
        green: 'bg-green-600 hover:bg-green-700',
        purple: 'bg-purple-600 hover:bg-purple-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
}

interface ToolButtonProps {
    tool: EditorState['selectedTool'];
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    testId: string;
    isActive: boolean;
    onToolChange: (tool: EditorState['selectedTool']) => void;
}

function ToolButton({ tool, icon: Icon, title, testId, isActive, onToolChange }: ToolButtonProps) {
    const groupColor = getToolGroupColor(tool);
    const activeColorClass = getActiveColor(groupColor);

    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn('w-8 h-8 p-0', isActive && activeColorClass)}
            onClick={() => onToolChange(tool)}
            title={title}
            data-testid={testId}
            aria-pressed={isActive ? 'true' : 'false'}
        >
            <Icon className="w-4 h-4" />
        </Button>
    );
}

export function Toolbar({
    editorState,
    onToolChange,
    onStateChange,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    showPropertiesPanel,
    onTogglePropertiesPanel,
}: ToolbarProps) {
    const showGridId = useId();
    const showScanlinesId = useId();

    return (
        <div className="h-12 bg-[#252525] border-b border-[#333] flex items-center px-3 gap-2" data-testid="toolbar">
            {/* Selection Tools */}
            <div className="flex items-center gap-1 pr-2 border-r border-[#333]">
                <ToolButton
                    tool="select"
                    icon={SelectIcon}
                    title="Select Tool (V)"
                    testId="tool-select"
                    isActive={editorState.selectedTool === 'select'}
                    onToolChange={onToolChange}
                />
                <ToolButton
                    tool="multiselect"
                    icon={MultiselectIcon}
                    title="Multi-Select (M)"
                    testId="tool-multiselect"
                    isActive={editorState.selectedTool === 'multiselect'}
                    onToolChange={onToolChange}
                />
                <ToolButton
                    tool="move"
                    icon={MoveIcon}
                    title="Move Tool (H)"
                    testId="tool-move"
                    isActive={editorState.selectedTool === 'move'}
                    onToolChange={onToolChange}
                />
            </div>

            {/* Drawing Tools */}
            <div className="flex items-center gap-1 pr-2 border-r border-[#333]">
                <ToolButton
                    tool="pen"
                    icon={PenIcon}
                    title="Pen Tool (B)"
                    testId="tool-pen"
                    isActive={editorState.selectedTool === 'pen'}
                    onToolChange={onToolChange}
                />
                <ToolButton
                    tool="line"
                    icon={LineIcon}
                    title="Line Tool (L)"
                    testId="tool-line"
                    isActive={editorState.selectedTool === 'line'}
                    onToolChange={onToolChange}
                />
                <ToolButton
                    tool="rectangle"
                    icon={RectangleIcon}
                    title="Rectangle Tool (R)"
                    testId="tool-rectangle"
                    isActive={editorState.selectedTool === 'rectangle'}
                    onToolChange={onToolChange}
                />
            </div>

            {/* Linking Tools */}
            <div className="flex items-center gap-1 pr-2 border-r border-[#333]">
                <ToolButton
                    tool="link"
                    icon={LinkIcon}
                    title="Link Objects (K)"
                    testId="tool-link"
                    isActive={editorState.selectedTool === 'link'}
                    onToolChange={onToolChange}
                />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 pr-2 border-r border-[#333]">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onZoomOut}
                    title="Zoom Out (-)"
                    className="w-8 h-8 p-0"
                    data-testid="button-zoom-out"
                >
                    <i className="fas fa-search-minus text-sm"></i>
                </Button>
                <span className="text-xs text-muted-foreground min-w-[3.75rem] text-center" data-testid="zoom-level">
                    {Math.round(editorState.zoom * 100)}%
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onZoomIn}
                    title="Zoom In (+)"
                    className="w-8 h-8 p-0"
                    data-testid="button-zoom-in"
                >
                    <i className="fas fa-search-plus text-sm"></i>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onZoomReset}
                    title="Reset Zoom (1:1)"
                    className="w-8 h-8 p-0"
                    data-testid="button-reset-zoom"
                >
                    <i className="fas fa-expand-arrows-alt text-sm"></i>
                </Button>
            </div>

            {/* View Options */}
            <div className="flex items-center gap-3 text-sm ml-auto">
                <div className="flex items-center gap-2">
                    <Switch
                        id={showGridId}
                        checked={editorState.showGrid}
                        onCheckedChange={(checked) => onStateChange({ showGrid: checked })}
                        data-testid="switch-show-grid"
                        className="scale-75"
                    />
                    <Label htmlFor={showGridId} className="text-xs text-muted-foreground cursor-pointer">
                        Grid
                    </Label>
                </div>

                <div className="flex items-center gap-2">
                    <Switch
                        id={showScanlinesId}
                        checked={editorState.showScanlines}
                        onCheckedChange={(checked) => onStateChange({ showScanlines: checked })}
                        data-testid="switch-show-scanlines"
                        className="scale-75"
                    />
                    <Label htmlFor={showScanlinesId} className="text-xs text-muted-foreground cursor-pointer">
                        Scanlines
                    </Label>
                </div>

                {onTogglePropertiesPanel && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onTogglePropertiesPanel}
                        className={`w-8 h-8 p-0 ${showPropertiesPanel ? 'text-primary' : ''}`}
                        title={showPropertiesPanel ? 'Hide Properties Panel (P)' : 'Show Properties Panel (P)'}
                        data-testid="button-toggle-properties"
                    >
                        <i className={`fas fa-sliders-h text-sm ${showPropertiesPanel ? '' : 'opacity-50'}`}></i>
                    </Button>
                )}
            </div>
        </div>
    );
}
