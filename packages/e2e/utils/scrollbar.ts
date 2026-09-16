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

/**
 * Asserts that `viewport` shows no scrollbar: its content does not overflow, and its track holds no bar
 * and no thumb.
 *
 * Pass `settledSibling` — an overflowing viewport on the same page — when the check runs right after
 * load. A track reports no bars for its first frame plus one throttle window whatever its content is,
 * so an empty track asserted before any tick has run passes on the pre-computation window rather than
 * on the behaviour. A sibling shares the page's frame loop, so its bars appearing prove a tick has been
 * through.
 *
 * The track's `kbq-scrollbar-track_revealed` class is deliberately not asserted: it lasts only
 * `hideDelay` after a flash, and nothing re-arms it.
 */
export const e2eExpectNoScrollbarAfterFlash = async (viewport: Locator, settledSibling?: Locator): Promise<void> => {
    if (settledSibling) {
        await expect(settledSibling.locator('kbq-scrollbar-track .kbq-scrollbar-track__bar')).not.toHaveCount(0);
    }

    const track = viewport.locator('kbq-scrollbar-track').first();

    await expect(viewport).toBeVisible();
    // Present, so the empty bar and thumb counts below cannot come from a track that was never built.
    await expect(viewport.locator('kbq-scrollbar-track')).toHaveCount(1);

    expect(
        await viewport.evaluate((element) => ({
            horizontal: element.scrollWidth > element.clientWidth,
            vertical: element.scrollHeight > element.clientHeight
        }))
    ).toEqual({ horizontal: false, vertical: false });

    await expect(track.locator('.kbq-scrollbar-track__bar')).toHaveCount(0);
    await expect(track.locator('.kbq-scrollbar-track__thumb')).toHaveCount(0);
};
