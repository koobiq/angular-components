import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqNavbarModule', () => {
    test.describe('E2eHorizontalNavbarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eNavbarStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eHorizontalNavbarStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eVerticalNavbarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eVerticalNavbarStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('E2eVerticalNavbarBrandAutoLongTitle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eVerticalNavbarBrandAutoLongTitle');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');
        const getTitle = (page: Page, testId: string) => page.getByTestId(testId);

        test('states', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarBrandAutoLongTitle');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-dark.png');
        });

        test('should keep the default presentation for a title that fits', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarBrandAutoLongTitle');

            await expect(getTitle(page, 'short')).toHaveCSS('font-size', '18px');
        });

        test('should switch to the compact presentation for a title that does not fit', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarBrandAutoLongTitle');

            await expect(getTitle(page, 'wraps')).toHaveCSS('font-size', '14px');
        });

        test('should keep the explicit longTitle=false override', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarBrandAutoLongTitle');

            await expect(getTitle(page, 'forced-off')).toHaveCSS('font-size', '18px');
        });

        /**
         * `-webkit-line-clamp` does nothing without `display: -webkit-box`, and the per-orientation rules set
         * `display` on the title at the same specificity. Asserting the type alone would not notice: the font
         * stays 14px while the title silently wraps to an unbounded number of lines with no ellipsis.
         */
        test('should clamp an over-long title to exactly two lines', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarBrandAutoLongTitle');

            for (const testId of ['clamped', 'horizontal-long']) {
                const title = getTitle(page, testId);

                await expect(title).toHaveCSS('-webkit-line-clamp', '2');

                const { lines, clipped } = await title.evaluate((el) => ({
                    lines: Math.round(el.clientHeight / parseFloat(getComputedStyle(el).lineHeight)),
                    clipped: el.scrollHeight > el.clientHeight
                }));

                expect(lines, `${testId} must render two lines`).toBe(2);
                expect(clipped, `${testId} must be clipped, which is what shows the tooltip`).toBe(true);
            }
        });

        test('should switch to the compact presentation in a horizontal navbar too', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarBrandAutoLongTitle');

            await expect(getTitle(page, 'horizontal-long')).toHaveCSS('font-size', '14px');
            await expect(getTitle(page, 'horizontal-short')).toHaveCSS('font-size', '18px');
        });

        /** Two lines of the 18px default would stretch the navbar; the compact type is what prevents that. */
        test('should not stretch the horizontal navbar when the title wraps', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarBrandAutoLongTitle');

            const navbarOf = (testId: string) => page.locator('.kbq-navbar').filter({ has: page.getByTestId(testId) });

            const long = await navbarOf('horizontal-long').boundingBox();
            const short = await navbarOf('horizontal-short').boundingBox();

            expect(long!.height).toBe(short!.height);
        });

        /**
         * The mode changes the font, so measuring in the applied state would flip the predicate back and the
         * title would toggle forever. This length sits exactly in that band.
         */
        test('should settle on a stable presentation for a title in the oscillation band', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarBrandAutoLongTitle');

            const title = getTitle(page, 'band');

            await expect(title).toHaveCSS('font-size', '14px');

            const sample = async () => {
                const sizes: string[] = [];

                for (let i = 0; i < 5; i++) {
                    sizes.push(await title.evaluate((el) => getComputedStyle(el).fontSize));
                    await page.waitForTimeout(120); // longer than the brand's 100ms debounce
                }

                return sizes;
            };

            expect(new Set(await sample()).size).toBe(1);
        });
    });

    test.describe('E2eVerticalNavbarBrandFirstExpand', () => {
        type BrandFrame = { expanded: boolean; compact: boolean; fontSize: string };

        /**
         * A collapsed title is `display: none` and cannot be measured, so the first expand is the first chance
         * to measure at all - and the only chance to get it right before the user sees it. Routing that event
         * through the brand's debounce painted the default 18px single line for the whole window and only then
         * snapped to the compact two-line one (#DS-4477).
         *
         * Asserting the settled state cannot catch this: the flicker *is* an intermediate state, and every
         * assertion Playwright offers auto-retries, i.e. waits the wrong frame out. So record the class changes
         * instead and require that no observed state ever had the navbar expanded in the default presentation.
         */
        test('should not paint the default presentation on the first expand', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarBrandFirstExpand');

            const brand = page.locator('.kbq-navbar-brand');

            await brand.evaluate((el) => {
                const title = el.querySelector('.kbq-navbar-title')!;
                const frames: BrandFrame[] = [];

                Object.assign(window, { kbqBrandFrames: frames });

                new MutationObserver(() =>
                    frames.push({
                        expanded: el.classList.contains('kbq-expanded'),
                        compact: el.classList.contains('kbq-navbar-brand_long-title'),
                        fontSize: getComputedStyle(title).fontSize
                    })
                ).observe(el, { attributes: true, attributeFilter: ['class'] });
            });

            // The toggle is `display: none` until the navbar is hovered.
            await page.locator('.kbq-vertical-navbar').hover();
            await page.getByTestId('first-expand-toggle').click();

            // Lets the expansion settle, so a regression gets to record its corrective second frame too.
            await expect(page.getByTestId('first-expand')).toHaveCSS('font-size', '14px');

            const frames = await page.evaluate(
                () => (window as typeof window & { kbqBrandFrames: BrandFrame[] }).kbqBrandFrames
            );

            expect(frames.length, 'the observer must have recorded the expand at all').toBeGreaterThan(0);

            const flickered = frames.filter(({ expanded, compact }) => expanded && !compact);

            expect(flickered, `expanded in the default presentation: ${JSON.stringify(flickered)}`).toEqual([]);
        });
    });
});
