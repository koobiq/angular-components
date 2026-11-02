import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eExpectNoScrollbarAfterFlash, e2eWaitForSettledScrollbars } from 'packages/e2e/utils';

test.describe('KbqCodeBlockModule', () => {
    const getScreenshotTarget = (page: Page, testId: string) =>
        page.getByTestId(testId).getByTestId('e2eScreenshotTarget');

    // highlight.js arrives through a dynamic import and its line-numbers plugin then rebuilds every block into a
    // table of rows, line numbers shown or not, which changes its height. A block that does not overflow reveals no
    // track to wait for, so gate on the tables rather than on anything the shot itself can cause to be true.
    const expectHighlighted = (target: Locator, blocks: number) =>
        expect(target.locator('.hljs-ln')).toHaveCount(blocks);

    test.describe('E2eCodeBlockNoTabs', () => {
        test('actionbar over the code', async ({ page }) => {
            await page.goto('/E2eCodeBlockNoTabs');

            const target = getScreenshotTarget(page, 'e2eCodeBlockNoTabs');

            // Once highlighted, every block whose code overflows reveals its track for `hideDelay`. One track
            // per block here and in the tests below.
            await e2eWaitForSettledScrollbars(target, 12);

            await expect(target).toHaveScreenshot('01-no-tabs-light.png');
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('01-no-tabs-dark.png');
        });
    });

    test.describe('E2eCodeBlockTabs', () => {
        test('header', async ({ page }) => {
            await page.goto('/E2eCodeBlockTabs');

            const target = getScreenshotTarget(page, 'e2eCodeBlockTabs');

            await e2eWaitForSettledScrollbars(target, 9);

            await expect(target).toHaveScreenshot('02-tabs-light.png');
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('02-tabs-dark.png');
        });
    });

    test.describe('E2eCodeBlockLineNumbers', () => {
        test('numbered rows', async ({ page }) => {
            await page.goto('/E2eCodeBlockLineNumbers');

            const target = getScreenshotTarget(page, 'e2eCodeBlockLineNumbers');

            await expectHighlighted(target, 2);
            await e2eWaitForSettledScrollbars(target, 2);

            await expect(target).toHaveScreenshot('03-line-numbers-light.png');
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('03-line-numbers-dark.png');
        });
    });

    test.describe('E2eCodeBlockSoftWrap', () => {
        test('wrapped lines', async ({ page }) => {
            await page.goto('/E2eCodeBlockSoftWrap');

            const target = getScreenshotTarget(page, 'e2eCodeBlockSoftWrap');

            await expectHighlighted(target, 1);
            await e2eWaitForSettledScrollbars(target, 1);

            await expect(target).toHaveScreenshot('04-soft-wrap-light.png');
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('04-soft-wrap-dark.png');
        });
    });

    test.describe('E2eCodeBlockViewAll', () => {
        test('collapsed and expanded', async ({ page }) => {
            await page.goto('/E2eCodeBlockViewAll');

            const target = getScreenshotTarget(page, 'e2eCodeBlockViewAll');

            await e2eWaitForSettledScrollbars(target, 7);

            await expect(target).toHaveScreenshot('05-view-all-light.png');
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('05-view-all-dark.png');
        });
    });

    test.describe('E2eCodeBlockScroll', () => {
        test('scrolled content and the scrollbar', async ({ page }) => {
            await page.goto('/E2eCodeBlockScroll');

            const target = getScreenshotTarget(page, 'e2eCodeBlockScroll');
            const scrolledCodeArea = page.getByTestId('e2eCodeBlockWithTabs').locator('.kbq-code-block__main');

            // The scenario scrolls to the end itself, and the test scrolls once more. `KbqCodeBlock.scrollTo`
            // defers until highlighting reports itself done, but the range can still grow past that, so the
            // component's own scroll may rest one pixel short and nothing corrects it. One CSS pixel shifts the
            // whole code area, which at threshold: 0 fails.
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

            await e2eWaitForSettledScrollbars(target, 3);

            await expect(target).toHaveScreenshot('06-scroll-light.png');
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('06-scroll-dark.png');
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
            await e2eExpectNoScrollbarAfterFlash(
                page.getByTestId('e2eCodeBlockFlashFitting').locator('.kbq-code-block__main'),
                page.getByTestId('e2eCodeBlockFlashOverflowing')
            );
        });
    });
});
