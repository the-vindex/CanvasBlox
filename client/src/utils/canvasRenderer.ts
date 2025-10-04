import { Tile, InteractableObject, SpawnPoint, Position, LevelData, EditorState } from '@/types/level';
import { TILE_SIZE } from '@/constants/editor';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private gridSize = TILE_SIZE;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawBackground(backgroundColor: string) {
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawGrid(pan: Position, zoom: number, show: boolean) {
    if (!show) return;

    const { width, height } = this.ctx.canvas;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    const gridSpacing = this.gridSize * zoom;
    const offsetX = pan.x % gridSpacing;
    const offsetY = pan.y % gridSpacing;

    this.ctx.beginPath();
    for (let x = offsetX; x < width; x += gridSpacing) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }
    for (let y = offsetY; y < height; y += gridSpacing) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }
    this.ctx.stroke();
  }

  private drawPlatformBasic(width: number, height: number) {
    // Base color
    this.ctx.fillStyle = '#4b5563';
    this.ctx.fillRect(0, 0, width, height);

    // Add brick pattern
    this.ctx.strokeStyle = '#374151';
    this.ctx.lineWidth = 1;
    const brickHeight = Math.max(4, height / 4);
    const brickWidth = Math.max(8, width / 6);

    for (let y = 0; y < height; y += brickHeight) {
      const offset = (Math.floor(y / brickHeight) % 2) * (brickWidth / 2);
      for (let x = -offset; x < width; x += brickWidth) {
        this.ctx.strokeRect(x, y, brickWidth, brickHeight);
      }
    }
  }

  private drawPlatformStone(width: number, height: number) {
    // Base stone color
    this.ctx.fillStyle = '#6b7280';
    this.ctx.fillRect(0, 0, width, height);

    // Stone texture with cracks
    this.ctx.strokeStyle = '#4b5563';
    this.ctx.lineWidth = 1;

    // Horizontal cracks
    this.ctx.beginPath();
    this.ctx.moveTo(0, height * 0.3);
    this.ctx.lineTo(width * 0.6, height * 0.3);
    this.ctx.moveTo(width * 0.4, height * 0.7);
    this.ctx.lineTo(width, height * 0.7);
    this.ctx.stroke();

    // Add highlights
    this.ctx.fillStyle = '#9ca3af';
    this.ctx.fillRect(width * 0.1, height * 0.1, width * 0.3, height * 0.2);
  }

  private drawPlatformGrass(width: number, height: number) {
    // Dirt base
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(0, 0, width, height);

    // Grass top layer
    this.ctx.fillStyle = '#16a34a';
    this.ctx.fillRect(0, 0, width, height * 0.3);

    // Grass blades on top
    this.ctx.strokeStyle = '#22c55e';
    this.ctx.lineWidth = Math.max(1, width / 32);
    for (let x = width * 0.1; x < width; x += width * 0.15) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, height * 0.3);
      this.ctx.lineTo(x, height * 0.05);
      this.ctx.stroke();
    }

    // Dirt texture dots
    this.ctx.fillStyle = '#78350f';
    for (let i = 0; i < 5; i++) {
      const x = (width * (i * 0.2 + 0.1));
      const y = height * 0.5 + (i % 2) * height * 0.2;
      this.ctx.fillRect(x, y, Math.max(1, width / 16), Math.max(1, height / 16));
    }
  }

  private drawPlatformIce(width: number, height: number) {
    // Ice base with gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#e0f2fe');
    gradient.addColorStop(1, '#67e8f9');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Ice crystals/cracks
    this.ctx.strokeStyle = '#0891b2';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(width * 0.2, 0);
    this.ctx.lineTo(width * 0.3, height * 0.5);
    this.ctx.lineTo(width * 0.2, height);
    this.ctx.moveTo(width * 0.7, 0);
    this.ctx.lineTo(width * 0.6, height * 0.5);
    this.ctx.lineTo(width * 0.7, height);
    this.ctx.stroke();

    // Highlights for shine
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.fillRect(0, 0, width * 0.3, height * 0.2);
    this.ctx.fillRect(width * 0.6, height * 0.7, width * 0.3, height * 0.2);
  }

  private drawPlatformLava(width: number, height: number) {
    // Lava base
    this.ctx.fillStyle = '#991b1b';
    this.ctx.fillRect(0, 0, width, height);

    // Lava flows
    this.ctx.fillStyle = '#dc2626';
    this.ctx.beginPath();
    for (let x = 0; x < width; x += width / 4) {
      this.ctx.fillRect(x, 0, width / 6, height);
    }

    // Bright lava veins
    this.ctx.fillStyle = '#f97316';
    this.ctx.fillRect(width * 0.1, height * 0.2, width * 0.15, height * 0.6);
    this.ctx.fillRect(width * 0.6, height * 0.3, width * 0.1, height * 0.4);

    // Hot spots
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.arc(width * 0.2, height * 0.5, Math.max(2, width / 16), 0, Math.PI * 2);
    this.ctx.arc(width * 0.7, height * 0.3, Math.max(2, width / 20), 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawPlatformMetal(width: number, height: number) {
    // Metal base
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(0, 0, width, height);

    // Metal panels
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 2;
    const panelWidth = width / 3;
    for (let i = 0; i < 3; i++) {
      this.ctx.strokeRect(i * panelWidth, 0, panelWidth, height);
    }

    // Rivets
    this.ctx.fillStyle = '#334155';
    const rivetSize = Math.max(2, width / 32);
    for (let i = 0; i < 3; i++) {
      const x = (i + 0.5) * panelWidth;
      this.ctx.beginPath();
      this.ctx.arc(x, height * 0.2, rivetSize, 0, Math.PI * 2);
      this.ctx.arc(x, height * 0.8, rivetSize, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Metallic shine
    this.ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    this.ctx.fillRect(0, 0, width, height * 0.15);
  }

  drawTile(tile: Tile, pan: Position, zoom: number, isSelected = false) {
    // Convert tile position to pixel position
    const x = tile.position.x * TILE_SIZE * zoom + pan.x;
    const y = tile.position.y * TILE_SIZE * zoom + pan.y;
    const width = tile.dimensions.width * TILE_SIZE * zoom;
    const height = tile.dimensions.height * TILE_SIZE * zoom;

    this.ctx.save();

    // Apply rotation
    if (tile.rotation !== 0) {
      this.ctx.translate(x + width / 2, y + height / 2);
      this.ctx.rotate((tile.rotation * Math.PI) / 180);
      this.ctx.translate(-width / 2, -height / 2);
    } else {
      this.ctx.translate(x, y);
    }

    // Draw tile with textures based on type
    switch (tile.type) {
      case 'platform-basic':
        this.drawPlatformBasic(width, height);
        break;
      case 'platform-stone':
        this.drawPlatformStone(width, height);
        break;
      case 'platform-grass':
        this.drawPlatformGrass(width, height);
        break;
      case 'platform-ice':
        this.drawPlatformIce(width, height);
        break;
      case 'platform-lava':
        this.drawPlatformLava(width, height);
        break;
      case 'platform-metal':
        this.drawPlatformMetal(width, height);
        break;
      default:
        this.drawPlatformBasic(width, height);
    }

    // Draw selection outline
    if (isSelected) {
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(-2, -2, width + 4, height + 4);
    }

    this.ctx.restore();
  }

  private drawButton(width: number, height: number) {
    const radius = Math.min(width, height) / 2.5;

    // Button base (darker red)
    this.ctx.fillStyle = '#dc2626';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Button highlight (lighter red top)
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(0, -radius / 4, radius * 0.8, 0, Math.PI * 2);
    this.ctx.fill();

    // Button shine
    this.ctx.fillStyle = '#fca5a5';
    this.ctx.beginPath();
    this.ctx.arc(-radius / 3, -radius / 3, radius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawDoor(width: number, height: number) {
    // Door frame
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(-width / 2, -height / 2, width, height);

    // Door panels
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(-width / 2 + 2, -height / 2 + 2, width - 4, height / 2 - 3);
    this.ctx.fillRect(-width / 2 + 2, 1, width - 4, height / 2 - 3);

    // Door handle
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.arc(width / 3, 0, Math.min(width, height) / 8, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawLever(width: number, height: number) {
    // Base
    this.ctx.fillStyle = '#4b5563';
    this.ctx.fillRect(-width / 3, height / 3, width * 2 / 3, height / 6);

    // Pole
    this.ctx.fillStyle = '#6b7280';
    this.ctx.fillRect(-width / 12, -height / 2, width / 6, height);

    // Lever handle
    this.ctx.fillStyle = '#9ca3af';
    this.ctx.beginPath();
    this.ctx.arc(0, -height / 3, width / 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Lever knob
    this.ctx.fillStyle = '#dc2626';
    this.ctx.beginPath();
    this.ctx.arc(0, -height / 3, width / 6, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawTeleport(width: number, height: number) {
    const radius = Math.min(width, height) / 2.5;

    // Outer glow
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, '#a78bfa');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#6d28d9');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner portal
    this.ctx.fillStyle = '#c4b5fd';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    // Center bright spot
    this.ctx.fillStyle = '#ede9fe';
    this.ctx.beginPath();
    this.ctx.arc(-radius / 4, -radius / 4, radius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawTree(width: number, height: number) {
    // Tree trunk
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(-width / 6, -height / 4, width / 3, height / 2);

    // Trunk texture
    this.ctx.strokeStyle = '#78350f';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 12, -height / 6);
    this.ctx.lineTo(-width / 12, height / 4);
    this.ctx.stroke();

    // Tree foliage - bottom layer
    this.ctx.fillStyle = '#15803d';
    this.ctx.beginPath();
    this.ctx.arc(0, -height / 5, width / 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Tree foliage - middle layer
    this.ctx.fillStyle = '#16a34a';
    this.ctx.beginPath();
    this.ctx.arc(0, -height / 3, width / 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Tree foliage - top highlight
    this.ctx.fillStyle = '#22c55e';
    this.ctx.beginPath();
    this.ctx.arc(-width / 8, -height / 2.5, width / 5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawRock(width: number, height: number) {
    // Main rock body
    this.ctx.fillStyle = '#6b7280';
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 2, height / 4);
    this.ctx.lineTo(-width / 3, -height / 2);
    this.ctx.lineTo(width / 4, -height / 3);
    this.ctx.lineTo(width / 2, 0);
    this.ctx.lineTo(width / 3, height / 2);
    this.ctx.lineTo(-width / 4, height / 2);
    this.ctx.closePath();
    this.ctx.fill();

    // Rock highlights
    this.ctx.fillStyle = '#9ca3af';
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 4, -height / 4);
    this.ctx.lineTo(0, -height / 3);
    this.ctx.lineTo(width / 6, -height / 6);
    this.ctx.lineTo(0, 0);
    this.ctx.closePath();
    this.ctx.fill();

    // Rock shadow
    this.ctx.fillStyle = '#4b5563';
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 4, height / 4);
    this.ctx.lineTo(width / 3, height / 2);
    this.ctx.lineTo(0, height / 3);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawCoin(width: number, height: number) {
    const radius = Math.min(width, height) / 2.5;

    // Coin outer ring
    this.ctx.fillStyle = '#ca8a04';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Coin face
    this.ctx.fillStyle = '#eab308';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
    this.ctx.fill();

    // Coin highlight
    this.ctx.fillStyle = '#fde047';
    this.ctx.beginPath();
    this.ctx.arc(-radius / 3, -radius / 3, radius * 0.4, 0, Math.PI * 2);
    this.ctx.fill();

    // Coin symbol ($)
    this.ctx.strokeStyle = '#ca8a04';
    this.ctx.lineWidth = Math.max(1, radius / 8);
    this.ctx.font = `bold ${radius}px Arial`;
    this.ctx.fillStyle = '#ca8a04';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('$', 0, 0);
  }

  private drawCheckpoint(width: number, height: number) {
    // Flag pole
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(-width / 12, -height / 2, width / 6, height);

    // Flag
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.beginPath();
    this.ctx.moveTo(width / 12, -height / 2);
    this.ctx.lineTo(width / 2, -height / 3);
    this.ctx.lineTo(width / 12, -height / 6);
    this.ctx.closePath();
    this.ctx.fill();

    // Flag pattern
    this.ctx.fillStyle = '#60a5fa';
    this.ctx.fillRect(width / 12, -height / 2.5, width / 8, height / 12);
    this.ctx.fillRect(width / 4, -height / 2.8, width / 8, height / 12);

    // Pole top
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.arc(0, -height / 2, width / 10, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawObject(obj: InteractableObject, pan: Position, zoom: number, isSelected = false) {
    // Convert tile position to pixel position
    const x = obj.position.x * TILE_SIZE * zoom + pan.x;
    const y = obj.position.y * TILE_SIZE * zoom + pan.y;
    const width = obj.dimensions.width * TILE_SIZE * zoom;
    const height = obj.dimensions.height * TILE_SIZE * zoom;

    this.ctx.save();
    this.ctx.translate(x + width / 2, y + height / 2);

    // Apply rotation
    if (obj.rotation !== 0) {
      this.ctx.rotate((obj.rotation * Math.PI) / 180);
    }

    // Draw object based on type with detailed textures
    switch (obj.type) {
      case 'button':
        this.drawButton(width, height);
        break;
      case 'door':
        this.drawDoor(width, height);
        break;
      case 'lever':
        this.drawLever(width, height);
        break;
      case 'teleport':
        this.drawTeleport(width, height);
        break;
      case 'tree':
        this.drawTree(width, height);
        break;
      case 'rock':
        this.drawRock(width, height);
        break;
      case 'coin':
        this.drawCoin(width, height);
        break;
      case 'checkpoint':
        this.drawCheckpoint(width, height);
        break;
    }

    // Draw selection outline
    if (isSelected) {
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4);
    }

    this.ctx.restore();
  }

  drawSpawnPoint(spawn: SpawnPoint, pan: Position, zoom: number, isSelected = false) {
    // Convert tile position to pixel position
    const x = spawn.position.x * TILE_SIZE * zoom + pan.x;
    const y = spawn.position.y * TILE_SIZE * zoom + pan.y;
    const size = TILE_SIZE * zoom;

    this.ctx.save();
    this.ctx.translate(x, y);

    if (spawn.type === 'player') {
      this.ctx.fillStyle = '#3b82f6';
    } else {
      this.ctx.fillStyle = '#ef4444';
    }

    this.ctx.beginPath();
    this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw direction indicator
    this.ctx.fillStyle = '#ffffff';
    this.ctx.save();
    switch (spawn.facingDirection) {
      case 'right':
        this.ctx.translate(size / 4, 0);
        break;
      case 'left':
        this.ctx.translate(-size / 4, 0);
        break;
      case 'up':
        this.ctx.translate(0, -size / 4);
        break;
      case 'down':
        this.ctx.translate(0, size / 4);
        break;
    }
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size / 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // Draw selection outline
    if (isSelected) {
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(-size / 2 - 2, -size / 2 - 2, size + 4, size + 4);
    }

    this.ctx.restore();
  }

  drawLinks(objects: InteractableObject[], pan: Position, zoom: number) {
    this.ctx.strokeStyle = '#06b6d4';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    objects.forEach(obj => {
      if (obj.properties.linkedObjects) {
        const fromX = obj.position.x * TILE_SIZE * zoom + pan.x + (obj.dimensions.width * TILE_SIZE * zoom) / 2;
        const fromY = obj.position.y * TILE_SIZE * zoom + pan.y + (obj.dimensions.height * TILE_SIZE * zoom) / 2;

        obj.properties.linkedObjects.forEach(linkedId => {
          const linkedObj = objects.find(o => o.id === linkedId);
          if (linkedObj) {
            const toX = linkedObj.position.x * TILE_SIZE * zoom + pan.x + (linkedObj.dimensions.width * TILE_SIZE * zoom) / 2;
            const toY = linkedObj.position.y * TILE_SIZE * zoom + pan.y + (linkedObj.dimensions.height * TILE_SIZE * zoom) / 2;

            this.ctx.beginPath();
            this.ctx.moveTo(fromX, fromY);
            this.ctx.lineTo(toX, toY);
            this.ctx.stroke();
          }
        });
      }
    });

    this.ctx.setLineDash([]);
  }

  drawSelectionBox(start: Position, end: Position) {
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([3, 3]);
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';

    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.setLineDash([]);
  }

  render(levelData: LevelData, editorState: EditorState) {
    this.clear();
    this.drawBackground(levelData.metadata.backgroundColor);
    this.drawGrid(editorState.pan, editorState.zoom, editorState.showGrid);

    // Draw tiles
    levelData.tiles.forEach(tile => {
      const isSelected = editorState.selectedObjects.includes(tile.id);
      this.drawTile(tile, editorState.pan, editorState.zoom, isSelected);
    });

    // Draw objects
    levelData.objects.forEach(obj => {
      const isSelected = editorState.selectedObjects.includes(obj.id);
      this.drawObject(obj, editorState.pan, editorState.zoom, isSelected);
    });

    // Draw spawn points
    levelData.spawnPoints.forEach(spawn => {
      const isSelected = editorState.selectedObjects.includes(spawn.id);
      this.drawSpawnPoint(spawn, editorState.pan, editorState.zoom, isSelected);
    });

    // Draw links
    this.drawLinks(levelData.objects, editorState.pan, editorState.zoom);
  }
}
