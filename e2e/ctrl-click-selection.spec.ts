import { expect, test } from '@playwright/test';
import { clickCanvas } from './helpers';

test.describe('Ctrl+Click Additive Selection', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should add object to selection when Ctrl+Click on unselected object', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const selectTool = page.getByTestId('tool-select');
        const propertiesPanel = page.getByTestId('properties-panel');

        // Place three tiles
        await basicTile.click();
        await clickCanvas(page, 200, 200);
        await clickCanvas(page, 300, 200);
        await clickCanvas(page, 400, 200);

        // Clear the tile selection by pressing ESC
        await page.keyboard.press('Escape');

        // Activate Select tool
        await selectTool.click();

        // Click first tile to select it
        await clickCanvas(page, 200, 200);

        // Verify one object selected
        await expect(propertiesPanel).toContainText('Selected Object');

        // Get canvas bounding box for coordinate calculations
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Hold Ctrl and click second tile
        await page.keyboard.down('Control');
        await page.mouse.click(box.x + 300, box.y + 200);
        await page.keyboard.up('Control');

        // Verify two objects are selected (additive)
        await expect(propertiesPanel).toContainText(/2 objects selected/i);

        // Hold Ctrl and click third tile
        await page.keyboard.down('Control');
        await page.mouse.click(box.x + 400, box.y + 200);
        await page.keyboard.up('Control');

        // Verify three objects are selected
        await expect(propertiesPanel).toContainText(/3 objects selected/i);
    });

    test('should remove object from selection when Ctrl+Click on already selected object', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const propertiesPanel = page.getByTestId('properties-panel');

        // Place three tiles
        await basicTile.click();
        await clickCanvas(page, 200, 200);
        await clickCanvas(page, 300, 200);
        await clickCanvas(page, 400, 200);

        // Clear the tile selection by pressing ESC
        await page.keyboard.press('Escape');

        // Select all three tiles using Shift+Drag
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await page.mouse.move(box.x + 150, box.y + 150);
        await page.keyboard.down('Shift');
        await page.mouse.down();
        await page.mouse.move(box.x + 450, box.y + 250);
        await page.mouse.up();
        await page.keyboard.up('Shift');

        // Verify three objects selected
        await expect(propertiesPanel).toContainText(/3 objects selected/i);

        // Hold Ctrl and click second tile to remove it from selection
        await page.keyboard.down('Control');
        await page.mouse.click(box.x + 300, box.y + 200);
        await page.keyboard.up('Control');

        // Verify two objects are selected (one removed)
        await expect(propertiesPanel).toContainText(/2 objects selected/i);

        // Hold Ctrl and click first tile to remove it from selection
        await page.keyboard.down('Control');
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.keyboard.up('Control');

        // Verify one object is selected
        await expect(propertiesPanel).toContainText('Selected Object');
    });

    test('should preserve selection when Ctrl+Click on empty space', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const selectTool = page.getByTestId('tool-select');
        const propertiesPanel = page.getByTestId('properties-panel');

        // Place two tiles
        await basicTile.click();
        await clickCanvas(page, 200, 200);
        await clickCanvas(page, 300, 200);

        // Clear the tile selection by pressing ESC
        await page.keyboard.press('Escape');

        // Activate Select tool
        await selectTool.click();

        // Click first tile to select it
        await clickCanvas(page, 200, 200);

        // Get canvas bounding box for coordinate calculations
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Hold Ctrl and click second tile
        await page.keyboard.down('Control');
        await page.mouse.click(box.x + 300, box.y + 200);
        await page.keyboard.up('Control');

        // Verify two objects are selected
        await expect(propertiesPanel).toContainText(/2 objects selected/i);

        // Hold Ctrl and click empty space
        await page.keyboard.down('Control');
        await page.mouse.click(box.x + 500, box.y + 300);
        await page.keyboard.up('Control');

        // Verify selection is preserved (still 2 objects)
        await expect(propertiesPanel).toContainText(/2 objects selected/i);
    });
});
