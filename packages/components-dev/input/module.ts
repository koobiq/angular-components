import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    inject,
    model,
    viewChild,
    viewChildren,
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
import { hasPasswordStrengthError, KbqFormField, KbqPasswordHint, PasswordRules } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToggleComponent } from '@koobiq/components/toggle';
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
        KbqButtonModule,
        KbqInputModule,
        KbqToolTipModule,
        KbqIconModule,
        DevDocsExamples,
        KbqNormalizeWhitespace,
        DevThemeToggle,
        KbqToggleComponent
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'layout-column layout-align-center-center'
    }
})
export class DevApp implements AfterViewInit {
    localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE);

    passwordRules = PasswordRules;
    password = '456';

    control = new FormControl('');

    value: string = '';
    numberValue: number | null = null;
    min = -5;
    customRegex = /\D/;

    disabled = model(false);

    locales: string[];

    readonly passwordHints = viewChildren(KbqPasswordHint);
    readonly formField = viewChild.required<KbqFormField>('formField');

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {
        this.locales = Object.keys(this.localeService.locales).filter((key) => key !== 'items');
    }

    ngAfterViewInit() {
        this.formField()
            .control()
            .stateChanges.pipe(startWith())
            .subscribe((state: any) => {
                if (!state?.focused && hasPasswordStrengthError(this.passwordHints())) {
                    this.formField().control().ngControl?.control?.setErrors({ passwordStrength: true });
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
