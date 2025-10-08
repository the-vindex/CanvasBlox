export interface EnemyConfig {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class Enemy {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    isAlive: boolean;

    constructor(config: EnemyConfig) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.vx = 0;
        this.vy = 0;
        this.isAlive = true;
    }

    /**
     * Kill the enemy (e.g., when player stomps on it)
     */
    kill(): void {
        this.isAlive = false;
    }

    /**
     * Update enemy state (placeholder for AI in Slice 5)
     */
    update(_deltaTime: number): void {
        // Placeholder - AI will be implemented in Slice 5
    }
}
