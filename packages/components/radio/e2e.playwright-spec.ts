import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqRadioModule', () => {
    test.describe('E2eRadioStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eRadioStateAndStyle');

        test('states', async ({ page }) => {
            await page.goto('/E2eRadioStateAndStyle');
            const screenshotTarget = getComponent(page).getByTestId('e2eScreenshotTarget');

            await expect(screenshotTarget).toHaveScreenshot('01-states-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-states-dark.png');
        });
    });

    test.describe('E2eRadioWithLabel', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eRadioWithLabel');

        test('states', async ({ page }) => {
            await page.goto('/E2eRadioWithLabel');

            const screenshotTarget = getComponent(page).getByTestId('e2eScreenshotTarget');

            await expect(screenshotTarget).toHaveScreenshot('02-label-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('02-label-dark.png');
        });
    });

    test.describe('E2eRadioWithHint', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eRadioWithHint');

        test('states', async ({ page }) => {
            await page.goto('/E2eRadioWithHint');

            const screenshotTarget = getComponent(page).getByTestId('e2eScreenshotTarget');

            await expect(screenshotTarget).toHaveScreenshot('03-hint-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('03-hint-dark.png');
        });
    });

    test.describe('E2eRadioValidation', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eRadioValidation');

        test('states', async ({ page }) => {
            await page.goto('/E2eRadioValidation');

            const screenshotTarget = getComponent(page).getByTestId('e2eScreenshotTarget');

            await expect(screenshotTarget).toHaveScreenshot('04-validation-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('04-validation-dark.png');
        });

        test('should take the same space in the error state without kbq-error', async ({ page }) => {
            await page.goto('/E2eRadioValidation');

            const component = getComponent(page);
            const invalid = component.getByTestId('e2eRadioInvalid');

            await expect(invalid).toHaveClass(/kbq-invalid/);

            const validBox = await component.getByTestId('e2eRadioValid').boundingBox();
            const invalidBox = await invalid.boundingBox();

            expect({ width: invalidBox?.width, height: invalidBox?.height }).toEqual({
                width: validBox?.width,
                height: validBox?.height
            });
        });
    });

    test.describe('E2eRadioHeight', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eRadioHeight');
        const getBigToggle = (locator: Locator): Locator => locator.getByTestId('e2eBigToggle');

        // The component is measured alongside its wrapper: collapsed to zero height it would still
        // leave the wrapper at the line height inherited from the page and hide the defect.
        const getTargets = (locator: Locator): Locator[] => [
            ...['e2eRadioWithoutLabel', 'e2eRadioWithLabel']
                .map((testId) => locator.getByTestId(testId))
                .flatMap((wrapper) => [wrapper, wrapper.locator('kbq-radio-button')]),
            // Nested the way real markup is: a flex item of the group, so the host is blockified.
            locator.getByTestId('e2eRadioWithoutWrapper')
        ];

        test('should take one line of text in both sizes, with and without a label', async ({ page }) => {
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
