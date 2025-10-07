import { TILE_SIZE } from '@/constants/editor';
import type { EditorState, InteractableObject, LevelData, Position, SpawnPoint, Tile } from '@/types/level';
import { calculateLuminance, getBadgeColorScheme, getButtonsLinkingToDoor } from './buttonNumbering';
import { getLinePositions } from './lineDrawing';
import { getRectanglePositions } from './rectangleDrawing';

export class CanvasRenderer {
    private ctx: CanvasRenderingContext2D;
    private gridSize = TILE_SIZE;
    private editorState?: EditorState;
    private levelData?: LevelData;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawBackground(backgroundColor: string) {
        if (backgroundColor === 'transparent') {
            return; // Skip filling - let wrapper background show through
        }
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
            const x = width * (i * 0.2 + 0.1);
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

    drawTile(tile: Tile, pan: Position, zoom: number, isSelected = false, isDeleting = false) {
        // Convert tile position to pixel position
        const x = tile.position.x * TILE_SIZE * zoom + pan.x;
        const y = tile.position.y * TILE_SIZE * zoom + pan.y;
        const width = tile.dimensions.width * TILE_SIZE * zoom;
        const height = tile.dimensions.height * TILE_SIZE * zoom;

        this.ctx.save();

        // Apply delete animation effect (shrink from 1.0 to 0.0 over 250ms)
        let isAnimatingDelete = false;
        let scale = 1.0;
        if (isDeleting && this.editorState?.deletionStartTimes?.has(tile.id)) {
            const startTime = this.editorState.deletionStartTimes.get(tile.id)!;
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 250, 1.0); // 250ms animation
            scale = Math.max(1.0 - progress, 0.01); // Shrink from 1.0 to 0.01 (avoid 0 which breaks rendering)
            isAnimatingDelete = true;

            // Also fade out
            this.ctx.globalAlpha = scale;
        }

        // Translate to center for scaling/rotation
        this.ctx.translate(x + width / 2, y + height / 2);

        // Apply scale for delete animation
        if (isAnimatingDelete) {
            this.ctx.scale(scale, scale);
        }

        // Apply rotation
        if (tile.rotation !== 0) {
            this.ctx.rotate((tile.rotation * Math.PI) / 180);
        }

        // Translate back to top-left for drawing
        this.ctx.translate(-width / 2, -height / 2);

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

        // Draw selection outline with high contrast
        if (isSelected) {
            this.drawHighContrastSelection(-2, -2, width + 4, height + 4);
        }

        this.ctx.restore();
    }

    private drawButton(width: number, height: number) {
        const buttonWidth = Math.min(width, height) * 0.7;
        const buttonHeight = buttonWidth * 0.4;
        const baseHeight = buttonHeight * 0.3;

        // Platform/base (gray metal)
        this.ctx.fillStyle = '#52525b';
        this.ctx.fillRect(-buttonWidth * 0.6, baseHeight, buttonWidth * 1.2, baseHeight * 2);

        // Base outline
        this.ctx.strokeStyle = '#27272a';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-buttonWidth * 0.6, baseHeight, buttonWidth * 1.2, baseHeight * 2);

        // Base screws
        this.ctx.fillStyle = '#3f3f46';
        this.ctx.beginPath();
        this.ctx.arc(-buttonWidth * 0.45, baseHeight + baseHeight, baseHeight * 0.4, 0, Math.PI * 2);
        this.ctx.arc(buttonWidth * 0.45, baseHeight + baseHeight, baseHeight * 0.4, 0, Math.PI * 2);
        this.ctx.fill();

