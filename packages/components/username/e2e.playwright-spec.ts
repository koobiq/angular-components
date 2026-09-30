import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqUsername', () => {
    test.describe('E2eUsernameStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eUsernameStateAndStyle');
        const screenshotTarget = (locator: Locator) => locator.getByTestId('e2eUsernameTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eUsernameStateAndStyle');
            const locator = getComponent(page);

            await expect(screenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eUsernameInProse', () => {
        // The modes differ only inside running text: `inline` is a flex container and takes the whole
        // line, `text` flows with the sentence. Neither is clipped, which is why `text` gets no title.
        test('modes inside a sentence', async ({ page }) => {
            await page.goto('/E2eUsernameInProse');
            const target = page.getByTestId('e2eUsernameInProse').getByTestId('e2eUsernameProse');

            await expect(target).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('02-dark.png');
        });
    });
});
