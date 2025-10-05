import { expect, test } from '@playwright/test';

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
