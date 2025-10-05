import { expect, test } from '@playwright/test';
import { clickCanvas, getCanvasBounds } from './helpers';

test.describe('Basic UI', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load the level editor', async ({ page }) => {
        // Check that the main elements are visible
        await expect(page.getByText('🎮')).toBeVisible();
        await expect(page.getByText('Roblox Level Designer')).toBeVisible();
        await expect(page.getByTestId('level-canvas')).toBeVisible();
    });

    test('should display tile palette', async ({ page }) => {
        // Look for tile palette sidebar
        await expect(page.getByText('Tile Palette')).toBeVisible();
        await expect(page.getByText('Platforms')).toBeVisible();
        // Check for the new category names from TilePalette component
        await expect(page.getByText('Interactables')).toBeVisible();
        await expect(page.getByText('Decorations')).toBeVisible();
        await expect(page.getByText('Spawn Points')).toBeVisible();
    });

    test('should show level tabs', async ({ page }) => {
        // Look for level tab with testid
        const firstTab = page.getByTestId('tab-level-0');
        await expect(firstTab).toBeVisible();

        // Verify it contains the level name
        await expect(firstTab).toContainText('New Level');
    });

    test('should track mouse position over canvas', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        await expect(canvas).toBeVisible();

        // Get canvas bounds for mouse movement
        const box = await getCanvasBounds(page);

        // Move mouse to a specific position on canvas
        await page.mouse.move(box.x + 160, box.y + 160);

        // The overlay should show mouse position
        const mousePosition = page.getByTestId('mouse-position');
        await expect(mousePosition).toBeVisible();

        // Check that coordinates are being tracked (not stuck at 0,0)
        const positionText = await mousePosition.textContent();
        expect(positionText).toMatch(/Mouse: \(\d+, \d+\)/);
    });

    test('should show correct selection count', async ({ page }) => {
        // The overlay should show selection count
        const selectionCount = page.getByTestId('selection-count');
        await expect(selectionCount).toBeVisible();

        // Initially should be 0 selected
        await expect(selectionCount).toHaveText('Selected: 0 object(s)');
    });

    test('Canvas component should render with CanvasRenderer', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        await expect(canvas).toBeVisible();

        // Canvas should have proper dimensions from level data
        const width = await canvas.getAttribute('width');
        const height = await canvas.getAttribute('height');
        expect(width).toBe('1920');
        expect(height).toBe('960');

        // Canvas should be rendered (check it has content by checking it's not blank)
        // We can verify this by checking the canvas has a non-zero dimension
        const box = await getCanvasBounds(page);
        expect(box).toBeTruthy();
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
    });

    test('CanvasRenderer should draw to canvas', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        await expect(canvas).toBeVisible();

        // Wait for rendering to complete
        await page.waitForTimeout(100);

        // Verify CanvasRenderer actually draws content (canvas is not blank)
        const hasContent = await canvas.evaluate((canvasEl) => {
            const ctx = (canvasEl as HTMLCanvasElement).getContext('2d');
            if (!ctx) return false;

            // Sample multiple areas of canvas to check if anything was drawn
            const width = (canvasEl as HTMLCanvasElement).width;
            const height = (canvasEl as HTMLCanvasElement).height;

            // Sample from different areas: top-left, center, bottom
            const areas = [
                { x: 0, y: 0, w: 100, h: 100 }, // Top-left
                { x: width / 2 - 50, y: height / 2 - 50, w: 100, h: 100 }, // Center
                { x: 0, y: height - 100, w: 100, h: 100 }, // Bottom
            ];

            for (const area of areas) {
                const imageData = ctx.getImageData(area.x, area.y, area.w, area.h);
                const data = imageData.data;

                // Check if this area has any drawn pixels
                for (let i = 0; i < data.length; i += 4) {
                    const alpha = data[i + 3];
                    if (alpha > 0) {
                        return true; // Found at least one drawn pixel
                    }
                }
            }

            return false; // Canvas is blank
        });

        expect(hasContent).toBe(true);
    });

    test('should select tile from palette', async ({ page }) => {
        // Click on a platform tile (grass platform)
        const grassTile = page.getByTestId('tile-platform-grass');
        await expect(grassTile).toBeVisible();
        await grassTile.click();

        // Tile should be visually selected (aria-pressed attribute)
        await expect(grassTile).toHaveAttribute('aria-pressed', 'true');

        // Other tiles should not be selected
        const basicTile = page.getByTestId('tile-platform-basic');
        await expect(basicTile).toHaveAttribute('aria-pressed', 'false');
    });

    test('should switch between different tile types', async ({ page }) => {
        // Select platform tile
        const grassTile = page.getByTestId('tile-platform-grass');
        await grassTile.click();
        await expect(grassTile).toHaveAttribute('aria-pressed', 'true');

        // Select spawn point
        const playerSpawn = page.getByTestId('tile-spawn-player');
        await playerSpawn.click();
        await expect(playerSpawn).toHaveAttribute('aria-pressed', 'true');

        // Previous selection should be deselected
        await expect(grassTile).toHaveAttribute('aria-pressed', 'false');

        // Select interactable object
        const buttonTile = page.getByTestId('tile-button');
        await buttonTile.click();
        await expect(buttonTile).toHaveAttribute('aria-pressed', 'true');
        await expect(playerSpawn).toHaveAttribute('aria-pressed', 'false');
    });

    test('tile palette should be scrollable', async ({ page }) => {
        // Get the tile palette container
        const tilePalette = page.getByTestId('tile-palette');
        await expect(tilePalette).toBeVisible();

        // Get the scrollable content area (the div with overflow-y-auto)
        const scrollableArea = tilePalette.locator('.overflow-y-auto').first();
        await expect(scrollableArea).toBeVisible();

        // Verify the scrollable area has scrollable content
        const hasScroll = await scrollableArea.evaluate((el) => {
            return el.scrollHeight > el.clientHeight;
        });
        expect(hasScroll).toBe(true);

        // Get initial scroll position
        const initialScrollTop = await scrollableArea.evaluate((el) => el.scrollTop);
        expect(initialScrollTop).toBe(0); // Should start at top

        // Scroll down in the palette
        await scrollableArea.evaluate((el) => {
            el.scrollTop = el.scrollHeight / 2; // Scroll to middle
        });

        // Wait a moment for scroll to complete
        await page.waitForTimeout(100);

        // Verify scroll position changed
        const finalScrollTop = await scrollableArea.evaluate((el) => el.scrollTop);
        expect(finalScrollTop).toBeGreaterThan(initialScrollTop);

        // Verify we can scroll back to top
        await scrollableArea.evaluate((el) => {
            el.scrollTop = 0;
        });
        await page.waitForTimeout(100);

        const backToTop = await scrollableArea.evaluate((el) => el.scrollTop);
        expect(backToTop).toBe(0);
    });

    test('should display properties panel', async ({ page }) => {
        const propertiesPanel = page.getByTestId('properties-panel');
        await expect(propertiesPanel).toBeVisible();

        // Check for level settings section
        await expect(page.getByText('Level Settings')).toBeVisible();

        // Check for level name input
        const levelNameInput = page.getByTestId('input-level-name');
        await expect(levelNameInput).toBeVisible();

        // Level name should have some value (could be "Level 1" or "New Level" depending on localStorage state)
        const levelName = await levelNameInput.inputValue();
        expect(levelName).toBeTruthy();
    });

    test('should update level name via properties panel', async ({ page }) => {
        const levelNameInput = page.getByTestId('input-level-name');
        await expect(levelNameInput).toBeVisible();

        // Clear and type new level name
        await levelNameInput.fill('My Custom Level');

        // Verify the value updated
        await expect(levelNameInput).toHaveValue('My Custom Level');
    });

    test('should collapse and expand properties panel', async ({ page }) => {
        const propertiesPanel = page.getByTestId('properties-panel');
        await expect(propertiesPanel).toBeVisible();

        // Find and click the close button
        const closeButton = page.getByTestId('button-close-properties');
        await expect(closeButton).toBeVisible();
        await closeButton.click();

        // Properties panel should be hidden
        await expect(propertiesPanel).not.toBeVisible();

        // Find and click the expand button (the arrow button on the right edge)
        const expandButton = page.getByRole('button', { name: '◀' });
        await expect(expandButton).toBeVisible();
        await expandButton.click();

        // Properties panel should be visible again
        await expect(propertiesPanel).toBeVisible();
    });

    test('should show duplicate level button', async ({ page }) => {
        const duplicateButton = page.getByTestId('button-duplicate-level');
        await expect(duplicateButton).toBeVisible();
        await expect(duplicateButton).toHaveText(/Duplicate Level/);
    });

    test('should update background color', async ({ page }) => {
        // Use the text input for background color, not the color picker
        const colorTextInput = page.getByTestId('input-background-color-text');
        await expect(colorTextInput).toBeVisible();

        // The initial color should be set
        const initialColor = await colorTextInput.inputValue();
        expect(initialColor).toBeTruthy();

        // Change the color using the text input
        await colorTextInput.fill('#FF5733');

        // Verify the value updated
        await expect(colorTextInput).toHaveValue('#FF5733');
    });

    test('should display LevelTabs component', async ({ page }) => {
        const levelTabs = page.getByTestId('level-tabs');
        await expect(levelTabs).toBeVisible();
    });

    test('should display all level tabs from state', async ({ page }) => {
        // Check that level tabs are rendered from actual state
        // The first tab should show the current level name
        const firstTab = page.getByTestId('tab-level-0');
        await expect(firstTab).toBeVisible();

        // Verify the tab has text content (level name)
        const tabText = await firstTab.textContent();
        expect(tabText).toBeTruthy();
    });

    test('should highlight active level tab', async ({ page }) => {
        const firstTab = page.getByTestId('tab-level-0');
        await expect(firstTab).toBeVisible();

        // Active tab should be marked as selected (verify via CSS class for visual distinction)
        // Note: This tests the visual distinction rather than internal state
        const classes = await firstTab.getAttribute('class');
        expect(classes).toContain('border-primary');
    });

    test('should switch between level tabs', async ({ page }) => {
        // Create a second level first by clicking new level button
        const newLevelButton = page.getByTestId('button-new-level');
        await expect(newLevelButton).toBeVisible();
        await newLevelButton.click();

        // Wait for second tab to appear
        const secondTab = page.getByTestId('tab-level-1');
        await expect(secondTab).toBeVisible();

        // Second tab should now be active (has visual distinction)
        const secondTabClasses = await secondTab.getAttribute('class');
        expect(secondTabClasses).toContain('border-primary');

        // Click first tab to switch back
        const firstTab = page.getByTestId('tab-level-0');
        await firstTab.click();

        // First tab should now be active (has visual distinction)
        const firstTabClasses = await firstTab.getAttribute('class');
        expect(firstTabClasses).toContain('border-primary');

        // Second tab should no longer be active (visual distinction removed)
        const secondTabClassesAfter = await secondTab.getAttribute('class');
        expect(secondTabClassesAfter).not.toContain('border-primary');
    });

    test('should create new level when new level button clicked', async ({ page }) => {
        // Count existing tabs before creating new level
        const tabsBeforeCount = await page.getByTestId(/tab-level-\d+/).count();

        // Open File menu
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        await page.waitForTimeout(50);

        // Click New Level option
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await expect(newLevelButton).toBeVisible();
        await newLevelButton.click();

        // Should have one more tab now
        const tabsAfterCount = await page.getByTestId(/tab-level-\d+/).count();
        expect(tabsAfterCount).toBe(tabsBeforeCount + 1);

        // New tab should be active (has visual distinction)
        const newTabIndex = tabsAfterCount - 1;
        const newTab = page.getByTestId(`tab-level-${newTabIndex}`);
        const classes = await newTab.getAttribute('class');
        expect(classes).toContain('border-primary');
    });

    test('should show close button on tabs when multiple levels exist', async ({ page }) => {
        // Create a second level
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await newLevelButton.click();

        // Close buttons should be visible on both tabs
        const closeButton0 = page.getByTestId('button-close-level-0');
        const closeButton1 = page.getByTestId('button-close-level-1');

        await expect(closeButton0).toBeVisible();
        await expect(closeButton1).toBeVisible();
    });

    test('should close level when close button clicked', async ({ page }) => {
        // Create a second level
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await newLevelButton.click();

        // Count tabs
        const tabsBeforeCount = await page.getByTestId(/tab-level-\d+/).count();
        expect(tabsBeforeCount).toBe(2);

        // Handle confirmation dialog
        page.on('dialog', (dialog) => dialog.accept());

        // Close the second level
        const closeButton1 = page.getByTestId('button-close-level-1');
        await closeButton1.click();

        // Should have one less tab
        const tabsAfterCount = await page.getByTestId(/tab-level-\d+/).count();
        expect(tabsAfterCount).toBe(1);
    });

    test('should not close last remaining level', async ({ page }) => {
        // Start with one level - try to close it
        const tabsCount = await page.getByTestId(/tab-level-\d+/).count();

        if (tabsCount === 1) {
            // Close button should not be visible on single tab
            const closeButton = page.getByTestId('button-close-level-0');
            await expect(closeButton).not.toBeVisible();
        } else {
            // If multiple levels exist, close all but one
            for (let i = tabsCount - 1; i > 0; i--) {
                page.on('dialog', (dialog) => dialog.accept());
                const closeButton = page.getByTestId(`button-close-level-${i}`);
                await closeButton.click();
            }

            // Last tab should not have close button
            const lastCloseButton = page.getByTestId('button-close-level-0');
            await expect(lastCloseButton).not.toBeVisible();
        }
    });

    test('status bar should display live canvas dimensions', async ({ page }) => {
        await page.waitForTimeout(500);

        // Get canvas dimensions display
        const canvasDimensions = page.getByTestId('statusbar-canvas-dimensions');

        // Should show current level's canvas dimensions (not hardcoded)
        await expect(canvasDimensions).toBeVisible();

        // The dimensions should match the pattern "width × height px"
        const dimensionsText = await canvasDimensions.textContent();
        expect(dimensionsText).toMatch(/\d+ × \d+ px/);

        // Default level should be 1920 × 960 px
        expect(dimensionsText).toBe('1920 × 960 px');
    });

    test('status bar should display live grid dimensions', async ({ page }) => {
        await page.waitForTimeout(500);

        // Get grid dimensions display
        const gridDimensions = page.getByTestId('statusbar-grid-dimensions');

        // Should show calculated grid dimensions (not hardcoded)
        await expect(gridDimensions).toBeVisible();

        // The dimensions should match the pattern "width × height tiles"
        const dimensionsText = await gridDimensions.textContent();
        expect(dimensionsText).toMatch(/\d+ × \d+ tiles/);

        // Default level (1920 × 960 px) should have 60 × 30 tiles (1920/32 = 60, 960/32 = 30)
        expect(dimensionsText).toBe('60 × 30 tiles');
    });

    test('all status bar values should be live data', async ({ page }) => {
        await page.waitForTimeout(500);

        // Verify all status bar elements are present and show live data
        const canvasDimensions = page.getByTestId('statusbar-canvas-dimensions');
        const gridDimensions = page.getByTestId('statusbar-grid-dimensions');
        const objectCount = page.getByTestId('statusbar-object-count');
        const zoomDisplay = page.getByTestId('statusbar-zoom-display');
        const historyDisplay = page.getByTestId('statusbar-history');

        // All should be visible
        await expect(canvasDimensions).toBeVisible();
        await expect(gridDimensions).toBeVisible();
        await expect(objectCount).toBeVisible();
        await expect(zoomDisplay).toBeVisible();
        await expect(historyDisplay).toBeVisible();

        // Should show data (not empty)
        const canvasText = await canvasDimensions.textContent();
        const gridText = await gridDimensions.textContent();

        expect(canvasText).toBeTruthy();
        expect(gridText).toBeTruthy();
        expect(canvasText).toMatch(/\d+ × \d+ px/);
        expect(gridText).toMatch(/\d+ × \d+ tiles/);
    });
});
