/**
 * Data for the `sidepanel-non-modal-behavior` migration.
 *
 * The sidepanel review changed what a sidepanel does to the page around it:
 *
 * - A sidepanel without a backdrop no longer applies CDK's `BlockScrollStrategy`. The non-modal mode
 *   is documented as "without page blocking", but every panel got `block()`, which pins the document
 *   with `position: fixed`.
 * - `trapFocusAutoCapture` defaults to `true` in both modalities instead of following `hasBackdrop`,
 *   so a non-modal sidepanel moves focus into itself on open and returns it to the trigger on close.
 * - The container is a `role="dialog"` with `aria-modal` and a name taken from `kbq-sidepanel-header`,
 *   and a modal sidepanel hides the rest of the page from assistive technology while it is open.
 * - `KbqSidepanelModule` no longer swaps `FocusTrapFactory` for `ConfigurableFocusTrapFactory`
 *   application-wide; the override is scoped to the sidepanel container.
 * - The overlay host element no longer gets the unstyled `kbq-sidepanel-overlay` class.
 *
 * Warn-only. Whether a given non-modal panel wanted the page frozen, and whether an application was
 * relying on the leaked focus-trap implementation, are decisions this migration cannot make.
 */

/** Import specifier that marks a file as a sidepanel consumer. */
export const SIDEPANEL_PACKAGE = '@koobiq/components/sidepanel';

/** Identifier and element shapes that mark a consumer without an import. */
export const SIDEPANEL_TYPE = '\\bKbqSidepanel\\w*\\b|\\bkbq-sidepanel\\b';

export interface WarnPattern {
    /** Owner of the change. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change reaches. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: SIDEPANEL_TYPE,
        pattern: 'hasBackdrop\\s*:\\s*false',
        message:
            'A sidepanel opened with hasBackdrop: false no longer blocks the page scroll. Every panel used ' +
            "to get CDK's BlockScrollStrategy, which pins the document with `position: fixed` — the exact " +
            'opposite of what the non-modal mode documents. Pass scrollStrategy: () => ' +
            'overlay.scrollStrategies.block() in KbqSidepanelConfig if a particular panel wants the page ' +
            'frozen. The same panel now captures focus on open and returns it to the trigger on close: ' +
            'trapFocusAutoCapture defaults to true in both modalities instead of following hasBackdrop, ' +
            'because CdkTrapFocus only restores focus it captured itself. Pass trapFocusAutoCapture: false to ' +
            'leave focus where it was. The focus trap itself still follows hasBackdrop — set trapFocus: true ' +
            'to keep Tab inside a non-modal panel, which also hides the rest of the page from assistive ' +
            'technology.'
    },
    {
        anchor: SIDEPANEL_TYPE,
        pattern: '\\.\\s*config\\s*\\.\\s*hasBackdrop\\s*=(?!=)',
        message:
            'Assigning KbqSidepanelRef.config.hasBackdrop on an open sidepanel has never done anything — the ' +
            'value is read once, when the overlay is built — and the docs that said otherwise are corrected. ' +
            'disableClose is the one config property that is re-read after open.'
    },
    {
        anchor: SIDEPANEL_TYPE,
        pattern: '\\boverlayRef\\s*\\.\\s*backdropElement\\b',
        message:
            'Reaching for KbqSidepanelRef.overlayRef.backdropElement to hide a backdrop throws on any panel ' +
            'opened with hasBackdrop: false, where the element is null. Decide the backdrop when you open the ' +
            'sidepanel.'
    },
    {
        anchor: SIDEPANEL_TYPE,
        pattern: '\\bkbq-sidepanel-overlay\\b',
        message:
            'The kbq-sidepanel-overlay class is no longer added to the overlay host element. Nothing in the ' +
            'library ever styled it. Use overlayPanelClass in KbqSidepanelConfig to tag the overlay pane.'
    },
    {
        anchor: SIDEPANEL_TYPE,
        pattern: '\\b(?:layout-column\\s+flex|flex\\s+layout-column)\\b|:host\\s*\\{[^}]*display\\s*:\\s*flex',
        message:
            'The package styles the host element of a component-based sidepanel itself now ' +
            '(.kbq-sidepanel-content-host: a flex column with min-height: 0). If the component you open in a ' +
            "sidepanel carries `host: { class: 'layout-column flex' }` or a `:host { display: flex; … }` " +
            'block only to make the body scroll and the footer stick, that workaround can go.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  KbqSidepanelModule no longer provides { provide: FocusTrapFactory, useClass: ' +
        'ConfigurableFocusTrapFactory }. That was an unscoped override of a providedIn: "root" CDK service, ' +
        'so importing the sidepanel module changed the focus-trap implementation of every trapping component ' +
        'in the application — modal, dropdown, popover. The override is scoped to the sidepanel container ' +
        'now; add the provider to your own application config if you were depending on it.',
    '  The sidepanel container renders role="dialog", aria-modal for a modal panel and an aria-labelledby ' +
        'pointing at the kbq-sidepanel-header title, and a modal sidepanel marks the rest of the page ' +
        'aria-hidden while it is open. Pass ariaLabel or ariaLabelledBy in KbqSidepanelConfig for a panel ' +
        'with no header, and drop any role or aria-* you were stamping on the container yourself.',
    '  KbqSidepanelService is providedIn: "root", so KbqSidepanelModule is no longer the only way to get ' +
        'one. The module still provides it, which keeps the existing per-module instances.',
    '  A click inside a sidepanel at a different edge no longer closes this one: the outside-click filter ' +
        'consults the position, so only the panels of the same stack close each other.',
    '  KbqSidepanelClose injects KbqSidepanelRef non-optionally. The setTimeout fallback that looked the ref ' +
        'up by container id is gone — the ref reaches template portals through the portal injector.'
];
