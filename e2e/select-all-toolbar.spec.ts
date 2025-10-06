import { expect, test } from '@playwright/test';
import { clickCanvas } from './helpers';

test.describe('Select All Toolbar Button', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should select all objects when clicking toolbar button', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const basicTile = page.getByTestId('tile-platform-basic');
        const selectAllButton = page.getByTestId('button-select-all');
        const selectionCount = page.getByTestId('selection-count');

        // Place 3 different objects (2 tiles + 1 button)
        await basicTile.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(50);
        await clickCanvas(page, 232, 200);
        await page.waitForTimeout(50);

        await buttonTile.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Initially nothing selected
        await expect(selectionCount).toHaveText('Selected: 0 object(s)');

        // Verify button is enabled (objects exist)
        await expect(selectAllButton).not.toBeDisabled();

        // Click Select All button in toolbar
        await selectAllButton.click();
        await page.waitForTimeout(100);

        // Should have selected all objects (at least the 3 we placed)
        const finalText = await selectionCount.textContent();
        const finalCount = parseInt(finalText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeGreaterThanOrEqual(3);
    });

    test('should show correct tooltip', async ({ page }) => {
        const selectAllButton = page.getByTestId('button-select-all');
        await expect(selectAllButton).toHaveAttribute('title', 'Select All (Ctrl+A)');
    });
});
