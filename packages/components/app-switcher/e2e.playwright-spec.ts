import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqAppSwitcherModule', () => {
    test.describe('E2eAppSwitcherStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAppSwitcherStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eAppSwitcherStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eAppSwitcherWithSitesStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAppSwitcherWithSitesStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eAppSwitcherWithSitesStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('keyboard navigation', () => {
        // The e2e host always renders one <kbq-app-switcher> inline (used by the screenshot tests);
        // clicking the trigger opens a second instance in the CDK overlay. Scope every locator to the
        // overlay panel so it never ambiguously matches the always-present inline instance.
        const overlay = (page: Page) => page.locator('.kbq-app-switcher__panel');
        const listItem = (page: Page) => overlay(page).locator('.kbq-app-switcher-list-item');
        const focusedItem = (page: Page) =>
            overlay(page).locator('.kbq-app-switcher-list-item.cdk-keyboard-focused').first();

        const openStates = async (page: Page) => {
            await page.goto('/E2eAppSwitcherStates');
            await page.getByTestId('e2eAppSwitcherStates').getByRole('button').click();
            await expect(overlay(page)).toBeVisible();
        };

        test('ArrowDown then ArrowUp returns focus to the same item', async ({ page }) => {
            await openStates(page);

            await page.keyboard.press('ArrowDown');
            const afterDown = await focusedItem(page).textContent();

            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowUp');

            expect(await focusedItem(page).textContent()).toBe(afterDown);
        });

        test('the keyboard-focused item renders a visible focus ring', async ({ page }) => {
            await openStates(page);

            await page.keyboard.press('ArrowDown');

            // The list item has no base border, so the ring is drawn with an inset box-shadow.
            const ring = await focusedItem(page).evaluate((el) => getComputedStyle(el).boxShadow);

            expect(ring).not.toBe('none');
            expect(ring).toContain('inset');
        });

        test('End and Home move to the last and first item', async ({ page }) => {
            await openStates(page);

            await page.keyboard.press('End');
            const lastText = await listItem(page).last().textContent();

            expect(await focusedItem(page).textContent()).toBe(lastText);

            await page.keyboard.press('Home');
            const firstText = await listItem(page).first().textContent();

            expect(await focusedItem(page).textContent()).toBe(firstText);
        });

        test('Escape closes the switcher', async ({ page }) => {
            await openStates(page);

            await page.keyboard.press('Escape');

            await expect(overlay(page)).toBeHidden();
        });

        test('ArrowLeft collapses an app group', async ({ page }) => {
            await page.goto('/E2eAppSwitcherWithSitesStates');
            await page.getByTestId('e2eAppSwitcherWithSitesStates').getByRole('button').click();
            await expect(overlay(page)).toBeVisible();

            // The search field is focused first; ArrowDown moves onto the first group header.
            await page.keyboard.press('ArrowDown');
            const header = overlay(page).locator('.kbq-app-switcher-list-item[aria-expanded]').first();

            await expect(header).toHaveAttribute('aria-expanded', 'true');

            await page.keyboard.press('ArrowLeft');
            await expect(header).toHaveAttribute('aria-expanded', 'false');
        });
    });
});
