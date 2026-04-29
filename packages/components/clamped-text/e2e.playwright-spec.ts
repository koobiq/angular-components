import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqClampedText', () => {
    test.describe('E2eClampedTextStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eClampedTextStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eClampedTextTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eClampedTextStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eClampedTextStates', () => {
        const collapsedClass = /(?:^|\s)kbq-clamped-text__content_collapsed(?:\s|$)/;
        const content = (block: Locator) => block.locator('.kbq-clamped-text__content');
        const toggle = (block: Locator) => block.locator('.kbq-clamped-text__toggle');

        test('should collapse by default when rows exceed maxRows', async ({ page }) => {
            await page.goto('/E2eClampedTextStates');
            const block = page.getByTestId('auto_collapsed');

            await expect(toggle(block)).toBeVisible();
            await expect(content(block)).toHaveClass(collapsedClass);
        });

        test('should preserve expanded state when container widens', async ({ page }) => {
            await page.goto('/E2eClampedTextStates');
            const block = page.getByTestId('resize_persistence');

            await expect(content(block)).toHaveClass(collapsedClass);

            await toggle(block).click();
            await expect(content(block)).not.toHaveClass(collapsedClass);

            await page.getByTestId('resize_persistence_widen').click();
            await expect(content(block)).not.toHaveClass(collapsedClass);
        });
    });
});
