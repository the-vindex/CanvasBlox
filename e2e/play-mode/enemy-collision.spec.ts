import { expect, test } from '@playwright/test';

test.describe('Enemy Collision', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('player cannot take damage while invulnerable', async ({ page }) => {
        // Create a level with platform, player spawn, and enemy spawn very close together
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        // Place horizontal platform
        const canvas = page.getByTestId('level-canvas');
        for (let x = 5; x < 10; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 10 * 32 + 16 } });
        }

        // Add player spawn point
        await page.getByTestId('tile-spawn-player').click();
        await canvas.click({ position: { x: 6 * 32 + 16, y: 9 * 32 + 16 } });

        // Add enemy spawn point next to player
        await page.getByTestId('tile-spawn-enemy').click();
        await canvas.click({ position: { x: 7 * 32 + 16, y: 9 * 32 + 16 } });

        // Enter play mode
        await page.getByTestId('button-play-mode').click();

        const playCanvas = page.getByTestId('play-mode-canvas');
        await expect(playCanvas).toBeVisible();

        // Move right to collide with enemy
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(200); // Take first hit
        await page.keyboard.up('ArrowRight');

        // Verify player lost 1 heart
        const filledHeartsAfterFirstHit = page.locator('[data-testid="heart-filled"]');
        await expect(filledHeartsAfterFirstHit).toHaveCount(2);

        // Continue colliding while invulnerable
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(500); // Stay in contact
        await page.keyboard.up('ArrowRight');

        // Verify player still has 2 hearts (invulnerability prevented damage)
        const filledHeartsAfterInvuln = page.locator('[data-testid="heart-filled"]');
        await expect(filledHeartsAfterInvuln).toHaveCount(2);
    });
});
