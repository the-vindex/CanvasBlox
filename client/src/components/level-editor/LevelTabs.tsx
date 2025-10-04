import { Button } from '@/components/ui/button';
import { LevelData } from '@/types/level';
import { cn } from '@/lib/utils';

interface LevelTabsProps {
  levels: LevelData[];
  currentLevelIndex: number;
  onLevelSelect: (index: number) => void;
  onLevelClose: (index: number) => void;
  onNewLevel: () => void;
}

export function LevelTabs({
  levels,
  currentLevelIndex,
  onLevelSelect,
  onLevelClose,
  onNewLevel
}: LevelTabsProps) {
  return (
    <div className="bg-card border-b border-border flex items-center px-4 overflow-x-auto scrollbar-custom h-10" data-testid="level-tabs">
      <div className="flex items-center gap-1">
        {levels.map((level, index) => (
          <div
            key={index}
            className={cn(
              "level-tab px-4 py-1.5 flex items-center gap-2 text-sm cursor-pointer transition-all duration-150",
              index === currentLevelIndex 
                ? "bg-secondary text-foreground border-b-2 border-primary" 
                : "text-muted-foreground hover:bg-secondary/50"
            )}
            onClick={() => onLevelSelect(index)}
            data-testid={`tab-level-${index}`}
          >
            <span>{level.levelName}</span>
            {levels.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-destructive ml-2 h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onLevelClose(index);
                }}
                data-testid={`button-close-level-${index}`}
              >
                <i className="fas fa-times text-xs"></i>
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewLevel}
          className="px-3 py-1.5 text-muted-foreground hover:text-foreground"
          data-testid="button-new-level"
        >
          <i className="fas fa-plus"></i>
        </Button>
      </div>
    </div>
  );
}
