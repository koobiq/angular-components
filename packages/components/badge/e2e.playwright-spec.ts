import { expect, type Locator, type Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWaitForFonts } from 'packages/e2e/utils';

test.describe('KbqBadgeModule', () => {
    const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

    test.describe('E2eBadgeStyles', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBadgeStyles');

        test('styles', async ({ page }) => {
            await page.goto('/E2eBadgeStyles');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eBadgeContent', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBadgeContent');

        test('icons, caption and glyphs in every size and style', async ({ page }) => {
            await page.goto('/E2eBadgeContent');
            await e2eWaitForFonts(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('02-content-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('02-content-dark.png');
        });
    });

    test.describe('E2eBadgeContentColors', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBadgeContentColors');

        test('icon and caption in every color', async ({ page }) => {
            await page.goto('/E2eBadgeContentColors');
            await e2eWaitForFonts(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('03-colors-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('03-colors-dark.png');
        });
    });

    test.describe('E2eBadgeAlignment', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBadgeAlignment');

        // From the top of every badge to its baseline, which it shares with an empty inline block put next to it.
        const getBaselineOffsets = (page: Page) =>
            getComponent(page)
                .locator('kbq-badge')
                .evaluateAll((badges) =>
                    badges.map((badge) => {
                        const marker = document.createElement('span');

                        marker.style.display = 'inline-block';
                        badge.after(marker);

                        const offset = marker.getBoundingClientRect().top - badge.getBoundingClientRect().top;

                        marker.remove();

                        return offset;
                    })
                );

        // One font size puts the bottom of the text box at one distance from the baseline.
        const getTextBottoms = (line: Locator) =>
            line.locator('span, kbq-badge').evaluateAll((elements) =>
                elements.map((element) => {
                    const range = document.createRange();

                    range.selectNodeContents(element);

                    return range.getBoundingClientRect().bottom;
                })
            );

        test('puts the label on the baseline of the text next to it', async ({ page }) => {
            await page.goto('/E2eBadgeAlignment');
            await e2eWaitForFonts(page);

            for (const line of await getComponent(page).getByTestId('e2eBadgeLine').all()) {
                const [textBottom, ...labelBottoms] = await getTextBottoms(line);

                expect(labelBottoms).toEqual(labelBottoms.map(() => expect.closeTo(textBottom, 1)));
            }
        });

        test('keeps a line of body text at its height', async ({ page }) => {
            await page.goto('/E2eBadgeAlignment');
            await e2eWaitForFonts(page);

            const line = await getComponent(page).getByTestId('e2eBadgeBodyLine').boundingBox();

            expect(line?.height).toBe(20);
        });

        test('keeps the baseline in proportion to the badge under a fractional page zoom', async ({ page }) => {
            await page.goto('/E2eBadgeAlignment');
            await e2eWaitForFonts(page);

            const offsets = await getBaselineOffsets(page);

            for (const zoom of [0.8, 0.9, 1.1]) {
                await page.evaluate((value) => {
                    document.documentElement.style.zoom = `${value}`;
                }, zoom);

                const zoomedOffsets = await getBaselineOffsets(page);

                expect(zoomedOffsets).toEqual(offsets.map((offset) => expect.closeTo(offset * zoom, 1)));
            }
        });
    });

    test.describe('E2eBadgeAsyncIcon', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBadgeAsyncIcon');

        test('adds icon spacing when the icon is projected asynchronously', async ({ page }) => {
            await page.goto('/E2eBadgeAsyncIcon');
            const locator = getComponent(page);

            await locator.getByTestId('e2eShowIcon').click();

            const icon = locator.locator('[kbq-icon]');
            const marginLeft = await icon.evaluate((element) => parseFloat(getComputedStyle(element).marginLeft));

            expect(marginLeft).toBe(4);
        });
    });
});
