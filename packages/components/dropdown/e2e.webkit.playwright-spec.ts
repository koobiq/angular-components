import { expect, Page, test } from '@playwright/test';
import {
    e2eIsFullyInView,
    e2eReadOptionFocusOptions,
    e2eRecordOptionFocusOptions,
    e2eScrollTopOf,
    e2eSettleFrames
} from '../../e2e/utils';

/*
 * WebKit-only guard for panel scrolling (DS-3299).
 *
 * Focus scrolls its target into view implicitly. Blink does that synchronously; WebKit defers it to a
 * later rendering update, where it lands after — and undoes — whatever the reader scrolled in between.
 * Components therefore focus with `preventScroll` and reveal the item themselves.
 *
 * These assert on scroll offsets rather than screenshots, so they need no baselines and no Docker.
 */

test.use({ browserName: 'webkit' });

test.describe('KbqDropdown panel scrolling', () => {
    const getPort = (page: Page) => page.locator('.kbq-dropdown__panel');

    test.beforeEach(async ({ page }) => {
        // Installed before navigation so the focus calls the panel makes while opening are recorded too.
        await e2eRecordOptionFocusOptions(page);
        await page.goto('/E2eDropdownScrollbar');
        await page.getByTestId('e2eDropdownScrollbarTrigger').click();
        await expect(getPort(page)).toBeVisible();
        await expect(getPort(page).locator('.kbq-dropdown-item').first()).toBeVisible();
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

        await port.hover();
        await page.mouse.wheel(0, 200);
        await e2eSettleFrames(page);

        const scrolled = await e2eScrollTopOf(port);

        expect(scrolled).toBeGreaterThan(0);

        await e2eSettleFrames(page);

        expect(await e2eScrollTopOf(port)).toBe(scrolled);
    });

    test('does not move the list when the pointer lands on a partially clipped item', async ({ page }) => {
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
        }, '.kbq-dropdown-item');

        expect(offsets).not.toBeNull();
        expect(offsets!.after).toBe(offsets!.before);
    });

    test('brings the active item into view on keyboard navigation without scrolling the page', async ({ page }) => {
        const port = getPort(page);
        const itemCount = await port.locator('.kbq-dropdown-item').count();

        for (let i = 0; i < itemCount; i++) {
            await page.keyboard.press('ArrowDown');
        }

        await e2eSettleFrames(page);

        expect(await e2eScrollTopOf(port)).toBeGreaterThan(0);
        expect(await e2eIsFullyInView(port, '.kbq-dropdown-item:focus')).toBe(true);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });
});
