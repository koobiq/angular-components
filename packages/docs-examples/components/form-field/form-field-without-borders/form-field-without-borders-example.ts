import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Form field without borders */
@Component({
    selector: 'form-field-without-borders-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field noBorders>
            <input kbqInput [placeholder]="t().formFieldWithoutBorders" [formControl]="formControl" />
            <kbq-error>{{ t().shouldEnterValue }}</kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithoutBordersExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly formControl = new FormControl('', [Validators.required]);
}
