import { expect, test } from '@playwright/test';
import { clickCanvas, getObjectCount } from './helpers';

test.describe('Paste Ghost Preview', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should show ghost preview after paste and place on click', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');

        // Place and select a button
        await buttonTile.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        await selectTool.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Get count after placing button (before paste)
        const countBeforePaste = await getObjectCount(page);

        // Copy with Ctrl+C
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);

        // Press Ctrl+V to initiate paste mode
        await page.keyboard.press('Control+v');
        await page.waitForTimeout(100);

        // Verify count hasn't increased yet (ghost preview, not placed)
        const countAfterPaste = await getObjectCount(page);
        expect(countAfterPaste).toBe(countBeforePaste);

        // Click to place the pasted object
        await clickCanvas(page, 400, 400);
        await page.waitForTimeout(200);

        // Verify count increased after click
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBe(countBeforePaste + 1);

        // Verify paste toast appears after placement
        const pasteToast = page.getByText('Pasted 1 items.', { exact: true });
        await expect(pasteToast).toBeVisible();
    });

    test('should cancel ghost preview with ESC key', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');

        // Place and select a button
        await buttonTile.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        await selectTool.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Get count after placing button (before paste)
        const countBeforePaste = await getObjectCount(page);

        // Copy with Ctrl+C
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);

        // Press Ctrl+V to initiate paste mode
        await page.keyboard.press('Control+v');
        await page.waitForTimeout(100);

        // Press ESC to cancel paste mode
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);

        // Click where we would have placed - should not place anything
        await clickCanvas(page, 400, 400);
        await page.waitForTimeout(200);

        // Verify count hasn't changed
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBe(countBeforePaste);
    });

    test('should paste multiple objects with ghost preview', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const multiSelectTool = page.getByTestId('tool-multiselect');
        const selectionCount = page.getByTestId('selection-count');

        // Place 3 buttons
        await buttonTile.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(50);
        await clickCanvas(page, 264, 200);
        await page.waitForTimeout(50);
        await clickCanvas(page, 328, 200);
        await page.waitForTimeout(100);

        // Multi-select all 3
        await multiSelectTool.click();
        await page.mouse.move(400, 300); // Position mouse over canvas
        await page.mouse.down();
        await page.mouse.move(600, 400, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify at least 3 objects are selected
        const countText = await selectionCount.textContent();
        const selectedCount = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
        expect(selectedCount).toBeGreaterThanOrEqual(3);

        // Get count before paste
        const countBeforePaste = await getObjectCount(page);

        // Copy with Ctrl+C
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);

        // Press Ctrl+V to initiate paste mode
        await page.keyboard.press('Control+v');
        await page.waitForTimeout(100);

        // Verify count hasn't increased yet
        const countAfterPaste = await getObjectCount(page);
        expect(countAfterPaste).toBe(countBeforePaste);

        // Click to place the pasted objects
        await clickCanvas(page, 500, 500);
        await page.waitForTimeout(200);

        // Verify count increased after click
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBeGreaterThan(countBeforePaste);

        // Verify paste toast appears
        const pasteToast = page.getByText(/Pasted \d+ items/, { exact: false }).first();
        await expect(pasteToast).toBeVisible();
    });

    test('should show confirmation dialog for large clipboard (>20 objects)', async ({ page }) => {
        const platformTile = page.getByTestId('tile-platform-basic');
        const penTool = page.getByTestId('tool-pen');

        // Place 25 tiles in a grid (5x5)
        await platformTile.click();
        await penTool.click();

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                await clickCanvas(page, 200 + col * 64, 200 + row * 64);
                await page.waitForTimeout(20);
            }
        }
        await page.waitForTimeout(100);

        // Select all with Ctrl+A
        await page.keyboard.press('Control+a');
        await page.waitForTimeout(100);

        // Copy with Ctrl+C
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);

        // Press Ctrl+V - should show confirmation dialog instead of ghost preview
        await page.keyboard.press('Control+v');
        await page.waitForTimeout(200);

        // Look for confirmation dialog (text or button)
        const confirmDialog = page.getByText(/Paste \d+ objects/, { exact: false });
        await expect(confirmDialog).toBeVisible();
    });

    test('paste button should trigger ghost preview mode', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');
        const pasteButton = page.getByRole('button', { name: /Paste/ });

        // Place and select a button
        await buttonTile.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        await selectTool.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Get count after placing button (before paste)
        const countBeforePaste = await getObjectCount(page);

        // Copy with Ctrl+C
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);

        // Click paste button to initiate paste mode
        await pasteButton.click();
        await page.waitForTimeout(100);

        // Verify count hasn't increased yet (ghost preview, not placed)
        const countAfterPaste = await getObjectCount(page);
        expect(countAfterPaste).toBe(countBeforePaste);

        // Click to place the pasted object
        await clickCanvas(page, 400, 400);
        await page.waitForTimeout(200);

        // Verify count increased after click
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBe(countBeforePaste + 1);
    });
});
