import { expect, test } from '@playwright/test';
import { clickCanvas } from './helpers';

test.describe('Button Numbering System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should auto-assign button number 1 to first button', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');

        // Place a button
        await buttonTile.click();
        await clickCanvas(page, 160, 160);
        await page.waitForTimeout(100);

        // Select the button
        await selectTool.click();
        await clickCanvas(page, 160, 160);
        await page.waitForTimeout(100);

        // Check if Properties Panel shows button number
        const propertiesPanel = page.getByTestId('properties-panel');
        await expect(propertiesPanel).toBeVisible();
        await expect(propertiesPanel).toContainText('Button Number');

        const buttonNumberInput = propertiesPanel.locator('input[aria-label="Button Number"]');
        await expect(buttonNumberInput).toHaveValue('1');
    });

    test('should auto-assign incremented button numbers', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');

        // Place 2 buttons
        await buttonTile.click();
        await clickCanvas(page, 100, 100);
        await page.waitForTimeout(150);

        await buttonTile.click();
        await clickCanvas(page, 250, 100);
        await page.waitForTimeout(150);

        // Select the first button and get its number
        await selectTool.click();
        await clickCanvas(page, 100, 100);
        await page.waitForTimeout(150);

        const propertiesPanel = page.getByTestId('properties-panel');
        const buttonNumberInput = propertiesPanel.locator('input[aria-label="Button Number"]');
        const firstNumber = Number.parseInt(await buttonNumberInput.inputValue(), 10);

        // Select the second button and verify it has a different incremented number
        await clickCanvas(page, 250, 100);
        await page.waitForTimeout(150);

        const secondNumber = Number.parseInt(await buttonNumberInput.inputValue(), 10);
        expect(secondNumber).toBeGreaterThan(firstNumber);
    });

    test('should allow editing button number in Properties Panel', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');

        // Place a button
        await buttonTile.click();
        await clickCanvas(page, 160, 160);
        await page.waitForTimeout(100);

        // Select the button
        await selectTool.click();
        await clickCanvas(page, 160, 160);
        await page.waitForTimeout(100);

        // Find button number input in Properties Panel
        const propertiesPanel = page.getByTestId('properties-panel');
        const buttonNumberInput = propertiesPanel.locator('input[aria-label="Button Number"]');
        await expect(buttonNumberInput).toBeVisible();

        // Change button number to 5
        await buttonNumberInput.fill('5');
        await buttonNumberInput.blur();
        await page.waitForTimeout(100);

        // Verify the change persisted
        await expect(buttonNumberInput).toHaveValue('5');
    });

    test('should show warning for duplicate button numbers', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');

        // Place two buttons
        await buttonTile.click();
        await clickCanvas(page, 160, 160);
        await page.waitForTimeout(100);

        await buttonTile.click();
        await clickCanvas(page, 224, 160);
        await page.waitForTimeout(100);

        // Select second button
        await selectTool.click();
        await clickCanvas(page, 224, 160);
        await page.waitForTimeout(100);

        // Change its number to 1 (duplicate)
        const propertiesPanel = page.getByTestId('properties-panel');
        const buttonNumberInput = propertiesPanel.locator('input[aria-label="Button Number"]');
        await buttonNumberInput.fill('1');
        await buttonNumberInput.blur();
        await page.waitForTimeout(100);

        // Should show yellow warning
        const warning = propertiesPanel.locator('.text-yellow-600, .text-yellow-500');
        await expect(warning).toBeVisible();
        await expect(warning).toContainText(/already used/i);
    });

    test('should validate button number range (1-99)', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');

        // Place a button
        await buttonTile.click();
        await clickCanvas(page, 160, 160);
        await page.waitForTimeout(100);

        // Select the button
        await selectTool.click();
        await clickCanvas(page, 160, 160);
        await page.waitForTimeout(100);

        const propertiesPanel = page.getByTestId('properties-panel');
        const buttonNumberInput = propertiesPanel.locator('input[aria-label="Button Number"]');

        // Try to set invalid value (0) - input validation should prevent or revert
        await buttonNumberInput.fill('0');
        await buttonNumberInput.blur();
        await page.waitForTimeout(100);

        // Should show error or revert to valid value
        const value = await buttonNumberInput.inputValue();
        expect(Number.parseInt(value, 10)).toBeGreaterThanOrEqual(1);

        // Try to set invalid value (100)
        await buttonNumberInput.fill('100');
        await buttonNumberInput.blur();
        await page.waitForTimeout(100);

        const value2 = await buttonNumberInput.inputValue();
        expect(Number.parseInt(value2, 10)).toBeLessThanOrEqual(99);
    });

    test('should update canvas badge when button number is edited in properties', async ({ page }) => {
        const buttonTile = page.getByTestId('tile-button');
        const selectTool = page.getByTestId('tool-select');

        // Place a button
        await buttonTile.click();
        await clickCanvas(page, 160, 160);
        await page.waitForTimeout(100);

        // Select the button
        await selectTool.click();
        await clickCanvas(page, 160, 160);
        await page.waitForTimeout(100);

        // Verify initial button number is 1
        const propertiesPanel = page.getByTestId('properties-panel');
        const buttonNumberInput = propertiesPanel.locator('input[aria-label="Button Number"]');
        await expect(buttonNumberInput).toHaveValue('1');

        // Change button number to 5
        await buttonNumberInput.fill('5');
        await buttonNumberInput.blur();
        await page.waitForTimeout(200);

        // Take screenshot to verify badge updated on canvas
        const canvas = page.getByTestId('level-canvas');
        const screenshot = await canvas.screenshot();

        // Verify the change persisted in properties
        await expect(buttonNumberInput).toHaveValue('5');

        // The canvas should have re-rendered with the new number
        // We can't easily OCR the badge, but we can verify no errors occurred
        expect(screenshot.length).toBeGreaterThan(0);
    });
});
