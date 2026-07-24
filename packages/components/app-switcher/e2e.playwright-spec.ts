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

        test('the keyboard-focused item looks like hover with no ring', async ({ page }) => {
            await openStates(page);

            await page.keyboard.press('ArrowDown');
            const focused = focusedItem(page);

            // Focus is a background fill only — no ring/border/box-shadow, like the dropdown.
            expect(await focused.evaluate((el) => getComputedStyle(el).boxShadow)).toBe('none');

            // The focus background matches a hovered sibling's background.
            const focusBackground = await focused.evaluate((el) => getComputedStyle(el).backgroundColor);
            const sibling = listItem(page).nth(2);

            await sibling.hover();

            expect(await sibling.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(focusBackground);
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

        test('closes and returns focus to the trigger when focus leaves the menu', async ({ page }) => {
            await openStates(page);
            await page.keyboard.press('End'); // focus the last item
            await page.keyboard.press('Tab'); // Tab out of the menu

            await expect(overlay(page)).toBeHidden();
            await expect(page.getByTestId('e2eAppSwitcherStates').getByRole('button')).toBeFocused();
        });

        test('opening a site flyout keeps the menu open', async ({ page }) => {
            await page.goto('/E2eAppSwitcherWithSitesStates');
            await page.getByTestId('e2eAppSwitcherWithSitesStates').getByRole('button').click();
            await expect(overlay(page)).toBeVisible();

            await page.keyboard.press('ArrowDown'); // from the search field into the list
            await page.keyboard.press('End'); // the last menu item is an other-site row
            await page.keyboard.press('ArrowRight'); // open that site's flyout

            // The flyout opened and the main popup stayed open — focus into a flyout must not close it.
            await expect(page.locator('.kbq-app-switcher-dropdown-app').first()).toBeVisible();
            await expect(overlay(page)).toBeVisible();
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
