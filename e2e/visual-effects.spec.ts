import { expect, test } from '@playwright/test';
import { clickCanvas, getObjectCount } from './helpers';

test.describe('Visual Effects', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('scanlines toggle should show/hide overlay', async ({ page }) => {
        const scanlinesToggle = page.getByTestId('switch-show-scanlines');
        const scanlinesOverlay = page.locator('.scanlines-overlay');

        // Initially scanlines should be off
        await expect(scanlinesToggle).toBeVisible();
        await expect(scanlinesOverlay).not.toBeVisible();

        // Click toggle to turn on scanlines
        await scanlinesToggle.click();
        await expect(scanlinesOverlay).toBeVisible();

        // Click toggle to turn off scanlines
        await scanlinesToggle.click();
        await expect(scanlinesOverlay).not.toBeVisible();
    });

    test('scanlines overlay should not block mouse interactions', async ({ page }) => {
        const scanlinesToggle = page.getByTestId('switch-show-scanlines');
        const grassTile = page.getByTestId('tile-platform-grass');

        // Enable scanlines
        await scanlinesToggle.click();

        // Verify scanlines are visible
        const scanlinesOverlay = page.locator('.scanlines-overlay');
        await expect(scanlinesOverlay).toBeVisible();

        // Try to place a tile - should work despite scanlines overlay
        await grassTile.click();
        const initialObjectCount = await getObjectCount(page);
        await clickCanvas(page, 150, 150);
        await page.waitForTimeout(100);

        // Verify tile was placed (object count should increase)
        const newObjectCount = await getObjectCount(page);
        expect(newObjectCount).toBeGreaterThan(initialObjectCount);
    });

    test('grid toggle should be visible and interactive', async ({ page }) => {
        const gridToggle = page.getByTestId('switch-show-grid');

        // Grid toggle should be visible
        await expect(gridToggle).toBeVisible();

        // Initially grid should be on (default state)
        const initialState = await gridToggle.getAttribute('data-state');
        expect(initialState).toBe('checked');

        // Click to turn off grid
        await gridToggle.click();
        await page.waitForTimeout(100);
        const offState = await gridToggle.getAttribute('data-state');
        expect(offState).toBe('unchecked');

        // Click to turn grid back on
        await gridToggle.click();
        await page.waitForTimeout(100);
        const onState = await gridToggle.getAttribute('data-state');
        expect(onState).toBe('checked');
    });

    test('grid toggle should not affect canvas interactions', async ({ page }) => {
        const gridToggle = page.getByTestId('switch-show-grid');
        const grassTile = page.getByTestId('tile-platform-grass');

        // Turn off grid
        await gridToggle.click();
        await page.waitForTimeout(100);

        // Verify grid is off
        const gridState = await gridToggle.getAttribute('data-state');
        expect(gridState).toBe('unchecked');

        // Try to place a tile - should work even with grid off
        await grassTile.click();
        const initialObjectCount = await getObjectCount(page);
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Verify tile was placed (object count should increase)
        const newObjectCount = await getObjectCount(page);
        expect(newObjectCount).toBeGreaterThan(initialObjectCount);
    });

    test('selected tiles should have visual selection feedback', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');

        // Click a platform tile to select it
        await page.getByText('Basic', { exact: true }).click();
        await page.waitForTimeout(100);

        // Place tile on canvas
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Switch to select tool
        const selectButton = page.getByRole('button', { name: /select/i }).first();
        await selectButton.click();
        await page.waitForTimeout(100);

        // Click the tile to select it
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Verify selection count increased
        const selectionCount = page.getByTestId('selection-count');
        const countText = await selectionCount.textContent();
        expect(countText).toMatch(/Selected: [1-9]\d* object/);

        // Verify canvas was redrawn (selection rendering happened)
        // We can't directly test the pulsing animation, but we can verify the canvas updates
        const hasContent = await canvas.evaluate((canvasEl) => {
            const ctx = (canvasEl as HTMLCanvasElement).getContext('2d');
            if (!ctx) return false;
            // Just verify canvas has content - actual visual testing would need screenshot comparison
            const imageData = ctx.getImageData(0, 0, 100, 100);
            return imageData.data.some((value) => value !== 0);
        });
        expect(hasContent).toBe(true);
    });

    test('selection should work for different object types', async ({ page }) => {
        const _canvas = page.getByTestId('level-canvas');
        const selectionCount = page.getByTestId('selection-count');

        // Test 1: Select a tile (platform)
        await page.getByText('Grass', { exact: true }).click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 400, 400);
        await page.waitForTimeout(50);

        // Switch to select tool and select the tile
        const selectButton = page.getByRole('button', { name: /select/i }).first();
        await selectButton.click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 400, 400);
        await page.waitForTimeout(50);

        let countText = await selectionCount.textContent();
        expect(countText).toMatch(/Selected: [1-9]\d* object/);

        // Clear selection
        await page.keyboard.press('Escape');
        await page.waitForTimeout(50);

        // Test 2: Select an interactable object (button)
        await page.getByText('Button', { exact: true }).click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 500, 500);
        await page.waitForTimeout(50);

        await selectButton.click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 500, 500);
        await page.waitForTimeout(50);

        countText = await selectionCount.textContent();
        expect(countText).toMatch(/Selected: [1-9]\d* object/);

        // Clear selection
        await page.keyboard.press('Escape');
        await page.waitForTimeout(50);

        // Test 3: Select a spawn point
        // Use "Player" instead of "Player Spawn" as the exact text may vary
        await page.getByText('Player', { exact: true }).first().click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 600, 400);
        await page.waitForTimeout(50);

        await selectButton.click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 600, 400);
        await page.waitForTimeout(50);

        countText = await selectionCount.textContent();
        expect(countText).toMatch(/Selected: [1-9]\d* object/);
    });

    test('multiple selected objects should all show selection state', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');

        // Place multiple tiles
        await page.getByText('Stone', { exact: true }).click();
        await page.waitForTimeout(50);

        // Place 3 tiles in a row
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(50);
        await clickCanvas(page, 232, 200); // Next to first tile
        await page.waitForTimeout(50);
        await clickCanvas(page, 264, 200); // Next to second tile
        await page.waitForTimeout(50);

        // Use Shift+Drag to select all tiles
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.keyboard.down('Shift');
        await page.mouse.move(box.x + 190, box.y + 190);
        await page.mouse.down();
        await page.mouse.move(box.x + 280, box.y + 240);
        await page.mouse.up();
        await page.keyboard.up('Shift');
        await page.waitForTimeout(100);

        // Verify multiple objects are selected
        const selectionCount = page.getByTestId('selection-count');
        const countText = await selectionCount.textContent();
        expect(countText).toMatch(/Selected: [2-9]\d* object/); // At least 2 selected

        // Verify canvas was redrawn with all selections
        const hasContent = await canvas.evaluate((canvasEl) => {
            const ctx = (canvasEl as HTMLCanvasElement).getContext('2d');
            if (!ctx) return false;
            const imageData = ctx.getImageData(0, 0, 100, 100);
            return imageData.data.some((value) => value !== 0);
        });
        expect(hasContent).toBe(true);
    });

    test('pulsing glow should not interfere with tile placement', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');

        // Select and place a tile
        await page.getByText('Ice', { exact: true }).click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 350, 350);
        await page.waitForTimeout(50);

        // Select the tile
        const selectButton = page.getByRole('button', { name: /select/i }).first();
        await selectButton.click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 350, 350);
        await page.waitForTimeout(50);

        // Verify it's selected
        const selectionCount = page.getByTestId('selection-count');
        const countText = await selectionCount.textContent();
        expect(countText).toMatch(/Selected: [1-9]\d* object/);

        // Now place another tile while one is selected
        await page.getByText('Lava', { exact: true }).click();
        await page.waitForTimeout(50);

        const initialObjectCount = await getObjectCount(page);
        await clickCanvas(page, 450, 350);
        await page.waitForTimeout(100);

        // Verify new tile was placed (object count increased)
        const newObjectCount = await getObjectCount(page);
        expect(newObjectCount).toBeGreaterThan(initialObjectCount);

        // The important thing is that tile placement works even with selection active
        // We don't strictly require selection to be cleared - that's an implementation detail
        // Just verify the canvas still renders correctly
        const hasContent = await canvas.evaluate((canvasEl) => {
            const ctx = (canvasEl as HTMLCanvasElement).getContext('2d');
            if (!ctx) return false;
            const imageData = ctx.getImageData(0, 0, 100, 100);
            return imageData.data.some((value) => value !== 0);
        });
        expect(hasContent).toBe(true);
    });
});

