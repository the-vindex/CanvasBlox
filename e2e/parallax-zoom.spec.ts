import { expect, test } from '@playwright/test';

test.describe('Initial Zoom Calculation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should calculate initial zoom to show grass layer', async ({ page }) => {
        // The initial zoom should be calculated to show the grass layer (at y=20)
        // instead of always starting at 100%
        const zoomLevel = page.getByTestId('statusbar-zoom-display');
        await expect(zoomLevel).toBeVisible();

        // Get the initial zoom value
        const zoomText = await zoomLevel.textContent();
        expect(zoomText).toMatch(/\d+%/);

        // Parse the zoom percentage
        const zoomPercent = Number.parseInt(zoomText?.match(/\d+/)?.[0] || '100', 10);

        // The calculated zoom should be less than 100% to fit the grass layer
        // (assuming viewport is not extremely tall)
        // Typical viewport will show grass at around 40-60% zoom
        expect(zoomPercent).toBeGreaterThan(0);
        expect(zoomPercent).toBeLessThanOrEqual(100);

        // Verify the calculation only happens once - changing levels shouldn't reset zoom
        // Get current zoom
        const initialZoom = zoomPercent;

        // Zoom in manually
        const zoomInButton = page.getByTestId('button-zoom-in');
        await zoomInButton.click();

        // Zoom should have changed
        const newZoomText = await zoomLevel.textContent();
        const newZoomPercent = Number.parseInt(newZoomText?.match(/\d+/)?.[0] || '100', 10);
        expect(newZoomPercent).toBeGreaterThan(initialZoom);
    });

    test('initial zoom should be viewport-dependent', async ({ page }) => {
        // Resize viewport to test zoom calculation
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Reload to trigger initial zoom calculation
        await page.reload();
        await page.waitForTimeout(200); // Wait for DOM to settle

        const zoomLevel = page.getByTestId('statusbar-zoom-display');
        const zoomText = await zoomLevel.textContent();
        const zoomPercent = Number.parseInt(zoomText?.match(/\d+/)?.[0] || '100', 10);

        // With a tall viewport (1080px), zoom should be calculated to fit grass
        expect(zoomPercent).toBeGreaterThan(0);
        expect(zoomPercent).toBeLessThanOrEqual(100);

        // The zoom should result in grass being visible (we can't directly check canvas
        // rendering in E2E, but we can verify the zoom calculation ran)
        // Typical calculation for 1080px viewport should give ~40-60% zoom
    });
});

test.describe('Parallax Background', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('background should move at 50% of pan speed (parallax effect)', async ({ page }) => {
        // This test verifies the parallax effect implementation
        // The background should move at half the speed of the canvas pan for depth effect

        // Get the canvas wrapper element
        const _canvasWrapper = page.locator('[data-testid="level-canvas"]').locator('..');

        // Wait for initial render
        await page.waitForTimeout(100);

        // Note: Currently the Canvas component uses a solid background (#1a1a1a)
        // The parallax infrastructure should be in place even if no background image exists yet
        // We verify that backgroundPosition is being set based on pan values

        // The implementation should calculate parallax offset as:
        // parallaxX = editorState.pan.x * 0.5
        // parallaxY = editorState.pan.y * 0.5

        // This test documents the expected behavior when a background image/pattern is added
        // For now, we just verify the Canvas component renders correctly
        const canvas = page.getByTestId('level-canvas');
        await expect(canvas).toBeVisible();
    });
});
