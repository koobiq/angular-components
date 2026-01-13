import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.use({ browserName: 'webkit' });

test.describe('KbqSidepanel', () => {
    test.describe('E2eSidepanelStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSidepanelStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eSidepanelTable');
        const getSidepanelContainer = (page: Page) => page.locator('.kbq-sidepanel-container').first();
        const clickButton = (locator: Locator, id: string) => locator.getByTestId(id).click();
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
                await page.setViewportSize({ width: 640, height: 300 });
                await page.goto('/E2eSidepanelStateAndStyle');
                await testSidepanelType(page, 'e2eSidepanelMedium');
            });

            test('large', async ({ page }) => {
                await page.setViewportSize({ width: 960, height: 300 });
                await page.goto('/E2eSidepanelStateAndStyle');
                await testSidepanelType(page, 'e2eSidepanelLarge');
            });
        });

        test.describe('positions', () => {
            test('right-left', async ({ page }) => {
                await page.setViewportSize({ width: 805, height: 400 });
                await page.goto('/E2eSidepanelStateAndStyle');
                await testSidepanelType(page, 'e2eSidepanelRightLeft');
            });
        });

        test('nested', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 300 });
            await page.goto('/E2eSidepanelStateAndStyle');
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await clickButton(screenshotTarget, 'e2eSidepanelNested');

            const sidepanelContainer = page.locator('.kbq-sidepanel_nested');

            await expect(sidepanelContainer).toBeVisible();
            await expect(sidepanelContainer).toHaveScreenshot();
        });

        test('nested (dark theme)', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 300 });
            await page.goto('/E2eSidepanelStateAndStyle');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await clickButton(screenshotTarget, 'e2eSidepanelNested');

            const sidepanelContainer = page.locator('.kbq-sidepanel_nested');

            await expect(sidepanelContainer).toBeVisible();
            await expect(sidepanelContainer).toHaveScreenshot();
        });
    });
});
