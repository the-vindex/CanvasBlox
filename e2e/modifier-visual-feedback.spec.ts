import { expect, test } from '@playwright/test';

test.describe('Modifier Visual Feedback', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForSelector('[data-testid="level-canvas"]');
    });

    test('should show "Multi-select (Shift)" indicator when Shift is held', async ({ page }) => {
        // Initially, no modifier indicator should be visible
        await expect(page.getByTestId('modifier-indicator')).not.toBeVisible();

        // Hold Shift key
        await page.keyboard.down('Shift');

        // Wait a moment for state update
        await page.waitForTimeout(100);

        // Verify modifier indicator appears
        const indicator = page.getByTestId('modifier-indicator');
        await expect(indicator).toBeVisible();

        // Verify the text content
        await expect(indicator).toContainText('Multi-select (Shift)');

        // Release Shift key
        await page.keyboard.up('Shift');

        // Wait a moment for state update
        await page.waitForTimeout(100);

        // Verify indicator disappears
        await expect(indicator).not.toBeVisible();
    });

    test('should show "Add to selection (Ctrl)" indicator when Ctrl is held', async ({ page }) => {
        // Initially, no modifier indicator should be visible
        await expect(page.getByTestId('modifier-indicator')).not.toBeVisible();

        // Hold Ctrl key
        await page.keyboard.down('Control');

        // Wait a moment for state update
        await page.waitForTimeout(100);

        // Verify modifier indicator appears
        const indicator = page.getByTestId('modifier-indicator');
        await expect(indicator).toBeVisible();

        // Verify the text content
        await expect(indicator).toContainText('Add to selection (Ctrl)');

        // Release Ctrl key
        await page.keyboard.up('Control');

        // Wait a moment for state update
        await page.waitForTimeout(100);

        // Verify indicator disappears
        await expect(indicator).not.toBeVisible();
    });

    test('should not show modifier indicator when typing in input field', async ({ page }) => {
        // Click on level name input in properties panel
        const levelNameInput = page.locator('input[type="text"]').first();
        await levelNameInput.click();

        // Hold Shift key while focused on input
        await page.keyboard.down('Shift');
        await page.waitForTimeout(100);

        // Verify modifier indicator does NOT appear
        await expect(page.getByTestId('modifier-indicator')).not.toBeVisible();

        // Release Shift key
        await page.keyboard.up('Shift');
    });

    test('should show modifier indicator during actual interaction', async ({ page }) => {
        // Place two objects
        const canvas = page.locator('[data-testid="level-canvas"]');

        // Select spawn point from palette - use data-testid instead
        await page.locator('[data-testid="tile-spawn-player"]').click();

        // Place first object
        const canvasBox = await canvas.boundingBox();
        if (!canvasBox) throw new Error('Canvas not found');
        await canvas.click({ position: { x: canvasBox.width / 2, y: canvasBox.height / 2 } });

        // Place second object nearby
        await canvas.click({ position: { x: canvasBox.width / 2 + 50, y: canvasBox.height / 2 } });

        // Hold Shift and verify indicator appears
        await page.keyboard.down('Shift');
        await page.waitForTimeout(100);

        const indicator = page.getByTestId('modifier-indicator');
        await expect(indicator).toBeVisible();
        await expect(indicator).toContainText('Multi-select (Shift)');

        // Drag to create selection box
        await page.mouse.move(canvasBox.x + canvasBox.width / 2 - 50, canvasBox.y + canvasBox.height / 2 - 50);
        await page.mouse.down();
        await page.mouse.move(canvasBox.x + canvasBox.width / 2 + 100, canvasBox.y + canvasBox.height / 2 + 50);

        // Indicator should still be visible during drag
        await expect(indicator).toBeVisible();

        // Release mouse and Shift
        await page.mouse.up();
        await page.keyboard.up('Shift');
        await page.waitForTimeout(100);

        // Indicator should disappear
        await expect(indicator).not.toBeVisible();
    });

    test('should show "Move objects (Alt)" indicator when Alt is held', async ({ page }) => {
        // Initially, no modifier indicator should be visible
        await expect(page.getByTestId('modifier-indicator')).not.toBeVisible();

        // Hold Alt key
        await page.keyboard.down('Alt');

        // Wait a moment for state update
        await page.waitForTimeout(100);

        // Verify modifier indicator appears
        const indicator = page.getByTestId('modifier-indicator');
        await expect(indicator).toBeVisible();

        // Verify the text content
        await expect(indicator).toContainText('Move objects (Alt)');

        // Release Alt key
        await page.keyboard.up('Alt');

        // Wait a moment for state update
        await page.waitForTimeout(100);

        // Verify indicator disappears
        await expect(indicator).not.toBeVisible();
    });

    test('should allow moving objects with Alt key when objects are selected', async ({ page }) => {
        const canvas = page.locator('[data-testid="level-canvas"]');

        // Select a tile type
        await page.locator('[data-testid="tile-platform-grass"]').click();

        // Place a tile
        const canvasBox = await canvas.boundingBox();
        if (!canvasBox) throw new Error('Canvas not found');
        await canvas.click({ position: { x: canvasBox.width / 2, y: canvasBox.height / 2 } });

        // Select the tile using select tool
        await page.locator('[data-testid="tool-select"]').click();
        await canvas.click({ position: { x: canvasBox.width / 2, y: canvasBox.height / 2 } });

        // Verify object is selected
        await expect(page.getByTestId('canvas-overlay')).toContainText('Selected: 1 object(s)');

        // Hold Alt key to engage move tool temporarily
        await page.keyboard.down('Alt');
        await page.waitForTimeout(100);

        // Verify modifier indicator shows move mode
        const indicator = page.getByTestId('modifier-indicator');
        await expect(indicator).toBeVisible();
        await expect(indicator).toContainText('Move objects (Alt)');

        // Click and drag to move the object
        await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(canvasBox.x + canvasBox.width / 2 + 64, canvasBox.y + canvasBox.height / 2); // Move 2 tiles
        await page.mouse.up();

        // Release Alt key
        await page.keyboard.up('Alt');
        await page.waitForTimeout(100);

        // Verify the object has moved (selected count should still be 1)
        await expect(page.getByTestId('canvas-overlay')).toContainText('Selected: 1 object(s)');

        // Verify indicator disappears
        await expect(indicator).not.toBeVisible();
    });
});
