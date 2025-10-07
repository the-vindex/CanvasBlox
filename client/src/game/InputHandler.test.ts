import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InputHandler } from './InputHandler';

describe('InputHandler', () => {
    let inputHandler: InputHandler;

    beforeEach(() => {
        inputHandler = new InputHandler();
    });

    afterEach(() => {
        inputHandler.cleanup();
    });

    describe('keyboard input', () => {
        it('should detect ArrowLeft key press', () => {
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(event);

            expect(inputHandler.isLeftPressed()).toBe(true);
            expect(inputHandler.isRightPressed()).toBe(false);
        });

        it('should detect ArrowRight key press', () => {
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(event);

            expect(inputHandler.isRightPressed()).toBe(true);
            expect(inputHandler.isLeftPressed()).toBe(false);
        });

        it('should detect A key press', () => {
            const event = new KeyboardEvent('keydown', { key: 'a' });
            window.dispatchEvent(event);

            expect(inputHandler.isLeftPressed()).toBe(true);
        });

        it('should detect D key press', () => {
            const event = new KeyboardEvent('keydown', { key: 'd' });
            window.dispatchEvent(event);

            expect(inputHandler.isRightPressed()).toBe(true);
        });

        it('should clear left direction on key up', () => {
            const keyDown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            const keyUp = new KeyboardEvent('keyup', { key: 'ArrowLeft' });

            window.dispatchEvent(keyDown);
            expect(inputHandler.isLeftPressed()).toBe(true);

            window.dispatchEvent(keyUp);
            expect(inputHandler.isLeftPressed()).toBe(false);
        });

        it('should clear right direction on key up', () => {
            const keyDown = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            const keyUp = new KeyboardEvent('keyup', { key: 'ArrowRight' });

            window.dispatchEvent(keyDown);
            expect(inputHandler.isRightPressed()).toBe(true);

            window.dispatchEvent(keyUp);
            expect(inputHandler.isRightPressed()).toBe(false);
        });

        it('should handle multiple simultaneous key presses', () => {
            const leftDown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            const rightDown = new KeyboardEvent('keydown', { key: 'ArrowRight' });

            window.dispatchEvent(leftDown);
            window.dispatchEvent(rightDown);

            expect(inputHandler.isLeftPressed()).toBe(true);
            expect(inputHandler.isRightPressed()).toBe(true);
        });

        it('should handle A and ArrowLeft as same input', () => {
            const aDown = new KeyboardEvent('keydown', { key: 'a' });
            window.dispatchEvent(aDown);

            expect(inputHandler.isLeftPressed()).toBe(true);

            const aUp = new KeyboardEvent('keyup', { key: 'a' });
            window.dispatchEvent(aUp);

            expect(inputHandler.isLeftPressed()).toBe(false);
        });

        it('should handle D and ArrowRight as same input', () => {
            const dDown = new KeyboardEvent('keydown', { key: 'd' });
            window.dispatchEvent(dDown);

            expect(inputHandler.isRightPressed()).toBe(true);

            const dUp = new KeyboardEvent('keyup', { key: 'd' });
            window.dispatchEvent(dUp);

            expect(inputHandler.isRightPressed()).toBe(false);
        });

        it('should keep direction active if one key is released but alternate key is still pressed', () => {
            const aDown = new KeyboardEvent('keydown', { key: 'a' });
            const leftDown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            const aUp = new KeyboardEvent('keyup', { key: 'a' });

            window.dispatchEvent(aDown);
            window.dispatchEvent(leftDown);
            expect(inputHandler.isLeftPressed()).toBe(true);

            window.dispatchEvent(aUp);
            expect(inputHandler.isLeftPressed()).toBe(true); // ArrowLeft still pressed
        });
    });

    describe('jump input', () => {
        it('should detect spacebar key press for jump', () => {
            const event = new KeyboardEvent('keydown', { key: ' ' });
            window.dispatchEvent(event);

            expect(inputHandler.isJumpPressed()).toBe(true);
        });

        it('should detect W key press for jump', () => {
            const event = new KeyboardEvent('keydown', { key: 'w' });
            window.dispatchEvent(event);

            expect(inputHandler.isJumpPressed()).toBe(true);
        });

        it('should clear jump state on key up', () => {
            const keyDown = new KeyboardEvent('keydown', { key: ' ' });
            const keyUp = new KeyboardEvent('keyup', { key: ' ' });

            window.dispatchEvent(keyDown);
            expect(inputHandler.isJumpPressed()).toBe(true);

            window.dispatchEvent(keyUp);
            expect(inputHandler.isJumpPressed()).toBe(false);
        });

        it('should handle W and spacebar as same jump input', () => {
            const wDown = new KeyboardEvent('keydown', { key: 'w' });
            window.dispatchEvent(wDown);

            expect(inputHandler.isJumpPressed()).toBe(true);

            const wUp = new KeyboardEvent('keyup', { key: 'w' });
            window.dispatchEvent(wUp);

            expect(inputHandler.isJumpPressed()).toBe(false);
        });

        it('should keep jump active if one key is released but alternate key is still pressed', () => {
            const wDown = new KeyboardEvent('keydown', { key: 'w' });
            const spaceDown = new KeyboardEvent('keydown', { key: ' ' });
            const wUp = new KeyboardEvent('keyup', { key: 'w' });

            window.dispatchEvent(wDown);
            window.dispatchEvent(spaceDown);
            expect(inputHandler.isJumpPressed()).toBe(true);

            window.dispatchEvent(wUp);
            expect(inputHandler.isJumpPressed()).toBe(true); // Spacebar still pressed
        });
    });

    describe('cleanup', () => {
        it('should remove event listeners on cleanup', () => {
            inputHandler.cleanup();

            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(event);

            expect(inputHandler.isLeftPressed()).toBe(false);
        });
    });
});