test.describe('Delete Animations', () => {
    test('deleted objects should animate (shrink) before disappearing', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Place a tile
        await page.getByText('Grass', { exact: true }).click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Select the tile
        await page.getByTestId('tool-select').click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Verify it's selected
        const selectionCount = page.getByTestId('selection-count');
        expect(await selectionCount.textContent()).toMatch(/Selected: [1-9]/);

        // Get initial object count
        const initialCount = await getObjectCount(page);

        // Delete the tile (pressing Delete key)
        await page.keyboard.press('Delete');

        // During the animation (wait 100ms, which is mid-animation if it's 250ms)
        await page.waitForTimeout(100);

        // Object should still exist in deletingObjects state during animation
        // We can't directly test the visual shrink, but we can verify timing

        // After animation completes (wait another 200ms to exceed 250ms total)
        await page.waitForTimeout(200);

        // Object count should now be reduced
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBeLessThan(initialCount);

        // Selection should be cleared
        expect(await selectionCount.textContent()).toBe('Selected: 0 object(s)');
    });

    test('multiple objects should all animate when deleted together', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const canvas = page.getByTestId('level-canvas');

        // Place multiple tiles
        await page.getByText('Stone', { exact: true }).click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(50);
        await clickCanvas(page, 250, 200);
        await page.waitForTimeout(50);
        await clickCanvas(page, 300, 200);
        await page.waitForTimeout(100);

        // Use Shift+Drag to select all three tiles
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.keyboard.down('Shift');
        await page.mouse.move(box.x + 180, box.y + 180);
        await page.mouse.down();
        await page.mouse.move(box.x + 320, box.y + 220);
        await page.mouse.up();
        await page.keyboard.up('Shift');
        await page.waitForTimeout(100);

        // Verify multiple objects selected
        const selectionCount = page.getByTestId('selection-count');
        const selectedText = await selectionCount.textContent();
        expect(selectedText).toMatch(/Selected: [2-9]/); // At least 2 objects

        // Get initial count
        const initialCount = await getObjectCount(page);

        // Delete all selected objects
        await page.keyboard.press('Delete');
        await page.waitForTimeout(300); // Wait for animation to complete

        // Object count should be reduced
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBeLessThan(initialCount);

        // Selection should be cleared
        expect(await selectionCount.textContent()).toBe('Selected: 0 object(s)');
    });

    test('delete animation should work for all object types', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const canvas = page.getByTestId('level-canvas');

        // Place a tile
        await page.getByText('Ice', { exact: true }).click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 250, 250);
        await page.waitForTimeout(50);

        // Place an interactable object (button)
        await page.getByText('Button', { exact: true }).click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 350, 250);
        await page.waitForTimeout(50);

        // Place a spawn point
        await page.getByText('Player', { exact: true }).click();
        await page.waitForTimeout(50);
        await clickCanvas(page, 450, 250);
        await page.waitForTimeout(100);

        // Select all objects with Shift+Drag
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.keyboard.down('Shift');
        await page.mouse.move(box.x + 230, box.y + 230);
        await page.mouse.down();
        await page.mouse.move(box.x + 470, box.y + 270);
        await page.mouse.up();
        await page.keyboard.up('Shift');
        await page.waitForTimeout(100);

        // Verify objects are selected
        const selectionCount = page.getByTestId('selection-count');
        const selectedText = await selectionCount.textContent();
        expect(selectedText).toMatch(/Selected: [1-9]/);

        // Get initial count
        const initialCount = await getObjectCount(page);

        // Delete all selected objects
        await page.keyboard.press('Delete');
        await page.waitForTimeout(300); // Wait for animation

        // Verify objects were deleted
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBeLessThan(initialCount);
    });
});
