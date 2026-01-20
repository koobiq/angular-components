import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.use({ browserName: 'webkit' });

test.describe('KbqSidepanel', () => {
    test.describe('E2eSidepanelStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSidepanelStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eSidepanelTable');
        const getSidepanelContainer = (page: Page) => page.locator('.kbq-sidepanel-container').first();
        const clickButton = (locator: Locator, id: string) => locator.getByTestId(id).click();
        const testSidepanelType = async (page: Page, type: string, screenshotName: string) => {
            await clickButton(getTestTable(getComponent(page)), type);
            await expect(getSidepanelContainer(page)).toBeVisible();

            return expect(page).toHaveScreenshot(screenshotName);
        };

        test.describe('sizes', () => {
            test('medium', async ({ page }) => {
                await page.setViewportSize({ width: 640, height: 300 });
                await page.goto('/E2eSidepanelStateAndStyle');
                await testSidepanelType(page, 'e2eSidepanelMedium', '01-light.png');
            });

            test('large', async ({ page }) => {
                await page.setViewportSize({ width: 960, height: 300 });
                await page.goto('/E2eSidepanelStateAndStyle');
                await testSidepanelType(page, 'e2eSidepanelLarge', '02-light.png');
            });
        });

        test.describe('positions', () => {
            test('right-left', async ({ page }) => {
                await page.setViewportSize({ width: 805, height: 400 });
                await page.goto('/E2eSidepanelStateAndStyle');
                await testSidepanelType(page, 'e2eSidepanelRightLeft', '03-light.png');
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
            await expect(sidepanelContainer).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(sidepanelContainer).toHaveScreenshot('04-dark.png');
        });
    });
});
