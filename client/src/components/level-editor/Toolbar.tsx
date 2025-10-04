import { EditorState } from '@/types/level';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  editorState: EditorState;
  onToolChange: (tool: EditorState['selectedTool']) => void;
  onStateChange: (updates: Partial<EditorState>) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export function Toolbar({ 
  editorState, 
  onToolChange, 
  onStateChange,
  onRotateLeft,
  onRotateRight 
}: ToolbarProps) {
  const ToolButton = ({ 
    tool, 
    icon, 
    title, 
    testId 
  }: { 
    tool: EditorState['selectedTool']; 
    icon: string; 
    title: string;
    testId: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "px-3 py-2 transition-all duration-150",
        editorState.selectedTool === tool && "bg-primary text-primary-foreground"
      )}
      onClick={() => onToolChange(tool)}
      title={title}
      data-testid={testId}
    >
      <i className={icon}></i>
    </Button>
  );

  return (
    <div className="bg-card border-b border-border p-2 flex items-center gap-2" data-testid="toolbar">
      <div className="flex items-center gap-1">
        <ToolButton tool="select" icon="fas fa-mouse-pointer" title="Select Tool (V)" testId="tool-select" />
        <ToolButton tool="multiselect" icon="fas fa-object-group" title="Multi-Select (M)" testId="tool-multiselect" />
        <ToolButton tool="move" icon="fas fa-arrows-alt" title="Move Tool (H)" testId="tool-move" />
      </div>

      <div className="w-px h-6 bg-border"></div>

      <div className="flex items-center gap-1">
        <ToolButton tool="line" icon="fas fa-minus" title="Line Tool (L)" testId="tool-line" />
        <ToolButton tool="rectangle" icon="fas fa-square" title="Rectangle Tool (R)" testId="tool-rectangle" />
      </div>

      <div className="w-px h-6 bg-border"></div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRotateLeft}
          title="Rotate Left (Q)"
          className="px-3 py-2"
          data-testid="button-rotate-left"
        >
          <i className="fas fa-undo"></i>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRotateRight}
          title="Rotate Right (E)"
          className="px-3 py-2"
          data-testid="button-rotate-right"
        >
          <i className="fas fa-redo"></i>
        </Button>
        <span className="text-xs text-muted-foreground ml-1" data-testid="rotation-display">
          0°
        </span>
      </div>

      <div className="w-px h-6 bg-border"></div>

      <div className="flex items-center gap-1">
        <ToolButton tool="link" icon="fas fa-link" title="Link Objects (K)" testId="tool-link" />
        <Button
          variant="ghost"
          size="sm"
          title="Clear All Links"
          className="px-3 py-2"
          data-testid="button-clear-links"
        >
          <i className="fas fa-unlink"></i>
        </Button>
      </div>

      <div className="flex-1"></div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showGrid"
            checked={editorState.showGrid}
            onCheckedChange={(checked) => onStateChange({ showGrid: !!checked })}
            data-testid="checkbox-show-grid"
          />
          <Label htmlFor="showGrid" className="text-muted-foreground cursor-pointer">
            Show Grid
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="snapToGrid"
            checked={editorState.snapToGrid}
            onCheckedChange={(checked) => onStateChange({ snapToGrid: !!checked })}
            data-testid="checkbox-snap-grid"
          />
          <Label htmlFor="snapToGrid" className="text-muted-foreground cursor-pointer">
            Snap to Grid
          </Label>
        </div>
      </div>
    </div>
  );
}
