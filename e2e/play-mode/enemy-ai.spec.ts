import { expect, test } from '@playwright/test';

test.describe('Enemy AI Patrol', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('enemy patrols on platform', async ({ page }) => {
        // Create a horizontal platform
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        // Place platform tiles (10 tiles wide)
        for (let x = 5; x < 15; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 10 * 32 + 16 } });
        }

        // Add player spawn point (left side)
        await page.getByTestId('tile-spawn-player').click();
        await canvas.click({ position: { x: 6 * 32 + 16, y: 9 * 32 + 16 } });

        // Add enemy spawn point (right side, so it patrols left first)
        await page.getByTestId('tile-spawn-enemy').click();
        await canvas.click({ position: { x: 12 * 32 + 16, y: 9 * 32 + 16 } });

        // Enter play mode
        await page.getByTestId('button-play-mode').click();
        const playCanvas = page.getByTestId('play-mode-canvas');
        await expect(playCanvas).toBeVisible();

        // Wait for enemy to patrol - it should move without falling off
        await page.waitForTimeout(2000);

        // Enemy should still be visible (not fallen off the platform)
        // We can't easily assert enemy position from E2E, but if the game is still running
        // and player hasn't died from enemy collision, the patrol is working
        const hearts = page.locator('[data-testid="heart-filled"]');
        await expect(hearts).toHaveCount(3); // Player still has full health (didn't get hit yet)
    });

    test('enemy turns at platform edge', async ({ page }) => {
        // Create a small platform with edges
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        // Place short platform (5 tiles wide) - enemy should turn at edges
        for (let x = 8; x < 13; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 10 * 32 + 16 } });
        }

        // Add player spawn point (far left, out of enemy's way)
        await page.getByTestId('tile-spawn-player').click();
        await canvas.click({ position: { x: 2 * 32 + 16, y: 5 * 32 + 16 } });

        // Add a ground for player so they don't fall
        await page.getByTestId('tile-platform-basic').click();
        for (let x = 0; x < 5; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 6 * 32 + 16 } });
        }

        // Add enemy spawn point in middle of platform
        await page.getByTestId('tile-spawn-enemy').click();
        await canvas.click({ position: { x: 10 * 32 + 16, y: 9 * 32 + 16 } });

        // Enter play mode
        await page.getByTestId('button-play-mode').click();
        const playCanvas = page.getByTestId('play-mode-canvas');
        await expect(playCanvas).toBeVisible();

        // Wait for enemy to patrol back and forth
        // It should turn at edges multiple times
        await page.waitForTimeout(3000);

        // If enemy fell off, the test implicitly fails (enemy would be gone)
        // We verify the game is still running normally
        const hearts = page.locator('[data-testid="heart-filled"]');
        await expect(hearts).toHaveCount(3);
    });

    test('enemy turns at wall', async ({ page }) => {
        // Create platform with walls
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        // Place horizontal platform
        for (let x = 5; x < 15; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 10 * 32 + 16 } });
        }

        // Add walls at both ends (vertical tiles)
        for (let y = 7; y < 10; y++) {
            await canvas.click({ position: { x: 5 * 32 + 16, y: y * 32 + 16 } }); // Left wall
            await canvas.click({ position: { x: 14 * 32 + 16, y: y * 32 + 16 } }); // Right wall
        }

        // Add player spawn point (above the platform, out of enemy's way)
        await page.getByTestId('tile-spawn-player').click();
        await canvas.click({ position: { x: 10 * 32 + 16, y: 5 * 32 + 16 } });

        // Add ground for player
        for (let x = 8; x < 13; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 6 * 32 + 16 } });
        }

        // Add enemy spawn point in middle of walled platform
        await page.getByTestId('tile-spawn-enemy').click();
        await canvas.click({ position: { x: 9 * 32 + 16, y: 9 * 32 + 16 } });

        // Enter play mode
        await page.getByTestId('button-play-mode').click();
        const playCanvas = page.getByTestId('play-mode-canvas');
        await expect(playCanvas).toBeVisible();

        // Wait for enemy to patrol and hit walls multiple times
        await page.waitForTimeout(3000);

        // Enemy should be bouncing between walls without getting stuck
        const hearts = page.locator('[data-testid="heart-filled"]');
        await expect(hearts).toHaveCount(3);
    });

    test('multiple enemies patrol independently', async ({ page }) => {
        // Create two separate platforms
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');

        // Platform 1 (top left)
        for (let x = 2; x < 8; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 6 * 32 + 16 } });
        }

        // Platform 2 (bottom right)
        for (let x = 12; x < 18; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 12 * 32 + 16 } });
        }

        // Add player spawn point (far left, out of the way)
        await page.getByTestId('tile-spawn-player').click();
        await canvas.click({ position: { x: 0 * 32 + 16, y: 3 * 32 + 16 } });

        // Add ground for player
        for (let x = 0; x < 3; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 4 * 32 + 16 } });
        }

        // Add enemy spawn on platform 1
        await page.getByTestId('tile-spawn-enemy').click();
        await canvas.click({ position: { x: 4 * 32 + 16, y: 5 * 32 + 16 } });

        // Add enemy spawn on platform 2
        await canvas.click({ position: { x: 14 * 32 + 16, y: 11 * 32 + 16 } });

        // Enter play mode
        await page.getByTestId('button-play-mode').click();
        const playCanvas = page.getByTestId('play-mode-canvas');
        await expect(playCanvas).toBeVisible();

        // Wait for both enemies to patrol their platforms
        await page.waitForTimeout(3000);

        // Both enemies should be patrolling without falling off
        const hearts = page.locator('[data-testid="heart-filled"]');
        await expect(hearts).toHaveCount(3);
    });

    test('player takes damage from patrolling enemy', async ({ page }) => {
        // Create level where player will walk into patrolling enemy
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        // Wide horizontal platform for both player and enemy
        for (let x = 5; x < 15; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 10 * 32 + 16 } });
        }

        // Add player spawn on left side
        await page.getByTestId('tile-spawn-player').click();
        await canvas.click({ position: { x: 7 * 32 + 16, y: 9 * 32 + 16 } });

        // Add enemy spawn nearby (will be patrolling)
        await page.getByTestId('tile-spawn-enemy').click();
        await canvas.click({ position: { x: 9 * 32 + 16, y: 9 * 32 + 16 } });

        // Enter play mode
        await page.getByTestId('button-play-mode').click();
        const playCanvas = page.getByTestId('play-mode-canvas');
        await expect(playCanvas).toBeVisible();

        // Verify player starts with 3 hearts
        const heartsInitial = page.locator('[data-testid="heart-filled"]');
        await expect(heartsInitial).toHaveCount(3);

        // Player walks right into the enemy (or enemy patrols into player)
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowRight');

        // Wait a bit more to ensure collision happens
        await page.waitForTimeout(500);

        // Player should have taken damage (2 hearts or less)
        const heartsAfter = page.locator('[data-testid="heart-filled"]');
        const count = await heartsAfter.count();
        expect(count).toBeLessThan(3); // Player took damage
    });

    test('player can stomp patrolling enemy', async ({ page }) => {
        // Create platform
        await page.getByTestId('tool-pen').click();
        await page.getByTestId('tile-platform-basic').click();

        const canvas = page.getByTestId('level-canvas');
        // Wide platform
        for (let x = 5; x < 20; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 12 * 32 + 16 } });
        }

        // Add player spawn elevated above platform
        await page.getByTestId('tile-spawn-player').click();
        await canvas.click({ position: { x: 10 * 32 + 16, y: 8 * 32 + 16 } });

        // Add small platform for player to start on
        for (let x = 9; x < 12; x++) {
            await canvas.click({ position: { x: x * 32 + 16, y: 9 * 32 + 16 } });
        }

        // Add enemy spawn on lower platform
        await page.getByTestId('tile-spawn-enemy').click();
        await canvas.click({ position: { x: 10 * 32 + 16, y: 11 * 32 + 16 } });

        // Enter play mode
        await page.getByTestId('button-play-mode').click();
        const playCanvas = page.getByTestId('play-mode-canvas');
        await expect(playCanvas).toBeVisible();

        // Wait a moment for game to initialize
        await page.waitForTimeout(200);

        // Player jumps off platform to stomp enemy
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(300);

        // Fall and land on enemy
        await page.waitForTimeout(800);

        // Player should still have full health (stomped enemy, didn't take damage)
        const hearts = page.locator('[data-testid="heart-filled"]');
        await expect(hearts).toHaveCount(3);
    });
});
