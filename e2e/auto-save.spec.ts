import { expect, test } from '@playwright/test';

test.describe('Auto-Save', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should show unsaved indicator when changes are made', async ({ page }) => {
        // Get save indicator
        const saveIndicator = page.getByTestId('save-indicator');

        // Wait for initial auto-save to complete (levels load from localStorage triggers unsaved)
        await page.waitForTimeout(5500);

        // After auto-save, should show "Saved"
        await expect(saveIndicator).toContainText('Saved');

        // Make a change - place a tile
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await grassTile.click();
        await page.mouse.click(box.x + 100, box.y + 100);
        await page.waitForTimeout(100);

        // Should now show "Unsaved"
        await expect(saveIndicator).toContainText('Unsaved');
    });

    test('should auto-save after 5 seconds', async ({ page }) => {
        // Get save indicator
        const saveIndicator = page.getByTestId('save-indicator');

        // Make a change
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await grassTile.click();
        await page.mouse.click(box.x + 150, box.y + 150);
        await page.waitForTimeout(100);

        // Should show "Unsaved"
        await expect(saveIndicator).toContainText('Unsaved');

        // Wait for auto-save (5 seconds + buffer)
        await page.waitForTimeout(5500);

        // Should now show "Saved"
        await expect(saveIndicator).toContainText('Saved');
    });

    test('should change icon color based on save state', async ({ page }) => {
        // Get save indicator icon
        const saveIcon = page.locator('[data-testid="save-indicator"] i.fa-save').first();

        // Make a change
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await grassTile.click();
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(100);

        // Icon should have orange color class for unsaved
        const unsavedClasses = await saveIcon.getAttribute('class');
        expect(unsavedClasses).toContain('text-orange-500');

        // Wait for auto-save
        await page.waitForTimeout(5500);

        // Icon should have green color class for saved
        const savedClasses = await saveIcon.getAttribute('class');
        expect(savedClasses).toContain('text-green-500');
    });
});
