import { expect, Page, test } from '@playwright/test';

const tooltip = (page: Page) => page.locator('.kbq-tooltip');

test.describe('KbqTitleDirective', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/E2eTitleOverflow');
    });

    test('should show the tooltip for truncated text on hover', async ({ page }) => {
        await page.getByTestId('titleTruncated').hover();

        await expect(tooltip(page)).toBeVisible();
        await expect(tooltip(page)).toContainText('A very long value');
    });

    test('should not show the tooltip when the text fits', async ({ page }) => {
        await page.getByTestId('titleFits').hover();

        // Longer than the tooltip enterDelay (400ms), so a tooltip that should not open has had time to appear.
        // Without the wait the assertion resolves on its first poll, while the tooltip is still absent anyway.
        await page.waitForTimeout(800);
        await expect(tooltip(page)).toBeHidden();
    });

    test('should show the tooltip for vertically clamped text', async ({ page }) => {
        await page.getByTestId('titleClamped').hover();

        await expect(tooltip(page)).toBeVisible();
    });

    test('should show the tooltip when one of several text elements is clipped', async ({ page }) => {
        await page.getByTestId('titleMultipleText').hover();

        await expect(tooltip(page)).toBeVisible();
    });

    test('should ignore a sub-pixel clip that text-overflow: clip makes invisible', async ({ page }) => {
        await page.getByTestId('titleSubPixelClip').hover();

        // Longer than the tooltip enterDelay (400ms), so a tooltip that should not open has had time to appear.
        await page.waitForTimeout(800);
        await expect(tooltip(page)).toBeHidden();
    });

    test('should show the tooltip for a sub-pixel overflow rendered with an ellipsis', async ({ page }) => {
        await page.getByTestId('titleSubPixelEllipsis').hover();

        await expect(tooltip(page)).toBeVisible();
    });

    test('should open the tooltip on keyboard focus and hide it on blur', async ({ page }) => {
        // Pressed on whatever holds focus rather than through `locator('body').press()`, which focuses the
        // body first: that would send every Tab from the same starting point instead of advancing.
        await page.keyboard.press('Tab');

        await expect(page.getByTestId('titleKeyboard')).toBeFocused();
        await expect(tooltip(page)).toBeVisible();
        await expect(tooltip(page)).toContainText('A very long button label');

        await page.keyboard.press('Tab');

        // Asserted rather than assumed: the button is the only focusable element in the fixture, so this is
        // what makes the tooltip assertion below about a blur and not about where Tab happened to land.
        await expect(page.getByTestId('titleKeyboard')).not.toBeFocused();
        await expect(tooltip(page)).toBeHidden();
    });
});
