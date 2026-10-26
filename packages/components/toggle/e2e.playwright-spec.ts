import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqToggleModule', () => {
    const getScreenshotTarget = (locator: Locator): Locator => locator.getByTestId('e2eScreenshotTarget');
    const getIndeterminateToggle = (locator: Locator): Locator => locator.getByTestId('e2eIndeterminateToggle');
    const getBigToggle = (locator: Locator): Locator => locator.getByTestId('e2eBigToggle');

    test.describe('E2eToggleStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleStateAndStyle');
        const getFirstToggle = (locator: Locator): Locator => locator.locator('kbq-toggle').first();

        test('states', async ({ page }) => {
            await page.goto('/E2eToggleStateAndStyle');

            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('01-dark.png');
        });

        test('should have correct size', async ({ page }) => {
            await page.goto('/E2eToggleStateAndStyle');

            const component = getComponent(page);
            // The switch itself, not the host: the host is as tall as one line of text, so that a
            // toggle occupies the same box as a checkbox or a radio button.
            const bar = getFirstToggle(component).locator('.kbq-toggle-bar');

            await expect(bar).toHaveCSS('width', '28px');
            await expect(bar).toHaveCSS('height', '16px');

            await getBigToggle(component).click();

            await expect(getFirstToggle(component)).toHaveClass(/kbq-toggle_big/);

            await expect(bar).toHaveCSS('width', '28px');
            await expect(bar).toHaveCSS('height', '16px');
        });

        test('should expose the loading state to assistive technology', async ({ page }) => {
            await page.goto('/E2eToggleStateAndStyle');

            const input = getComponent(page).getByTestId('e2eToggle-theme-loading-default').locator('input');

            await expect(input).toHaveAttribute('aria-busy', 'true');
            await expect(input).toHaveAttribute('aria-disabled', 'true');
            await expect(input).toBeDisabled();
        });

        test('should not animate when reduced motion is preferred', async ({ page }) => {
            await page.goto('/E2eToggleStateAndStyle');

            const toggle = getComponent(page).getByTestId('e2eToggle-theme-normal-default');

            await expect(toggle.locator('.kbq-toggle-bar')).toHaveCSS('transition-duration', '0s');
            await expect(toggle.locator('.kbq-toggle__thumb')).toHaveCSS('transition-duration', '0s');
        });

        test('indeterminate', async ({ page }) => {
            await page.goto('/E2eToggleStateAndStyle');

            const component = getComponent(page);

            await getIndeterminateToggle(component).click();
            await expect(getScreenshotTarget(component)).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('E2eToggleWithTextAndCaption', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleWithTextAndCaption');

        test('states', async ({ page }) => {
            await page.goto('/E2eToggleWithTextAndCaption');

            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('03-dark.png');
        });

        test('big', async ({ page }) => {
            await page.goto('/E2eToggleWithTextAndCaption');

            const component = getComponent(page);

            await getBigToggle(component).click();
            await expect(getScreenshotTarget(component)).toHaveScreenshot('04-light.png');
        });
    });

    test.describe('E2eToggleValidation', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleValidation');

        test('states', async ({ page }) => {
            await page.goto('/E2eToggleValidation');

            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('05-validation-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('05-validation-dark.png');
        });

        test('should take the same space in the error state without kbq-error', async ({ page }) => {
            await page.goto('/E2eToggleValidation');

            const component = getComponent(page);

            for (const variant of ['WithLabel', 'WithoutLabel']) {
                const invalid = component.getByTestId(`e2eToggleInvalid${variant}`);

                await expect(invalid).toHaveClass(/kbq-invalid/);

                const validBox = await component.getByTestId(`e2eToggleValid${variant}`).boundingBox();
                const invalidBox = await invalid.boundingBox();

                expect({ width: invalidBox?.width, height: invalidBox?.height }).toEqual({
                    width: validBox?.width,
                    height: validBox?.height
                });
            }
        });
    });

    test.describe('E2eToggleHeight', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleHeight');

        // The component is measured alongside its wrapper: collapsed to zero height it would still
        // leave the wrapper at the line height inherited from the page and hide the defect.
        const getTargets = (locator: Locator): Locator[] =>
            ['e2eToggleWithoutLabel', 'e2eToggleWithLabel']
                .map((testId) => locator.getByTestId(testId))
                .flatMap((wrapper) => [wrapper, wrapper.locator('kbq-toggle')]);

        test('should take one line of text in both sizes, with and without a label', async ({ page }) => {
            await page.goto('/E2eToggleHeight');

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
