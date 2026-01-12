import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqModalModule', () => {
    test.describe('E2eModalStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eModalStates');
        const getOpenButton = (page: Page) => page.getByTestId('e2eOpenModal');
        const getMultipleModalsButton = (page: Page) => page.getByTestId('e2eMultipleModals');

        test('light theme', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await e2eGoToRootPage(page);

            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getOpenButton(page).click();
            await expect(component).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getOpenButton(page).click();
            await expect(component).toHaveScreenshot();
        });

        test('open multiple modals', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await e2eGoToRootPage(page);

            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getMultipleModalsButton(page).click();
            await expect(component).toHaveScreenshot();
        });
    });
});
