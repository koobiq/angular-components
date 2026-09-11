import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eExpectNoScrollbarAfterFlash, e2eWaitForSettledScrollbars } from 'packages/e2e/utils';

test.describe('KbqCodeBlockModule', () => {
    test.describe('E2eCodeBlockStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eCodeBlockStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eCodeBlockStates');

            // highlight.js arrives through a dynamic import and its line-numbers plugin then rebuilds
            // every `lineNumbers` block into numbered rows, which grows the fixture from 1616px to
            // 1770px — at deviceScaleFactor 2 exactly the 3232-against-3540 image CI reported. Gate on
            // the rebuilt rows rather than on anything the shot itself can cause to be true.
            await expect(getComponent(page).locator('.hljs-ln-line, .hljs-ln-numbers').first()).toBeAttached();

            const scrolledCodeArea = page.getByTestId('e2eCodeBlockWithTabs').locator('.kbq-code-block__main');

            // Then re-scroll to the end. `KbqCodeBlock.scrollTo` defers until highlighting reports
            // itself done, but the range keeps growing past that as the plugin restructures, so the
            // component's own scroll rests one pixel short in roughly one run in thirty and nothing
            // corrects it. One CSS pixel shifts the whole code area, which at threshold: 0 fails.
            //
            // The remainder is compared with a tolerance, not to zero: `scrollHeight` and
            // `clientHeight` are CSSOM integers while `scrollTop` is a double, so at the true bottom
            // it lands anywhere in (-1, 1). See SCROLLED_TO_BOTTOM_TOLERANCE in notification-center.
            await expect
                .poll(async () =>
                    scrolledCodeArea.evaluate((el) => {
                        el.scrollTo({ top: el.scrollHeight });

                        const range = el.scrollHeight - el.clientHeight;

                        return range > 0 ? range - el.scrollTop : Number.NaN;
                    })
                )
                .toBeLessThanOrEqual(1);

            // The scroll above reveals every hover-mode track for `hideDelay`. One code block per
            // fixture row, each with a single track.
            await e2eWaitForSettledScrollbars(getComponent(page), 14);

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eCodeBlockScrollbarFlash', () => {
        // Scoped to the code content: the header's tab nav bar is a viewport too, but it runs in
        // `hidden` mode and builds no track at all.
        const getTrack = (page: Page, testId: string) =>
            page.getByTestId(testId).locator('.kbq-code-block__main > kbq-scrollbar-track');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eCodeBlockScrollbarFlash');
        });

        test('reveals the scrollbar once highlighting settles, without the pointer going near it', async ({ page }) => {
            const track = getTrack(page, 'e2eCodeBlockFlashOverflowing');

            await expect(track).toHaveClass(/kbq-scrollbar-track_revealed/);
            await expect(track.locator('.kbq-scrollbar-track__bar')).not.toHaveCount(0);
        });

        test('reveals nothing for a code block that does not scroll', async ({ page }) => {
            // Waited on first: the track reports no bars for its first frame plus one throttle window
            // whatever the content is, so asserting the empty track before any tick has run would pass
            // on the pre-computation window rather than on the behaviour. The overflowing block shares
            // this page's frame loop, so its bars appearing prove a tick has been through.
            await expect(
                getTrack(page, 'e2eCodeBlockFlashOverflowing').locator('.kbq-scrollbar-track__bar')
            ).not.toHaveCount(0);

            await e2eExpectNoScrollbarAfterFlash(
                page.getByTestId('e2eCodeBlockFlashFitting').locator('.kbq-code-block__main')
            );
        });
    });
});
