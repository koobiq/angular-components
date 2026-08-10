import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../../e2e/utils';

test.use({ browserName: 'webkit' });

test.describe('KbqScrollbar (deprecated)', () => {
    test.describe('E2eDeprecatedScrollbarStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDeprecatedScrollbarStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eScrollbarTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eDeprecatedScrollbarStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });
    });
});
