import { expect, test } from '@playwright/test';
import { clickCanvas, getObjectCount } from './helpers';

test.describe('Undo/Redo', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should have undo button in header', async ({ page }) => {
        const undoButton = page.getByRole('button', { name: /Undo/ });
        await expect(undoButton).toBeVisible();
    });

    test('should have redo button in header', async ({ page }) => {
        const redoButton = page.getByRole('button', { name: /Redo/ });
        await expect(redoButton).toBeVisible();
    });

    test('should undo with Ctrl+Z and button', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const _objectCount = page.getByTestId('statusbar-object-count');
        const undoButton = page.getByRole('button', { name: /Undo/ });

        // Get initial object count
        const initialCount = await getObjectCount(page);

        // Place a tile
        await grassTile.click();
        await page.waitForTimeout(50);
        await canvas.click({ position: { x: 200, y: 200 } });

        // Wait for drawing session to end and history to update
        await expect(undoButton).toBeEnabled();

        // Verify tile was placed
        const afterPlaceCount = await getObjectCount(page);
        expect(afterPlaceCount).toBeGreaterThan(initialCount);

        // Test keyboard shortcut (Ctrl+Z)
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(200);
        const afterKeyboardUndoCount = await getObjectCount(page);
        expect(afterKeyboardUndoCount).toBeLessThan(afterPlaceCount);

        // Redo to restore
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(200);

        // Test button
        await undoButton.click();
        await page.waitForTimeout(200);
        const afterButtonUndoCount = await getObjectCount(page);
        expect(afterButtonUndoCount).toBeLessThan(afterPlaceCount);
    });

    test('should redo with Ctrl+Y, Ctrl+Shift+Z, and button', async ({ page }) => {
        const _canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const _objectCount = page.getByTestId('statusbar-object-count');
        const redoButton = page.getByRole('button', { name: /Redo/ });

        // Place a tile and record the expected count after redo
        await basicTile.click();
        await clickCanvas(page, 250, 250);
        await page.waitForTimeout(100);

        const expectedCount = await getObjectCount(page);

        // Undo once to create a redo opportunity
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);

        // All three redo methods should restore to the same state (call same redo function)

        // Test Ctrl+Y
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(100);
        const ctrlYCount = await getObjectCount(page);
        expect(ctrlYCount).toBe(expectedCount);
        await page.keyboard.press('Control+z'); // Reset for next test
        await page.waitForTimeout(100);

        // Test Ctrl+Shift+Z
        await page.keyboard.press('Control+Shift+Z');
        await page.waitForTimeout(100);
        const ctrlShiftZCount = await getObjectCount(page);
        expect(ctrlShiftZCount).toBe(expectedCount);
        await page.keyboard.press('Control+z'); // Reset for next test
        await page.waitForTimeout(100);

        // Test button
        await redoButton.click();
        await page.waitForTimeout(100);
        const buttonCount = await getObjectCount(page);
        expect(buttonCount).toBe(expectedCount);
    });

    test('should update history display in status bar', async ({ page }) => {
        // Create a fresh level for this test
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await newLevelButton.click();
        await page.waitForTimeout(200);

        const _canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const historyDisplay = page.getByTestId('statusbar-history');

        // Get initial history (should be 1/1 for fresh level)
        const initialHistoryText = await historyDisplay.textContent();
        const initialMatch = initialHistoryText?.match(/(\d+)\/(\d+)/);
        const initialIndex = parseInt(initialMatch?.[1] || '0', 10);

        // Place a tile
        await grassTile.click();
        await clickCanvas(page, 220, 220);
        await page.waitForTimeout(100);

        // History should increase
        const afterPlaceText = await historyDisplay.textContent();
        const afterPlaceMatch = afterPlaceText?.match(/(\d+)\/(\d+)/);
        const afterPlaceIndex = parseInt(afterPlaceMatch?.[1] || '0', 10);
        expect(afterPlaceIndex).toBe(initialIndex + 1);

        // Undo
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(200);

        // History index should decrease
        const afterUndoText = await historyDisplay.textContent();
        const afterUndoMatch = afterUndoText?.match(/(\d+)\/(\d+)/);
        const afterUndoIndex = parseInt(afterUndoMatch?.[1] || '0', 10);
        expect(afterUndoIndex).toBe(initialIndex);

        // Redo
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(100);

        // History index should increase again
        const afterRedoText = await historyDisplay.textContent();
        const afterRedoMatch = afterRedoText?.match(/(\d+)\/(\d+)/);
        const afterRedoIndex = parseInt(afterRedoMatch?.[1] || '0', 10);
        expect(afterRedoIndex).toBe(initialIndex + 1);
    });

    test('should disable undo button when at start of history', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const undoButton = page.getByRole('button', { name: /Undo/ });

        // Undo button should be disabled at initial state
        await expect(undoButton).toBeDisabled();

        // Place a tile to create history
        await grassTile.click();
        await canvas.click({ position: { x: 200, y: 200 } });
        await expect(undoButton).toBeEnabled();

        // Undo to go back to initial state
        await undoButton.click();
        await page.waitForTimeout(200);

        // Button should be disabled again at start of history
        await expect(undoButton).toBeDisabled();
    });

    test('should disable redo button when at end of history', async ({ page }) => {
        const _canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const redoButton = page.getByRole('button', { name: /Redo/ });

        // Place a tile and redo should be disabled (at end of history)
        await grassTile.click();
        await clickCanvas(page, 240, 240);
        await page.waitForTimeout(100);

        // At end of history, redo should be disabled
        await expect(redoButton).toBeDisabled();
    });

    test('should show visual flash feedback on undo/redo', async ({ page }) => {
        const _canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');

        // Place a tile
        await basicTile.click();
        await clickCanvas(page, 260, 260);
        await page.waitForTimeout(100);

        // Undo and check for flash overlay appearing
        const flashOverlay = page.locator('.undo-redo-flash');

        await page.keyboard.press('Control+z');

        // Flash overlay should appear briefly (even if it fades quickly)
        // We check that it exists in the DOM after undo
        await expect(flashOverlay).toHaveCount(1, { timeout: 500 });
    });

    test('should undo multiple actions in sequence', async ({ page }) => {
        // Create a fresh level for this test
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await newLevelButton.click();
        await page.waitForTimeout(200);

        const _canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const _objectCount = page.getByTestId('statusbar-object-count');

        // Get initial object count (should be 0 for fresh level)
        const initialCount = await getObjectCount(page);

        // Place 3 tiles
        await grassTile.click();

        await clickCanvas(page, 150, 150);
        await page.waitForTimeout(50);
        await clickCanvas(page, 182, 150);
        await page.waitForTimeout(50);
        await clickCanvas(page, 214, 150);
        await page.waitForTimeout(100);

        // Undo all 3 actions
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(200);

        // Should be back to initial count
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBe(initialCount);
    });

    test('should redo multiple actions in sequence', async ({ page }) => {
        const _canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const _objectCount = page.getByTestId('statusbar-object-count');

        // Get initial object count
        const initialCount = await getObjectCount(page);

        // Place 2 tiles
        await basicTile.click();

        await clickCanvas(page, 170, 170);
        await page.waitForTimeout(50);
        await clickCanvas(page, 202, 170);
        await page.waitForTimeout(100);

        // Undo both
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(50);
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);

        // Redo both
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(50);
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(100);

        // Should be back to having both tiles placed
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBeGreaterThan(initialCount);
    });

    test('should preserve undo/redo history when switching between levels', async ({ page }) => {
        // Test per-level history: each level maintains its own undo/redo stack
        const grassTile = page.getByTestId('tile-platform-grass');
        const fileButton = page.getByRole('button', { name: /File/i });
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });

        // Create first fresh level
        await fileButton.click();
        await newLevelButton.click();
        await page.waitForTimeout(200);

        // Place a tile in level 1
        await grassTile.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        const level1Count = await getObjectCount(page);
        expect(level1Count).toBeGreaterThan(0);

        // Create second fresh level
        await fileButton.click();
        await newLevelButton.click();
        await page.waitForTimeout(200);

        // Get initial count for level 2
        const level2InitialCount = await getObjectCount(page);

        // Place a tile in the second level
        await grassTile.click();
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        const level2CountAfter = await getObjectCount(page);
        expect(level2CountAfter).toBeGreaterThan(level2InitialCount);

        // Undo in level 2
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);

        const level2CountAfterUndo = await getObjectCount(page);
        expect(level2CountAfterUndo).toBeLessThan(level2CountAfter);

        // Switch back to level 1 (click on the second tab - first tab is the original level)
        const level1Tab = page.getByTestId('tab-level-1'); // Second tab is our first created level
        await level1Tab.click();
        await page.waitForTimeout(200);

        // Level 1 should still have its tile (undo in level 2 should not affect level 1)
        const level1CountFinal = await getObjectCount(page);
        expect(level1CountFinal).toBe(level1Count); // Should be same as before switching levels

        // Undo should still work in level 1
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);

        const level1CountAfterUndo = await getObjectCount(page);
        expect(level1CountAfterUndo).toBeLessThan(level1CountFinal);
    });
});
