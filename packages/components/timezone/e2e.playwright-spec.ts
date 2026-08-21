import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTimezoneModule', () => {
    test.describe('E2eTimezoneScrollbar', () => {
        const getContent = (page: Page) => page.locator('.kbq-select__content');
        const getTrack = (page: Page) => getContent(page).locator('kbq-scrollbar-track');
        const getVerticalThumb = (page: Page) =>
            getContent(page).locator('.kbq-scrollbar-track__bar_vertical .kbq-scrollbar-track__thumb');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eTimezoneScrollbar');
            await page.getByTestId('e2eTimezoneSelect').click();
            await expect(getContent(page)).toBeVisible();
        });

        test('flashes the track on open, then fades it', async ({ page }) => {
            // The panel opens without scrolling, so the open-flash is the only thing that reveals the
            // track here — no hover, no scroll.
            const track = getTrack(page);

            await expect(track).toHaveCSS('opacity', '1');
            // ...and it fades back out again after the hide delay.
            await expect(track).toHaveCSS('opacity', '0');
        });

        test('hides the native scrollbar and reveals the custom track on hover', async ({ page }) => {
            await expect(getContent(page)).toHaveClass(/kbq-scrollbar-viewport_native-scrollbar-hidden/);

            const track = getTrack(page);

            await expect(track).toBeAttached();
            // Wait out the open-flash so hover is tested in isolation.
            await expect(track).toHaveCSS('opacity', '0');

            await getContent(page).hover();
            await expect(track).toHaveCSS('opacity', '1');
        });

        test('clicking the scrollbar thumb keeps the panel open', async ({ page }) => {
            await getContent(page).hover();
            await getVerticalThumb(page).click();

            await expect(getContent(page)).toBeVisible();
        });

        test('renders the custom scrollbar', async ({ page }) => {
            const track = getTrack(page);

            // Hover keeps the hover track revealed (opacity 1) deterministically for the screenshot.
            await getContent(page).hover();
            await expect(track).toHaveCSS('opacity', '1');
            await expect(getContent(page)).toHaveScreenshot('04-light.png');
        });
    });

    test.describe('E2eTimezoneStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezoneStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTimezoneStates');

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTimezoneWithSearch', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezoneWithSearch');
        const getTimezoneSelect = (locator: Locator) => locator.getByTestId('e2eTimezoneSelectWithSearch');

        test('with search', async ({ page }) => {
            await page.goto('/E2eTimezoneWithSearch');
            const timezone = getTimezoneSelect(getComponent(page));

            await timezone.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('E2eTimezonePanelStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezonePanelStates');
        const getTimezoneSelect = (locator: Locator) => locator.getByTestId('e2eTimezoneSelect');

        test('option states', async ({ page }) => {
            await page.goto('/E2eTimezonePanelStates');
            const timezone = getTimezoneSelect(getComponent(page));

            await timezone.click();

            await expect(getComponent(page)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('03-dark.png');
        });
    });
});
