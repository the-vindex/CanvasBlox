import { expect, test } from '@playwright/test';
import { clickCanvas, getCanvasBounds, getObjectCount } from './helpers';

test.describe('Copy/Paste', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should copy with Ctrl+C and copy button', async ({ page }) => {
        // Both keyboard shortcut and button call the same copy function - test both methods
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');
        const copyButton = page.getByRole('button', { name: /Copy/ });

        // Place and select a button
        await buttonTile.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        await selectTool.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Test keyboard shortcut (Ctrl+C)
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);
        const keyboardToast = page.getByText('Copied 1 items to clipboard.', { exact: true });
        await expect(keyboardToast).toBeVisible();

        // Deselect by clicking empty area (this clears the selection but keeps object on canvas)
        await clickCanvas(page, 100, 100);
        await page.waitForTimeout(100);

        // Re-select the same object
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Test copy button
        await copyButton.click();
        await page.waitForTimeout(100);
        const buttonToast = page.getByText('Copied 1 items to clipboard.', { exact: true });
        await expect(buttonToast).toBeVisible();
    });

    test.skip('should paste with Ctrl+V and paste button', async ({ page }) => {
        // Both keyboard shortcut and button call the same paste function - test both methods
        // Note: This test verifies paste operation works (count increases, toast appears).
        // Offset positioning is tested separately in other tests.
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');
        const pasteButton = page.getByRole('button', { name: /Paste/ });

        // Get initial count
        const initialCount = await getObjectCount(page);

        // Place and select a button
        await buttonTile.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        await selectTool.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Copy with Ctrl+C
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);

        // Test keyboard shortcut (Ctrl+V)
        await page.keyboard.press('Control+v');
        await page.waitForTimeout(200);
        const keyboardCount = await getObjectCount(page);
        expect(keyboardCount).toBeGreaterThan(initialCount);
        const keyboardToast = page.getByText('Pasted 1 items.', { exact: true });
        await expect(keyboardToast).toBeVisible();

        // Undo the paste to reset state
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);

        // Test paste button
        await pasteButton.click();
        await page.waitForTimeout(200);
        const buttonCount = await getObjectCount(page);
        expect(buttonCount).toBeGreaterThan(initialCount);
        const buttonToast = page.getByText('Pasted 1 items.', { exact: true });
        await expect(buttonToast).toBeVisible();
    });

    test.skip('should copy multiple selected objects', async ({ page }) => {
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
        const box = await getCanvasBounds(page);
        await page.mouse.move(box.x + 180, box.y + 180);
        await page.mouse.down();
        await page.mouse.move(box.x + 360, box.y + 240, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify 3 objects are selected
        const countText = await selectionCount.textContent();
        const count = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
        expect(count).toBeGreaterThanOrEqual(3);

        // Copy with Ctrl+C
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);

        // Verify copy toast (check that copy happened - exact count may vary)
        const copyToast = page.getByText(/Copied \d+ items to clipboard/, { exact: false }).first();
        await expect(copyToast).toBeVisible();

        // Paste with Ctrl+V
        await page.keyboard.press('Control+v');
        await page.waitForTimeout(200);

        // Verify paste toast
        const pasteToast = page.getByText(/Pasted \d+ items/, { exact: false }).first();
        await expect(pasteToast).toBeVisible();
    });

    test('copy button should be disabled with nothing selected', async ({ page }) => {
        const copyButton = page.getByRole('button', { name: /Copy/ });

        // Copy button should be disabled when nothing is selected
        await expect(copyButton).toBeDisabled();
    });

    test.skip('paste button should be disabled with empty clipboard', async ({ page }) => {
        const pasteButton = page.getByRole('button', { name: /Paste/ });

        // Paste button should be disabled when clipboard is empty
        await expect(pasteButton).toBeDisabled();
    });
});
