import { expect, type Locator, type Page, test } from '@playwright/test';
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

        test('should not become an inline-axis scroll container when collapsed', async ({ page }) => {
            await page.goto('/E2eClampedTextStates');
            const block = page.getByTestId('unbreakable_token');

            await expect(content(block)).toContainClass(collapsedClass);
            // The content is wider than the box, so a `visible` inline axis would have computed to
            // `auto` and handed the user a horizontal scrollbar.
            await expect
                .poll(() => content(block).evaluate((element) => getComputedStyle(element).overflowX))
                .toBe('hidden');
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
            // Read once: the page is unscrolled before the key too, so a poll would pass on its first sample.
            const scrollY = await page.evaluate(() => window.scrollY);

            expect(scrollY).toBe(0);
        });
    });

    test.describe('E2eClampedListOverflow', () => {
        const hiddenItems = (block: Locator) => block.locator('.kbq-overflow-item.kbq-overflow-item-hidden');
        const trigger = (block: Locator) => block.getByRole('button');

        test('recalculates in both directions and preserves expanded state', async ({ page }) => {
            await page.goto('/E2eClampedListOverflow');
            const block = page.getByTestId('overflow-horizontal');
            const hidden = block.locator('.kbq-overflow-item-hidden');
            const initialHidden = await hidden.count();

            await expect(hidden).not.toHaveCount(0);
            await page.getByTestId('widen').click();
            await expect(hidden).toHaveCount(0);

            await page.getByTestId('narrow').click();
            await expect(hidden).toHaveCount(initialHidden);

            await block.getByRole('button').click();
            await expect(hidden).toHaveCount(0);
            await page.getByTestId('replace-items').click();
            await expect(hidden).toHaveCount(0);
            await block.getByRole('button').click();
            await expect(hidden).toHaveCount(initialHidden);
        });

        test('recalculates vertically in both directions', async ({ page }) => {
            await page.goto('/E2eClampedListOverflow');
            const block = page.getByTestId('overflow-vertical');
            const hidden = hiddenItems(block);
            const initialHidden = await hidden.count();

            await expect(hidden).not.toHaveCount(0);
            await page.getByTestId('widen').click();
            await expect(hidden).toHaveCount(0);

            await page.getByTestId('narrow').click();
            await expect(hidden).toHaveCount(initialHidden);

            await trigger(block).click();
            await expect(hidden).toHaveCount(0);
            await page.getByTestId('widen').click();
            await expect(hidden).toHaveCount(0);
            await page.getByTestId('narrow').click();
            await expect(hidden).toHaveCount(0);
        });

        test('clamps wrapped rows to the container height', async ({ page }) => {
            await page.goto('/E2eClampedListOverflow');
            const block = page.getByTestId('overflow-wrap');

            await expect(hiddenItems(block)).not.toHaveCount(0);

            // max-height fits exactly two 24px rows: the rendered block must not grow past it, and
            // a recalculation bug that lets a third row leak in before hiding items shows up as a
            // third distinct item offset. (scrollHeight cannot be used: absolutely positioned hidden
            // items still count into it.)
            await expect
                .poll(() => block.evaluate((element) => Math.round(element.getBoundingClientRect().height)))
                .toBeLessThanOrEqual(48);

            const visibleRows = () =>
                block
                    .locator('.kbq-overflow-item:not(.kbq-overflow-item-hidden)')
                    .evaluateAll(
                        (elements) => new Set(elements.map((element) => element.getBoundingClientRect().top)).size
                    );

            await expect.poll(visibleRows).toBeLessThanOrEqual(2);
        });

        test('stabilizes an auto-width trigger when its counter crosses from 9 to 10', async ({ page }) => {
            await page.goto('/E2eClampedListOverflow');
            const block = page.getByTestId('overflow-auto-trigger');
            const hidden = hiddenItems(block);

            await expect(hidden).toHaveCount(9);
            await expect(trigger(block)).toHaveText('Show 9 more');
            const resultWidth = await trigger(block).evaluate((element) => element.getBoundingClientRect().width);

            // Ten 80px items and the one-digit label fit with 1px to spare; the two-digit label does not.
            // A result resize must therefore hide one more item instead of leaving physical overflow.
            await page.getByTestId('auto-width').fill(String(800 + resultWidth + 1));

            await expect(trigger(block)).toHaveText('Show 11 more');
            await expect(hidden).toHaveCount(11);
            await expect
                .poll(() =>
                    trigger(block).evaluate((element) => {
                        const host = (element.parentElement as HTMLElement).getBoundingClientRect();

                        return element.getBoundingClientRect().right - host.right;
                    })
                )
                .toBeLessThanOrEqual(0.5);
        });

        test('shows the hidden-item counter and disclosure semantics on the trigger', async ({ page }) => {
            await page.goto('/E2eClampedListOverflow');
            const block = page.getByTestId('overflow-horizontal');
            const initialHidden = await hiddenItems(block).count();

            await expect(trigger(block)).toHaveAttribute('aria-expanded', 'false');
            await expect(trigger(block)).toHaveText(`Show ${initialHidden} more`);

            await trigger(block).click();

            await expect(trigger(block)).toHaveAttribute('aria-expanded', 'true');
            await expect(trigger(block)).toHaveText('Collapse');
        });

        test('scrolls the collapsed list into view', async ({ page }) => {
            await page.goto('/E2eClampedListOverflow');
            const block = page.getByTestId('overflow-horizontal');
            const container = page.getByTestId('scroll-container');

            await container.evaluate((element) => (element.scrollTop = element.scrollHeight));
            const scrolledAway = await container.evaluate((element) => element.scrollTop);
            // Proves the poll below cannot pass on the scrolled-away state it starts from.
            const awayFromView = await block.evaluate(
                (element) =>
                    element.getBoundingClientRect().bottom <
                    (element.parentElement as HTMLElement).getBoundingClientRect().top
            );

            expect(scrolledAway).toBeGreaterThan(0);
            expect(awayFromView).toBe(true);

            await trigger(block).click();
            await expect(hiddenItems(block)).toHaveCount(0);
            await trigger(block).click();

            await expect
                .poll(async () => {
                    const box = (await container.boundingBox())!;
                    const listBox = (await block.boundingBox())!;

                    return listBox.y >= box.y && listBox.y + listBox.height <= box.y + box.height;
                })
                .toBe(true);
            expect(awayFromView).toBeTruthy();
        });

        test('applies collapsed and expanded visibility immediately under reduced motion', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.goto('/E2eClampedListOverflow');
            const block = page.getByTestId('overflow-horizontal');
            const container = page.getByTestId('scroll-container');
            const hiddenByStyle = block.locator('.kbq-overflow-item[style*="visibility: hidden"]');
            const initialHidden = await hiddenItems(block).count();

            await expect(hiddenItems(block)).not.toHaveCount(0);

            // No auto-retry on purpose: reduced motion must land the visibility inside the click itself,
            // not on the next change-detection pass. The class binding needs a detection pass, so the
            // assertion reads the inline style the visibility write sets synchronously.
            await trigger(block).click();
            // eslint-disable-next-line no-restricted-syntax, playwright/prefer-to-have-count -- a one-shot read is the assertion: retried expects would pass even when the change lands a tick later
            expect(await hiddenByStyle.count()).toBe(0);
            await expect(hiddenItems(block)).toHaveCount(0);

            await trigger(block).click();
            // eslint-disable-next-line no-restricted-syntax, playwright/prefer-to-have-count -- a one-shot read is the assertion: retried expects would pass even when the change lands a tick later
            expect(await hiddenByStyle.count()).toBe(initialHidden);
            await expect(hiddenItems(block)).toHaveCount(initialHidden);

            // The same collapse-scroll behavior holds with motion turned off.
            await container.evaluate((element) => (element.scrollTop = element.scrollHeight));
            await trigger(block).click();
            await expect(hiddenItems(block)).toHaveCount(0);
            await trigger(block).click();

            await expect
                .poll(async () => {
                    const box = (await container.boundingBox())!;
                    const listBox = (await block.boundingBox())!;

                    return listBox.y >= box.y && listBox.y + listBox.height <= box.y + box.height;
                })
                .toBe(true);
        });
    });
});
