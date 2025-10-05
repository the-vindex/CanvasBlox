import { expect, test } from '@playwright/test';

test.describe('Import/Export', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should open import modal when import button clicked', async ({ page }) => {
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

    test('should close import modal when cancel clicked', async ({ page }) => {
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

    test('should import valid JSON level data using new level mode', async ({ page }) => {
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

    test('should show error for invalid JSON', async ({ page }) => {
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
        await page.waitForTimeout(500);

        // Should show error toast (modal should still be open on error)
        await expect(page.getByText(/Import Failed/i).first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/Invalid JSON/i).first()).toBeVisible();
    });

    test('should open export modal when export JSON clicked', async ({ page }) => {
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

    test('should close export modal when close clicked', async ({ page }) => {
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

    test('should display current level JSON in export modal', async ({ page }) => {
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

    test('should export PNG when export PNG clicked', async ({ page }) => {
        // Open File menu
        const fileButton = page.getByRole('button', { name: /File/i });
        await fileButton.click();

        // Wait for dropdown menu to be visible
        const exportPngButton = page.getByRole('menuitem', { name: /Export PNG/ });
        await expect(exportPngButton).toBeVisible();

        // Click Export PNG option
        await exportPngButton.click();
        await page.waitForTimeout(500);

        // Verify export success toast appears (download happens but Playwright can't detect programmatic downloads)
        await expect(page.getByText('Exported').first()).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Level exported as PNG!').first()).toBeVisible();
    });

    test('should import as new level by default', async ({ page }) => {
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

    test('should overwrite current level when overwrite mode selected', async ({ page }) => {
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

    test('should validate single player spawn on import (new level mode)', async ({ page }) => {
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

    test('should preserve level data after export and import', async ({ page }) => {
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
});
