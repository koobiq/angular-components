import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eSettleFrames, e2eWaitForSettledContent } from '../../e2e/utils';

test.describe('KbqToastModule', () => {
    test.describe('E2eToastStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eToastStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eToastStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eToastInteraction', () => {
        const getToast = (page: Page) => page.locator('.kbq-toast-overlay kbq-toast');
        const getCloseButton = (page: Page) => getToast(page).locator('[kbq-toast-close-button]');
        const getStack = (page: Page) => page.locator('.kbq-toast-overlay kbq-toast-container');
        const getAnchoredOverlay = (page: Page) => page.getByTestId('e2eAnchoredOverlay');

        /** The stack reports a new size from a resize observer, a frame or more after its animations end. */
        const waitForSettledStack = async (page: Page) => {
            await e2eWaitForSettledContent(getStack(page));
            await e2eSettleFrames(page);
        };

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eToastInteraction');
        });

        test('keeps an overlay that closes on scroll open when toasts appear', async ({ page }) => {
            await page.getByTestId('e2eOpenCloseOnScrollOverlay').click();
            await expect(getAnchoredOverlay(page)).toBeVisible();

            await page.getByTestId('e2eShowStickyToast').click();
            await expect(getToast(page)).toBeVisible();
            await waitForSettledStack(page);

            await page.getByTestId('e2eShowStickyToast').click();
            await expect(getToast(page)).toHaveCount(2);
            await waitForSettledStack(page);

            await expect(getAnchoredOverlay(page)).toBeVisible();
        });

        test('moves an overlay anchored to a toast along with the stack', async ({ page }) => {
            await page.getByTestId('e2eShowStickyToast').click();
            await page.getByTestId('e2eShowStickyToast').click();
            await expect(getToast(page)).toHaveCount(2);
            await waitForSettledStack(page);

            await page.getByTestId('e2eAnchorOverlayToLastToast').click();
            await expect(getAnchoredOverlay(page)).toBeVisible();

            await getCloseButton(page).first().click();
            await expect(getToast(page)).toHaveCount(1);
            await waitForSettledStack(page);

            const toast = (await getToast(page).boundingBox())!;
            const overlay = (await getAnchoredOverlay(page).boundingBox())!;

            expect(Math.abs(overlay.y - (toast.y + toast.height))).toBeLessThanOrEqual(1);
        });

        test('renders the toast in the overlay, at the configured stack position', async ({ page }) => {
            await page.getByTestId('e2eShowToast').click();

            await expect(getToast(page)).toBeVisible();
            await expect(page.locator('.kbq-toast-overlay kbq-toast-container')).toHaveClass(
                /kbq-toast-container-top-right/
            );
        });

        test('announces itself as a live region', async ({ page }) => {
            await page.getByTestId('e2eShowToast').click();

            // The error style interrupts, so it is announced through `alert` rather than `status`.
            await expect(getToast(page)).toHaveAttribute('role', 'alert');
            await expect(getToast(page)).toHaveAttribute('aria-atomic', 'true');
        });

        test('hides the toast once its duration is over', async ({ page }) => {
            await page.getByTestId('e2eShowToast').click();
            await expect(getToast(page)).toBeVisible();

            await expect(getToast(page)).toBeHidden({ timeout: 8000 });
        });

        test('keeps the toast while the pointer rests on it', async ({ page }) => {
            await page.getByTestId('e2eShowToast').click();
            await getToast(page).hover();

            // Twice the requested duration: without the pause the toast would be long gone.
            // eslint-disable-next-line playwright/no-wait-for-timeout -- asserts the toast outlives its own duration while hovered
            await page.waitForTimeout(4500);

            await expect(getToast(page)).toBeVisible();
        });

        test('stays usable when the system asks for reduced motion', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.getByTestId('e2eShowStickyToast').click();

            // Both the enter and the leave animation are disabled, so both ends have to work without them.
            await expect(getToast(page)).toBeVisible();

            await getCloseButton(page).click();

            await expect(getToast(page)).toBeHidden();
        });

        test('raises the stack above an overlay opened after it when another toast appears', async ({ page }) => {
            await page.getByTestId('e2eShowStickyToast').click();
            await expect(getToast(page)).toBeVisible();

            await page.getByTestId('e2eOpenOverlay').click();
            await expect(page.getByTestId('e2eOverlay')).toBeVisible();

            await page.getByTestId('e2eShowStickyToast').click();
            await expect(getToast(page)).toHaveCount(2);

            // The click waits for the button to receive pointer events, which the overlay would intercept.
            await getCloseButton(page).first().click();

            await expect(getToast(page)).toHaveCount(1);
        });

        test('closes a sticky toast through the close button', async ({ page }) => {
            await page.getByTestId('e2eShowStickyToast').click();

            const closeButton = getCloseButton(page);

            // A native button, so that it is reachable and operable from the keyboard without hand-wired keys.
            await expect(closeButton).toHaveRole('button');
            await expect(closeButton).toHaveAccessibleName(/.+/);

            await closeButton.click();

            await expect(getToast(page)).toBeHidden();
            await expect(page.locator('.kbq-toast-overlay kbq-toast-container')).toBeHidden();
        });
    });
});
