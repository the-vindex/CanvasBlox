import { expect, test } from '@playwright/test';

test.describe('Close Level Dialog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should show level name in close confirmation dialog', async ({ page }) => {
        // Create a second level first
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await newLevelButton.click();

        // Add some content to the level so the confirmation appears
        // Select a tile first
        const platformBasic = page.getByTestId('tile-platform-basic');
        await platformBasic.click();

        // Click on the main level canvas to place a tile
        const canvas = page.getByTestId('level-canvas');
        await canvas.click({ position: { x: 100, y: 100 } });

        // Set up dialog handler to capture the message
        let dialogMessage = '';
        page.once('dialog', async (dialog) => {
            dialogMessage = dialog.message();
            await dialog.dismiss(); // Don't close the level
        });

        // Click close button on the second level (should be "New Level 2")
        const closeButton = page.getByTestId('button-close-level-1');
        await closeButton.click();

        // Wait a bit for dialog to appear
        await page.waitForTimeout(100);

        // Verify dialog message contains the level name (should be "New Level 1")
        expect(dialogMessage).toContain('New Level 1');
        expect(dialogMessage).toContain('All unsaved changes will be lost');
        expect(dialogMessage).toContain('cannot be undone');
    });

    test('should show clear warning message about data loss', async ({ page }) => {
        // Create a second level
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await newLevelButton.click();

        // Add content by placing a tile
        const platformBasic = page.getByTestId('tile-platform-basic');
        await platformBasic.click();

        const canvas = page.getByTestId('level-canvas');
        await canvas.click({ position: { x: 200, y: 200 } });

        // Set up dialog handler
        let dialogMessage = '';
        page.once('dialog', async (dialog) => {
            dialogMessage = dialog.message();
            await dialog.dismiss();
        });

        const closeButton = page.getByTestId('button-close-level-1');
        await closeButton.click();

        await page.waitForTimeout(100);

        // Verify message is kid-friendly and clear
        expect(dialogMessage.toLowerCase()).toContain('sure');
        expect(dialogMessage.toLowerCase()).toContain('close');
        expect(dialogMessage.toLowerCase()).toContain('lost');
    });

    test('should show dialog when closing level with default tiles', async ({ page }) => {
        // Create a second level (comes with default grass platform tiles)
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();
        const newLevelButton = page.getByRole('menuitem', { name: /New Level/ });
        await newLevelButton.click();

        // Set up dialog handler to accept the confirmation
        let dialogTriggered = false;
        page.on('dialog', async (dialog) => {
            dialogTriggered = true;
            await dialog.accept();
        });

        // Try to close the new level (has default tiles, should show dialog)
        const closeButton = page.getByTestId('button-close-level-1');
        await closeButton.click();

        await page.waitForTimeout(200);

        // Verify dialog appeared because level has default tiles
        expect(dialogTriggered).toBe(true);

        // Verify level was closed after accepting dialog (only 1 tab remains)
        const tabsCount = await page.getByTestId(/tab-level-\d+/).count();
        expect(tabsCount).toBe(1);
    });
});
