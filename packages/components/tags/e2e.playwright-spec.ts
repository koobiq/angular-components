import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqTagModule', () => {
    test.describe('E2eTagStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagStateAndStyle');
        const getScreenshotTarget = (locator: Locator): Locator => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await e2eGoToRootPage(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });

        test('states (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });
    });

    test.describe('E2eTagEditable', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagEditable');
        const getLastTag = (locator: Locator): Locator => locator.locator('kbq-tag').last();

        test('editable', async ({ page }) => {
            await e2eGoToRootPage(page);

            const component = getComponent(page);

            await getLastTag(component).dblclick();

            await expect(component).toHaveScreenshot();
        });

        test('editable (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const component = getComponent(page);

            await getLastTag(component).dblclick();

            await expect(component).toHaveScreenshot();
        });
    });
});
