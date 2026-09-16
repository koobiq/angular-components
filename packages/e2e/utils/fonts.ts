import { Page } from '@playwright/test';

/**
 * A face to load: a CSS `font` shorthand, plus the text it has to cover.
 *
 * `text` picks the file when a family is served as unicode-range subsets — a Cyrillic letter fetches the
 * Cyrillic subset and nothing else. Omit it for a family served whole.
 */
export type E2eFontFace = {
    font: string;
    text?: string;
};

/**
 * Loads `faces` into the page and waits for them, so that whatever renders next is measured against the
 * faces it will be painted with.
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
 * A face matching no `@font-face` resolves at once and would look exactly like a working wait, so it
 * fails here instead.
 */
export const e2eWaitForFonts = async (page: Page, faces: E2eFontFace[]): Promise<void> => {
    await page.evaluate(async (specs: E2eFontFace[]) => {
        const matched = await Promise.all(specs.map(({ font, text }) => document.fonts.load(font, text)));
        const unmatched = specs.filter((_, index) => matched[index].length === 0).map(({ font }) => font);

        if (unmatched.length > 0) {
            throw new Error(`No @font-face matched ${unmatched.join(', ')}.`);
        }
    }, faces);
};
