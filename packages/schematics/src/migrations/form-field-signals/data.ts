/**
 * Data for the `form-field-signals` migration.
 *
 * The full review of `@koobiq/components/form-field` finished the migration of `KbqFormField` and `KbqHint`
 * to a signal-based public API, removed the deprecated `mixinColor` from `core`, and gave the icon-only
 * cleaner and password toggle real button semantics.
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
    /** Element selectors whose template reference variables (`#ref`) point at this target. */
    elements: readonly string[];
    /** Members whose value is unchanged; a read must become a call. Auto-fixed. */
    signalMembers: readonly string[];
    /** Subset of `signalMembers` that is writable, so `x.m = v` becomes `x.m.set(v)`. Auto-fixed. */
    writableMembers: ReadonlySet<string>;
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
    elements: ['kbq-form-field'],
    signalMembers: [
        'cleaner',
        'passwordToggle',
        'hint',
        'passwordHints',
        'prefix',
        'suffix',
        'hasCleaner',
        'hasHint',
        'hasPasswordHint',
        'hasPasswordToggle',
        'hasPrefix',
        'hasStepper',
        'hasSuffix'
    ],
    writableMembers: new Set<string>()
};

/** `fillTextOff` and `compact` became signal inputs on the whole hint family. */
export const HINT_TARGET: Target = {
    id: 'KbqHint',
    types: ['KbqHint', 'KbqError', 'KbqPasswordHint', 'KbqReactivePasswordHint'],
    elements: ['kbq-hint', 'kbq-error', 'kbq-password-hint', 'kbq-reactive-password-hint'],
    signalMembers: ['fillTextOff', 'compact'],
    writableMembers: new Set<string>()
};

/** `KbqPasswordHint.regex` became a `model()`, so it is both readable as a call and writable via `.set()`. */
export const PASSWORD_HINT_TARGET: Target = {
    id: 'KbqPasswordHint',
    types: ['KbqPasswordHint'],
    elements: ['kbq-password-hint'],
    signalMembers: ['regex'],
    writableMembers: new Set<string>(['regex'])
};

export const TARGETS: readonly Target[] = [FORM_FIELD_TARGET, HINT_TARGET, PASSWORD_HINT_TARGET];

/**
 * `KbqFormField` members that were a `QueryList` and are now a `readonly` array. The call syntax is
 * auto-fixed, but the `QueryList` API is gone.
 */
export const QUERY_LIST_MEMBERS: readonly string[] = ['hint', 'passwordHints', 'prefix', 'suffix'];

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

/** Members that moved from `public` to `protected` and can no longer be read from outside the component. */
export const PROTECTED_MEMBERS: readonly string[] = ['icon'];

/** Inputs that were writable properties and are now read-only signal inputs. */
export const READ_ONLY_INPUT_MEMBERS: readonly string[] = ['fillTextOff', 'compact'];

/**
 * `KbqFormField` content queries that were writable properties and are now read-only signals. `cleaner` was
 * writable only because of an internal workaround; the rest were a `QueryList`, which consumers reassigned to
 * fake the projected content in tests.
 */
export const READ_ONLY_QUERY_MEMBERS: readonly string[] = [
    'cleaner',
    'passwordToggle',
    'hint',
    'passwordHints',
    'prefix',
    'suffix'
];

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
        message: '`CanColorCtor` was removed together with `mixinColor`. The `CanColor` interface is still exported.'
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
        pattern: '\\bregExpPasswordValidator\\b',
        message:
            '`regExpPasswordValidator` is deprecated and is now typed `Partial<Record<PasswordRules, RegExp>>`, ' +
            'so indexing it yields `RegExp | undefined`. It never had entries for `Length`/`Custom`.'
    },
    {
        pattern: '\\bKbqPasswordHint\\b|\\bPasswordRules\\b|\\bhasPasswordStrengthError\\b',
        message:
            'The `KbqPasswordHint` rules engine (`PasswordRules`, `regExpPasswordValidator`, ' +
            '`hasPasswordStrengthError`) is deprecated and will be removed in the next major release. Migrate to ' +
            '`KbqReactivePasswordHint`, which derives its state from the form control validators.'
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
