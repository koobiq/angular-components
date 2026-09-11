import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWaitForSettledScrollbars } from '../../e2e/utils';

test.describe('KbqTopBarModule', () => {
    test.describe('E2eTopBarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTopBarStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTopBarStates');

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTopBarSticky', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTopBarSticky');
        const getScroller = (page: Page) => page.getByTestId('e2eTopBarStickyScroller');
        const getDropdownTrigger = (page: Page) => page.getByTestId('e2eTopBarStickyDropdownTrigger');

        test('should keep the bar at the top of a scrolled container', async ({ page }) => {
            await page.goto('/E2eTopBarSticky');

            await getScroller(page).evaluate((element) => element.scrollTo({ top: 200 }));
            // The shot is of the bar staying put while the rows move under it, so the scroll offset is
            // part of the state being captured rather than a step on the way to it.
            await expect(getScroller(page)).toHaveJSProperty('scrollTop', 200);

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('02-dark.png');
        });

        test('should paint a dropdown opened from the bar above it', async ({ page }) => {
            await page.goto('/E2eTopBarSticky');

            await getDropdownTrigger(page).click();
            await expect(page.locator('.cdk-overlay-pane')).toHaveCount(1);

            // The dropdown flashes its track on open and this shot lands inside that window. Measured on
            // this route the track is revealed with no bar and no thumb — three items do not overflow the
            // panel — so crossing the window is pixel-identical today. The wait is what keeps that true: a
            // fourth item would give the revealed track a thumb to paint, and the shot would start landing
            // on whichever side of `hideDelay` the machine was on. Page-scoped, since the panel is in an
            // overlay at body level rather than under the screenshot target.
            await e2eWaitForSettledScrollbars(page, 1);

            await expect(getComponent(page)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('03-dark.png');
        });
    });
});
