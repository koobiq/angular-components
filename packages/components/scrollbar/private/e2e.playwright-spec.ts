import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqScrollbar (private)', () => {
    test.describe('E2ePrivateScrollbarStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2ePrivateScrollbarStateAndStyle');

        test('states', async ({ page }) => {
            await page.goto('/E2ePrivateScrollbarStateAndStyle');
            const component = getComponent(page);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2ePrivateScrollbarDrag', () => {
        // `KbqScrollbar` moves the host's content into an auto-created
        // `.kbq-private-scrollbar-viewport` wrapper so the track/thumb (siblings on the host) stay
        // a fixed overlay — real scroll metrics belong on that wrapper, not the host itself.
        const getViewport = (container: Locator) => container.locator('.kbq-private-scrollbar-viewport');

        test('dragging the vertical thumb scrolls the content down', async ({ page }) => {
            await page.goto('/E2ePrivateScrollbarDrag');
            const container = page.getByTestId('drag');
            const viewport = getViewport(container);
            const thumb = container.locator('.kbq-private-scrollbar-track_vertical .kbq-private-scrollbar-thumb');

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(0);

            const box = await thumb.boundingBox();

            if (!box) throw new Error('bounding box is null');

            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 40, { steps: 5 });
            await page.mouse.up();

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        });

        test('clicking the track away from the thumb jumps the scroll position toward the click', async ({ page }) => {
            await page.goto('/E2ePrivateScrollbarDrag');
            const container = page.getByTestId('drag');
            const viewport = getViewport(container);
            const track = container.locator('.kbq-private-scrollbar-track_vertical');

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(0);

            const box = await track.boundingBox();

            if (!box) throw new Error('bounding box is null');

            // The thumb starts at the track's top — clicking near the bottom lands on the track
            // itself, not the thumb, triggering "jump to click" rather than a drag.
            await page.mouse.click(box.x + box.width / 2, box.y + box.height - 5);

            await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        });

        test('kbqScrollbarDisableInteraction blocks a real thumb drag', async ({ page }) => {
            await page.goto('/E2ePrivateScrollbarDrag');
            const container = page.getByTestId('drag-disabled');
            const viewport = getViewport(container);
            const thumb = container.locator('.kbq-private-scrollbar-track_vertical .kbq-private-scrollbar-thumb');

            const box = await thumb.boundingBox();

            if (!box) throw new Error('bounding box is null');

            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 40, { steps: 5 });
            await page.mouse.up();

            expect(await viewport.evaluate((el) => el.scrollTop)).toBe(0);
        });
    });

    test.describe('E2ePrivateScrollbarScrollTo', () => {
        test('scrollToBottom/scrollToTop buttons scroll the content and update their own disabled state via isBottomReached/isTopReached', async ({
            page
        }) => {
            await page.goto('/E2ePrivateScrollbarScrollTo');
            const scrollTopButton = page.getByTestId('scroll-top');
            const scrollBottomButton = page.getByTestId('scroll-bottom');

            await expect(scrollTopButton).toBeDisabled();
            await expect(scrollBottomButton).toBeEnabled();

            await scrollBottomButton.click();

            await expect(scrollTopButton).toBeEnabled();
            await expect(scrollBottomButton).toBeDisabled();

            await scrollTopButton.click();

            await expect(scrollTopButton).toBeDisabled();
            await expect(scrollBottomButton).toBeEnabled();
        });
    });

    test.describe('E2ePrivateScrollbarHoverVisibility', () => {
        test("'hover' mode (the default) reveals the custom track on real mouse hover and hides it again on mouse leave", async ({
            page
        }) => {
            await page.goto('/E2ePrivateScrollbarHoverVisibility');
            const container = page.getByTestId('hover-visibility');
            const visibleClass = /(?:^|\s)kbq-private-scrollbar_visible(?:\s|$)/;

            await expect(container).not.toHaveClass(visibleClass);

            await container.hover();
            await expect(container).toHaveClass(visibleClass);

            await page.mouse.move(0, 0);
            await expect(container).not.toHaveClass(visibleClass);
        });
    });
});
