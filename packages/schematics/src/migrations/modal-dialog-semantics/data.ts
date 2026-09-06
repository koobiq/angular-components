/**
 * Data for the `modal-dialog-semantics` migration.
 *
 * The modal review made the dialog a real dialog and closed the seam between its two entry paths:
 *
 * - `.kbq-modal-container` carries `role="dialog"`, `aria-modal`, `aria-labelledby`/`aria-label`
 *   and the focus trap; the page behind an open dialog is marked `inert`.
 * - The `EventEmitter` form of `kbqOnOk`/`kbqOnCancel` closes the dialog now, so `×`, the dim
 *   layer and the predefined buttons work on a declarative `<kbq-modal [(kbqVisible)]>`.
 * - <kbd>Escape</kbd> has one implementation for both paths: it honours `kbqCloseByESC` and runs
 *   through `kbqOnCancel`, veto included.
 * - A service-created dialog is destroyed with the injector that opened it.
 * - `transformOrigin`, `getKbqFooter()`, `getContainerClasses()` and `autoFocusedButtons` are gone;
 *   the template-only helpers became `protected`.
 *
 * Warn-only. A removed member has no replacement expression, and what a closing dialog should do
 * instead is a decision the schematic cannot make.
 */

/** Import specifier that marks a file as a modal consumer. */
export const MODAL_PACKAGE = '@koobiq/components/modal';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const MODAL_TYPE = '\\bKbqModal\\w*\\b|\\bkbq-modal\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: MODAL_TYPE,
        pattern: '\\((?:kbqOnOk|kbqOnCancel)\\)',
        message:
            'A (kbqOnOk)/(kbqOnCancel) binding no longer keeps the dialog open. The EventEmitter form ' +
            'used to emit and return, so on a declarative <kbq-modal [(kbqVisible)]> the ×, the dim ' +
            'layer and the predefined buttons emitted and did nothing; it is a notification now and ' +
            'the dialog closes. To keep a close under your control, pass kbqOnOk/kbqOnCancel as a ' +
            'function and return false from it.'
    },
    {
        anchor: MODAL_TYPE,
        pattern: '\\.\\s*(?:transformOrigin|getKbqFooter|getContainerClasses|autoFocusedButtons)\\b',
        message:
            'KbqModalComponent.transformOrigin / getKbqFooter() / getContainerClasses() / ' +
            'autoFocusedButtons were removed. transformOrigin was computed from a click position ' +
            'set to {x: -1, y: -1} and applied against keyframes that end at scale(1), so it ' +
            'never rendered anything; autoFocusedButtons queried a template reference that does not ' +
            'exist. The class list is an internal field the template reads directly.'
    },
    {
        anchor: MODAL_TYPE,
        pattern:
            '\\.\\s*(?:handleCloseResult|getButtonCallableProp|isModalType|isTemplateRef|isNonEmptyString|' +
            'isComponent|isModalButtons|onClickMask|onClickOkCancel|onButtonClick|maskAnimationClassMap|' +
            'modalAnimationClassMap)\\b',
        message:
            'The KbqModalComponent members that only ever fed its own template are protected now: ' +
            'handleCloseResult, getButtonCallableProp, isModalType, isTemplateRef, isNonEmptyString, ' +
            'isComponent, isModalButtons, onClickMask, onClickOkCancel, onButtonClick and the two ' +
            'animation class maps. The supported surface is open()/close()/destroy(), triggerOk(), ' +
            'triggerCancel() and the inputs.'
    },
    {
        anchor: MODAL_TYPE,
        pattern: '\\bmodalUtilObject\\b|\\bModalUtil\\b|\\bIClickPosition\\b',
        message:
            'ModalUtil, modalUtilObject and IClickPosition were removed together with the ' +
            'transform-origin machinery they fed, including the document-wide click listener they ' +
            'registered at module load and never removed.'
    },
    {
        anchor: MODAL_TYPE,
        pattern: '\\bkbq-modal-open\\b|--kbq-modal-size-close-button-margin-left',
        message:
            'The .kbq-modal-open class and the --kbq-modal-size-close-button-margin-left token were ' +
            'removed: neither had a single reader. The body scroll lock is an inline style, and the ' +
            'close button is positioned absolutely. The dialog now reads a new ' +
            '--kbq-modal-size-viewport-inset token (48px) for the gap it keeps to each viewport edge.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The dialog element carries role="dialog", aria-modal="true" and an accessible name — the ' +
        'kbqTitle by default, the new kbqAriaLabel option when there is none. A confirm or ' +
        'header-less dialog opened without kbqAriaLabel is announced unnamed. Hand-rolled role or ' +
        'aria-* attributes on the dialog are duplicates now.',
    '  While a dialog is shown, every body child that does not contain an overlay is marked inert, ' +
        'and every dialog below the topmost one is too. Code that reaches into the page behind an ' +
        'open dialog — a click, a focus() — no longer takes effect.',
    '  Initial focus follows kbqAutoFocus (first-tabbable by default, plus dialog, first-heading and ' +
        'false), with [cdkFocusInitial]/autofocus winning over it. A dialog with no focusable ' +
        'control focuses itself instead of leaving focus on the trigger behind it.',
    '  Escape honours kbqCloseByESC on both entry paths and runs through kbqOnCancel, so a callback ' +
        'returning false vetoes it. It used to close a declarative dialog unconditionally and to ' +
        'ignore the veto on the service path.',
    '  A dialog opened through KbqModalService is destroyed with the injector that opened it — ' +
        'options.injector, or the root environment injector. Destroying the opener used to leave the ' +
        'dialog painted over the next view with the page scroll still locked.',
    '  The kbqAfterOpen/kbqAfterClose options are mirrored onto the dialog instead of replacing its ' +
        'own emitters, so afterOpen/afterClose on the returned ref keep emitting; and a declarative ' +
        'modal no longer emits kbqBeforeClose/kbqAfterClose once on creation.',
    '  The dialog is a flex column capped at the viewport minus its inset, so only the body scrolls ' +
        'and the header and the footer stay on screen. A modal that overrode the old ' +
        'max-height: calc(100vh - 260px) on .kbq-modal-body can drop that override.'
];
