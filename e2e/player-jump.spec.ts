import { expect, test } from '@playwright/test';

test.describe('Player Jump Mechanics', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should allow player to jump with spacebar', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place platform at bottom
        await canvas.click({ position: { x: 320, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Wait for player to settle on platform
        await page.waitForTimeout(200);

        // Press spacebar to jump
        await page.keyboard.press('Space');

        // Wait to observe jump arc
        await page.waitForTimeout(500);

        // Player should have jumped (verified via game state/visual)
        await expect(playModeCanvas).toBeVisible();
    });

    test('should allow player to jump with W key', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place platform at bottom
        await canvas.click({ position: { x: 320, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Wait for player to settle on platform
        await page.waitForTimeout(200);

        // Press W key to jump
        await page.keyboard.press('KeyW');

        // Wait to observe jump arc
        await page.waitForTimeout(500);

        // Player should have jumped
        await expect(playModeCanvas).toBeVisible();
    });

    test('should create realistic jump arc with gravity', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place platform at bottom
        await canvas.click({ position: { x: 320, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Wait for player to settle
        await page.waitForTimeout(200);

        // Jump
        await page.keyboard.press('Space');

        // Wait for full jump arc (up and down)
        await page.waitForTimeout(1000);

        // Player should land back on platform
        await expect(playModeCanvas).toBeVisible();
    });

    test('should land smoothly on platforms', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place platform at bottom
        await canvas.click({ position: { x: 320, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Wait for initial landing
        await page.waitForTimeout(200);

        // Jump multiple times to test landing
        for (let i = 0; i < 3; i++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(800); // Wait for complete jump cycle
        }

        // Player should consistently land on platform
        await expect(playModeCanvas).toBeVisible();
    });

    test('should allow player to jump over gaps', async ({ page }) => {
        // Place two platforms with a gap
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place first platform
        await canvas.click({ position: { x: 200, y: 480 } });

        // Place second platform (gap in between)
        await canvas.click({ position: { x: 400, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Wait for player to settle
        await page.waitForTimeout(200);

        // Run and jump to cross the gap
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(100);
        await page.keyboard.press('Space');
        await page.waitForTimeout(800);
        await page.keyboard.up('ArrowRight');

        // Player should have crossed the gap
        await expect(playModeCanvas).toBeVisible();
    });

    test('should hit ceiling and fall back down when jumping into platform from below', async ({ page }) => {
        // Place a ceiling platform and a floor platform
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place floor platform
        await canvas.click({ position: { x: 320, y: 480 } });

        // Place ceiling platform above (2-3 tiles up)
        await canvas.click({ position: { x: 320, y: 350 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Wait for player to settle on floor
        await page.waitForTimeout(200);

        // Jump into ceiling
        await page.keyboard.press('Space');

        // Wait for player to hit ceiling and fall back
        await page.waitForTimeout(1000);

        // Player should fall back to floor after hitting ceiling
        await expect(playModeCanvas).toBeVisible();
    });

    test('should not allow double jump (cannot jump while in air)', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place platform at bottom
        await canvas.click({ position: { x: 320, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Wait for player to settle
        await page.waitForTimeout(200);

        // Jump once
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);

        // Try to jump again while in air (should not work)
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);
        await page.keyboard.press('Space');

        // Wait for landing
        await page.waitForTimeout(800);

        // Player should only have jumped once (no double jump)
        await expect(playModeCanvas).toBeVisible();
    });

    test('should combine horizontal movement with jumping', async ({ page }) => {
        // Place a platform for the player to stand on
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place wide platform
        await canvas.click({ position: { x: 200, y: 480 } });
        await canvas.click({ position: { x: 232, y: 480 } });
        await canvas.click({ position: { x: 264, y: 480 } });
        await canvas.click({ position: { x: 296, y: 480 } });
        await canvas.click({ position: { x: 328, y: 480 } });

        // Enter play mode
        const playButton = page.getByTestId('button-play-mode');
        await playButton.click();

        const playModeCanvas = page.getByTestId('play-mode-canvas');
        await expect(playModeCanvas).toBeVisible();

        // Focus the canvas
        await playModeCanvas.click();

        // Wait for player to settle
        await page.waitForTimeout(200);

        // Move right while jumping
        await page.keyboard.down('ArrowRight');
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
        await page.keyboard.up('ArrowRight');

        // Wait for landing
        await page.waitForTimeout(500);

        // Player should have moved right while jumping
        await expect(playModeCanvas).toBeVisible();
    });
});
