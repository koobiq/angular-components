import { expect, Locator, Page, test } from '@playwright/test';
import { e2eReadOptionFocusOptions, e2eRecordOptionFocusOptions } from '../../e2e/utils';

/* -------------------------------------------------------------------------- */
/*  WebKit-only regression guard for panel scrolling (DS-3299).               */
/*                                                                            */
/*  The panel used to scroll its active option into view by relying on the    */
/*  scroll that `HTMLElement.focus()` performs implicitly. Blink runs that    */
/*  scroll synchronously, but WebKit defers it to a later rendering update —  */
/*  where it lands after, and undoes, whatever the reader scrolled in the     */
/*  meantime. With hover re-activating options as they passed under the       */
/*  pointer, the panel could not be scrolled at all in Safari.                */
/*                                                                            */
/*  These assert on scroll offsets rather than screenshots, so they need no   */
/*  baselines and no Docker.                                                  */
/* -------------------------------------------------------------------------- */

test.use({ browserName: 'webkit' });

/** Waits two frames — where WebKit's deferred focus scroll used to land. */
const settle = (page: Page) =>
    page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );

const scrollTopOf = (locator: Locator) => locator.evaluate((el) => el.scrollTop);

test.describe('KbqSelect panel scrolling', () => {
    const getSelect = (page: Page) => page.getByTestId('e2eSelect');
    const getContent = (page: Page) => page.locator('.kbq-select__content');

    test.beforeEach(async ({ page }) => {
        await page.goto('/E2eSelectScrollbar');
        await getSelect(page).click();
        await expect(getContent(page)).toBeVisible();
    });

    test('never asks the browser to scroll an option into view on focus', async ({ page }) => {
        await e2eRecordOptionFocusOptions(page);

        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('ArrowDown');
        }

        const preventScrollFlags = await e2eReadOptionFocusOptions(page);

        // A non-empty recording proves keyboard navigation really went through focus, so the
        // assertion below cannot pass by never having been exercised.
        expect(preventScrollFlags.length).toBeGreaterThan(0);
        expect(preventScrollFlags).not.toContain(false);
    });

    test('scrolls with the wheel and stays where the reader left it', async ({ page }) => {
        const content = getContent(page);

        await content.hover();
        await page.mouse.wheel(0, 200);
        await settle(page);

        const scrolled = await scrollTopOf(content);

        expect(scrolled).toBeGreaterThan(0);

        await settle(page);

        expect(await scrollTopOf(content)).toBe(scrolled);
    });

    test('brings the active option into view on keyboard navigation without scrolling the page', async ({ page }) => {
        const content = getContent(page);

        for (let i = 0; i < 15; i++) {
            await page.keyboard.press('ArrowDown');
        }

        await settle(page);

        expect(await scrollTopOf(content)).toBeGreaterThan(0);

        // The active option is fully inside the scrollport, not merely somewhere in the list.
        const activeIsVisible = await content.evaluate((el) => {
            const active = el.querySelector<HTMLElement>('.kbq-option.kbq-active');

            if (!active) return null;

            const panel = el.getBoundingClientRect();
            const option = active.getBoundingClientRect();

            return option.top >= panel.top - 1 && option.bottom <= panel.bottom + 1;
        });

        expect(activeIsVisible).toBe(true);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });
});

test.describe('KbqSelect panel scrolling under virtual scroll', () => {
    // Virtual scroll swaps in a CDK viewport that translates its content instead of laying it out at the
    // scroll offset, so the panel drives it through the CDK's own API rather than by element offsets.
    const getViewport = (page: Page) => page.locator('cdk-virtual-scroll-viewport');

    test.beforeEach(async ({ page }) => {
        await page.goto('/E2eVirtualScrollSelectScrollbar');
        await page.getByTestId('e2eSelect').click();
        await expect(getViewport(page)).toBeVisible();
    });

    test('follows the active option with the keyboard', async ({ page }) => {
        const viewport = getViewport(page);
        const initial = await scrollTopOf(viewport);

        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('ArrowDown');
        }

        await settle(page);

        // Twenty options is past the panel's cap, so the viewport has to have followed the active one.
        expect(await scrollTopOf(viewport)).toBeGreaterThan(initial);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test('never asks the browser to scroll an option into view on focus', async ({ page }) => {
        await e2eRecordOptionFocusOptions(page);

        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('ArrowDown');
        }

        const preventScrollFlags = await e2eReadOptionFocusOptions(page);

        expect(preventScrollFlags.length).toBeGreaterThan(0);
        expect(preventScrollFlags).not.toContain(false);
    });
});
