import { expect, test } from '@playwright/test';
import { getObjectCount } from './helpers';

test.describe('Drawing Tools', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test.describe('Line Tool', () => {
        test('should draw line with line tool', async ({ page }) => {
            const canvas = page.getByTestId('level-canvas');
            const basicTile = page.getByTestId('tile-platform-basic');
            const lineTool = page.getByTestId('tool-line');

            // Get initial count
            const initialCount = await getObjectCount(page);

            // Select tile type and switch to line tool
            await basicTile.click();
            await lineTool.click();
            await expect(lineTool).toHaveAttribute('aria-pressed', 'true');

            // Draw a line by dragging
            const box = await canvas.boundingBox();
            if (!box) throw new Error('Canvas not found');
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
            const finalCount = await getObjectCount(page);
            expect(finalCount).toBeGreaterThan(initialCount);
        });

        test('should cancel line drawing when ESC is pressed', async ({ page }) => {
            const canvas = page.getByTestId('level-canvas');
            const basicTile = page.getByTestId('tile-platform-basic');
            const lineTool = page.getByTestId('tool-line');

            // Get initial count
            const initialCount = await getObjectCount(page);

            // Select tile and line tool
            await basicTile.click();
            await lineTool.click();

            // Start dragging a line
            const box = await canvas.boundingBox();
            if (!box) throw new Error('Canvas not found');
            await page.mouse.move(box.x + 200, box.y + 200);
            await page.mouse.down();
            await page.mouse.move(box.x + 400, box.y + 400, { steps: 5 });

            // Press ESC while dragging (before mouseup)
            await page.keyboard.press('Escape');

            // Release mouse
            await page.mouse.up();
            await page.waitForTimeout(100);

            // Verify NO tiles were placed (count should not change)
            const finalCount = await getObjectCount(page);
            expect(finalCount).toBe(initialCount);

            // Line tool and tile selection should be cleared
            await expect(lineTool).toHaveAttribute('aria-pressed', 'false');
        });
    });

    test.describe('Rectangle Tool', () => {
        test('should draw rectangle with rectangle tool', async ({ page }) => {
            const canvas = page.getByTestId('level-canvas');
            const basicTile = page.getByTestId('tile-platform-basic');
            const rectangleTool = page.getByTestId('tool-rectangle');

            // Get initial count
            const initialCount = await getObjectCount(page);

            // Select tile type and switch to rectangle tool
            await basicTile.click();
            await rectangleTool.click();
            await expect(rectangleTool).toHaveAttribute('aria-pressed', 'true');

            // Draw a rectangle by dragging
            const box = await canvas.boundingBox();
            if (!box) throw new Error('Canvas not found');
            const startX = box.x + 200;
            const startY = box.y + 200;
            const endX = box.x + 360;
            const endY = box.y + 300;

            await page.mouse.move(startX, startY);
            await page.mouse.down();
            await page.mouse.move(endX, endY, { steps: 5 });
            await page.mouse.up();
            await page.waitForTimeout(100);

            // Verify tiles were placed as filled rectangle
            const finalCount = await getObjectCount(page);
            expect(finalCount).toBeGreaterThan(initialCount);
        });

        test('should cancel rectangle drawing when ESC is pressed', async ({ page }) => {
            const canvas = page.getByTestId('level-canvas');
            const basicTile = page.getByTestId('tile-platform-basic');
            const rectangleTool = page.getByTestId('tool-rectangle');

            // Get initial count
            const initialCount = await getObjectCount(page);

            // Select tile and rectangle tool
            await basicTile.click();
            await rectangleTool.click();

            // Start dragging a rectangle
            const box = await canvas.boundingBox();
            if (!box) throw new Error('Canvas not found');
            await page.mouse.move(box.x + 200, box.y + 200);
            await page.mouse.down();
            await page.mouse.move(box.x + 400, box.y + 400, { steps: 5 });

            // Press ESC while dragging (before mouseup)
            await page.keyboard.press('Escape');

            // Release mouse
            await page.mouse.up();
            await page.waitForTimeout(100);

            // Verify NO tiles were placed (count should not change)
            const finalCount = await getObjectCount(page);
            expect(finalCount).toBe(initialCount);

            // Rectangle tool and tile selection should be cleared
            await expect(rectangleTool).toHaveAttribute('aria-pressed', 'false');
        });
    });
});
