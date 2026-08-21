import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eHasOverflowShadow } from '../../e2e/utils';

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
            // The sidepanel opens scrolled to the top with no interaction, so the open-flash is the only
            // thing that reveals the track here — no hover, no scroll.
            const track = getTrack(page);

            await expect(track).toHaveCSS('opacity', '1');
            // ...and it fades back out again after the hide delay.
            await expect(track).toHaveCSS('opacity', '0');
        });

        test('hides the native scrollbar and reveals the custom track on hover', async ({ page }) => {
            await expect(getBody(page)).toHaveClass(/kbq-scrollbar-viewport_native-scrollbar-hidden/);

            const track = getTrack(page);

            await expect(track).toBeAttached();
            // Wait out the open-flash so hover is tested in isolation.
            await expect(track).toHaveCSS('opacity', '0');

            // `force: true` skips the actionability "stable" wait: the track's own scroll-position
            // `requestAnimationFrame` loop repaints every frame, which webkit intermittently reports as the
            // body never settling. The reveal only needs the pointer over the viewport, so force is safe here.
            await getBody(page).hover({ force: true });
            await expect(track).toHaveCSS('opacity', '1');
        });

        test('renders the custom scrollbar', async ({ page }) => {
            const track = getTrack(page);

            // Hover keeps the hover track revealed (opacity 1) deterministically for the screenshot; `force`
            // skips the actionability "stable" wait that webkit flakes on under the track's rAF repaints. Only
            // the light theme is captured — the scrollbar's own suite covers dark, so it's redundant here.
            await getBody(page).hover({ force: true });
            await expect(track).toHaveCSS('opacity', '1');
            await expect(getBody(page)).toHaveScreenshot('05-light.png');
        });
    });
});
