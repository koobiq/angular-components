import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqRadioModule', () => {
    test.describe('E2eRadioStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eRadioStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eRadioTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eRadioStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eRadioHeight', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eRadioHeight');
        const getBigToggle = (locator: Locator): Locator => locator.getByTestId('e2eBigToggle');

        // The component is measured alongside its wrapper: collapsed to zero height it would still
        // leave the wrapper at the line height inherited from the page and hide the defect.
        const getTargets = (locator: Locator): Locator[] =>
            ['e2eRadioWithoutLabel', 'e2eRadioWithLabel']
                .map((testId) => locator.getByTestId(testId))
                .flatMap((wrapper) => [wrapper, wrapper.locator('kbq-radio-button')]);

        test('should take the same height with and without label', async ({ page }) => {
            await page.goto('/E2eRadioHeight');

            const component = getComponent(page);

            for (const target of getTargets(component)) {
                await expect(target).toHaveCSS('height', '20px');
            }

            await getBigToggle(component).click();

            for (const target of getTargets(component)) {
                await expect(target).toHaveCSS('height', '24px');
            }
        });
    });
});
