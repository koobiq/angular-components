import {
    AfterContentInit,
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    inject,
    Injector,
    input,
    model,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_FORM_FIELD_REF, KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { EMPTY, Observable, Subject } from 'rxjs';
import { KbqFormField } from './form-field';
import { KbqHint } from './hint';

let nextPasswordHintUniqueId = 0;

/**
 * @deprecated Use `KbqReactivePasswordHint` instead. Will be removed in the next major release.
 */
export enum PasswordRules {
    Length,
    UpperLatin,
    LowerLatin,
    Digit,
    LatinAndSpecialSymbols,
    Custom
}

/**
 * Regular expressions checked by `KbqPasswordHint` for the rules that are expressed as a pattern.
 *
 * @deprecated Use `KbqReactivePasswordHint` with `PasswordValidators` instead. Will be removed in the next
 * major release.
 */
export const regExpPasswordValidator: Partial<Record<PasswordRules, RegExp>> = {
    [PasswordRules.LowerLatin]: RegExp(/^(?=.*?[a-z])/),
    [PasswordRules.UpperLatin]: RegExp(/^(?=.*?[A-Z])/),
    [PasswordRules.Digit]: RegExp(/^(?=.*?[0-9])/),
    [PasswordRules.LatinAndSpecialSymbols]: RegExp(/[^ !`"'#№$%&()*+,-./\\:;<=>?@[\]^_{|}~A-Za-z0-9]/)
};

/**
 * Whether any of the password hints reports an error.
 *
 * @deprecated Use `KbqReactivePasswordHint` instead. Will be removed in the next major release.
 */
export const hasPasswordStrengthError = (
    passwordHints: QueryList<KbqPasswordHint> | readonly KbqPasswordHint[]
): boolean => {
    return passwordHints.some((hint: KbqPasswordHint) => hint.hasError);
};

/**
 * Password hint driven by the `PasswordRules` engine.
 *
 * @deprecated Use `KbqReactivePasswordHint` instead: it derives its state from the form control validators
 * rather than from the control's internal streams. Will be removed in the next major release.
 */
@Component({
    selector: 'kbq-password-hint',
    imports: [KbqIconModule],
    template: `
        <i class="kbq-password-hint__icon" [kbq-icon]="icon" [color]="iconColor"></i>

        <span class="kbq-hint__text">
            <ng-content />
        </span>
    `,
    styleUrls: ['hint.scss', 'hint-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.id]': 'id()',
        class: 'kbq-hint kbq-password-hint',
        '[class.kbq-success]': 'checked',
        '[class.kbq-error]': 'hasError',
        '[class.kbq-hint_fill-text-off]': 'fillTextOff()',
        '[class.kbq-hint_compact]': 'compact()'
    },
    exportAs: 'kbqPasswordHint'
})
export class KbqPasswordHint extends KbqHint implements AfterContentInit {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);
    // @TODO fix types (#DS-2915)
    private formField = inject<KbqFormField>(KBQ_FORM_FIELD_REF, { optional: true })!;

    /** Unique ID for the hint. Referenced by the `aria-describedby` of the form field control. */
    override readonly id = input<string>(`kbq-password-hint-${nextPasswordHintUniqueId++}`);

    /** Rule the hint checks the password against. */
    readonly rule = input<PasswordRules>();

    /** Minimal password length, required by `PasswordRules.Length`. */
    readonly min = input<number>();
    /** Maximal password length, required by `PasswordRules.Length`. */
    readonly max = input<number>();

    /** Pattern the password is checked against, required by `PasswordRules.Custom` when `checkRule` is not set. */
    readonly regex = model<RegExp | null>(null);

    /** Custom predicate the password is checked against, an alternative to `regex` for `PasswordRules.Custom`. */
    readonly customCheckRule = input<(value: string) => boolean>(undefined!, { alias: 'checkRule' });

    /** Form field the hint belongs to, when it can not be injected (e.g. the hint is rendered outside of it). */
    readonly viewFormField = input<KbqFormField>();

    /** Disables `color` for the hint text. */
    override readonly fillTextOff = input(true, { transform: booleanAttribute });

    /** Whether the password fails the rule. */
    hasError: boolean = false;
    /** Whether the password satisfies the rule. */
    checked: boolean = false;

    /**
     * Icon reflecting the current state of the rule.
     *
     * @docs-private
     */
    protected get icon(): string {
        return this.checked ? 'kbq-check-s_16' : 'kbq-xmark-s_16';
    }

    /**
     * The form field hint icon color.
     *
     * @docs-private
     */
    protected get iconColor(): KbqComponentColors {
        if (this.control?.ngControl?.untouched && this.control?.ngControl?.pristine) {
            return KbqComponentColors.ContrastFade;
        }

        return this.checked ? KbqComponentColors.Success : KbqComponentColors.Error;
    }

    private checkRule: (value: string) => boolean;

    private get control() {
        return this.formField.control();
    }

    private lastControlValue: string | null = null;

    constructor() {
        super();
        this.color = KbqComponentColors.ContrastFade;
        this.setDefaultColor(KbqComponentColors.ContrastFade);
    }

    ngAfterContentInit(): void {
        this.formField = this.formField || this.viewFormField();

        const rule = this.rule();
        const customCheckRule = this.customCheckRule();

        if (rule === PasswordRules.Custom && this.regex() == null && customCheckRule === undefined) {
            throw Error('You should set [regex] or [checkRule] for PasswordRules.Custom');
        }

        if (rule === PasswordRules.Length && this.min() == null && this.max() == null) {
            throw Error('For [rule] "Length" need set [min] and [max]');
        }

        if (rule === PasswordRules.Length) {
            this.checkRule = this.checkLengthRule;
        } else if (
            rule !== undefined &&
            [PasswordRules.UpperLatin, PasswordRules.LowerLatin, PasswordRules.Digit].includes(rule)
        ) {
            this.regex.set(regExpPasswordValidator[rule]!);
            this.checkRule = this.checkRegexRule;
        } else if (rule === PasswordRules.LatinAndSpecialSymbols) {
            this.regex.set(regExpPasswordValidator[rule]!);
            this.checkRule = this.checkSpecialSymbolsRegexRule;
        } else if (rule === PasswordRules.Custom) {
            this.checkRule = this.regex() == null ? customCheckRule : this.checkRegexRule;
        } else {
            throw Error(`Unknown [rule]=${rule}`);
        }

        // The control is not resolvable until the form field content is initialized, and neither stream must be
        // subscribed on the server.
        afterNextRender(
            () => {
                const control = this.formField.control();

                control.stateChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.checkValue);

                ((control as unknown as { checkRule?: Subject<unknown> }).checkRule || (EMPTY as Observable<unknown>))
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe(() => {
                        this.checked = this.checkRule(this.control.value);
                        this.hasError = !this.checked;
                        this.changeDetectorRef.markForCheck();
                    });
            },
            { injector: this.injector }
        );
    }

    private checkValue = () => {
        if (this.control.focused && this.isValueChanged()) {
            this.hasError = false;

            this.checked = this.checkRule(this.control.value);
        } else if (!this.control.focused && !this.isValueChanged()) {
            this.hasError = !this.checkRule(this.control.value);
        }

        if (!this.control.required && !this.control.value) {
            this.checked = this.hasError = false;
        }

        this.lastControlValue = this.control.value;
        this.changeDetectorRef.markForCheck();
    };

    private checkLengthRule = (value: string): boolean => {
        return value.length >= (this.min() ?? 0) && value.length <= (this.max() ?? Infinity);
    };

    private checkRegexRule = (value: string): boolean => {
        return !!this.regex()?.test(value);
    };

    private checkSpecialSymbolsRegexRule = (value: string): boolean => {
        return !!value && !this.regex()?.test(value);
    };

    private isValueChanged(): boolean {
        return this.lastControlValue !== this.formField.control().value;
    }
}
