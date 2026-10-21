import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWaitForFonts } from 'packages/e2e/utils';

interface TrailingIconLayout {
    width: string;
    lines: number;
    iconWithLastWord: boolean;
}

const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

/**
 * Lays the link out at its max-content width, then at widths where the last word still fits on the first
 * line but the icon after it does not, and reports how many lines the text takes and whether the icon shares
 * the line of the last word.
 */
const measureTrailingIcon = (item: Locator): Promise<TrailingIconLayout[]> =>
    item.evaluate((container) => {
        const text = container.querySelector('.kbq-link__text')!;
        const icon = container.querySelector('.kbq-link__trailing .kbq-icon')!;
        const node = text.firstChild as Text;
        const content = node.data.trimEnd();
        const allWords = document.createRange();
        const lastWord = document.createRange();

        allWords.selectNodeContents(node);
        lastWord.setStart(node, content.lastIndexOf(' ') + 1);
        lastWord.setEnd(node, content.length);

        const layoutAt = (width: string): TrailingIconLayout => {
            container.style.width = width;

            const word = lastWord.getBoundingClientRect();
            const { top, bottom } = icon.getBoundingClientRect();
            const iconMiddle = (top + bottom) / 2;

            return {
                width,
                lines: new Set(Array.from(allWords.getClientRects(), (rect) => Math.round(rect.top))).size,
                iconWithLastWord: iconMiddle >= word.top && iconMiddle <= word.bottom
            };
        };

        const unconstrained = layoutAt('max-content');
        const { left } = container.getBoundingClientRect();
        const wordEnd = lastWord.getBoundingClientRect().right - left;
        const iconEnd = icon.getBoundingClientRect().right - left;

        // The edges and the middle of the band where an icon outside the trailing part would wrap alone
        const squeezed = [wordEnd + 1, (wordEnd + iconEnd) / 2, iconEnd - 0.5].map((width) =>
            layoutAt(`${width.toFixed(2)}px`)
        );

        return [unconstrained, ...squeezed];
    });

/**
 * Counts the pixel rows between the first and the last line of every wrapped link where the pointer would
 * leave the link: a row is checked inside the narrowest line, so that it can only hit the gap between lines.
 */
const countRowsOffTheLink = (target: Locator): Promise<number[]> =>
    target.evaluate((root) =>
        Array.from(root.querySelectorAll<HTMLElement>('.kbq-link'), (link) => {
            const lines = Array.from(link.querySelector('.kbq-link__text')!.getClientRects());
            const left = Math.max(...lines.map((line) => line.left));
            const right = Math.min(...lines.map((line) => line.right));
            const x = (left + right) / 2;
            let off = 0;

            for (let y = Math.ceil(lines[0].top); y < lines[lines.length - 1].bottom; y++) {
                const hit = document.elementFromPoint(x, y);

                if (!hit || !link.contains(hit)) off++;
            }

            return off;
        })
    );

test.describe('KbqLink', () => {
    test.describe('E2eLinkStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLinkStates');

        test('states of every kind of link', async ({ page }) => {
            await page.goto('/E2eLinkStates');
            await e2eWaitForFonts(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eLinkSize', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLinkSize');

        test('icons and external link in every size', async ({ page }) => {
            await page.goto('/E2eLinkSize');
            await e2eWaitForFonts(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('02-size.png');
        });
    });

    test.describe('E2eLinkMultiline', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLinkMultiline');

        test('wrapped links', async ({ page }) => {
            await page.goto('/E2eLinkMultiline');
            await e2eWaitForFonts(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('03-multiline.png');
        });

        test('keeps the pointer on the link between its lines', async ({ page }) => {
            await page.goto('/E2eLinkMultiline');
            await e2eWaitForFonts(page);

            const rows = await countRowsOffTheLink(getScreenshotTarget(getComponent(page)));

            expect(rows.length).toBeGreaterThan(0);
            expect(rows.every((off) => off === 0)).toBe(true);
        });
    });

    test.describe('E2eLinkPrint', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLinkPrint');

        test('printed page', async ({ page }) => {
            await page.goto('/E2eLinkPrint');
            await e2eWaitForFonts(page);
            await page.emulateMedia({ media: 'print' });
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('04-print.png');
        });
    });

    test.describe('E2eLinkRtl', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLinkRtl');

        test('content in a right-to-left text', async ({ page }) => {
            await page.goto('/E2eLinkRtl');
            await e2eWaitForFonts(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('05-rtl.png');
        });
    });

    test.describe('E2eLinkIcons', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLinkIcons');

        test('icons in every state', async ({ page }) => {
            await page.goto('/E2eLinkIcons');
            await e2eWaitForFonts(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('06-icons.png');
        });
    });

    test.describe('E2eLinkCustomContent', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLinkCustomContent');

        test('punctuation and a caption after the text', async ({ page }) => {
            await page.goto('/E2eLinkCustomContent');
            await e2eWaitForFonts(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('07-content.png');
        });
    });

    test.describe('E2eLinkCaptionWrap', () => {
        test('wraps a caption in a suffix inside its container', async ({ page }) => {
            await page.goto('/E2eLinkCaptionWrap');
            await e2eWaitForFonts(page);

            const container = page.getByTestId('e2eLinkCaptionWrap');
            const caption = container.locator('.kbq-link__suffix');
            const [containerBox, captionBox, lineHeight] = await Promise.all([
                container.boundingBox(),
                caption.boundingBox(),
                caption.evaluate((element) => parseFloat(getComputedStyle(element).lineHeight))
            ]);

            expect(captionBox!.width).toBeLessThanOrEqual(containerBox!.width);
            expect(captionBox!.height).toBeGreaterThan(lineHeight);
        });
    });

    test.describe('E2eLinkTrailingIconWrap', () => {
        const getItems = (page: Page) =>
            page.getByTestId('e2eLinkTrailingIconWrap').getByTestId('e2eLinkTrailingIconWrapItem');

        test('wraps a trailing icon together with the last word', async ({ page }) => {
            await page.goto('/E2eLinkTrailingIconWrap');
            await e2eWaitForFonts(page);

            for (const item of await getItems(page).all()) {
                const link = String(await item.locator('.kbq-link').getAttribute('class'));
                const [unconstrained, ...squeezed] = await measureTrailingIcon(item);

                expect(unconstrained, link).toEqual({ width: 'max-content', lines: 1, iconWithLastWord: true });

                for (const layout of squeezed) {
                    expect(layout, link).toMatchObject({ lines: 2, iconWithLastWord: true });
                }
            }
        });
    });
});
