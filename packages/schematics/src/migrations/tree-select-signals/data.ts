/**
 * Data for the `tree-select-signals` migration.
 *
 * The tree-select review typed the surface and removed the members that only existed to serve the
 * template:
 *
 * - `getPanelClasses()`, `getPanelTheme()`, `isRtl()`, `transformOrigin` — removed. The panel classes
 *   are a `protected` computed (`panelClasses`) the template reads directly.
 * - `valueChange` — removed. It was declared and documented as the other half of a two-way binding on
 *   a `value` input that does not exist, and nothing ever emitted it.
 * - `hiddenItemsText`, `hiddenItemsTextFormatter` — accessor pair / method → signal inputs.
 * - `hiddenItems` → `WritableSignal<number>`, `colorForState` → `Signal<KbqComponentColors>`.
 * - `options`, `tags`, `overlayDir`, `triggerRect`, `panelDoneAnimatingStream`, `changeDetectorRef` —
 *   public → `protected`.
 * - `KbqTreeSelectChange` is generic and its `value` is no longer `any`.
 *
 * Warn-only. A read of a signal member becomes a call, a write becomes the binding, and a removed
 * member has no replacement expression at all.
 */

/** Import specifier that marks a file as a tree-select consumer. */
export const TREE_SELECT_PACKAGE = '@koobiq/components/tree-select';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const TREE_SELECT_TYPE = '\\bKbqTreeSelect\\w*\\b|\\bkbq-tree-select\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TREE_SELECT_TYPE,
        pattern: '\\bvalueChange\\b',
        message:
            'KbqTreeSelect.valueChange was removed. It was declared as the other half of a two-way binding ' +
            'on a `value` input that does not exist, and nothing ever emitted it — a `(valueChange)` binding ' +
            'never fired, and Angular treats it as a DOM event listener now, so it stays silent either way. ' +
            'Listen to (selectionChange) instead.'
    },
    {
        anchor: TREE_SELECT_TYPE,
        pattern: '\\.\\s*(?:getPanelClasses|getPanelTheme|isRtl|transformOrigin)\\b',
        message:
            'KbqTreeSelect.getPanelClasses() / getPanelTheme() / isRtl() / transformOrigin were removed. They ' +
            'existed to feed the template, which now reads a protected `panelClasses` computed; a host that ' +
            'needs the panel styled differently should bind [panelClass].'
    },
    {
        anchor: TREE_SELECT_TYPE,
        pattern: '\\.\\s*(?:hiddenItemsText|hiddenItemsTextFormatter|hiddenItems|colorForState)\\s*=(?!=)',
        message:
            'hiddenItemsText and hiddenItemsTextFormatter are signal inputs, hiddenItems is a WritableSignal ' +
            'and colorForState is a computed — none of them takes an assignment. Bind the inputs in the ' +
            'template; hiddenItems is written by the measurement, not by the host.'
    },
    {
        anchor: TREE_SELECT_TYPE,
        pattern: '\\.\\s*(?:hiddenItemsText|hiddenItemsTextFormatter|hiddenItems|colorForState)\\b(?!\\s*[=(])',
        message:
            'hiddenItemsText, hiddenItemsTextFormatter, hiddenItems and colorForState are signal-backed: read ' +
            'them as calls. `hiddenItemsTextFormatter()(template, count)` for the formatter, which is an ' +
            'input holding the function rather than a method.'
    },
    {
        anchor: TREE_SELECT_TYPE,
        pattern: '\\.\\s*(?:options|tags|overlayDir|triggerRect|panelDoneAnimatingStream|changeDetectorRef)\\b',
        message:
            'KbqTreeSelect.options / tags / overlayDir / triggerRect / panelDoneAnimatingStream / ' +
            'changeDetectorRef are protected. They were the panel and trigger plumbing; the supported ' +
            'surface is the open/close API, the inputs and (selectionChange).'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  KbqTreeSelectChange is generic — KbqTreeSelectChange<T> — and its `value` is no longer `any`. A ' +
        'handler that relied on the implicit widening needs the type argument.',
    '  The embedded tree is set up through KbqTreeSelection.initializeForEmbedding() instead of a ' +
        'second manual ngAfterContentInit(). The old path left duplicate subscriptions on query lists ' +
        'that are never re-created, so every options change was handled several times on the ' +
        'search-filtering hot path.',
    '  The dead { provide: KbqTree, useExisting: KbqTreeSelect } provider is gone: KbqTreeSelect never ' +
        'satisfied KbqTree structurally, so anything injecting KbqTree from inside a tree-select was ' +
        'getting an object that only looked right.',
    '  The component renders a host id and carries combobox ARIA, so the [attr.for] on the form field ' +
        'label resolves instead of dangling, and hand-rolled role or aria-* attributes are duplicates.'
];
