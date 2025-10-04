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

    // Draw tile based on type
    switch (tile.type) {
      case 'platform-basic':
        this.ctx.fillStyle = '#4b5563';
        break;
      case 'platform-stone':
        this.ctx.fillStyle = '#6b7280';
        break;
      case 'platform-grass':
        this.ctx.fillStyle = '#16a34a';
        break;
      case 'platform-ice':
        this.ctx.fillStyle = '#67e8f9';
        break;
      case 'platform-lava':
        this.ctx.fillStyle = '#dc2626';
        break;
      case 'platform-metal':
        this.ctx.fillStyle = '#64748b';
        break;
      default:
        this.ctx.fillStyle = '#4b5563';
    }

    this.ctx.fillRect(0, 0, width, height);

    // Draw selection outline
    if (isSelected) {
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(-2, -2, width + 4, height + 4);
    }

    this.ctx.restore();
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

    // Draw object based on type
    switch (obj.type) {
      case 'button':
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, Math.min(width, height) / 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'door':
        this.ctx.fillStyle = '#d97706';
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        break;
      case 'lever':
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        break;
      case 'teleport':
        this.ctx.fillStyle = '#8b5cf6';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, Math.min(width, height) / 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'tree':
        this.ctx.fillStyle = '#16a34a';
        this.ctx.fillRect(-width / 4, -height / 2, width / 2, height);
        this.ctx.fillStyle = '#15803d';
        this.ctx.beginPath();
        this.ctx.arc(0, -height / 4, width / 3, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'rock':
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        break;
      case 'coin':
        this.ctx.fillStyle = '#eab308';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, Math.min(width, height) / 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'checkpoint':
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(-width / 8, -height / 2, width / 4, height);
        this.ctx.fillStyle = '#2563eb';
        this.ctx.fillRect(-width / 2, -height / 3, width, height / 6);
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
