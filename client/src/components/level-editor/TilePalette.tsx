import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TileItemProps {
  type: string;
  label: string;
  color: string;
  icon?: string;
  onDragStart: (tileType: string) => void;
}

function TileItem({ type, label, color, icon, onDragStart }: TileItemProps) {
  return (
    <div
      className="tile-item bg-secondary rounded p-2 text-center transition-all duration-150 cursor-grab hover:transform hover:-translate-y-0.5 hover:shadow-md"
      draggable
      data-tile-type={type}
      onDragStart={(e) => {
        e.dataTransfer.setData('tile-type', type);
        onDragStart(type);
      }}
      data-testid={`tile-${type}`}
    >
      <div className={cn("w-full h-12 rounded mb-1 flex items-center justify-center", color)}>
        {icon ? <i className={`${icon} text-2xl`}></i> : null}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

interface TileCategoryProps {
  title: string;
  children: React.ReactNode;
}

function TileCategory({ title, children }: TileCategoryProps) {
  return (
    <div className="p-3 border-t border-border first:border-t-0">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {children}
      </div>
    </div>
  );
}

interface TilePaletteProps {
  onTileDrag: (tileType: string) => void;
}

export function TilePalette({ onTileDrag }: TilePaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragStart = (tileType: string) => {
    onTileDrag(tileType);
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="tile-palette">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <i className="fas fa-palette"></i>
          Tile Palette
        </h2>
        <Input
          type="text"
          placeholder="Search tiles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-sm"
          data-testid="input-tile-search"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <TileCategory title="Platforms">
          <TileItem
            type="platform-basic"
            label="Basic"
            color="bg-gradient-to-b from-gray-600 to-gray-700"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="platform-stone"
            label="Stone"
            color="bg-gradient-to-b from-gray-500 to-gray-600 border border-gray-700"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="platform-grass"
            label="Grass"
            color="bg-gradient-to-b from-green-600 to-green-700"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="platform-ice"
            label="Ice"
            color="bg-gradient-to-b from-cyan-300 to-cyan-400"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="platform-lava"
            label="Lava"
            color="bg-gradient-to-b from-orange-500 to-red-600"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="platform-metal"
            label="Metal"
            color="bg-gradient-to-b from-slate-400 to-slate-500"
            onDragStart={handleDragStart}
          />
        </TileCategory>

        <TileCategory title="Interactables">
          <TileItem
            type="button"
            label="Button"
            color="bg-secondary"
            icon="fas fa-circle text-red-500"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="door"
            label="Door"
            color="bg-secondary"
            icon="fas fa-door-open text-amber-600"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="lever"
            label="Lever"
            color="bg-secondary"
            icon="fas fa-toggle-off text-gray-500"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="teleport"
            label="Teleport"
            color="bg-secondary"
            icon="fas fa-portal text-purple-500"
            onDragStart={handleDragStart}
          />
        </TileCategory>

        <TileCategory title="Decorations">
          <TileItem
            type="tree"
            label="Tree"
            color="bg-secondary"
            icon="fas fa-tree text-green-600"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="rock"
            label="Rock"
            color="bg-secondary"
            icon="fas fa-mountain text-gray-600"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="coin"
            label="Coin"
            color="bg-secondary"
            icon="fas fa-coins text-yellow-500"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="checkpoint"
            label="Flag"
            color="bg-secondary"
            icon="fas fa-flag text-blue-500"
            onDragStart={handleDragStart}
          />
        </TileCategory>

        <TileCategory title="Spawn Points">
          <TileItem
            type="spawn-player"
            label="Player"
            color="bg-secondary"
            icon="fas fa-user text-primary"
            onDragStart={handleDragStart}
          />
          <TileItem
            type="spawn-enemy"
            label="Enemy"
            color="bg-secondary"
            icon="fas fa-skull text-destructive"
            onDragStart={handleDragStart}
          />
        </TileCategory>
      </div>
    </aside>
  );
}
