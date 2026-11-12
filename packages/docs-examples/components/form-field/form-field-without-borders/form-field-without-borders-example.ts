import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/** @title Form field without borders */
@Component({
    selector: 'form-field-without-borders-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field noBorders>
            <input kbqInput [placeholder]="text().formFieldWithoutBorders" [formControl]="formControl" />
            <kbq-error>{{ text().shouldEnterValue }}</kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithoutBordersExample extends BaseLocalizedExample<ExampleText> {
    readonly formControl = new FormControl('', [Validators.required]);

    constructor() {
        super(TEXT);
    }
}
