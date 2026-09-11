import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eExpectNoScrollbarAfterFlash, e2eWaitForSettledScrollbars } from 'packages/e2e/utils';

test.describe('KbqTabsModule', () => {
    test.describe('E2eTabsStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTabsStates');
        const getTabsUnderlined = (page: Page) => page.getByTestId('e2eTabsUnderlined');

        test('states', async ({ page }) => {
            await page.goto('/E2eTabsStates');

            const component = getComponent(page);

            // Flaky test workaround: click to underlined tab to ensure proper bottom outline rendering
            await getTabsUnderlined(page).locator('.kbq-tab-label_underlined').nth(0).click();

            // Only the vertical headers build a track; the horizontal ones run in `hidden` mode.
            await e2eWaitForSettledScrollbars(component, 4);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTabsScrollbarFlash', () => {
        const getTrack = (page: Page, testId: string) =>
            page.getByTestId(testId).locator('.kbq-tab-header__scroll-container > kbq-scrollbar-track');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eTabsScrollbarFlash');
        });

        test('reveals the scrollbar once the strip is rendered, without the pointer going near it', async ({
            page
        }) => {
            const track = getTrack(page, 'e2eTabsFlashOverflowing');

            await expect(track).toHaveClass(/kbq-scrollbar-track_revealed/);
            await expect(track.locator('.kbq-scrollbar-track__bar')).not.toHaveCount(0);
        });

        test('reveals nothing for a strip whose tabs fit', async ({ page }) => {
            // Waited on first: the track reports no bars for its first frame plus one throttle window
            // whatever the content is, so asserting the empty track before any tick has run would pass
            // on the pre-computation window rather than on the behaviour. The overflowing strip shares
            // this page's frame loop, so its bars appearing prove a tick has been through.
            await expect(
                getTrack(page, 'e2eTabsFlashOverflowing').locator('.kbq-scrollbar-track__bar')
            ).not.toHaveCount(0);

            await e2eExpectNoScrollbarAfterFlash(
                page.getByTestId('e2eTabsFlashFitting').locator('.kbq-tab-header__scroll-container')
            );
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
