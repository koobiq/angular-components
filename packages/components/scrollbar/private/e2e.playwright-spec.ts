import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqScrollbar (private)', () => {
    test.describe('E2ePrivateScrollbarStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2ePrivateScrollbarStateAndStyle');

        test('states', async ({ page }) => {
            await page.goto('/E2ePrivateScrollbarStateAndStyle');
            const component = getComponent(page);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2ePrivateScrollbarDrag', () => {
        // `KbqScrollbar` moves the host's content into an auto-created
        // `.kbq-private-scrollbar-viewport` wrapper so the track/thumb (siblings on the host) stay
        // a fixed overlay — real scroll metrics belong on that wrapper, not the host itself.
        const getViewport = (container: Locator) => container.locator('.kbq-private-scrollbar-viewport');

        test('dragging the vertical thumb scrolls the content down', async ({ page }) => {
            await page.goto('/E2ePrivateScrollbarDrag');
            const container = page.getByTestId('drag');
            const viewport = getViewport(container);
            const thumb = container.locator('.kbq-private-scrollbar-track_vertical .kbq-private-scrollbar-thumb');

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(0);

            const box = await thumb.boundingBox();

            if (!box) throw new Error('bounding box is null');

            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 40, { steps: 5 });
            await page.mouse.up();

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        });

        test('clicking the track away from the thumb jumps the scroll position toward the click', async ({ page }) => {
            await page.goto('/E2ePrivateScrollbarDrag');
            const container = page.getByTestId('drag');
            const viewport = getViewport(container);
            const track = container.locator('.kbq-private-scrollbar-track_vertical');

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(0);

            const box = await track.boundingBox();

            if (!box) throw new Error('bounding box is null');

            // The thumb starts at the track's top — clicking near the bottom lands on the track
            // itself, not the thumb, triggering "jump to click" rather than a drag.
            await page.mouse.click(box.x + box.width / 2, box.y + box.height - 5);

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        });

        test('kbqScrollbarDisableDrag blocks a real thumb drag but leaves track click-to-jump working', async ({
            page
        }) => {
            await page.goto('/E2ePrivateScrollbarDrag');
            const container = page.getByTestId('drag-disabled');
            const viewport = getViewport(container);
            const track = container.locator('.kbq-private-scrollbar-track_vertical');
            const thumb = track.locator('.kbq-private-scrollbar-thumb');

            const thumbBox = await thumb.boundingBox();

            if (!thumbBox) throw new Error('bounding box is null');

            await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2 + 40, {
                steps: 5
            });
            await page.mouse.up();

            expect(await viewport.evaluate((el) => el.scrollTop)).toBe(0);

            const trackBox = await track.boundingBox();

            if (!trackBox) throw new Error('bounding box is null');

            // The thumb starts at the track's top — pressing down near the bottom lands on the
            // track itself, triggering "jump to click", which disableDrag must leave untouched.
            await page.mouse.move(trackBox.x + trackBox.width / 2, trackBox.y + trackBox.height - 5);
            await page.mouse.down();

            const afterJump = await viewport.evaluate((el) => el.scrollTop);

            expect(afterJump).toBeGreaterThan(0);

            // But holding the mouse down past the jump and moving it must NOT keep following the
            // pointer — that would be a real, continued drag, which disableDrag is supposed to
            // block regardless of how the gesture started.
            await page.mouse.move(trackBox.x + trackBox.width / 2, trackBox.y + trackBox.height / 2, { steps: 5 });
            await page.mouse.up();

            expect(await viewport.evaluate((el) => el.scrollTop)).toBe(afterJump);
        });

        test('kbqScrollbarDisableClick blocks track click-to-jump but leaves thumb drag working', async ({ page }) => {
            await page.goto('/E2ePrivateScrollbarDrag');
            const container = page.getByTestId('click-disabled');
            const viewport = getViewport(container);
            const track = container.locator('.kbq-private-scrollbar-track_vertical');
            const thumb = track.locator('.kbq-private-scrollbar-thumb');

            const trackBox = await track.boundingBox();

            if (!trackBox) throw new Error('bounding box is null');

            await page.mouse.click(trackBox.x + trackBox.width / 2, trackBox.y + trackBox.height - 5);

            expect(await viewport.evaluate((el) => el.scrollTop)).toBe(0);

            const thumbBox = await thumb.boundingBox();

            if (!thumbBox) throw new Error('bounding box is null');

            await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2 + 40, {
                steps: 5
            });
            await page.mouse.up();

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        });
    });

    test.describe('E2ePrivateScrollbarScrollTo', () => {
        test('scrollToBottom/scrollToTop buttons scroll the content and update their own disabled state via isBottomReached/isTopReached', async ({
            page
        }) => {
            await page.goto('/E2ePrivateScrollbarScrollTo');
            const scrollTopButton = page.getByTestId('scroll-top');
            const scrollBottomButton = page.getByTestId('scroll-bottom');

            await expect(scrollTopButton).toBeDisabled();
            await expect(scrollBottomButton).toBeEnabled();

            await scrollBottomButton.click();

            await expect(scrollTopButton).toBeEnabled();
            await expect(scrollBottomButton).toBeDisabled();

            await scrollTopButton.click();

            await expect(scrollTopButton).toBeDisabled();
            await expect(scrollBottomButton).toBeEnabled();
        });
    });

    test.describe('E2ePrivateScrollbarContentMutation', () => {
        test(
            "appending content that grows scrollHeight without resizing the scroll element's own " +
                'box does not shrink the thumb until update() is called — there is no MutationObserver ' +
                'watching content changes',
            async ({ page }) => {
                await page.goto('/E2ePrivateScrollbarContentMutation');
                const container = page.getByTestId('content-mutation');
                const thumb = container.locator('.kbq-private-scrollbar-track_vertical .kbq-private-scrollbar-thumb');

                const initialHeight = (await thumb.boundingBox())?.height;

                await page.getByTestId('append').click();

                // Real browser, real ResizeObserver — the scroll element's own clientHeight never
                // changed (only its scrollHeight did), so no resize fires, no scroll happened, and
                // nothing else re-measures on its own: the thumb stays exactly as it was.
                expect((await thumb.boundingBox())?.height).toBe(initialHeight);

                await page.getByTestId('update').click();

                // Only once update() is explicitly called does the thumb reflect the new,
                // much-larger content — proving the staleness above wasn't a fluke of a
                // still-settling layout, but the actual absence of auto-detection.
                expect((await thumb.boundingBox())?.height).toBeLessThan(initialHeight!);
            }
        );
    });

    test.describe('E2ePrivateScrollbarHostPadding', () => {
        test("insets the track by the host's own padding instead of sitting flush with its border edge", async ({
            page
        }) => {
            await page.goto('/E2ePrivateScrollbarHostPadding');
            const container = page.getByTestId('host-padding');
            const track = container.locator('.kbq-private-scrollbar-track_vertical');

            const containerBox = await container.boundingBox();
            const trackBox = await track.boundingBox();

            if (!containerBox || !trackBox) throw new Error('bounding box is null');

            // The host has 20px of its own padding on every side — the track's right edge should
            // align with the padding box (the real content edge), not the host's border edge 20px
            // further out.
            const expectedRight = containerBox.x + containerBox.width - 20;

            expect(trackBox.x + trackBox.width).toBeCloseTo(expectedRight, 0);
            expect(trackBox.y).toBeCloseTo(containerBox.y + 20, 0);
        });
    });

    test.describe('E2ePrivateScrollbarHoverVisibility', () => {
        test("'hover' mode (the default) reveals the custom track on real mouse hover and hides it again on mouse leave", async ({
            page
        }) => {
            await page.goto('/E2ePrivateScrollbarHoverVisibility');
            const container = page.getByTestId('hover-visibility');
            const visibleClass = /(?:^|\s)kbq-private-scrollbar_visible(?:\s|$)/;

            await expect(container).not.toHaveClass(visibleClass);

            await container.hover();
            await expect(container).toHaveClass(visibleClass);

            await page.mouse.move(0, 0);
            await expect(container).not.toHaveClass(visibleClass);
        });
    });

    test.describe('E2ePrivateScrollbarKeyboard', () => {
        // Same reasoning as `getViewport` above: the auto-created `.kbq-private-scrollbar-viewport`
        // wrapper is the real scrolling element here (no explicit `kbqScrollbarVirtualViewport`), so
        // it's the element that must be focusable and respond to keyboard scrolling.
        const getViewport = (container: Locator) => container.locator('.kbq-private-scrollbar-viewport');

        test('the scroll region is reachable via Tab and operable with the keyboard, like the native scrollbar it replaces', async ({
            page
        }) => {
            await page.goto('/E2ePrivateScrollbarKeyboard');
            const container = page.getByTestId('keyboard');
            const viewport = getViewport(container);

            // No other focusable element on the page — a single Tab from the top must land here.
            await page.keyboard.press('Tab');
            await expect(viewport).toBeFocused();

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(0);

            await page.keyboard.press('ArrowDown');
            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);

            await page.keyboard.press('End');
            const maxScrollTop = await viewport.evaluate((el) => el.scrollHeight - el.clientHeight);

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(maxScrollTop);

            await page.keyboard.press('Home');
            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(0);
        });
    });
});
