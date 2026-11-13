import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Form field with kbq-error */
@Component({
    selector: 'form-field-with-error-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().email }}</kbq-label>
            <input kbqInput placeholder="mail@koobiq.io" [formControl]="formControl" />
            <kbq-hint>{{ t().enterEmail }}</kbq-hint>
            <kbq-error>
                @if (formControl.hasError('required')) {
                    {{ t().shouldEnterValue }}
                } @else {
                    {{ t().invalidEmail }}
                }
            </kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithErrorExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly formControl = new FormControl('', [Validators.required, Validators.email]);
}
