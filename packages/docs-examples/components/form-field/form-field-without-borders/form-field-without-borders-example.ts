import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { injectExampleText } from './l10n';

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
export class FormFieldWithoutBordersExample {
    protected readonly text = injectExampleText();

    readonly formControl = new FormControl('', [Validators.required]);
}
