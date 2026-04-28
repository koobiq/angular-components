import { expect, Locator, Page, test } from '@playwright/test';

const visibleItems = (block: Locator) => block.locator('.kbq-overflow-item:not(.kbq-overflow-item-hidden)');
const hiddenItems = (block: Locator) => block.locator('.kbq-overflow-item.kbq-overflow-item-hidden');
const result = (block: Locator) => block.locator('.kbq-overflow-items-result');

const blockOnPage = (page: Page, route: string, testid: string) => {
    return {
        navigate: () => page.goto(route),
        block: page.getByTestId(testid)
    };
};

const horizontal = (page: Page, testid: string) => blockOnPage(page, '/E2eOverflowItemsHorizontal', testid);
const vertical = (page: Page, testid: string) => blockOnPage(page, '/E2eOverflowItemsVertical', testid);
const ordered = (page: Page, testid: string) => blockOnPage(page, '/E2eOverflowItemsOrdered', testid);

test.describe('KbqOverflowItems', () => {
    test('should hide overflown items', async ({ page }) => {
        // hidden = 20 - floor((500 - 100) / 50) = 12
        const { navigate, block } = horizontal(page, 'overflowItems_default');

        await navigate();

        await expect(hiddenItems(block)).toHaveCount(12);
    });

    test('should hide overflown items with container padding', async ({ page }) => {
        // hidden = 20 - floor((500 - 50 - 100) / 50) = 13 (50px total horizontal padding)
        const { navigate, block } = horizontal(page, 'overflowItems_padding');

        await navigate();

        await expect(hiddenItems(block)).toHaveCount(13);
    });

    test('should hide overflown items with right margin', async ({ page }) => {
        // hidden = 20 - floor((500 - 100) / (50 + 10)) = 14
        const { navigate, block } = horizontal(page, 'overflowItems_marginRight');

        await navigate();

        await expect(hiddenItems(block)).toHaveCount(14);
    });

    test.describe('wrap', () => {
        test('should render all items if fit in cross axis', async ({ page }) => {
            const { navigate, block } = horizontal(page, 'overflowItems_wrapFit');

            await navigate();

            await expect(hiddenItems(block)).toHaveCount(0);
        });

        test('should hide items if not fit in cross axis', async ({ page }) => {
            // hidden = ceil(resultHeight / itemSize) + ceil((itemsCount * marginRight) / itemSize)
            const { navigate, block } = horizontal(page, 'overflowItems_wrapNotFit');

            await navigate();

            await expect(hiddenItems(block)).toHaveCount(6);
        });
    });

    test('should hide overflown items (vertical orientation)', async ({ page }) => {
        // hidden = 20 - floor((500 - 50) / 50) = 11
        const { navigate, block } = vertical(page, 'overflowItemsVertical_default');

        await navigate();

        await expect(hiddenItems(block)).toHaveCount(11);
    });

    test('should hide overflown items with container padding (vertical orientation)', async ({ page }) => {
        // hidden = 20 - floor((500 - 50 - 50) / 50) = 12 (50px total vertical padding)
        const { navigate, block } = vertical(page, 'overflowItemsVertical_padding');

        await navigate();

        await expect(hiddenItems(block)).toHaveCount(12);
    });

    test('should hide overflown items with bottom margin (vertical orientation)', async ({ page }) => {
        // hidden = 20 - floor((500 - 50) / (50 + 10)) = 13
        const { navigate, block } = vertical(page, 'overflowItemsVertical_marginBottom');

        await navigate();

        await expect(hiddenItems(block)).toHaveCount(13);
    });

    test.describe('wrap (vertical orientation)', () => {
        test('should render all items if fit in cross axis', async ({ page }) => {
            const { navigate, block } = vertical(page, 'overflowItemsVertical_wrapFit');

            await navigate();

            await expect(hiddenItems(block)).toHaveCount(0);
        });

        test('should hide items if not fit in cross axis', async ({ page }) => {
            // hidden = ceil(resultHeight / itemSize) + ceil((itemsCount * marginBottom) / itemSize)
            const { navigate, block } = vertical(page, 'overflowItemsVertical_wrapNotFit');

            await navigate();

            await expect(hiddenItems(block)).toHaveCount(5);
        });
    });

    test('should hide overflown items with justify-content end', async ({ page }) => {
        // hidden = 20 - floor((500 - 100) / 50) = 12
        const { navigate, block } = horizontal(page, 'overflowItems_justifyEnd');

        await navigate();

        await expect(hiddenItems(block)).toHaveCount(12);
    });

    test('should recalculate hidden items on container width change', async ({ page }) => {
        // hidden = 20 - floor((600 - 100) / 50) = 10
        const { navigate, block } = horizontal(page, 'overflowItems_widthChanged');

        await navigate();

        await expect(hiddenItems(block)).toHaveCount(10);
    });

    test('should recalculate hidden items on container width change (vertical orientation)', async ({ page }) => {
        // hidden = 20 - floor((600 - 50) / 50) = 9
        const { navigate, block } = vertical(page, 'overflowItemsVertical_heightChanged');

        await navigate();

        await expect(hiddenItems(block)).toHaveCount(9);
    });

    test('should recalculate hidden items on container width change with justify-content end', async ({ page }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_widthChangedJustifyEnd');

        await navigate();

        await expect(hiddenItems(block)).toHaveCount(10);
    });

    test('should recalculate hidden items on `reverseOverflowOrder` attribute change', async ({ page }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_reverseOrder');

        await navigate();

        await expect(visibleItems(block).last()).toHaveText('Item19');
    });

    test('should recalculate hidden items on `reverseOverflowOrder` attribute change (vertical orientation)', async ({
        page
    }) => {
        // Karma version had a copy-paste bug — used the horizontal fixture. Fixed here to use the vertical one.
        const { navigate, block } = vertical(page, 'overflowItemsVertical_reverseOrder');

        await navigate();

        await expect(visibleItems(block).last()).toHaveText('Item19');
    });

    test('should recalculate hidden items on `reverseOverflowOrder` attribute change with justify-content end', async ({
        page
    }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_reverseOrderJustifyEnd');

        await navigate();

        await expect(visibleItems(block).last()).toHaveText('Item19');
    });

    test('should display result', async ({ page }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_default');

        await navigate();

        await expect(result(block)).not.toHaveClass(/(?:^|\s)kbq-overflow-item-hidden(?:\s|$)/);
    });

    test('should display result (vertical orientation)', async ({ page }) => {
        const { navigate, block } = vertical(page, 'overflowItemsVertical_default');

        await navigate();

        await expect(result(block)).not.toHaveClass(/(?:^|\s)kbq-overflow-item-hidden(?:\s|$)/);
    });

    test('should hide result', async ({ page }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_resultHidden');

        await navigate();

        await expect(result(block)).toHaveClass(/(?:^|\s)kbq-overflow-item-hidden(?:\s|$)/);
    });

    test('should hide result with justify-content end', async ({ page }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_resultHiddenJustifyEnd');

        await navigate();

        await expect(result(block)).toHaveClass(/(?:^|\s)kbq-overflow-item-hidden(?:\s|$)/);
    });

    test('should display result score', async ({ page }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_default');

        await navigate();

        await expect(result(block)).toHaveText('and 12 more');
    });

    test('should display result score with justify-content end', async ({ page }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_justifyEnd');

        await navigate();

        await expect(result(block)).toHaveText('and 12 more');
    });

    test('should hide items by order', async ({ page }) => {
        const { navigate, block } = ordered(page, 'overflowItemsOrdered_byOrder');

        await navigate();

        await expect(visibleItems(block)).toHaveCount(2);
        await expect(visibleItems(block).nth(1)).toHaveText('Item5');
    });

    test('should hide items by order when reverseOverflowOrder is enabled', async ({ page }) => {
        const { navigate, block } = ordered(page, 'overflowItemsOrdered_byOrderReverse');

        await navigate();

        await expect(visibleItems(block)).toHaveCount(2);
        await expect(visibleItems(block).first()).toHaveText('Item5');
    });

    test('should hide last ordered item when no space is available', async ({ page }) => {
        const { navigate, block } = ordered(page, 'overflowItemsOrdered_noSpace');

        await navigate();

        await expect(visibleItems(block)).toHaveCount(0);
    });

    test('should prevent hiding item with alwaysVisible attribute', async ({ page }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_alwaysVisible');

        await navigate();

        await expect(visibleItems(block)).toHaveCount(3);
        await expect(visibleItems(block).last()).toHaveText('Item7');
    });

    test('should prevent hiding item with alwaysVisible attribute (vertical orientation)', async ({ page }) => {
        const { navigate, block } = vertical(page, 'overflowItemsVertical_alwaysVisible');

        await navigate();

        await expect(visibleItems(block)).toHaveCount(3);
        await expect(visibleItems(block).last()).toHaveText('Item7');
    });

    test('should prevent hiding item with alwaysVisible when no space is available', async ({ page }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_alwaysVisibleNoSpace');

        await navigate();

        await expect(visibleItems(block)).toHaveCount(1);
        await expect(visibleItems(block).first()).toHaveText('Item7');
    });

    test('should prevent hiding item with alwaysVisible attribute when reverseOverflowOrder is enabled', async ({
        page
    }) => {
        const { navigate, block } = horizontal(page, 'overflowItems_alwaysVisibleReverse');

        await navigate();

        await expect(visibleItems(block)).toHaveCount(2);
        await expect(visibleItems(block).first()).toHaveText('Item7');
    });
});
