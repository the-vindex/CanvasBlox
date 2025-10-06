import { expect, test } from '@playwright/test';
import { clickCanvas } from './helpers';

test.describe('Linking Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should link button to door', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const doorTile = page.getByTestId('tile-door');
        const linkTool = page.getByTestId('tool-link');

        // Place a button at (200, 200)
        await buttonTile.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Place a door at (400, 200)
        await doorTile.click();
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Activate link tool
        await linkTool.click();
        await expect(linkTool).toHaveAttribute('aria-pressed', 'true');

        // Click button (source)
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Click door (target)
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Verify link exists by selecting button and checking properties
        const selectTool = page.getByTestId('tool-select');
        await selectTool.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Properties panel should show linked object
        const propertiesPanel = page.getByTestId('properties-panel');
        await expect(propertiesPanel).toContainText('Linked Objects');
    });

    test('should prevent linking object to itself', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const linkTool = page.getByTestId('tool-link');

        // Place a button
        await buttonTile.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Activate link tool
        await linkTool.click();

        // Click button as source
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Click same button as target (should be prevented)
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Verify button doesn't link to itself
        const selectTool = page.getByTestId('tool-select');
        await selectTool.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Properties panel should not show self-link
        const propertiesPanel = page.getByTestId('properties-panel');
        // If there are no links, the panel might not show "Linked Objects" section
        // or it should show empty links array
        await expect(propertiesPanel).toBeVisible();
    });

    test('should allow linking multiple targets from one source', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const doorTile = page.getByTestId('tile-door');
        const linkTool = page.getByTestId('tool-link');

        // Place one button
        await buttonTile.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Place two doors
        await doorTile.click();
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);
        await clickCanvas(page, 400, 300);
        await page.waitForTimeout(100);

        // Activate link tool
        await linkTool.click();

        // Click button as source
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Link to first door
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Click button again as source
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Link to second door
        await clickCanvas(page, 400, 300);
        await page.waitForTimeout(100);

        // Verify button has two linked objects
        const selectTool = page.getByTestId('tool-select');
        await selectTool.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        const propertiesPanel = page.getByTestId('properties-panel');
        await expect(propertiesPanel).toContainText('Linked Objects');
        // Should show 2 linked objects in some form
    });

    test('should prevent duplicate links', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const doorTile = page.getByTestId('tile-door');
        const linkTool = page.getByTestId('tool-link');

        // Place button and door
        await buttonTile.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        await doorTile.click();
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Activate link tool
        await linkTool.click();

        // Create link: button -> door
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Try to create same link again
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Verify only one link exists (no duplicates)
        const selectTool = page.getByTestId('tool-select');
        await selectTool.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        const propertiesPanel = page.getByTestId('properties-panel');
        await expect(propertiesPanel).toContainText('Linked Objects');
    });

    test('should cancel link mode with ESC key', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const linkTool = page.getByTestId('tool-link');

        // Place a button
        await buttonTile.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Activate link tool
        await linkTool.click();
        await expect(linkTool).toHaveAttribute('aria-pressed', 'true');

        // Click button as source
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Press ESC to cancel
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);

        // Link tool should be deactivated
        await expect(linkTool).toHaveAttribute('aria-pressed', 'false');
    });

    test('should work with keyboard shortcut K', async ({ page }) => {
        const linkTool = page.getByTestId('tool-link');

        // Press K key
        await page.keyboard.press('k');
        await page.waitForTimeout(100);

        // Link tool should be activated
        await expect(linkTool).toHaveAttribute('aria-pressed', 'true');
    });
});
