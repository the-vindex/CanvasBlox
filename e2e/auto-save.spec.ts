import { expect, test } from '@playwright/test';
import { clickCanvas } from './helpers';

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
        const grassTile = page.getByTestId('tile-platform-grass');

        await grassTile.click();
        await clickCanvas(page, 100, 100);
        await page.waitForTimeout(100);

        // Should now show "Unsaved"
        await expect(saveIndicator).toContainText('Unsaved');
    });

    test('should auto-save after 5 seconds and update both text and icon color', async ({ page }) => {
        // Get save indicator and icon
        const saveIndicator = page.getByTestId('save-indicator');
        const saveIcon = page.locator('[data-testid="save-indicator"] i.fa-save').first();

        // Make a change
        const grassTile = page.getByTestId('tile-platform-grass');

        await grassTile.click();
        await clickCanvas(page, 150, 150);
        await page.waitForTimeout(100);

        // Should show "Unsaved" text
        await expect(saveIndicator).toContainText('Unsaved');

        // Icon should have orange color class for unsaved
        const unsavedClasses = await saveIcon.getAttribute('class');
        expect(unsavedClasses).toContain('text-orange-500');

        // Wait for auto-save (5 seconds + buffer)
        await page.waitForTimeout(5500);

        // Should now show "Saved" text
        await expect(saveIndicator).toContainText('Saved');

        // Icon should have green color class for saved
        const savedClasses = await saveIcon.getAttribute('class');
        expect(savedClasses).toContain('text-green-500');
    });
});
