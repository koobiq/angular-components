import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqScrollbar', () => {
    test.describe('E2eScrollbarStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eScrollbarStateAndStyle');

        test('states', async ({ page }) => {
            await page.goto('/E2eScrollbarStateAndStyle');
            const component = getComponent(page);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eScrollbarDrag', () => {
        // `KbqScrollbar` moves the host's content into an auto-created
        // `.kbq-private-scrollbar-viewport` wrapper so the track/thumb (siblings on the host) stay
        // a fixed overlay — real scroll metrics belong on that wrapper, not the host itself.
        const getViewport = (container: Locator) => container.locator('.kbq-private-scrollbar-viewport');

        test('dragging the vertical thumb scrolls the content down', async ({ page }) => {
            await page.goto('/E2eScrollbarDrag');
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
            await page.goto('/E2eScrollbarDrag');
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
            await page.goto('/E2eScrollbarDrag');
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
            await page.goto('/E2eScrollbarDrag');
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
            await page.goto('/E2eScrollbarDrag');
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

    test.describe('E2eScrollbarScrollTo', () => {
        test('scrollToBottom/scrollToTop buttons scroll the content and update their own disabled state via isBottomReached/isTopReached', async ({
            page
        }) => {
            await page.goto('/E2eScrollbarScrollTo');
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

    test.describe('E2eScrollbarContentMutation', () => {
        test(
            "appending content that grows scrollHeight without resizing the scroll element's own " +
                'box does not shrink the thumb until update() is called — there is no MutationObserver ' +
                'watching content changes',
            async ({ page }) => {
                await page.goto('/E2eScrollbarContentMutation');
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

    test.describe('E2eScrollbarHostPadding', () => {
        // Host padding is asymmetric (10/25/15/35, see `E2eScrollbarHostPadding`'s styles) —
        // deliberately, so a bug that swaps two sides wouldn't go unnoticed the way it could with a
        // single uniform padding value. Both tracks overflow here, so corner-avoidance is active;
        // every assertion below picks the one edge per track corner-avoidance never touches (only
        // the vertical track's `bottom` and the horizontal track's `right` — or `left` in RTL — are
        // ever adjusted to dodge the other track).
        test("insets the vertical and horizontal tracks by the host's own asymmetric padding", async ({ page }) => {
            await page.goto('/E2eScrollbarHostPadding');
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
            await page.goto('/E2eScrollbarHostPadding');

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

    test.describe('E2eScrollbarHoverVisibility', () => {
        test("'hover' mode (the default) reveals the custom track on real mouse hover and hides it again on mouse leave", async ({
            page
        }) => {
            await page.goto('/E2eScrollbarHoverVisibility');
            const container = page.getByTestId('hover-visibility');
            const visibleClass = /(?:^|\s)kbq-private-scrollbar_visible(?:\s|$)/;

            await expect(container).not.toHaveClass(visibleClass);

            await container.hover();
            await expect(container).toHaveClass(visibleClass);

            await page.mouse.move(0, 0);
            await expect(container).not.toHaveClass(visibleClass);
        });

        // Regression test for a real bug: `pointerleave` used to call `setVisible(false)`
        // directly, hiding the track instantly regardless of `kbqScrollbarAutoHideDelay` — the
        // delay is only meaningful if leaving the host doesn't hide it immediately. The demo sets
        // `kbqScrollbarAutoHideDelay="400"` specifically so the actual elapsed time can be checked
        // against that number, not just "it hides eventually".
        test("'hover' mode waits the full kbqScrollbarAutoHideDelay (400ms) before hiding after the pointer leaves, instead of an abrupt snap-hide", async ({
            page
        }) => {
            await page.goto('/E2eScrollbarHoverVisibility');
            const container = page.getByTestId('hover-visibility');
            const visibleClass = /(?:^|\s)kbq-private-scrollbar_visible(?:\s|$)/;

            await container.hover();
            await expect(container).toHaveClass(visibleClass);

            const leftAt = Date.now();

            await page.mouse.move(0, 0);

            // Read the class synchronously (not via an auto-retrying `expect`) — this must catch
            // the state right after leaving, before any delay has had a chance to elapse.
            const classNameRightAfterLeaving = await container.evaluate((el) => el.className);

            expect(classNameRightAfterLeaving).toMatch(visibleClass);

            await expect(container).not.toHaveClass(visibleClass);

            const elapsed = Date.now() - leftAt;

            // Not an exact match (real timers/CI scheduling add slack on top), but it must be at
            // least the configured 400ms, and not drastically more than it either.
            expect(elapsed).toBeGreaterThanOrEqual(400);
            expect(elapsed).toBeLessThan(1500);
        });

        test("also reveals the custom track on a real keyboard scroll while focused but not hovered — the only affordance keyboard users have, since they can't hover", async ({
            page
        }) => {
            await page.goto('/E2eScrollbarHoverVisibility');
            const container = page.getByTestId('hover-visibility');
            const visibleClass = /(?:^|\s)kbq-private-scrollbar_visible(?:\s|$)/;

            await expect(container).not.toHaveClass(visibleClass);

            // Same as `E2eScrollbarKeyboard`: no other focusable element on the page, so a single
            // Tab lands directly on the scroll region — without moving the mouse over it, so this
            // only exercises the focus+scroll path, not hover.
            await page.keyboard.press('Tab');
            await expect(container).not.toHaveClass(visibleClass);

            await page.keyboard.press('ArrowDown');
            await expect(container).toHaveClass(visibleClass);
        });

        // `beginInteraction()` calls `Element.setPointerCapture` specifically so a drag keeps
        // tracking the pointer even once it physically leaves the host — jsdom doesn't implement
        // `setPointerCapture` at all (the call is feature-detected and silently skipped in unit
        // tests), so that guarantee is only checked here, against a real browser.
        test('a real thumb drag keeps scrolling — and stays visible — even after the pointer moves outside the host, thanks to real pointer capture', async ({
            page
        }) => {
            await page.goto('/E2eScrollbarHoverVisibility');
            const container = page.getByTestId('hover-visibility');
            const viewport = container.locator('.kbq-private-scrollbar-viewport');
            const thumb = container.locator('.kbq-private-scrollbar-track_vertical .kbq-private-scrollbar-thumb');
            const visibleClass = /(?:^|\s)kbq-private-scrollbar_visible(?:\s|$)/;

            // The thumb is `pointer-events: none` while hidden (see `scrollbar.scss`) — a real
            // browser enforces that hit-testing, unlike jsdom, so grabbing it for the first time
            // requires actually hovering the host first, same as a real user would have to.
            await container.hover();

            const thumbBox = await thumb.boundingBox();
            const containerBox = await container.boundingBox();

            if (!thumbBox || !containerBox) throw new Error('bounding box is null');

            await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
            await page.mouse.down();
            await expect(container).toHaveClass(visibleClass);

            const scrollTopBeforeLeaving = await viewport.evaluate((el) => el.scrollTop);

            // Well outside the host's own box entirely, not just outside the thumb.
            await page.mouse.move(
                containerBox.x + containerBox.width + 200,
                containerBox.y + containerBox.height + 200,
                {
                    steps: 5
                }
            );

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(scrollTopBeforeLeaving);

            const scrollTopOutside = await viewport.evaluate((el) => el.scrollTop);

            await page.mouse.up();

            // Ended cleanly: no further scroll from a stray move once released, and back to hidden
            // since the pointer isn't over the host.
            await page.mouse.move(
                containerBox.x + containerBox.width + 250,
                containerBox.y + containerBox.height + 250
            );
            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(scrollTopOutside);
            await expect(container).not.toHaveClass(visibleClass);
        });
    });

    test.describe('E2eScrollbarKeyboard', () => {
        // Same reasoning as `getViewport` above: the auto-created `.kbq-private-scrollbar-viewport`
        // wrapper is the real scrolling element here (no explicit `kbqScrollbarVirtualViewport`), so
        // it's the element that must be focusable and respond to keyboard scrolling.
        const getViewport = (container: Locator) => container.locator('.kbq-private-scrollbar-viewport');

        test('the scroll region is reachable via Tab and operable with the keyboard, like the native scrollbar it replaces', async ({
            page
        }) => {
            await page.goto('/E2eScrollbarKeyboard');
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

    test.describe('E2eScrollbarNested', () => {
        // `:scope >` (not a plain descendant match) — the inner instance's own track is also a
        // descendant of the outer host, so a plain `.locator('.kbq-private-scrollbar-track_vertical')`
        // scoped under the outer would ambiguously match both.
        const getOwnVerticalTrack = (container: Locator) =>
            container.evaluateHandle(
                (el) => el.querySelector(':scope > .kbq-private-scrollbar-track_vertical') as HTMLElement
            );

        // Regression test for a real bug: several rules in `scrollbar.scss` matched their modifier
        // class (`_visible`, `_rtl`) via a plain descendant combinator instead of `>` — so an outer
        // `kbqScrollbar`'s own state leaked onto a nested inner `kbqScrollbar`'s track, since the
        // inner track is still a DOM descendant of the outer host even though it belongs to a
        // completely separate directive instance.
        test("an inner kbqScrollbar's track stays hidden even though it's nested inside a fully visible outer one", async ({
            page
        }) => {
            await page.goto('/E2eScrollbarNested');
            const outer = page.getByTestId('nested-outer');
            const inner = page.getByTestId('nested-inner');

            const outerTrack = await getOwnVerticalTrack(outer);
            const innerTrack = await getOwnVerticalTrack(inner);

            // Outer is `always` visible.
            await expect.poll(() => outerTrack.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');

            // Inner is `hidden` — must stay invisible despite being a CSS descendant of the outer's
            // own visible host.
            await expect.poll(() => innerTrack.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
            expect(await innerTrack.evaluate((el) => getComputedStyle(el).visibility)).toBe('hidden');
        });

        test("an inner kbqScrollbar's RTL positioning stays independent of an outer RTL host", async ({ page }) => {
            await page.goto('/E2eScrollbarNested');
            const outer = page.getByTestId('nested-outer');
            const inner = page.getByTestId('nested-inner');

            // `getComputedStyle().right` resolves to a concrete pixel value for an absolutely
            // positioned, fully-constrained box (not the literal `auto` keyword) regardless of
            // which side was actually set in CSS — so check the rendered position instead.
            const getOwnVerticalTrackRect = (container: Locator) =>
                container.evaluate((el) => {
                    const track = el.querySelector(':scope > .kbq-private-scrollbar-track_vertical') as HTMLElement;

                    return track.getBoundingClientRect();
                });

            const outerBox = await outer.boundingBox();
            const innerBox = await inner.boundingBox();
            const outerTrackRect = await getOwnVerticalTrackRect(outer);
            const innerTrackRect = await getOwnVerticalTrackRect(inner);

            if (!outerBox || !innerBox) throw new Error('bounding box is null');

            // Outer is RTL — its own vertical track hugs the physical-left edge (the logical
            // start), not the right.
            expect(outerTrackRect.left - outerBox.x).toBeLessThan(20);

            // Inner is explicitly LTR, nested inside the RTL outer — its own vertical track must
            // stay on the physical-right edge, not inherit the outer's RTL flip.
            expect(innerBox.x + innerBox.width - innerTrackRect.right).toBeLessThan(20);
        });
    });
});
