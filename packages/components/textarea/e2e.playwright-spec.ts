import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

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

            const box = await getTextarea(page).boundingBox();

            expect(box).not.toBeNull();
            expect(box!.height).toBeGreaterThan(50);
        });

        test('should grow when content gets longer', async ({ page }) => {
            await page.goto('/E2eTextareaGrowBehavior');
            const textarea = getTextarea(page);

            await page.getByTestId('grow_set_short').click();
            const shortBox = await textarea.boundingBox();

            await page.getByTestId('grow_set_long').click();
            const longBox = await textarea.boundingBox();

            expect(longBox!.height).toBeGreaterThan(shortBox!.height);
        });

        test('should shrink when content gets shorter', async ({ page }) => {
            await page.goto('/E2eTextareaGrowBehavior');
            const textarea = getTextarea(page);

            await page.getByTestId('grow_set_long').click();
            const longBox = await textarea.boundingBox();

            await page.getByTestId('grow_set_short').click();
            const shortBox = await textarea.boundingBox();

            expect(shortBox!.height).toBeLessThan(longBox!.height);
        });
    });

    test.describe('E2eTextareaScrollOnFocus', () => {
        test('should not scroll the page when focus is moved to a textarea outside the viewport', async ({ page }) => {
            await page.goto('/E2eTextareaScrollOnFocus');
            const textarea = page.getByTestId('scroll_textarea');

            const targetY = await page.evaluate(() => document.body.scrollHeight - window.innerHeight - 100);

            await page.evaluate((y) => window.scrollTo(0, y), targetY);
            const scrollYBefore = await page.evaluate(() => window.scrollY);

            await textarea.evaluate((el: HTMLTextAreaElement) => el.focus({ preventScroll: true }));

            const scrollYAfter = await page.evaluate(() => window.scrollY);

            expect(scrollYAfter).toBe(scrollYBefore);

            const textareaScrollTop = await textarea.evaluate((el: HTMLTextAreaElement) => el.scrollTop);

            expect(textareaScrollTop).toBe(0);
        });
    });
});
