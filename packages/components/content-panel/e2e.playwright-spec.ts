import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eHasOverflowShadow, e2eWaitForSettledScrollbars } from '../../e2e/utils';

const getPanelContentWidth = (component: Locator): Promise<number> =>
    component.locator('.kbq-content-panel-container__panel').evaluate((element) => {
        const { paddingLeft, paddingRight } = getComputedStyle(element);

        return element.getBoundingClientRect().width - parseFloat(paddingLeft) - parseFloat(paddingRight);
    });

test.describe('KbqContentPanelModule', () => {
    test.describe('E2eContentPanelState', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eContentPanelState');

        test('states', async ({ page }) => {
            await page.goto('/E2eContentPanelState');

            // The fixture scrolls the body on init, which reveals the track for `hideDelay`.
            await e2eWaitForSettledScrollbars(page, 2);

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eContentPanelMinimalContent', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eContentPanelMinimalContent');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eContentPanelMinimalContent');
            await expect(getComponent(page).locator('.kbq-content-panel-header__close-button')).toBeVisible();
        });

        test('keeps the close button at the end of the header', async ({ page }) => {
            const component = getComponent(page);
            const headerRow = (await component.locator('.kbq-content-panel-header__wrapper').boundingBox())!;
            const closeButton = (await component.locator('.kbq-content-panel-header__close-button').boundingBox())!;

            expect(closeButton.x + closeButton.width).toBeCloseTo(headerRow.x + headerRow.width, 1);
        });

        test('fills the width of the panel with a short body', async ({ page }) => {
            const component = getComponent(page);
            const panelContentWidth = await getPanelContentWidth(component);
            const card = (await component.locator('.kbq-content-panel').boundingBox())!;

            expect(card.width).toBeCloseTo(panelContentWidth, 1);
        });
    });

    test.describe('E2eContentPanelWideContent', () => {
        test('stays inside the panel with a wide body', async ({ page }) => {
            await page.goto('/E2eContentPanelWideContent');

            const component = page.getByTestId('e2eContentPanelWideContent');
            const closeButton = component.locator('.kbq-content-panel-header__close-button');

            await expect(closeButton).toBeVisible();

            const panelContentWidth = await getPanelContentWidth(component);
            const card = (await component.locator('.kbq-content-panel').boundingBox())!;
            const closeButtonBox = (await closeButton.boundingBox())!;

            expect(card.width).toBeCloseTo(panelContentWidth, 1);
            expect(closeButtonBox.x + closeButtonBox.width).toBeLessThan(card.x + card.width);
        });
    });

    test.describe('overflow shadow', () => {
        test('should show footer shadow on init when body content overflows', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-content-panel-footer'))).toBeTruthy();
        });

        test('should show header shadow after scrolling down', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');

            await page.locator('.kbq-content-panel-body .kbq-scrollbar-viewport').evaluate((el) => {
                el.scrollTop = 50;
            });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-content-panel-header'))).toBeTruthy();
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');

            await page.locator('.kbq-content-panel-body .kbq-scrollbar-viewport').evaluate((el) => {
                el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2);
            });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-content-panel-header'))).toBeTruthy();
            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-content-panel-footer'))).toBeTruthy();
        });
    });
});
