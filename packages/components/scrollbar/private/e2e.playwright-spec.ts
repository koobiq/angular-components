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

        test('kbqScrollbarDisableDrag + kbqScrollbarDisableClick together make the whole track inert', async ({
            page
        }) => {
            await page.goto('/E2ePrivateScrollbarDrag');
            const container = page.getByTestId('both-disabled');
            const viewport = getViewport(container);
            const track = container.locator('.kbq-private-scrollbar-track_vertical');
            const thumb = track.locator('.kbq-private-scrollbar-thumb');

            const trackBox = await track.boundingBox();

            if (!trackBox) throw new Error('bounding box is null');

            // Click on the track away from the thumb — with only one flag set this would jump-to-
            // click ([scrollbar.scss] makes the track `pointer-events: none` entirely once both
            // flags are set, not just individually), so nothing should happen here at all.
            await page.mouse.click(trackBox.x + trackBox.width / 2, trackBox.y + trackBox.height - 5);

            expect(await viewport.evaluate((el) => el.scrollTop)).toBe(0);

            // A real drag directly on the thumb too — same result: `pointer-events: none` on the
            // ancestor track means the thumb never receives the pointerdown either.
            const thumbBox = await thumb.boundingBox();

            if (!thumbBox) throw new Error('bounding box is null');

            await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2 + 40, {
                steps: 5
            });
            await page.mouse.up();

            expect(await viewport.evaluate((el) => el.scrollTop)).toBe(0);
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
        // Host padding is asymmetric (10/25/15/35, see `E2ePrivateScrollbarHostPadding`'s styles) —
        // deliberately, so a bug that swaps two sides wouldn't go unnoticed the way it could with a
        // single uniform padding value. Both tracks overflow here, so corner-avoidance is active;
        // every assertion below picks the one edge per track corner-avoidance never touches (only
        // the vertical track's `bottom` and the horizontal track's `right` — or `left` in RTL — are
        // ever adjusted to dodge the other track).
        test("insets the vertical and horizontal tracks by the host's own asymmetric padding", async ({ page }) => {
            await page.goto('/E2ePrivateScrollbarHostPadding');
            const container = page.getByTestId('host-padding');
            const verticalTrack = container.locator('.kbq-private-scrollbar-track_vertical');
            const horizontalTrack = container.locator('.kbq-private-scrollbar-track_horizontal');

            const containerBox = await container.boundingBox();
            const verticalBox = await verticalTrack.boundingBox();
            const horizontalBox = await horizontalTrack.boundingBox();

            if (!containerBox || !verticalBox || !horizontalBox) throw new Error('bounding box is null');

            expect(verticalBox.y).toBeCloseTo(containerBox.y + 10, 0);
            expect(verticalBox.x + verticalBox.width).toBeCloseTo(containerBox.x + containerBox.width - 25, 0);

            expect(horizontalBox.x).toBeCloseTo(containerBox.x + 35, 0);
            expect(horizontalBox.y + horizontalBox.height).toBeCloseTo(containerBox.y + containerBox.height - 15, 0);
        });

        test("flips the vertical track to the host's logical-left padding under RTL", async ({ page }) => {
            await page.goto('/E2ePrivateScrollbarHostPadding');

            // `host-padding-rtl` is wrapped in CDK's `[dir]` directive (`<div dir="rtl">`), which
            // provides `Directionality` locally via DI from its own attribute — global
            // `document.documentElement.dir` isn't an option here, since `Directionality` only ever
            // reads it once, at its own construction (app bootstrap), so setting it later (e.g. via
            // `page.evaluate()`, or even `addInitScript`, which this dev server's own bootstrapping
            // ends up clobbering before Angular reads it) wouldn't be picked up at all.
            const container = page.getByTestId('host-padding-rtl');
            const verticalTrack = container.locator('.kbq-private-scrollbar-track_vertical');
            const horizontalTrack = container.locator('.kbq-private-scrollbar-track_horizontal');

            const containerBox = await container.boundingBox();
            const verticalBox = await verticalTrack.boundingBox();
            const horizontalBox = await horizontalTrack.boundingBox();

            if (!containerBox || !verticalBox || !horizontalBox) throw new Error('bounding box is null');

            // RTL moves the vertical track to the logical-left (host-padding-left) edge instead of
            // the right.
            expect(verticalBox.x).toBeCloseTo(containerBox.x + 35, 0);

            // The horizontal track's corner-avoidance-adjusted side mirrors too (becomes `left`
            // instead of `right`) — its `right`/`bottom` stay the safe, untouched edges here.
            expect(horizontalBox.x + horizontalBox.width).toBeCloseTo(containerBox.x + containerBox.width - 25, 0);
            expect(horizontalBox.y + horizontalBox.height).toBeCloseTo(containerBox.y + containerBox.height - 15, 0);
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
