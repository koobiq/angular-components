import { expect, Page, test } from '@playwright/test';
import {
    e2eIsFullyInView,
    e2eReadOptionFocusOptions,
    e2eRecordOptionFocusOptions,
    e2eScrollTopOf,
    e2eSettleFrames,
    e2eWaitForScrollEnd
} from '../../e2e/utils';

/*
 * WebKit-only guard for panel scrolling (DS-3299).
 *
 * Focus scrolls its target into view implicitly. Blink does that synchronously; WebKit defers it to a
 * later rendering update, where it lands after — and undoes — whatever the reader scrolled in between.
 * Components therefore focus with `preventScroll` and reveal the option themselves.
 *
 * These assert on scroll offsets rather than screenshots, so they need no baselines and no Docker.
 */

test.use({ browserName: 'webkit' });

test.describe('KbqAutocomplete panel scrolling', () => {
    const getPort = (page: Page) => page.locator('.kbq-autocomplete-panel__content');

    test.beforeEach(async ({ page }) => {
        // Installed before navigation so the focus calls the panel makes while opening are recorded too.
        await e2eRecordOptionFocusOptions(page);
        await page.goto('/E2eAutocompleteScrollbar');
        await page.getByTestId('e2eAutocompleteInput').focus();
        // The routes fit the viewport, so without this the page-scroll assertion below could never fail.
        await page.addStyleTag({ content: 'body { min-height: 3000px; }' });
        await expect(getPort(page)).toBeVisible();
        await expect(getPort(page).locator('.kbq-option').first()).toBeVisible();
    });

    test('has a panel that actually overflows', async ({ page }) => {
        // Guards the premise of the other tests: without overflow they would all pass vacuously.
        await expect.poll(() => getPort(page).evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    });

    test('never asks the browser to scroll on focus, including while opening', async ({ page }) => {
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('ArrowDown');
        }

        const preventScrollFlags = await e2eReadOptionFocusOptions(page);

        // A non-empty recording proves focus was exercised, so the assertion cannot pass vacuously.
        expect(preventScrollFlags.length).toBeGreaterThan(0);
        expect(preventScrollFlags).not.toContain(false);
    });

    test('scrolls with the wheel and stays where the reader left it', async ({ page }) => {
        const port = getPort(page);

        const start = await e2eScrollTopOf(port);

        await port.hover();
        await page.mouse.wheel(0, 200);

        // The gesture is applied over several frames; wait for the offset to move and then settle.
        const scrolled = await e2eWaitForScrollEnd(port, start);

        expect(scrolled).toBeGreaterThan(0);

        // Nothing may move the panel afterwards — a deferred focus scroll used to land right here.
        await e2eSettleFrames(page);

        // A deferred focus scroll moves the panel by at least a row; a pixel of settling is not movement.
        expect(Math.abs((await e2eScrollTopOf(port)) - scrolled)).toBeLessThanOrEqual(1);
    });

    test('does not move the list when the pointer lands on a partially clipped option', async ({ page }) => {
        const port = getPort(page);

        const offsets = await port.evaluate(async (element, sel) => {
            // Land on a fractional offset so a row straddles the top edge of the scrollport.
            element.scrollTop = 50;
            await new Promise((resolve) => requestAnimationFrame(resolve));

            const before = element.scrollTop;
            const port = element.getBoundingClientRect();
            const clipped = [...element.querySelectorAll<HTMLElement>(sel)].find((item) => {
                const box = item.getBoundingClientRect();

                return box.top < port.top && box.bottom > port.top;
            });

            if (!clipped) return null;

            clipped.dispatchEvent(new MouseEvent('mouseenter'));
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

            return { before, after: element.scrollTop };
        }, '.kbq-option');

        expect(offsets).not.toBeNull();
        expect(offsets!.after).toBe(offsets!.before);
    });

    test('brings the active option into view on keyboard navigation without scrolling the page', async ({ page }) => {
        const port = getPort(page);
        const itemCount = await port.locator('.kbq-option').count();

        for (let i = 0; i < itemCount; i++) {
            await page.keyboard.press('ArrowDown');
        }

        await e2eSettleFrames(page);

        expect(await e2eScrollTopOf(port)).toBeGreaterThan(0);
        expect(await e2eIsFullyInView(port, '.kbq-option.kbq-active')).toBe(true);
        // The page is deliberately made scrollable in beforeEach, so this can actually fail.
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });
});
