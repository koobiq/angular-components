import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqInputModule', () => {
    test.fixme('E2eInputStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eInputStateAndStyle');

        test.describe('KbqInput', () => {
            const getTestTable = (locator: Locator) => locator.getByTestId('e2eInputTable');

            test('states', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);

                const screenshotTarget = getTestTable(locator);

                await expect(screenshotTarget).toHaveScreenshot();
            });

            test(`states (dark theme)`, async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                await e2eEnableDarkTheme(page);

                const locator = getComponent(page);

                const screenshotTarget = getTestTable(locator);

                await expect(screenshotTarget).toHaveScreenshot();
            });
        });

        test.describe('KbqInputPassword', () => {
            const getTestTable = (locator: Locator) => locator.getByTestId('e2eInputPasswordTable');
            const getInputPasswordTestRow = (locator: Locator) => locator.getByTestId('e2eInputPasswordWithHints');

            test('states', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);

                const screenshotTarget = getTestTable(locator);

                await expect(screenshotTarget).toHaveScreenshot();
            });

            test(`states (dark theme)`, async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                await e2eEnableDarkTheme(page);

                const locator = getComponent(page);

                const screenshotTarget = getTestTable(locator);

                await expect(screenshotTarget).toHaveScreenshot();
            });

            test('default hints', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);

                const screenshotTarget = getInputPasswordTestRow(locator);

                await expect(screenshotTarget).toHaveScreenshot();
            });

            test('text visibile', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);

                const screenshotTarget = getInputPasswordTestRow(locator);

                const toggle = screenshotTarget.locator('kbq-password-toggle');

                await toggle.click();

                await expect(screenshotTarget).toHaveScreenshot();
            });

            test('default hints (dark theme)', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                await e2eEnableDarkTheme(page);

                const locator = getComponent(page);

                const screenshotTarget = getInputPasswordTestRow(locator);

                await expect(screenshotTarget).toHaveScreenshot();
            });

            test('hints on blur', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);

                const screenshotTarget = getInputPasswordTestRow(locator);

                const inputPassword = screenshotTarget.locator('input');

                await inputPassword.focus();
                await inputPassword.blur();

                await expect(screenshotTarget).toHaveScreenshot();
            });

            test('hints on blur (dark theme)', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                await e2eEnableDarkTheme(page);

                const locator = getComponent(page);

                const screenshotTarget = getInputPasswordTestRow(locator);

                const inputPassword = screenshotTarget.locator('input');

                await inputPassword.focus();
                await inputPassword.blur();

                await expect(screenshotTarget).toHaveScreenshot();
            });
        });
    });
});
