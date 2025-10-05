import { expect, test } from '@playwright/test';
import { clickCanvas, getObjectCount } from './helpers';

test.describe('Tile Placement', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should place single platform tile with click', async ({ page }) => {
        const grassTile = page.getByTestId('tile-platform-grass');

        // Get initial object count
        const initialCount = await getObjectCount(page);

        // Select grass platform tile
        await grassTile.click();
        await expect(grassTile).toHaveAttribute('aria-pressed', 'true');

        // Click on canvas to place tile
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Object count should increase
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBeGreaterThanOrEqual(initialCount + 1);
    });

    test('should place multiple platform tiles with drag (painting mode)', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const objectCount = page.getByTestId('statusbar-object-count');

        // Get initial object count
        const initialCountText = await objectCount.textContent();
        const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Select basic platform tile
        await basicTile.click();
        await expect(basicTile).toHaveAttribute('aria-pressed', 'true');

        // Drag on canvas to paint multiple tiles
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        const startX = box.x + 100;
        const startY = box.y + 100;
        const endX = startX + 128; // Move across multiple grid cells (32px each)
        const endY = startY + 128;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 10 }); // Drag with steps to hit multiple tiles
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Object count should increase by more than 1 (multiple tiles painted)
        const finalCountText = await objectCount.textContent();
        const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeGreaterThan(initialCount + 1);
    });

    test('should place spawn point object', async ({ page }) => {
        const playerSpawn = page.getByTestId('tile-spawn-player');

        // Get initial object count
        const initialCount = await getObjectCount(page);

        // Select player spawn point
        await playerSpawn.click();
        await expect(playerSpawn).toHaveAttribute('aria-pressed', 'true');

        // Click on canvas to place spawn point
        await clickCanvas(page, 300, 300);
        await page.waitForTimeout(100);

        // Object count should increase
        const finalCount = await getObjectCount(page);
        expect(finalCount).toBeGreaterThanOrEqual(initialCount + 1);
    });

    test('should place interactable object (button)', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const objectCount = page.getByTestId('statusbar-object-count');

        // Get initial object count
        const initialCountText = await objectCount.textContent();
        const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Select button interactable
        await buttonTile.click();
        await expect(buttonTile).toHaveAttribute('aria-pressed', 'true');

        // Click on canvas to place button
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 400, box.y + 200);
        await page.waitForTimeout(100);

        // Object count should increase
        const finalCountText = await objectCount.textContent();
        const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeGreaterThanOrEqual(initialCount + 1);
    });

    test('painting mode should create batched undo entry', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const historyDisplay = page.getByTestId('statusbar-history');

        // Get initial history index
        const initialHistoryText = await historyDisplay.textContent();
        const initialHistoryMatch = initialHistoryText?.match(/(\d+)\/(\d+)/);
        const initialIndex = parseInt(initialHistoryMatch?.[1] || '0', 10);

        // Select basic platform tile
        await basicTile.click();

        // Drag to paint multiple tiles
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        const startX = box.x + 150;
        const startY = box.y + 150;
        const endX = startX + 96; // Cover ~3 tiles
        const endY = startY + 96;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 8 });
        await page.mouse.up();
        await page.waitForTimeout(100);

        // History should have increased by only 1 (batched), not by number of tiles
        const finalHistoryText = await historyDisplay.textContent();
        const finalHistoryMatch = finalHistoryText?.match(/(\d+)\/(\d+)/);
        const finalIndex = parseInt(finalHistoryMatch?.[1] || '0', 10);

        expect(finalIndex).toBe(initialIndex + 1);
    });

    test('single click tile placement should create individual undo entry', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const historyDisplay = page.getByTestId('statusbar-history');

        // Get initial history index
        const initialHistoryText = await historyDisplay.textContent();
        const initialHistoryMatch = initialHistoryText?.match(/(\d+)\/(\d+)/);
        const initialIndex = parseInt(initialHistoryMatch?.[1] || '0', 10);

        // Select grass platform tile
        await grassTile.click();

        // Click to place single tile
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 250, box.y + 250);
        await page.waitForTimeout(100);

        // History should increase by 1
        const finalHistoryText = await historyDisplay.textContent();
        const finalHistoryMatch = finalHistoryText?.match(/(\d+)\/(\d+)/);
        const finalIndex = parseInt(finalHistoryMatch?.[1] || '0', 10);

        expect(finalIndex).toBe(initialIndex + 1);
    });
});
