import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

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

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('02-dark.png');
        });

        test('should paint a dropdown opened from the bar above it', async ({ page }) => {
            await page.goto('/E2eTopBarSticky');

            await getDropdownTrigger(page).click();
            await expect(page.locator('.cdk-overlay-pane')).toHaveCount(1);

            await expect(getComponent(page)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('03-dark.png');
        });
    });
});
