import { expect, Locator, Page, test } from '@playwright/test';
import {
    e2eDisableResizeObserver,
    e2eEnableDarkTheme,
    e2eExpectNoScrollbarAfterFlash,
    e2eHasOverflowShadow,
    e2eWaitForSettledScrollbars
} from '../../e2e/utils';

test.describe('KbqModalModule', () => {
    const openModal = async (page: Page, route: string, testId: string = 'e2eOpenModal') => {
        await page.setViewportSize({ width: 400, height: 350 });
        await page.goto(route);
        await page.getByTestId(testId).click();
        await page.locator('.kbq-modal-container').waitFor({ state: 'visible' });
        // The scrollbars flash once the opening animation ends. Visible alone is true from its first
        // frame, so a wait for settled scrollbars could otherwise return before the flash has begun.
        await expect(page.locator('.kbq-modal-container')).not.toHaveClass(/zoom-enter/);
    };

    const scrollBody = (page: Page, scrollTop: number) =>
        page.locator('.kbq-modal-body').evaluate((el, top) => {
            el.scrollTop = top;
        }, scrollTop);

    const scrollBodyToMiddle = (page: Page) =>
        page.locator('.kbq-modal-body').evaluate((el) => {
            el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2);
        });

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
            // Keep the pointer off the centered modal so the track starts hidden before the hover step.
            await page.mouse.move(0, 0);
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

    test.describe('E2eModalScrollbarFlash', () => {
        const getBody = (page: Page, modal: string) => page.locator(`.${modal} .kbq-modal-body`);

        test.beforeEach(async ({ page }) => {
            // Tracks then never receive their geometry, so the fitting modal also proves that a track
            // takes no room of its own before that geometry arrives.
            await e2eDisableResizeObserver(page);
            await page.goto('/E2eModalScrollbarFlash');
            await page.getByTestId('e2eOpenModal').click();
            // Outside every dialog, on the wrap of the modal opened last, which does not scroll itself:
            // hover then cannot stand in for the flash of any scrollbar asserted below.
            await page.mouse.move(0, 0);
        });

        test('reveals the scrollbar once the modal has opened, without the pointer going near it', async ({ page }) => {
            const track = getBody(page, 'e2e-modal-flash-overflowing').locator('kbq-scrollbar-track');

            await expect(track).toHaveClass(/kbq-scrollbar-track_revealed/);
            await expect(track.locator('.kbq-scrollbar-track__bar')).not.toHaveCount(0);
        });

        test('reveals the scrollbar of the wrap once a modal taller than the viewport has opened', async ({ page }) => {
            const track = page.locator('.kbq-modal-wrap:has(> .e2e-modal-flash-tall) > kbq-scrollbar-track');

            await expect(track).toHaveClass(/kbq-scrollbar-track_revealed/);
            await expect(track.locator('.kbq-scrollbar-track__bar')).not.toHaveCount(0);
        });

        test('reveals nothing for a modal whose body does not scroll', async ({ page }) => {
            await e2eExpectNoScrollbarAfterFlash(
                getBody(page, 'e2e-modal-flash-fitting'),
                getBody(page, 'e2e-modal-flash-overflowing')
            );
        });
    });

    test.describe('E2eModalDynamicContent', () => {
        // Offsets rather than `boundingBox()`, which also reflects the transform of the opening animation.
        const getLayout = (element: Locator) =>
            element.evaluate(({ offsetLeft, offsetTop, offsetWidth, offsetHeight }: HTMLElement) => ({
                offsetLeft,
                offsetTop,
                offsetWidth,
                offsetHeight
            }));

        const isScrollable = (element: Locator) => element.evaluate((el) => el.scrollHeight > el.clientHeight);

        // Class names of the elements inside the dialog that can scroll with a browser-rendered scrollbar.
        //
        // This is what the layout assertions below cannot check for themselves: Playwright launches
        // headless Chromium with `--hide-scrollbars`, so a native scrollbar takes no width there and
        // nothing it narrows can move. It does take width wherever the product runs, which is why every
        // scrolling element of the modal has to go through `kbqScrollbarViewport`.
        const getNativeScrollers = (modal: Locator) =>
            modal.evaluate((element) =>
                Array.from(element.querySelectorAll('*'))
                    .filter((child) => {
                        const { overflowX, overflowY } = getComputedStyle(child);
                        const scrolls = [overflowX, overflowY].some((value) => ['auto', 'scroll'].includes(value));

                        return scrolls && !child.classList.contains('kbq-scrollbar-viewport_native-scrollbar-hidden');
                    })
                    .map((child) => child.className)
            );

        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 600, height: 500 });
            await page.goto('/E2eModalDynamicContent');
        });

        for (const { type, testId } of [
            { type: 'default', testId: 'e2eOpenDefaultModal' },
            { type: 'confirm', testId: 'e2eOpenConfirmModal' },
            { type: 'custom', testId: 'e2eOpenCustomModal' }
        ]) {
            test(`keeps the content of a ${type} modal in place when its body starts and stops scrolling`, async ({
                page
            }) => {
                await page.getByTestId(testId).click();

                const body = page.locator('.kbq-modal-body');
                const paragraph = body.locator('p').first();
                const toggle = body.getByTestId('e2eToggleContent');

                await expect(paragraph).toBeVisible();
                // Guards the premise: without a body that starts short and then overflows, nothing is tested.
                expect(await isScrollable(body)).toBe(false);

                const layout = await getLayout(paragraph);

                await toggle.click();
                await expect.poll(() => isScrollable(body)).toBe(true);
                expect(await getLayout(paragraph)).toEqual(layout);
                expect(await getNativeScrollers(page.locator('.kbq-modal'))).toEqual([]);

                await toggle.click();
                await expect.poll(() => isScrollable(body)).toBe(false);
                expect(await getLayout(paragraph)).toEqual(layout);
            });
        }

        test('keeps the dialog in place when the wrap around it starts scrolling', async ({ page }) => {
            // The dialog is meant to grow taller here; only sideways movement would be the defect, and
            // that is what a native scrollbar of the wrap would cause by narrowing the scrollport.
            const getPlacement = (element: Locator) =>
                element.evaluate(({ offsetLeft, offsetWidth }: HTMLElement) => ({ offsetLeft, offsetWidth }));

            await page.getByTestId('e2eOpenTallModal').click();

            const wrap = page.locator('.kbq-modal-wrap');
            const container = page.locator('.kbq-modal-container');
            const toggle = container.getByTestId('e2eToggleContent');

            await expect(container).toBeVisible();
            expect(await isScrollable(wrap)).toBe(false);

            const placement = await getPlacement(container);

            await toggle.click();
            await expect.poll(() => isScrollable(wrap)).toBe(true);
            expect(await getPlacement(container)).toEqual(placement);
            expect(await getNativeScrollers(page.locator('.kbq-modal'))).toEqual([]);

            await toggle.click();
            await expect.poll(() => isScrollable(wrap)).toBe(false);
            expect(await getPlacement(container)).toEqual(placement);
        });
    });

    test.describe('overflow shadow', () => {
        test('should show footer shadow on init when body content overflows', async ({ page }) => {
            await openModal(page, '/E2eModalStates');

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-footer'))).toBeTruthy();
        });

        test('should show header shadow after scrolling down', async ({ page }) => {
            await openModal(page, '/E2eModalStates');
            await scrollBody(page, 50);

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-header'))).toBeTruthy();
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await openModal(page, '/E2eModalStates');
            await scrollBodyToMiddle(page);

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-header'))).toBeTruthy();
            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-footer'))).toBeTruthy();
        });
    });

    test.describe('overflow shadow (full custom content)', () => {
        test('should show footer shadow on init when body content overflows', async ({ page }) => {
            await openModal(page, '/E2eModalFullCustom');

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-footer'))).toBeTruthy();
        });

        test('should show header shadow after scrolling down', async ({ page }) => {
            await openModal(page, '/E2eModalFullCustom');
            await scrollBody(page, 50);

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-header'))).toBeTruthy();
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await openModal(page, '/E2eModalFullCustom');
            await scrollBodyToMiddle(page);

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-header'))).toBeTruthy();
            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-footer'))).toBeTruthy();
        });

        test('should keep the header shadow when the caption is present', async ({ page }) => {
            await openModal(page, '/E2eModalFullCustom', 'e2eOpenModalWithCaption');
            await scrollBody(page, 50);

            await expect(page.locator('.kbq-modal-header .kbq-modal-caption')).toBeVisible();
            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-modal-header'))).toBeTruthy();
        });
    });

    test.describe('E2eModalFullCustom with caption', () => {
        test('renders the same header layout as a modal created by the service', async ({ page }) => {
            await openModal(page, '/E2eModalFullCustom', 'e2eOpenModalWithCaption');
            // Keep the pointer off the centered modal so hover does not hold the scrollbar track visible.
            await page.mouse.move(0, 0);

            const container = page.locator('.kbq-modal-container');
            const body = page.locator('.kbq-modal-body');

            await expect(page.locator('.kbq-modal-header .kbq-modal-caption')).toBeVisible();
            await e2eWaitForSettledScrollbars(body);

            await expect(container).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);

            // Waited for again rather than once up front: `toHaveScreenshot` scrolls its target into
            // view before every shot, and a scroll re-reveals the track for `hideDelay`. Without this
            // the dark shot races that timer — which is why this test only ever failed on `04-dark`.
            await e2eWaitForSettledScrollbars(body);

            await expect(container).toHaveScreenshot('04-dark.png');
        });
    });
});
