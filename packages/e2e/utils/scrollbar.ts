import { expect, Locator, Page } from '@playwright/test';

export const e2eDisableResizeObserver = async (page: Page): Promise<void> => {
    // Awaited rather than returned: `addInitScript` resolves to a Disposable, which does not fit the
    // declared Promise<void>. Nothing type-checks this file today — playwright.config.ts only
    // transpiles the specs — so returning it compiled fine and failed `tsc --noEmit`.
    await page.addInitScript(() => {
        window.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        } as unknown as typeof ResizeObserver;
    });
};

/**
 * Waits until no scrollbar track under `root` is still in its revealed state.
 *
 * Call this before screenshotting anything that scrolls. The track is revealed for `hideDelay`
 * (1000ms by default) after a scroll or a `flashScrollIndicators()`, then hidden — and once hidden
 * nothing brings it back. A shot taken without this lands on whichever side of that window the
 * machine happened to be on, so the thumb is present in some runs and absent in others.
 *
 * `animations: 'disabled'` does not help: the reveal is an RxJS timer driving a class binding, not
 * a CSS animation. Neither does a retry, because the assertion would be waiting for a state that is
 * already gone rather than one that has yet to arrive.
 *
 * The settled state is the only one that stays reachable, which is why this waits for the track to
 * be hidden rather than for it to be shown.
 */
export const e2eWaitForSettledScrollbars = (root: Page | Locator): Promise<void> =>
    expect(root.locator('kbq-scrollbar-track.kbq-scrollbar-track_revealed')).toHaveCount(0);

export const e2eExpectNoScrollbarAfterFlash = async (viewport: Locator): Promise<void> => {
    const track = viewport.locator('kbq-scrollbar-track').first();

    await expect(viewport).toBeVisible();
    await expect(track).toHaveClass(/kbq-scrollbar-track_revealed/);

    expect(
        await viewport.evaluate((element) => ({
            horizontal: element.scrollWidth > element.clientWidth,
            vertical: element.scrollHeight > element.clientHeight
        }))
    ).toEqual({ horizontal: false, vertical: false });

    await expect(track.locator('.kbq-scrollbar-track__bar')).toHaveCount(0);
    await expect(track.locator('.kbq-scrollbar-track__thumb')).toHaveCount(0);
};
