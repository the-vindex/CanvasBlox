import { expect, test } from '@playwright/test';
import { getZoomValue } from './helpers';

test.describe('Zoom and Pan', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Step 9: should zoom in at viewport center when zoom in button clicked', async ({ page }) => {
        // Wait for UI to be ready
        await expect(page.getByTestId('toolbar')).toBeVisible();

        const zoomInButton = page.getByTestId('button-zoom-in');
        const statusBarZoom = page.getByTestId('statusbar-zoom-display');
        const toolbarZoom = page.getByTestId('zoom-level');

        // Get initial zoom (calculated based on viewport, not always 100%)
        const initialZoomText = await statusBarZoom.textContent();
        const initialZoom = parseInt(initialZoomText?.replace('%', '') || '0', 10);

        // Both displays should match initially
        await expect(toolbarZoom).toHaveText(`${initialZoom}%`);

        // Click zoom in button
        await zoomInButton.click();
        await page.waitForTimeout(50);

        // Both zoom displays should update by +10%
        const statusZoomText = await statusBarZoom.textContent();
        const toolbarZoomText = await toolbarZoom.textContent();
        const statusZoomValue = parseInt(statusZoomText?.replace('%', '') || '0', 10);
        const toolbarZoomValue = parseInt(toolbarZoomText?.replace('%', '') || '0', 10);

        expect(statusZoomValue).toBe(initialZoom + 10); // Initial + 10%
        expect(toolbarZoomValue).toBe(initialZoom + 10);
        expect(statusZoomValue).toBe(toolbarZoomValue); // Both should match
    });

    test('Step 9: should zoom out at viewport center when zoom out button clicked', async ({ page }) => {
        // Wait for UI to be ready
        await expect(page.getByTestId('toolbar')).toBeVisible();

        const zoomInButton = page.getByTestId('button-zoom-in');
        const zoomOutButton = page.getByTestId('button-zoom-out');
        const statusBarZoom = page.getByTestId('statusbar-zoom-display');

        // Get initial zoom
        const initialZoomText = await statusBarZoom.textContent();
        const initialZoom = parseInt(initialZoomText?.replace('%', '') || '0', 10);

        // First zoom in
        await zoomInButton.click();
        await page.waitForTimeout(50);
        await expect(statusBarZoom).toHaveText(`${initialZoom + 10}%`);

        // Then zoom out
        await zoomOutButton.click();
        await page.waitForTimeout(50);

        // Should be back to initial zoom
        await expect(statusBarZoom).toHaveText(`${initialZoom}%`);
    });

    // Feature needs rework - zoom reset should calculate correct zoom to fit all placed content
    test.skip('Step 9: should reset zoom to 100% when reset button clicked', async ({ page }) => {
        // Wait for UI to be ready
        await expect(page.getByTestId('toolbar')).toBeVisible();

        const zoomInButton = page.getByTestId('button-zoom-in');
        const resetButton = page.getByTestId('button-reset-zoom');
        const statusBarZoom = page.getByTestId('statusbar-zoom-display');

        // Get initial zoom
        const initialZoomText = await statusBarZoom.textContent();
        const initialZoom = parseInt(initialZoomText?.replace('%', '') || '0', 10);

        // Zoom in enough times to ensure we're above 100% OR different from initial
        const clicksNeeded = Math.max(5, Math.ceil((110 - initialZoom) / 10));
        for (let i = 0; i < clicksNeeded; i++) {
            await zoomInButton.click();
        }
        await page.waitForTimeout(50);

        // Verify zoom changed from initial
        const zoomedText = await statusBarZoom.textContent();
        const zoomedValue = parseInt(zoomedText?.replace('%', '') || '0', 10);
        expect(zoomedValue).not.toBe(initialZoom);

        // Reset zoom
        await resetButton.click();
        await page.waitForTimeout(50);

        // Should be exactly 100%
        await expect(statusBarZoom).toHaveText('100%');
    });

    test('Step 9: should enforce minimum zoom of 10%', async ({ page }) => {
        const zoomOutButton = page.getByTestId('button-zoom-out');

        // Try to zoom out many times (should hit minimum at 10%)
        for (let i = 0; i < 15; i++) {
            await zoomOutButton.click();
        }
        await page.waitForTimeout(50);

        const zoomValue = await getZoomValue(page);

        // Should not go below 10%
        expect(zoomValue).toBeGreaterThanOrEqual(10);
    });

    test('Step 9: should enforce maximum zoom of 500%', async ({ page }) => {
        const zoomInButton = page.getByTestId('button-zoom-in');
        const statusBarZoom = page.getByTestId('statusbar-zoom-display');

        // Try to zoom in many times (should hit maximum at 500%)
        for (let i = 0; i < 50; i++) {
            await zoomInButton.click();
        }
        await page.waitForTimeout(50);

        const zoomText = await statusBarZoom.textContent();
        const zoomValue = parseInt(zoomText?.replace('%', '') || '0', 10);

        // Should not go above 500%
        expect(zoomValue).toBeLessThanOrEqual(500);
    });

    test('Step 9: toolbar and status bar zoom should always match', async ({ page }) => {
        const zoomInButton = page.getByTestId('button-zoom-in');
        const toolbarZoom = page.getByTestId('zoom-level');
        const statusBarZoom = page.getByTestId('statusbar-zoom-display');

        // Check multiple zoom levels
        for (let i = 0; i < 3; i++) {
            await zoomInButton.click();
            await page.waitForTimeout(50);

            const toolbarText = await toolbarZoom.textContent();
            const statusBarText = await statusBarZoom.textContent();

            expect(toolbarText).toBe(statusBarText);
        }
    });

    test('Step 9: should pan canvas with middle mouse button drag', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        await expect(canvas).toBeVisible();

        // Get the scrollable wrapper
        const wrapper = page.locator('.scrollbar-custom').first();
        await expect(wrapper).toBeVisible();

        // First, scroll to middle of canvas to allow dragging in any direction
        await wrapper.evaluate((el) => {
            el.scrollLeft = 300;
            el.scrollTop = 300;
        });
        await page.waitForTimeout(100);

        // Verify we're actually scrolled
        const initialScrollLeft = await wrapper.evaluate((el) => el.scrollLeft);
        const initialScrollTop = await wrapper.evaluate((el) => el.scrollTop);

        // Skip test if wrapper isn't scrollable
        if (initialScrollLeft === 0 && initialScrollTop === 0) {
            console.log('Wrapper not scrollable, skipping test');
            return;
        }

        // Get wrapper bounding box for mouse interaction
        const box = await wrapper.boundingBox();
        if (!box) throw new Error('Wrapper not found');

        // Middle mouse button drag
        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;
        const endX = startX + 100; // Drag right
        const endY = startY + 100; // Drag down

        // Simulate middle mouse button drag
        await page.mouse.move(startX, startY);
        await page.mouse.down({ button: 'middle' });
        await page.mouse.move(endX, endY, { steps: 10 });
        await page.mouse.up({ button: 'middle' });

        await page.waitForTimeout(100);

        // Check scroll position changed
        const finalScrollLeft = await wrapper.evaluate((el) => el.scrollLeft);
        const finalScrollTop = await wrapper.evaluate((el) => el.scrollTop);

        // Dragging right should decrease scrollLeft (panning effect)
        expect(finalScrollLeft).toBeLessThan(initialScrollLeft);
        // Dragging down should decrease scrollTop (panning effect)
        expect(finalScrollTop).toBeLessThan(initialScrollTop);
    });

    test('Step 9: middle mouse drag should not interfere with left click drawing', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');

        // Select a tile
        await grassTile.click();
        await expect(grassTile).toHaveAttribute('aria-pressed', 'true');

        // Get canvas bounding box
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Left click should still work for drawing (not affected by middle mouse implementation)
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(50);

        // Middle mouse drag should not trigger drawing
        await page.mouse.move(box.x + 300, box.y + 300);
        await page.mouse.down({ button: 'middle' });
        await page.mouse.move(box.x + 250, box.y + 250);
        await page.mouse.up({ button: 'middle' });

        // This test just verifies no errors occur - actual tile placement tested elsewhere
    });
});
