import { SignalMembersConfig, WarnPattern } from '../../utils/signal-members-migration';

/**
 * Data for the `option-signals` migration.
 *
 * `KbqOption` and `KbqTimezoneOption` moved to signal inputs, but the state consumers read through events and
 * models — `value`, `viewValue`, `disabled`, `showCheckbox`, `timezone` — is still read as a property, so only a
 * programmatic write breaks, and it is reported. `KbqOptgroup.disabled` and `KbqOptionActionComponent.disabled`
 * are plain signal inputs: a read becomes a call.
 */

const OPTION_ANCHOR = '\\bKbq(?:Option|Optgroup|TimezoneOption|VirtualOption)\\w*\\b|\\bkbq-(?:option|optgroup)\\b';

export const MEMBERS_BY_TYPE: Readonly<Record<string, readonly string[]>> = {
    KbqOptgroup: ['disabled'],
    KbqOptionActionComponent: ['disabled']
};

export const EXPORT_AS_TO_TYPE: Readonly<Record<string, string>> = {
    kbqOptgroup: 'KbqOptgroup',
    kbqOptionAction: 'KbqOptionActionComponent'
};

export const ELEMENT_TO_TYPE: Readonly<Record<string, string>> = {
    'kbq-optgroup': 'KbqOptgroup',
    'kbq-option-action': 'KbqOptionActionComponent'
};

/** None: both are read-only `input()`s. */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set();

export const warnPatterns: readonly WarnPattern[] = [
    {
        anchor: OPTION_ANCHOR,
        pattern: '\\.\\s*(?:value|viewValue|disabled|showCheckbox|timezone)\\s*=[^=]',
        message:
            'KbqOption.value, .viewValue, .disabled and .showCheckbox, and KbqTimezoneOption.timezone, are signal ' +
            'inputs read through a getter now, so a programmatic write no longer compiles. Bind them in the ' +
            'template instead. This pattern also matches a write to an unrelated object in a file that names an ' +
            'option — check before changing it.'
    },
    {
        anchor: OPTION_ANCHOR,
        pattern: '\\.\\s*stateChanges\\b',
        message:
            'KbqOption.stateChanges no longer emits when the option is disabled: disabled is signal-backed, so read ' +
            'it in a template, computed() or effect() instead.'
    },
    {
        anchor: OPTION_ANCHOR,
        pattern: '\\.\\s*textElement\\b',
        message: 'KbqOption.textElement is a getter over a signal query now, typed ElementRef | undefined.'
    },
    {
        anchor: OPTION_ANCHOR,
        pattern: '\\bKbqOptionBase\\b',
        message:
            'KbqOptionBase.value is an abstract getter now, and KbqOptionBase no longer declares a disabled setter. ' +
            'A subclass implements value as a getter or a property.'
    }
];

export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders an option group or an option action but could not be parsed, so it was left ' +
    'untouched. Migrate reads of disabled through its template reference variables by hand.';

export const UNRESOLVED_RECEIVER_MESSAGE =
    'An option group or an option action is used here in a way this migration cannot resolve to a single ' +
    'receiver, so a read of disabled through it was left untouched. Check these lines by hand:';

export const SUMMARY: readonly string[] = [
    '  KbqOptgroup.disabled and KbqOptionActionComponent.disabled are signal inputs: a read is a call.',
    '  The state of KbqOption is still read as a property — option.value, option.disabled — so events, models ' +
        'and kbqSelectTagContent templates are unchanged. Only programmatic writes are gone: bind [value], ' +
        '[disabled], [viewValue] and [showCheckbox] instead.'
];

export const config: SignalMembersConfig = {
    label: '[option-signals]',
    package: '@koobiq/components/core',
    membersByType: MEMBERS_BY_TYPE,
    exportAsToType: EXPORT_AS_TO_TYPE,
    elementToType: ELEMENT_TO_TYPE,
    writableMembers: WRITABLE_MEMBERS,
    warnPatterns,
    messages: {
        unparseableTemplate: UNPARSEABLE_TEMPLATE_MESSAGE,
        unresolvedReceiver: UNRESOLVED_RECEIVER_MESSAGE,
        summary: SUMMARY
    }
};
