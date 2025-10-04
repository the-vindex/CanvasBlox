import { EditorState } from '@/types/level';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
    icon: Icon,
    title,
    testId
  }: {
    tool: EditorState['selectedTool'];
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
      <Icon className="w-4 h-4" />
    </Button>
  );

  return (
    <div className="bg-card border-b border-border p-2 flex items-center gap-2" data-testid="toolbar">
      <div className="flex items-center gap-1">
        <ToolButton tool="select" icon={SelectIcon} title="Select Tool (V)" testId="tool-select" />
        <ToolButton tool="multiselect" icon={MultiselectIcon} title="Multi-Select (M)" testId="tool-multiselect" />
        <ToolButton tool="move" icon={MoveIcon} title="Move Tool (H)" testId="tool-move" />
      </div>

      <div className="w-px h-6 bg-border"></div>

      <div className="flex items-center gap-1">
        <ToolButton tool="line" icon={LineIcon} title="Line Tool (L)" testId="tool-line" />
        <ToolButton tool="rectangle" icon={RectangleIcon} title="Rectangle Tool (R)" testId="tool-rectangle" />
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
          className="px-3 py-2"
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

      <div className="w-px h-6 bg-border"></div>

      <div className="flex items-center gap-1">
        <ToolButton tool="link" icon={LinkIcon} title="Link Objects (K)" testId="tool-link" />
        <Button
          variant="ghost"
          size="sm"
          title="Clear All Links"
          className="px-3 py-2"
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
      </div>
    </div>
  );
}
