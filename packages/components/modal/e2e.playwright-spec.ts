import { expect, Page, test } from '@playwright/test';
import {
    e2eDisableResizeObserver,
    e2eEnableDarkTheme,
    e2eExpectNoScrollbarAfterFlash,
    e2eHasOverflowShadow
} from '../../e2e/utils';

test.describe('KbqModalModule', () => {
    test.describe('E2eModalStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eModalStates');
        const getOpenButton = (page: Page) => page.getByTestId('e2eOpenModal');
        const getMultipleModalsButton = (page: Page) => page.getByTestId('e2eMultipleModals');

        test('states', async ({ page }) => {
            await page.setViewportSize({ width: 450, height: 550 });
            await page.goto('/E2eModalStates');
            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getOpenButton(page).click();
            await expect(page).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(page).toHaveScreenshot('01-dark.png');
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

    test.describe('E2eModalScrollbar', () => {
        const getBody = (page: Page) => page.locator('.kbq-modal-body');
        const getTrack = (page: Page) => getBody(page).locator('kbq-scrollbar-track');

        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 500, height: 500 });
            await page.goto('/E2eModalScrollbar');
            await page.getByTestId('e2eOpenModal').click();
            await getBody(page).waitFor({ state: 'visible' });
            // Keep the pointer off the centered modal so hover does not mask the flash behavior.
            await page.mouse.move(0, 0);
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

            await getBody(page).hover();
            await expect(track).toHaveCSS('opacity', '1');
        });

        test('renders the custom scrollbar', async ({ page }) => {
            const track = getTrack(page);

            await getBody(page).hover();
            await expect(track).toHaveCSS('opacity', '1');
            await expect(getBody(page)).toHaveScreenshot('03-light.png');
        });
    });

    test.describe('E2eModalScrollbarNoOverflow', () => {
        test('shows no scrollbar after the modal opens', async ({ page }) => {
            await e2eDisableResizeObserver(page);
            await page.goto('/E2eModalScrollbarNoOverflow');
            await page.getByTestId('e2eOpenModal').click();

            await e2eExpectNoScrollbarAfterFlash(page.locator('.kbq-modal-body'));
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

    test.describe('overflow shadow (full custom content)', () => {
        test('should show footer shadow on init when body content overflows', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await page.goto('/E2eModalFullCustom');
            await page.getByTestId('e2eOpenModal').click();
            await page.locator('.kbq-modal-container').waitFor({ state: 'visible' });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-footer'))).toBeTruthy();
        });

        test('should show header shadow after scrolling down', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await page.goto('/E2eModalFullCustom');
            await page.getByTestId('e2eOpenModal').click();
            await page.locator('.kbq-modal-container').waitFor({ state: 'visible' });

            await page.locator('.kbq-modal-body').evaluate((el) => {
                el.scrollTop = 50;
            });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-header'))).toBeTruthy();
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 350 });
            await page.goto('/E2eModalFullCustom');
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
