import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

const prefix = 'e2e-sidepanel';

test.describe('KbqSidepanel', () => {
    test.describe('E2eSidepanelStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSidepanelStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eSidepanelTable');
        const getSidepanelContainer = (page: Page) => page.locator('.kbq-sidepanel-container');
        const clickButton = (locator: Locator, id: string) => locator.getByTestId(`${prefix}-${id}`).click();
        const testSidepanelType = async (
            page: Page,
            { type, expected }: { type: string; expected: [string, string] }
        ) => {
            const [name, value] = expected;

            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await clickButton(screenshotTarget, type);

            const sidepanelContainer = getSidepanelContainer(page);

            await expect(sidepanelContainer).toHaveCSS(name, value);
            await expect(sidepanelContainer).toBeVisible();
            await expect(sidepanelContainer).toHaveScreenshot();
        };

        test.describe('sizes', () => {
            const sizeTests: { type: string; expected: [string, string] }[] = [
                { type: 'small', expected: ['width', '400px'] },
                { type: 'medium', expected: ['width', '640px'] },
                { type: 'large', expected: ['width', '960px'] }
            ];

            for (const { type, expected } of sizeTests) {
                test(type, async ({ page }) => {
                    await e2eGoToRootPage(page);
                    await testSidepanelType(page, { type, expected });
                });
            }
        });

        test.describe('positions', () => {
            const tests: { type: string; expected: [string, string] }[] = [
                { type: 'left', expected: ['left', '0px'] },
                { type: 'right', expected: ['right', '0px'] },
                { type: 'top', expected: ['top', '0px'] },
                { type: 'bottom', expected: ['bottom', '0px'] }
            ];

            for (const { type, expected } of tests) {
                test(type, async ({ page }) => {
                    await e2eGoToRootPage(page);
                    await testSidepanelType(page, { type, expected });
                });
            }
        });

        test('nested', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await clickButton(screenshotTarget, 'nested');

            const sidepanelContainer = page.locator('.kbq-sidepanel_nested');

            await expect(sidepanelContainer).toBeVisible();
            await expect(sidepanelContainer).toHaveScreenshot();
        });

        test('nested (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await clickButton(screenshotTarget, 'nested');

            const sidepanelContainer = page.locator('.kbq-sidepanel_nested');

            await expect(sidepanelContainer).toBeVisible();
            await expect(sidepanelContainer).toHaveScreenshot();
        });

        test('(dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await clickButton(screenshotTarget, 'small');

            const sidepanelContainer = getSidepanelContainer(page);

            await expect(sidepanelContainer).toBeVisible();
            await expect(sidepanelContainer).toHaveScreenshot();
        });
    });
});
