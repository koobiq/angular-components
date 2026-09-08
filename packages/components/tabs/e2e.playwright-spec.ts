import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWaitForSettledScrollPositions } from 'packages/e2e/utils';

/** Scrollport of every paginated tab header on the route — the thing that scrolls itself into position. */
const TAB_SCROLLPORT_SELECTOR = '.kbq-tab-header__scroll-container';

test.describe('KbqTabsModule', () => {
    test.describe('E2eTabsStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTabsStates');
        const getTabsUnderlined = (page: Page) => page.getByTestId('e2eTabsUnderlined');

        test('states', async ({ page }) => {
            await page.goto('/E2eTabsStates');

            const component = getComponent(page);

            // Flaky test workaround: click to underlined tab to ensure proper bottom outline rendering
            await getTabsUnderlined(page).locator('.kbq-tab-label_underlined').nth(0).click();

            // The groups whose selected tab starts off-screen scroll it into view on their own, and
            // the click above queues another correction. Only the light shot needs the wait — the
            // theme swap that follows repaints without touching any scroll position.
            await e2eWaitForSettledScrollPositions(page, TAB_SCROLLPORT_SELECTOR);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTabNavBar', () => {
        test('should make disabled links unclickable', async ({ page }) => {
            await page.goto('/E2eTabNavBar');

            const enabledLink = page.getByTestId('tabNavBar_default').locator('a');
            const disabledLink = page.getByTestId('tabNavBar_disabled').locator('a');

            await expect(enabledLink).not.toHaveCSS('pointer-events', 'none');
            await expect(disabledLink).toHaveCSS('pointer-events', 'none');
        });
    });
});
