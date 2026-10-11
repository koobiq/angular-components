import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqNavbarModule', () => {
    test.describe('E2eHorizontalNavbarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eNavbarStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eHorizontalNavbarStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eVerticalNavbarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eVerticalNavbarStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('E2eNavbarDisabledBrand', () => {
        const getBrand = (page: Page, orientation: string, brand: string) =>
            page.getByTestId('e2eNavbarDisabledBrand').getByTestId(orientation).getByTestId(brand);

        test('a disabled brand should show the default cursor', async ({ page }) => {
            await page.goto('/E2eNavbarDisabledBrand');

            for (const orientation of ['horizontal', 'vertical']) {
                await expect(getBrand(page, orientation, 'brand').getByTestId('title')).toHaveCSS('cursor', 'pointer');

                // With and without `href`: only a link with one gets the browser's own pointer.
                for (const brand of ['disabled-brand', 'disabled-link-brand']) {
                    await expect(getBrand(page, orientation, brand)).toHaveCSS('cursor', 'default');
                    await expect(getBrand(page, orientation, brand).getByTestId('title')).toHaveCSS(
                        'cursor',
                        'default'
                    );
                }
            }
        });

        test('a decorative brand should not be styled as disabled', async ({ page }) => {
            await page.goto('/E2eNavbarDisabledBrand');

            const brand = getBrand(page, 'horizontal', 'decorative-brand');

            await expect(brand).not.toHaveClass(/kbq-disabled/);
            await expect(brand.getByTestId('title')).toHaveCSS('cursor', 'pointer');
        });

        test('clicking a disabled brand should not follow its link', async ({ page }) => {
            await page.goto('/E2eNavbarDisabledBrand');

            // `force`: Playwright waits for a link with `aria-disabled` to become enabled.
            await getBrand(page, 'horizontal', 'disabled-link-brand').click({ force: true });

            await expect(page).not.toHaveURL(/#disabled-link-brand$/);
        });

        test('hovering a disabled brand should leave its logo as it is', async ({ page }) => {
            await page.goto('/E2eNavbarDisabledBrand');

            const getLogo = (orientation: string, brand: string) =>
                getBrand(page, orientation, brand).getByTestId('logo');

            await getBrand(page, 'vertical', 'brand').hover();
            await expect(getLogo('vertical', 'brand')).toHaveCSS('transform', 'matrix(1.06, 0, 0, 1.06, 0, 0)');

            await getBrand(page, 'vertical', 'disabled-brand').hover();
            await expect(getLogo('vertical', 'disabled-brand')).toHaveCSS('transform', 'none');

            await getBrand(page, 'horizontal', 'brand').hover();
            await expect(getLogo('horizontal', 'brand')).toHaveCSS('z-index', '1');

            await getBrand(page, 'horizontal', 'disabled-brand').hover();
            await expect(getLogo('horizontal', 'disabled-brand')).toHaveCSS('z-index', 'auto');
        });
    });
});
