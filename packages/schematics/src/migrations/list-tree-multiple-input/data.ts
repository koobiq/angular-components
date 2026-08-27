export interface WarnPattern {
    pattern: string;
    message: string;
}

/** The input this migration rewrites. Matched against the parsed template AST, not against raw text. */
export const MULTIPLE_ATTRIBUTE = 'multiple';

/** The two components whose `multiple` changed meaning. `kbq-tree-select` has its own, unrelated input. */
export const TARGET_ELEMENTS = ['kbq-list-selection', 'kbq-tree-selection'];

/**
 * The mode the migration writes when it has to preserve multiple selection.
 *
 * Spelled out rather than imported from `@koobiq/components`: a schematic describes a past state of the
 * API, so it must keep working after the enum it migrates away from has moved on.
 */
export const CHECKBOX_MODE = 'checkbox';

/** Values whose meaning did not change, so a template using one is already correct. */
export const UNCHANGED_VALUES = ['', 'true', CHECKBOX_MODE, 'keyboard'];

/**
 * Values that asked for single selection in the author's head but enabled multiple selection in the
 * browser. The attribute is deleted rather than rewritten: single selection is what an absent `multiple`
 * already means, and `multiple="single"` is no longer an accepted spelling.
 */
export const SINGLE_INTENT_VALUES = ['false', 'single'];

/**
 * Expression literals a binding may hold that are unambiguous under the new API. They cannot appear in
 * code written before this release — `multiple` was not an input then — so they are left alone silently.
 */
export const SAFE_BINDING_LITERALS = ['true', 'false', 'null', 'undefined'];

export const removedAttributeMessage = (filePath: string, value: string): string[] => [
    `  removed ${MULTIPLE_ATTRIBUTE}="${value}" — single selection is the default, so the attribute is gone.`,
    '  BEHAVIOUR CHANGE: this element used to allow multiple selection with checkboxes. If that is what you',
    `  wanted, put ${MULTIPLE_ATTRIBUTE}="${CHECKBOX_MODE}" back. File: ${filePath}`
];

export const rewrittenAttributeMessage = (filePath: string, value: string): string[] => [
    `  ${MULTIPLE_ATTRIBUTE}="${value}" → ${MULTIPLE_ATTRIBUTE}="${CHECKBOX_MODE}", which preserves the`,
    `  behaviour: every unrecognized value used to enable multiple selection. File: ${filePath}`
];

export const dynamicBindingMessage = (filePath: string, value: string): string[] => [
    `  [${MULTIPLE_ATTRIBUTE}]="${value}" is a runtime expression and cannot be resolved here. Make sure it`,
    `  evaluates to "${CHECKBOX_MODE}", "keyboard", a boolean or null. File: ${filePath}`
];

export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'Template could not be parsed, so it was left untouched. Check its `multiple` attributes by hand.';

export const tsWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\.multipleMode\\s*=',
        message:
            'KbqListSelection.multipleMode / KbqTreeSelection.multipleMode is now an accessor. Assigning to it ' +
            'rebuilds the SelectionModel instead of only relabelling the mode, and on a kbq-tree-selection ' +
            'rendered inside a kbq-tree-select it throws, because the select owns the model. Bind `multiple` ' +
            'on the select instead.'
    },
    {
        pattern: 'selectionModel\\s*\\.\\s*changed',
        message:
            'Changing the mode replaces the SelectionModel instance, so a subscription taken on ' +
            'selectionModel.changed is left behind on the discarded one. Subscribe to the ' +
            '(selectionChange) output instead.'
    }
];

export const BEHAVIOUR_NOTE = [
    'Note: `multiple` on kbq-list-selection and kbq-tree-selection is now a real input with a closed set of',
    'values. `checkbox`, `keyboard`, a bare attribute and `true` enable multiple selection; an absent',
    'attribute, `false` and `null` mean single selection. Every other value now falls back to single',
    'selection and is reported in dev mode, where it used to enable multiple selection with checkboxes.'
];
