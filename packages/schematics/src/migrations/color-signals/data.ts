import { SignalMembersConfig, WarnPattern } from '../../utils/signal-members-migration';

/**
 * Data for the `color-signals` migration.
 *
 * `KbqColorDirective.color` is a writable signal now, and so is the `color` of every component built on
 * it. A read becomes a call and a write becomes `.set()`, on a receiver typed by one of those components.
 */

/** Every component and directive whose `color` comes from `KbqColorDirective`. */
const COLORED_TYPES = [
    'KbqColorDirective',
    'KbqButton',
    'KbqButtonGroupRoot',
    'KbqSplitButton',
    'KbqCheckbox',
    'KbqPseudoCheckbox',
    'KbqToggleComponent',
    'KbqRadioGroup',
    'KbqRadioButton',
    'KbqIcon',
    'KbqIconButton',
    'KbqIconItem',
    'KbqFormField',
    'KbqHint',
    'KbqError',
    'KbqPasswordHint',
    'KbqReactivePasswordHint',
    'KbqCleaner',
    'KbqProgressBar',
    'KbqProgressSpinner',
    'KbqTag'
] as const;

/** Identifier shape that marks a file as naming one of the colored types. */
const COLORED_ANCHOR = `\\b(?:${COLORED_TYPES.join('|')})\\b`;

/** Import specifier prefix that marks a file as a Koobiq consumer. */
export const KOOBIQ_PACKAGE = '@koobiq/components/';

export const MEMBERS_BY_TYPE: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
    COLORED_TYPES.map((type) => [type, ['color']])
);

/** `exportAs` names a template reference can be bound to. */
export const EXPORT_AS_TO_TYPE: Readonly<Record<string, string>> = {
    kbqCheckbox: 'KbqCheckbox',
    kbqToggle: 'KbqToggleComponent',
    kbqRadioGroup: 'KbqRadioGroup',
    kbqRadioButton: 'KbqRadioButton',
    kbqFormField: 'KbqFormField',
    kbqHint: 'KbqHint',
    kbqError: 'KbqError',
    kbqPasswordHint: 'KbqPasswordHint',
    kbqReactivePasswordHint: 'KbqReactivePasswordHint',
    kbqCleaner: 'KbqCleaner',
    kbqTag: 'KbqTag'
};

/** Element selectors whose bare `#ref` points at one of the colored components. */
export const ELEMENT_TO_TYPE: Readonly<Record<string, string>> = {
    'kbq-checkbox': 'KbqCheckbox',
    'kbq-pseudo-checkbox': 'KbqPseudoCheckbox',
    'kbq-toggle': 'KbqToggleComponent',
    'kbq-radio-button': 'KbqRadioButton',
    'kbq-split-button': 'KbqSplitButton',
    'kbq-form-field': 'KbqFormField',
    'kbq-hint': 'KbqHint',
    'kbq-error': 'KbqError',
    'kbq-password-hint': 'KbqPasswordHint',
    'kbq-reactive-password-hint': 'KbqReactivePasswordHint',
    'kbq-cleaner': 'KbqCleaner',
    'kbq-progress-bar': 'KbqProgressBar',
    'kbq-progress-spinner': 'KbqProgressSpinner',
    'kbq-tag': 'KbqTag',
    'kbq-basic-tag': 'KbqTag'
};

/** Attribute selectors whose bare `#ref` points at one of the colored components. */
export const ATTRIBUTE_TO_TYPE: Readonly<Record<string, string>> = {
    'kbq-button': 'KbqButton',
    'kbq-split-button': 'KbqSplitButton',
    'kbq-icon': 'KbqIcon',
    'kbq-icon-button': 'KbqIconButton',
    'kbq-icon-item': 'KbqIconItem',
    'kbq-tag': 'KbqTag',
    'kbq-basic-tag': 'KbqTag'
};

export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set(['color']);

export const warnPatterns: readonly WarnPattern[] = [
    {
        anchor: COLORED_ANCHOR,
        pattern: `\\bextends\\s+${COLORED_ANCHOR}`,
        message:
            'A subclass of a colored component: `color` is a writable signal inherited from KbqColorDirective, ' +
            'and the accessor can no longer be overridden. Replace `this.color = x` in the constructor with ' +
            '`this.setDefaultColor(x)`, read `this.color()`, and to derive the color override the `color` field ' +
            'with a linkedSignal over `colorInput()` and `defaultColor()`. `_color` was removed and ' +
            '`defaultColor` is a Signal.'
    },
    {
        anchor: '\\bCanColor\\b',
        pattern: '\\bCanColor\\b',
        message: 'CanColor.color is a Signal now.'
    }
];

export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders a colored component but could not be parsed, so it was left untouched. ' +
    'Migrate reads of `color` through its template reference variables by hand.';

export const UNRESOLVED_RECEIVER_MESSAGE =
    'A colored component is used here in a way this migration cannot resolve to a single receiver, so ' +
    'any read of `color` through it was left untouched. Check these lines by hand:';

export const SUMMARY: readonly string[] = [
    '  `color` of every component built on KbqColorDirective is a writable signal: a read is a call ' +
        '(icon.color()), a write is .set(). A read left un-called is silent in a template: ' +
        '{{ icon.color }} prints the function source.',
    '  A color set in code holds until the [color] binding or the default color of the component changes. ' +
        'On a button that includes the color of its group and a change of kbqStyle. Prefer binding [color].',
    '  An unset or falsy [color] renders the default color class of the component, kbq-empty where it ' +
        'has none, instead of no color class.'
];

export const config: SignalMembersConfig = {
    label: '[color-signals]',
    package: KOOBIQ_PACKAGE,
    membersByType: MEMBERS_BY_TYPE,
    exportAsToType: EXPORT_AS_TO_TYPE,
    elementToType: ELEMENT_TO_TYPE,
    attributeToType: ATTRIBUTE_TO_TYPE,
    writableMembers: WRITABLE_MEMBERS,
    warnPatterns,
    messages: {
        unparseableTemplate: UNPARSEABLE_TEMPLATE_MESSAGE,
        unresolvedReceiver: UNRESOLVED_RECEIVER_MESSAGE,
        summary: SUMMARY
    }
};
