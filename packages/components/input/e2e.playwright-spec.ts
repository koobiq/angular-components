import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqInputModule', () => {
    test.describe('E2eInputStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eInputStateAndStyle');

        test.describe('KbqInput', () => {
            const getTestTable = (locator: Locator) => locator.getByTestId('e2eInputTable');

            test('states', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);
                const screenshotTarget = getTestTable(locator);

                await expect(screenshotTarget).toHaveScreenshot('01-light.png');
                await e2eEnableDarkTheme(page);
                await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
            });
        });

        test.describe('KbqInputPassword', () => {
            const getTestTable = (locator: Locator) => locator.getByTestId('e2eInputPasswordTable');
            const getInputPasswordTestRow = (locator: Locator) => locator.getByTestId('e2eInputPasswordWithHints');

            test('states', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);
                const screenshotTarget = getTestTable(locator);

                await expect(screenshotTarget).toHaveScreenshot('02-light.png');
                await e2eEnableDarkTheme(page);
                await expect(screenshotTarget).toHaveScreenshot('02-dark.png');
            });

            test('hints', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);
                const screenshotTarget = getInputPasswordTestRow(locator);

                await expect(screenshotTarget).toHaveScreenshot('03-light.png');
                await e2eEnableDarkTheme(page);
                await expect(screenshotTarget).toHaveScreenshot('03-dark.png');
            });

            test('text visible', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);
                const screenshotTarget = getInputPasswordTestRow(locator);
                const toggle = screenshotTarget.locator('kbq-password-toggle');

                await toggle.click();

                await expect(screenshotTarget).toHaveScreenshot('04-light.png');
            });

            test('hints on blur', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);
                const screenshotTarget = getInputPasswordTestRow(locator);
                const inputPassword = screenshotTarget.locator('input');

                await inputPassword.focus();
                await inputPassword.blur();

                await expect(screenshotTarget).toHaveScreenshot('05-light.png');
                await e2eEnableDarkTheme(page);
                await expect(screenshotTarget).toHaveScreenshot('05-dark.png');
            });
        });
    });
});
