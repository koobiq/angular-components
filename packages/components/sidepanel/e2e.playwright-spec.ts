import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

const prefix = 'e2e-sidepanel';

test.describe('KbqSidepanel', () => {
    test.describe('E2eSidepanelStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSidepanelStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eSidepanelTable');
        const getSidepanelContainer = (page: Page) => page.locator('.kbq-sidepanel-container').first();
        const clickButton = (locator: Locator, id: string) => locator.getByTestId(`${prefix}-${id}`).click();
        const testSidepanelType = async (page: Page, type: string) => {
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await clickButton(screenshotTarget, type);

            const sidepanelContainer = getSidepanelContainer(page);

            await expect(sidepanelContainer).toBeVisible();
            await expect(page).toHaveScreenshot();
        };

        test.describe('sizes', () => {
            test('medium', async ({ page }) => {
                await page.setViewportSize({ width: 700, height: 300 });
                await e2eGoToRootPage(page);
                await testSidepanelType(page, 'medium');
            });

            test('large', async ({ page }) => {
                await page.setViewportSize({ width: 1000, height: 300 });
                await e2eGoToRootPage(page);
                await testSidepanelType(page, 'large');
            });
        });

        test.describe('positions', () => {
            test('right-left', async ({ page }) => {
                await page.setViewportSize({ width: 850, height: 400 });
                await e2eGoToRootPage(page);
                await testSidepanelType(page, 'right-left');
            });

            test('top-bottom', async ({ page }) => {
                await page.setViewportSize({ width: 400, height: 500 });
                await e2eGoToRootPage(page);
                await testSidepanelType(page, 'top-bottom');
            });
        });

        test('nested', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 300 });
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await clickButton(screenshotTarget, 'nested');

            const sidepanelContainer = page.locator('.kbq-sidepanel_nested');

            await expect(sidepanelContainer).toBeVisible();
            await expect(sidepanelContainer).toHaveScreenshot();
        });

        test('nested (dark theme)', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 300 });
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await clickButton(screenshotTarget, 'nested');

            const sidepanelContainer = page.locator('.kbq-sidepanel_nested');

            await expect(sidepanelContainer).toBeVisible();
            await expect(sidepanelContainer).toHaveScreenshot();
        });
    });
});
