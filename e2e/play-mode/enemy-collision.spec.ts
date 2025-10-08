import { expect, test } from '@playwright/test';

test.describe('Enemy Collision', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // Note: This test is timing-dependent with patrolling enemies
    // More comprehensive enemy collision tests are in enemy-ai.spec.ts
    test.skip('player cannot take damage while invulnerable', async ({ page }) => {
        // Create a small enclosed platform to force enemy-player collision
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        // Place short horizontal platform (enemy will patrol back and forth)
        const canvas = page.getByTestId('level-canvas');
        for (let x = 5; x < 10; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 10 * 32 + 16 } });
        }

        // Add walls on both sides to trap player and enemy together
        for (let y = 5; y < 10; y++) {
            await canvas.click({ position: { x: 4 * 32 + 16, y: y * 32 + 16 } }); // Left wall
            await canvas.click({ position: { x: 10 * 32 + 16, y: y * 32 + 16 } }); // Right wall
        }

        // Add player spawn point in the enclosed area
        await page.getByTestId('tile-spawn-player').click();
        await canvas.click({ position: { x: 6 * 32 + 16, y: 9 * 32 + 16 } });

        // Add enemy spawn point in same area (enemy will patrol and hit player)
        await page.getByTestId('tile-spawn-enemy').click();
        await canvas.click({ position: { x: 8 * 32 + 16, y: 9 * 32 + 16 } });

        // Enter play mode
        await page.getByTestId('button-play-mode').click();

        const playCanvas = page.getByTestId('play-mode-canvas');
        await expect(playCanvas).toBeVisible();

        // Wait for enemy to patrol left toward player
        await page.waitForTimeout(1000);

        // Verify player took damage from enemy collision
        const filledHeartsAfterCollision = page.locator('[data-testid="heart-filled"]');
        await expect(filledHeartsAfterCollision).toHaveCount(2);

        // Wait a bit more while invulnerable
        await page.waitForTimeout(800);

        // Player should still have 2 hearts (invulnerability prevented further damage)
        const filledHeartsAfterInvuln = page.locator('[data-testid="heart-filled"]');
        await expect(filledHeartsAfterInvuln).toHaveCount(2);
    });
});
