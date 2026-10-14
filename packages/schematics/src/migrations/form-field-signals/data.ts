/**
 * Data for the `form-field-signals` migration.
 *
 * The full review of `@koobiq/components/form-field` finished the migration of `KbqFormField` and `KbqHint`
 * to a signal-based public API, removed the deprecated `mixinColor` from `core`, and gave the icon-only
 * cleaner and password toggle real button semantics. `KbqFormFieldControl` followed: the state of every control
 * is a signal, and `stateChanges` is gone.
 *
 * Value-preserving property → signal reads are auto-fixed; everything whose value or type semantics changed
 * is surfaced as a warning.
 */

/** A group of receiver types that share the same set of migrated members. */
export interface Target {
    /** Short id used in log messages. */
    id: string;
    /** TypeScript type annotations that mark a receiver as this target. */
    types: readonly string[];
    /**
     * Element selector → the component's `exportAs`. A `#ref` on the element points at this target when it is
     * bare or names that `exportAs`; `#ref="ngModel"` names another directive and is left alone.
     */
    elements: Readonly<Record<string, string>>;
    /**
     * `exportAs` names of a directive, which a `#ref` names on whatever element the directive sits. A bare `#ref`
     * there is the element itself.
     */
    exportAs?: readonly string[];
    /** Members whose value is unchanged; a read must become a call. Auto-fixed. */
    signalMembers: readonly string[];
    /** Subset of `signalMembers` that is writable, so `x.m = v` becomes `x.m.set(v)`. Auto-fixed. */
    writableMembers: ReadonlySet<string>;
    /** Members that were removed, reported with `REMOVED_MEMBERS_MESSAGE`. Never rewritten. */
    removedMembers?: readonly string[];
}

/**
 * `KbqFormField` content queries and their derived `has*` getters became signals.
 *
 * `control`, `stepper` and `connectionContainerRef` were already signals before this release and are
 * deliberately absent — appending `()` to them would produce a double call.
 */
export const FORM_FIELD_TARGET: Target = {
    id: 'KbqFormField',
    types: ['KbqFormField'],
    elements: { 'kbq-form-field': 'kbqFormField' },
    signalMembers: [
        'cleaner',
        'passwordToggle',
        'hint',
        'prefix',
        'suffix',
        'hasCleaner',
        'hasHint',
        'hasPasswordToggle',
        'hasPrefix',
        'hasStepper',
        'hasSuffix'
    ],
    writableMembers: new Set<string>(),
    removedMembers: ['hovered', 'onHoverChanged']
};

/** Reported where a `KbqFormField` receiver or a reference variable reaches one of its `removedMembers`. */
export const REMOVED_MEMBERS_MESSAGE =
    '`KbqFormField.hovered` and `onHoverChanged()` were removed — nothing read them, and their pointer listeners ' +
    'ran change detection on every hover. Bind `(mouseenter)` / `(mouseleave)` on `<kbq-form-field>` yourself, ' +
    'or style with `:hover`.';

/** `fillTextOff` and `compact` became signal inputs on the whole hint family. */
export const HINT_TARGET: Target = {
    id: 'KbqHint',
    types: ['KbqHint', 'KbqError', 'KbqReactivePasswordHint'],
    elements: {
        'kbq-hint': 'kbqHint',
        'kbq-error': 'kbqError',
        'kbq-reactive-password-hint': 'kbqReactivePasswordHint'
    },
    signalMembers: ['fillTextOff', 'compact'],
    writableMembers: new Set<string>()
};

/** The `KbqFormFieldControl` state: a signal on every control, read-only unless a target says otherwise. */
const CONTROL_MEMBERS: readonly string[] = [
    'value',
    'id',
    'placeholder',
    'focused',
    'empty',
    'required',
    'disabled',
    'errorState'
];

/** Controls whose `disabled` and `value` both stay writable through `.set()`: the selects and the tag list. */
export const WRITABLE_VALUE_CONTROL_TARGET: Target = {
    id: 'KbqSelect',
    types: ['KbqSelect', 'KbqTimezoneSelect', 'KbqTagList'],
    elements: {
        'kbq-select': 'kbqSelect',
        'kbq-timezone-select': 'kbqTimezoneSelect',
        'kbq-tag-list': 'kbqTagList'
    },
    signalMembers: CONTROL_MEMBERS,
    writableMembers: new Set<string>(['disabled', 'value'])
};

/** Controls that own their `value`: only `disabled`, which the form control also sets, stays writable. */
export const READ_ONLY_VALUE_CONTROL_TARGET: Target = {
    id: 'KbqTreeSelect',
    types: ['KbqTreeSelect', 'KbqTimepicker', 'KbqDatepickerInput'],
    elements: { 'kbq-tree-select': 'kbqTreeSelect' },
    exportAs: ['kbqTimepicker', 'kbqDatepickerInput'],
    signalMembers: CONTROL_MEMBERS,
    writableMembers: new Set<string>(['disabled'])
};

