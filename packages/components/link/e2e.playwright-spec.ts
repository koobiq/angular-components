import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWaitForFonts } from 'packages/e2e/utils';

interface TrailingIconLayout {
    width: string;
    lines: number;
    iconWithLastWord: boolean;
}

/**
 * Lays the link out at its max-content width, then at widths where the last word still fits on the first
 * line but the icon after it does not, and reports how many lines the text takes and whether the icon shares
 * the line of the last word.
 */
const measureTrailingIcon = (item: Locator): Promise<TrailingIconLayout[]> =>
    item.evaluate((container) => {
        const text = container.querySelector('.kbq-link__text')!;
        const icon = text.nextElementSibling!;
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
                // Lines of the text node rather than boxes of the span: Chromium can report the span in two
                // boxes on one line, the text and the reserve after it
                lines: new Set(Array.from(allWords.getClientRects(), (rect) => Math.round(rect.top))).size,
                iconWithLastWord: iconMiddle >= word.top && iconMiddle <= word.bottom
            };
        };

        const unconstrained = layoutAt('max-content');
        const { left } = container.getBoundingClientRect();
        const wordEnd = lastWord.getBoundingClientRect().right - left;
        const iconEnd = icon.getBoundingClientRect().right - left;

        // A pixel inside the band where the icon used to wrap alone: the reserve still leaves the last half pixel
        // of it
        const squeezed = [wordEnd + 1, (wordEnd + iconEnd) / 2, iconEnd - 1].map((width) =>
            layoutAt(`${width.toFixed(2)}px`)
        );

        return [unconstrained, ...squeezed];
    });

test.describe('KbqLinkModule', () => {
    test.describe('E2eLinkStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLinkStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eLinkStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('e2eLinkWithCaption', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLinkWithCaption');

        test('states', async ({ page }) => {
            await page.goto('/E2eLinkWithCaption');
            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
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
