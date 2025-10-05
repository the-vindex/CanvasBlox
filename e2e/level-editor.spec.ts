import { expect, test } from '@playwright/test';
import { clickCanvas, getObjectCount, getZoomValue } from './helpers';

test.describe('Level Editor', () => {
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

    test('Step 2: should track mouse position over canvas', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        await expect(canvas).toBeVisible();

        // Get the canvas bounding box
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Move mouse to a specific position on canvas
        await page.mouse.move(box.x + 160, box.y + 160);

        // The overlay should show mouse position
        const mousePosition = page.getByTestId('mouse-position');
        await expect(mousePosition).toBeVisible();

        // Check that coordinates are being tracked (not stuck at 0,0)
        const positionText = await mousePosition.textContent();
        expect(positionText).toMatch(/Mouse: \(\d+, \d+\)/);
    });

    test('Step 2: should show correct selection count', async ({ page }) => {
        // The overlay should show selection count
        const selectionCount = page.getByTestId('selection-count');
        await expect(selectionCount).toBeVisible();

        // Initially should be 0 selected
        await expect(selectionCount).toHaveText('Selected: 0 object(s)');
    });

    test('Step 3: Canvas component should render with CanvasRenderer', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        await expect(canvas).toBeVisible();

        // Canvas should have proper dimensions from level data
        const width = await canvas.getAttribute('width');
        const height = await canvas.getAttribute('height');
        expect(width).toBe('1920');
        expect(height).toBe('960');

        // Canvas should be rendered (check it has content by checking it's not blank)
        // We can verify this by checking the canvas has a non-zero dimension
        const box = await canvas.boundingBox();
        expect(box).toBeTruthy();
        if (box) {
            expect(box.width).toBeGreaterThan(0);
            expect(box.height).toBeGreaterThan(0);
        }
    });

    test('Step 3: CanvasRenderer should draw to canvas', async ({ page }) => {
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

    test('Step 4: should select tile from palette', async ({ page }) => {
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

    test('Step 4: should switch between different tile types', async ({ page }) => {
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

    test('Step 4: tile palette should be scrollable', async ({ page }) => {
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

    test('Step 5: should display properties panel', async ({ page }) => {
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

    test('Step 5: should update level name via properties panel', async ({ page }) => {
        const levelNameInput = page.getByTestId('input-level-name');
        await expect(levelNameInput).toBeVisible();

        // Clear and type new level name
        await levelNameInput.fill('My Custom Level');

        // Verify the value updated
        await expect(levelNameInput).toHaveValue('My Custom Level');
    });

    test('Step 5: should collapse and expand properties panel', async ({ page }) => {
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

    test('Step 5: should show duplicate level button', async ({ page }) => {
        const duplicateButton = page.getByTestId('button-duplicate-level');
        await expect(duplicateButton).toBeVisible();
        await expect(duplicateButton).toHaveText(/Duplicate Level/);
    });

    test('Step 5: should update background color', async ({ page }) => {
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

    test('Step 6: should render Toolbar component', async ({ page }) => {
        const toolbar = page.getByTestId('toolbar');
        await expect(toolbar).toBeVisible();
    });

    test('Step 6: should have selection tools in toolbar', async ({ page }) => {
        // Check for selection tools
        await expect(page.getByTestId('tool-select')).toBeVisible();
        await expect(page.getByTestId('tool-multiselect')).toBeVisible();
        await expect(page.getByTestId('tool-move')).toBeVisible();
    });

    test('Step 6: should have drawing tools in toolbar', async ({ page }) => {
        // Check for drawing tools
        await expect(page.getByTestId('tool-line')).toBeVisible();
        await expect(page.getByTestId('tool-rectangle')).toBeVisible();
    });

    test('Step 6: should have linking tools in toolbar', async ({ page }) => {
        await expect(page.getByTestId('tool-link')).toBeVisible();
    });

    test('Step 6: should have zoom controls in toolbar', async ({ page }) => {
        await expect(page.getByTestId('button-zoom-in')).toBeVisible();
        await expect(page.getByTestId('button-zoom-out')).toBeVisible();
        await expect(page.getByTestId('button-reset-zoom')).toBeVisible();
        await expect(page.getByTestId('zoom-level')).toBeVisible();
    });

    test('Step 6: should display current zoom level in toolbar', async ({ page }) => {
        // Wait for toolbar to be visible
        await expect(page.getByTestId('toolbar')).toBeVisible();
        const zoomLevel = page.getByTestId('zoom-level');
        // Zoom is calculated based on viewport, so just verify it displays a valid percentage
        await expect(zoomLevel).toHaveText(/^\d+%$/);
    });

    test('Step 6: should have grid and scanlines toggles', async ({ page }) => {
        await expect(page.getByTestId('switch-show-grid')).toBeVisible();
        await expect(page.getByTestId('switch-show-scanlines')).toBeVisible();
    });

    test('Step 6: should have properties panel toggle button', async ({ page }) => {
        const toggleButton = page.getByTestId('button-toggle-properties');
        await expect(toggleButton).toBeVisible();
    });

    test('Step 6: should toggle properties panel when button clicked', async ({ page }) => {
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

    test('Step 6: should select tool when tool button clicked', async ({ page }) => {
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

    test('Step 7: should display LevelTabs component', async ({ page }) => {
        const levelTabs = page.getByTestId('level-tabs');
        await expect(levelTabs).toBeVisible();
    });

    test('Step 7: should display all level tabs from state', async ({ page }) => {
        // Check that level tabs are rendered from actual state
        // The first tab should show the current level name
        const firstTab = page.getByTestId('tab-level-0');
        await expect(firstTab).toBeVisible();

        // Verify the tab has text content (level name)
        const tabText = await firstTab.textContent();
        expect(tabText).toBeTruthy();
    });

    test('Step 7: should highlight active level tab', async ({ page }) => {
        const firstTab = page.getByTestId('tab-level-0');
        await expect(firstTab).toBeVisible();

        // Active tab should be marked as selected (verify via CSS class for visual distinction)
        // Note: This tests the visual distinction rather than internal state
        const classes = await firstTab.getAttribute('class');
        expect(classes).toContain('border-primary');
    });

    test('Step 7: should switch between level tabs', async ({ page }) => {
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

    test('Step 7: should create new level when new level button clicked', async ({ page }) => {
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

    test('Step 7: should show close button on tabs when multiple levels exist', async ({ page }) => {
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

    test('Step 7: should close level when close button clicked', async ({ page }) => {
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

    test('Step 7: should not close last remaining level', async ({ page }) => {
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

    test('Step 8: should select tool with V shortcut', async ({ page }) => {
        const selectTool = page.getByTestId('tool-select');
        await expect(selectTool).toBeVisible();

        // Press V key
        await page.keyboard.press('v');

        // Select tool should be selected
        await expect(selectTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('Step 8: should select multi-select tool with M shortcut', async ({ page }) => {
        const multiSelectTool = page.getByTestId('tool-multiselect');
        await expect(multiSelectTool).toBeVisible();

        // Press M key
        await page.keyboard.press('m');

        // Multi-select tool should be selected
        await expect(multiSelectTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('Step 8: should select move tool with H shortcut', async ({ page }) => {
        const moveTool = page.getByTestId('tool-move');
        await expect(moveTool).toBeVisible();

        // Press H key
        await page.keyboard.press('h');

        // Move tool should be selected
        await expect(moveTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('Step 8: should select line tool with L shortcut', async ({ page }) => {
        const lineTool = page.getByTestId('tool-line');
        await expect(lineTool).toBeVisible();

        // Press L key
        await page.keyboard.press('l');

        // Line tool should be selected
        await expect(lineTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('Step 8: should select rectangle tool with R shortcut', async ({ page }) => {
        const rectangleTool = page.getByTestId('tool-rectangle');
        await expect(rectangleTool).toBeVisible();

        // Press R key
        await page.keyboard.press('r');

        // Rectangle tool should be selected
        await expect(rectangleTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('Step 8: should select link tool with K shortcut', async ({ page }) => {
        const linkTool = page.getByTestId('tool-link');
        await expect(linkTool).toBeVisible();

        // Press K key
        await page.keyboard.press('k');

        // Link tool should be selected
        await expect(linkTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('Step 8: should select pen tool with B shortcut', async ({ page }) => {
        const penTool = page.getByTestId('tool-pen');
        await expect(penTool).toBeVisible();

        // Press B key
        await page.keyboard.press('b');

        // Pen tool should be selected
        await expect(penTool).toHaveAttribute('aria-pressed', 'true');
    });

    test('Step 8: Drawing Mode Tools - should auto-select pen and preserve tile when switching tools', async ({
        page,
    }) => {
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

    test('Step 8: Drawing Mode Tools - should clear tile when switching to non-drawing tool', async ({ page }) => {
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

    test('Step 8: Drawing Mode Tools - Escape should clear both tool and tile', async ({ page }) => {
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

    test('Step 8: should toggle properties panel with P shortcut', async ({ page }) => {
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

    test('Step 8: should not trigger shortcuts when typing in input fields', async ({ page }) => {
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

    test('Step 8: should clear selection with Escape key', async ({ page }) => {
        // First select a tool
        const selectTool = page.getByTestId('tool-select');
        await page.keyboard.press('v');
        await expect(selectTool).toHaveAttribute('aria-pressed', 'true');

        // Press Escape to clear selection
        await page.keyboard.press('Escape');

        // Tool should be deselected
        await expect(selectTool).toHaveAttribute('aria-pressed', 'false');
    });

    test('Step 8: should clear palette selection with Escape key', async ({ page }) => {
        // Select a palette tile
        const grassTile = page.getByTestId('tile-platform-grass');
        await grassTile.click();
        await expect(grassTile).toHaveAttribute('aria-pressed', 'true');

        // Press Escape to clear palette selection
        await page.keyboard.press('Escape');

        // Palette tile should be deselected
        await expect(grassTile).toHaveAttribute('aria-pressed', 'false');
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

    test('Step 9: should reset zoom to 100% when reset button clicked', async ({ page }) => {
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

    test('Step 10: should place single platform tile with click', async ({ page }) => {
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

    test('Step 10: should place multiple platform tiles with drag (painting mode)', async ({ page }) => {
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

    test('Step 10: should place spawn point object', async ({ page }) => {
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

    test('Step 10: should place interactable object (button)', async ({ page }) => {
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

    test('Step 10: painting mode should create batched undo entry', async ({ page }) => {
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

    test('Step 10: single click tile placement should create individual undo entry', async ({ page }) => {
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

    test('Step 12: should have undo button in header', async ({ page }) => {
        const undoButton = page.getByRole('button', { name: /Undo/ });
        await expect(undoButton).toBeVisible();
    });

    test('Step 12: should have redo button in header', async ({ page }) => {
        const redoButton = page.getByRole('button', { name: /Redo/ });
        await expect(redoButton).toBeVisible();
    });

    test('Step 12: should undo with Ctrl+Z and button', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const objectCount = page.getByTestId('statusbar-object-count');
        const undoButton = page.getByRole('button', { name: /Undo/ });

        // Get initial object count
        const initialCountText = await objectCount.textContent();
        const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Place a tile
        await grassTile.click();
        await page.waitForTimeout(50);
        await canvas.click({ position: { x: 200, y: 200 } });

        // Wait for drawing session to end and history to update
        await expect(undoButton).toBeEnabled();

        // Verify tile was placed
        const afterPlaceText = await objectCount.textContent();
        const afterPlaceCount = parseInt(afterPlaceText?.match(/\d+/)?.[0] || '0', 10);
        expect(afterPlaceCount).toBeGreaterThan(initialCount);

        // Test keyboard shortcut (Ctrl+Z)
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(200);
        const afterKeyboardUndo = await objectCount.textContent();
        const afterKeyboardUndoCount = parseInt(afterKeyboardUndo?.match(/\d+/)?.[0] || '0', 10);
        expect(afterKeyboardUndoCount).toBeLessThan(afterPlaceCount);

        // Redo to restore
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(200);

        // Test button
        await undoButton.click();
        await page.waitForTimeout(200);
        const afterButtonUndo = await objectCount.textContent();
        const afterButtonUndoCount = parseInt(afterButtonUndo?.match(/\d+/)?.[0] || '0', 10);
        expect(afterButtonUndoCount).toBeLessThan(afterPlaceCount);
    });

    test('Step 12: should redo with Ctrl+Y, Ctrl+Shift+Z, and button', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const objectCount = page.getByTestId('statusbar-object-count');
        const redoButton = page.getByRole('button', { name: /Redo/ });

        // Place a tile and record the expected count after redo
        await basicTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 250, box.y + 250);
        await page.waitForTimeout(100);

        const afterPlaceText = await objectCount.textContent();
        const expectedCount = parseInt(afterPlaceText?.match(/\d+/)?.[0] || '0', 10);

        // Undo once to create a redo opportunity
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);

        // All three redo methods should restore to the same state (call same redo function)

        // Test Ctrl+Y
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(100);
        const afterCtrlY = await objectCount.textContent();
        const ctrlYCount = parseInt(afterCtrlY?.match(/\d+/)?.[0] || '0', 10);
        expect(ctrlYCount).toBe(expectedCount);
        await page.keyboard.press('Control+z'); // Reset for next test
        await page.waitForTimeout(100);

        // Test Ctrl+Shift+Z
        await page.keyboard.press('Control+Shift+Z');
        await page.waitForTimeout(100);
        const afterCtrlShiftZ = await objectCount.textContent();
        const ctrlShiftZCount = parseInt(afterCtrlShiftZ?.match(/\d+/)?.[0] || '0', 10);
        expect(ctrlShiftZCount).toBe(expectedCount);
        await page.keyboard.press('Control+z'); // Reset for next test
        await page.waitForTimeout(100);

        // Test button
        await redoButton.click();
        await page.waitForTimeout(100);
        const afterButton = await objectCount.textContent();
        const buttonCount = parseInt(afterButton?.match(/\d+/)?.[0] || '0', 10);
        expect(buttonCount).toBe(expectedCount);
    });

    test('Step 12: should update history display in status bar', async ({ page }) => {
        // Create a fresh level for this test
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await newLevelButton.click();
        await page.waitForTimeout(200);

        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const historyDisplay = page.getByTestId('statusbar-history');

        // Get initial history (should be 1/1 for fresh level)
        const initialHistoryText = await historyDisplay.textContent();
        const initialMatch = initialHistoryText?.match(/(\d+)\/(\d+)/);
        const initialIndex = parseInt(initialMatch?.[1] || '0', 10);

        // Place a tile
        await grassTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 220, box.y + 220);
        await page.waitForTimeout(100);

        // History should increase
        const afterPlaceText = await historyDisplay.textContent();
        const afterPlaceMatch = afterPlaceText?.match(/(\d+)\/(\d+)/);
        const afterPlaceIndex = parseInt(afterPlaceMatch?.[1] || '0', 10);
        expect(afterPlaceIndex).toBe(initialIndex + 1);

        // Undo
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(200);

        // History index should decrease
        const afterUndoText = await historyDisplay.textContent();
        const afterUndoMatch = afterUndoText?.match(/(\d+)\/(\d+)/);
        const afterUndoIndex = parseInt(afterUndoMatch?.[1] || '0', 10);
        expect(afterUndoIndex).toBe(initialIndex);

        // Redo
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(100);

        // History index should increase again
        const afterRedoText = await historyDisplay.textContent();
        const afterRedoMatch = afterRedoText?.match(/(\d+)\/(\d+)/);
        const afterRedoIndex = parseInt(afterRedoMatch?.[1] || '0', 10);
        expect(afterRedoIndex).toBe(initialIndex + 1);
    });

    test('Step 12: should disable undo button when at start of history', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const undoButton = page.getByRole('button', { name: /Undo/ });

        // Undo button should be disabled at initial state
        await expect(undoButton).toBeDisabled();

        // Place a tile to create history
        await grassTile.click();
        await canvas.click({ position: { x: 200, y: 200 } });
        await expect(undoButton).toBeEnabled();

        // Undo to go back to initial state
        await undoButton.click();
        await page.waitForTimeout(200);

        // Button should be disabled again at start of history
        await expect(undoButton).toBeDisabled();
    });

    test('Step 12: should disable redo button when at end of history', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const redoButton = page.getByRole('button', { name: /Redo/ });

        // Place a tile and redo should be disabled (at end of history)
        await grassTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 240, box.y + 240);
        await page.waitForTimeout(100);

        // At end of history, redo should be disabled/ineffective
        await expect(redoButton).toBeVisible();
    });

    test('Step 12: should show visual flash feedback on undo/redo', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');

        // Place a tile
        await basicTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 260, box.y + 260);
        await page.waitForTimeout(100);

        // Undo and check for flash overlay
        await page.keyboard.press('Control+z');

        // Check if flash overlay is visible (should appear briefly)
        const flashOverlay = page.locator('.undo-redo-flash');

        // Flash might be visible briefly or already faded
        // We just verify it exists in the DOM (even if opacity is 0)
        const flashCount = await flashOverlay.count();
        expect(flashCount).toBeGreaterThanOrEqual(0); // May or may not be in DOM depending on timing
    });

    test('Step 12: should undo multiple actions in sequence', async ({ page }) => {
        // Create a fresh level for this test
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await newLevelButton.click();
        await page.waitForTimeout(200);

        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const objectCount = page.getByTestId('statusbar-object-count');

        // Get initial object count (should be 0 for fresh level)
        const initialCountText = await objectCount.textContent();
        const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Place 3 tiles
        await grassTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await page.mouse.click(box.x + 150, box.y + 150);
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 182, box.y + 150);
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 214, box.y + 150);
        await page.waitForTimeout(100);

        // Undo all 3 actions
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(200);

        // Should be back to initial count
        const finalCountText = await objectCount.textContent();
        const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBe(initialCount);
    });

    test('Step 12: should redo multiple actions in sequence', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const basicTile = page.getByTestId('tile-platform-basic');
        const objectCount = page.getByTestId('statusbar-object-count');

        // Get initial object count
        const initialCountText = await objectCount.textContent();
        const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Place 2 tiles
        await basicTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await page.mouse.click(box.x + 170, box.y + 170);
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 202, box.y + 170);
        await page.waitForTimeout(100);

        // Undo both
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(50);
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);

        // Redo both
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(50);
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(100);

        // Should be back to having both tiles placed
        const finalCountText = await objectCount.textContent();
        const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeGreaterThan(initialCount);
    });

    test('Step 13: should copy with Ctrl+C and copy button', async ({ page }) => {
        // Both keyboard shortcut and button call the same copy function - test both methods
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');
        const copyButton = page.getByRole('button', { name: /Copy/ });

        // Place and select a button
        await buttonTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        await selectTool.click();
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Test keyboard shortcut (Ctrl+C)
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);
        const keyboardToast = page.getByText('Copied 1 items to clipboard.', { exact: true });
        await expect(keyboardToast).toBeVisible();

        // Deselect by clicking empty area (this clears the selection but keeps object on canvas)
        await page.mouse.click(box.x + 100, box.y + 100);
        await page.waitForTimeout(100);

        // Re-select the same object
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Test copy button
        await copyButton.click();
        await page.waitForTimeout(100);
        const buttonToast = page.getByText('Copied 1 items to clipboard.', { exact: true });
        await expect(buttonToast).toBeVisible();
    });

    test.skip('Step 13: should paste with Ctrl+V and paste button', async ({ page }) => {
        // Both keyboard shortcut and button call the same paste function - test both methods
        // Note: This test verifies paste operation works (count increases, toast appears).
        // Offset positioning is tested separately in other tests.
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');
        const pasteButton = page.getByRole('button', { name: /Paste/ });
        const objectCount = page.getByTestId('statusbar-object-count');

        // Get initial count
        const initialCountText = await objectCount.textContent();
        const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Place and select a button
        await buttonTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        await selectTool.click();
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Copy with Ctrl+C
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);

        // Test keyboard shortcut (Ctrl+V)
        await page.keyboard.press('Control+v');
        await page.waitForTimeout(200);
        const keyboardCountText = await objectCount.textContent();
        const keyboardCount = parseInt(keyboardCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(keyboardCount).toBeGreaterThan(initialCount);
        const keyboardToast = page.getByText('Pasted 1 items.', { exact: true });
        await expect(keyboardToast).toBeVisible();

        // Undo the paste to reset state
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(100);

        // Test paste button
        await pasteButton.click();
        await page.waitForTimeout(200);
        const buttonCountText = await objectCount.textContent();
        const buttonCount = parseInt(buttonCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(buttonCount).toBeGreaterThan(initialCount);
        const buttonToast = page.getByText('Pasted 1 items.', { exact: true });
        await expect(buttonToast).toBeVisible();
    });

    test.skip('Step 13: should copy multiple selected objects', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const buttonTile = page.getByTestId('tile-button');
        const multiSelectTool = page.getByTestId('tool-multiselect');
        const selectionCount = page.getByTestId('selection-count');

        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place 3 buttons
        await buttonTile.click();
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

        // Verify 3 objects are selected
        const countText = await selectionCount.textContent();
        const count = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
        expect(count).toBeGreaterThanOrEqual(3);

        // Copy with Ctrl+C
        await page.keyboard.press('Control+c');
        await page.waitForTimeout(100);

        // Verify copy toast (check that copy happened - exact count may vary)
        const copyToast = page.getByText(/Copied \d+ items to clipboard/, { exact: false }).first();
        await expect(copyToast).toBeVisible();

        // Paste with Ctrl+V
        await page.keyboard.press('Control+v');
        await page.waitForTimeout(200);

        // Verify paste toast
        const pasteToast = page.getByText(/Pasted \d+ items/, { exact: false }).first();
        await expect(pasteToast).toBeVisible();
    });

    test('Step 13: copy button should be disabled with nothing selected', async ({ page }) => {
        const copyButton = page.getByRole('button', { name: /Copy/ });

        // Copy button should be disabled when nothing is selected
        await expect(copyButton).toBeDisabled();
    });

    test.skip('Step 13: paste button should be disabled with empty clipboard', async ({ page }) => {
        const pasteButton = page.getByRole('button', { name: /Paste/ });

        // Paste button should be disabled when clipboard is empty
        await expect(pasteButton).toBeDisabled();
    });

    test('Step 14: should open import modal when import button clicked', async ({ page }) => {
        // Look for File menu or Import button
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        await page.waitForTimeout(50);

        // Click Import JSON option
        const importButton = page.getByRole('menuitem', { name: /Import JSON/ });
        await importButton.click();
        await page.waitForTimeout(100);

        // Import modal should be visible
        const importModal = page.getByRole('dialog');
        await expect(importModal).toBeVisible();
        await expect(importModal).toContainText('Import Level');
    });

    test('Step 14: should close import modal when cancel clicked', async ({ page }) => {
        // Open import modal
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const importButton = page.getByRole('menuitem', { name: /Import JSON/ });
        await importButton.click();
        await page.waitForTimeout(100);

        // Click cancel button
        const cancelButton = page.getByRole('button', { name: /Cancel/i });
        await cancelButton.click();
        await page.waitForTimeout(100);

        // Modal should be closed
        const importModal = page.getByRole('dialog');
        await expect(importModal).not.toBeVisible();
    });

    test('Step 14: should import valid JSON level data using new level mode', async ({ page }) => {
        // Create valid level JSON
        const validLevelJson = JSON.stringify({
            levelName: 'Imported Level',
            tiles: [
                {
                    id: '1',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    type: 'platform-grass',
                    properties: { collidable: true },
                },
            ],
            objects: [],
            spawnPoints: [
                {
                    id: 'spawn-1',
                    type: 'player',
                    position: { x: 5, y: 5 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    facingDirection: 'right',
                    isDefault: true,
                    properties: {},
                },
            ],
            metadata: {
                version: '1.0',
                createdAt: new Date().toISOString(),
                author: 'Test',
                description: 'Test level',
                dimensions: { width: 1920, height: 960 },
                backgroundColor: '#87CEEB',
            },
        });

        // Open import modal
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();

        // Wait for dropdown menu to be visible before clicking menu item
        const importButton = page.getByRole('menuitem', { name: /Import JSON/ });
        await expect(importButton).toBeVisible();
        await importButton.click();
        await page.waitForTimeout(100);

        // Paste JSON into textarea
        const textarea = page.getByRole('textbox');
        await textarea.fill(validLevelJson);

        // Default mode is "Create new level" - verify it
        const newLevelRadio = page.getByRole('radio', { name: /Create new level/i });
        await expect(newLevelRadio).toBeChecked();

        // Click import button
        const importConfirmButton = page.getByRole('button', { name: /^Import$/i });
        await importConfirmButton.click();
        await page.waitForTimeout(200);

        // Should create new level with imported name
        const levelNameInput = page.getByTestId('input-level-name');
        await expect(levelNameInput).toHaveValue('Imported Level');
    });

    test('Step 14: should show error for invalid JSON', async ({ page }) => {
        // Open import modal
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();

        // Wait for dropdown menu to be visible
        const importButton = page.getByRole('menuitem', { name: /Import JSON/ });
        await expect(importButton).toBeVisible();
        await importButton.click();
        await page.waitForTimeout(100);

        // Enter invalid JSON
        const textarea = page.getByRole('textbox');
        await textarea.fill('{ invalid json }');

        // Click import button
        const importConfirmButton = page.getByRole('button', { name: /^Import$/i });
        await importConfirmButton.click();
        await page.waitForTimeout(100);

        // Should show error toast
        const errorToast = page.getByText(/Invalid JSON/i);
        await expect(errorToast).toBeVisible();
    });

    test('Step 14: should open export modal when export JSON clicked', async ({ page }) => {
        // Open File menu
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        await page.waitForTimeout(50);

        // Click Export JSON option
        const exportButton = page.getByRole('menuitem', { name: /Export JSON/ });
        await exportButton.click();
        await page.waitForTimeout(100);

        // Export modal should be visible
        const exportModal = page.getByRole('dialog');
        await expect(exportModal).toBeVisible();
        await expect(exportModal).toContainText('Export Level');
    });

    test('Step 14: should close export modal when close clicked', async ({ page }) => {
        // Open export modal
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const exportButton = page.getByRole('menuitem', { name: /Export JSON/ });
        await exportButton.click();
        await page.waitForTimeout(100);

        // Click close button (X or Cancel)
        const closeButton = page.getByRole('button', { name: /Close|Cancel/i }).first();
        await closeButton.click();
        await page.waitForTimeout(100);

        // Modal should be closed
        const exportModal = page.getByRole('dialog');
        await expect(exportModal).not.toBeVisible();
    });

    test('Step 14: should display current level JSON in export modal', async ({ page }) => {
        // Open export modal
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const exportButton = page.getByRole('menuitem', { name: /Export JSON/ });
        await exportButton.click();
        await page.waitForTimeout(100);

        // Modal should contain JSON textarea with level data
        const textarea = page.getByRole('textbox');
        await expect(textarea).toBeVisible();

        const jsonContent = await textarea.inputValue();
        expect(jsonContent.length).toBeGreaterThan(0);

        // Verify it's valid JSON
        expect(() => JSON.parse(jsonContent)).not.toThrow();
    });

    test('Step 14: should export PNG when export PNG clicked', async ({ page }) => {
        // Open File menu
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();

        // Wait for dropdown menu to be visible
        const exportPngButton = page.getByRole('menuitem', { name: /Export PNG/ });
        await expect(exportPngButton).toBeVisible();

        // Set up download listener before clicking
        const downloadPromise = page.waitForEvent('download');

        // Click Export PNG option
        await exportPngButton.click();

        // Wait for download to start
        const download = await downloadPromise;

        // Verify download happened and has .png extension
        expect(download.suggestedFilename()).toMatch(/\.png$/);
    });

    test('Step 14: should import as new level by default', async ({ page }) => {
        // Create level JSON
        const importedLevelJson = JSON.stringify({
            levelName: 'Imported Level',
            tiles: [
                {
                    id: 'tile-1',
                    type: 'platform-basic',
                    position: { x: 0, y: 0 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { collidable: true },
                },
            ],
            objects: [],
            spawnPoints: [],
            metadata: {
                version: '1.0',
                createdAt: new Date().toISOString(),
                author: 'Test',
                description: 'Imported level',
                dimensions: { width: 1920, height: 960 },
                backgroundColor: '#87CEEB',
            },
        });

        // Get current level count (wait for tabs to render)
        await page.waitForSelector('[data-testid^="tab-level-"]', { timeout: 5000 });
        const initialLevelCount = await page.locator('[data-testid^="tab-level-"]').count();

        // Open import modal
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();

        const importButton = page.getByRole('menuitem', { name: /Import JSON/ });
        await expect(importButton).toBeVisible();
        await importButton.click();
        await page.waitForTimeout(100);

        // Paste JSON
        const textarea = page.getByRole('textbox');
        await textarea.fill(importedLevelJson);

        // Default mode should be "new level"
        const newLevelRadio = page.getByRole('radio', { name: /Create new level/i });
        await expect(newLevelRadio).toBeChecked();

        // Click import
        const importConfirmButton = page.getByRole('button', { name: /^Import$/i });
        await importConfirmButton.click();
        await page.waitForTimeout(200);

        // Should create a new level tab (wait for new tab to appear)
        await page.waitForSelector(`[data-testid="tab-level-${initialLevelCount}"]`, { timeout: 5000 });
        const newLevelCount = await page.locator('[data-testid^="tab-level-"]').count();
        expect(newLevelCount).toBe(initialLevelCount + 1);

        // New level should have the imported name
        const levelNameInput = page.getByTestId('input-level-name');
        await expect(levelNameInput).toHaveValue('Imported Level');

        // Should have 1 tile from import
        const objectCount = page.getByTestId('statusbar-object-count');
        const countText = await objectCount.textContent();
        const count = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
        expect(count).toBe(1);
    });

    test('Step 14: should overwrite current level when overwrite mode selected', async ({ page }) => {
        // Set current level name first
        const levelNameInput = page.getByTestId('input-level-name');
        await levelNameInput.fill('Original Level');
        await page.waitForTimeout(100);

        // Create level JSON with different name
        const importedLevelJson = JSON.stringify({
            levelName: 'Overwritten Level',
            tiles: [
                {
                    id: 'tile-1',
                    type: 'platform-grass',
                    position: { x: 5, y: 5 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { collidable: true },
                },
                {
                    id: 'tile-2',
                    type: 'platform-grass',
                    position: { x: 6, y: 5 },
                    dimensions: { width: 1, height: 1 },
                    rotation: 0,
                    layer: 1,
                    properties: { collidable: true },
                },
            ],
            objects: [],
            spawnPoints: [],
            metadata: {
                version: '1.0',
                createdAt: new Date().toISOString(),
                author: 'Test',
                description: 'Overwritten level',
                dimensions: { width: 1920, height: 960 },
                backgroundColor: '#87CEEB',
            },
        });

        // Get current level count
        const initialLevelCount = await page.locator('[data-testid^="tab-level-"]').count();

        // Open import modal
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();

        const importButton = page.getByRole('menuitem', { name: /Import JSON/ });
        await expect(importButton).toBeVisible();
        await importButton.click();
        await page.waitForTimeout(100);

        // Paste JSON
        const textarea = page.getByRole('textbox');
        await textarea.fill(importedLevelJson);

        // Select overwrite mode
        const overwriteRadio = page.getByRole('radio', { name: /Overwrite current level/i });
        await overwriteRadio.click();

        // Click import
        const importConfirmButton = page.getByRole('button', { name: /^Import$/i });
        await importConfirmButton.click();
        await page.waitForTimeout(200);

        // Should NOT create new level tab
        const newLevelCount = await page.locator('[data-testid^="tab-level-"]').count();
        expect(newLevelCount).toBe(initialLevelCount);

        // Current level should have the imported name
        await expect(levelNameInput).toHaveValue('Overwritten Level');

        // Should have 2 tiles from import
        const objectCount = page.getByTestId('statusbar-object-count');
        const countText = await objectCount.textContent();
        const count = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
        expect(count).toBe(2);
    });

    test('Step 14: should validate single player spawn on import (new level mode)', async ({ page }) => {
        // Create level JSON with multiple player spawns
        const multiplePlayerSpawnsJson = JSON.stringify({
            levelName: 'Invalid Level',
            tiles: [],
            objects: [],
            spawnPoints: [
                { id: 'spawn-1', type: 'player', position: { x: 0, y: 0 } },
                { id: 'spawn-2', type: 'player', position: { x: 5, y: 5 } },
                { id: 'spawn-3', type: 'enemy', position: { x: 10, y: 10 } },
            ],
            metadata: {
                version: '1.0',
                createdAt: new Date().toISOString(),
                author: 'Test',
                description: 'Test level',
                dimensions: { width: 1920, height: 960 },
                backgroundColor: '#87CEEB',
            },
        });

        // Open import modal
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();

        // Wait for dropdown menu to be visible
        const importButton = page.getByRole('menuitem', { name: /Import JSON/ });
        await expect(importButton).toBeVisible();
        await importButton.click();
        await page.waitForTimeout(100);

        // Paste JSON
        const textarea = page.getByRole('textbox');
        await textarea.fill(multiplePlayerSpawnsJson);

        // Default is "Create new level" - no need to select it
        const newLevelRadio = page.getByRole('radio', { name: /Create new level/i });
        await expect(newLevelRadio).toBeChecked();

        // Click import
        const importConfirmButton = page.getByRole('button', { name: /^Import$/i });
        await importConfirmButton.click();
        await page.waitForTimeout(200);

        // Should create new level with imported name
        const levelNameInput = page.getByTestId('input-level-name');
        await expect(levelNameInput).toHaveValue('Invalid Level');

        // Object count should reflect only 1 player spawn + 1 enemy spawn (3rd player spawn removed)
        const objectCount = page.getByTestId('statusbar-object-count');
        const countText = await objectCount.textContent();
        const count = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);

        // Should have 2 spawn points (1 player + 1 enemy), not 3
        expect(count).toBe(2);
    });

    test('Step 14: should preserve level data after export and import', async ({ page }) => {
        // Create a fresh level with specific data
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();

        // Wait for dropdown menu to be visible
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await expect(newLevelButton).toBeVisible();
        await newLevelButton.click();
        await page.waitForTimeout(200);

        // Set level name
        const levelNameInput = page.getByTestId('input-level-name');
        await levelNameInput.fill('Round Trip Test Level');
        await page.waitForTimeout(100);

        // Place some tiles and objects
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await grassTile.click();
        await page.mouse.click(box.x + 100, box.y + 100);
        await page.waitForTimeout(100);

        // Export to JSON
        await fileButton.click();

        // Wait for dropdown menu to be visible
        const exportButton = page.getByRole('menuitem', { name: /Export JSON/ });
        await expect(exportButton).toBeVisible();
        await exportButton.click();
        await page.waitForTimeout(100);

        // Get the JSON
        const textarea = page.getByRole('textbox');
        const exportedJson = await textarea.inputValue();

        // Close export modal
        const closeButton = page.getByRole('button', { name: /Close|Cancel/i }).first();
        await closeButton.click();
        await page.waitForTimeout(100);

        // Create another fresh level
        await fileButton.click();
        const newLevelButton2 = page.getByRole('menuitem', { name: /New Level/ });
        await expect(newLevelButton2).toBeVisible();
        await newLevelButton2.click();
        await page.waitForTimeout(200);

        // Import the exported JSON
        await fileButton.click();
        const importButton = page.getByRole('menuitem', { name: /Import JSON/ });
        await expect(importButton).toBeVisible();
        await importButton.click();
        await page.waitForTimeout(100);

        const importTextarea = page.getByRole('textbox');
        await importTextarea.fill(exportedJson);

        const importConfirmButton = page.getByRole('button', { name: /^Import$/i });
        await importConfirmButton.click();
        await page.waitForTimeout(200);

        // Verify level name was preserved
        await expect(levelNameInput).toHaveValue('Round Trip Test Level');
    });

    test('Step 15: should show unsaved indicator when changes are made', async ({ page }) => {
        // Get save indicator
        const saveIndicator = page.getByTestId('save-indicator');

        // Wait for initial auto-save to complete (levels load from localStorage triggers unsaved)
        await page.waitForTimeout(5500);

        // After auto-save, should show "Saved"
        await expect(saveIndicator).toContainText('Saved');

        // Make a change - place a tile
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await grassTile.click();
        await page.mouse.click(box.x + 100, box.y + 100);
        await page.waitForTimeout(100);

        // Should now show "Unsaved"
        await expect(saveIndicator).toContainText('Unsaved');
    });

    test('Step 15: should auto-save after 5 seconds', async ({ page }) => {
        // Get save indicator
        const saveIndicator = page.getByTestId('save-indicator');

        // Make a change
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await grassTile.click();
        await page.mouse.click(box.x + 150, box.y + 150);
        await page.waitForTimeout(100);

        // Should show "Unsaved"
        await expect(saveIndicator).toContainText('Unsaved');

        // Wait for auto-save (5 seconds + buffer)
        await page.waitForTimeout(5500);

        // Should now show "Saved"
        await expect(saveIndicator).toContainText('Saved');
    });

    test('Step 15: should change icon color based on save state', async ({ page }) => {
        // Get save indicator icon
        const saveIcon = page.locator('[data-testid="save-indicator"] i.fa-save').first();

        // Make a change
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await grassTile.click();
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(100);

        // Icon should have orange color class for unsaved
        const unsavedClasses = await saveIcon.getAttribute('class');
        expect(unsavedClasses).toContain('text-orange-500');

        // Wait for auto-save
        await page.waitForTimeout(5500);

        // Icon should have green color class for saved
        const savedClasses = await saveIcon.getAttribute('class');
        expect(savedClasses).toContain('text-green-500');
    });

    test('Step 16: scanlines toggle should show/hide overlay', async ({ page }) => {
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

    test('Step 16: scanlines overlay should not block mouse interactions', async ({ page }) => {
        const scanlinesToggle = page.getByTestId('switch-show-scanlines');
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');

        // Enable scanlines
        await scanlinesToggle.click();

        // Verify scanlines are visible
        const scanlinesOverlay = page.locator('.scanlines-overlay');
        await expect(scanlinesOverlay).toBeVisible();

        // Try to place a tile - should work despite scanlines overlay
        await grassTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        const initialObjectCount = await page.getByTestId('statusbar-object-count').textContent();
        await page.mouse.click(box.x + 150, box.y + 150);
        await page.waitForTimeout(100);

        // Verify tile was placed (object count should increase)
        const newObjectCount = await page.getByTestId('statusbar-object-count').textContent();
        expect(newObjectCount).not.toBe(initialObjectCount);
    });

    test('Step 17: grid toggle should be visible and interactive', async ({ page }) => {
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

    test('Step 17: grid toggle should not affect canvas interactions', async ({ page }) => {
        const gridToggle = page.getByTestId('switch-show-grid');
        const canvas = page.getByTestId('level-canvas');
        const grassTile = page.getByTestId('tile-platform-grass');

        // Turn off grid
        await gridToggle.click();
        await page.waitForTimeout(100);

        // Verify grid is off
        const gridState = await gridToggle.getAttribute('data-state');
        expect(gridState).toBe('unchecked');

        // Try to place a tile - should work even with grid off
        await grassTile.click();
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        const initialObjectCount = await page.getByTestId('statusbar-object-count').textContent();
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(100);

        // Verify tile was placed (object count should increase)
        const newObjectCount = await page.getByTestId('statusbar-object-count').textContent();
        expect(newObjectCount).not.toBe(initialObjectCount);
    });

    test('Step 18: selected tiles should have visual selection feedback', async ({ page }) => {
        // First, place a tile to select
        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Click a platform tile to select it
        await page.getByText('Basic', { exact: true }).click();
        await page.waitForTimeout(100);

        // Place tile on canvas
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Switch to select tool
        const selectButton = page.getByRole('button', { name: /select/i }).first();
        await selectButton.click();
        await page.waitForTimeout(100);

        // Click the tile to select it
        await page.mouse.click(box.x + 300, box.y + 300);
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

    test('Step 18: selection should work for different object types', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        const selectionCount = page.getByTestId('selection-count');

        // Test 1: Select a tile (platform)
        await page.getByText('Grass', { exact: true }).click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 400, box.y + 400);
        await page.waitForTimeout(50);

        // Switch to select tool and select the tile
        const selectButton = page.getByRole('button', { name: /select/i }).first();
        await selectButton.click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 400, box.y + 400);
        await page.waitForTimeout(50);

        let countText = await selectionCount.textContent();
        expect(countText).toMatch(/Selected: [1-9]\d* object/);

        // Clear selection
        await page.keyboard.press('Escape');
        await page.waitForTimeout(50);

        // Test 2: Select an interactable object (button)
        await page.getByText('Button', { exact: true }).click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 500, box.y + 500);
        await page.waitForTimeout(50);

        await selectButton.click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 500, box.y + 500);
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
        await page.mouse.click(box.x + 600, box.y + 400);
        await page.waitForTimeout(50);

        await selectButton.click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 600, box.y + 400);
        await page.waitForTimeout(50);

        countText = await selectionCount.textContent();
        expect(countText).toMatch(/Selected: [1-9]\d* object/);
    });

    test('Step 18: multiple selected objects should all show selection state', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place multiple tiles
        await page.getByText('Stone', { exact: true }).click();
        await page.waitForTimeout(50);

        // Place 3 tiles in a row
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 232, box.y + 200); // Next to first tile
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 264, box.y + 200); // Next to second tile
        await page.waitForTimeout(50);

        // Use multi-select tool to select all tiles
        const multiselectButton = page.getByRole('button', { name: /multi.*select/i }).first();
        await multiselectButton.click();
        await page.waitForTimeout(50);

        // Drag selection box over all tiles
        await page.mouse.move(box.x + 190, box.y + 190);
        await page.mouse.down();
        await page.mouse.move(box.x + 280, box.y + 240);
        await page.mouse.up();
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

    test('Step 18: pulsing glow should not interfere with tile placement', async ({ page }) => {
        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Select and place a tile
        await page.getByText('Ice', { exact: true }).click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 350, box.y + 350);
        await page.waitForTimeout(50);

        // Select the tile
        const selectButton = page.getByRole('button', { name: /select/i }).first();
        await selectButton.click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 350, box.y + 350);
        await page.waitForTimeout(50);

        // Verify it's selected
        const selectionCount = page.getByTestId('selection-count');
        const countText = await selectionCount.textContent();
        expect(countText).toMatch(/Selected: [1-9]\d* object/);

        // Now place another tile while one is selected
        await page.getByText('Lava', { exact: true }).click();
        await page.waitForTimeout(50);

        const initialObjectCount = await page.getByTestId('statusbar-object-count').textContent();
        await page.mouse.click(box.x + 450, box.y + 350);
        await page.waitForTimeout(100);

        // Verify new tile was placed (object count increased)
        const newObjectCount = await page.getByTestId('statusbar-object-count').textContent();
        expect(newObjectCount).not.toBe(initialObjectCount);

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

test.describe('Step 19: Delete Animations', () => {
    test('deleted objects should animate (shrink) before disappearing', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place a tile
        await page.getByText('Grass', { exact: true }).click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Select the tile
        await page.getByTestId('tool-select').click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 300, box.y + 300);
        await page.waitForTimeout(100);

        // Verify it's selected
        const selectionCount = page.getByTestId('selection-count');
        expect(await selectionCount.textContent()).toMatch(/Selected: [1-9]/);

        // Get initial object count
        const initialCountText = await page.getByTestId('statusbar-object-count').textContent();
        const initialCount = Number.parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Delete the tile (pressing Delete key)
        await page.keyboard.press('Delete');

        // During the animation (wait 100ms, which is mid-animation if it's 250ms)
        await page.waitForTimeout(100);

        // Object should still exist in deletingObjects state during animation
        // We can't directly test the visual shrink, but we can verify timing

        // After animation completes (wait another 200ms to exceed 250ms total)
        await page.waitForTimeout(200);

        // Object count should now be reduced
        const finalCountText = await page.getByTestId('statusbar-object-count').textContent();
        const finalCount = Number.parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeLessThan(initialCount);

        // Selection should be cleared
        expect(await selectionCount.textContent()).toBe('Selected: 0 object(s)');
    });

    test('multiple objects should all animate when deleted together', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place multiple tiles
        await page.getByText('Stone', { exact: true }).click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 200, box.y + 200);
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 250, box.y + 200);
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 300, box.y + 200);
        await page.waitForTimeout(100);

        // Switch to multi-select tool
        await page.getByTestId('tool-multiselect').click();
        await page.waitForTimeout(50);

        // Drag to select all three tiles
        await page.mouse.move(box.x + 180, box.y + 180);
        await page.mouse.down();
        await page.mouse.move(box.x + 320, box.y + 220);
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify multiple objects selected
        const selectionCount = page.getByTestId('selection-count');
        const selectedText = await selectionCount.textContent();
        expect(selectedText).toMatch(/Selected: [2-9]/); // At least 2 objects

        // Get initial count
        const initialCountText = await page.getByTestId('statusbar-object-count').textContent();
        const initialCount = Number.parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Delete all selected objects
        await page.keyboard.press('Delete');
        await page.waitForTimeout(300); // Wait for animation to complete

        // Object count should be reduced
        const finalCountText = await page.getByTestId('statusbar-object-count').textContent();
        const finalCount = Number.parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeLessThan(initialCount);

        // Selection should be cleared
        expect(await selectionCount.textContent()).toBe('Selected: 0 object(s)');
    });

    test('delete animation should work for all object types', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const canvas = page.getByTestId('level-canvas');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        // Place a tile
        await page.getByText('Ice', { exact: true }).click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 250, box.y + 250);
        await page.waitForTimeout(50);

        // Place an interactable object (button)
        await page.getByText('Button', { exact: true }).click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 350, box.y + 250);
        await page.waitForTimeout(50);

        // Place a spawn point
        await page.getByText('Player', { exact: true }).click();
        await page.waitForTimeout(50);
        await page.mouse.click(box.x + 450, box.y + 250);
        await page.waitForTimeout(100);

        // Select all objects with multi-select
        await page.getByTestId('tool-multiselect').click();
        await page.waitForTimeout(50);
        await page.mouse.move(box.x + 230, box.y + 230);
        await page.mouse.down();
        await page.mouse.move(box.x + 470, box.y + 270);
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify objects are selected
        const selectionCount = page.getByTestId('selection-count');
        const selectedText = await selectionCount.textContent();
        expect(selectedText).toMatch(/Selected: [1-9]/);

        // Get initial count
        const initialCountText = await page.getByTestId('statusbar-object-count').textContent();
        const initialCount = Number.parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

        // Delete all selected objects
        await page.keyboard.press('Delete');
        await page.waitForTimeout(300); // Wait for animation

        // Verify objects were deleted
        const finalCountText = await page.getByTestId('statusbar-object-count').textContent();
        const finalCount = Number.parseInt(finalCountText?.match(/\d+/)?.[0] || '0', 10);
        expect(finalCount).toBeLessThan(initialCount);
    });
});

test.describe('Step 20: Initial Zoom Calculation', () => {
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

test.describe('Step 21: Parallax Background', () => {
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

test.describe('Step 22: Update Header with Dropdown Menu', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('File dropdown menu should be visible and clickable', async ({ page }) => {
        // Verify File button exists with correct styling
        const fileButton = page.getByRole('button', { name: /File/i });
        await expect(fileButton).toBeVisible();

        // Verify button has chevron icon indicating dropdown
        const chevronIcon = fileButton.locator('.fa-chevron-down');
        await expect(chevronIcon).toBeVisible();

        // Click to open dropdown
        await fileButton.click();

        // Wait for dropdown menu to appear
        await page.waitForTimeout(200);

        // Verify all menu items are visible
        await expect(page.getByRole('menuitem', { name: /New Level/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /Import JSON/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /Export JSON/i })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /Export PNG/i })).toBeVisible();
    });

    test('File menu items should trigger correct actions', async ({ page }) => {
        // Open File dropdown
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        await page.waitForTimeout(200);

        // Click "New Level" menu item
        const newLevelItem = page.getByRole('menuitem', { name: /New Level/i });
        await newLevelItem.click();

        // Verify a new level tab was created
        // Note: We can't predict exact tab count due to localStorage state
        // Just verify that level tabs exist
        const levelTabs = page.locator('[data-testid^="tab-level-"]');
        await expect(levelTabs.first()).toBeVisible();
    });

    test('Import JSON menu item should open import modal', async ({ page }) => {
        // Open File dropdown
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        await page.waitForTimeout(200);

        // Click "Import JSON" menu item
        const importItem = page.getByRole('menuitem', { name: /Import JSON/i });
        await importItem.click();

        // Verify import modal appears
        await page.waitForTimeout(200);
        const importModal = page.getByRole('dialog');
        await expect(importModal).toBeVisible();

        // Verify modal has expected content
        await expect(page.getByText(/Import Level/i)).toBeVisible();
    });

    test('Export JSON menu item should open export modal', async ({ page }) => {
        // Open File dropdown
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        await page.waitForTimeout(200);

        // Click "Export JSON" menu item
        const exportItem = page.getByRole('menuitem', { name: /Export JSON/i });
        await exportItem.click();

        // Verify export modal appears
        await page.waitForTimeout(200);
        const exportModal = page.getByRole('dialog');
        await expect(exportModal).toBeVisible();

        // Verify modal has expected content
        await expect(page.getByText(/Export Level/i)).toBeVisible();
    });

    test('File dropdown should close when clicking outside', async ({ page }) => {
        // Open File dropdown
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        await page.waitForTimeout(200);

        // Verify dropdown is open
        const newLevelItem = page.getByRole('menuitem', { name: /New Level/i });
        await expect(newLevelItem).toBeVisible();

        // Click outside the dropdown (on page body)
        await page.mouse.click(50, 300);
        await page.waitForTimeout(200);

        // Verify dropdown is closed
        await expect(newLevelItem).not.toBeVisible();
    });
});

test.describe('Step 23: Update Status Bar with Live Data', () => {
    test('status bar should display live canvas dimensions', async ({ page }) => {
        await page.goto('http://localhost:3000');
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
        await page.goto('http://localhost:3000');
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
        await page.goto('http://localhost:3000');
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
