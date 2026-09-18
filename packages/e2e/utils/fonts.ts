import { expect, Page } from '@playwright/test';

/**
 * Loads every font face the page declares and waits for them, so that whatever renders next is measured
 * against the faces it will be painted with.
 *
 * Call it before the element under test is created — after `goto`, before the click or the navigation
 * that brings it up. A component that derives a layout from a measurement taken once, as it renders, is
 * otherwise racing the webfonts: the fallback face has different metrics, and nothing re-measures when
 * the real one swaps in unless the element's own width happens to move.
 *
 * Waiting on `document.fonts.status` or `document.fonts.ready` does not do this, however natural it
 * looks. Both call the set settled whenever nothing is *pending*, which includes every moment before a
 * needed unicode-range subset has been requested at all — measured under a 6 s font stall, that check
 * passes in 4 ms with the fallback layout on screen.
 *
 * Every declared face rather than a named list, because the set is then whatever the page's own styles
 * declare and cannot drift out of step with them. A list would have to carry the weights as well, and a
 * family served as unicode-range subsets needs the subset the route happens to render — which is the
 * part that is easiest to get wrong and impossible to notice. Measured at 36–70 ms.
 *
 * `allSettled`, so that a face failing to load still leaves a page to test and a screenshot diff that
 * says what happened.
 */
export const e2eWaitForFonts = async (page: Page): Promise<void> => {
    const declared = await page.evaluate(async () => {
        await Promise.allSettled([...document.fonts].map((face) => face.load()));

        return document.fonts.size;
    });

    // Styles that declared nothing would make this a no-op indistinguishable from a wait that worked.
    expect(declared, 'the page declares no @font-face').toBeGreaterThan(0);
};
