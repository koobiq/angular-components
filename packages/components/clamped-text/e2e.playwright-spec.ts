import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqClampedText', () => {
    test.describe('E2eClampedTextStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eClampedTextStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eClampedTextTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eClampedTextStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eClampedTextStates', () => {
        const collapsedClass = 'kbq-clamped-text__content_collapsed';
        const content = (block: Locator) => block.locator('.kbq-clamped-text__content');
        const toggle = (block: Locator) => block.locator('.kbq-clamped-text__toggle');

        test('should auto-collapse when rendered rows exceed rows + 1', async ({ page }) => {
            await page.goto('/E2eClampedTextStates');
            const block = page.getByTestId('auto_collapsed');

            await expect(toggle(block)).toBeVisible();
            await expect(content(block)).toContainClass(collapsedClass);
        });

        test('should preserve expanded state when container widens', async ({ page }) => {
            await page.goto('/E2eClampedTextStates');
            const block = page.getByTestId('resize_persistence');

            await expect(content(block)).toContainClass(collapsedClass);

            await toggle(block).click();
            await expect(content(block)).not.toContainClass(collapsedClass);

            await page.getByTestId('resize_persistence_widen').click();
            await expect(content(block)).not.toContainClass(collapsedClass);
        });

        test('should drop the clamp when expanded', async ({ page }) => {
            await page.goto('/E2eClampedTextStates');
            const block = page.getByTestId('resize_persistence');

            await expect(content(block)).toContainClass(collapsedClass);
            await expect
                .poll(() => content(block).evaluate((element) => element.scrollHeight > element.clientHeight))
                .toBe(true);

            await toggle(block).click();

            await expect
                .poll(() => content(block).evaluate((element) => element.scrollHeight - element.clientHeight))
                .toBe(0);
        });

        test('should not scroll horizontally when collapsed content cannot wrap', async ({ page }) => {
            await page.goto('/E2eClampedTextStates');
            const block = page.getByTestId('unbreakable_token');

            await expect(content(block)).toContainClass(collapsedClass);
            await expect
                .poll(() => content(block).evaluate((element) => element.scrollWidth - element.clientWidth))
                .toBe(0);
        });
    });

    test.describe('E2eClampedList', () => {
        test('states', async ({ page }) => {
            await page.goto('/E2eClampedList');

            await expect(page.getByTestId('e2eClampedList')).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(page.getByTestId('e2eClampedList')).toHaveScreenshot('02-dark.png');
        });

        test('should not borrow the clamped-text toggle spacing', async ({ page }) => {
            await page.goto('/E2eClampedList');
            const trigger = page.getByTestId('e2eClampedListTrigger');

            await expect(trigger).toBeVisible();
            await expect.poll(() => trigger.evaluate((element) => getComputedStyle(element).marginTop)).toBe('0px');
        });

        test('should expose disclosure semantics on the trigger', async ({ page }) => {
            await page.goto('/E2eClampedList');
            const trigger = page.getByTestId('e2eClampedListTrigger');

            await expect(trigger).toHaveRole('button');
            await expect(trigger).toHaveAttribute('aria-expanded', 'false');

            await trigger.press('Space');

            await expect(trigger).toHaveAttribute('aria-expanded', 'true');
            expect(await page.evaluate(() => window.scrollY)).toBe(0);
        });
    });
});
