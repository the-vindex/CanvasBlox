/**
 * Input handler for keyboard controls in play mode.
 * Tracks keyboard state for player movement (ArrowLeft, ArrowRight, A, D).
 */
export class InputHandler {
    private keys: Set<string> = new Set();
    private handleKeyDown: (event: KeyboardEvent) => void;
    private handleKeyUp: (event: KeyboardEvent) => void;

    constructor() {
        this.handleKeyDown = (event: KeyboardEvent) => {
            this.keys.add(event.key.toLowerCase());
        };

        this.handleKeyUp = (event: KeyboardEvent) => {
            this.keys.delete(event.key.toLowerCase());
        };

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Check if left movement keys are pressed (ArrowLeft or A).
     */
    isLeftPressed(): boolean {
        return this.keys.has('arrowleft') || this.keys.has('a');
    }

    /**
     * Check if right movement keys are pressed (ArrowRight or D).
     */
    isRightPressed(): boolean {
        return this.keys.has('arrowright') || this.keys.has('d');
    }

    /**
     * Check if jump keys are pressed (Spacebar or W).
     */
    isJumpPressed(): boolean {
        return this.keys.has(' ') || this.keys.has('w');
    }

    /**
     * Remove event listeners. Call this when the input handler is no longer needed.
     */
    cleanup(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.keys.clear();
    }
}
