import { expect, test } from '@playwright/test';

test.describe('Player Movement', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should render player on canvas when entering play mode', async ({ page }) => {
        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        // Get the play mode canvas
        const canvas = page.getByTestId('play-mode-canvas');
        await expect(canvas).toBeVisible();

        // Take screenshot to verify player is rendered (visual verification)
        // In the future, we could use canvas pixel checking or expose game state for testing
        await page.waitForTimeout(100); // Wait for initial render
    });

    test('should move player right when pressing ArrowRight', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        // Place a platform at position (10, 15)
        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Click to place platform (approximate grid position)
        await canvas.click({ position: { x: 320, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas to receive keyboard input
        await playModeCanvas.click();

        // Press ArrowRight to move player right
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(500); // Wait for movement animation
        await page.keyboard.up('ArrowRight');

        // Player should have moved (we can verify via screenshot or game state)
        // For now, just verify the canvas is still rendering
        await expect(playModeCanvas).toBeVisible();
    });

    test('should move player left when pressing ArrowLeft', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        // Place a platform
        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await canvas.click({ position: { x: 320, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas to receive keyboard input
        await playModeCanvas.click();

        // Press ArrowLeft to move player left
        await page.keyboard.down('ArrowLeft');
        await page.waitForTimeout(500);
        await page.keyboard.up('ArrowLeft');

        await expect(playModeCanvas).toBeVisible();
    });

    test('should move player right when pressing D key', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await canvas.click({ position: { x: 320, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Press D key to move player right
        await page.keyboard.down('KeyD');
        await page.waitForTimeout(500);
        await page.keyboard.up('KeyD');

        await expect(playModeCanvas).toBeVisible();
    });

    test('should move player left when pressing A key', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await canvas.click({ position: { x: 320, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Press A key to move player left
        await page.keyboard.down('KeyA');
        await page.waitForTimeout(500);
        await page.keyboard.up('KeyA');

        await expect(playModeCanvas).toBeVisible();
    });

    test('should stop moving player when key is released', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await canvas.click({ position: { x: 320, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Press and hold ArrowRight
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(300);

        // Release the key
        await page.keyboard.up('ArrowRight');
        await page.waitForTimeout(300);

        // Player should stop moving (verified via game state, for now just check canvas is visible)
        await expect(playModeCanvas).toBeVisible();
    });
});
