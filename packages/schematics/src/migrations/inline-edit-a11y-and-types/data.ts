/**
 * Data for the `inline-edit-a11y-and-types` migration.
 *
 * The inline-edit review moved the widget semantics off the host and closed the surface that only
 * existed to serve the overlay:
 *
 * - `KbqFocusRegionItem` — removed. It existed to give the edit overlay two `aria-hidden` tab stops,
 *   which is an `aria-hidden-focus` failure; the Tab boundary is detected on the panel now.
 * - `setValueHandler` — `(value: any) => void` → `(value: unknown) => void`, and `validationTooltip`
 *   accepts `TemplateRef<unknown>` instead of `TemplateRef<any>`.
 * - `KbqA11yLocaleConfiguration` — gained a required `edit` key, the accessible name of the control
 *   that opens the editor.
 * - The host is no longer the tab stop: `role`, `tabindex` and the ARIA state live on
 *   `.kbq-inline-edit__view-content` (or on `.kbq-inline-edit__focus-anchor` when the view content is
 *   interactive).
 *
 * Warn-only. A removed export has no replacement expression, a narrowed handler parameter needs a cast
 * the component cannot choose, and a selector that targeted the host is a decision about which element
 * the host actually meant.
 */

/** Import specifier that marks a file as an inline-edit consumer. */
export const INLINE_EDIT_PACKAGE = '@koobiq/components/inline-edit';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const INLINE_EDIT_TYPE = '\\bKbqInlineEdit\\w*\\b|\\bkbqInlineEdit\\w*\\b|\\bkbq-inline-edit\\b';

/** Anchor for the locale change, which reaches hosts that never name the inline edit. */
export const A11Y_LOCALE_TYPE = '\\bKbqA11yLocaleConfiguration\\b|\\bkbqA11yLocaleConfigurationProvider\\s*\\(';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: `${INLINE_EDIT_TYPE}|KbqFocusRegionItem`,
        pattern: '\\bKbqFocusRegionItem\\b|\\bkbqFocusRegionItem\\b',
        message:
            'KbqFocusRegionItem was removed. It marked the two `aria-hidden="true" tabindex="0"` sentinels ' +
            'the edit overlay rendered around its panel — an axe `aria-hidden-focus` failure and two dead-end ' +
            'tab stops. The Tab boundary is resolved on the panel itself now, so the directive has no ' +
            'replacement: drop the import and the attribute.'
    },
    {
        anchor: INLINE_EDIT_TYPE,
        pattern: '\\bsetValueHandler\\b',
        message:
            'KbqInlineEdit.setValueHandler takes `(value: unknown) => void` instead of `(value: any) => void`. ' +
            'A handler typed against the concrete value no longer assigns — widen the parameter to `unknown` ' +
            'and narrow inside, which is what the component always handed over.'
    },
    {
        anchor: A11Y_LOCALE_TYPE,
        pattern: A11Y_LOCALE_TYPE,
        message:
            'KbqA11yLocaleConfiguration gained a required `edit` key — the accessible name of the control ' +
            'that opens an inline edit. A complete configuration object has to supply it; a partial override ' +
            'through kbqA11yLocaleConfigurationProvider() does not.'
    },
    {
        anchor: INLINE_EDIT_TYPE,
        pattern: '\\.kbq-inline-edit\\b[^\\n]*(?:\\[tabindex|:focus)|kbq-inline-edit[^\\n]*\\[tabindex',
        message:
            'The inline edit is no longer the tab stop: `role`, `tabindex` and the ARIA state moved to ' +
            '.kbq-inline-edit__view-content, and to .kbq-inline-edit__focus-anchor while the view content is ' +
            'interactive. A selector matching the host by tabindex or focus has to target those instead — the ' +
            'focus ring itself still lands on the host through `cdk-keyboard-focused`.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The view mode is announced as a `button` with `aria-expanded`, named by the new `edit` a11y locale ' +
        'key or by an `aria-label` on the component. Hand-rolled role or aria-* attributes on ' +
        '<kbq-inline-edit> are duplicates now, and `aria-label` is read as an input.',
    '  `saved`, `canceled` and `modeChange` are public, so a viewChild(KbqInlineEdit) can subscribe to them. ' +
        'Template bindings are unaffected.',
    '  save() marks the projected controls touched itself and gates on the control validity rather than on ' +
        'the ErrorStateMatcher verdict. Typing no longer flips a pristine required field into its error look, ' +
        'and commit() on a never-touched invalid control now keeps the editor open instead of writing the ' +
        'value through — a workaround directive that reset `touched` on first input can be deleted.',
    '  The panel shadow reads --kbq-inline-edit-panel-shadow, which the panel used to declare and then ' +
        'bypass, and the private .kbq-mask / .kbq-mask__fade / .kbq-mask__container classes were renamed to ' +
        'their .kbq-inline-edit__menu-mask* equivalents.'
];