        // Button shadow/depth
        this.ctx.fillStyle = '#991b1b';
        this.ctx.beginPath();
        this.ctx.ellipse(0, baseHeight * 0.8, buttonWidth / 2, buttonHeight / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Main button body (red)
        this.ctx.fillStyle = '#dc2626';
        this.ctx.beginPath();
        this.ctx.ellipse(0, -buttonHeight / 4, buttonWidth / 2, buttonHeight / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Button top surface (brighter red)
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.ellipse(0, -buttonHeight * 0.6, buttonWidth * 0.42, buttonHeight * 0.35, 0, 0, Math.PI);
        this.ctx.fill();

        // Button outline
        this.ctx.strokeStyle = '#991b1b';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(0, -buttonHeight / 4, buttonWidth / 2, buttonHeight / 2, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        // Button shine/highlight
        this.ctx.fillStyle = 'rgba(252, 165, 165, 0.6)';
        this.ctx.beginPath();
        this.ctx.ellipse(-buttonWidth / 6, -buttonHeight * 0.5, buttonWidth / 6, buttonHeight / 6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Center indicator dot
        this.ctx.fillStyle = '#fca5a5';
        this.ctx.beginPath();
        this.ctx.arc(0, -buttonHeight / 4, buttonWidth * 0.08, 0, Math.PI * 2);
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
        this.ctx.fillRect(-width / 3, height / 3, (width * 2) / 3, height / 6);

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
        const size = Math.min(width, height);
        const platformWidth = size * 0.8;
        const platformHeight = size * 0.15;
        const portalRadius = size * 0.35;

        // Platform base (dark gray metal)
        this.ctx.fillStyle = '#3f3f46';
        this.ctx.fillRect(-platformWidth / 2, platformHeight, platformWidth, platformHeight * 1.5);

        // Platform top edge (lighter)
        this.ctx.fillStyle = '#52525b';
        this.ctx.fillRect(-platformWidth / 2, platformHeight - 2, platformWidth, 4);

        // Platform details/lines
        this.ctx.strokeStyle = '#27272a';
        this.ctx.lineWidth = 1;
        for (let i = -3; i <= 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo((i * platformWidth) / 8, platformHeight);
            this.ctx.lineTo((i * platformWidth) / 8, platformHeight * 2.5);
            this.ctx.stroke();
        }

        // Portal ring/frame (metallic purple)
        this.ctx.strokeStyle = '#7c3aed';
        this.ctx.lineWidth = Math.max(3, size * 0.08);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, portalRadius + size * 0.05, 0, Math.PI * 2);
        this.ctx.stroke();

        // Portal ring highlights
        this.ctx.strokeStyle = '#a78bfa';
        this.ctx.lineWidth = Math.max(1.5, size * 0.04);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, portalRadius + size * 0.05, Math.PI * 0.2, Math.PI * 0.8);
        this.ctx.stroke();

        // Portal swirl gradient
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, portalRadius);
        gradient.addColorStop(0, '#ede9fe');
        gradient.addColorStop(0.3, '#c4b5fd');
        gradient.addColorStop(0.6, '#a78bfa');
        gradient.addColorStop(1, '#7c3aed');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, portalRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Swirl effect (spiral pattern)
        this.ctx.strokeStyle = '#8b5cf6';
        this.ctx.lineWidth = Math.max(2, size * 0.05);
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, portalRadius * 0.7, angle, angle + Math.PI * 0.6);
            this.ctx.stroke();
        }

        // Inner bright core (swirling)
        const coreGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, portalRadius * 0.4);
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.5, '#ede9fe');
        coreGradient.addColorStop(1, 'rgba(237, 233, 254, 0)');
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, portalRadius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();

        // Energy particles (small dots around portal)
        this.ctx.fillStyle = '#c4b5fd';
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const x = Math.cos(angle) * portalRadius * 0.85;
            const y = Math.sin(angle) * portalRadius * 0.85;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 0.02, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Glow effect around portal
        this.ctx.shadowColor = '#a78bfa';
        this.ctx.shadowBlur = size * 0.15;
        this.ctx.strokeStyle = '#a78bfa';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, portalRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
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

    /**
     * Draw a numbered badge (for buttons)
     * Badge maintains constant screen size regardless of zoom
     */
    private drawBadge(buttonNumber: number, _width: number, height: number, _zoom: number, _objectType: string) {
        // Calculate background color of button for adaptive contrast
        // Red button: #dc2626 -> RGB(220, 38, 38)
        const bgLuminance = calculateLuminance(220, 38, 38);
        const scheme = getBadgeColorScheme(bgLuminance);

        // Badge size in screen pixels (constant regardless of zoom)
        const badgeSize = 24; // Diameter in pixels
        const badgeRadius = badgeSize / 2;

        // Get current transformation to calculate screen position
        // We're already translated to object center, so transform (0, -height/2) to get top-center
        const topCenterLocal = { x: 0, y: -height / 2 };
        const transform = this.ctx.getTransform();
        const screenX = transform.a * topCenterLocal.x + transform.c * topCenterLocal.y + transform.e;
        const screenY = transform.b * topCenterLocal.x + transform.d * topCenterLocal.y + transform.f;

        // Save current transformation state
        this.ctx.save();

        // Reset transformations to draw in screen space (constant size)
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw badge circle
        this.ctx.fillStyle = scheme.bg;
        this.ctx.globalAlpha = scheme.opacity;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY - badgeRadius, badgeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw badge border
        this.ctx.strokeStyle = scheme.text;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY - badgeRadius, badgeRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw number text
        this.ctx.fillStyle = scheme.text;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(buttonNumber.toString(), screenX, screenY - badgeRadius);

        // Restore transformation
        this.ctx.restore();
    }

    /**
     * Draw door badge showing linked button count
     * Shows single button number or "×N" for multiple buttons
     */
    private drawDoorBadge(linkedButtons: InteractableObject[], _width: number, height: number, _zoom: number) {
        // Calculate background color of door for adaptive contrast
        // Orange door: #d97706 -> RGB(217, 119, 6)
        const bgLuminance = calculateLuminance(217, 119, 6);
        const scheme = getBadgeColorScheme(bgLuminance);

        // Badge size in screen pixels (constant regardless of zoom)
        const badgeSize = 24; // Diameter in pixels
        const badgeRadius = badgeSize / 2;

        // Determine badge text
        let badgeText: string;
        if (linkedButtons.length === 1) {
            // Show single button number
            badgeText = (linkedButtons[0]?.properties.buttonNumber ?? '?').toString();
        } else {
            // Show count with "×" prefix
            badgeText = `×${linkedButtons.length}`;
        }

        // Get current transformation to calculate screen position
        // We're already translated to object center, so transform (0, -height/2) to get top-center
        const topCenterLocal = { x: 0, y: -height / 2 };
        const transform = this.ctx.getTransform();
        const screenX = transform.a * topCenterLocal.x + transform.c * topCenterLocal.y + transform.e;
        const screenY = transform.b * topCenterLocal.x + transform.d * topCenterLocal.y + transform.f;

        // Save current transformation state
        this.ctx.save();

        // Reset transformations to draw in screen space (constant size)
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw badge circle
        this.ctx.fillStyle = scheme.bg;
        this.ctx.globalAlpha = scheme.opacity;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY - badgeRadius, badgeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw badge border
        this.ctx.strokeStyle = scheme.text;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY - badgeRadius, badgeRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw badge text
        this.ctx.fillStyle = scheme.text;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(badgeText, screenX, screenY - badgeRadius);

        // Restore transformation
        this.ctx.restore();
    }

    /**
     * Calculate delete animation scale
     */
    private getDeleteAnimationScale(objId: string): { scale: number; isAnimating: boolean } {
        if (!this.editorState?.deletionStartTimes?.has(objId)) {
            return { scale: 1.0, isAnimating: false };
        }

        const startTime = this.editorState.deletionStartTimes.get(objId)!;
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 250, 1.0); // 250ms animation
        const scale = Math.max(1.0 - progress, 0.01); // Avoid 0 which breaks rendering

        return { scale, isAnimating: true };
    }

    /**
     * Draw object sprite based on type
     */
    private drawObjectSprite(type: string, width: number, height: number) {
        switch (type) {
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
    }

    /**
     * Draw badges for buttons and doors
     */
    private drawObjectBadges(obj: InteractableObject, width: number, height: number, zoom: number) {
        if (obj.type === 'button' && obj.properties.buttonNumber !== undefined) {
            this.drawBadge(obj.properties.buttonNumber, width, height, zoom, obj.type);
        } else if (obj.type === 'door') {
            const linkedButtons = getButtonsLinkingToDoor(obj, this.levelData?.objects || []);
            if (linkedButtons.length > 0) {
                this.drawDoorBadge(linkedButtons, width, height, zoom);
            }
        }
    }

    drawObject(obj: InteractableObject, pan: Position, zoom: number, isSelected = false, isDeleting = false) {
        // Convert tile position to pixel position
        const x = obj.position.x * TILE_SIZE * zoom + pan.x;
        const y = obj.position.y * TILE_SIZE * zoom + pan.y;
        const width = obj.dimensions.width * TILE_SIZE * zoom;
        const height = obj.dimensions.height * TILE_SIZE * zoom;

        this.ctx.save();

        // Apply delete animation
        const { scale, isAnimating } = isDeleting
            ? this.getDeleteAnimationScale(obj.id)
            : { scale: 1.0, isAnimating: false };
        if (isAnimating) {
            this.ctx.globalAlpha = scale;
        }

        this.ctx.translate(x + width / 2, y + height / 2);

        if (isAnimating) {
            this.ctx.scale(scale, scale);
        }

        if (obj.rotation !== 0) {
            this.ctx.rotate((obj.rotation * Math.PI) / 180);
        }

        // Draw sprite
        this.drawObjectSprite(obj.type, width, height);

        // Draw badges (not during deletion)
        if (!isDeleting) {
            this.drawObjectBadges(obj, width, height, zoom);
        }

        // Draw selection outline
        if (isSelected) {
            this.drawHighContrastSelection(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4);
        }

        this.ctx.restore();
    }

    private drawPlayerCharacter(size: number, facingDirection: string) {
        const scale = size / 32; // Base scale for proportions

        // Head (blocky, Roblox-style)
        this.ctx.fillStyle = '#fbbf24'; // Yellow skin tone
        this.ctx.fillRect(-4 * scale, -14 * scale, 8 * scale, 8 * scale);

        // Head outline
        this.ctx.strokeStyle = '#d97706';
        this.ctx.lineWidth = Math.max(1, scale);
        this.ctx.strokeRect(-4 * scale, -14 * scale, 8 * scale, 8 * scale);

        // Eyes
        this.ctx.fillStyle = '#000000';
        if (facingDirection === 'left') {
            this.ctx.fillRect(-3 * scale, -12 * scale, 2 * scale, 2 * scale);
            this.ctx.fillRect(0 * scale, -12 * scale, 1.5 * scale, 2 * scale);
        } else {
            this.ctx.fillRect(-2 * scale, -12 * scale, 2 * scale, 2 * scale);
            this.ctx.fillRect(1 * scale, -12 * scale, 2 * scale, 2 * scale);
        }

        // Smile
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = Math.max(1, scale * 0.8);
        this.ctx.beginPath();
        this.ctx.arc(0, -8.5 * scale, 2 * scale, 0, Math.PI);
        this.ctx.stroke();

        // Body (torso - bright blue like default Roblox)
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(-5 * scale, -5 * scale, 10 * scale, 10 * scale);

        // Body outline
        this.ctx.strokeStyle = '#1e40af';
        this.ctx.lineWidth = Math.max(1, scale);
        this.ctx.strokeRect(-5 * scale, -5 * scale, 10 * scale, 10 * scale);

        // Arms
        this.ctx.fillStyle = '#fbbf24';
        // Left arm
        this.ctx.fillRect(-8 * scale, -4 * scale, 3 * scale, 8 * scale);
        // Right arm
        this.ctx.fillRect(5 * scale, -4 * scale, 3 * scale, 8 * scale);

        // Legs (green pants)
        this.ctx.fillStyle = '#22c55e';
        // Left leg
        this.ctx.fillRect(-4 * scale, 5 * scale, 4 * scale, 9 * scale);
        // Right leg
        this.ctx.fillRect(0 * scale, 5 * scale, 4 * scale, 9 * scale);

        // Direction indicator arrow
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = Math.max(1, scale * 0.5);

        this.ctx.save();
        switch (facingDirection) {
            case 'right':
                this.ctx.translate(10 * scale, -10 * scale);
                this.ctx.rotate(Math.PI / 2);
                break;
            case 'left':
                this.ctx.translate(-10 * scale, -10 * scale);
                this.ctx.rotate(-Math.PI / 2);
                break;
            case 'up':
                this.ctx.translate(0, -18 * scale);
                break;
            case 'down':
                this.ctx.translate(0, 18 * scale);
                this.ctx.rotate(Math.PI);
                break;
        }

        // Draw arrow
        this.ctx.beginPath();
        this.ctx.moveTo(0, -3 * scale);
        this.ctx.lineTo(-2 * scale, -1 * scale);
        this.ctx.lineTo(2 * scale, -1 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }

    private drawEnemyCharacter(size: number, facingDirection: string) {
        const scale = size / 32; // Base scale for proportions

        // Head (zombie green)
        this.ctx.fillStyle = '#4d7c0f'; // Dark green zombie skin
        this.ctx.fillRect(-4 * scale, -14 * scale, 8 * scale, 8 * scale);

        // Head outline and cracks
        this.ctx.strokeStyle = '#365314';
        this.ctx.lineWidth = Math.max(1, scale);
        this.ctx.strokeRect(-4 * scale, -14 * scale, 8 * scale, 8 * scale);

        // Facial cracks/scars
        this.ctx.beginPath();
        this.ctx.moveTo(-3 * scale, -13 * scale);
        this.ctx.lineTo(-1 * scale, -11 * scale);
        this.ctx.stroke();

        // Eyes (glowing red, menacing)
        this.ctx.fillStyle = '#dc2626';
        if (facingDirection === 'left') {
            this.ctx.fillRect(-3 * scale, -12 * scale, 2 * scale, 2 * scale);
            this.ctx.fillRect(0 * scale, -12 * scale, 1.5 * scale, 2 * scale);
        } else {
            this.ctx.fillRect(-2 * scale, -12 * scale, 2 * scale, 2 * scale);
            this.ctx.fillRect(1 * scale, -12 * scale, 2 * scale, 2 * scale);
        }

        // Frown/grimace
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = Math.max(1, scale * 0.8);
        this.ctx.beginPath();
        this.ctx.arc(0, -7 * scale, 2 * scale, Math.PI, Math.PI * 2);
        this.ctx.stroke();

        // Teeth
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(-1.5 * scale, -7.5 * scale, 1 * scale, 1.5 * scale);
        this.ctx.fillRect(0.5 * scale, -7.5 * scale, 1 * scale, 1.5 * scale);

        // Body (torn shirt - dark gray)
        this.ctx.fillStyle = '#52525b';
        this.ctx.fillRect(-5 * scale, -5 * scale, 10 * scale, 10 * scale);

        // Body outline and tears
        this.ctx.strokeStyle = '#27272a';
        this.ctx.lineWidth = Math.max(1, scale);
        this.ctx.strokeRect(-5 * scale, -5 * scale, 10 * scale, 10 * scale);

        // Torn edges
        this.ctx.beginPath();
        this.ctx.moveTo(-5 * scale, 0);
        this.ctx.lineTo(-3 * scale, 2 * scale);
        this.ctx.lineTo(-5 * scale, 4 * scale);
        this.ctx.stroke();

        // Arms (zombie skin)
        this.ctx.fillStyle = '#4d7c0f';
        // Left arm (hanging loosely)
        this.ctx.fillRect(-8 * scale, -4 * scale, 3 * scale, 9 * scale);
        // Right arm
        this.ctx.fillRect(5 * scale, -3 * scale, 3 * scale, 8 * scale);

        // Legs (torn pants - brown)
        this.ctx.fillStyle = '#78350f';
        // Left leg
        this.ctx.fillRect(-4 * scale, 5 * scale, 4 * scale, 9 * scale);
        // Right leg
        this.ctx.fillRect(0 * scale, 5 * scale, 4 * scale, 9 * scale);

        // Direction indicator arrow (red for enemy)
        this.ctx.fillStyle = '#ef4444';
        this.ctx.strokeStyle = '#7f1d1d';
        this.ctx.lineWidth = Math.max(1, scale * 0.5);

        this.ctx.save();
        switch (facingDirection) {
            case 'right':
                this.ctx.translate(10 * scale, -10 * scale);
                this.ctx.rotate(Math.PI / 2);
                break;
            case 'left':
                this.ctx.translate(-10 * scale, -10 * scale);
                this.ctx.rotate(-Math.PI / 2);
                break;
            case 'up':
                this.ctx.translate(0, -18 * scale);
                break;
            case 'down':
                this.ctx.translate(0, 18 * scale);
                this.ctx.rotate(Math.PI);
                break;
        }

        // Draw arrow
        this.ctx.beginPath();
        this.ctx.moveTo(0, -3 * scale);
        this.ctx.lineTo(-2 * scale, -1 * scale);
        this.ctx.lineTo(2 * scale, -1 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawSpawnPoint(spawn: SpawnPoint, pan: Position, zoom: number, isSelected = false, isDeleting = false) {
        // Convert tile position to pixel position
        const x = spawn.position.x * TILE_SIZE * zoom + pan.x;
        const y = spawn.position.y * TILE_SIZE * zoom + pan.y;
        const size = TILE_SIZE * zoom;

        this.ctx.save();

        // Apply delete animation effect (shrink from 1.0 to 0.0 over 250ms)
        let isAnimatingDelete = false;
        let scale = 1.0;
        if (isDeleting && this.editorState?.deletionStartTimes?.has(spawn.id)) {
            const startTime = this.editorState.deletionStartTimes.get(spawn.id)!;
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 250, 1.0); // 250ms animation
            scale = Math.max(1.0 - progress, 0.01); // Shrink from 1.0 to 0.01 (avoid 0 which breaks rendering)
            isAnimatingDelete = true;

            // Also fade out
            this.ctx.globalAlpha = scale;
        }

        // Translate to center for scaling
        this.ctx.translate(x + size / 2, y + size / 2);

        // Apply scale for delete animation
        if (isAnimatingDelete) {
            this.ctx.scale(scale, scale);
        }

        // Translate back to top-left for drawing
        this.ctx.translate(-size / 2, -size / 2);

        if (spawn.type === 'player') {
            this.drawPlayerCharacter(size, spawn.facingDirection);
        } else {
            this.drawEnemyCharacter(size, spawn.facingDirection);
        }

        // Draw selection outline with high contrast
        if (isSelected) {
            this.drawHighContrastSelection(-size / 2 - 2, -size / 2 - 2, size + 4, size + 4);
        }

        this.ctx.restore();
    }

    drawLinks(objects: InteractableObject[], pan: Position, zoom: number) {
        objects.forEach((obj) => {
            if (obj.properties.linkedObjects) {
                const fromX = obj.position.x * TILE_SIZE * zoom + pan.x + (obj.dimensions.width * TILE_SIZE * zoom) / 2;
                const fromY =
                    obj.position.y * TILE_SIZE * zoom + pan.y + (obj.dimensions.height * TILE_SIZE * zoom) / 2;

                obj.properties.linkedObjects.forEach((linkedId) => {
                    const linkedObj = objects.find((o) => o.id === linkedId);
                    if (linkedObj) {
                        const toX =
                            linkedObj.position.x * TILE_SIZE * zoom +
                            pan.x +
                            (linkedObj.dimensions.width * TILE_SIZE * zoom) / 2;
                        const toY =
                            linkedObj.position.y * TILE_SIZE * zoom +
                            pan.y +
                            (linkedObj.dimensions.height * TILE_SIZE * zoom) / 2;

                        // Draw dark outline for contrast
                        this.ctx.strokeStyle = '#000000';
                        this.ctx.lineWidth = 5;
                        this.ctx.setLineDash([8, 6]);
                        this.ctx.beginPath();
                        this.ctx.moveTo(fromX, fromY);
                        this.ctx.lineTo(toX, toY);
                        this.ctx.stroke();

                        // Draw bright yellow link line on top
                        this.ctx.strokeStyle = '#fbbf24'; // Bright amber/yellow
                        this.ctx.lineWidth = 3;
                        this.ctx.setLineDash([8, 6]);
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

    /**
     * Draw high-contrast selection outline that's visible on any background
     * Uses white outline with black border for maximum visibility
     * @param x - X coordinate of top-left corner
     * @param y - Y coordinate of top-left corner
     * @param width - Width of the outline
     * @param height - Height of the outline
     */
    private drawHighContrastSelection(x: number, y: number, width: number, height: number) {
        // Pulsing glow effect (starts at full brightness, oscillates between 0.7 and 1.0)
        const time = Date.now() / 1000;
        const glowOpacity = 0.85 + 0.15 * Math.sin(time * Math.PI * 2); // Oscillates between 0.7 and 1.0, faster cycle

        // Draw black outer stroke for border (makes outline visible on light backgrounds)
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 4;
        this.ctx.globalAlpha = glowOpacity * 0.8;
        this.ctx.strokeRect(x, y, width, height);

        // Draw white inner stroke (makes outline visible on dark backgrounds)
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 12;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = glowOpacity;
        this.ctx.strokeRect(x, y, width, height);

        // Reset shadow and alpha
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }

    drawSelectionBox(start: Position, end: Position, pan: Position = { x: 0, y: 0 }, zoom: number = 1) {
        // Convert tile positions to pixel positions
        const minX = Math.min(start.x, end.x) * TILE_SIZE * zoom + pan.x;
        const minY = Math.min(start.y, end.y) * TILE_SIZE * zoom + pan.y;
        const maxX = Math.max(start.x, end.x) * TILE_SIZE * zoom + pan.x;
        const maxY = Math.max(start.y, end.y) * TILE_SIZE * zoom + pan.y;
        const width = maxX - minX + TILE_SIZE * zoom;
        const height = maxY - minY + TILE_SIZE * zoom;

        this.ctx.save();

        // Draw semi-transparent fill
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        this.ctx.fillRect(minX, minY, width, height);

        // Draw dashed border
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(minX, minY, width, height);

        this.ctx.restore();
    }

    drawPreviewTile(position: Position, tileType: string, pan: Position, zoom: number) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;

        const x = position.x * TILE_SIZE * zoom + pan.x;
        const y = position.y * TILE_SIZE * zoom + pan.y;
        const width = TILE_SIZE * zoom;
        const height = TILE_SIZE * zoom;

        this.ctx.translate(x, y);

        // Draw preview based on tile type
        if (tileType.includes('platform')) {
            switch (tileType) {
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
        } else if (tileType.startsWith('spawn-')) {
            this.ctx.translate(width / 2, height / 2);
            if (tileType === 'spawn-player') {
                this.drawPlayerCharacter(width, 'right');
            } else {
                this.drawEnemyCharacter(width, 'right');
            }
        } else {
            // Draw object previews
            this.ctx.translate(width / 2, height / 2);
            switch (tileType) {
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
        }

        this.ctx.restore();
    }

    /**
     * Generic method to draw preview for any shape (line, rectangle, etc.)
     * @param positions - Array of grid positions to preview
     * @param tileType - Type of tile to preview
     * @param pan - Current pan offset
     * @param zoom - Current zoom level
     */
    private drawPreviewShape(positions: Position[], tileType: string, pan: Position, zoom: number) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;

        for (const position of positions) {
            this.drawPreviewTile(position, tileType, pan, zoom);
        }

        this.ctx.restore();
    }

    drawPreviewLine(start: Position, end: Position, tileType: string, pan: Position, zoom: number) {
        const positions = getLinePositions(start, end);
        this.drawPreviewShape(positions, tileType, pan, zoom);
    }

    drawPreviewRectangle(start: Position, end: Position, tileType: string, pan: Position, zoom: number) {
        const positions = getRectanglePositions(start, end, true); // filled=true
        this.drawPreviewShape(positions, tileType, pan, zoom);
    }

    private drawGhostTile(tile: Tile, delta: Position, pan: Position, zoom: number) {
        const ghostTile = {
            ...tile,
            position: {
                x: tile.position.x + delta.x,
                y: tile.position.y + delta.y,
            },
        };

        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        this.drawTile(ghostTile, pan, zoom, false, false);
        this.ctx.restore();
    }

    private drawGhostObject(obj: InteractableObject, delta: Position, pan: Position, zoom: number) {
        const ghostObj = {
            ...obj,
            position: {
                x: obj.position.x + delta.x,
                y: obj.position.y + delta.y,
            },
        };

        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        this.drawObject(ghostObj, pan, zoom, false, false);
        this.ctx.restore();
    }

    private drawGhostSpawnPoint(spawn: SpawnPoint, delta: Position, pan: Position, zoom: number) {
        const ghostSpawn = {
            ...spawn,
            position: {
                x: spawn.position.x + delta.x,
                y: spawn.position.y + delta.y,
            },
        };

        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        this.drawSpawnPoint(ghostSpawn, pan, zoom, false, false);
        this.ctx.restore();
    }

    private drawPastePreview(
        pastePreview: {
            items: (Tile | InteractableObject | SpawnPoint)[];
        },
        mousePosition: Position,
        pan: Position,
        zoom: number
    ) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;

        pastePreview.items.forEach((item) => {
            // Items are already normalized (top-left at 0,0), just add mouse position
            const ghostItem = {
                ...item,
                position: {
                    x: mousePosition.x + item.position.x,
                    y: mousePosition.y + item.position.y,
                },
            };

            // Determine item type and draw accordingly
            if ('properties' in item && 'collidable' in item.properties) {
                // It's a tile
                this.drawTile(ghostItem as Tile, pan, zoom, false, false);
            } else if ('facingDirection' in item) {
                // It's a spawn point
                this.drawSpawnPoint(ghostItem as SpawnPoint, pan, zoom, false, false);
            } else {
                // It's an object
                this.drawObject(ghostItem as InteractableObject, pan, zoom, false, false);
            }
        });

        this.ctx.restore();
    }

    render(levelData: LevelData, editorState: EditorState) {
        this.editorState = editorState; // Store for use in draw methods
        this.levelData = levelData; // Store for use in draw methods
        this.clear();
        this.drawBackground(levelData.metadata.backgroundColor);
        this.drawGrid(editorState.pan, editorState.zoom, editorState.showGrid);

        // Draw tiles
        levelData.tiles.forEach((tile) => {
            const isSelected = editorState.selectedObjects.includes(tile.id);
            const isDeleting = editorState.deletingObjects.includes(tile.id);

            // If moving, draw original at reduced opacity
            if (isSelected && editorState.moveDelta) {
                this.ctx.save();
                this.ctx.globalAlpha = 0.3;
                this.drawTile(tile, editorState.pan, editorState.zoom, false, isDeleting);
                this.ctx.restore();
            } else {
                this.drawTile(tile, editorState.pan, editorState.zoom, isSelected, isDeleting);
            }
        });

        // Draw objects
        levelData.objects.forEach((obj) => {
            const isSelected = editorState.selectedObjects.includes(obj.id);
            const isDeleting = editorState.deletingObjects.includes(obj.id);

            // If moving, draw original at reduced opacity
            if (isSelected && editorState.moveDelta) {
                this.ctx.save();
                this.ctx.globalAlpha = 0.3;
                this.drawObject(obj, editorState.pan, editorState.zoom, false, isDeleting);
                this.ctx.restore();
            } else {
                this.drawObject(obj, editorState.pan, editorState.zoom, isSelected, isDeleting);
            }
        });

        // Draw spawn points
        levelData.spawnPoints.forEach((spawn) => {
            const isSelected = editorState.selectedObjects.includes(spawn.id);
            const isDeleting = editorState.deletingObjects.includes(spawn.id);

            // If moving, draw original at reduced opacity
            if (isSelected && editorState.moveDelta) {
                this.ctx.save();
                this.ctx.globalAlpha = 0.3;
                this.drawSpawnPoint(spawn, editorState.pan, editorState.zoom, false, isDeleting);
                this.ctx.restore();
            } else {
                this.drawSpawnPoint(spawn, editorState.pan, editorState.zoom, isSelected, isDeleting);
            }
        });

        // Draw ghost previews if moving
        if (editorState.moveDelta) {
            levelData.tiles.forEach((tile) => {
                if (editorState.selectedObjects.includes(tile.id)) {
                    this.drawGhostTile(tile, editorState.moveDelta!, editorState.pan, editorState.zoom);
                }
            });

            levelData.objects.forEach((obj) => {
                if (editorState.selectedObjects.includes(obj.id)) {
                    this.drawGhostObject(obj, editorState.moveDelta!, editorState.pan, editorState.zoom);
                }
            });

            levelData.spawnPoints.forEach((spawn) => {
                if (editorState.selectedObjects.includes(spawn.id)) {
                    this.drawGhostSpawnPoint(spawn, editorState.moveDelta!, editorState.pan, editorState.zoom);
                }
            });
        }

        // Draw paste preview ghost if in paste mode
        if (editorState.pastePreview) {
            this.drawPastePreview(
                editorState.pastePreview,
                editorState.mousePosition,
                editorState.pan,
                editorState.zoom
            );
        }

        // Draw links
        this.drawLinks(levelData.objects, editorState.pan, editorState.zoom);

        // Draw multi-select drag box if active
        if (editorState.selectionBox) {
            this.drawSelectionBox(
                editorState.selectionBox.start,
                editorState.selectionBox.end,
                editorState.pan,
                editorState.zoom
            );
        }

        // Draw line preview if line tool is active
        if (editorState.linePreview) {
            this.drawPreviewLine(
                editorState.linePreview.start,
                editorState.linePreview.end,
                editorState.linePreview.tileType,
                editorState.pan,
                editorState.zoom
            );
        }
        // Draw rectangle preview if rectangle tool is active
        else if (editorState.rectanglePreview) {
            this.drawPreviewRectangle(
                editorState.rectanglePreview.start,
                editorState.rectanglePreview.end,
                editorState.rectanglePreview.tileType,
                editorState.pan,
                editorState.zoom
            );
        }
        // Draw preview tile if a tile type is selected (but not in line/rectangle tool mode)
        else if (editorState.selectedTileType && editorState.mousePosition) {
            this.drawPreviewTile(
                editorState.mousePosition,
                editorState.selectedTileType,
                editorState.pan,
                editorState.zoom
            );
        }
    }
}