/** Native-element controls: `value` and `placeholder` stay writable, `disabled` follows the input and the form control. */
export const INPUT_CONTROL_TARGET: Target = {
    id: 'KbqInput',
    types: ['KbqInput', 'KbqTextarea'],
    elements: {},
    exportAs: ['kbqInput', 'kbqTextarea'],
    signalMembers: CONTROL_MEMBERS,
    writableMembers: new Set<string>(['value', 'placeholder'])
};

/** The password input: a native-element control whose `elementType` became a read-only signal too. */
export const INPUT_PASSWORD_TARGET: Target = {
    id: 'KbqInputPassword',
    types: ['KbqInputPassword'],
    elements: {},
    exportAs: ['kbqInputPassword'],
    signalMembers: [...CONTROL_MEMBERS, 'elementType'],
    writableMembers: INPUT_CONTROL_TARGET.writableMembers
};

/** A receiver typed with the contract itself, which declares every member a read-only signal. */
export const FORM_FIELD_CONTROL_TARGET: Target = {
    id: 'KbqFormFieldControl',
    types: ['KbqFormFieldControl'],
    elements: {},
    signalMembers: CONTROL_MEMBERS,
    writableMembers: new Set<string>()
};

/** `KbqTagInput`, the text control of a tag list: its state is a read-only signal, as the tag list reads it. */
export const TAG_INPUT_TARGET: Target = {
    id: 'KbqTagInput',
    types: ['KbqTagInput'],
    elements: {},
    exportAs: ['kbqTagInput', 'kbqTagInputFor'],
    signalMembers: ['id', 'placeholder', 'focused', 'empty'],
    writableMembers: new Set<string>()
};

export const TARGETS: readonly Target[] = [
    FORM_FIELD_TARGET,
    HINT_TARGET,
    WRITABLE_VALUE_CONTROL_TARGET,
    READ_ONLY_VALUE_CONTROL_TARGET,
    INPUT_CONTROL_TARGET,
    INPUT_PASSWORD_TARGET,
    FORM_FIELD_CONTROL_TARGET,
    TAG_INPUT_TARGET
];

/**
 * `KbqFormField` members that were a `QueryList` and are now a `readonly` array. The call syntax is
 * auto-fixed, but the `QueryList` API is gone.
 */
export const QUERY_LIST_MEMBERS: readonly string[] = ['hint', 'prefix', 'suffix'];

/** `QueryList` members that a plain array does not have. Detected right after a migrated query member. */
export const QUERY_LIST_ONLY_API: readonly string[] = [
    'changes',
    'first',
    'last',
    'dirty',
    'toArray',
    'get',
    'reset',
    'notifyOnChanges',
    'destroy'
];

/** `KbqFormField` members whose empty value changed from `null` to `undefined`. */
export const NULLABILITY_CHANGED_MEMBERS: readonly string[] = ['cleaner', 'passwordToggle'];

/**
 * Members that were writable properties and are now read-only signals: inputs, or state the control derives.
 * Scoped by each target's `writableMembers`, so a member writable on one control is not reported on it.
 */
export const READ_ONLY_INPUT_MEMBERS: readonly string[] = ['fillTextOff', 'compact', ...CONTROL_MEMBERS];

/**
 * `KbqFormField` content queries that were writable properties and are now read-only signals. `cleaner` was
 * writable only because of an internal workaround; the rest were a `QueryList`, which consumers reassigned to
 * fake the projected content in tests.
 */
export const READ_ONLY_QUERY_MEMBERS: readonly string[] = [
    'cleaner',
    'passwordToggle',
    'hint',
    'prefix',
    'suffix'
];

/** Members that were writable fields and are now read-only signals only the control itself changes. */
export const READ_ONLY_STATE_MEMBERS: readonly string[] = ['elementType'];

/** Reported where a write reaches one of `READ_ONLY_STATE_MEMBERS`. */
export const READ_ONLY_STATE_MESSAGE =
    "`KbqInputPassword.elementType` can no longer be assigned: it is a read-only `Signal<'text' | 'password'>` " +
    'now. Call `toggleType()` to show or hide the password instead.';

export interface WarnPattern {
    pattern: string;
    message: string;
}

/**
 * File-scoped patterns that can't be auto-fixed reliably — surfaced with file locations (in both `fix` and
 * dry-run mode).
 */
