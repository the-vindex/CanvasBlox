import { expect, test } from '@playwright/test';

test.describe('Multi-Select Properties Panel', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should show object count and type breakdown when multiple objects selected', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');

        // Place two platform tiles
        await page.getByTestId('tile-platform-basic').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        await canvas.click({ position: { x: 150, y: 100 } });

        // Place one button
        await page.getByTestId('tile-button').click();
        await canvas.click({ position: { x: 200, y: 100 } });

        // Escape to clear palette
        await page.keyboard.press('Escape');

        // Select all three objects using Ctrl+Click
        await page.getByTestId('tool-select').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        await page.keyboard.down('Control');
        await canvas.click({ position: { x: 150, y: 100 } });
        await canvas.click({ position: { x: 200, y: 100 } });
        await page.keyboard.up('Control');

        // Verify properties panel shows multi-select UI
        const panel = page.getByTestId('properties-panel');
        await expect(panel).toContainText('3 objects selected');

        // Verify type breakdown (2 platforms, 1 button)
        await expect(panel).toContainText('2 Platform - Basics');
        await expect(panel).toContainText('1 Button');
    });

    test('should allow batch editing of layer property', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');

        // Place two tiles
        await page.getByTestId('tile-platform-basic').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        await canvas.click({ position: { x: 150, y: 100 } });

        // Escape to clear palette
        await page.keyboard.press('Escape');

        // Select both tiles using Ctrl+Click
        await page.getByTestId('tool-select').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        await page.keyboard.down('Control');
        await canvas.click({ position: { x: 150, y: 100 } });
        await page.keyboard.up('Control');

        // Change layer to 5 for both objects
        const layerInput = page.getByTestId('input-batch-layer');
        await layerInput.clear();
        await layerInput.fill('5');
        await layerInput.blur();

        // Select first object individually to verify layer was updated
        await page.getByTestId('tool-select').click();
        await canvas.click({ position: { x: 100, y: 100 } });

        const singleLayerInput = page.getByTestId('input-object-layer');
        await expect(singleLayerInput).toHaveValue('5');
    });

    test('should show "Mixed" placeholder when property values differ', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');

        // Place two tiles at different layers
        await page.getByTestId('tile-platform-basic').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        await canvas.click({ position: { x: 150, y: 100 } });

        // Escape to clear palette
        await page.keyboard.press('Escape');

        // Select first tile and set layer to 0
        await page.getByTestId('tool-select').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        const layerInput1 = page.getByTestId('input-object-layer');
        await layerInput1.clear();
        await layerInput1.fill('0');
        await layerInput1.blur();

        // Select second tile and set layer to 5
        await canvas.click({ position: { x: 150, y: 100 } });
        const layerInput2 = page.getByTestId('input-object-layer');
        await layerInput2.clear();
        await layerInput2.fill('5');
        await layerInput2.blur();

        // Select both tiles using Ctrl+Click
        await canvas.click({ position: { x: 100, y: 100 } });
        await page.keyboard.down('Control');
        await canvas.click({ position: { x: 150, y: 100 } });
        await page.keyboard.up('Control');

        // Verify layer input shows "Mixed" placeholder
        const batchLayerInput = page.getByTestId('input-batch-layer');
        await expect(batchLayerInput).toHaveAttribute('placeholder', 'Mixed');
    });

    test('should update all selected objects when editing mixed values', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');

        // Place two tiles at different layers
        await page.getByTestId('tile-platform-basic').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        await canvas.click({ position: { x: 150, y: 100 } });

        // Escape to clear palette
        await page.keyboard.press('Escape');

        // Select first tile and set layer to 0
        await page.getByTestId('tool-select').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        const layerInput1 = page.getByTestId('input-object-layer');
        await layerInput1.clear();
        await layerInput1.fill('0');
        await layerInput1.blur();

        // Select second tile and set layer to 5
        await canvas.click({ position: { x: 150, y: 100 } });
        const layerInput2 = page.getByTestId('input-object-layer');
        await layerInput2.clear();
        await layerInput2.fill('5');
        await layerInput2.blur();

        // Select both tiles
        await canvas.click({ position: { x: 100, y: 100 } });
        await page.keyboard.down('Control');
        await canvas.click({ position: { x: 150, y: 100 } });
        await page.keyboard.up('Control');

        // Change layer to 10 for both objects (replacing mixed values)
        const batchLayerInput = page.getByTestId('input-batch-layer');
        await batchLayerInput.fill('10');
        await batchLayerInput.blur();

        // Verify both objects now have layer 10
        await canvas.click({ position: { x: 100, y: 100 } });
        await expect(page.getByTestId('input-object-layer')).toHaveValue('10');

        await canvas.click({ position: { x: 150, y: 100 } });
        await expect(page.getByTestId('input-object-layer')).toHaveValue('10');
    });

    test('should support undo/redo for batch edits', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');

        // Place two tiles
        await page.getByTestId('tile-platform-basic').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        await canvas.click({ position: { x: 150, y: 100 } });

        // Escape to clear palette
        await page.keyboard.press('Escape');

        // Select both tiles using Ctrl+Click
        await page.getByTestId('tool-select').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        await page.keyboard.down('Control');
        await canvas.click({ position: { x: 150, y: 100 } });
        await page.keyboard.up('Control');

        // Change layer to 7
        const batchLayerInput = page.getByTestId('input-batch-layer');
        await batchLayerInput.fill('7');
        await batchLayerInput.blur();

        // Undo the batch edit
        await page.keyboard.press('Control+z');

        // Verify layer was reverted
        await page.getByTestId('tool-select').click();
        await canvas.click({ position: { x: 100, y: 100 } });
        await expect(page.getByTestId('input-object-layer')).toHaveValue('0');

        // Redo
        await page.keyboard.press('Control+y');

        // Verify both objects have layer 7 after redo
        await canvas.click({ position: { x: 100, y: 100 } });
        await expect(page.getByTestId('input-object-layer')).toHaveValue('7');

        await canvas.click({ position: { x: 150, y: 100 } });
        await expect(page.getByTestId('input-object-layer')).toHaveValue('7');
    });
});
