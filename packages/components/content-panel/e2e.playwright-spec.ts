import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqContentPanelModule', () => {
    test.describe('E2eContentPanelState', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eContentPanelState');

        test('states', async ({ page }) => {
            await page.goto('/E2eContentPanelState');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eContentPanelBodyPadding', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eContentPanelBodyPadding');

        const getRoomAfterScrollingToEnd = (page: Page): Promise<number> =>
            getComponent(page)
                .getByTestId('e2eContentPanelBody')
                .evaluate((body) => {
                    const viewport = body.querySelector('[data-overlayscrollbars-contents]')!;

                    viewport.scrollTop = viewport.scrollHeight;

                    return (
                        body.getBoundingClientRect().bottom - viewport.lastElementChild!.getBoundingClientRect().bottom
                    );
                });

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eContentPanelBodyPadding');
            await expect(getComponent(page)).toBeVisible();
        });

        // The scrollbar moves the padding of its host to the viewport once it initializes, and again after the
        // padding changes, so the room is polled.
        test('leaves room under the content when there is no footer', async ({ page }) => {
            await expect.poll(() => getRoomAfterScrollingToEnd(page)).toBeCloseTo(80, 0);
        });

        test('ends the content at the footer once it is shown', async ({ page }) => {
            await expect.poll(() => getRoomAfterScrollingToEnd(page)).toBeCloseTo(80, 0);

            await getComponent(page).getByTestId('e2eContentPanelToggleFooter').click();
            await expect(getComponent(page).getByTestId('e2eContentPanelFooter')).toBeVisible();

            await expect.poll(() => getRoomAfterScrollingToEnd(page)).toBeCloseTo(0, 0);
        });
    });

    test.describe('overflow shadow', () => {
        test('should show footer shadow on init when body content overflows', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');
            // Waiting for scrollbar initialization and overflow check
            await page.waitForTimeout(100);

            await expect(page.locator('.kbq-content-panel')).toHaveClass(/kbq-content-panel_footer-with-shadow/);
        });

        test('should show header shadow after scrolling down', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');

            await page.locator('.kbq-content-panel-body [data-overlayscrollbars-contents]').evaluate((el) => {
                el.scrollTop = 50;
            });

            await expect(page.locator('.kbq-content-panel')).toHaveClass(/kbq-content-panel_header-with-shadow/);
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');

            await page.locator('.kbq-content-panel-body [data-overlayscrollbars-contents]').evaluate((el) => {
                el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2);
            });

            await expect(page.locator('.kbq-content-panel')).toHaveClass(/kbq-content-panel_header-with-shadow/);
            await expect(page.locator('.kbq-content-panel')).toHaveClass(/kbq-content-panel_footer-with-shadow/);
        });
    });
});
