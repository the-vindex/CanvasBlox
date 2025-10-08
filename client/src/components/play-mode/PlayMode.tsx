import { useEffect, useRef, useState } from 'react';
import type { AABB } from '@/game/collision';
import { checkEnemyCollision, checkLavaCollision } from '@/game/collision';
import { Enemy } from '@/game/Enemy';
import { InputHandler } from '@/game/InputHandler';
import { Player } from '@/game/Player';
import { applyGravity } from '@/game/physics';
import type { LevelData } from '@/types/level';
import { Hearts } from './Hearts';

interface PlayModeProps {
    level: LevelData;
    onExit: () => void;
}

const PLAYER_SPEED = 200; // pixels per second
const GRID_SIZE = 32; // pixels

export function PlayMode({ level }: PlayModeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [playerHealth, setPlayerHealth] = useState(3);

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

        // Convert level tiles to pixel coordinates for enemy AI
        const pixelTiles = level.tiles.map((tile) => ({
            ...tile,
            position: {
                x: tile.position.x * GRID_SIZE,
                y: tile.position.y * GRID_SIZE,
            },
            dimensions: {
                width: tile.dimensions.width * GRID_SIZE,
                height: tile.dimensions.height * GRID_SIZE,
            },
        }));

        // Initialize enemies from spawn points
        const enemies: Enemy[] = level.spawnPoints
            .filter((sp) => sp.type === 'enemy')
            .map(
                (sp) =>
                    new Enemy({
                        x: sp.position.x * GRID_SIZE,
                        y: sp.position.y * GRID_SIZE,
                        width: 32,
                        height: 32,
                    })
            );

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

            // Handle jump input
            if (inputHandler.isJumpPressed()) {
                player.jump();
            }

            // Apply gravity to player
            player.vy = applyGravity(player.vy, deltaTime);

            // Update player position and handle collisions
            player.update(deltaTime, platforms);

            // Update enemies
            for (const enemy of enemies) {
                enemy.update(deltaTime, pixelTiles);
            }

            // Check enemy collision
            const playerAABB = {
                x: player.x,
                y: player.y,
                width: player.width,
                height: player.height,
            };

            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                if (!enemy.isAlive) {
                    continue;
                }

                const collision = checkEnemyCollision(playerAABB, enemy, player.vy);

                if (collision.collided) {
                    if (collision.fromTop) {
                        // Player stomped on enemy - kill enemy and make player bounce
                        enemy.kill();
                        player.vy = -200; // Bounce upward
                    } else {
                        // Side collision - player takes damage
                        player.takeDamage(1);
                    }
                }
            }

            // Remove dead enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                if (!enemies[i].isAlive) {
                    enemies.splice(i, 1);
                }
            }

            // Check for lava collision
            if (checkLavaCollision(playerAABB, level.tiles)) {
                player.takeDamage(3); // Instant death
            }

            // Handle death and respawn
            if (player.isDead() && !player.isDying) {
                player.die();
                // Respawn after a short delay
                setTimeout(() => {
                    player.respawn({ x: spawnX, y: spawnY });
                    setPlayerHealth(player.health);
                }, 500);
            }

            // Update health UI
            setPlayerHealth(player.health);

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

            // Render enemies
            ctx.fillStyle = '#ef4444'; // Red color for enemies
            for (const enemy of enemies) {
                if (enemy.isAlive) {
                    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

                    // Draw enemy outline
                    ctx.strokeStyle = '#dc2626';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
                }
            }

            // Render player (with flashing effect if invulnerable)
            if (!player.isInvulnerable || Math.floor(performance.now() / 100) % 2 === 0) {
                ctx.fillStyle = '#3b82f6'; // Blue color for player
                ctx.fillRect(player.x, player.y, player.width, player.height);

                // Draw player outline
                ctx.strokeStyle = '#60a5fa';
                ctx.lineWidth = 2;
                ctx.strokeRect(player.x, player.y, player.width, player.height);
            }

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
            <Hearts health={playerHealth} />
            <canvas
                ref={canvasRef}
                data-testid="play-mode-canvas"
                className="border border-gray-700"
                style={{ pointerEvents: 'auto' }}
            />
        </div>
    );
}
