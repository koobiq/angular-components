import type { AreaData } from '../data';

/** A named import of `symbol` from the form field entry point, so an app's own symbol of that name is left alone. */
const importedFromFormField = (symbol: string): string =>
    `import\\s*(?:type\\s*)?\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s*from\\s*['"]@koobiq/components/form-field['"]`;

/** A member access on a receiver named like a form field: `formField.x`, `this.formField().x`, `myFormField?.x`. */
const onFormField = (member: string): string => `\\b\\w*[fF]ormField\\b(?:\\(\\))?[?!]?\\.${member}\\b`;

const FORM_FIELD_OWNER = '\\bKbqFormField\\b|\\bkbqFormField\\b';

/**
 * Removed in 21.0.0: the `KbqPasswordHint` rules engine (`PasswordRules`, `regExpPasswordValidator`,
 * `hasPasswordStrengthError`), what only served it on `KbqFormField` and `KbqInputPassword`, and the unused
 * `KbqFormField.canCleanerClearByEsc` and `onKeyDown`. None has a 1:1 replacement, so all are reported.
 */
export const formField: AreaData = {
    tsReplacements: [],
    templateReplacements: [],
    warnPatterns: [
        {
            pattern: importedFromFormField('KbqPasswordHint'),
            message:
                '`KbqPasswordHint` was removed: use `KbqReactivePasswordHint`. Put the rules on the form control as ' +
                'validators (`PasswordValidators` from `@koobiq/components/core`) and bind the hint to their ' +
                'errors: `<kbq-reactive-password-hint [hasError]="control.hasError(\'minLength\')">`.'
        },
        {
            pattern: '\\bkbq-password-hint(?:__icon)?\\b',
            message:
                '`<kbq-password-hint>` was removed: replace it with `<kbq-reactive-password-hint [hasError]="…">`, ' +
                'bound to the error of the matching validator of the control (`PasswordValidators` from ' +
                '`@koobiq/components/core`). `[rule]`, `[min]`, `[max]`, `[regex]`, `[checkRule]` and ' +
                '`[viewFormField]` have no counterpart, and the new hint has to be inside the `kbq-form-field`. ' +
                'Selectors on `kbq-password-hint` / `.kbq-password-hint` target `.kbq-reactive-password-hint` now.'
        },
        {
            pattern: importedFromFormField('PasswordRules'),
            message:
                '`PasswordRules` was removed: express each rule as a validator of the form control — ' +
                '`PasswordValidators.minLength`, `maxLength`, `minUppercase`, `minLowercase`, `minNumber` or ' +
                '`minSpecial` from `@koobiq/components/core`, or a `ValidatorFn` of your own — and show it with ' +
                '`<kbq-reactive-password-hint [hasError]="…">`.'
        },
        {
            pattern: importedFromFormField('regExpPasswordValidator'),
            message:
                '`regExpPasswordValidator` was removed: write the pattern you need into a validator of the form ' +
                'control (`Validators.pattern` or a `ValidatorFn` of your own), or use `PasswordValidators` from ' +
                '`@koobiq/components/core`.'
        },
        {
            pattern: importedFromFormField('hasPasswordStrengthError'),
            message:
                '`hasPasswordStrengthError` was removed: the password rules are validators of the form control ' +
                "now, so check the control itself (`control.invalid`, `control.hasError('minLength')`)."
        },
        {
            anchor: '@koobiq/components/(?:form-field|input)|\\bkbqInputPassword\\b',
            pattern: `['"]passwordStrength['"]|\\berrors[?!]?\\.passwordStrength\\b`,
            message:
                'The form field no longer sets the `passwordStrength` error on the control: it came from the removed ' +
                '`KbqPasswordHint`. Check the errors of the password validators of the control instead.'
        },
        {
            anchor: FORM_FIELD_OWNER,
            pattern: `\\.hasPasswordHint\\b|${onFormField('passwordHints')}`,
            message:
                '`KbqFormField.passwordHints` and `hasPasswordHint` were removed together with `KbqPasswordHint`. ' +
                'Query the hints you render (`viewChildren(KbqReactivePasswordHint)`) or read the errors of the control.'
        },
        {
            pattern: '\\bcanCleanerClearByEsc\\b',
            message:
                '`KbqFormField.canCleanerClearByEsc` was removed: it was unused and had no effect. Delete this ' +
                'read or assignment.'
        },
        {
            anchor: FORM_FIELD_OWNER,
            pattern: `${onFormField('onKeyDown')}\\s*\\(`,
            message:
                '`KbqFormField.onKeyDown()` was removed: it did nothing. Delete the call; listen to `(keydown)` on ' +
                'the control if you need the event.'
        },
        {
            anchor: '\\bKbqInputPassword\\b|\\bkbqInputPassword\\b',
            pattern: '\\.checkRules\\s*\\(|\\.checkRule\\.(?:next|subscribe|pipe|complete)\\b',
            message:
                '`KbqInputPassword.checkRules()` and `checkRule` were removed together with `KbqPasswordHint`, ' +
                'their only listener. `KbqReactivePasswordHint` follows the validators of the control: after ' +
                'changing a rule, call `control.updateValueAndValidity()`.'
        }
    ]
};
