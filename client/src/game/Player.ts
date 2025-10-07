/**
 * Player entity for the game mode.
 * Handles player position, dimensions, and velocity.
 */
export class Player {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public vx: number;
    public vy: number;

    constructor(x: number, y: number, width: number = 32, height: number = 32) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
    }

    /**
     * Update player position based on velocity and delta time.
     * @param deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime: number): void {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }
}
