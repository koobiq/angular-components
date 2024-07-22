import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Inject,
    Input,
    Optional,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { Subject } from 'rxjs';
import { KbqFormField } from './form-field';
import { KbqHint } from './hint';

let nextPasswordHintUniqueId = 0;

export enum PasswordRules {
    Length,
    UpperLatin,
    LowerLatin,
    Digit,
    LatinAndSpecialSymbols,
    Custom
}

export const regExpPasswordValidator = {
    [PasswordRules.LowerLatin]: RegExp(/^(?=.*?[a-z])/),
    [PasswordRules.UpperLatin]: RegExp(/^(?=.*?[A-Z])/),
    [PasswordRules.Digit]: RegExp(/^(?=.*?[0-9])/),
    [PasswordRules.LatinAndSpecialSymbols]: RegExp(/[^ !`"'#№$%&()*+,-./\\:;<=>?@[\]^_{|}~A-Za-z0-9]/)
};

export const hasPasswordStrengthError = (passwordHints: QueryList<KbqPasswordHint>): boolean => {
    return passwordHints.some((hint) => hint.hasError);
};

@Component({
    selector: 'kbq-password-hint',
    template: `
        <i
            class="kbq-password-hint__icon"
            [ngClass]="icon"
            kbq-icon=""
        ></i>

        <span class="kbq-hint__text">
            <ng-content></ng-content>
        </span>
    `,
    styleUrls: ['hint.scss'],
    host: {
        '[attr.id]': 'id',
        class: 'kbq-hint kbq-password-hint',
        '[class.kbq-success]': 'checked',
        '[class.kbq-error]': 'hasError',
        '[class.kbq-hint_fill-text-off]': 'fillTextOff',
        '[class.kbq-hint_compact]': 'compact'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPasswordHint extends KbqHint implements AfterContentInit {
    @Input() id: string = `kbq-hint-${nextPasswordHintUniqueId++}`;

    @Input() rule: PasswordRules | any;

    @Input() min: number;
    @Input() max: number;
    @Input() regex: RegExp | null;
    @Input('checkRule') customCheckRule: (value: string) => boolean;

    @Input() viewFormField?: KbqFormField;

    @Input() fillTextOff: boolean = true;

    hasError: boolean = false;
    checked: boolean = false;

    get icon(): string {
        return this.checked ? 'mc-check_16' : 'mc-close-M_16';
    }

    private checkRule: (value: string) => boolean;

    private get control() {
        return this.formField.control;
    }

    private lastControlValue: string;

    constructor(
        elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(forwardRef(() => KBQ_FORM_FIELD_REF)) private formField: any
    ) {
        super(elementRef);
    }

    ngAfterContentInit(): void {
        this.formField = this.formField || this.viewFormField;

        if (this.rule === PasswordRules.Custom && this.regex === undefined && this.customCheckRule === undefined) {
            throw Error('You should set [regex] or [checkRule] for PasswordRules.Custom');
        }

        if (this.rule === PasswordRules.Length && (this.min || this.max) === null) {
            throw Error('For [rule] "Length" need set [min] and [max]');
        }

        if (this.rule === PasswordRules.Length) {
            this.checkRule = this.checkLengthRule;
        } else if ([PasswordRules.UpperLatin, PasswordRules.LowerLatin, PasswordRules.Digit].includes(this.rule)) {
            this.regex = regExpPasswordValidator[this.rule];
            this.checkRule = this.checkRegexRule;
        } else if (this.rule === PasswordRules.LatinAndSpecialSymbols) {
            this.regex = regExpPasswordValidator[this.rule];
            this.checkRule = this.checkSpecialSymbolsRegexRule;
        } else if (this.rule === PasswordRules.Custom) {
            this.checkRule = this.regex === undefined ? this.customCheckRule : this.checkRegexRule;
        } else {
            throw Error(`Unknown [rule]=${this.rule}`);
        }

        this.formField.control.stateChanges.subscribe(this.checkValue);

        (this.formField.control as unknown as { checkRule: Subject<any> }).checkRule.subscribe(() => {
            this.checked = this.checkRule(this.control.value);
            this.hasError = !this.checkRule(this.control.value);
        });
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

    private checkLengthRule(value: string): boolean {
        return value.length >= this.min && value.length <= this.max;
    }

    private checkRegexRule = (value: string): boolean => {
        return !!this.regex?.test(value);
    };

    private checkSpecialSymbolsRegexRule(value: string): boolean {
        return !!value && !this.regex?.test(value);
    }

    private isValueChanged(): boolean {
        return this.lastControlValue !== this.formField.control.value;
    }
}
