import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ButtonIcon from '@/assets/icons/button.svg?react';
import DoorIcon from '@/assets/icons/door.svg?react';
import LeverIcon from '@/assets/icons/lever.svg?react';
import TeleportIcon from '@/assets/icons/teleport.svg?react';
import PlayerIcon from '@/assets/icons/player.svg?react';
import EnemyIcon from '@/assets/icons/enemy.svg?react';

interface TileItemProps {
  type: string;
  label: string;
  color?: string;
  icon?: string | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isSelected: boolean;
  onSelect: (tileType: string) => void;
  usePlatformTexture?: boolean;
}

function TileItem({ type, label, color, icon, isSelected, onSelect, usePlatformTexture }: TileItemProps) {
  const IconComponent = typeof icon === 'function' ? icon : null;
  const iconString = typeof icon === 'string' ? icon : null;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (usePlatformTexture && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Draw platform texture based on type
      switch (type) {
        case 'platform-basic':
          drawPlatformBasic(ctx, width, height);
          break;
        case 'platform-stone':
          drawPlatformStone(ctx, width, height);
          break;
        case 'platform-grass':
          drawPlatformGrass(ctx, width, height);
          break;
        case 'platform-ice':
          drawPlatformIce(ctx, width, height);
          break;
        case 'platform-lava':
          drawPlatformLava(ctx, width, height);
          break;
        case 'platform-metal':
          drawPlatformMetal(ctx, width, height);
          break;
      }
    }
  }, [type, usePlatformTexture]);

  return (
    <div
      className={cn(
        "tile-item bg-secondary/60 backdrop-blur-sm border border-white/10 rounded p-2 text-center transition-all duration-150 cursor-pointer hover:transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl",
        isSelected && "ring-2 ring-primary shadow-[0_0_20px_rgba(59,130,246,0.4)]"
      )}
      data-tile-type={type}
      onClick={() => onSelect(type)}
      data-testid={`tile-${type}`}
      aria-selected={isSelected}
    >
      <div className={cn("w-full h-12 rounded mb-1 flex items-center justify-center overflow-hidden", !usePlatformTexture && color)}>
        {usePlatformTexture ? (
          <canvas ref={canvasRef} width={96} height={48} className="w-full h-full rounded" />
        ) : (
          <>
            {IconComponent ? <IconComponent className="w-8 h-8" /> : null}
            {iconString ? <i className={`${iconString} text-2xl`}></i> : null}
          </>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// Platform texture rendering functions (simplified versions for palette)
function drawPlatformBasic(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  const brickHeight = Math.max(4, height / 4);
  const brickWidth = Math.max(8, width / 6);

  for (let y = 0; y < height; y += brickHeight) {
    const offset = (Math.floor(y / brickHeight) % 2) * (brickWidth / 2);
    for (let x = -offset; x < width; x += brickWidth) {
      ctx.strokeRect(x, y, brickWidth, brickHeight);
    }
  }
}

function drawPlatformStone(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.3);
  ctx.lineTo(width * 0.6, height * 0.3);
  ctx.moveTo(width * 0.4, height * 0.7);
  ctx.lineTo(width, height * 0.7);
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(width * 0.1, height * 0.1, width * 0.3, height * 0.2);
}

function drawPlatformGrass(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#92400e';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#16a34a';
  ctx.fillRect(0, 0, width, height * 0.3);

  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = Math.max(1, width / 32);
  for (let x = width * 0.1; x < width; x += width * 0.15) {
    ctx.beginPath();
    ctx.moveTo(x, height * 0.3);
    ctx.lineTo(x, height * 0.05);
    ctx.stroke();
  }

  ctx.fillStyle = '#78350f';
  for (let i = 0; i < 5; i++) {
    const x = width * (i * 0.2 + 0.1);
    const y = height * 0.5 + (i % 2) * height * 0.2;
    ctx.fillRect(x, y, Math.max(1, width / 16), Math.max(1, height / 16));
  }
}

function drawPlatformIce(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#e0f2fe');
  gradient.addColorStop(1, '#67e8f9');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#0891b2';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width * 0.2, 0);
  ctx.lineTo(width * 0.3, height * 0.5);
  ctx.lineTo(width * 0.2, height);
  ctx.moveTo(width * 0.7, 0);
  ctx.lineTo(width * 0.6, height * 0.5);
  ctx.lineTo(width * 0.7, height);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(0, 0, width * 0.3, height * 0.2);
  ctx.fillRect(width * 0.6, height * 0.7, width * 0.3, height * 0.2);
}

function drawPlatformLava(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#dc2626';
  for (let x = 0; x < width; x += width / 4) {
    ctx.fillRect(x, 0, width / 6, height);
  }

  ctx.fillStyle = '#f97316';
  ctx.fillRect(width * 0.1, height * 0.2, width * 0.15, height * 0.6);
  ctx.fillRect(width * 0.6, height * 0.3, width * 0.1, height * 0.4);

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.5, Math.max(2, width / 16), 0, Math.PI * 2);
  ctx.arc(width * 0.7, height * 0.3, Math.max(2, width / 20), 0, Math.PI * 2);
  ctx.fill();
}

function drawPlatformMetal(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  const panelWidth = width / 3;
  for (let i = 0; i < 3; i++) {
    ctx.strokeRect(i * panelWidth, 0, panelWidth, height);
  }

  ctx.fillStyle = '#334155';
  const rivetSize = Math.max(2, width / 32);
  for (let i = 0; i < 3; i++) {
    const x = (i + 0.5) * panelWidth;
    ctx.beginPath();
    ctx.arc(x, height * 0.2, rivetSize, 0, Math.PI * 2);
    ctx.arc(x, height * 0.8, rivetSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.fillRect(0, 0, width, height * 0.15);
}

interface TileCategoryProps {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
}

function TileCategory({ title, children, accentColor = 'border-gray-500' }: TileCategoryProps) {
  return (
    <div className={`p-3 border-t border-border first:border-t-0 border-l-4 ${accentColor}`}>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {children}
      </div>
    </div>
  );
}

interface TilePaletteProps {
  selectedTileType: string | null;
  onTileSelect: (tileType: string) => void;
}

export function TilePalette({ selectedTileType, onTileSelect }: TilePaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <aside className="bg-card border-r border-border flex flex-col overflow-hidden" data-testid="tile-palette">
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
        <TileCategory title="Platforms" accentColor="border-gray-500">
          <TileItem
            type="platform-basic"
            label="Basic"
            usePlatformTexture
            isSelected={selectedTileType === 'platform-basic'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="platform-stone"
            label="Stone"
            usePlatformTexture
            isSelected={selectedTileType === 'platform-stone'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="platform-grass"
            label="Grass"
            usePlatformTexture
            isSelected={selectedTileType === 'platform-grass'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="platform-ice"
            label="Ice"
            usePlatformTexture
            isSelected={selectedTileType === 'platform-ice'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="platform-lava"
            label="Lava"
            usePlatformTexture
            isSelected={selectedTileType === 'platform-lava'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="platform-metal"
            label="Metal"
            usePlatformTexture
            isSelected={selectedTileType === 'platform-metal'}
            onSelect={onTileSelect}
          />
        </TileCategory>

        <TileCategory title="Interactables" accentColor="border-purple-500">
          <TileItem
            type="button"
            label="Button"
            color="bg-secondary"
            icon={ButtonIcon}
            isSelected={selectedTileType === 'button'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="door"
            label="Door"
            color="bg-secondary"
            icon={DoorIcon}
            isSelected={selectedTileType === 'door'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="lever"
            label="Lever"
            color="bg-secondary"
            icon={LeverIcon}
            isSelected={selectedTileType === 'lever'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="teleport"
            label="Teleport"
            color="bg-secondary"
            icon={TeleportIcon}
            isSelected={selectedTileType === 'teleport'}
            onSelect={onTileSelect}
          />
        </TileCategory>

        <TileCategory title="Decorations" accentColor="border-green-500">
          <TileItem
            type="tree"
            label="Tree"
            color="bg-secondary"
            icon="fas fa-tree text-green-600"
            isSelected={selectedTileType === 'tree'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="rock"
            label="Rock"
            color="bg-secondary"
            icon="fas fa-mountain text-gray-600"
            isSelected={selectedTileType === 'rock'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="coin"
            label="Coin"
            color="bg-secondary"
            icon="fas fa-coins text-yellow-500"
            isSelected={selectedTileType === 'coin'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="checkpoint"
            label="Flag"
            color="bg-secondary"
            icon="fas fa-flag text-blue-500"
            isSelected={selectedTileType === 'checkpoint'}
            onSelect={onTileSelect}
          />
        </TileCategory>

        <TileCategory title="Spawn Points" accentColor="border-blue-500">
          <TileItem
            type="spawn-player"
            label="Player"
            color="bg-secondary"
            icon={PlayerIcon}
            isSelected={selectedTileType === 'spawn-player'}
            onSelect={onTileSelect}
          />
          <TileItem
            type="spawn-enemy"
            label="Enemy"
            color="bg-secondary"
            icon={EnemyIcon}
            isSelected={selectedTileType === 'spawn-enemy'}
            onSelect={onTileSelect}
          />
        </TileCategory>
      </div>
    </aside>
  );
}
