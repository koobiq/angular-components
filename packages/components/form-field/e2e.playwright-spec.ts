import { expect, Locator, Page, test } from '@playwright/test';

test.describe('KbqFormFieldModule', () => {
    test.describe('E2eFormFieldAddons', () => {
        test.beforeEach(async ({ page }) => page.goto('/E2eFormFieldAddons'));

        test('cleaner owns pointer and keyboard clearing', async ({ page }) => {
            const input = page.getByTestId('cleanerInput');

            await input.focus();
            await input.press('Escape');
            await expect(input).toHaveValue('');

            await input.fill('Koobiq');
            await page.getByTestId('cleaner').focus();
            await page.getByTestId('cleaner').press('Space');
            await expect(input).toHaveValue('');
            await expect(input).toBeFocused();
        });

        test('password toggle owns Alt+F8', async ({ page }) => {
            const input = page.getByTestId('passwordInput');

            await expect(input).toHaveAttribute('type', 'password');
            await input.press('Alt+F8');
            await expect(input).toHaveAttribute('type', 'text');
        });

        test('stepper connects when projected dynamically', async ({ page }) => {
            const input = page.getByTestId('numberInput');

            await page.getByTestId('showStepper').click();
            await page.getByTestId('stepper').locator('.kbq-stepper-step-up').click();
            await expect(input).toHaveValue('11');
        });
    });

    test.describe('E2eFormFieldGroup', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFormFieldGroup');

        test('horizontal', async ({ page }) => {
            const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eHorizontalTarget');

            await page.goto('/E2eFormFieldGroup');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
        });

        test('vertical', async ({ page }) => {
            const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eVerticalTarget');

            await page.goto('/E2eFormFieldGroup');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('E2eFormFieldset', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFormFieldset');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('horizontal', async ({ page }) => {
            await page.goto('/E2eFormFieldset');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-light.png');
        });

        // All height tokens involved are whole CSS pixels, so at a 1x device pixel ratio the
        // form-field's height (sum of independently-rounded border/padding/line-height values) and
        // the button's height (a single token) land on the same integer and a plain boundingBox
        // comparison would pass either way. Fractional device pixel ratios force the browser to snap
        // each side's boxes to physical pixels independently, which is what actually exposes a
        // regression of the merged-border seam.
        for (const deviceScaleFactor of [1.5, 2.5]) {
            test.describe(`at ${deviceScaleFactor}x device scale`, () => {
                test.use({ deviceScaleFactor });

                test('button and form-field stay flush at the shared border seam', async ({ page }) => {
                    await page.goto('/E2eFormFieldset');
                    const locator = getComponent(page);

                    const fieldBox = (await locator.locator('.kbq-form-field__container').boundingBox())!;
                    const buttonBox = (await locator.locator('button.kbq-button').boundingBox())!;

                    expect(fieldBox.height).toBeCloseTo(buttonBox.height, 1);
                    expect(fieldBox.y).toBeCloseTo(buttonBox.y, 1);
                    expect(fieldBox.y + fieldBox.height).toBeCloseTo(buttonBox.y + buttonBox.height, 1);
                });
            });
        }
    });
});