export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\bmixinColor\\s*\\(',
        message:
            '`mixinColor` was removed. Extend `KbqColorDirective` from @koobiq/components/core instead — it ' +
            'exposes the same `color` input and `colorClassName` getter.'
    },
    {
        pattern: '\\bCanColorCtor\\b',
        message:
            '`CanColorCtor` was removed together with `mixinColor`, and so was the `CanColor` interface: type the ' +
            'member `Signal<KbqComponentColors | string>`, or use `KbqColorDirective`.'
    },
    {
        pattern: 'implements[^{]*\\bKbqFormFieldControl\\b',
        message:
            '`KbqFormFieldControl` is signal-based: `value`, `id`, `placeholder`, `focused`, `empty`, `required`, ' +
            '`disabled` and `errorState` are `Signal`s, and `stateChanges` was removed. A custom control exposes ' +
            'its state as signals and drops `stateChanges`: the form field derives its own state from them.'
    },
    {
        pattern: 'control\\(\\)\\??\\.stateChanges\\b',
        message:
            'The form field control no longer has `stateChanges`. Read its state signals in a `computed()` or an ' +
            '`effect()` instead, or turn one into a stream with `toObservable()`.'
    },
    {
        pattern: '\\bKbqErrorStateTracker\\b',
        message:
            '`KbqErrorStateTracker` no longer takes a `stateChanges` subject, and its `errorState` is a ' +
            '`Signal<boolean>`: call `updateErrorState()` from `ngDoCheck` and read `errorState()`.'
    },
    {
        pattern: '\\bmixinErrorState\\s*\\(|\\bCanUpdateErrorStateCtor\\b',
        message:
            'The deprecated `mixinErrorState` and `CanUpdateErrorStateCtor` were removed. Track the error state ' +
            'with `KbqErrorStateTracker` from @koobiq/components/core instead.'
    },
    {
        pattern: '\\bCanUpdateErrorState\\b',
        message:
            '`CanUpdateErrorState.errorState` is a `Signal<boolean>`, and the interface no longer declares ' +
            '`errorStateMatcher`.'
    },
    {
        pattern: '\\bKbqIconErrorStateContext\\b|\\bkbqIconErrorStateContextFactoryProvider\\b',
        message:
            '`KbqIconErrorStateContext.errorState` is a `Signal<boolean>` and `stateChanges` was removed: ' +
            '`KbqIcon` follows the signal.'
    },
    {
        pattern: '\\bKBQ_FORM_FIELD_REF\\b',
        message:
            '`KbqFormFieldRef.control` is no longer `any`: it is `Signal<KbqFormFieldControlRef>`. Reads written ' +
            'as `formField.control.<member>` were silently `undefined` and now fail to compile — call the signal ' +
            'first: `formField.control().<member>`.'
    },
    {
        pattern: '\\bKbqA11yLocaleConfiguration\\b|\\bkbqA11yLocaleConfigurationProvider\\s*\\(',
        message:
            '`KbqA11yLocaleConfiguration` gained three required keys — `clear`, `showPassword` and ' +
            '`hidePassword` — for the accessible names of the form-field cleaner and password toggle. A custom ' +
            'locale object literal has to provide them.'
    },
    {
        pattern: '\\bKbqTrim\\b',
        message:
            '`KbqTrim.trim` is now typed `(value: unknown) => unknown` instead of `any`. Assigning its result to ' +
            'a typed variable needs a narrowing check or a cast.'
    },
    {
        pattern: '<kbq-error[^>]*\\b(?:role|aria-live|aria-atomic)=',
        message:
            '`kbq-error` now renders `role="alert"` and `aria-atomic="true"` itself, so the form field announces ' +
            'validation errors. Drop the hand-rolled live-region attributes.'
    },
    {
        pattern: '<kbq-cleaner[^>]*\\brole=',
        message:
            '`kbq-cleaner` now renders `role="button"` and a localized `aria-label` itself. The explicit `role` ' +
            'attribute is redundant.'
    }
];

/** Attribute rewrite applied inside the opening tag of the given element. */
export interface AttributeRewrite {
    element: string;
    from: string;
    to: string;
    reason: string;
}

/**
 * `KbqCleaner` exposes `aria-label` as a real input backed by a host binding, so an `[attr.aria-label]`
 * written by the consumer is now overwritten by the component's localized default.
 */
export const attributeRewrites: readonly AttributeRewrite[] = [
    {
        element: 'kbq-cleaner',
        from: '[attr.aria-label]',
        to: '[aria-label]',
        reason: 'kbq-cleaner now owns the aria-label host binding'
    },
    {
        element: 'kbq-cleaner',
        from: 'attr.aria-label',
        to: 'aria-label',
        reason: 'kbq-cleaner now owns the aria-label host binding'
    }
];

/** Plain text replacements applied to stylesheets. */
export interface StyleRewrite {
    from: string;
    to: string;
}

/** The misspelled `_fiedset-theme.scss` was renamed to `_fieldset-theme.scss`. */
export const styleRewrites: readonly StyleRewrite[] = [{ from: 'fiedset-theme', to: 'fieldset-theme' }];
