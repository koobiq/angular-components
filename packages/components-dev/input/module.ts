import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Inject,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    KbqLocaleServiceModule,
    KbqNormalizeWhitespace
} from '@koobiq/components/core';
import {
    KbqFormField,
    KbqFormFieldModule,
    KbqPasswordHint,
    PasswordRules,
    hasPasswordStrengthError
} from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import {
    InputChangePasswordExample,
    InputNumberOverviewExample,
    InputOverviewExample,
    InputPasswordOverviewExample,
    InputWithMaskExample
} from 'packages/docs-examples/components/input';
import { startWith } from 'rxjs';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        InputOverviewExample,
        InputNumberOverviewExample,
        InputPasswordOverviewExample,
        InputChangePasswordExample,
        InputWithMaskExample
    ],
    template: `
        <input-with-mask-example />
        <hr />
        <input-overview-example />
        <hr />
        <input-number-overview-example />
        <hr />
        <input-password-overview-example />
        <hr />
        <input-change-password-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqLocaleServiceModule,
        KbqFormFieldModule,
        KbqButtonModule,
        KbqInputModule,
        KbqToolTipModule,
        KbqIconModule,
        DevDocsExamples,
        KbqNormalizeWhitespace,
        DevThemeToggle
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp implements AfterViewInit {
    passwordRules = PasswordRules;
    password = '456';

    control = new FormControl('');

    value: string = '';
    numberValue: number | null = null;
    min = -5;
    customRegex = /\D/;

    locales: string[];

    @ViewChildren(KbqPasswordHint) passwordHints: QueryList<KbqPasswordHint>;
    @ViewChild('formField') formField: KbqFormField;

    constructor(@Inject(KBQ_LOCALE_SERVICE) public localeService: KbqLocaleService) {
        this.locales = Object.keys(this.localeService.locales).filter((key) => key !== 'items');
    }

    ngAfterViewInit() {
        this.formField.control.stateChanges.pipe(startWith()).subscribe((state: any) => {
            if (!state?.focused && hasPasswordStrengthError(this.passwordHints)) {
                this.formField.control.ngControl?.control?.setErrors({ passwordStrength: true });
            }
        });
    }

    atLeastNCapitalLetters = (n: number): ((value: string) => boolean) => {
        return (value: string) => {
            const found = value.match(/[A-Z]/g);

            return !!found && found!.length >= n;
        };
    };
}
