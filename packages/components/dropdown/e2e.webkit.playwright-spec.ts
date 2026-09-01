import { expect, Locator, Page, test } from '@playwright/test';
import { e2eReadOptionFocusOptions, e2eRecordOptionFocusOptions } from '../../e2e/utils';

/* -------------------------------------------------------------------------- */
/*  WebKit-only regression guard for panel scrolling (DS-3299).               */
/*                                                                            */
/*  `FocusKeyManager` focuses the item it activates, and the panel used to    */
/*  lean on the scroll that `HTMLElement.focus()` performs implicitly. Blink  */
/*  runs that scroll synchronously, but WebKit defers it to a later rendering */
/*  update — where it lands after, and undoes, whatever the reader scrolled   */
/*  in the meantime. Hovering re-focuses items as they pass under the         */
/*  pointer, so the panel could not be scrolled at all in Safari.             */
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

test.describe('KbqDropdown panel scrolling', () => {
    const getPanel = (page: Page) => page.locator('.kbq-dropdown__panel');

    test.beforeEach(async ({ page }) => {
        await page.goto('/E2eDropdownScrollbar');
        await page.getByTestId('e2eDropdownScrollbarTrigger').click();
        await expect(getPanel(page)).toBeVisible();
        // The panel is measured below, so wait for its items rather than just for the box itself.
        await expect(getPanel(page).locator('.kbq-dropdown-item').first()).toBeVisible();
    });

    test('has a panel that actually overflows', async ({ page }) => {
        // Guards the premise of every other test here: without overflow they would all pass vacuously.
        await expect.poll(() => getPanel(page).evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    });

    test('never asks the browser to scroll an item into view on focus', async ({ page }) => {
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
        const panel = getPanel(page);

        await panel.hover();
        await page.mouse.wheel(0, 200);
        await settle(page);

        const scrolled = await scrollTopOf(panel);

        expect(scrolled).toBeGreaterThan(0);

        await settle(page);

        expect(await scrollTopOf(panel)).toBe(scrolled);
    });

    test('brings the active item into view on keyboard navigation without scrolling the page', async ({ page }) => {
        const panel = getPanel(page);
        const itemCount = await panel.locator('.kbq-dropdown-item').count();

        // Roughly twenty items fit, so walking to the last one is what forces the panel to scroll.
        // Navigation does not wrap here (`navigationWithWrap` defaults to false), so this lands on the end.
        for (let i = 0; i < itemCount; i++) {
            await page.keyboard.press('ArrowDown');
        }

        await settle(page);

        expect(await scrollTopOf(panel)).toBeGreaterThan(0);

        const activeIsVisible = await panel.evaluate((el) => {
            const active = el.querySelector<HTMLElement>('.kbq-dropdown-item:focus');

            if (!active) return null;

            const panelRect = el.getBoundingClientRect();
            const itemRect = active.getBoundingClientRect();

            return itemRect.top >= panelRect.top - 1 && itemRect.bottom <= panelRect.bottom + 1;
        });

        expect(activeIsVisible).toBe(true);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });
});
