import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqIconModule', () => {
    test.describe('E2eIconStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eIconStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eIconTable');
        const getTokenOverrideTable = (locator: Locator) => locator.getByTestId('e2eIconTokenOverrideTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eIconStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });

        test('takes the icon color tokens from an ancestor', async ({ page }) => {
            await page.goto('/E2eIconStateAndStyle');
            const screenshotTarget = getTokenOverrideTable(getComponent(page));

            await expect(screenshotTarget).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('03-dark.png');
        });
    });

    test.describe('E2eIconSvg', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eIconSvg');

        test('svg icons', async ({ page }) => {
            await page.goto('/E2eIconSvg');
            const component = getComponent(page);

            await expect(component).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('E2eIconSvgDropdown', () => {
        test('svg icons in a dropdown panel', async ({ page }) => {
            await page.goto('/E2eIconSvgDropdown');
            await page.getByTestId('e2eIconSvgDropdownTrigger').click();

            const pane = page.locator('.cdk-overlay-pane');

            // The panel is attached asynchronously; the pane is the screenshot target because the
            // fixture host does not contain the overlay and its geometry was what made the original
            // assertion unstable.
            await expect(pane).toHaveCount(1);

            await expect(pane).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(pane).toHaveScreenshot('04-dark.png');
        });
    });
});
