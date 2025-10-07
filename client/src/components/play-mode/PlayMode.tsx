import { useEffect, useRef } from 'react';
import type { AABB } from '@/game/collision';
import { InputHandler } from '@/game/InputHandler';
import { Player } from '@/game/Player';
import type { LevelData } from '@/types/level';

interface PlayModeProps {
    level: LevelData;
    onExit: () => void;
}

const PLAYER_SPEED = 200; // pixels per second
const GRID_SIZE = 32; // pixels

export function PlayMode({ level, onExit }: PlayModeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;

        // Find spawn point or use default position
        const spawnPoint = level.spawnPoints.find((sp) => sp.type === 'player');
        const spawnX = spawnPoint ? spawnPoint.position.x * GRID_SIZE : 100;
        const spawnY = spawnPoint ? spawnPoint.position.y * GRID_SIZE : 100;

        // Initialize player
        const player = new Player(spawnX, spawnY, 32, 32);

        // Initialize input handler
        const inputHandler = new InputHandler();

        // Convert level tiles to AABBs for collision detection
        const platforms: AABB[] = level.tiles.map((tile) => ({
            x: tile.position.x * GRID_SIZE,
            y: tile.position.y * GRID_SIZE,
            width: GRID_SIZE,
            height: GRID_SIZE,
        }));

        // Game loop with requestAnimationFrame
        let lastTime = performance.now();
        let animationFrameId: number;

        const gameLoop = (currentTime: number) => {
            // Calculate delta time in seconds
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            // Update player velocity based on input
            if (inputHandler.isLeftPressed()) {
                player.vx = -PLAYER_SPEED;
            } else if (inputHandler.isRightPressed()) {
                player.vx = PLAYER_SPEED;
            } else {
                player.vx = 0;
            }

            // Update player position and handle collisions
            player.update(deltaTime, platforms);

            // Clear canvas
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Render platforms (tiles)
            ctx.fillStyle = '#4a4a4a';
            for (const tile of level.tiles) {
                ctx.fillRect(tile.position.x * GRID_SIZE, tile.position.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

                // Draw grid outline
                ctx.strokeStyle = '#333';
                ctx.strokeRect(tile.position.x * GRID_SIZE, tile.position.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }

            // Render player
            ctx.fillStyle = '#3b82f6'; // Blue color for player
            ctx.fillRect(player.x, player.y, player.width, player.height);

            // Draw player outline
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2;
            ctx.strokeRect(player.x, player.y, player.width, player.height);

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop(performance.now());

        return () => {
            cancelAnimationFrame(animationFrameId);
            inputHandler.cleanup();
        };
    }, [level]);

    return (
        <div
            data-testid="play-mode-container"
            className="fixed bg-black z-50 flex items-center justify-center"
            style={{
                top: '96px',
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
            }}
        >
            <canvas
                ref={canvasRef}
                data-testid="play-mode-canvas"
                className="border border-gray-700"
                style={{ pointerEvents: 'auto' }}
            />
        </div>
    );
}
