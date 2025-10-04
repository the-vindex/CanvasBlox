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
});
