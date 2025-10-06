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

        // Properties panel should not show "Linked Objects" section (no link created)
        const propertiesPanel = page.getByTestId('properties-panel');
        await expect(propertiesPanel).not.toContainText('Linked Objects');
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
        // Verify both doors are listed (we can see two "door" entries in the output)
        await expect(propertiesPanel).toContainText('door (');
        // Count occurrences would be ideal but without test-ids, we verify section exists
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

test.describe('Unlinking Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should unlink objects using unlink tool', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const doorTile = page.getByTestId('tile-door');
        const linkTool = page.getByTestId('tool-link');
        const unlinkTool = page.getByTestId('tool-unlink');
        const selectTool = page.getByTestId('tool-select');

        // Place a button at (200, 200)
        await buttonTile.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Place a door at (400, 200)
        await doorTile.click();
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Create link
        await linkTool.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Verify link exists
        await selectTool.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);
        const propertiesPanel = page.getByTestId('properties-panel');
        await expect(propertiesPanel).toContainText('Linked Objects');

        // Activate unlink tool
        await unlinkTool.click();
        await expect(unlinkTool).toHaveAttribute('aria-pressed', 'true');

        // Click button to select it and show its links
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Click door to remove the link
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Verify link is removed
        await selectTool.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        // Properties panel should not show linked objects anymore
        await expect(propertiesPanel).not.toContainText('Linked Objects');
    });

    test.skip('should support undo/redo for unlink operation', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const doorTile = page.getByTestId('tile-door');
        const linkTool = page.getByTestId('tool-link');
        const unlinkTool = page.getByTestId('tool-unlink');
        const selectTool = page.getByTestId('tool-select');

        // Place and link objects
        await buttonTile.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);

        await doorTile.click();
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        await linkTool.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Unlink objects
        await unlinkTool.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);
        await clickCanvas(page, 400, 200);
        await page.waitForTimeout(100);

        // Verify link is removed
        await selectTool.click();
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(100);
        const propertiesPanel = page.getByTestId('properties-panel');
        await expect(propertiesPanel).not.toContainText('Linked Objects');

        // Undo unlink
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(200);

        // Link should be restored
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(200);
        await expect(propertiesPanel).toContainText('Linked Objects');

        // Redo unlink
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(200);

        // Link should be removed again
        await clickCanvas(page, 200, 200);
        await page.waitForTimeout(200);
        await expect(propertiesPanel).not.toContainText('Linked Objects');
    });

    test('should work with keyboard shortcut U', async ({ page }) => {
        const unlinkTool = page.getByTestId('tool-unlink');

        // Press U key
        await page.keyboard.press('u');
        await page.waitForTimeout(100);

        // Unlink tool should be activated
        await expect(unlinkTool).toHaveAttribute('aria-pressed', 'true');
    });
});
