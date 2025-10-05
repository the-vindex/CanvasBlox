import type { Page } from '@playwright/test';

/**
 * Get canvas bounding box with error handling
 * @param page - Playwright page object
 * @returns Canvas bounding box
 * @throws Error if canvas not found
 */
export async function getCanvasBounds(page: Page) {
    const canvas = page.getByTestId('level-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    return box;
}

/**
 * Click on canvas at specific coordinates relative to canvas origin
 * @param page - Playwright page object
 * @param x - X coordinate relative to canvas left edge
 * @param y - Y coordinate relative to canvas top edge
 */
export async function clickCanvas(page: Page, x: number, y: number) {
    const box = await getCanvasBounds(page);
    await page.mouse.click(box.x + x, box.y + y);
}

/**
 * Select a tile from palette and place it at specific canvas coordinates
 * @param page - Playwright page object
 * @param tileTestId - Test ID of the tile button (e.g., 'tile-platform-grass')
 * @param x - X coordinate relative to canvas left edge
 * @param y - Y coordinate relative to canvas top edge
 */
export async function placeTile(page: Page, tileTestId: string, x: number, y: number) {
    await page.getByTestId(tileTestId).click();
    await clickCanvas(page, x, y);
    await page.waitForTimeout(100); // Wait for render
}

/**
 * Select a tool from the toolbar
 * @param page - Playwright page object
 * @param tool - Tool name ('select' | 'multiselect' | 'move' | 'pen' | 'line' | 'rectangle' | 'link')
 */
export async function selectTool(
    page: Page,
    tool: 'select' | 'multiselect' | 'move' | 'pen' | 'line' | 'rectangle' | 'link'
) {
    await page.getByTestId(`tool-${tool}`).click();
}

/**
 * Get current zoom value from toolbar or status bar
 * @param page - Playwright page object
 * @param source - Where to read zoom from ('toolbar' | 'statusbar'), defaults to 'statusbar'
 * @returns Zoom percentage as number (e.g., 100 for 100%)
 */
export async function getZoomValue(page: Page, source: 'toolbar' | 'statusbar' = 'statusbar'): Promise<number> {
    const testId = source === 'toolbar' ? 'zoom-level' : 'statusbar-zoom-display';
    const text = await page.getByTestId(testId).textContent();
    return parseInt(text?.replace('%', '') || '100', 10);
}

/**
 * Get total object count from status bar
 * @param page - Playwright page object
 * @returns Object count as number
 */
export async function getObjectCount(page: Page): Promise<number> {
    const statusText = await page.getByTestId('statusbar-object-count').textContent();
    const match = statusText?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}
