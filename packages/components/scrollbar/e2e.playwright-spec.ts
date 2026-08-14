import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqScrollbar', () => {
    test.describe('E2eScrollbarStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eScrollbarStateAndStyle');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eScrollbarStateAndStyle');
        });

        test('renders scrollbar variants', async ({ page }) => {
            const component = getComponent(page);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eScrollbarHover', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eScrollbarHover');
        const getScrollbar = (page: Page) => getComponent(page).locator('kbq-scrollbar');
        const getThumb = (page: Page) =>
            getComponent(page).locator('.kbq-scrollbar-track__bar_vertical .kbq-scrollbar-track__thumb');
        const getHorizontalThumb = (page: Page) =>
            getComponent(page).locator('.kbq-scrollbar-track__bar_horizontal .kbq-scrollbar-track__thumb');

        // Resolves a CSS custom property the same way the browser would resolve it as a `background-color`
        // (via a disposable probe element in the same cascade scope), rather than comparing against the
        // custom property's raw text — which isn't guaranteed to be formatted the same way `getComputedStyle`
        // normalizes an actual `background-color` (e.g. `rgba(0,0,0,.5)` vs `rgba(0, 0, 0, 0.5)`).
        const resolveBackgroundColorVar = (locator: Locator, variableName: string) =>
            locator.evaluate((el, name) => {
                const probe = document.createElement('div');

                probe.style.backgroundColor = `var(${name})`;
                el.appendChild(probe);

                const color = getComputedStyle(probe).backgroundColor;

                probe.remove();

                return color;
            }, variableName);

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eScrollbarHover');
        });

        test('hovering the thumb applies --kbq-scrollbar-thumb-hover-background', async ({ page }) => {
            const thumb = getThumb(page);

            await getScrollbar(page).hover(); // reveals the track — mode defaults to "hover"
            const expected = await resolveBackgroundColorVar(thumb, '--kbq-scrollbar-thumb-hover-background');

            await thumb.hover();

            await expect(thumb).toHaveCSS('background-color', expected);
        });

        test('vertical thumb is 14px wide and horizontal thumb is 14px tall', async ({ page }) => {
            await getScrollbar(page).hover();

            const verticalThumb = getThumb(page);
            const horizontalThumb = getHorizontalThumb(page);

            await expect(verticalThumb).toBeVisible();
            await expect(horizontalThumb).toBeVisible();

            expect(await verticalThumb.evaluate((el) => el.getBoundingClientRect().width)).toBe(14);
            expect(await horizontalThumb.evaluate((el) => el.getBoundingClientRect().height)).toBe(14);
        });

        test('pressing the thumb applies --kbq-scrollbar-thumb-active-background', async ({ page }) => {
            const thumb = getThumb(page);

            await getScrollbar(page).hover();
            const expected = await resolveBackgroundColorVar(thumb, '--kbq-scrollbar-thumb-active-background');

            await thumb.hover();
            await page.mouse.down();

            await expect(thumb).toHaveCSS('background-color', expected);

            await page.mouse.up();
        });
    });

    test.describe('E2eScrollbarTrack', () => {
        const getScrollbarY = (page: Page) => page.getByTestId('e2eScrollbarTrackY');
        const getScrollbarX = (page: Page) => page.getByTestId('e2eScrollbarTrackX');
        const getScrollbarXY = (page: Page) => page.getByTestId('e2eScrollbarTrackXY');
        const getVerticalBar = (scrollbar: Locator) => scrollbar.locator('.kbq-scrollbar-track__bar_vertical');
        const getHorizontalBar = (scrollbar: Locator) => scrollbar.locator('.kbq-scrollbar-track__bar_horizontal');

        // Insets of `bar` relative to `<kbq-scrollbar-track>` — the containing block its `position:
        // absolute` insets (`inset-block`/`inset-inline`) actually resolve against — not the outer
        // `<kbq-scrollbar>` host, which pads its content instead.
        const insetsOf = async (scrollbar: Locator, bar: Locator) => {
            const track = scrollbar.locator('kbq-scrollbar-track');
            const [trackRect, barRect] = await Promise.all([
                track.evaluate((el) => el.getBoundingClientRect()),
                bar.evaluate((el) => el.getBoundingClientRect())
            ]);

            return {
                top: barRect.top - trackRect.top,
                bottom: trackRect.bottom - barRect.bottom,
                left: barRect.left - trackRect.left,
                right: trackRect.right - barRect.right
            };
        };

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eScrollbarTrack');
        });

        test('a vertical-only track spans the full height, flush with the top and bottom edges', async ({ page }) => {
            const scrollbar = getScrollbarY(page);

            await scrollbar.hover();

            const inset = await insetsOf(scrollbar, getVerticalBar(scrollbar));

            expect(inset.top).toBe(0);
            expect(inset.bottom).toBe(0);
        });

        test('a horizontal-only track spans the full width, flush with the left and right edges', async ({ page }) => {
            const scrollbar = getScrollbarX(page);

            await scrollbar.hover();

            const inset = await insetsOf(scrollbar, getHorizontalBar(scrollbar));

            expect(inset.left).toBe(0);
            expect(inset.right).toBe(0);
        });

        test('the vertical and horizontal tracks meet at the corner without overlapping', async ({ page }) => {
            const scrollbar = getScrollbarXY(page);

            await scrollbar.hover();

            const vertical = await getVerticalBar(scrollbar).evaluate((el) => el.getBoundingClientRect());
            const horizontal = await getHorizontalBar(scrollbar).evaluate((el) => el.getBoundingClientRect());

            expect(vertical.bottom).toBeLessThanOrEqual(horizontal.top);
            expect(horizontal.right).toBeLessThanOrEqual(vertical.left);
        });

        test('when both tracks are visible, each reserves exactly the other track’s thickness at the corner', async ({
            page
        }) => {
            const scrollbar = getScrollbarXY(page);

            await scrollbar.hover();

            const vertical = await insetsOf(scrollbar, getVerticalBar(scrollbar));
            const horizontal = await insetsOf(scrollbar, getHorizontalBar(scrollbar));

            expect(vertical.top).toBe(0);
            expect(vertical.bottom).toBe(14);
            expect(horizontal.left).toBe(0);
            expect(horizontal.right).toBe(14);
        });
    });

    test.describe('E2eScrollbarMode', () => {
        const getScrollbar = (page: Page) => page.getByTestId('e2eScrollbarModeTarget');
        const getTrack = (page: Page) => getScrollbar(page).locator('kbq-scrollbar-track');
        const setMode = (page: Page, mode: string) => page.getByTestId(`mode-${mode}`).click();

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eScrollbarMode');
            // Keep the pointer away from the scrollbar so :hover doesn't mask mode-driven visibility.
            await page.mouse.move(0, 0);
        });

        test('hover mode: track exists but stays hidden until hovered', async ({ page }) => {
            await setMode(page, 'hover');
            const track = getTrack(page);

            await expect(track).toBeAttached();
            await expect(track).toHaveCSS('opacity', '0');

            await getScrollbar(page).hover();
            await expect(track).toHaveCSS('opacity', '1');
        });

        test('always mode: track is visible without hovering', async ({ page }) => {
            await setMode(page, 'always');
            const track = getTrack(page);

            await expect(track).toBeAttached();
            await expect(track).toHaveCSS('opacity', '1');
        });

        test('native mode: no custom track is rendered', async ({ page }) => {
            await setMode(page, 'native');

            await expect(getTrack(page)).not.toBeAttached();
        });

        test('hidden mode: no custom track is rendered and the native scrollbar is hidden', async ({ page }) => {
            await setMode(page, 'hidden');

            await expect(getTrack(page)).not.toBeAttached();
            await expect(getScrollbar(page)).toHaveClass(/kbq-scrollbar-viewport_native-scrollbar-hidden/);
        });

        test('reacts to repeated mode switches on the same track instance, not just the first one', async ({
            page
        }) => {
            // `showTrack()` stays true across hover<->always, so <kbq-scrollbar-track> is never
            // destroyed/recreated here — this is what exposes a stale (non-reactive) mode input,
            // unlike switching through native/hidden, which recreates the component either way.
            const track = getTrack(page);

            await expect(track).toHaveCSS('opacity', '0'); // starts at the default 'hover' mode

            await setMode(page, 'always');
            await expect(track).toHaveCSS('opacity', '1');

            await setMode(page, 'hover');
            await expect(track).toHaveCSS('opacity', '0');

            await setMode(page, 'always');
            await expect(track).toHaveCSS('opacity', '1');
        });

        test('hover mode: clicking a focusable descendant with the mouse does not keep the track visible after the pointer leaves', async ({
            page
        }) => {
            // Regression test: the track used to stay visible relying on `:focus-within`, which also
            // matches DOM focus left behind by a mouse click (e.g. a dropdown item), not just keyboard
            // navigation. Fixed by keying off `.cdk-keyboard-focused` instead.
            await setMode(page, 'hover');
            const track = getTrack(page);

            // `force: true`: the horizontal thumb overlaps the button (the shared fixture content
            // overflows both axes), which is irrelevant here — only the resulting focus origin matters.
            await page.getByTestId('e2eScrollbarModeFocusable').click({ force: true });
            await page.mouse.move(0, 0);

            await expect(track).toHaveCSS('opacity', '0');
        });

        test('hover mode: keyboard-focusing a plain descendant keeps the track visible', async ({ page }) => {
            // The button isn't individually wired up to `FocusMonitor` — `KbqScrollbarViewport` monitors
            // its whole subtree, so this works for any projected content, not just components that opt in.
            await setMode(page, 'hover');
            const track = getTrack(page);

            // `Locator.focus()` is program-origin, not keyboard-origin — real Tab navigation is required
            // so `FocusMonitor` classifies the resulting focus as `cdk-keyboard-focused`. Nothing between
            // the last mode button and the target is tabbable, so a single Tab reaches it.
            await page.getByTestId('mode-hidden').focus();
            await page.keyboard.press('Tab');

            await expect(track).toHaveCSS('opacity', '1');
        });

        test('hover mode: keyboard-scrolling via a focused descendant shows the track', async ({ page }) => {
            // macOS-style expectation: the track should appear while the content is actively being
            // scrolled from the keyboard. Tabbing to (and, belt-and-suspenders, arrow-key-scrolling past)
            // a focused-but-non-scroll-handling element scrolls the nearest scrollable ancestor natively,
            // even though DOM focus itself never leaves that element.
            await setMode(page, 'hover');
            const track = getTrack(page);
            const viewport = getScrollbar(page);

            const before = await viewport.evaluate((el) => el.scrollTop);

            await page.getByTestId('mode-hidden').focus();
            await page.keyboard.press('Tab');
            await expect(page.getByTestId('e2eScrollbarModeFocusable')).toBeFocused();
            await page.keyboard.press('ArrowDown');

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(before);

            await expect(track).toHaveCSS('opacity', '1');
        });
    });

    test.describe('E2eScrollbarScrollTo', () => {
        const getScrollbar = (page: Page) => page.getByTestId('e2eScrollbarScrollToTarget');
        const scrollTop = (page: Page) => getScrollbar(page).evaluate((el) => el.scrollTop);
        const scrollLeft = (page: Page) => getScrollbar(page).evaluate((el) => el.scrollLeft);

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eScrollbarScrollTo');
        });

        test('scrollToBottom/scrollToTop scroll the vertical axis to the exact edges', async ({ page }) => {
            // 5 blocks * 150px = 750px content, 150px viewport => 600px of vertical scroll range.
            expect(await scrollTop(page)).toBe(0);

            await page.getByTestId('scroll-bottom').click();
            await expect.poll(() => scrollTop(page)).toBe(600);

            await page.getByTestId('scroll-top').click();
            await expect.poll(() => scrollTop(page)).toBe(0);
        });

        test('scrollEnd/scrollStart scroll the horizontal axis to the exact edges', async ({ page }) => {
            // Each block is 300px wide inside a 150px viewport => 150px of horizontal scroll range.
            expect(await scrollLeft(page)).toBe(0);

            await page.getByTestId('scroll-end').click();
            await expect.poll(() => scrollLeft(page)).toBe(150);

            await page.getByTestId('scroll-start').click();
            await expect.poll(() => scrollLeft(page)).toBe(0);
        });

        test('scrollToElement scrolls the target to the top of the viewport', async ({ page }) => {
            // The target is the 3rd of 5 equal 150px blocks, so its offsetTop is exactly 300px.
            await page.getByTestId('scroll-to-element').click();

            await expect.poll(() => scrollTop(page)).toBe(300);
        });
    });

    test.describe('E2eScrollbarVirtualScroll', () => {
        const getViewport = (page: Page) => page.getByTestId('e2eScrollbarVirtualScrollTarget');
        const getThumb = (page: Page) => getViewport(page).locator('.kbq-scrollbar-track__thumb');
        const thumbMetrics = (page: Page) =>
            getThumb(page).evaluate((el) => ({ top: parseFloat(el.style.top), height: parseFloat(el.style.height) }));

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eScrollbarVirtualScroll');
        });

        test('thumb shrinks and rises when items are appended while scrolled to the bottom', async ({ page }) => {
            const viewport = getViewport(page);

            // Scroll to the bottom of the initial 20 items (20 * 32px = 640px content, 200px viewport).
            await viewport.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));

            // The thumb's own top/height are updated via a separately throttled RAF stream, not
            // synchronously with the scroll event — wait for it to actually catch up before sampling,
            // or `before` can be captured mid-flight and make the assertions below flaky.
            await expect.poll(async () => (await thumbMetrics(page)).top).toBeGreaterThan(0);

            const before = await thumbMetrics(page);

            await page.getByTestId('add-items').click();

            // scrollTop stays put while scrollHeight grows, so both the thumb's proportional size and
            // its proportional offset shrink — the thumb visually rises and shrinks, exactly like macOS
            // when content is appended below the current scroll position.
            await expect.poll(async () => (await thumbMetrics(page)).height).toBeLessThan(before.height);
            await expect.poll(async () => (await thumbMetrics(page)).top).toBeLessThan(before.top);
        });

        test('adding items does not shrink the thumb below its minimum size', async ({ page }) => {
            await page.getByTestId('add-items').click();
            await page.getByTestId('add-items').click();
            await page.getByTestId('add-items').click();

            const thumb = getThumb(page);
            const boxHeight = () => thumb.evaluate((el) => el.getBoundingClientRect().height);

            // 32px visible min-size + 3px border on each side (--kbq-scrollbar-thumb-gap in scrollbar-viewport.scss).
            await expect.poll(boxHeight).toBeGreaterThanOrEqual(38);
        });

        test('the thumb does not overhang the track when its CSS-enforced min size kicks in at the end of the scroll range', async ({
            page
        }) => {
            // Enough items that the natural (proportional) thumb size falls well under the
            // CSS-enforced minimum, so `min-block-size` in scrollbar-track.scss clamps the rendered
            // thumb larger than the `top`/`height` percentages alone would produce.
            await page.getByTestId('add-items').click();
            await page.getByTestId('add-items').click();
            await page.getByTestId('add-items').click();

            const viewport = getViewport(page);

            await viewport.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
            await expect.poll(async () => (await thumbMetrics(page)).top).toBeGreaterThan(0);

            const bar = viewport.locator('.kbq-scrollbar-track__bar_vertical');
            const [barRect, thumbRect] = await Promise.all([
                bar.evaluate((el) => el.getBoundingClientRect()),
                getThumb(page).evaluate((el) => el.getBoundingClientRect())
            ]);

            // Sub-pixel tolerance only, for the `height` percentage's own rounding (see
            // `getViewFraction`) — not the multi-pixel overhang a wrong compensation formula produces.
            expect(thumbRect.bottom).toBeLessThanOrEqual(barRect.bottom + 1);
        });
    });

    test.describe('E2eScrollbarNested', () => {
        const getOuter = (page: Page) => page.getByTestId('e2eScrollbarNestedOuter');
        const getInner = (page: Page) => page.getByTestId('e2eScrollbarNestedInner');
        const outerScrollTop = (page: Page) => getOuter(page).evaluate((el) => el.scrollTop);
        const innerScrollTop = (page: Page) => getInner(page).evaluate((el) => el.scrollTop);

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eScrollbarNested');
        });

        test('scrolling the outer scrollbar does not move the inner one', async ({ page }) => {
            // Outer content: 200px spacer + 150px inner + 200px spacer = 550px in a 200px viewport.
            await getOuter(page).evaluate((el) => el.scrollTo({ top: el.scrollHeight }));

            await expect.poll(() => outerScrollTop(page)).toBe(350);
            expect(await innerScrollTop(page)).toBe(0);
        });

        test('scrolling the inner scrollbar does not move the outer one', async ({ page }) => {
            // Inner content: 5 * 150px blocks = 750px in a 150px viewport.
            await getInner(page).evaluate((el) => el.scrollTo({ top: el.scrollHeight }));

            await expect.poll(() => innerScrollTop(page)).toBe(600);
            expect(await outerScrollTop(page)).toBe(0);
        });
    });

    test.describe('E2eNativeScrollbar', () => {
        type NativeScrollbarStyle = {
            scrollbarWidth: string;
            thumbColor: string;
        };

        const nativeScrollbarStyle = (locator: Locator): Promise<NativeScrollbarStyle> =>
            locator.evaluate((el) => ({
                scrollbarWidth: getComputedStyle(el, '::-webkit-scrollbar').width,
                thumbColor: getComputedStyle(el, '::-webkit-scrollbar-thumb').backgroundColor
            }));

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eNativeScrollbar');
        });

        test('customizes only the host scrollbar by default', async ({ page }) => {
            const hostStyle = await nativeScrollbarStyle(page.getByTestId('e2eNativeScrollbarSelf'));
            const nestedStyle = await nativeScrollbarStyle(page.getByTestId('e2eNativeScrollbarSelfNested'));

            expect(hostStyle.scrollbarWidth).toBe('14px');
            expect(nestedStyle.scrollbarWidth).not.toBe('14px');
            expect(nestedStyle.thumbColor).not.toBe(hostStyle.thumbColor);
        });

        test('customizes descendant scrollbars when explicitly enabled', async ({ page }) => {
            const hostStyle = await nativeScrollbarStyle(page.getByTestId('e2eNativeScrollbarDescendants'));
            const nestedStyle = await nativeScrollbarStyle(page.getByTestId('e2eNativeScrollbarDescendantsNested'));

            expect(hostStyle.scrollbarWidth).toBe('14px');
            expect(nestedStyle).toEqual(hostStyle);
        });

        test('customizes KbqScrollbarViewport in native mode without rendering a custom track', async ({ page }) => {
            const viewport = page.getByTestId('e2eNativeScrollbarViewport');

            expect((await nativeScrollbarStyle(viewport)).scrollbarWidth).toBe('14px');
            await expect(viewport.locator('kbq-scrollbar-track')).not.toBeAttached();
            await expect(viewport).not.toHaveClass(/kbq-scrollbar-viewport_native-scrollbar-hidden/);
        });
    });
});
