import { expect, test } from '@playwright/test';
import { clickCanvas } from './helpers';

test.describe('Temporary Tool Override with Modifiers', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should allow Ctrl+Click additive selection from Move tool', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const selectTool = page.getByTestId('tool-select');
        const moveTool = page.getByTestId('tool-move');
        const propertiesPanel = page.getByTestId('properties-panel');

        // Place three tiles
        await basicTile.click();
        await clickCanvas(page, 200, 200);
        await clickCanvas(page, 300, 200);
        await clickCanvas(page, 400, 200);

        // Clear the tile selection by pressing ESC
        await page.keyboard.press('Escape');

        // Use Select tool to select first tile
        await selectTool.click();
        await clickCanvas(page, 200, 200);

        // Verify one object selected
        await expect(propertiesPanel).toContainText('Selected Object');

        // Now activate Move tool
        await moveTool.click();

        // Verify Move tool is active
        await expect(moveTool).toHaveClass(/bg-blue-600/);

        // Get canvas bounding box for coordinate calculations
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Hold Ctrl and click second tile (additive selection from Move tool)
        await page.keyboard.down('Control');
        await page.mouse.click(box.x + 300, box.y + 200);
        await page.keyboard.up('Control');

        // Verify two objects are selected (additive)
        await expect(propertiesPanel).toContainText(/2 objects selected/i);

        // Verify Move tool is STILL active after Ctrl+Click
        await expect(moveTool).toHaveClass(/bg-blue-600/);

        // Hold Ctrl and click third tile
        await page.keyboard.down('Control');
        await page.mouse.click(box.x + 400, box.y + 200);
        await page.keyboard.up('Control');

        // Verify three objects are selected
        await expect(propertiesPanel).toContainText(/3 objects selected/i);

        // Verify Move tool is STILL active
        await expect(moveTool).toHaveClass(/bg-blue-600/);
    });

    test('should allow Shift+Drag multi-select from Move tool', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const moveTool = page.getByTestId('tool-move');
        const propertiesPanel = page.getByTestId('properties-panel');

        // Place two tiles
        await basicTile.click();
        await clickCanvas(page, 200, 200);
        await clickCanvas(page, 300, 200);

        // Activate Move tool
        await moveTool.click();

        // Verify Move tool is active
        await expect(moveTool).toHaveClass(/bg-blue-600/);

        // Use Shift+Drag to select both tiles
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await page.mouse.move(box.x + 150, box.y + 150);
        await page.keyboard.down('Shift');
        await page.mouse.down();
        await page.mouse.move(box.x + 350, box.y + 250);
        await page.mouse.up();
        await page.keyboard.up('Shift');

        // Verify both tiles are selected
        await expect(propertiesPanel).toContainText(/2 objects selected/i);

        // Verify Move tool is STILL active after releasing Shift
        await expect(moveTool).toHaveClass(/bg-blue-600/);
    });

    test('should allow Ctrl+Click additive selection from Link tool', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const selectTool = page.getByTestId('tool-select');
        const linkTool = page.getByTestId('tool-link');
        const propertiesPanel = page.getByTestId('properties-panel');

        // Place three tiles
        await basicTile.click();
        await clickCanvas(page, 200, 200);
        await clickCanvas(page, 300, 200);
        await clickCanvas(page, 400, 200);

        // Clear the tile selection by pressing ESC
        await page.keyboard.press('Escape');

        // Use Select tool to select first tile
        await selectTool.click();
        await clickCanvas(page, 200, 200);

        // Verify one object selected
        await expect(propertiesPanel).toContainText('Selected Object');

        // Now activate Link tool
        await linkTool.click();

        // Verify Link tool is active
        await expect(linkTool).toHaveClass(/bg-purple-600/);

        // Get canvas bounding box for coordinate calculations
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Hold Ctrl and click second tile (additive selection from Link tool)
        await page.keyboard.down('Control');
        await page.mouse.click(box.x + 300, box.y + 200);
        await page.keyboard.up('Control');

        // Verify two objects are selected (additive)
        await expect(propertiesPanel).toContainText(/2 objects selected/i);

        // Verify Link tool is STILL active after Ctrl+Click
        await expect(linkTool).toHaveClass(/bg-purple-600/);
    });
});
