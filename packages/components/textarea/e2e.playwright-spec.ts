import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

const getHeight = async (locator: Locator): Promise<number> => {
    await expect(locator).toBeVisible();
    const box = await locator.boundingBox();

    expect(box).not.toBeNull();

    return box!.height;
};

const pasteFromClipboard = async (page: Page, textarea: Locator, text: string) => {
    await page.evaluate((t) => navigator.clipboard.writeText(t), text);
    await textarea.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('ControlOrMeta+v');
};

test.describe('KbqTextareaModule', () => {
    test.describe('E2eTextareaStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTextareaStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTextareaStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTextareaGrowBehavior', () => {
        const getTextarea = (page: Page): Locator => page.getByTestId('grow_textarea');

        test('should grow initially when ngModel has multiple lines', async ({ page }) => {
            await page.goto('/E2eTextareaGrowBehavior');

            expect(await getHeight(getTextarea(page))).toBeGreaterThan(50);
        });

        test('should grow when content gets longer', async ({ page }) => {
            await page.goto('/E2eTextareaGrowBehavior');
            const textarea = getTextarea(page);

            await pasteFromClipboard(page, textarea, 'test\ntest');
            const shortHeight = await getHeight(textarea);

            await pasteFromClipboard(page, textarea, 'test\ntest\ntest\ntest\ntest\ntest');
            const longHeight = await getHeight(textarea);

            expect(longHeight).toBeGreaterThan(shortHeight);
        });

        test('should shrink when content gets shorter', async ({ page }) => {
            await page.goto('/E2eTextareaGrowBehavior');
            const textarea = getTextarea(page);

            await pasteFromClipboard(page, textarea, 'test\ntest\ntest\ntest\ntest\ntest');
            const longHeight = await getHeight(textarea);

            await pasteFromClipboard(page, textarea, 'test\ntest');
            const shortHeight = await getHeight(textarea);

            expect(shortHeight).toBeLessThan(longHeight);
        });
    });

    test.describe('E2eTextareaGrowMaxRows', () => {
        const getTextarea = (page: Page): Locator => page.getByTestId('grow-max-rows_textarea');

        test('should grow initially when ngModel has multiple lines', async ({ page }) => {
            await page.goto('/E2eTextareaGrowMaxRows');

            expect(await getHeight(getTextarea(page))).toBeGreaterThan(50);
        });

        test('should grow to maxRows height when pasting text exceeding maxRows', async ({ page }) => {
            await page.goto('/E2eTextareaGrowMaxRows');
            const textarea = getTextarea(page);
            const shortHeight = await getHeight(textarea);

            await pasteFromClipboard(
                page,
                textarea,
                'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10'
            );
            expect(await getHeight(textarea)).toBeGreaterThan(shortHeight);
        });

        test('should not grow beyond maxRows height', async ({ page }) => {
            await page.goto('/E2eTextareaGrowMaxRows');
            const textarea = getTextarea(page);

            await pasteFromClipboard(page, textarea, 'line1\nline2\nline3\nline4\nline5');
            const atMaxRowsHeight = await getHeight(textarea);

            await pasteFromClipboard(
                page,
                textarea,
                'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10'
            );
            expect(await getHeight(textarea)).toBe(atMaxRowsHeight);
        });
    });

    test.describe('E2eTextareaScrollOnFocus', () => {
        test('should not scroll the page when focusing a kbqTextarea', async ({ page }) => {
            await page.goto('/E2eTextareaScrollOnFocus');
            const textarea = page.getByTestId('scroll_textarea');

            // Bring the textarea into view first — natural focus on an off-screen
            // element legitimately scrolls via the browser's scroll-to-element behavior.
            // The assertions below target component-induced scroll, not that.
            await textarea.scrollIntoViewIfNeeded();
            await expect(textarea).toBeVisible();

            const scrollYBefore = await page.evaluate(() => window.scrollY);

            // Trigger focus the way a user does.
            await textarea.click();
            await expect(textarea).toBeFocused();

            expect(await page.evaluate(() => window.scrollY)).toBe(scrollYBefore);

            const textareaScrollTop = await textarea.evaluate((el: HTMLTextAreaElement) => el.scrollTop);

            expect(textareaScrollTop).toBe(0);
        });
    });
});
