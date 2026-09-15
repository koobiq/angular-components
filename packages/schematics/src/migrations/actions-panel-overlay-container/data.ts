/**
 * Data for the `actions-panel-overlay-container` migration.
 *
 * `KbqActionsPanelConfig.overlayContainer` used to be an anchor for the positioning only: the overlay
 * itself stayed in the application-wide CDK container. It now names the element the panel is rendered
 * into, which changes three things at once for a call site that already passes it.
 *
 * Warn-only. None of it can be rewritten automatically: whether a panel that now sits inside a clipping or
 * scrolling element is still where the product wants it is a layout question, not a syntactic one.
 */

/** Import specifier that marks a file as an actions panel consumer. */
export const ACTIONS_PANEL_PACKAGE = '@koobiq/components/actions-panel';

/** Identifier shapes that mark a consumer without an import. */
export const ACTIONS_PANEL_TYPE = '\\bKbqActionsPanel\\w*\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change affects. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: ACTIONS_PANEL_TYPE,
        pattern: '\\boverlayContainer\\s*:',
        message:
            'The panel passed `overlayContainer` is now rendered inside that element instead of `document.body`, ' +
            'so it no longer floats above the page: an element with `overflow: hidden` clips it, and one that ' +
            'scrolls its own content scrolls it out of view. The element is also mutated while the panel is open ' +
            '(one extra child node, and `position: static` promoted to `relative`), which shifts `:empty`, ' +
            '`:last-child`, `:nth-last-child()` and `childElementCount`. Check the layout, and move the option to ' +
            'an element outside the scrolled area if the panel has to stay on a visible edge.'
    },
    {
        anchor: ACTIONS_PANEL_TYPE,
        pattern: '\\bmaxWidth\\s*:',
        message:
            '`maxWidth` used to be ignored whenever `overlayContainer` was set — the panel was capped at the ' +
            "container's measured width. It is now applied as given, so a value that was dead code before starts " +
            'taking effect. Drop it to keep the previous width.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  A panel opened with `overlayContainer` no longer uses a globally provided `OverlayContainer`: the ' +
        'two settings both answer "where is the panel rendered", and the per-panel one wins. An application ' +
        'that swaps the container globally (`FullscreenOverlayContainer`, `kbqShadowDomOverlayProvider`) ' +
        'keeps it for every panel opened without the option.'
];
