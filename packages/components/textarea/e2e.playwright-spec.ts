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

// The height is set by `grow()`, a task or more after the value changes, so a read straight after a paste can
// still return the height of the previous text.
const pasteAndMeasure = async (page: Page, textarea: Locator, text: string): Promise<number> => {
    const before = await getHeight(textarea);

    await pasteFromClipboard(page, textarea, text);
    await expect.poll(() => getHeight(textarea)).not.toBe(before);

    return getHeight(textarea);
};

// The initial value overflows the two rows of a bare textarea until `grow()` has measured it.
const expectInitialValueGrown = (textarea: Locator) =>
    expect
        .poll(() =>
            textarea.evaluate((el: HTMLTextAreaElement) => el.value !== '' && el.scrollHeight <= el.clientHeight)
        )
        .toBe(true);

const MAX_ROW_LIMIT_REACHED = 'kbq-textarea_max-row-limit-reached';

test.describe('KbqTextareaModule', () => {
    test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

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

            await expect.poll(() => getHeight(getTextarea(page))).toBeGreaterThan(50);
        });

        test('should grow when content gets longer', async ({ page }) => {
            await page.goto('/E2eTextareaGrowBehavior');
            const textarea = getTextarea(page);

            await expectInitialValueGrown(textarea);
            const shortHeight = await pasteAndMeasure(page, textarea, 'test\ntest');
            const longHeight = await pasteAndMeasure(page, textarea, 'test\ntest\ntest\ntest\ntest\ntest');

            expect(longHeight).toBeGreaterThan(shortHeight);
        });

        test('should shrink when content gets shorter', async ({ page }) => {
            await page.goto('/E2eTextareaGrowBehavior');
            const textarea = getTextarea(page);

            await expectInitialValueGrown(textarea);
            const longHeight = await pasteAndMeasure(page, textarea, 'test\ntest\ntest\ntest\ntest\ntest');
            const shortHeight = await pasteAndMeasure(page, textarea, 'test\ntest');

            expect(shortHeight).toBeLessThan(longHeight);
        });
    });

    test.describe('E2eTextareaGrowMaxRows', () => {
        const getTextarea = (page: Page): Locator => page.getByTestId('grow-max-rows_textarea');

        test('should grow initially when ngModel has multiple lines', async ({ page }) => {
            await page.goto('/E2eTextareaGrowMaxRows');

            await expect.poll(() => getHeight(getTextarea(page))).toBeGreaterThan(50);
        });

        test('should grow to maxRows height when pasting text exceeding maxRows', async ({ page }) => {
            await page.goto('/E2eTextareaGrowMaxRows');
            const textarea = getTextarea(page);

            await expectInitialValueGrown(textarea);
            const shortHeight = await getHeight(textarea);

            await pasteFromClipboard(
                page,
                textarea,
                'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10'
            );
            await expect(textarea).toContainClass(MAX_ROW_LIMIT_REACHED);
            await expect.poll(() => getHeight(textarea)).toBeGreaterThan(shortHeight);
        });

        test('should not grow beyond maxRows height', async ({ page }) => {
            await page.goto('/E2eTextareaGrowMaxRows');
            const textarea = getTextarea(page);

            await pasteFromClipboard(page, textarea, 'line1\nline2\nline3\nline4\nline5');
            await expect(textarea).toContainClass(MAX_ROW_LIMIT_REACHED);
            const atMaxRowsHeight = await getHeight(textarea);

            // Below the limit and back: the class returning is what proves the longer text has been measured, since
            // the height it is expected to keep is the one it already has.
            await pasteFromClipboard(page, textarea, 'line1\nline2\nline3');
            await expect(textarea).not.toContainClass(MAX_ROW_LIMIT_REACHED);

            await pasteFromClipboard(
                page,
                textarea,
                'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10'
            );
            await expect(textarea).toContainClass(MAX_ROW_LIMIT_REACHED);
            await expect.poll(() => getHeight(textarea)).toBe(atMaxRowsHeight);
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

            // Sampled two frames later, once whatever the component does in response to the focus has rendered.
            const scrollPositions = () =>
                textarea.evaluate(
                    (el: HTMLTextAreaElement) =>
                        new Promise<{ page: number; textarea: number }>((resolve) =>
                            requestAnimationFrame(() =>
                                requestAnimationFrame(() => resolve({ page: window.scrollY, textarea: el.scrollTop }))
                            )
                        )
                );

            await expect.poll(scrollPositions).toEqual({ page: scrollYBefore, textarea: 0 });
        });
    });
});
