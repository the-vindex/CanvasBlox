import { EditorState } from '@/types/level';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import SelectIcon from '@/assets/icons/select.svg?react';
import MultiselectIcon from '@/assets/icons/multiselect.svg?react';
import MoveIcon from '@/assets/icons/move.svg?react';
import LineIcon from '@/assets/icons/line.svg?react';
import RectangleIcon from '@/assets/icons/rectangle.svg?react';
import LinkIcon from '@/assets/icons/link.svg?react';

interface ToolbarProps {
  editorState: EditorState;
  onToolChange: (tool: EditorState['selectedTool']) => void;
  onStateChange: (updates: Partial<EditorState>) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  showPropertiesPanel?: boolean;
  onTogglePropertiesPanel?: () => void;
}

export function Toolbar({
  editorState,
  onToolChange,
  onStateChange,
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  showPropertiesPanel,
  onTogglePropertiesPanel
}: ToolbarProps) {
  // Define color scheme for tool groups
  const getToolGroupColor = (tool: EditorState['selectedTool']) => {
    if (tool === 'select' || tool === 'multiselect' || tool === 'move') {
      return 'blue'; // Selection tools
    }
    if (tool === 'line' || tool === 'rectangle') {
      return 'green'; // Drawing tools
    }
    if (tool === 'link') {
      return 'purple'; // Linking tools
    }
    return 'blue';
  };

  const getGlowColor = (color: string) => {
    const colors = {
      blue: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
      green: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]',
      purple: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getActiveColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700',
      purple: 'bg-purple-600 hover:bg-purple-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const ToolButton = ({
    tool,
    icon: Icon,
    title,
    testId
  }: {
    tool: EditorState['selectedTool'];
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    testId: string;
  }) => {
    const isActive = editorState.selectedTool === tool;
    const groupColor = getToolGroupColor(tool);
    const glowClass = getGlowColor(groupColor);
    const activeColorClass = getActiveColor(groupColor);

    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "px-3 py-2 transition-all duration-300 ease-out",
          "hover:scale-105",
          isActive && cn(
            activeColorClass,
            "text-white scale-105",
            glowClass
          )
        )}
        onClick={() => onToolChange(tool)}
        title={title}
        data-testid={testId}
        aria-pressed={isActive ? "true" : "false"}
      >
        <Icon className="w-4 h-4" />
      </Button>
    );
  };

  const ToolGroupLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium px-1">
      {children}
    </span>
  );

  return (
    <div className="bg-card/80 backdrop-blur-md border-b border-border p-2 flex items-center gap-4" data-testid="toolbar">
      {/* Selection Tools */}
      <div className="flex flex-col gap-1">
        <ToolGroupLabel>Selection</ToolGroupLabel>
        <div className="flex items-center gap-1">
          <ToolButton tool="select" icon={SelectIcon} title="Select Tool (V)" testId="tool-select" />
          <ToolButton tool="multiselect" icon={MultiselectIcon} title="Multi-Select (M)" testId="tool-multiselect" />
          <ToolButton tool="move" icon={MoveIcon} title="Move Tool (H)" testId="tool-move" />
        </div>
      </div>

      <div className="w-px h-10 bg-border/50"></div>

      {/* Drawing Tools */}
      <div className="flex flex-col gap-1">
        <ToolGroupLabel>Drawing</ToolGroupLabel>
        <div className="flex items-center gap-1">
          <ToolButton tool="line" icon={LineIcon} title="Line Tool (L)" testId="tool-line" />
          <ToolButton tool="rectangle" icon={RectangleIcon} title="Rectangle Tool (R)" testId="tool-rectangle" />
        </div>
      </div>

      <div className="w-px h-10 bg-border/50"></div>

      {/* Rotation Tools */}
      <div className="flex flex-col gap-1">
        <ToolGroupLabel>Rotation</ToolGroupLabel>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRotateLeft}
            title="Rotate Left (Q)"
            className="px-3 py-2 transition-all duration-300 ease-out hover:scale-105"
            data-testid="button-rotate-left"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRotateRight}
            title="Rotate Right (E)"
            className="px-3 py-2 transition-all duration-300 ease-out hover:scale-105"
            data-testid="button-rotate-right"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </Button>
          <span className="text-xs text-muted-foreground ml-1" data-testid="rotation-display">
            0°
          </span>
        </div>
      </div>

      <div className="w-px h-10 bg-border/50"></div>

      {/* Linking Tools */}
      <div className="flex flex-col gap-1">
        <ToolGroupLabel>Linking</ToolGroupLabel>
        <div className="flex items-center gap-1">
          <ToolButton tool="link" icon={LinkIcon} title="Link Objects (K)" testId="tool-link" />
          <Button
            variant="ghost"
            size="sm"
            title="Clear All Links"
            className="px-3 py-2 transition-all duration-300 ease-out hover:scale-105"
            data-testid="button-clear-links"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
              <path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
              <line x1="8" y1="2" x2="8" y2="5" />
              <line x1="2" y1="8" x2="5" y2="8" />
              <line x1="16" y1="19" x2="16" y2="22" />
              <line x1="19" y1="16" x2="22" y2="16" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="flex-1"></div>

      {/* Zoom Controls */}
      <div className="flex flex-col gap-1">
        <ToolGroupLabel>Zoom</ToolGroupLabel>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            className="px-3 py-2 transition-all duration-300 ease-out hover:scale-105"
            data-testid="button-zoom-in"
          >
            <i className="fas fa-plus"></i>
          </Button>
          <span className="text-xs text-muted-foreground min-w-[3rem] text-center" data-testid="zoom-level">
            {Math.round(editorState.zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            className="px-3 py-2 transition-all duration-300 ease-out hover:scale-105"
            data-testid="button-zoom-out"
          >
            <i className="fas fa-minus"></i>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomReset}
            title="Reset Zoom"
            className="px-3 py-2 transition-all duration-300 ease-out hover:scale-105"
            data-testid="button-reset-zoom"
          >
            <i className="fas fa-compress"></i>
          </Button>
        </div>
      </div>

      <div className="w-px h-10 bg-border/50"></div>

      {/* View Options */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Switch
            id="showGrid"
            checked={editorState.showGrid}
            onCheckedChange={(checked) => onStateChange({ showGrid: checked })}
            data-testid="switch-show-grid"
          />
          <Label htmlFor="showGrid" className="text-sm text-muted-foreground cursor-pointer">
            Show Grid
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="showScanlines"
            checked={editorState.showScanlines}
            onCheckedChange={(checked) => onStateChange({ showScanlines: checked })}
            data-testid="switch-show-scanlines"
          />
          <Label htmlFor="showScanlines" className="text-sm text-muted-foreground cursor-pointer">
            Scanlines
          </Label>
        </div>

        {onTogglePropertiesPanel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePropertiesPanel}
            className={`px-3 py-2 transition-all duration-300 ease-out hover:scale-105 ${
              showPropertiesPanel ? 'text-primary' : ''
            }`}
            title={showPropertiesPanel ? "Hide Properties Panel (P)" : "Show Properties Panel (P)"}
            data-testid="button-toggle-properties"
          >
            <i className={`fas fa-sliders-h ${showPropertiesPanel ? '' : 'opacity-50'}`}></i>
          </Button>
        )}
      </div>
    </div>
  );
}
