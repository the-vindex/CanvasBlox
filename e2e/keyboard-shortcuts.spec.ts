import { expect, test } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should select tool with V shortcut', async ({ page }) => {
        const selectTool = page.getByTestId('tool-select');
        await expect(selectTool).toBeVisible();

        // Press V key
        await page.keyboard.press('v');

        // Select tool should be selected
        await expect(selectTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('should select multi-select tool with M shortcut', async ({ page }) => {
        const multiSelectTool = page.getByTestId('tool-multiselect');
        await expect(multiSelectTool).toBeVisible();

        // Press M key
        await page.keyboard.press('m');

        // Multi-select tool should be selected
        await expect(multiSelectTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('should select move tool with H shortcut', async ({ page }) => {
        const moveTool = page.getByTestId('tool-move');
        await expect(moveTool).toBeVisible();

        // Press H key
        await page.keyboard.press('h');

        // Move tool should be selected
        await expect(moveTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('should select line tool with L shortcut', async ({ page }) => {
        const lineTool = page.getByTestId('tool-line');
        await expect(lineTool).toBeVisible();

        // Press L key
        await page.keyboard.press('l');

        // Line tool should be selected
        await expect(lineTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('should select rectangle tool with R shortcut', async ({ page }) => {
        const rectangleTool = page.getByTestId('tool-rectangle');
        await expect(rectangleTool).toBeVisible();

        // Press R key
        await page.keyboard.press('r');

        // Rectangle tool should be selected
        await expect(rectangleTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('should select link tool with K shortcut', async ({ page }) => {
        const linkTool = page.getByTestId('tool-link');
        await expect(linkTool).toBeVisible();

        // Press K key
        await page.keyboard.press('k');

        // Link tool should be selected
        await expect(linkTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('should select pen tool with B shortcut', async ({ page }) => {
        const penTool = page.getByTestId('tool-pen');
        await expect(penTool).toBeVisible();

        // Press B key
        await page.keyboard.press('b');

        // Pen tool should be selected
        await expect(penTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('Drawing Mode Tools - should auto-select pen and preserve tile when switching tools', async ({ page }) => {
        const grassTile = page.getByTestId('tile-platform-grass');
        const penTool = page.getByTestId('tool-pen');
        const lineTool = page.getByTestId('tool-line');

        // Select tile - pen should auto-select
        await grassTile.click();
        await expect(penTool).toHaveAttribute('aria-pressed', 'true');
        await expect(grassTile).toHaveAttribute('aria-pressed', 'true');

        // Switch to line tool - tile should be preserved
        await page.keyboard.press('l');
        await expect(lineTool).toHaveAttribute('aria-pressed', 'true');
        await expect(grassTile).toHaveAttribute('aria-pressed', 'true');
    });

    test('Drawing Mode Tools - should clear tile when switching to non-drawing tool', async ({ page }) => {
        const grassTile = page.getByTestId('tile-platform-grass');
        const penTool = page.getByTestId('tool-pen');
        const selectTool = page.getByTestId('tool-select');

        // Select tile (pen auto-selects)
        await grassTile.click();
        await expect(penTool).toHaveAttribute('aria-pressed', 'true');
        await expect(grassTile).toHaveAttribute('aria-pressed', 'true');

        // Switch to select tool (non-drawing)
        await page.keyboard.press('v');
        await expect(selectTool).toHaveAttribute('aria-pressed', 'true');
        await expect(grassTile).toHaveAttribute('aria-pressed', 'false');
    });

    test('Drawing Mode Tools - Escape should clear both tool and tile', async ({ page }) => {
        const grassTile = page.getByTestId('tile-platform-grass');
        const lineTool = page.getByTestId('tool-line');

        // Select tile and switch to line tool
        await grassTile.click();
        await page.keyboard.press('l');
        await expect(lineTool).toHaveAttribute('aria-pressed', 'true');
        await expect(grassTile).toHaveAttribute('aria-pressed', 'true');

        // Press Escape
        await page.keyboard.press('Escape');

        // Both tool and tile should be cleared
        await expect(lineTool).toHaveAttribute('aria-pressed', 'false');
        await expect(grassTile).toHaveAttribute('aria-pressed', 'false');
    });

    test('should toggle properties panel with P shortcut', async ({ page }) => {
        const propertiesPanel = page.getByTestId('properties-panel');

        // Initially visible
        await expect(propertiesPanel).toBeVisible();

        // Press P key to hide
        await page.keyboard.press('p');
        await expect(propertiesPanel).not.toBeVisible();

        // Press P key again to show
        await page.keyboard.press('p');
        await expect(propertiesPanel).toBeVisible();
    });

    test('should not trigger shortcuts when typing in input fields', async ({ page }) => {
        const levelNameInput = page.getByTestId('input-level-name');
        const selectTool = page.getByTestId('tool-select');

        // Focus on input field
        await levelNameInput.click();

        // Type 'v' which is also a shortcut
        await page.keyboard.type('v');

        // Select tool should NOT be selected (shortcut should not trigger)
        await expect(selectTool).toHaveAttribute('aria-pressed', 'false');

        // Input should have the letter 'v' appended
        const inputValue = await levelNameInput.inputValue();
        expect(inputValue).toContain('v');
    });

    test('should clear selection with Escape key', async ({ page }) => {
        // First select a tool
        const selectTool = page.getByTestId('tool-select');
        await page.keyboard.press('v');
        await expect(selectTool).toHaveAttribute('aria-pressed', 'true');

        // Press Escape to clear selection
        await page.keyboard.press('Escape');

        // Tool should be deselected
        await expect(selectTool).toHaveAttribute('aria-pressed', 'false');
    });

    test('should clear palette selection with Escape key', async ({ page }) => {
        // Select a palette tile
        const grassTile = page.getByTestId('tile-platform-grass');
        await grassTile.click();
        await expect(grassTile).toHaveAttribute('aria-pressed', 'true');

        // Press Escape to clear palette selection
        await page.keyboard.press('Escape');

        // Palette tile should be deselected
        await expect(grassTile).toHaveAttribute('aria-pressed', 'false');
    });
});
