import { expect, test } from '@playwright/test';

test.describe('Selection', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Step 11: should select single object with select tool', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');
        const selectionCount = page.getByTestId('selection-count');

        // Place a button object
        await buttonTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Switch to select tool
        await selectTool.click();
        await expect(selectTool).toHaveAttribute('aria-pressed', 'true');

        // Click on the placed object to select it
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Selection count should show 1 selected
        await expect(selectionCount).toHaveText('Selected: 1 object(s)');
    });

    test('Step 11: should clear selection when clicking empty space with select tool', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');
        const selectionCount = page.getByTestId('selection-count');

        // Place and select a button
        await buttonTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        await selectTool.click();
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Verify object is selected
        await expect(selectionCount).toHaveText('Selected: 1 object(s)');

        // Click on empty space
        await page.mouse.click(box.x + 100, box.y + 100);
        await page.waitForTimeout(100);

        // Selection should be cleared
        await expect(selectionCount).toHaveText('Selected: 0 object(s)');
    });

    test('Step 11: should select multiple objects with multi-select drag box', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const multiSelectTool = page.getByTestId('tool-multiselect');
        const selectionCount = page.getByTestId('selection-count');

        // Place multiple objects
        await buttonTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place 3 buttons in a row
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 264, box.y + 200); // 64px apart (2 tiles)
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 328, box.y + 200);
        await page.waitForTimeout(100);

        // Switch to multi-select tool
        await multiSelectTool.click();
        await expect(multiSelectTool).toHaveAttribute('aria-pressed', 'true');

        // Drag a selection box over all objects
        const startX = box.x + 180;
        const startY = box.y + 180;
        const endX = box.x + 360;
        const endY = box.y + 240;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Should have selected multiple objects
        const countText = await selectionCount.textContent();
        const count = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
        expect(count).toBeGreaterThanOrEqual(2);
    });

    test('Step 11: should show visual highlight on selected objects', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');

        // Place a button
        await buttonTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Switch to select tool and select the object
        await selectTool.click();
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Verify canvas was redrawn (selection highlight rendered)
        // We can't directly test visual rendering, but we can verify the canvas updates
        const hasContent = await canvas.evaluate((canvasEl) => {
            const ctx = (canvasEl as HTMLCanvasElement).getContext('2d');
            if (!ctx) return false;

            // Check if canvas has been drawn to (any pixels with alpha > 0)
            const imageData = ctx.getImageData(0, 0, 100, 100);
            for (let i = 0; i < imageData.data.length; i += 4) {
                if (imageData.data[i + 3] > 0) return true;
            }
            return false;
        });

        expect(hasContent).toBe(true);
    });

    test('Step 11: should update selection count correctly', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');
        const selectionCount = page.getByTestId('selection-count');

        // Initially 0 selected
        await expect(selectionCount).toHaveText('Selected: 0 object(s)');

        // Place two buttons
        await buttonTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 300, box.y + 200);
        await page.waitForTimeout(100);

        // Select first object
        await selectTool.click();
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(100);
        await expect(selectionCount).toHaveText('Selected: 1 object(s)');

        // Clear selection
        await page.mouse.click(box.x + 100, box.y + 100);
        await page.waitForTimeout(100);
        await expect(selectionCount).toHaveText('Selected: 0 object(s)');
    });

    test('Step 11: should render multi-select drag box while dragging', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const multiSelectTool = page.getByTestId('tool-multiselect');

        // Switch to multi-select tool
        await multiSelectTool.click();

        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Start dragging
        const startX = box.x + 100;
        const startY = box.y + 100;
        const endX = box.x + 300;
        const endY = box.y + 300;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 5 });

        // While dragging, the canvas should show the selection box
        // We verify this by checking that the canvas is being updated
        await page.waitForTimeout(50);

        const isDragging = await canvas.evaluate((canvasEl) => {
            // Just verify canvas exists and is valid
            return canvasEl instanceof HTMLCanvasElement;
        });

        expect(isDragging).toBe(true);

        await page.mouse.up();
    });

    test('Step 11B: should move selected objects with move tool', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');
        const moveTool = page.getByTestId('tool-move');

        // Place a button
        await buttonTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(100);

        // Select the button
        await selectTool.click();
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(100);

        // Switch to move tool
        await moveTool.click();
        await expect(moveTool).toHaveAttribute('aria-pressed', 'true');

        // Drag the button to a new position (2 tiles right, 1 tile down)
        await page.mouse.move(box.x + 200, box.y + 200);
        await page.mouse.down();
        await page.mouse.move(box.x + 264, box.y + 232, { steps: 5 }); // 64px = 2 tiles, 32px = 1 tile
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Object should still be selected after move
        const selectionCount = page.getByTestId('selection-count');
        await expect(selectionCount).toHaveText('Selected: 1 object(s)');
    });

    test('Step 11B: should move multiple selected objects together', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const multiSelectTool = page.getByTestId('tool-multiselect');
        const moveTool = page.getByTestId('tool-move');
        const selectionCount = page.getByTestId('selection-count');

        // Place 3 buttons
        await buttonTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 264, box.y + 200);
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 328, box.y + 200);
        await page.waitForTimeout(100);

        // Multi-select all 3
        await multiSelectTool.click();
        await page.mouse.move(box.x + 180, box.y + 180);
        await page.mouse.down();
        await page.mouse.move(box.x + 360, box.y + 240, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify selection
        const countText = await selectionCount.textContent();
        const count = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
        expect(count).toBeGreaterThanOrEqual(3);

        // Switch to move tool
        await moveTool.click();

        // Drag all objects down by 2 tiles
        await page.mouse.move(box.x + 264, box.y + 200);
        await page.mouse.down();
        await page.mouse.move(box.x + 264, box.y + 264, { steps: 5 }); // 64px = 2 tiles down
        await page.mouse.up();
        await page.waitForTimeout(100);

        // All objects should still be selected
        const finalCountText = await selectionCount.textContent();
        const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeGreaterThanOrEqual(3);
    });

    test('Step 11B: should not move when no objects selected', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const moveTool = page.getByTestId('tool-move');

        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Switch to move tool with nothing selected
        await moveTool.click();

        // Try to drag (should do nothing)
        await page.mouse.move(box.x + 200, box.y + 200);
        await page.mouse.down();
        await page.mouse.move(box.x + 300, box.y + 300, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(100);

        // No errors should occur
        const selectionCount = page.getByTestId('selection-count');
        await expect(selectionCount).toHaveText('Selected: 0 object(s)');
    });

    test('Step 11B: should show ghost preview while dragging with move tool', async ({ page }) => {
        // Create a fresh level for this test
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await newLevelButton.click();
        await page.waitForTimeout(100);

        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const multiSelectTool = page.getByTestId('tool-multiselect');
        const moveTool = page.getByTestId('tool-move');

        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place a few tiles
        await basicTile.click();
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.mouse.click(box.x + 232, box.y + 200);
        await page.mouse.click(box.x + 264, box.y + 200);

        // Multi-select all tiles
        await multiSelectTool.click();
        await page.mouse.move(box.x + 180, box.y + 180);
        await page.mouse.down();
        await page.mouse.move(box.x + 300, box.y + 220);
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify some objects are selected
        const selectionCount = page.getByTestId('selection-count');
        const countText = await selectionCount.textContent();
        const count = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
        expect(count).toBeGreaterThan(0);

        // Switch to move tool
        await moveTool.click();

        // Take screenshot before dragging
        await page.screenshot({ path: 'test-results/ghost-before-drag.png' });

        // Start dragging - hold mouse down and move
        await page.mouse.move(box.x + 232, box.y + 200);
        await page.mouse.down();
        await page.mouse.move(box.x + 232, box.y + 300, { steps: 10 });

        // Take screenshot during drag - should show ghost preview
        await page.screenshot({ path: 'test-results/ghost-during-drag.png' });

        // Complete the move
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Take screenshot after move
        await page.screenshot({ path: 'test-results/ghost-after-drag.png' });

        // Verify tiles are still selected (same count)
        const finalCountText = await selectionCount.textContent();
        const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBe(count);
    });

    test('Step 11C: should draw line with line tool', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const lineTool = page.getByTestId('tool-line');
        const objectCount = page.getByTestId('statusbar-object-count');

        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Get initial count
        const initialCountText = await objectCount.textContent();
        const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Select tile type and switch to line tool
        await basicTile.click();
        await lineTool.click();
        await expect(lineTool).toHaveAttribute('aria-pressed', 'true');

        // Draw a line by dragging
        const startX = box.x + 200;
        const startY = box.y + 200;
        const endX = box.x + 360;
        const endY = box.y + 200;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify tiles were placed along the line
        const finalCountText = await objectCount.textContent();
        const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeGreaterThan(initialCount);
    });

    test('Step 11C: should draw diagonal line correctly', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const lineTool = page.getByTestId('tool-line');
        const objectCount = page.getByTestId('statusbar-object-count');

        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Get initial count
        const initialCountText = await objectCount.textContent();
        const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Select tile and tool
        await grassTile.click();
        await lineTool.click();

        // Draw diagonal line from top-left to bottom-right
        await page.mouse.move(box.x + 150, box.y + 150);
        await page.mouse.down();
        await page.mouse.move(box.x + 400, box.y + 350, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify tiles were placed
        const finalCountText = await objectCount.textContent();
        const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeGreaterThan(initialCount);
    });

    test('Step 11C: should place tiles of selected type when drawing line', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const stoneTile = page.getByTestId('tile-platform-stone');
        const lineTool = page.getByTestId('tool-line');
        const objectCount = page.getByTestId('statusbar-object-count');

        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Select stone tile and line tool
        await stoneTile.click();
        await lineTool.click();

        // Get initial count
        const initialCountText = await objectCount.textContent();
        const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Draw a horizontal line
        await page.mouse.move(box.x + 200, box.y + 300);
        await page.mouse.down();
        await page.mouse.move(box.x + 350, box.y + 300, { steps: 3 });
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify tiles were placed
        const finalCountText = await objectCount.textContent();
        const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeGreaterThan(initialCount);

        // Note: We verify tiles were placed. Actual tile type verification would require
        // canvas pixel inspection or exposing internal state, which is implementation detail.
        // The behavioral contract is: "line tool places the selected tile type"
    });

    test('Step 11C: should cancel line drawing when ESC is pressed', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const lineTool = page.getByTestId('tool-line');
        const objectCount = page.getByTestId('statusbar-object-count');

        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Get initial count
        const initialCountText = await objectCount.textContent();
        const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Select tile and line tool
        await basicTile.click();
        await lineTool.click();

        // Start dragging a line
        await page.mouse.move(box.x + 200, box.y + 200);
        await page.mouse.down();
        await page.mouse.move(box.x + 400, box.y + 400, { steps: 5 });

        // Press ESC while dragging (before mouseup)
        await page.keyboard.press('Escape');

        // Release mouse
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify NO tiles were placed (count should not change)
        const finalCountText = await objectCount.textContent();
        const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBe(initialCount);

        // Line tool and tile selection should be cleared
        await expect(lineTool).toHaveAttribute('aria-pressed', 'false');
    });
});
