import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eExpectNoScrollbarAfterFlash, e2eWaitForSettledScrollbars } from '../../e2e/utils';

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

        test('should not grow the visible box beyond maxRows height', async ({ page }) => {
            await page.goto('/E2eTextareaGrowMaxRows');
            const textarea = getTextarea(page);
            // The cap lives on the form field's scrollport, not on the element: a `<textarea>` cannot
            // host the custom scrollbar's track, so `KbqTextarea` keeps it as tall as its text and the
            // scrollport is what stops growing and starts scrolling.
            const scrollport = page.locator('.kbq-form-field__infix:has([data-testid="grow-max-rows_textarea"])');

            await pasteFromClipboard(page, textarea, 'line1\nline2\nline3\nline4\nline5');
            const atMaxRowsHeight = await getHeight(scrollport);

            await pasteFromClipboard(
                page,
                textarea,
                'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10'
            );

            expect(await getHeight(scrollport)).toBe(atMaxRowsHeight);
            // The element itself keeps growing — otherwise the extra lines would be clipped rather than
            // scrolled to.
            expect(await getHeight(textarea)).toBeGreaterThan(atMaxRowsHeight);
            expect(await scrollport.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
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
    test.describe('E2eTextareaScrollbar', () => {
        const getViewport = (page: Page, testId: string) => page.getByTestId(testId).locator('.kbq-form-field__infix');
        const getTrack = (page: Page, testId: string) => getViewport(page, testId).locator('kbq-scrollbar-track');

        test.beforeEach(async ({ page }) => page.goto('/E2eTextareaScrollbar'));

        test('shows the scrollbar while the pointer is over an overflowing textarea', async ({ page }) => {
            const viewport = getViewport(page, 'e2eTextareaScrollbarOverflowing');
            const track = getTrack(page, 'e2eTextareaScrollbarOverflowing');

            // Both fields build a track; the reveal from the initial flash has to pass before hover can
            // be told apart from it.
            await e2eWaitForSettledScrollbars(page, 2);
            await expect(track).toHaveCSS('opacity', '0');

            await viewport.hover();

            await expect(track).toHaveCSS('opacity', '1');
            await expect(track.locator('.kbq-scrollbar-track__thumb')).toBeVisible();
        });

        test('shows nothing while the pointer is over a textarea whose text fits', async ({ page }) => {
            const viewport = getViewport(page, 'e2eTextareaScrollbarFitting');
            const track = getTrack(page, 'e2eTextareaScrollbarFitting');

            // The overflowing field shares this page's frame loop, so its bars appearing prove the
            // track has computed its visibility at least once — without that, an empty track would pass
            // here on the pre-computation window rather than on the behaviour.
            await expect(
                getTrack(page, 'e2eTextareaScrollbarOverflowing').locator('.kbq-scrollbar-track__bar')
            ).not.toHaveCount(0);

            await viewport.hover();

            await expect(track).toHaveCSS('opacity', '1');
            await expect(track.locator('.kbq-scrollbar-track__bar')).toHaveCount(0);
        });
    });

    test.describe('E2eTextareaScrollbarFlash', () => {
        const getViewport = (page: Page, testId: string) => page.getByTestId(testId).locator('.kbq-form-field__infix');

        test.beforeEach(async ({ page }) => page.goto('/E2eTextareaScrollbarFlash'));

        test('reveals the scrollbar once the text is laid out, without the pointer going near it', async ({ page }) => {
            const track = getViewport(page, 'e2eTextareaFlashOverflowing').locator('kbq-scrollbar-track');

            await expect(track).toHaveClass(/kbq-scrollbar-track_revealed/);
            await expect(track.locator('.kbq-scrollbar-track__bar')).not.toHaveCount(0);
        });

        test('reveals nothing for a textarea whose text fits', async ({ page }) => {
            await expect(
                getViewport(page, 'e2eTextareaFlashOverflowing').locator('.kbq-scrollbar-track__bar')
            ).not.toHaveCount(0);

            await e2eExpectNoScrollbarAfterFlash(getViewport(page, 'e2eTextareaFlashFitting'));
        });
    });
});
