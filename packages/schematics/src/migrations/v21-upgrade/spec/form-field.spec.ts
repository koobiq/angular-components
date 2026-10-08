import { runV21Upgrade } from '../testing';

const PASSWORD_HINT = '`KbqPasswordHint` was removed';
const PASSWORD_HINT_ELEMENT = '`<kbq-password-hint>` was removed';
const PASSWORD_RULES = '`PasswordRules` was removed';
const REG_EXP_VALIDATOR = '`regExpPasswordValidator` was removed';
const HAS_STRENGTH_ERROR = '`hasPasswordStrengthError` was removed';
const STRENGTH_ERROR_KEY = 'no longer sets the `passwordStrength` error';
const PASSWORD_HINTS_QUERY = '`KbqFormField.passwordHints` and `hasPasswordHint` were removed';
const CLEAR_BY_ESC = '`KbqFormField.canCleanerClearByEsc` was removed';
const ON_KEY_DOWN = '`KbqFormField.onKeyDown()` was removed';
const CHECK_RULES = '`KbqInputPassword.checkRules()` and `checkRule` were removed';

const ALL = [
    PASSWORD_HINT,
    PASSWORD_HINT_ELEMENT,
    PASSWORD_RULES,
    REG_EXP_VALIDATOR,
    HAS_STRENGTH_ERROR,
    STRENGTH_ERROR_KEY,
    PASSWORD_HINTS_QUERY,
    CLEAR_BY_ESC,
    ON_KEY_DOWN,
    CHECK_RULES
];

describe('v21-upgrade: form-field', () => {
    it('reports the KbqPasswordHint engine without touching the code', async () => {
        const source = [
            'import {',
            '    hasPasswordStrengthError,',
            '    KbqPasswordHint,',
            '    PasswordRules,',
            '    regExpPasswordValidator',
            "} from '@koobiq/components/form-field';",
            'export class App {',
            '    readonly rules = PasswordRules;',
            '    readonly hints = viewChildren(KbqPasswordHint);',
            '    readonly digit = regExpPasswordValidator[PasswordRules.Digit];',
            '    get weak() { return hasPasswordStrengthError(this.hints()); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'engine.ts': source });

        expect(run.read('engine.ts')).toBe(source);
        expect(run.log).toContain(PASSWORD_HINT);
        expect(run.log).toContain(PASSWORD_RULES);
        expect(run.log).toContain(REG_EXP_VALIDATOR);
        expect(run.log).toContain(HAS_STRENGTH_ERROR);
    });

    it('reports <kbq-password-hint> in a template and its classes in a style sheet', async () => {
        const template = [
            '<kbq-form-field>',
            '    <input kbqInputPassword [(ngModel)]="password" />',
            '    <kbq-password-hint [rule]="rules.Length" [min]="8" [max]="15">8-15</kbq-password-hint>',
            '</kbq-form-field>',
            ''
        ].join('\n');
        const styles = '.kbq-password-hint__icon { margin: 0; }\n';
        const run = await runV21Upgrade({ 'hint.html': template, 'hint.scss': styles });

        expect(run.read('hint.html')).toBe(template);
        expect(run.read('hint.scss')).toBe(styles);
        expect(run.log).toContain(`hint.html\n  ${PASSWORD_HINT_ELEMENT}`);
        expect(run.log).toContain(`hint.scss\n  ${PASSWORD_HINT_ELEMENT}`);
    });

    it('reports a check of the passwordStrength error', async () => {
        const source = [
            "import { KbqInputModule } from '@koobiq/components/input';",
            'export class App {',
            "    get weak() { return this.control.hasError('passwordStrength'); }",
            '    get weakToo() { return !!this.control.errors?.passwordStrength; }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'strength.ts': source });

        expect(run.read('strength.ts')).toBe(source);
        expect(run.log).toContain(STRENGTH_ERROR_KEY);
    });

    it('reports the removed KbqFormField members', async () => {
        const source = [
            "import { KbqFormField } from '@koobiq/components/form-field';",
            'export class App {',
            '    readonly formField = viewChild.required(KbqFormField);',
            '    ngAfterViewInit() {',
            '        this.formField().canCleanerClearByEsc = false;',
            '        console.log(this.formField().hasPasswordHint(), this.formField().passwordHints());',
            '    }',
            '    onKeyDown(event: KeyboardEvent) { this.formField().onKeyDown(event); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'members.ts': source });

        expect(run.read('members.ts')).toBe(source);
        expect(run.log).toContain(CLEAR_BY_ESC);
        expect(run.log).toContain(PASSWORD_HINTS_QUERY);
        expect(run.log).toContain(ON_KEY_DOWN);
    });

    it('reports KbqInputPassword.checkRules()', async () => {
        const source = [
            "import { KbqInputPassword } from '@koobiq/components/input';",
            'export class App {',
            '    readonly input = viewChild.required(KbqInputPassword);',
            '    setMin() { this.input().checkRules(); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'check.ts': source });

        expect(run.read('check.ts')).toBe(source);
        expect(run.log).toContain(CHECK_RULES);
    });

    it('leaves the reactive hint, look-alikes and other owners alone', async () => {
        const source = [
            "import { PasswordValidators } from '@koobiq/components/core';",
            "import { KbqFormField, KbqReactivePasswordHint } from '@koobiq/components/form-field';",
            "import { KbqInput } from '@koobiq/components/input';",
            "import { KbqListSelection } from '@koobiq/components/list';",
            "import { PasswordRules, hasPasswordStrengthError } from './password-rules';",
            '@Component({',
            '    imports: [KbqFormField, KbqReactivePasswordHint, KbqInput],',
            '    template: `',
            '        <kbq-form-field>',
            '            <input kbqInput [formControl]="control" />',
            '            <kbq-reactive-password-hint [hasError]="control.hasError(\'minLength\')">',
            '                8+',
            '            </kbq-reactive-password-hint>',
            '        </kbq-form-field>',
            '    `,',
            '    styles: `.kbq-reactive-password-hint { gap: 4px; }`',
            '})',
            'export class App {',
            "    readonly control = new FormControl('', PasswordValidators.minLength(8));",
            '    readonly list = viewChild.required(KbqListSelection);',
            '    readonly passwordHints = viewChildren(KbqReactivePasswordHint);',
            '    readonly rules = PasswordRules;',
            '    passwordStrength = 0;',
            '    onKeyDown(event: KeyboardEvent) { this.list().onKeyDown(event); }',
            '    check() { this.validator.checkRules(); return hasPasswordStrengthError(this.passwordStrength); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'unrelated.ts': source });

        expect(run.read('unrelated.ts')).toBe(source);

        for (const message of ALL) {
            expect(run.log).not.toContain(message);
        }
    });
});
