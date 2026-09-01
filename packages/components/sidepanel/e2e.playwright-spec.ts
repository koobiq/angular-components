import { expect, Locator, Page, test } from '@playwright/test';
import {
    e2eDisableResizeObserver,
    e2eEnableDarkTheme,
    e2eExpectNoScrollbarAfterFlash,
    e2eHasOverflowShadow,
    e2eWaitForSettledScrollbars
} from '../../e2e/utils';

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
            // The body flashes its scrollbar track on open, and `toBeVisible` says nothing about it.
            await e2eWaitForSettledScrollbars(page);

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
            await e2eWaitForSettledScrollbars(page);
            await expect(sidepanelContainer).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(sidepanelContainer).toHaveScreenshot('04-dark.png');
        });
    });

    test.describe('overflow shadow', () => {
        test('should show footer shadow on init when body content overflows', async ({ page }) => {
            await page.setViewportSize({ width: 640, height: 300 });
            await page.goto('/E2eSidepanelStateAndStyle');
            await page.getByTestId('e2eSidepanelMedium').click();
            await expect(page.locator('.kbq-sidepanel-container')).toBeVisible();

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-sidepanel-footer'))).toBeTruthy();
        });

        test('should show header shadow after scrolling to bottom', async ({ page }) => {
            await page.setViewportSize({ width: 640, height: 300 });
            await page.goto('/E2eSidepanelStateAndStyle');
            await page.getByTestId('e2eSidepanelMedium').click();
            await expect(page.locator('.kbq-sidepanel-container')).toBeVisible();

            await page.locator('.kbq-sidepanel-body').evaluate((el) => {
                el.scrollTop = el.scrollHeight;
            });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-sidepanel-header'))).toBeTruthy();
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await page.setViewportSize({ width: 640, height: 300 });
            await page.goto('/E2eSidepanelStateAndStyle');
            await page.getByTestId('e2eSidepanelMedium').click();
            await expect(page.locator('.kbq-sidepanel-container')).toBeVisible();

            await page.locator('.kbq-sidepanel-body').evaluate((el) => {
                el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2);
            });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-sidepanel-header'))).toBeTruthy();
            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-sidepanel-footer'))).toBeTruthy();
        });
    });

    test.describe('E2eSidepanelScrollbar', () => {
        const getBody = (page: Page) => page.locator('.kbq-sidepanel-body');
        const getTrack = (page: Page) => getBody(page).locator('kbq-scrollbar-track');

        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 640, height: 300 });
            await page.goto('/E2eSidepanelStateAndStyle');
            await page.getByTestId('e2eSidepanelMedium').click();
            await getBody(page).waitFor({ state: 'visible' });
        });

        test('flashes the track on open, then fades it', async ({ page }) => {
            const track = getTrack(page);

            await expect(track).toHaveCSS('opacity', '1');
            await expect(track).toHaveCSS('opacity', '0');
        });

        test('hides the native scrollbar and reveals the custom track on hover', async ({ page }) => {
            await expect(getBody(page)).toHaveClass(/kbq-scrollbar-viewport_native-scrollbar-hidden/);

            const track = getTrack(page);

            await expect(track).toBeAttached();
            await expect(track).toHaveCSS('opacity', '0');

            // WebKit can report the continuously repainted track as unstable.
            await getBody(page).hover({ force: true });
            await expect(track).toHaveCSS('opacity', '1');
        });

        test('renders the custom scrollbar', async ({ page }) => {
            const track = getTrack(page);

            await getBody(page).hover({ force: true });
            await expect(track).toHaveCSS('opacity', '1');
            await expect(getBody(page)).toHaveScreenshot('05-light.png');
        });
    });

    test.describe('E2eSidepanelScrollbarNoOverflow', () => {
        test('shows no scrollbar after the sidepanel opens', async ({ page }) => {
            await e2eDisableResizeObserver(page);
            await page.goto('/E2eSidepanelScrollbarNoOverflow');
            await page.getByTestId('e2eOpenSidepanel').click();

            await e2eExpectNoScrollbarAfterFlash(page.locator('.kbq-sidepanel-body'));
        });
    });
});
