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

    test.describe('search and pointer interaction', () => {
        const overlay = (page: Page) => page.locator('.kbq-app-switcher__panel');
        const listItem = (page: Page) => overlay(page).locator('.kbq-app-switcher-list-item');

        const openWithSites = async (page: Page) => {
            await page.goto('/E2eAppSwitcherWithSitesStates');
            await page.getByTestId('e2eAppSwitcherWithSitesStates').getByRole('button').click();
            await expect(overlay(page)).toBeVisible();
        };

        test('typing a query narrows the list to the matching apps', async ({ page }) => {
            await openWithSites(page);

            await page.keyboard.type('phantom');
            await expect(listItem(page).first()).toBeVisible();

            const texts = await listItem(page).allTextContents();

            expect(texts.length).toBeGreaterThan(0);

            for (const text of texts) {
                expect(text.toLowerCase()).toContain('phantom');
            }
        });

        test('a query with no match shows an announced empty state', async ({ page }) => {
            await openWithSites(page);

            await page.keyboard.type('no-such-application');

            const empty = overlay(page).locator('.kbq-app-switcher__empty-search-result');

            await expect(empty).toBeVisible();
            await expect(empty).toHaveAttribute('role', 'status');
            await expect(listItem(page)).toHaveCount(0);
        });

        test('the clear button restores the full list and is named for assistive technology', async ({ page }) => {
            await openWithSites(page);
            const before = await listItem(page).count();

            await page.keyboard.type('phantom');
            expect(await listItem(page).count()).toBeLessThan(before);

            const cleaner = overlay(page).locator('kbq-cleaner');

            await expect(cleaner).toHaveAttribute('aria-label', /.+/);
            await cleaner.click();

            await expect(listItem(page)).toHaveCount(before);
        });

        test('clicking a group header collapses and expands its aliases', async ({ page }) => {
            await openWithSites(page);
            const header = overlay(page).locator('.kbq-app-switcher-list-item[aria-expanded]').first();
            const expanded = await listItem(page).count();

            await header.click();
            await expect(header).toHaveAttribute('aria-expanded', 'false');
            expect(await listItem(page).count()).toBeLessThan(expanded);

            await header.click();
            await expect(header).toHaveAttribute('aria-expanded', 'true');
            await expect(listItem(page)).toHaveCount(expanded);
        });

        test('the search field is named even though it only shows a placeholder', async ({ page }) => {
            await openWithSites(page);

            await expect(overlay(page).locator('input[kbqinput]')).toHaveAttribute('aria-label', /.+/);
        });
    });

    test.describe('reduced motion', () => {
        test('the switcher opens and stays usable with reduced motion requested', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.goto('/E2eAppSwitcherStates');
            await page.getByTestId('e2eAppSwitcherStates').getByRole('button').click();

            const overlayPanel = page.locator('.kbq-app-switcher__panel');

            await expect(overlayPanel).toBeVisible();
            await expect(overlayPanel.locator('.kbq-app-switcher-list-item').first()).toBeVisible();
        });
    });
});
