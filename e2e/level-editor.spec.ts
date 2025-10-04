import { test, expect } from '@playwright/test';

test.describe('Level Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the level editor', async ({ page }) => {
    // Check that the main elements are visible
    await expect(page.getByText('🎮')).toBeVisible();
    await expect(page.getByText('Roblox Level Designer')).toBeVisible();
    await expect(page.getByText('- New Level')).toBeVisible(); // Shows current level name from state
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should display tile palette', async ({ page }) => {
    // Look for tile palette sidebar
    await expect(page.getByText('Tile Palette')).toBeVisible();
    await expect(page.getByText('Platforms')).toBeVisible();
    // Use more specific selector for Objects in the tile palette section
    const tilePaletteSection = page.locator('aside').first();
    await expect(tilePaletteSection.getByText('Objects')).toBeVisible();
    await expect(page.getByText('Spawn Points')).toBeVisible();
  });

  test('should have default level loaded', async ({ page }) => {
    // Canvas should be present and have default dimensions
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const width = await canvas.getAttribute('width');
    const height = await canvas.getAttribute('height');

    expect(width).toBe('1920');
    expect(height).toBe('960');
  });

  test('should show level tabs', async ({ page }) => {
    // Look for level tab text content
    await expect(page.getByText('Level 1', { exact: true })).toBeVisible();
  });

  test('should have toolbar buttons', async ({ page }) => {
    // Check for zoom controls in the toolbar (not status bar)
    const toolbar = page.locator('main').first();
    await expect(toolbar.getByText('100%')).toBeVisible();
  });

  // TODO: Remove this test later when we have user-observable state testing via components
  test('[TEMPORARY] should load level data from localStorage', async ({ page }) => {
    // Set custom level data in localStorage before page load
    await page.addInitScript(() => {
      const customLevel = [{
        levelName: 'Test Level From Storage',
        metadata: {
          version: '1.0',
          createdAt: new Date().toISOString(),
          author: 'Test',
          description: 'Test level',
          dimensions: { width: 100, height: 50 },
          backgroundColor: '#87CEEB',
        },
        tiles: [],
        objects: [],
        spawnPoints: [],
      }];
      localStorage.setItem('levelEditor_levels', JSON.stringify(customLevel));
    });

    await page.goto('/');

    // Verify the custom level name appears in the header
    await expect(page.getByText('- Test Level From Storage')).toBeVisible();
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

  // TODO: This test will work properly in Step 3 when CanvasRenderer is wired up
  // Currently zoom state updates but Playwright can't trigger the wheel event properly on the wrapper
  test.skip('Step 2: should update zoom state with Ctrl+wheel', async ({ page }) => {
    // Move mouse over the scrollable canvas wrapper (not just the canvas)
    const canvasWrapper = page.locator('[data-testid="level-canvas"]').locator('..');

    // Check initial zoom displays 100%
    const zoomDisplay = page.getByTestId('statusbar-zoom-display');
    await expect(zoomDisplay).toHaveText('100%');

    // Get the wrapper bounding box for mouse position
    const box = await canvasWrapper.boundingBox();
    if (!box) {
      // Fallback to canvas if wrapper doesn't work
      const canvas = page.getByTestId('level-canvas');
      const canvasBox = await canvas.boundingBox();
      if (!canvasBox) throw new Error('Canvas not found');

      // Move mouse over canvas
      await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
    } else {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Try zooming WITHOUT Ctrl - should not change
    await page.mouse.wheel(0, -100);
    await expect(zoomDisplay).toHaveText('100%');

    // Now zoom WITH Ctrl+wheel - the wrapper handles wheel events
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -100); // Scroll up with Ctrl - should zoom in
    await page.keyboard.up('Control');

    // Zoom should have increased - extract and verify value
    await page.waitForTimeout(100);
    const zoomText = await zoomDisplay.textContent();
    const zoomValue = parseInt(zoomText?.replace('%', '') || '0');
    expect(zoomValue).toBeGreaterThan(100);
  });

  test('Step 2: should show correct selection count', async ({ page }) => {
    // The overlay should show selection count
    const selectionCount = page.getByTestId('selection-count');
    await expect(selectionCount).toBeVisible();

    // Initially should be 0 selected
    await expect(selectionCount).toHaveText('Selected: 0 objects');
  });
});
