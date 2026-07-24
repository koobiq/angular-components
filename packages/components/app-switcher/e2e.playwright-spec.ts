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

        test('pressed', async ({ page }) => {
            await page.goto('/E2eAppSwitcherStates');
            const locator = getComponent(page);
            const items = page.locator('.kbq-app-switcher-list-item');

            await items.first().waitFor();
            // App rows are generated from data, so the pressed class is applied from the spec rather than the
            // fixture template (select/dropdown/tree fake `.kbq-active`/`.kbq-pressed` inline instead).
            // `.kbq-app-switcher-list-item` has no `.kbq-active` host binding, so the injected class survives.
            await items.nth(0).evaluate((el) => el.classList.add('kbq-active')); // selected + pressed
            await items.nth(1).evaluate((el) => el.classList.add('kbq-active')); // pressed

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-pressed-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-pressed-dark.png');
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
});
