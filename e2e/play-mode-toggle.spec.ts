import { expect, test } from '@playwright/test';

test.describe('Play Mode Toggle', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should have play mode toggle button in toolbar', async ({ page }) => {
        const playButton = page.getByTestId('button-play-mode');
        await expect(playButton).toBeVisible();
    });

    test('should toggle to play mode when button clicked', async ({ page }) => {
        const playButton = page.getByTestId('button-play-mode');
        const playModeContainer = page.getByTestId('play-mode-container');

        // Initially in edit mode (play mode not visible)
        await expect(playModeContainer).not.toBeVisible();

        // Click to enter play mode
        await playButton.click();
        await expect(playModeContainer).toBeVisible();
    });

    test('should toggle back to edit mode when button clicked again', async ({ page }) => {
        const playButton = page.getByTestId('button-play-mode');
        const playModeContainer = page.getByTestId('play-mode-container');

        // Enter play mode
        await playButton.click();
        await expect(playModeContainer).toBeVisible();

        // Exit play mode (use force because play mode canvas may overlay)
        await playButton.click({ force: true });
        await expect(playModeContainer).not.toBeVisible();
    });

    test('should show play mode canvas when in play mode', async ({ page }) => {
        const playButton = page.getByTestId('button-play-mode');
        const playModeCanvas = page.getByTestId('play-mode-canvas');

        // Enter play mode
        await playButton.click();

        // Play mode canvas should be visible
        await expect(playModeCanvas).toBeVisible();
    });

    test('should hide editor canvas when in play mode', async ({ page }) => {
        const playButton = page.getByTestId('button-play-mode');
        const editorCanvas = page.getByTestId('level-canvas');

        // Initially editor canvas is visible
        await expect(editorCanvas).toBeVisible();

        // Enter play mode
        await playButton.click();

        // Editor canvas should be hidden (parent container has display: none)
        await expect(editorCanvas).not.toBeVisible();
    });

    test('should show editor canvas when returning to edit mode', async ({ page }) => {
        const playButton = page.getByTestId('button-play-mode');
        const editorCanvas = page.getByTestId('level-canvas');

        // Enter play mode
        await playButton.click();
        await expect(editorCanvas).not.toBeVisible();

        // Return to edit mode (use force because play mode canvas may overlay)
        await playButton.click({ force: true });
        await expect(editorCanvas).toBeVisible();
    });
});
