import { expect, test } from '@playwright/test';

test.describe('Toolbar', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should render Toolbar component', async ({ page }) => {
        const toolbar = page.getByTestId('toolbar');
        await expect(toolbar).toBeVisible();
    });

    test('should have selection tools in toolbar', async ({ page }) => {
        // Check for selection tools
        await expect(page.getByTestId('tool-select')).toBeVisible();
        await expect(page.getByTestId('tool-move')).toBeVisible();
    });

    test('should have drawing tools in toolbar', async ({ page }) => {
        // Check for drawing tools
        await expect(page.getByTestId('tool-line')).toBeVisible();
        await expect(page.getByTestId('tool-rectangle')).toBeVisible();
    });

    test('should have linking tools in toolbar', async ({ page }) => {
        await expect(page.getByTestId('tool-link')).toBeVisible();
    });

    test('should have zoom controls in toolbar', async ({ page }) => {
        await expect(page.getByTestId('button-zoom-in')).toBeVisible();
        await expect(page.getByTestId('button-zoom-out')).toBeVisible();
        await expect(page.getByTestId('button-reset-zoom')).toBeVisible();
        await expect(page.getByTestId('zoom-level')).toBeVisible();
    });

    test('should display current zoom level in toolbar', async ({ page }) => {
        // Wait for toolbar to be visible
        await expect(page.getByTestId('toolbar')).toBeVisible();
        const zoomLevel = page.getByTestId('zoom-level');
        // Zoom is calculated based on viewport, so just verify it displays a valid percentage
        await expect(zoomLevel).toHaveText(/^\d+%$/);
    });

    test('should have grid and scanlines toggles', async ({ page }) => {
        await expect(page.getByTestId('switch-show-grid')).toBeVisible();
        await expect(page.getByTestId('switch-show-scanlines')).toBeVisible();
    });

    test('should have properties panel toggle button', async ({ page }) => {
        const toggleButton = page.getByTestId('button-toggle-properties');
        await expect(toggleButton).toBeVisible();
    });

    test('should toggle properties panel when button clicked', async ({ page }) => {
        const toggleButton = page.getByTestId('button-toggle-properties');
        const propertiesPanel = page.getByTestId('properties-panel');

        // Initially visible
        await expect(propertiesPanel).toBeVisible();

        // Click to hide
        await toggleButton.click();
        await expect(propertiesPanel).not.toBeVisible();

        // Click to show again
        await toggleButton.click();
        await expect(propertiesPanel).toBeVisible();
    });

    test('should select tool when tool button clicked', async ({ page }) => {
        const selectTool = page.getByTestId('tool-select');
        const lineTool = page.getByTestId('tool-line');

        // Click select tool
        await selectTool.click();
        // Tool should be pressed
        await expect(selectTool).toHaveAttribute('aria-pressed', 'true');

        // Click line tool
        await lineTool.click();
        // Line tool should be pressed
        await expect(lineTool).toHaveAttribute('aria-pressed', 'true');
        // Select tool should no longer be pressed
        await expect(selectTool).toHaveAttribute('aria-pressed', 'false');
    });
});
