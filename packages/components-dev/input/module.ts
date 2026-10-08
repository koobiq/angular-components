import { ChangeDetectionStrategy, Component, inject, model, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    KbqLocaleServiceModule,
    KbqNormalizeWhitespace,
    PasswordValidators
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToggleComponent } from '@koobiq/components/toggle';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import {
    InputNumberOverviewExample,
    InputOverviewExample,
    InputPasswordOverviewExample,
    InputWithMaskExample
} from 'packages/docs-examples/components/input';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        InputOverviewExample,
        InputNumberOverviewExample,
        InputPasswordOverviewExample,
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
export class DevApp {
    localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE);

    password = '456';

    control = new FormControl('');

    readonly passwordControl = new FormControl('', [
        Validators.required,
        PasswordValidators.minLength(8),
        PasswordValidators.maxLength(15),
        PasswordValidators.minUppercase(1),
        PasswordValidators.minLowercase(1),
        PasswordValidators.minNumber(1),
        PasswordValidators.minSpecial(1)
    ]);

    value: string = '';
    numberValue: number | null = null;
    min = -5;

    disabled = model(false);

    locales: string[];

    constructor() {
        this.locales = Object.keys(this.localeService.locales).filter((key) => key !== 'items');
    }

    setControlsDisabled(disabled: boolean): void {
        for (const control of [this.control, this.passwordControl]) {
            if (disabled) {
                control.disable();
            } else {
                control.enable();
            }
        }
    }
}
