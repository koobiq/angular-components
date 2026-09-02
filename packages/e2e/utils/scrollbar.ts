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
 * Waits until every scrollbar track under `root` has left its revealed state.
 *
 * Call this before screenshotting anything that scrolls. The track is revealed for `hideDelay`
 * (1000ms by default) after a scroll or a `flashScrollIndicators()`, then hidden — and once hidden
 * nothing brings it back. A shot taken without this lands on whichever side of that window the
 * machine happened to be on, so the thumb is present in some runs and absent in others.
 *
 * `animations: 'disabled'` does not reach it, because the reveal is an RxJS timer driving a class
 * binding rather than a CSS animation. A retry does rescue it once the baseline holds the settled
 * state, since the assertion outlives `hideDelay` — but only by re-shooting until the window has
 * passed, which is the flake being paid for rather than removed.
 *
 * The track is waited for before the settled state is: "nothing is revealed" is equally true of a
 * viewport whose track has not been created yet, so without the first step this returns before the
 * reveal it exists to sit out. Pass `expectedTracks` when the number is known — a count that never
 * arrives fails loudly instead of passing on an empty match.
 */
export const e2eWaitForSettledScrollbars = async (root: Page | Locator, expectedTracks = 1): Promise<void> => {
    await expect(root.locator('kbq-scrollbar-track')).toHaveCount(expectedTracks);
    await expect(root.locator('kbq-scrollbar-track.kbq-scrollbar-track_revealed')).toHaveCount(0);
};

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
