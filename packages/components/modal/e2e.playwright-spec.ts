import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eHasOverflowShadow } from '../../e2e/utils';

test.describe('KbqModalModule', () => {
    test.describe('E2eModalStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eModalStates');
        const getOpenButton = (page: Page) => page.getByTestId('e2eOpenModal');
        const getMultipleModalsButton = (page: Page) => page.getByTestId('e2eMultipleModals');

        test('states', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await page.goto('/E2eModalStates');
            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getOpenButton(page).click();
            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });

        test('multiple modals', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await page.goto('/E2eModalStates');
            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getMultipleModalsButton(page).click();
            await expect(component).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('overflow shadow', () => {
        test('should show footer shadow on init when body content overflows', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await page.goto('/E2eModalStates');
            await page.getByTestId('e2eOpenModal').click();
            await page.locator('.kbq-modal-container').waitFor({ state: 'visible' });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-footer'))).toBeTruthy();
        });

        test('should show header shadow after scrolling down', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await page.goto('/E2eModalStates');
            await page.getByTestId('e2eOpenModal').click();
            await page.locator('.kbq-modal-container').waitFor({ state: 'visible' });

            await page.locator('.kbq-modal-body').evaluate((el) => {
                el.scrollTop = 50;
            });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-header'))).toBeTruthy();
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await page.goto('/E2eModalStates');
            await page.getByTestId('e2eOpenModal').click();
            await page.locator('.kbq-modal-container').waitFor({ state: 'visible' });

            await page.locator('.kbq-modal-body').evaluate((el) => {
                el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2);
            });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-header'))).toBeTruthy();
            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-footer'))).toBeTruthy();
        });
    });
});
